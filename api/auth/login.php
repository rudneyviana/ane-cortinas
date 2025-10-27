<?php
// api/auth/login.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../core/Database.php';
require_once __DIR__ . '/../../core/JwtHandler.php';
require_once __DIR__ . '/../../models/User.php';

try {
    // Obter dados do corpo da requisição
    $input = file_get_contents('php://input');
    error_log('Login - Raw input: ' . $input);
    
    $data = json_decode($input, true);
    error_log('Login - Dados decodificados: ' . json_encode($data));

    // Validar dados recebidos
    if (empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email e senha são obrigatórios']);
        exit;
    }

    $userModel = new User();
    $user = $userModel->findByEmail($data['email']);

    if (!$user) {
        error_log('Login - Usuário não encontrado para email: ' . $data['email']);
        http_response_code(401);
        echo json_encode(['error' => 'Credenciais inválidas']);
        exit;
    }

    // Verificar senha
    if (!password_verify($data['password'], $user['password_hash'])) {
        error_log('Login - Senha incorreta para email: ' . $data['email']);
        http_response_code(401);
        echo json_encode(['error' => 'Credenciais inválidas']);
        exit;
    }

    // Gerar token JWT
    $jwt = new JwtHandler();
    $token = $jwt->generate([
        'user_id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role']
    ]);

    // Remover senha do retorno
    unset($user['password_hash']);

    // Retornar sucesso
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => $user
    ]);

} catch (Exception $e) {
    error_log('Login - Erro: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro no servidor: ' . $e->getMessage()]);
}