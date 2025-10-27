<?php
// api/categories/index.php
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../core/AuthMiddleware.php';
require_once __DIR__ . '/../../models/Category.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (Request::getMethod() === 'OPTIONS') {
    Response::send(200);
}

$method = Request::getMethod();

try {
    $categoryModel = new Category();

    if ($method === 'GET') {
        // Público
        $categories = $categoryModel->findAll();
        Response::send(200, $categories);

    } elseif ($method === 'POST') {
        // Criação apenas para ADMIN
        AuthMiddleware::verifyToken(['ADMIN']);
        $data = Request::getBody();
        if (empty($data['name'])) {
            Response::send(400, ['error' => 'O nome da categoria é obrigatório.']);
        }
        $newId = $categoryModel->create($data);
        $new = $categoryModel->findById($newId);
        Response::send(201, $new);
    } else {
        Response::send(405, ['error' => 'Método não permitido.']);
    }

} catch (Exception $e) {
    Response::send(500, ['error' => 'Erro no servidor: ' . $e->getMessage()]);
}
