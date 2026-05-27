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

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $token = rand(100000, 999999);
        
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['token' => $token, 'created_at' => now()]
        );

        try {
            \Illuminate\Support\Facades\Mail::send([], [], function ($message) use ($request, $token) {
                $message->to($request->email)
                    ->subject('Password Reset Code - SCMS')
                    ->html("
                        <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px;'>
                            <div style='text-align: center; margin-bottom: 30px;'>
                                <div style='display: inline-block; background: #4f46e5; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; color: white; font-weight: 900;'>SC</div>
                            </div>
                            <h2 style='color: #1e293b; font-weight: 900; text-align: center; margin-bottom: 8px;'>Password Reset Request</h2>
                            <p style='color: #64748b; text-align: center; font-size: 14px; margin-bottom: 30px;'>Use the code below to reset your SCMS terminal password.</p>
                            
                            <div style='background: #f8fafc; padding: 24px; border-radius: 16px; text-align: center; border: 1px dashed #cbd5e1;'>
                                <span style='font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 12px; color: #4f46e5;'>$token</span>
                            </div>
                            
                            <p style='color: #94a3b8; font-size: 12px; text-align: center; margin-top: 40px;'>
                                If you did not request this, please ignore this email or contact support.
                            </p>
                        </div>
                    ");
            });

            return response()->json(['success' => true, 'message' => 'Reset code sent to your email.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to send email. ' . $e->getMessage()], 500);
        }
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$record || now()->parse($record->created_at)->addMinutes(15)->isPast()) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired code.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->update(['password' => Hash::make($request->password)]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['success' => true, 'message' => 'Password reset successfully.']);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'sometimes|nullable|string|max:20',
            'avatar_base64' => 'sometimes|nullable|string',
            'address' => 'sometimes|nullable|string',
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
                    
                    $user->update(['avatar' => config('app.url') . '/storage/avatars/' . $fileName]);
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
