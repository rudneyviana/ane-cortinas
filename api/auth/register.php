<?php
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../models/User.php';

$request = new Request();
$data = $request->body;

if (empty($data['email']) || empty($data['password']) || empty($data['name'])) {
    Response::json(['error' => 'Nome, email e senha são obrigatórios'], 400);
}

error_log('Register - Dados recebidos: ' . json_encode($data));

$userModel = new User();
error_log('Tentativa de registro - Email: ' . $data['email']);

$existingUser = $userModel->findByEmail($data['email']);
error_log('Register - Resultado da busca: ' . ($existingUser ? 'encontrado' : 'não encontrado'));

if ($existingUser) {
    error_log('Usuário encontrado: ' . print_r($existingUser, true));
    Response::json(['error' => 'Usuário já existe'], 409);
    exit;
}

$hashed = password_hash($data['password'], PASSWORD_DEFAULT);
$userData = [
    'name' => $data['name'],
    'email' => $data['email'],
    'password' => $hashed,
    'role' => 'CUSTOMER'
];

error_log('Register - Antes de criar: ' . json_encode($userData));

$userId = $userModel->create($userData);

error_log('Register - Usuário criado com ID: ' . $userId);

// Busca o usuário recém criado para confirmar
$newUser = $userModel->findByEmail($data['email']);
error_log('Register - Usuário encontrado após criar: ' . json_encode($newUser));

// Retorna apenas o ID do usuário criado
Response::json(['id' => $userId], 201);
