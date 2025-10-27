<?php
// api/fabrics/index.php
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../models/Fabric.php';
require_once __DIR__ . '/../../core/AuthMiddleware.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (Request::getMethod() === 'OPTIONS') {
    Response::send(200);
}

$method = Request::getMethod();
$fabricModel = new Fabric();

try {
    if ($method === 'GET') {
        $fabrics = $fabricModel->findAll();
        Response::send(200, $fabrics);
    } elseif ($method === 'POST') {
        AuthMiddleware::verifyToken(['ADMIN']);
        $data = Request::getBody();
        $files = Request::getFiles();
        // handle optional upload fields
        if (isset($files['image']) && $files['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../../uploads/fabrics/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
            $name = basename($files['image']['name']);
            $target = $uploadDir . $name;
            move_uploaded_file($files['image']['tmp_name'], $target);
            $data['image'] = 'uploads/fabrics/' . $name;
        }
        $createdId = $fabricModel->create($data);
        $created = $fabricModel->findById($createdId);
        Response::send(201, $created);
    } else {
        Response::send(405, ['error' => 'Método não permitido.']);
    }
} catch (Exception $e) {
    Response::send(500, ['error' => $e->getMessage()]);
}
