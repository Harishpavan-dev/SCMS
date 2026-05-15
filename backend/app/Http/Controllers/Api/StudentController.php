<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{User, Student, Batch, Semester};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use chillerlan\QRCode\{QRCode, QROptions};

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Student::select('students.*')
            ->join('users', 'students.user_id', '=', 'users.id')
            ->with(['user', 'batch', 'currentSemester']);

        if ($request->has('batch_id')) {
            $query->where('students.batch_id', $request->batch_id);
        }
        if ($request->has('semester_id')) {
            $query->where('students.current_semester_id', $request->semester_id);
        }
        if ($request->has('status')) {
            $query->where('students.status', $request->status);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('students.registration_number', 'like', "%{$search}%")
                  ->orWhere('students.nic_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $students = $query->orderByRaw("users.role = 'rep' DESC")
            ->orderBy('students.registration_number', 'asc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    public function toggleRep(int $id): JsonResponse
    {
        $student = Student::findOrFail($id);
        $user = $student->user;
        
        if (!in_array($user->role, ['student', 'rep'])) {
            return response()->json(['success' => false, 'message' => 'User is not a student.'], 400);
        }

        if ($user->role === 'student') {
            // Count current reps in this batch
            $repCount = Student::where('batch_id', $student->batch_id)
                ->whereHas('user', function($q) {
                    $q->where('role', 'rep');
                })->count();

            if ($repCount >= 2) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Maximum 2 representatives allowed per batch.'
                ], 400);
            }

            $user->update(['role' => 'rep']);
            $msg = "Student promoted to Representative.";
        } else {
            $user->update(['role' => 'student']);
            $msg = "Representative role removed.";
        }

        return response()->json([
            'success' => true,
            'message' => $msg,
            'data' => $student->load('user')
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'nic_number' => 'required|string|max:20|unique:students,nic_number',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:male,female,other',
            'address' => 'nullable|string',
            'batch_id' => 'required|exists:batches,id',
            'current_semester_id' => 'required|exists:semesters,id',
            'avatar' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Generate registration number
            $batch = Batch::findOrFail($request->batch_id);
            $year = $batch->year;
            $count = Student::where('batch_id', $request->batch_id)->count() + 1;
            $regNumber = sprintf('ATI/HNDIT/%d/%03d', $year, $count);

            // Generate password
            $password = Str::random(8);

            // Handle avatar upload
            $avatarPath = null;
            if ($request->hasFile('avatar')) {
                $avatarPath = $request->file('avatar')->store('avatars', 'public');
            }

            // Create user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($password),
                'role' => 'student',
                'avatar' => $avatarPath,
                'phone' => $request->phone,
                'is_active' => true,
            ]);

            // Generate QR code data
            $qrData = json_encode([
                'reg' => $regNumber,
                'id' => $user->id,
                'type' => 'student',
            ]);

            // Create student profile
            $student = Student::create([
                'user_id' => $user->id,
                'registration_number' => $regNumber,
                'nic_number' => $request->nic_number,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'address' => $request->address,
                'batch_id' => $request->batch_id,
                'current_semester_id' => $request->current_semester_id,
                'qr_code_data' => $qrData,
                'status' => 'active',
            ]);

            DB::commit();

            $student->load(['user', 'batch', 'currentSemester']);

            return response()->json([
                'success' => true,
                'message' => 'Student registered successfully.',
                'data' => [
                    'student' => $student,
                    'temporary_password' => $password,
                    'registration_number' => $regNumber,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to register student: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function publicRegister(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'nic_number' => 'required|string|max:20|unique:students,nic_number',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:male,female,other',
            'address' => 'nullable|string',
            'batch_id' => 'required|exists:batches,id',
            'current_semester_id' => 'required|exists:semesters,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $batch = Batch::findOrFail($request->batch_id);
            $year = $batch->year;
            $count = Student::where('batch_id', $request->batch_id)->count() + 1;
            $regNumber = sprintf('ATI/HNDIT/%d/%03d', $year, $count);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make(Str::random(10)),
                'role' => 'student',
                'phone' => $request->phone,
                'is_active' => false,
            ]);

            $qrData = json_encode(['reg' => $regNumber, 'id' => $user->id, 'type' => 'student']);

            Student::create([
                'user_id' => $user->id,
                'registration_number' => $regNumber,
                'nic_number' => $request->nic_number,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'address' => $request->address,
                'batch_id' => $request->batch_id,
                'current_semester_id' => $request->current_semester_id,
                'qr_code_data' => $qrData,
                'status' => 'pending',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registration submitted successfully. Please wait for admin approval.',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Registration failed.'], 500);
        }
    }

    public function approve(int $id): JsonResponse
    {
        $student = Student::findOrFail($id);
        
        if ($student->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Student is not pending.'], 400);
        }

        $password = Str::random(8);

        DB::beginTransaction();
        try {
            $student->update(['status' => 'active']);
            $student->user()->update([
                'is_active' => true,
                'password' => Hash::make($password)
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Student approved successfully.',
                'data' => [
                    'student' => $student->load('user'),
                    'temporary_password' => $password
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Approval failed.'], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        $student = Student::with(['user', 'batch', 'currentSemester'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $student,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $student = Student::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $student->user_id,
            'phone' => 'sometimes|string|max:20',
            'nic_number' => 'sometimes|string|max:20|unique:students,nic_number,' . $id,
            'date_of_birth' => 'sometimes|date|before:today',
            'gender' => 'sometimes|in:male,female,other',
            'address' => 'nullable|string',
            'batch_id' => 'sometimes|exists:batches,id',
            'current_semester_id' => 'sometimes|exists:semesters,id',
            'status' => 'sometimes|in:pending,active,graduated,suspended,dropped',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Update user
            $userFields = array_filter($request->only(['name', 'email', 'phone']));
            if (!empty($userFields)) {
                $student->user()->update($userFields);
            }

            // Update student
            $studentFields = array_filter($request->only([
                'nic_number', 'date_of_birth', 'gender', 'address',
                'batch_id', 'current_semester_id', 'status',
            ]));
            if (!empty($studentFields)) {
                $student->update($studentFields);
            }

            DB::commit();

            $student->load(['user', 'batch', 'currentSemester']);

            return response()->json([
                'success' => true,
                'message' => 'Student updated successfully.',
                'data' => $student,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update student: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $student = Student::findOrFail($id);
        $student->user()->delete(); // Cascades to student

        return response()->json([
            'success' => true,
            'message' => 'Student deleted successfully.',
        ]);
    }

    public function getQRCode(int $id): JsonResponse
    {
        $student = Student::findOrFail($id);

        $options = new QROptions([
            'outputType' => QRCode::OUTPUT_IMAGE_PNG,
            'eccLevel' => QRCode::ECC_M,
            'scale' => 10,
        ]);

        $qrCode = (new QRCode($options))->render($student->qr_code_data);

        return response()->json([
            'success' => true,
            'data' => [
                'qr_code' => $qrCode,
                'qr_data' => $student->qr_code_data,
            ],
        ]);
    }

    public function getAttendance(Request $request, int $id): JsonResponse
    {
        $student = Student::findOrFail($id);

        $query = \App\Models\AttendanceRecord::where('student_id', $student->id)
            ->with(['attendanceSession.classSession.subject']);

        if ($request->has('subject_id')) {
            $query->whereHas('attendanceSession.classSession', function ($q) use ($request) {
                $q->where('subject_id', $request->subject_id);
            });
        }

        if ($request->has('from_date')) {
            $query->whereDate('marked_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('marked_at', '<=', $request->to_date);
        }

        $records = $query->latest('marked_at')->paginate(20);

        // Calculate summary
        $total = \App\Models\AttendanceRecord::where('student_id', $student->id)->count();
        $present = \App\Models\AttendanceRecord::where('student_id', $student->id)
            ->where('status', 'present')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'records' => $records,
                'summary' => [
                    'total' => $total,
                    'present' => $present,
                    'absent' => $total - $present,
                    'percentage' => $total > 0 ? round(($present / $total) * 100, 1) : 0,
                ],
            ],
        ]);
    }

    public function getResults(int $id): JsonResponse
    {
        $student = Student::findOrFail($id);

        $results = \App\Models\Result::where('student_id', $student->id)
            ->where('is_published', true)
            ->with(['subject', 'semester'])
            ->orderBy('semester_id')
            ->get()
            ->groupBy('semester_id');

        // Calculate semester and cumulative GPA
        $semesterGPAs = [];
        foreach ($results as $semesterId => $semResults) {
            $totalPoints = 0;
            $totalCredits = 0;
            foreach ($semResults as $result) {
                $credits = $result->subject->credit_hours ?? 3;
                $totalPoints += ($result->grade_point ?? 0) * $credits;
                $totalCredits += $credits;
            }
            $semesterGPAs[$semesterId] = $totalCredits > 0
                ? round($totalPoints / $totalCredits, 2)
                : 0;
        }

        $cumulativeGPA = \App\Models\Result::where('student_id', $student->id)
            ->where('is_published', true)
            ->whereNotNull('grade_point')
            ->avg('grade_point');

        return response()->json([
            'success' => true,
            'data' => [
                'results_by_semester' => $results,
                'semester_gpas' => $semesterGPAs,
                'cumulative_gpa' => $cumulativeGPA ? round($cumulativeGPA, 2) : null,
            ],
        ]);
    }

    public function progressSemester(Request $request, int $id): JsonResponse
    {
        $student = Student::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'new_semester_id' => 'required|exists:semesters,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $student->update(['current_semester_id' => $request->new_semester_id]);

        return response()->json([
            'success' => true,
            'message' => 'Student progressed to new semester.',
        ]);
    }

    public function progressBatchSemester(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'batch_id' => 'required|exists:batches,id',
            'semester_id' => 'required|exists:semesters,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        Student::where('batch_id', $request->batch_id)
            ->update(['current_semester_id' => $request->semester_id]);

        return response()->json([
            'success' => true,
            'message' => 'Batch subjects and students updated to new semester.',
        ]);
    }

    public function upgradeAcademicCycle(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Verify Admin Password
        if (!Hash::check($request->password, $request->user()->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid administrative credentials.'], 403);
        }

        DB::beginTransaction();
        try {
            $students = Student::all();
            
            foreach ($students as $student) {
                $currentSemNumber = $student->currentSemester->number ?? 1;
                
                if ($currentSemNumber < 4) {
                    $nextSem = Semester::where('number', $currentSemNumber + 1)->first();
                    if ($nextSem) {
                        $student->update(['current_semester_id' => $nextSem->id]);
                    }
                } else {
                    // Already at Sem 4, mark as Graduated
                    $student->update(['status' => 'graduated']);
                }
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Academic cycle upgraded successfully for all batches.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Migration failed.'], 500);
        }
    }
}
