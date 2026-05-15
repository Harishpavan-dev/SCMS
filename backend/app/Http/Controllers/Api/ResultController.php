<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Result, Student, Subject};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ResultController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Result::with(['student.user', 'subject', 'semester']);

        if ($request->has('semester_id')) $query->where('semester_id', $request->semester_id);
        if ($request->has('subject_id')) $query->where('subject_id', $request->subject_id);
        if ($request->has('student_id')) $query->where('student_id', $request->student_id);

        $user = $request->user();
        if (in_array($user->role, ['student', 'rep'])) {
            $query->where('student_id', $user->student->id)->where('is_published', true);
        }

        $results = $query->latest()->paginate(20);

        return response()->json(['success' => true, 'data' => $results]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'semester_id' => 'required|exists:semesters,id',
            'continuous_assessment' => 'nullable|numeric|min:0|max:100',
            'final_exam' => 'nullable|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $ca = $request->get('continuous_assessment', 0);
        $fe = $request->get('final_exam', 0);
        $total = ($ca * 0.4) + ($fe * 0.6); // 40% CA, 60% final
        $gradeInfo = Result::calculateGrade($total);

        $result = Result::updateOrCreate(
            [
                'student_id' => $request->student_id,
                'subject_id' => $request->subject_id,
                'semester_id' => $request->semester_id,
            ],
            [
                'continuous_assessment' => $ca,
                'final_exam' => $fe,
                'total_marks' => round($total, 2),
                'grade' => $gradeInfo['grade'],
                'grade_point' => $gradeInfo['point'],
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Result saved.',
            'data' => $result->load(['student.user', 'subject']),
        ], 201);
    }

    public function bulkStore(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'results' => 'required|array|min:1',
            'results.*.student_id' => 'required|exists:students,id',
            'results.*.subject_id' => 'required|exists:subjects,id',
            'results.*.semester_id' => 'required|exists:semesters,id',
            'results.*.continuous_assessment' => 'nullable|numeric|min:0|max:100',
            'results.*.final_exam' => 'nullable|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $saved = 0;
        foreach ($request->results as $resultData) {
            $ca = $resultData['continuous_assessment'] ?? 0;
            $fe = $resultData['final_exam'] ?? 0;
            $total = ($ca * 0.4) + ($fe * 0.6);
            $gradeInfo = Result::calculateGrade($total);

            Result::updateOrCreate(
                [
                    'student_id' => $resultData['student_id'],
                    'subject_id' => $resultData['subject_id'],
                    'semester_id' => $resultData['semester_id'],
                ],
                [
                    'continuous_assessment' => $ca,
                    'final_exam' => $fe,
                    'total_marks' => round($total, 2),
                    'grade' => $gradeInfo['grade'],
                    'grade_point' => $gradeInfo['point'],
                ]
            );
            $saved++;
        }

        return response()->json([
            'success' => true,
            'message' => "{$saved} results saved.",
        ]);
    }

    public function publish(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'semester_id' => 'required|exists:semesters,id',
            'subject_id' => 'nullable|exists:subjects,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $query = Result::where('semester_id', $request->semester_id);
        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        $count = $query->update(['is_published' => true]);

        return response()->json([
            'success' => true,
            'message' => "{$count} results published.",
        ]);
    }

    public function studentGPA(int $studentId): JsonResponse
    {
        $student = Student::findOrFail($studentId);

        $results = Result::where('student_id', $studentId)
            ->where('is_published', true)
            ->with(['subject', 'semester'])
            ->get()
            ->groupBy('semester_id');

        $semesterGPAs = [];
        $allPoints = 0;
        $allCredits = 0;

        foreach ($results as $semId => $semResults) {
            $points = 0;
            $credits = 0;
            foreach ($semResults as $r) {
                $c = $r->subject->credit_hours ?? 3;
                $points += ($r->grade_point ?? 0) * $c;
                $credits += $c;
            }
            $semGPA = $credits > 0 ? round($points / $credits, 2) : 0;
            $semesterGPAs[] = [
                'semester_id' => $semId,
                'semester' => $semResults->first()->semester,
                'gpa' => $semGPA,
                'subjects' => $semResults->count(),
            ];
            $allPoints += $points;
            $allCredits += $credits;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'student' => $student->load('user'),
                'semester_gpas' => $semesterGPAs,
                'cumulative_gpa' => $allCredits > 0 ? round($allPoints / $allCredits, 2) : null,
            ],
        ]);
    }
}
