<?php
// api/orders/index.php
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../models/Order.php';
require_once __DIR__ . '/../../core/AuthMiddleware.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (Request::getMethod() === 'OPTIONS') {
    Response::send(200);
}

$method = Request::getMethod();
$orderModel = new Order();

try {
    if ($method === 'GET') {
        AuthMiddleware::verifyToken(['ADMIN']);
        $orders = $orderModel->findAllWithDetails();
        Response::send(200, $orders);
    } elseif ($method === 'POST') {
        // create order (public)
        $data = Request::getBody();
        $createdId = $orderModel->create($data);
        $created = $orderModel->findWithItems($createdId);
        Response::send(201, $created);
    } else {
        Response::send(405, ['error' => 'Método não permitido.']);
    }
} catch (Exception $e) {
    Response::send(500, ['error' => $e->getMessage()]);
}
