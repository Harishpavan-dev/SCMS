<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\ClassSession;
use App\Models\Lecturer;
use App\Models\Notification;
use App\Models\Result;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = match ($user->role) {
            'admin', 'hod' => $this->adminDashboard($user),
            'lecturer'     => $this->lecturerDashboard($user),
            'rep'          => $this->repDashboard($user),
            'student'      => $this->studentDashboard($user),
            default        => [],
        };

        return response()->json(['success' => true, 'data' => $data]);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // HELPER: Weekly Attendance (last 7 days)
    // ─────────────────────────────────────────────────────────────────────────────
    private function weeklyAttendance(?int $studentId = null, ?int $batchId = null): array
    {
        $result = [];

        for ($i = 6; $i >= 0; $i--) {
            $date  = Carbon::today()->subDays($i);
            $label = $date->format('D'); // Mon, Tue …

            if ($studentId) {
                $total   = AttendanceRecord::where('student_id', $studentId)
                               ->whereDate('marked_at', $date)->count();
                $present = AttendanceRecord::where('student_id', $studentId)
                               ->where('status', 'present')
                               ->whereDate('marked_at', $date)->count();

            } elseif ($batchId) {
                $total = AttendanceRecord::whereHas(
                    'attendanceSession.classSession',
                    fn ($q) => $q->where('batch_id', $batchId)->whereDate('date', $date)
                )->count();
                $present = AttendanceRecord::whereHas(
                    'attendanceSession.classSession',
                    fn ($q) => $q->where('batch_id', $batchId)->whereDate('date', $date)
                )->where('status', 'present')->count();

            } else {
                $total   = AttendanceRecord::whereDate('marked_at', $date)->count();
                $present = AttendanceRecord::whereDate('marked_at', $date)
                               ->where('status', 'present')->count();
            }

            $result[] = [
                'day'        => $label,
                'attendance' => $total > 0 ? (int) round(($present / $total) * 100) : 0,
            ];
        }

        return $result;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // HELPER: Recent Notifications
    // ─────────────────────────────────────────────────────────────────────────────
    private function recentNotifications(int $userId, int $limit = 5): array
    {
        return Notification::where('user_id', $userId)
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn ($n) => [
                'id'   => $n->id,
                'type' => $n->type ?? 'info',
                'text' => $n->title ?? $n->message ?? '',
                'time' => $n->created_at->diffForHumans(),
                'read' => (bool) $n->is_read,
            ])
            ->toArray();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ADMIN / HOD
    // ─────────────────────────────────────────────────────────────────────────────
    private function adminDashboard(User $user): array
    {
        $todayTotal   = AttendanceRecord::whereDate('marked_at', today())->count();
        $todayPresent = AttendanceRecord::whereDate('marked_at', today())
                            ->where('status', 'present')->count();
        $todayPct     = $todayTotal > 0 ? (int) round(($todayPresent / $todayTotal) * 100) : 0;

        $recentStudents = Student::with('user', 'batch')
            ->latest()->take(5)->get()
            ->map(fn ($s) => [
                'id'                  => $s->id,
                'registration_number' => $s->registration_number,
                'user'                => ['name' => $s->user?->name ?? 'Unknown'],
                'batch'               => ['name' => $s->batch?->name ?? '—'],
            ]);

        return [
            'total_students'              => Student::where('status', 'active')->count(),
            'total_lecturers'             => Lecturer::count(),
            'total_subjects'              => Subject::count(),
            'attendance_today'            => $todayTotal,
            'attendance_today_percentage' => $todayPct,
            'recent_students'             => $recentStudents,
            'weekly_attendance'           => $this->weeklyAttendance(),
            'notifications'               => $this->recentNotifications($user->id),
            'unread_notifications'        => Notification::where('user_id', $user->id)
                                                ->where('is_read', false)->count(),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // REPRESENTATIVE
    // ─────────────────────────────────────────────────────────────────────────────
    private function repDashboard(User $user): array
    {
        $student = $user->student;
        if (!$student) return $this->emptyRepData($user);

        $batchId           = $student->batch_id;
        $batchStudentCount = Student::where('batch_id', $batchId)
                                ->where('status', 'active')->count();

        // Today's sessions for this batch
        $todaySessions = AttendanceSession::whereHas(
            'classSession',
            fn ($q) => $q->where('batch_id', $batchId)->where('date', today())
        )->with('classSession.subject')->get();

        $todayStats = $todaySessions->map(function ($session) use ($batchStudentCount) {
            $presentCount = $session->records()->where('status', 'present')->count();
            return [
                'subject'    => $session->classSession->subject?->name ?? '—',
                'code'       => $session->classSession->subject?->code ?? '—',
                'subject_id' => $session->classSession->subject?->id,
                'present'    => $presentCount,
                'total'      => $batchStudentCount,
            ];
        });

        // Merge duplicate sessions for the same subject (group by subject_id)
        $mergedStats = $todayStats
            ->groupBy('subject_id')
            ->map(function ($group) use ($batchStudentCount) {
                $totalPresent = $group->sum('present');
                // Cap at batchStudentCount to avoid > 100%
                $cappedPresent = min($totalPresent, $batchStudentCount);
                return [
                    'subject'    => $group->first()['subject'],
                    'code'       => $group->first()['code'],
                    'present'    => $cappedPresent,
                    'total'      => $batchStudentCount,
                    'percentage' => $batchStudentCount > 0
                        ? round(($cappedPresent / $batchStudentCount) * 100, 1)
                        : 0,
                ];
            })
            ->values();


        $totalPossible = $mergedStats->count() * $batchStudentCount;
        $totalPresent  = (int) $mergedStats->sum('present');
        $avgTodayPct   = $totalPossible > 0
            ? (int) round(($totalPresent / $totalPossible) * 100) : 0;

        // Student base stats merged
        $baseStats = $this->studentDashboard($user);

        return array_merge($baseStats, [
            'total_students'              => $batchStudentCount,
            'today_subject_analytics'     => $mergedStats,
            'attendance_today_percentage' => $avgTodayPct,
            'attendance_today'            => $totalPresent,
            'weekly_attendance'           => $this->weeklyAttendance(null, $batchId),
            'notifications'               => $this->recentNotifications($user->id),
        ]);

    }

    private function emptyRepData(User $user): array
    {
        return [
            'total_students'              => 0,
            'attendance_today_percentage' => 0,
            'today_subject_analytics'     => [],
            'weekly_attendance'           => $this->weeklyAttendance(),
            'notifications'               => $this->recentNotifications($user->id),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // LECTURER
    // ─────────────────────────────────────────────────────────────────────────────
    private function lecturerDashboard(User $user): array
    {
        $lecturer = $user->lecturer;
        if (!$lecturer) return [
            'weekly_attendance' => $this->weeklyAttendance(),
            'notifications'     => $this->recentNotifications($user->id),
        ];

        $todayClasses = ClassSession::where('lecturer_id', $lecturer->id)
            ->where('date', today())
            ->with('subject', 'batch')
            ->orderBy('start_time')
            ->get();

        return [
            'today_classes'        => $todayClasses,
            'total_subjects'       => $lecturer->semesterSubjects()->count(),
            'weekly_attendance'    => $this->weeklyAttendance(),
            'notifications'        => $this->recentNotifications($user->id),
            'unread_notifications' => Notification::where('user_id', $user->id)
                                          ->where('is_read', false)->count(),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // STUDENT
    // ─────────────────────────────────────────────────────────────────────────────
    private function studentDashboard(User $user): array
    {
        $student = $user->student;
        if (!$student) return [
            'weekly_attendance' => $this->weeklyAttendance(),
            'notifications'     => $this->recentNotifications($user->id),
        ];

        $totalRecords   = AttendanceRecord::where('student_id', $student->id)->count();
        $presentRecords = AttendanceRecord::where('student_id', $student->id)
                              ->where('status', 'present')->count();
        $attendancePct  = $totalRecords > 0
            ? round(($presentRecords / $totalRecords) * 100, 1) : 0;

        $recentResults = Result::where('student_id', $student->id)
            ->where('is_published', true)
            ->with('subject', 'semester')
            ->latest()->take(5)->get()
            ->map(fn ($r) => [
                'id'      => $r->id,
                'grade'   => $r->grade ?? $r->grade_point,
                'subject' => ['name' => $r->subject?->name, 'code' => $r->subject?->code],
                'semester'=> ['name' => $r->semester?->name],
            ]);

        $gpa = Result::where('student_id', $student->id)
            ->where('is_published', true)
            ->whereNotNull('grade_point')
            ->avg('grade_point');

        return [
            'attendance_percentage' => $attendancePct,
            'attendance_warning'    => $attendancePct < 75 && $totalRecords > 0,
            'total_classes'         => $totalRecords,
            'classes_attended'      => $presentRecords,
            'recent_results'        => $recentResults,
            'current_gpa'           => $gpa ? round($gpa, 2) : null,
            'current_semester'      => $student->currentSemester,
            'weekly_attendance'     => $this->weeklyAttendance($student->id),
            'notifications'         => $this->recentNotifications($user->id),
            'unread_notifications'  => Notification::where('user_id', $user->id)
                                           ->where('is_read', false)->count(),
        ];
    }
}
