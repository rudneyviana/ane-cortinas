<?php
// api/orders/single.php
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../models/Order.php';
require_once __DIR__ . '/../../core/AuthMiddleware.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, DELETE, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (Request::getMethod() === 'OPTIONS') {
    Response::send(200);
}

$method = Request::getMethod();
$id = (int)Request::getQueryParam('id');

if ($id === 0) Response::send(400, ['error' => 'ID do pedido inválido.']);

$orderModel = new Order();

try {
    AuthMiddleware::verifyToken(['ADMIN']);
    $order = $orderModel->findWithItems($id);
    if (!$order) Response::send(404, ['error' => 'Pedido não encontrado.']);

    if ($method === 'GET') {
        Response::send(200, $order);
    } elseif ($method === 'PUT' || ($method === 'POST' && isset(Request::getBody()['_method']) && Request::getBody()['_method'] === 'PUT')) {
        $data = Request::getBody();
        $orderModel->update($id, $data);
        $updated = $orderModel->findWithItems($id);
        Response::send(200, $updated);
    } elseif ($method === 'DELETE' || ($method === 'POST' && isset(Request::getBody()['_method']) && Request::getBody()['_method'] === 'DELETE')) {
        $orderModel->delete($id);
        Response::send(204);
    } else {
        Response::send(405, ['error' => 'Método não permitido.']);
    }
} catch (Exception $e) {
    Response::send(500, ['error' => $e->getMessage()]);
}
