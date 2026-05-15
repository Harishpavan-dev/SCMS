<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Subject, Semester};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SubjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Subject::with('semester');

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
        }

        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }

        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|unique:subjects',
            'name' => 'required|string',
            'credit_hours' => 'required|integer|min:1',
            'semester_id' => 'required|exists:semesters,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $subject = Subject::create([
            'code' => $request->code,
            'name' => $request->name,
            'credit_hours' => $request->credit_hours,
            'semester_id' => $request->semester_id
        ]);

        return response()->json(['success' => true, 'data' => $subject->load('semester')], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $subject = Subject::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'code' => "required|unique:subjects,code,{$id}",
            'name' => 'required|string',
            'credit_hours' => 'required|integer|min:1',
            'semester_id' => 'required|exists:semesters,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $subject->update([
            'code' => $request->code,
            'name' => $request->name,
            'credit_hours' => $request->credit_hours,
            'semester_id' => $request->semester_id
        ]);

        return response()->json(['success' => true, 'data' => $subject->load('semester')]);
    }

    public function destroy(int $id): JsonResponse
    {
        Subject::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Subject deleted.']);
    }

    public function getBySemester(int $semesterId): JsonResponse
    {
        $subjects = Subject::where('semester_id', $semesterId)->get();
        return response()->json(['success' => true, 'data' => $subjects]);
    }
}
