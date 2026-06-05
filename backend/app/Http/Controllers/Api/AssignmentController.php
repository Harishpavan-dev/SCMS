<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Student;
use App\Models\Notification;
use App\Models\User;
use App\Jobs\SendPushNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AssignmentController extends Controller
{
    /**
     * Get list of assignments.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'lecturer') {
            $lecturer = $user->lecturer;
            if (!$lecturer) {
                return response()->json(['success' => false, 'message' => 'Lecturer record not found.'], 404);
            }
            $assignments = Assignment::with(['subject'])
                ->where('lecturer_id', $lecturer->id)
                ->latest()
                ->get();

            return response()->json(['success' => true, 'data' => $assignments]);
        }

        if (in_array($user->role, ['student', 'rep'])) {
            $student = $user->student;
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student record not found.'], 404);
            }

            // Get assignments where subject semester matches student's current semester
            $assignments = Assignment::with(['subject', 'lecturer.user', 'submissions' => function ($query) use ($student) {
                $query->where('student_id', $student->id);
            }])
            ->whereHas('subject', function ($query) use ($student) {
                $query->where('semester_id', $student->current_semester_id);
            })
            ->latest()
            ->get();

            return response()->json(['success' => true, 'data' => $assignments]);
        }

        return response()->json(['success' => false, 'message' => 'Access Denied.'], 403);
    }

    /**
     * Get a specific assignment with details.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'lecturer') {
            $lecturer = $user->lecturer;
            if (!$lecturer) {
                return response()->json(['success' => false, 'message' => 'Lecturer record not found.'], 404);
            }

            $assignment = Assignment::with(['subject'])
                ->where('lecturer_id', $lecturer->id)
                ->findOrFail($id);

            // Fetch active students taking this subject's semester
            $students = Student::with('user')
                ->where('current_semester_id', $assignment->subject->semester_id)
                ->where('status', 'active')
                ->get();

            $submissions = AssignmentSubmission::where('assignment_id', $assignment->id)->get()->keyBy('student_id');

            $studentSubmissions = $students->map(function ($student) use ($submissions) {
                return [
                    'student' => [
                        'id' => $student->id,
                        'name' => $student->user->name,
                        'registration_number' => $student->registration_number,
                        'avatar' => $student->user->avatar,
                    ],
                    'submission' => $submissions->get($student->id) ?? null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'assignment' => $assignment,
                    'submissions' => $studentSubmissions,
                ]
            ]);
        }

        if (in_array($user->role, ['student', 'rep'])) {
            $student = $user->student;
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student record not found.'], 404);
            }

            $assignment = Assignment::with(['subject', 'lecturer.user'])
                ->whereHas('subject', function ($query) use ($student) {
                    $query->where('semester_id', $student->current_semester_id);
                })
                ->findOrFail($id);

            $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->where('student_id', $student->id)
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'assignment' => $assignment,
                    'submission' => $submission,
                ]
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Access Denied.'], 403);
    }

    /**
     * Create/request a new assignment.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $lecturer = $user->lecturer;

        if (!$lecturer) {
            return response()->json(['success' => false, 'message' => 'Lecturer record not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'subject_id' => 'required|exists:subjects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'required|date|after:now',
            'file' => 'nullable|file|max:20480', // Max 20MB
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Verify that the lecturer is assigned to this subject
        $isAssigned = $lecturer->subjects()->where('subjects.id', $request->subject_id)->exists();
        if (!$isAssigned) {
            return response()->json(['success' => false, 'message' => 'You are not assigned to this subject.'], 403);
        }

        $filePath = null;
        $originalName = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filePath = $file->store('assignments', 'public');
            $originalName = $file->getClientOriginalName();
        }

        $assignment = Assignment::create([
            'subject_id' => $request->subject_id,
            'lecturer_id' => $lecturer->id,
            'title' => $request->title,
            'description' => $request->description,
            'file_path' => $filePath,
            'original_name' => $originalName,
            'deadline' => $request->deadline,
        ]);

        // Trigger Notifications for all active students in the subject's semester
        $students = Student::where('current_semester_id', $assignment->subject->semester_id)
            ->where('status', 'active')
            ->get();

        foreach ($students as $student) {
            $studentUser = $student->user;
            if ($studentUser) {
                // Create database notification
                Notification::create([
                    'user_id' => $studentUser->id,
                    'type' => 'info',
                    'title' => 'New Assignment Posted',
                    'message' => "An assignment '{$assignment->title}' has been requested for '{$assignment->subject->name}'. Deadline: " . $assignment->deadline->format('Y-m-d H:i'),
                    'data' => ['assignment_id' => $assignment->id, 'type' => 'assignment'],
                    'is_read' => false,
                ]);

                // Dispatch push notification
                try {
                    SendPushNotification::dispatch(
                        $studentUser->id,
                        'New Assignment Posted',
                        "An assignment '{$assignment->title}' has been requested for '{$assignment->subject->name}'."
                    );
                } catch (\Exception $e) {
                    Log::error("Failed to send push notification to student ID {$student->id}: " . $e->getMessage());
                }
            }
        }

        return response()->json(['success' => true, 'data' => $assignment], 201);
    }

    /**
     * Submit work for an assignment.
     */
    public function submit(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Student record not found.'], 404);
        }

        $assignment = Assignment::findOrFail($id);

        // Check if deadline has passed
        if (now()->greaterThan($assignment->deadline)) {
            return response()->json(['success' => false, 'message' => 'The deadline for this assignment has passed.'], 400);
        }

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:20480', // Max 20MB
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $file = $request->file('file');
        $filePath = $file->store('submissions', 'public');
        $originalName = $file->getClientOriginalName();

        // Check if there is already an existing submission
        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $student->id)
            ->first();

        if ($submission) {
            // Delete old file if it exists
            if ($submission->getRawOriginal('file_path')) {
                Storage::disk('public')->delete($submission->getRawOriginal('file_path'));
            }

            $submission->update([
                'file_path' => $filePath,
                'original_name' => $originalName,
                'submitted_at' => now(),
            ]);
        } else {
            $submission = AssignmentSubmission::create([
                'assignment_id' => $assignment->id,
                'student_id' => $student->id,
                'file_path' => $filePath,
                'original_name' => $originalName,
                'submitted_at' => now(),
            ]);
        }

        return response()->json(['success' => true, 'data' => $submission]);
    }

    /**
     * Grade a student's submission.
     */
    public function grade(Request $request, int $submissionId): JsonResponse
    {
        $user = $request->user();
        $lecturer = $user->lecturer;

        if (!$lecturer) {
            return response()->json(['success' => false, 'message' => 'Lecturer record not found.'], 404);
        }

        $submission = AssignmentSubmission::with('assignment.subject')->findOrFail($submissionId);

        // Verify that this lecturer owns the assignment
        if ($submission->assignment->lecturer_id !== $lecturer->id) {
            return response()->json(['success' => false, 'message' => 'You do not have permission to grade this assignment.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'grade' => 'required|string|max:10',
            'feedback' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $submission->update([
            'grade' => $request->grade,
            'feedback' => $request->feedback,
        ]);

        // Notify student
        $studentUser = $submission->student->user;
        if ($studentUser) {
            Notification::create([
                'user_id' => $studentUser->id,
                'type' => 'success',
                'title' => 'Assignment Graded',
                'message' => "Your submission for '{$submission->assignment->title}' in '{$submission->assignment->subject->name}' has been graded. Grade: {$submission->grade}",
                'data' => ['assignment_id' => $submission->assignment->id, 'type' => 'assignment_grade'],
                'is_read' => false,
            ]);

            try {
                SendPushNotification::dispatch(
                    $studentUser->id,
                    'Assignment Graded',
                    "Your submission for '{$submission->assignment->title}' has been graded. Grade: {$submission->grade}"
                );
            } catch (\Exception $e) {
                Log::error("Failed to send push notification to student ID {$submission->student_id}: " . $e->getMessage());
            }
        }

        return response()->json(['success' => true, 'data' => $submission]);
    }

    /**
     * Get subjects assigned to lecturer.
     */
    public function getLecturerSubjects(Request $request): JsonResponse
    {
        $lecturer = $request->user()->lecturer;
        if (!$lecturer) {
            return response()->json(['success' => false, 'message' => 'Lecturer record not found.'], 404);
        }

        $subjects = $lecturer->subjects;

        return response()->json(['success' => true, 'data' => $subjects]);
    }
}
