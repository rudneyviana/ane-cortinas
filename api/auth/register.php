<?php
// api/auth/register.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../core/Database.php';
require_once __DIR__ . '/../../models/User.php';

try {
    // Obter dados do corpo da requisição
    $input = file_get_contents('php://input');
    error_log('Register - Raw input: ' . $input);
    
    $data = json_decode($input, true);
    error_log('Register - Dados decodificados: ' . json_encode($data));

    // Validar dados recebidos
    if (empty($data['email']) || empty($data['password']) || empty($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome, email e senha são obrigatórios']);
        exit;
    }

    $userModel = new User();
    
    // Verificar se usuário já existe
    $existingUser = $userModel->findByEmail($data['email']);
    
    if ($existingUser) {
        error_log('Register - Usuário já existe: ' . $data['email']);
        http_response_code(409);
        echo json_encode(['error' => 'Este email já está cadastrado']);
        exit;
    }

    // Hash da senha
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

    // Criar usuário
    $userData = [
        'name' => $data['name'],
        'email' => $data['email'],
        'password' => $hashedPassword,
        'role' => $data['role'] ?? 'CUSTOMER'
    ];

    $userId = $userModel->create($userData);

    if ($userId) {
        error_log('Register - Usuário criado com sucesso, ID: ' . $userId);
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'id' => $userId,
            'message' => 'Usuário criado com sucesso'
        ]);
    } else {
        throw new Exception('Erro ao criar usuário no banco de dados');
    }

} catch (Exception $e) {
    error_log('Register - Erro: ' . $e->getMessage());
    error_log('Register - Stack trace: ' . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['error' => 'Erro no servidor: ' . $e->getMessage()]);
}