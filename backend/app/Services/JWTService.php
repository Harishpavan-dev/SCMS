<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\User;
use Exception;

class JWTService
{
    private string $secret;
    private int $ttl;
    private int $refreshTtl;
    private string $algo;

    public function __construct()
    {
        $this->secret = config('jwt.secret') ?: env('APP_KEY');
        $this->ttl = config('jwt.ttl', 60);
        $this->refreshTtl = config('jwt.refresh_ttl', 20160);
        $this->algo = config('jwt.algo', 'HS256');
    }

    public function generateToken(User $user): string
    {
        $now = time();
        $payload = [
            'iss' => config('app.url'),
            'sub' => $user->id,
            'iat' => $now,
            'exp' => $now + ($this->ttl * 60),
            'role' => $user->role,
            'name' => $user->name,
        ];

        return JWT::encode($payload, $this->secret, $this->algo);
    }

    public function generateRefreshToken(User $user): string
    {
        $now = time();
        $payload = [
            'iss' => config('app.url'),
            'sub' => $user->id,
            'iat' => $now,
            'exp' => $now + ($this->refreshTtl * 60),
            'type' => 'refresh',
        ];

        return JWT::encode($payload, $this->secret, $this->algo);
    }

    public function parseToken(string $token): ?object
    {
        try {
            return JWT::decode($token, new Key($this->secret, $this->algo));
        } catch (Exception $e) {
            return null;
        }
    }

    public function getUserFromToken(string $token): ?User
    {
        $payload = $this->parseToken($token);

        if (!$payload || !isset($payload->sub)) {
            return null;
        }

        return User::find($payload->sub);
    }

    public function getTTL(): int
    {
        return $this->ttl;
    }

    public function refreshToken(string $token): ?array
    {
        $payload = $this->parseToken($token);

        if (!$payload || !isset($payload->sub)) {
            return null;
        }

        if (!isset($payload->type) || $payload->type !== 'refresh') {
            return null;
        }

        $user = User::find($payload->sub);
        if (!$user) {
            return null;
        }

        return [
            'access_token' => $this->generateToken($user),
            'refresh_token' => $this->generateRefreshToken($user),
            'token_type' => 'bearer',
            'expires_in' => $this->ttl * 60,
        ];
    }
}
