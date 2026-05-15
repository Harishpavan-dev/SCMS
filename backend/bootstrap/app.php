<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'auth.jwt' => \App\Http\Middleware\JWTAuth::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'class.time' => \App\Http\Middleware\EnsureClassTime::class,
        ]);
        
        // Since we removed Cors middleware file, we use laravel 11's built-in CORS configuration via config/cors.php
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
