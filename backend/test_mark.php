<?php
$token = trim(shell_exec('php c:\Users\haris\OneDrive\Desktop\SCMS\backend\get_token.php'));

$ch = curl_init('http://localhost:8000/api/attendance/mark');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['qr_code' => 'test']));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP CODE: " . $httpCode . "\n";
echo "RESPONSE: " . $response . "\n";
