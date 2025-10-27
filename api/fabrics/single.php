<?php
// api/fabrics/single.php
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../models/Fabric.php';
require_once __DIR__ . '/../../core/AuthMiddleware.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, DELETE, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (Request::getMethod() === 'OPTIONS') {
    Response::send(200);
}

$method = Request::getMethod();
$id = (int)Request::getQueryParam('id');

if ($id === 0) Response::send(400, ['error' => 'ID do tecido inválido.']);

$fabricModel = new Fabric();

try {
    AuthMiddleware::verifyToken(['ADMIN']);
    $fabric = $fabricModel->findById($id);
    if (!$fabric) Response::send(404, ['error' => 'Tecido não encontrado.']);

    if ($method === 'GET') {
        Response::send(200, $fabric);
    } elseif ($method === 'PUT' || ($method === 'POST' && isset(Request::getBody()['_method']) && Request::getBody()['_method'] === 'PUT')) {
        $data = Request::getBody();
        $files = Request::getFiles();
        if (isset($files['image']) && $files['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../../uploads/fabrics/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
            $name = basename($files['image']['name']);
            $target = $uploadDir . $name;
            move_uploaded_file($files['image']['tmp_name'], $target);
            $data['image'] = 'uploads/fabrics/' . $name;
        }
        $fabricModel->update($id, $data);
        $updated = $fabricModel->findById($id);
        Response::send(200, $updated);
    } elseif ($method === 'DELETE' || ($method === 'POST' && isset(Request::getBody()['_method']) && Request::getBody()['_method'] === 'DELETE')) {
        $fabricModel->delete($id);
        Response::send(204);
    } else {
        Response::send(405, ['error' => 'Método não permitido.']);
    }
} catch (Exception $e) {
    Response::send(500, ['error' => $e->getMessage()]);
}
