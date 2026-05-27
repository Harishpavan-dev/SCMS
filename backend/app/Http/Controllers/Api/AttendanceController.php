<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{AttendanceRecord, ClassSession, Student, Subject};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AttendanceController extends Controller
{
    public function getSessionRecords(int $classSessionId): JsonResponse
    {
        $session = ClassSession::with([
            'subject',
            'lecturer.user',
            'records.student.user',
        ])->findOrFail($classSessionId);

        return response()->json([
            'success' => true,
            'data' => $session,
        ]);
    }

    public function getStudentAttendance(Request $request, int $studentId): JsonResponse
    {
        $student = Student::with('user')->findOrFail($studentId);
        $subjectId = $request->query('subject_id');

        $query = AttendanceRecord::with(['classSession.subject'])
            ->where('student_id', $studentId);

        if ($subjectId) {
            $query->whereHas('classSession', fn($q) => $q->where('subject_id', $subjectId));
        }

        $records = $query->latest('marked_at')->paginate(20);

        // Subject-wise percentage
        $subjects = Subject::where('semester_id', $student->current_semester_id)->get();
        
        $summary = [];
        $totalPresent = 0;
        $totalSessionsCounted = 0;

        foreach ($subjects as $subject) {
            $totalSubSessions = ClassSession::where('batch_id', $student->batch_id)
                  ->where('semester_id', $student->current_semester_id)
                  ->where('subject_id', $subject->id)
                  ->count();

            if ($totalSubSessions === 0) continue;

            $subPresentCount = AttendanceRecord::where('student_id', $studentId)
                ->where('status', 'present')
                ->whereHas('classSession', fn($q) => $q->where('subject_id', $subject->id))
                ->count();

            $subPercentage = round(($subPresentCount / $totalSubSessions) * 100, 2);

            $summary[] = [
                'subject_id' => $subject->id,
                'subject_name' => $subject->name,
                'present' => $subPresentCount,
                'total' => $totalSubSessions,
                'percentage' => $subPercentage
            ];

            $totalPresent += $subPresentCount;
            $totalSessionsCounted += $totalSubSessions;
        }

        $overallPercentage = $totalSessionsCounted > 0 ? round(($totalPresent / $totalSessionsCounted) * 100, 2) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'records' => $records,
                'summary' => $summary,
                'overall_percentage' => $overallPercentage,
                'total_present' => $totalPresent,
                'total_sessions' => $totalSessionsCounted,
                'total_absent' => $totalSessionsCounted - $totalPresent
            ],
        ]);
    }

    public function getReport(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'subject_id' => 'nullable|exists:subjects,id',
            'batch_id' => 'nullable|exists:batches,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $query = AttendanceRecord::with(['student.user', 'classSession.subject']);

        if ($request->has('subject_id')) {
            $query->whereHas('classSession', fn($q) =>
                $q->where('subject_id', $request->subject_id));
        }

        if ($request->has('batch_id')) {
            $query->whereHas('classSession', fn($q) =>
                $q->where('batch_id', $request->batch_id));
        }

        if ($request->has('from_date')) {
            $query->whereDate('marked_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('marked_at', '<=', $request->to_date);
        }

        $records = $query->latest('marked_at')->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $records,
        ]);
    }


    public function updateStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'class_session_id' => 'required|exists:class_sessions,id',
            'student_id' => 'required|exists:students,id',
            'status' => 'required|in:present,absent,unmarked',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $record = AttendanceRecord::updateOrCreate(
            [
                'class_session_id' => $request->class_session_id,
                'student_id' => $request->student_id,
            ],
            [
                'marked_at' => now(),
                'marked_by' => $request->user()->id,
                'method' => 'rep',
                'status' => $request->status,
            ]
        );

        if ($request->status !== 'unmarked') {
            $this->notifyStudentAttendance($record);
        }

        return response()->json([
            'success' => true,
            'message' => "Attendance status updated to {$request->status}.",
            'data' => $record,
        ]);
    }

    private function sendWhatsAppNotification(AttendanceRecord $record)
    {
        $student = $record->student;
        $user = $student->user;
        $session = $record->classSession;
        $subject = $session->subject->name;
        $status = strtoupper($record->status);
        
        $message = "Hello {$user->name}, your attendance for {$subject} has been marked as {$status}.";
        
        // Log for demonstration
        \Illuminate\Support\Facades\Log::info("WhatsApp Notification sent to {$user->phone}: {$message}");
        
    // In a real app, use Twilio or UltraMsg here:
        // Http::post('https://api.whatsapp.com/send', [...]);
    }

    protected function notifyStudentAttendance(AttendanceRecord $record)
    {
        try {
            // Ensure relationships are loaded
            $record->load(['student.user', 'classSession.subject']);
            
            $student = $record->student;
            $session = $record->classSession;

            if (!$student || !$session || !$session->subject) {
                return;
            }

            $subjectName = $session->subject->name;
            $status = strtoupper($record->status);

            $title = "Attendance Update: {$subjectName}";
            $body = "Hi {$student->user->name}, your attendance for {$subjectName} today has been marked as {$status}.";

            \App\Jobs\SendPushNotification::dispatch(
                $student->user_id,
                $title,
                $body,
                [
                    'type' => 'attendance_update',
                    'record_id' => $record->id,
                    'status' => $record->status,
                    'subject' => $subjectName
                ]
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to queue attendance notification: " . $e->getMessage());
        }
    }

    public function getHodAnalytics(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'batch_id' => 'nullable|exists:batches,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'subject_id' => 'nullable|exists:subjects,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $query = Student::with(['user', 'batch', 'currentSemester']);

        if ($request->has('batch_id')) $query->where('batch_id', $request->batch_id);
        if ($request->has('semester_id')) $query->where('current_semester_id', $request->semester_id);

        $students = $query->get()->map(function ($student) use ($request) {
            $recordsQuery = $student->attendanceRecords()
                ->whereHas('classSession', function($q) use ($request) {
                    if ($request->has('subject_id')) {
                        $q->where('subject_id', $request->subject_id);
                    }
                });

            $totalSessions = ClassSession::where('batch_id', $student->batch_id)
                  ->where('semester_id', $student->current_semester_id);
                if ($request->has('subject_id')) {
                    $totalSessions->where('subject_id', $request->subject_id);
                }
            $totalSessions = $totalSessions->count();

            $presentCount = (clone $recordsQuery)->where('status', 'present')->count();
            
            $percentage = $totalSessions > 0 ? round(($presentCount / $totalSessions) * 100, 2) : 0;

            return [
                'id' => $student->id,
                'name' => $student->user->name,
                'registration_number' => $student->registration_number,
                'present_count' => $presentCount,
                'total_sessions' => $totalSessions,
                'percentage' => $percentage,
            ];
        });

        // Numeric ordering by registration number (assuming format ATI/HNDIT/YYYY/XXX)
        $students = $students->sortBy(function($s) {
            preg_match('/(\d+)$/', $s['registration_number'], $matches);
            return (int)($matches[1] ?? 0);
        })->values();

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    public function getBatchSessions(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = $user->student;
        
        if (!$student && $user->role !== 'admin' && $user->role !== 'hod') {
             return response()->json(['success' => false, 'message' => 'Profile not found.'], 404);
        }

        $batchId = $student ? $student->batch_id : $request->batch_id;
        $semesterId = $student ? $student->current_semester_id : $request->semester_id;

        if (!$batchId || !$semesterId) {
             return response()->json(['success' => false, 'message' => 'Batch or Semester info missing.'], 422);
        }

        $query = ClassSession::with(['subject', 'lecturer.user'])
            ->where('batch_id', $batchId)
            ->where('semester_id', $semesterId);
        
        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->has('period')) {
            $query->where('period', $request->period);
        }

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        $sessions = $query->latest()->limit(5)->get();

        return response()->json([
            'success' => true,
            'data' => $sessions,
        ]);
    }

    public function closeSession(int $classSessionId): JsonResponse
    {
        $session = ClassSession::findOrFail($classSessionId);
        $session->update(['status' => 'closed']);

        return response()->json([
            'success' => true,
            'message' => 'Lecture session closed.',
        ]);
    }

    public function getRepAnalytics(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = $user->student;

        if (!$student && $user->role !== 'admin' && $user->role !== 'hod') {
             return response()->json(['success' => false, 'message' => 'Profile not found.'], 404);
        }

        $batchId = $student ? $student->batch_id : $request->batch_id;
        $semesterId = $student ? $student->current_semester_id : $request->semester_id;

        if (!$batchId || !$semesterId) {
             return response()->json(['success' => false, 'message' => 'Batch or Semester info missing.'], 422);
        }

        $students = Student::with('user')
            ->where('batch_id', $batchId)
            ->where('current_semester_id', $semesterId)
            ->get();

        $subjects = \App\Models\Subject::where('semester_id', $semesterId)->get();

        // Optimized Analytics: Fetch all counts in fewer queries
        $sessionCounts = ClassSession::where('batch_id', $batchId)
            ->where('semester_id', $semesterId)
            ->selectRaw('subject_id, count(*) as total')
            ->groupBy('subject_id')
            ->pluck('total', 'subject_id');

        $attendanceCounts = AttendanceRecord::whereIn('student_id', $students->pluck('id'))
            ->where('attendance_records.status', 'present')
            ->whereHas('classSession', function($q) use ($batchId, $semesterId) {
                $q->where('batch_id', $batchId)->where('semester_id', $semesterId);
            })
            ->join('class_sessions', 'attendance_records.class_session_id', '=', 'class_sessions.id')
            ->selectRaw('attendance_records.student_id, class_sessions.subject_id, count(*) as present_count')
            ->groupBy('attendance_records.student_id', 'class_sessions.subject_id')
            ->get()
            ->groupBy('student_id');

        $data = [];

        foreach ($students as $stu) {
            $studentData = [
                'id' => $stu->id,
                'name' => $stu->user->name,
                'registration_number' => $stu->registration_number,
                'subject_stats' => []
            ];

            $totalPresent = 0;
            $totalPossible = $sessionCounts->sum();
            $stuAttendance = $attendanceCounts->get($stu->id, collect());

            foreach ($subjects as $subject) {
                $totalSubSessions = $sessionCounts->get($subject->id, 0);
                $subPresentCount = $stuAttendance->where('subject_id', $subject->id)->first()?->present_count ?? 0;

                $percent = $totalSubSessions > 0 ? round(($subPresentCount / $totalSubSessions) * 100) : 0;
                
                $studentData['subject_stats'][] = [
                    'subject_id' => $subject->id,
                    'percentage' => $percent
                ];
                
                $totalPresent += $subPresentCount;
            }

            $studentData['overall_percentage'] = $totalPossible > 0 ? round(($totalPresent / $totalPossible) * 100) : 0;
            $data[] = $studentData;
        }

        // Numeric ordering by registration number
        $data = collect($data)->sortBy(function($s) {
            preg_match('/(\d+)$/', $s['registration_number'], $matches);
            return (int)($matches[1] ?? 0);
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'students' => $data,
                'subjects' => $subjects
            ]
        ]);
    }
    public function updateStatusDirect(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'subject_id' => 'required|exists:subjects,id',
            'batch_id' => 'required|exists:batches,id',
            'semester_id' => 'required|exists:semesters,id',
            'date' => 'required|date',
            'period' => 'required|integer',
            'student_id' => 'required_without:registration_number|nullable|exists:students,id',
            'registration_number' => 'required_without:student_id|nullable|exists:students,registration_number',
            'status' => 'required|in:present,absent,unmarked',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // 1. Resolve student ID if registration number is provided
        $studentId = $request->student_id;
        if (!$studentId && $request->registration_number) {
            $studentId = Student::where('registration_number', $request->registration_number)->value('id');
        }

        // Security Check: Reps can only mark for today
        if ($user->role === 'rep' && $request->date !== now()->toDateString()) {
            return response()->json([
                'success' => false,
                'message' => 'Representatives can only mark attendance for the current day.'
            ], 403);
        }

        // 2. Find or create ClassSession silently
        $session = ClassSession::firstOrCreate([
            'subject_id' => $request->subject_id,
            'batch_id' => $request->batch_id,
            'semester_id' => $request->semester_id,
            'date' => $request->date,
            'period' => $request->period,
        ], [
            'start_time' => '08:00', // Default
            'end_time' => '10:00',
            'status' => 'ongoing',
        ]);

        // 3. Mark the record
        $record = AttendanceRecord::updateOrCreate(
            [
                'class_session_id' => $session->id,
                'student_id' => $studentId,
            ],
            [
                'marked_at' => now(),
                'marked_by' => $user->id,
                'method' => 'direct-qr',
                'status' => $request->status,
            ]
        );

        if ($request->status !== 'unmarked') {
            $this->notifyStudentAttendance($record);
        }

        return response()->json([
            'success' => true,
            'message' => "Attendance updated directly.",
            'data' => [
                'record' => $record,
                'session_id' => $session->id
            ]
        ]);
    }

    public function getDirectRecords(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'subject_id' => 'required|exists:subjects,id',
            'batch_id' => 'required|exists:batches,id',
            'date' => 'required|date',
            'period' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Find session if exists
        $session = ClassSession::where('subject_id', $request->subject_id)
              ->where('batch_id', $request->batch_id)
              ->where('date', $request->date)
              ->where('period', $request->period)
              ->first();

        // Get all students in batch
        $students = Student::with('user')
            ->where('batch_id', $request->batch_id)
            ->get();

        $records = $session ? AttendanceRecord::where('class_session_id', $session->id)->get()->pluck('status', 'student_id') : collect();

        $data = $students->map(function($student) use ($records) {
            return [
                'student' => $student,
                'status' => $records[$student->id] ?? 'unmarked'
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'session' => $session,
                'records' => $data
            ]
        ]);
    }
}
