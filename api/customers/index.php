<?php
// api/customers/index.php
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../models/Customer.php';
require_once __DIR__ . '/../../core/AuthMiddleware.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (Request::getMethod() === 'OPTIONS') {
    Response::send(200);
}

$method = Request::getMethod();
$customerModel = new Customer();

try {
    if ($method === 'GET') {
        $customers = $customerModel->findAll();
        Response::send(200, $customers);
    } elseif ($method === 'POST') {
        AuthMiddleware::verifyToken(['ADMIN']);
        $data = Request::getBody();
        if (empty($data['name']) || empty($data['email'])) Response::send(400, ['error' => 'Nome e email são obrigatórios.']);
        $createdId = $customerModel->create($data);
        $created = $customerModel->findById($createdId);
        Response::send(201, $created);
    } else {
        Response::send(405, ['error' => 'Método não permitido.']);
    }
} catch (Exception $e) {
    Response::send(500, ['error' => $e->getMessage()]);
}
