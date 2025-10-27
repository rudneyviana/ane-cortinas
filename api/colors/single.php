<?php
// api/colors/single.php
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../core/AuthMiddleware.php';
require_once __DIR__ . '/../../models/Color.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, DELETE, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (Request::getMethod() === 'OPTIONS') {
    Response::send(200);
}

$method = Request::getMethod();
$id = (int)Request::getQueryParam('id');

if ($id === 0) Response::send(400, ['error' => 'ID da cor inválido.']);

$colorModel = new Color();

try {
    AuthMiddleware::verifyToken(['ADMIN']);
    $color = $colorModel->findById($id);
    if (!$color) Response::send(404, ['error' => 'Cor não encontrada.']);

    if ($method === 'GET') {
        Response::send(200, $color);
    } elseif ($method === 'PUT' || ($method === 'POST' && isset(Request::getBody()['_method']) && Request::getBody()['_method'] === 'PUT')) {
        $data = Request::getBody();
        if (empty($data['name']) || empty($data['hex_code'])) Response::send(400, ['error' => 'Nome e código hexadecimal da cor são obrigatórios.']);
        $colorModel->update($id, $data);
        $updated = $colorModel->findById($id);
        Response::send(200, $updated);
    } elseif ($method === 'DELETE' || ($method === 'POST' && isset(Request::getBody()['_method']) && Request::getBody()['_method'] === 'DELETE')) {
        $colorModel->delete($id);
        Response::send(204);
    } else {
        Response::send(405, ['error' => 'Método não permitido.']);
    }
} catch (PDOException $e) {
    if ($e->getCode() == '23000') Response::send(409, ['error' => 'Não é possível excluir a cor, pois ela está em uso.']);
    Response::send(500, ['error' => 'Erro de banco de dados: ' . $e->getMessage()]);
} catch (Exception $e) {
    Response::send(500, ['error' => 'Erro no servidor: ' . $e->getMessage()]);
}
