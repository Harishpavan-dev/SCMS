<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Batch, Semester, Subject, Lecturer, User, Notification, FileUpload, ClassSession};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ResourceController extends Controller
{
    // ========== BATCHES ==========
    public function batchIndex(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => Batch::withCount('students')->latest()->get()]);
    }

    public function batchStore(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'year' => 'required|integer|min:2020|max:2040',
        ]);
        if ($v->fails()) return response()->json(['success' => false, 'errors' => $v->errors()], 422);

        $batch = Batch::create($request->only('name', 'year'));
        return response()->json(['success' => true, 'data' => $batch], 201);
    }

    public function batchUpdate(Request $request, int $id): JsonResponse
    {
        $batch = Batch::findOrFail($id);
        $batch->update($request->only('name', 'year', 'is_active'));
        return response()->json(['success' => true, 'data' => $batch]);
    }

    public function batchDestroy(int $id): JsonResponse
    {
        Batch::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Batch deleted.']);
    }

    // ========== SEMESTERS ==========
    public function semesterIndex(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => Semester::withCount('students')->orderBy('number')->get()]);
    }

    public function semesterStore(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'number' => 'required|integer|min:1|max:8',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);
        if ($v->fails()) return response()->json(['success' => false, 'errors' => $v->errors()], 422);

        $semester = Semester::create($request->only('name', 'number', 'start_date', 'end_date'));
        return response()->json(['success' => true, 'data' => $semester], 201);
    }

    public function semesterUpdate(Request $request, int $id): JsonResponse
    {
        $semester = Semester::findOrFail($id);
        $semester->update($request->only('name', 'number', 'start_date', 'end_date', 'is_active'));
        return response()->json(['success' => true, 'data' => $semester]);
    }

    public function semesterDestroy(int $id): JsonResponse
    {
        Semester::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Semester deleted.']);
    }

    // ========== SUBJECTS ==========
    public function subjectIndex(Request $request): JsonResponse
    {
        $query = Subject::query();
        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }
        return response()->json(['success' => true, 'data' => $query->orderBy('code')->get()]);
    }

    public function subjectStore(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'code' => 'required|string|max:20|unique:subjects,code',
            'name' => 'required|string|max:255',
            'credit_hours' => 'required|integer|min:1|max:6',
            'description' => 'nullable|string',
            'semester_id' => 'nullable|exists:semesters,id',
        ]);
        if ($v->fails()) return response()->json(['success' => false, 'errors' => $v->errors()], 422);

        $subject = Subject::create($request->only('code', 'name', 'credit_hours', 'description', 'semester_id'));
        return response()->json(['success' => true, 'data' => $subject], 201);
    }

    public function subjectUpdate(Request $request, int $id): JsonResponse
    {
        $subject = Subject::findOrFail($id);
        $v = Validator::make($request->all(), [
            'code' => 'sometimes|string|max:20|unique:subjects,code,' . $id,
            'name' => 'sometimes|string|max:255',
        ]);
        if ($v->fails()) return response()->json(['success' => false, 'errors' => $v->errors()], 422);
        $subject->update($request->only('code', 'name', 'credit_hours', 'description', 'semester_id'));
        return response()->json(['success' => true, 'data' => $subject]);
    }

    public function subjectDestroy(int $id): JsonResponse
    {
        Subject::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Subject deleted.']);
    }

    // ========== LECTURERS ==========
    public function lecturerIndex(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => Lecturer::with('user')->get()]);
    }

    public function lecturerStore(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'employee_id' => 'required|string|max:50|unique:lecturers,employee_id',
            'department' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
        ]);
        if ($v->fails()) return response()->json(['success' => false, 'errors' => $v->errors()], 422);

        $password = \Illuminate\Support\Str::random(8);
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($password),
            'role' => 'lecturer',
            'phone' => $request->phone,
        ]);

        $lecturer = Lecturer::create([
            'user_id' => $user->id,
            'employee_id' => $request->employee_id,
            'department' => $request->department,
            'specialization' => $request->specialization,
        ]);

        return response()->json([
            'success' => true,
            'data' => ['lecturer' => $lecturer->load('user'), 'temporary_password' => $password],
        ], 201);
    }

    public function lecturerUpdate(Request $request, int $id): JsonResponse
    {
        $lecturer = Lecturer::findOrFail($id);
        $userFields = $request->only(['name', 'email', 'phone']);
        if (!empty($userFields)) $lecturer->user()->update($userFields);
        $lecturer->update($request->only('department', 'specialization'));
        return response()->json(['success' => true, 'data' => $lecturer->load('user')]);
    }

    public function lecturerDestroy(int $id): JsonResponse
    {
        $lecturer = Lecturer::findOrFail($id);
        $lecturer->user()->delete();
        return response()->json(['success' => true, 'message' => 'Lecturer deleted.']);
    }

    // ========== NOTIFICATIONS ==========
    public function notificationIndex(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()->paginate(20);
        return response()->json(['success' => true, 'data' => $notifications]);
    }

    public function notificationMarkRead(int $id): JsonResponse
    {
        Notification::findOrFail($id)->update(['is_read' => true]);
        return response()->json(['success' => true]);
    }

    public function notificationMarkAllRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)->update(['is_read' => true]);
        return response()->json(['success' => true, 'message' => 'All notifications marked as read.']);
    }

    // ========== FILE UPLOADS ==========
    public function fileIndex(Request $request): JsonResponse
    {
        $query = FileUpload::with(['uploader', 'subject']);
        if ($request->has('subject_id')) $query->where('subject_id', $request->subject_id);
        if ($request->has('type')) $query->where('type', $request->type);
        return response()->json(['success' => true, 'data' => $query->latest()->paginate(20)]);
    }

    public function fileStore(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'file' => 'required|file|max:20480',
            'title' => 'required|string|max:255',
            'subject_id' => 'nullable|exists:subjects,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'type' => 'required|in:note,material,assignment,other',
        ]);
        if ($v->fails()) return response()->json(['success' => false, 'errors' => $v->errors()], 422);

        $file = $request->file('file');
        $path = $file->store('uploads/' . $request->type, 'public');

        $upload = FileUpload::create([
            'uploaded_by' => $request->user()->id,
            'subject_id' => $request->subject_id,
            'semester_id' => $request->semester_id,
            'type' => $request->type,
            'title' => $request->title,
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        return response()->json(['success' => true, 'data' => $upload], 201);
    }

    public function fileDestroy(int $id): JsonResponse
    {
        $file = FileUpload::findOrFail($id);
        \Illuminate\Support\Facades\Storage::disk('public')->delete($file->file_path);
        $file->delete();
        return response()->json(['success' => true, 'message' => 'File deleted.']);
    }

    // ========== CLASS SESSIONS ==========
    public function classSessionIndex(Request $request): JsonResponse
    {
        $query = ClassSession::with(['subject', 'lecturer.user', 'batch']);

        $user = $request->user();
        if ($user->role === 'lecturer' && $user->lecturer) {
            $query->where('lecturer_id', $user->lecturer->id);
        } elseif (in_array($user->role, ['student', 'rep']) && $user->student) {
            $query->where('batch_id', $user->student->batch_id);
        }

        if ($request->has('date')) $query->where('date', $request->date);
        if ($request->has('from_date')) $query->where('date', '>=', $request->from_date);
        if ($request->has('to_date')) $query->where('date', '<=', $request->to_date);

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('date')->orderBy('start_time')->paginate(20),
        ]);
    }

    // ========== USERS (Admin) ==========
    public function userIndex(Request $request): JsonResponse
    {
        $query = User::query();
        if ($request->has('role')) $query->where('role', $request->role);
        if ($request->has('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"));
        }
        return response()->json(['success' => true, 'data' => $query->latest()->paginate(20)]);
    }

    public function userToggleActive(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);
        return response()->json(['success' => true, 'data' => $user]);
    }

    // ========== FCM TOKENS ==========
    public function saveFcmToken(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'device_type' => 'nullable|string'
        ]);

        $request->user()->fcmTokens()->updateOrCreate(
            ['token' => $request->token],
            ['device_type' => $request->device_type ?? 'web']
        );

        return response()->json(['success' => true, 'message' => 'FCM Token saved.']);
    }
}
