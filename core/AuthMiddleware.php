<?php
require_once __DIR__ . '/JwtHandler.php';
require_once __DIR__ . '/../core/Response.php';

class AuthMiddleware {
    private $jwt;

    public function __construct() {
        $this->jwt = new JwtHandler();
    }

    public function handle() {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? ($headers['authorization'] ?? null);
        if (!$auth) {
            Response::json(['error' => 'Unauthorized'], 401);
        }

        if (strpos($auth, 'Bearer ') === 0) {
            $token = substr($auth, 7);
            if (!$this->jwt->validate($token)) {
                Response::json(['error' => 'Invalid token'], 401);
            }
        } else {
            Response::json(['error' => 'Invalid authorization header'], 401);
        }
    }
}
