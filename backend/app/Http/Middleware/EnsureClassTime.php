<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureClassTime
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->role === 'rep') {
            $now = now();
            $currentTime = $now->format('H:i:s');
            $dayOfWeek = strtolower($now->format('l'));

            // Check if there's a class session happening now for the rep's batch
            $student = $user->student;
            if ($student) {
                $hasActiveClass = \App\Models\ClassSession::where('batch_id', $student->batch_id)
                    ->where('date', $now->toDateString())
                    ->where('start_time', '<=', $currentTime)
                    ->where('end_time', '>=', $currentTime)
                    ->exists();

                if (!$hasActiveClass) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Attendance can only be marked during active class time.',
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}
