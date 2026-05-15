<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\JWTService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;

class AuthController extends Controller
{
    public function __construct(private JWTService $jwt) {}

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Contact admin.',
            ], 403);
        }

        // Eager-load relationships so the frontend receives student/lecturer data on login
        $user->load(['student.batch', 'student.currentSemester', 'lecturer']);

        $token = $this->jwt->generateToken($user);
        $refreshToken = $this->jwt->generateRefreshToken($user);

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data' => [
                'user' => $this->formatUser($user),
                'access_token' => $token,
                'refresh_token' => $refreshToken,
                'token_type' => 'bearer',
                'expires_in' => $this->jwt->getTTL() * 60,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['student.batch', 'student.currentSemester', 'lecturer']);

        return response()->json([
            'success' => true,
            'data' => $this->formatUser($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        // For JWT we just respond success - client removes token
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'refresh_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Refresh token is required.',
            ], 422);
        }

        $result = $this->jwt->refreshToken($request->refresh_token);

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired refresh token.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 400);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'sometimes|string|max:20',
            'avatar_base64' => 'sometimes|string',
            'address' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $user->update($request->only(['name', 'email', 'phone']));

            if ($request->has('avatar_base64')) {
                $imageData = $request->avatar_base64;
                if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
                    $imageData = substr($imageData, strpos($imageData, ',') + 1);
                    $type = strtolower($type[1]);
                    $imageData = base64_decode($imageData);
                    
                    $fileName = 'avatar_' . $user->id . '_' . time() . '.' . $type;
                    Storage::disk('public')->put('avatars/' . $fileName, $imageData);
                    
                    $user->update(['avatar' => env('APP_URL') . '/storage/avatars/' . $fileName]);
                }
            }

            if ($user->student) {
                $user->student->update($request->only(['address']));
            }

            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully.',
                'data' => $this->formatUser($user->load(['student.batch', 'student.currentSemester']))
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Update failed: ' . $e->getMessage()], 500);
        }
    }

    private function formatUser(User $user): array
    {
        $data = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'avatar' => $user->avatar,
            'phone' => $user->phone,
            'is_active' => $user->is_active,
        ];

        if ($user->relationLoaded('student') && $user->student) {
            $data['student'] = $user->student->toArray();
        }

        if ($user->relationLoaded('lecturer') && $user->lecturer) {
            $data['lecturer'] = $user->lecturer->toArray();
        }

        return $data;
    }
}
