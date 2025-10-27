<?php
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../core/JwtHandler.php';
require_once __DIR__ . '/../../models/User.php';

$request = new Request();
$data = $request->body;

if (empty($data['email']) || empty($data['password'])) {
    Response::json(['error' => 'Email e senha são obrigatórios'], 400);
}

error_log('Login - Dados recebidos: ' . json_encode($data));

$userModel = new User();
$user = $userModel->findByEmail($data['email']);

error_log('Login - Usuário encontrado: ' . ($user ? json_encode($user) : 'não encontrado'));

if (!$user) {
    error_log('Login - Usuário não encontrado');
    Response::json(['error' => 'Credenciais inválidas'], 401);
    exit;
}

if (!password_verify($data['password'], $user['password_hash'])) {
    error_log('Login - Senha inválida');
    Response::json(['error' => 'Credenciais inválidas'], 401);
    exit;
}

$jwt = new JwtHandler();
$token = $jwt->generate(['user_id' => $user['id'], 'email' => $user['email']]);

error_log('Login - Login bem sucedido. Token gerado: ' . $token);

// Remove a senha antes de enviar os dados do usuário
unset($user['password_hash']);

// Remova dados sensíveis antes de enviar
unset($user['password_hash']);

Response::json([
    'success' => true,
    'token' => $token,
    'user' => $user
]);
