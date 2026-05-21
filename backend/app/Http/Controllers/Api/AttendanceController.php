<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{AttendanceSession, AttendanceRecord, ClassSession, Student, Subject};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AttendanceController extends Controller
{
    public function initializeSession(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'semester_id' => 'required|exists:semesters,id',
            'batch_id' => 'required|exists:batches,id',
            'subject_id' => 'required|exists:subjects,id',
            'date' => 'required|date',
            'period' => 'required|integer',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // 1. Find or create ClassSession
        $classSession = ClassSession::firstOrCreate(
            [
                'semester_id' => $request->semester_id,
                'batch_id' => $request->batch_id,
                'subject_id' => $request->subject_id,
                'date' => $request->date,
                'period' => $request->period,
                'start_time' => $request->start_time,
            ],
            [
                'end_time' => $request->end_time,
                'lecturer_id' => $user->lecturer?->id ?? null, // Fallback if admin/rep creates
                'status' => 'ongoing',
            ]
        );

        // 2. Find or create AttendanceSession
        $session = AttendanceSession::where('class_session_id', $classSession->id)
            ->where('status', 'active')
            ->first();

        if (!$session) {
            $session = AttendanceSession::create([
                'class_session_id' => $classSession->id,
                'qr_code' => 'SCAN-' . Str::uuid()->toString(),
                'qr_expires_at' => now()->addHours(4), // Active for scanning window
                'created_by' => $user->id,
                'status' => 'active',
            ]);
        }

        $session->load('classSession.subject');

        return response()->json([
            'success' => true,
            'message' => 'Attendance session initialized.',
            'data' => $session,
        ]);
    }

    public function generateQR(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'class_session_id' => 'required|exists:class_sessions,id',
            'duration_minutes' => 'nullable|integer|min:1|max:30',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $classSession = ClassSession::findOrFail($request->class_session_id);
        $user = $request->user();

        // Verify lecturer owns this class or is admin
        if ($user->role === 'lecturer') {
            $lecturer = $user->lecturer;
            if (!$lecturer || $classSession->lecturer_id !== $lecturer->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only generate QR for your own classes.',
                ], 403);
            }
        }

        // Close any existing active sessions
        AttendanceSession::where('class_session_id', $classSession->id)
            ->where('status', 'active')
            ->update(['status' => 'expired']);

        $duration = $request->get('duration_minutes', 10);
        $qrCode = Str::uuid()->toString();

        $session = AttendanceSession::create([
            'class_session_id' => $classSession->id,
            'qr_code' => $qrCode,
            'qr_expires_at' => now()->addMinutes($duration),
            'created_by' => $user->id,
            'status' => 'active',
        ]);

        $session->load('classSession.subject');

        return response()->json([
            'success' => true,
            'message' => 'QR code generated successfully.',
            'data' => [
                'session' => $session,
                'qr_code' => $qrCode,
                'expires_at' => $session->qr_expires_at->toISOString(),
                'duration_minutes' => $duration,
            ],
        ]);
    }

    public function markAttendance(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'qr_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Find active attendance session
        $session = AttendanceSession::where('qr_code', $request->qr_code)
            ->where('status', 'active')
            ->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid QR code or session not found.',
            ], 404);
        }

        // Check if QR is expired
        if ($session->isExpired()) {
            $session->update(['status' => 'expired']);
            return response()->json([
                'success' => false,
                'message' => 'QR code has expired. Please request a new one.',
            ], 410);
        }

        // Get student
        $student = $user->student;
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student profile not found.',
            ], 404);
        }

        // Check for duplicate
        $existing = AttendanceRecord::where('attendance_session_id', $session->id)
            ->where('student_id', $student->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance already marked for this session.',
            ], 409);
        }

        // Verify student belongs to the class batch
        $classSession = $session->classSession;
        if ($student->batch_id !== $classSession->batch_id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not enrolled in this class.',
            ], 403);
        }

        // Mark attendance
        $record = AttendanceRecord::create([
            'attendance_session_id' => $session->id,
            'student_id' => $student->id,
            'marked_at' => now(),
            'marked_by' => $user->id,
            'method' => 'qr',
            'status' => 'present',
        ]);

        // Send Notification
        $this->notifyStudentAttendance($record);

        return response()->json([
            'success' => true,
            'message' => 'Attendance marked successfully.',
            'data' => $record,
        ]);
    }

    public function markByRep(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'class_session_id' => 'required|exists:class_sessions,id',
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:students,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $classSession = ClassSession::findOrFail($request->class_session_id);

        // Get or create attendance session
        $session = AttendanceSession::where('class_session_id', $classSession->id)
            ->latest()
            ->first();

        if (!$session) {
            $session = AttendanceSession::create([
                'class_session_id' => $classSession->id,
                'qr_code' => 'REP-' . Str::uuid()->toString(),
                'qr_expires_at' => now()->addHour(),
                'created_by' => $user->id,
                'status' => 'active',
            ]);
        }

        $marked = 0;
        $skipped = 0;

        foreach ($request->student_ids as $studentId) {
            $exists = AttendanceRecord::where('attendance_session_id', $session->id)
                ->where('student_id', $studentId)
                ->exists();

            if (!$exists) {
                $record = AttendanceRecord::create([
                    'attendance_session_id' => $session->id,
                    'student_id' => $studentId,
                    'marked_at' => now(),
                    'marked_by' => $user->id,
                    'method' => 'rep',
                    'status' => 'present',
                ]);
                $this->notifyStudentAttendance($record);
                $marked++;
            } else {
                $skipped++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Attendance marked for {$marked} students. {$skipped} already marked.",
            'data' => ['marked' => $marked, 'skipped' => $skipped],
        ]);
    }

    public function getSessionRecords(int $sessionId): JsonResponse
    {
        $session = AttendanceSession::with([
            'classSession.subject',
            'classSession.lecturer.user',
            'records.student.user',
            'creator',
        ])->findOrFail($sessionId);

        return response()->json([
            'success' => true,
            'data' => $session,
        ]);
    }

    public function getStudentAttendance(Request $request, int $studentId): JsonResponse
    {
        $student = Student::with('user')->findOrFail($studentId);
        $subjectId = $request->query('subject_id');

        $query = AttendanceRecord::with(['attendanceSession.classSession.subject'])
            ->where('student_id', $studentId);

        if ($subjectId) {
            $query->whereHas('attendanceSession.classSession', fn($q) => $q->where('subject_id', $subjectId));
        }

        $records = $query->latest('marked_at')->paginate(20);

        // Subject-wise percentage
        $subjects = Subject::where('semester_id', $student->current_semester_id)->get();
        
        $summary = [];
        $totalPresent = 0;
        $totalSessionsCounted = 0;

        foreach ($subjects as $subject) {
            $totalSubSessions = AttendanceSession::whereHas('classSession', function($q) use ($student, $subject) {
                $q->where('batch_id', $student->batch_id)
                  ->where('semester_id', $student->current_semester_id)
                  ->where('subject_id', $subject->id);
            })->count();

            if ($totalSubSessions === 0) continue;

            $subPresentCount = AttendanceRecord::where('student_id', $studentId)
                ->where('status', 'present')
                ->whereHas('attendanceSession.classSession', fn($q) => $q->where('subject_id', $subject->id))
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

        $query = AttendanceRecord::with(['student.user', 'attendanceSession.classSession.subject']);

        if ($request->has('subject_id')) {
            $query->whereHas('attendanceSession.classSession', fn($q) =>
                $q->where('subject_id', $request->subject_id));
        }

        if ($request->has('batch_id')) {
            $query->whereHas('attendanceSession.classSession', fn($q) =>
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

    public function markByScanner(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'attendance_session_id' => 'required|exists:attendance_sessions,id',
            'registration_number' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $session = AttendanceSession::with('classSession')->findOrFail($request->attendance_session_id);
        
        // Find student by registration number
        $student = Student::where('registration_number', $request->registration_number)->first();
        
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => "Student with registration number {$request->registration_number} not found.",
            ], 404);
        }

        // Scope check: Student must be in the same semester as the session
        // This handles the "unique attendance marking scope" requirement
        if ($student->current_semester_id !== $session->classSession->semester_id) {
            return response()->json([
                'success' => false,
                'message' => "Student is not enrolled in the current semester (Semester {$session->classSession->semester_id}).",
            ], 403);
        }

        // Check for duplicate
        $existing = AttendanceRecord::where('attendance_session_id', $session->id)
            ->where('student_id', $student->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => "Attendance already marked for {$student->user->name}.",
            ], 409);
        }

        // Mark attendance
        $record = AttendanceRecord::create([
            'attendance_session_id' => $session->id,
            'student_id' => $student->id,
            'marked_at' => now(),
            'marked_by' => $request->user()->id,
            'method' => 'qr', // Scanned by admin
            'status' => 'present',
        ]);

        $this->notifyStudentAttendance($record);

        return response()->json([
            'success' => true,
            'message' => "Attendance marked for {$student->user->name}.",
            'data' => [
                'record' => $record,
                'student_name' => $student->user->name,
                'reg_number' => $student->registration_number
            ],
        ]);
    }

    public function toggleStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'attendance_session_id' => 'required|exists:attendance_sessions,id',
            'student_id' => 'required|exists:students,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $record = AttendanceRecord::where('attendance_session_id', $request->attendance_session_id)
            ->where('student_id', $request->student_id)
            ->first();

        $status = 'present';
        
        if (!$record) {
            $record = AttendanceRecord::create([
                'attendance_session_id' => $request->attendance_session_id,
                'student_id' => $request->student_id,
                'marked_at' => now(),
                'marked_by' => $request->user()->id,
                'method' => 'rep',
                'status' => 'present',
            ]);
        } else {
            // Cycle: present -> absent -> unmarked -> (back to present)
            if ($record->status === 'present') {
                $status = 'absent';
            } elseif ($record->status === 'absent') {
                $status = 'unmarked';
            } else {
                $status = 'present';
            }
            
            $record->update(['status' => $status]);
        }

        // Send Push Notification
        if ($status !== 'unmarked') {
            $this->notifyStudentAttendance($record);
        }

        // WhatsApp Notification Trigger (Mock)
        if ($status !== 'unmarked') {
            $this->sendWhatsAppNotification($record);
        }

        return response()->json([
            'success' => true,
            'message' => "Attendance status updated to {$status}.",
            'data' => $record,
        ]);
    }

    public function updateStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'attendance_session_id' => 'required|exists:attendance_sessions,id',
            'student_id' => 'required|exists:students,id',
            'status' => 'required|in:present,absent,unmarked',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $record = AttendanceRecord::updateOrCreate(
            [
                'attendance_session_id' => $request->attendance_session_id,
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
        $session = $record->attendanceSession;
        $subject = $session->classSession->subject->name;
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
            $student = $record->student->load('user');
            $session = $record->attendanceSession->load('classSession.subject');
            $subjectName = $session->classSession->subject->name;
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
                ->whereHas('attendanceSession.classSession', function($q) use ($request) {
                    if ($request->has('subject_id')) {
                        $q->where('subject_id', $request->subject_id);
                    }
                });

            $totalSessions = AttendanceSession::whereHas('classSession', function($q) use ($student, $request) {
                $q->where('batch_id', $student->batch_id)
                  ->where('semester_id', $student->current_semester_id);
                if ($request->has('subject_id')) {
                    $q->where('subject_id', $request->subject_id);
                }
            })->count();

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

        $query = AttendanceSession::with(['classSession.subject', 'classSession.lecturer.user'])
            ->whereHas('classSession', function($q) use ($batchId, $semesterId, $request) {
                $q->where('batch_id', $batchId)
                  ->where('semester_id', $semesterId);
                
                if ($request->has('subject_id')) {
                    $q->where('subject_id', $request->subject_id);
                }

                if ($request->has('period')) {
                    $q->where('period', $request->period);
                }

                if ($request->has('date')) {
                    $q->whereDate('date', $request->date);
                }
            });

        $sessions = $query->latest()->limit(5)->get();

        return response()->json([
            'success' => true,
            'data' => $sessions,
        ]);
    }

    public function closeSession(int $sessionId): JsonResponse
    {
        $session = AttendanceSession::findOrFail($sessionId);
        $session->update(['status' => 'closed']);

        return response()->json([
            'success' => true,
            'message' => 'Attendance session closed.',
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
        $sessionCounts = AttendanceSession::whereHas('classSession', function($q) use ($batchId, $semesterId) {
                $q->where('batch_id', $batchId)->where('semester_id', $semesterId);
            })
            ->join('class_sessions', 'attendance_sessions.class_session_id', '=', 'class_sessions.id')
            ->selectRaw('class_sessions.subject_id, count(*) as total')
            ->groupBy('class_sessions.subject_id')
            ->pluck('total', 'subject_id');

        $attendanceCounts = AttendanceRecord::whereIn('student_id', $students->pluck('id'))
            ->where('attendance_records.status', 'present')
            ->whereHas('attendanceSession.classSession', function($q) use ($batchId, $semesterId) {
                $q->where('batch_id', $batchId)->where('semester_id', $semesterId);
            })
            ->join('attendance_sessions', 'attendance_records.attendance_session_id', '=', 'attendance_sessions.id')
            ->join('class_sessions', 'attendance_sessions.class_session_id', '=', 'class_sessions.id')
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
}
