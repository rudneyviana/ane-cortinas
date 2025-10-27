<?php
// api/products/single.php
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../models/Product.php';
require_once __DIR__ . '/../../core/AuthMiddleware.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, DELETE, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (Request::getMethod() === 'OPTIONS') {
    Response::send(200);
}

$method = Request::getMethod();
$id = (int)Request::getQueryParam('id');

if ($id === 0) Response::send(400, ['error' => 'ID do produto inválido.']);

$productModel = new Product();

try {
    if ($method === 'GET') {
        $product = $productModel->findWithDetails($id);
        if (!$product) Response::send(404, ['error' => 'Produto não encontrado.']);
        Response::send(200, $product);
    } else {
        AuthMiddleware::verifyToken(['ADMIN']);
        if ($method === 'PUT' || ($method === 'POST' && isset(Request::getBody()['_method']) && Request::getBody()['_method'] === 'PUT')) {
            $data = Request::getBody();
            $productModel->updateComplete($id, $data);
            $updated = $productModel->findWithDetails($id);
            Response::send(200, $updated);
        } elseif ($method === 'DELETE' || ($method === 'POST' && isset(Request::getBody()['_method']) && Request::getBody()['_method'] === 'DELETE')) {
            $productModel->delete($id);
            Response::send(204);
        } else {
            Response::send(405, ['error' => 'Método não permitido.']);
        }
    }
} catch (Exception $e) {
    Response::send(500, ['error' => $e->getMessage()]);
}
