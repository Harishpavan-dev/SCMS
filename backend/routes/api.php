<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    AuthController,
    DashboardController,
    StudentController,
    AttendanceController,
    SubjectController,
    ResultController,
    ResourceController
};

// Public Routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/refresh', [AuthController::class, 'refresh']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/students/public-register', [StudentController::class, 'publicRegister']);
Route::get('/public/batches', [ResourceController::class, 'batchIndex']);
Route::get('/public/semesters', [ResourceController::class, 'semesterIndex']);

// Protected Routes
Route::middleware(\App\Http\Middleware\JWTAuth::class)->group(function () {
    
    // Auth & Profile
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('/fcm/token', [ResourceController::class, 'saveFcmToken']);
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Notifications
    Route::get('/notifications', [ResourceController::class, 'notificationIndex']);
    Route::put('/notifications/{id}/read', [ResourceController::class, 'notificationMarkRead']);
    Route::put('/notifications/read-all', [ResourceController::class, 'notificationMarkAllRead']);

    // --- SHARED ACCESS ---
    Route::middleware(\App\Http\Middleware\RoleMiddleware::class.':admin,lecturer,hod,rep')->group(function () {
        Route::get('/semesters/{id}/subjects', [SubjectController::class, 'getBySemester']);
        Route::get('/students', [StudentController::class, 'index']);
        Route::get('/students/{id}', [StudentController::class, 'show']);
        Route::post('/attendance/update-status', [AttendanceController::class, 'updateStatus']);
        Route::get('/attendance/sessions/{id}', [AttendanceController::class, 'getSessionRecords']);
        Route::get('/attendance/rep-analytics', [AttendanceController::class, 'getRepAnalytics']);
        Route::get('/attendance/direct-records', [AttendanceController::class, 'getDirectRecords']);
        Route::post('/attendance/mark-direct', [AttendanceController::class, 'updateStatusDirect']);
        Route::get('/subjects', [SubjectController::class, 'index']);
    });

    // --- ANALYTICS & REPORTS ---
    Route::middleware(\App\Http\Middleware\RoleMiddleware::class.':admin,lecturer,hod')->group(function () {
        Route::get('/lecturers', [ResourceController::class, 'lecturerIndex']);
        Route::get('/attendance/hod-analytics', [AttendanceController::class, 'getHodAnalytics']);
        Route::get('/attendance/report', [AttendanceController::class, 'getReport']);
        Route::post('/attendance/sessions/{id}/close', [AttendanceController::class, 'closeSession']);
        Route::post('/results/bulk', [ResultController::class, 'bulkStore']);
    });

    // --- STUDENT SELF-SERVICE ---
    Route::middleware(\App\Http\Middleware\RoleMiddleware::class.':student,rep,admin,hod,lecturer')->group(function () {
        Route::get('/students/{id}/attendance', [AttendanceController::class, 'getStudentAttendance']);
        Route::get('/attendance/batch-sessions', [AttendanceController::class, 'getBatchSessions']);
    });

    // Admin & HOD Only - Resource Management
    Route::middleware(\App\Http\Middleware\RoleMiddleware::class.':admin,hod')->group(function () {
        Route::apiResource('/subjects', SubjectController::class, ['except' => ['index']]);
        
        // Users
        Route::get('/users', [ResourceController::class, 'userIndex']);
        Route::put('/users/{id}/toggle-active', [ResourceController::class, 'userToggleActive']);
        
        // Students management
        Route::post('/students', [StudentController::class, 'store']);
        Route::put('/students/{id}', [StudentController::class, 'update']);
        Route::delete('/students/{id}', [StudentController::class, 'destroy']);
        Route::post('/students/upgrade-academic-cycle', [StudentController::class, 'upgradeAcademicCycle']);
        Route::post('/students/batch-progress-semester', [StudentController::class, 'progressBatchSemester']);
        Route::post('/students/{id}/progress-semester', [StudentController::class, 'progressSemester']);
        Route::post('/students/{id}/approve', [StudentController::class, 'approve']);
        Route::put('/students/{id}/toggle-rep', [StudentController::class, 'toggleRep']);
        
        // Settings / Batches / Semesters
        Route::get('/batches', [ResourceController::class, 'batchIndex']);
        Route::post('/batches', [ResourceController::class, 'batchStore']);
        Route::put('/batches/{id}', [ResourceController::class, 'batchUpdate']);
        Route::delete('/batches/{id}', [ResourceController::class, 'batchDestroy']);

        Route::get('/semesters', [ResourceController::class, 'semesterIndex']);
        Route::post('/semesters', [ResourceController::class, 'semesterStore']);
        Route::put('/semesters/{id}', [ResourceController::class, 'semesterUpdate']);
        Route::delete('/semesters/{id}', [ResourceController::class, 'semesterDestroy']);
        
        // Lecturers management
        Route::post('/lecturers', [ResourceController::class, 'lecturerStore']);
        Route::put('/lecturers/{id}', [ResourceController::class, 'lecturerUpdate']);
        Route::delete('/lecturers/{id}', [ResourceController::class, 'lecturerDestroy']);

        // Result Publishing
        Route::post('/results/publish', [ResultController::class, 'publish']);
    });

    // Lecturer Only
    Route::middleware(\App\Http\Middleware\RoleMiddleware::class.':lecturer')->group(function () {
        Route::post('/results', [ResultController::class, 'store']);
    });

    // Student & Rep (Personal stuff)
    Route::middleware(\App\Http\Middleware\RoleMiddleware::class.':student,rep,lecturer,admin,hod')->group(function () {
        Route::get('/students/{id}/results', [StudentController::class, 'getResults']);
        Route::get('/students/{id}/gpa', [ResultController::class, 'studentGPA']);
    });

    // Shared / Read-Only
    Route::get('/students/{id}/qr', [StudentController::class, 'getQRCode']);
    Route::get('/class-sessions', [ResourceController::class, 'classSessionIndex']);
    Route::get('/results', [ResultController::class, 'index']);
    
    // File Management
    Route::get('/files', [ResourceController::class, 'fileIndex']);
    Route::post('/files', [ResourceController::class, 'fileStore']);
    Route::delete('/files/{id}', [ResourceController::class, 'fileDestroy']);
});
