<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
// Find a student user who is not active maybe?
$u = App\Models\User::where('role', 'student')->where('is_active', false)->first();
if ($u) {
    echo "INACTIVE STUDENT: " . app(\App\Services\JWTService::class)->generateToken($u);
} else {
    $u = App\Models\User::where('role', 'student')->first();
    echo app(\App\Services\JWTService::class)->generateToken($u);
}
