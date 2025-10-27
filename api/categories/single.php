<?php
// api/categories/single.php
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../core/AuthMiddleware.php';
require_once __DIR__ . '/../../models/Category.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, DELETE, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (Request::getMethod() === 'OPTIONS') {
    Response::send(200);
}

$method = Request::getMethod();
$id = (int)Request::getQueryParam('id');

if ($id === 0) {
    Response::send(400, ['error' => 'ID da categoria inválido.']);
}

try {
    $categoryModel = new Category();
    $category = $categoryModel->findById($id);

    if (!$category && $method !== 'DELETE') {
        Response::send(404, ['error' => 'Categoria não encontrada.']);
    }

    if ($method === 'GET') {
        Response::send(200, $category);
    } elseif ($method === 'PUT' || ($method === 'POST' && isset(Request::getBody()['_method']) && Request::getBody()['_method'] === 'PUT')) {
        AuthMiddleware::verifyToken(['ADMIN']);
        $data = Request::getBody();
        if (empty($data['name'])) Response::send(400, ['error' => 'O nome da categoria é obrigatório.']);
        $categoryModel->update($id, $data);
        $updated = $categoryModel->findById($id);
        Response::send(200, $updated);
    } elseif ($method === 'DELETE' || ($method === 'POST' && isset(Request::getBody()['_method']) && Request::getBody()['_method'] === 'DELETE')) {
        AuthMiddleware::verifyToken(['ADMIN']);
        $deleted = $categoryModel->delete($id);
        if (!$deleted) Response::send(404, ['error' => 'Categoria não encontrada para exclusão.']);
        Response::send(204);
    } else {
        Response::send(405, ['error' => 'Método não permitido.']);
    }

} catch (PDOException $e) {
    if ($e->getCode() == '23000') {
        Response::send(409, ['error' => 'Não é possível excluir a categoria, pois ela está associada a produtos existentes.']);
    }
    Response::send(500, ['error' => 'Erro de banco de dados: ' . $e->getMessage()]);
} catch (Exception $e) {
    Response::send(500, ['error' => 'Erro no servidor: ' . $e->getMessage()]);
}
