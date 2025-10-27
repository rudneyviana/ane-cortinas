<?php
// api/products/index.php
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../core/AuthMiddleware.php';
require_once __DIR__ . '/../../models/Product.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (Request::getMethod() === 'OPTIONS') {
    Response::send(200);
}

$method = Request::getMethod();

try {
    $productModel = new Product();

    if ($method === 'GET') {
        // Público - qualquer um pode ver produtos
        $filters = [];
        if (isset($_GET['category_id'])) {
            $filters['category_id'] = (int)$_GET['category_id'];
        }
        
        $products = $productModel->findAllWithDetails($filters);
        
        // Retorna array de produtos diretamente (não em objeto 'products')
        Response::send(200, $products);

    } elseif ($method === 'POST') {
        // Criação apenas para ADMIN
        AuthMiddleware::verifyToken(['ADMIN']);
        $data = Request::getBody();
        
        if (empty($data['name']) || empty($data['price']) || empty($data['category_id'])) {
            Response::send(400, ['error' => 'Nome, preço e categoria são obrigatórios.']);
        }
        
        $newId = $productModel->createComplete($data);
        $new = $productModel->findWithDetails($newId);
        Response::send(201, $new);
    } else {
        Response::send(405, ['error' => 'Método não permitido.']);
    }

} catch (Exception $e) {
    error_log('Erro na API de produtos: ' . $e->getMessage());
    Response::send(500, ['error' => 'Erro no servidor: ' . $e->getMessage()]);
}