<?php
// api/auth/verify.php
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../core/JwtHandler.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (Request::getMethod() === 'OPTIONS') {
    Response::send(200);
}

$headers = getallheaders();
$auth = $headers['Authorization'] ?? ($headers['authorization'] ?? null);
if (!$auth) {
    Response::send(401, ['error' => 'Authorization header missing']);
}

if (strpos($auth, 'Bearer ') === 0) {
    $token = substr($auth, 7);
    $jwt = new JwtHandler();
    if ($jwt->validate($token)) {
        Response::send(200, ['success' => true]);
    }
}

Response::send(401, ['error' => 'Invalid token']);
