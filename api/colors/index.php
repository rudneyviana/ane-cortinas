<?php
// api/colors/index.php
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../core/AuthMiddleware.php';
require_once __DIR__ . '/../../models/Color.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (Request::getMethod() === 'OPTIONS') {
    Response::send(200);
}

$method = Request::getMethod();
$colorModel = new Color();

try {
    if ($method === 'GET') {
        $colors = $colorModel->findAll();
        Response::send(200, $colors);
    } elseif ($method === 'POST') {
        AuthMiddleware::verifyToken(['ADMIN']);
        $data = Request::getBody();
        if (empty($data['name']) || empty($data['hex_code'])) {
            Response::send(400, ['error' => 'Nome e código hexadecimal da cor são obrigatórios.']);
        }
        $newId = $colorModel->create($data);
        $new = $colorModel->findById($newId);
        Response::send(201, $new);
    } else {
        Response::send(405, ['error' => 'Método não permitido.']);
    }
} catch (Exception $e) {
    Response::send(500, ['error' => 'Erro no servidor: ' . $e->getMessage()]);
}
