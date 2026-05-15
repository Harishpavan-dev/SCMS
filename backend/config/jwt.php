<?php

return [
    'secret' => env('JWT_SECRET'),
    'ttl' => env('JWT_TTL', 60), // minutes
    'refresh_ttl' => env('JWT_REFRESH_TTL', 20160), // 14 days
    'algo' => 'HS256',
];
