<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\FcmToken;

class FcmService
{
    protected $credentialsPath;

    public function __construct()
    {
        $this->credentialsPath = storage_path('app/firebase/service-account.json');
    }

    /**
     * Get Google OAuth2 Access Token
     */
    protected function getAccessToken()
    {
        if (!file_exists($this->credentialsPath)) {
            Log::error("Firebase service account file not found at: " . $this->credentialsPath);
            return null;
        }

        $credentials = json_decode(file_get_contents($this->credentialsPath), true);
        $now = time();

        $payload = [
            'iss' => $credentials['client_email'],
            'scope' => 'https://www.googleapis.com/auth/cloud-platform',
            'aud' => 'https://oauth2.googleapis.com/token',
            'exp' => $now + 3600,
            'iat' => $now,
        ];

        $jwt = JWT::encode($payload, $credentials['private_key'], 'RS256');

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt,
        ]);

        if ($response->successful()) {
            return $response->json('access_token');
        }

        Log::error("Failed to get FCM Access Token: " . $response->body());
        return null;
    }

    /**
     * Send Push Notification via FCM HTTP v1
     */
    public function sendNotification($userId, $title, $body, $data = [])
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) return false;

        $tokens = FcmToken::where('user_id', $userId)->pluck('token')->toArray();
        if (empty($tokens)) return false;

        $credentials = json_decode(file_get_contents($this->credentialsPath), true);
        $projectId = $credentials['project_id'];
        $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

        $successCount = 0;
        foreach ($tokens as $token) {
            $message = [
                'message' => [
                    'token' => $token,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'data' => array_map('strval', $data), // FCM fields must be strings
                    'webpush' => [
                        'headers' => [
                            'Urgency' => 'high',
                        ],
                        'notification' => [
                            'icon' => '/logo192.png',
                            'click_action' => config('app.frontend_url', 'http://localhost:5173') . '/dashboard',
                        ],
                    ],
                ]
            ];

            $response = Http::withToken($accessToken)->post($url, $message);

            if ($response->successful()) {
                $successCount++;
            } else {
                Log::warning("FCM Send Error for user {$userId}: " . $response->body());
                // If token is invalid, remove it
                if ($response->status() === 404 || $response->status() === 410) {
                    FcmToken::where('token', $token)->delete();
                }
            }
        }

        return $successCount > 0;
    }
}
