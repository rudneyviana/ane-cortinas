<?php
// api/products/index.php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (Request::getMethod() === 'OPTIONS') {
    Response::send(200);
}

$method = Request::getMethod();
$db     = Database::getInstance();

// ID pode vir por rewrite: /api/products/index.php?id=123
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

// Helpers
function fetchOne(PDO $db, int $id) {
    $sql = "
        SELECT 
            p.*,
            c.name AS category_name,
            (
                SELECT pi.image_url
                FROM product_images pi
                WHERE pi.product_id = p.id
                ORDER BY pi.sort_order ASC, pi.id ASC
                LIMIT 1
            ) AS image_url
        FROM products p
        JOIN categories c ON c.id = p.category_id
        WHERE p.id = :id
        LIMIT 1
    ";
    $st = $db->prepare($sql);
    $st->execute(['id' => $id]);
    return $st->fetch();
}

function fetchList(PDO $db, array $filters = []) {
    $sql = "
        SELECT 
            p.*,
            c.name AS category_name,
            (
                SELECT pi.image_url
                FROM product_images pi
                WHERE pi.product_id = p.id
                ORDER BY pi.sort_order ASC, pi.id ASC
                LIMIT 1
            ) AS image_url
        FROM products p
        JOIN categories c ON c.id = p.category_id
    ";
    $where  = [];
    $params = [];

    if (isset($filters['category_id']) && $filters['category_id'] !== '') {
        $where[]             = 'p.category_id = :category_id';
        $params['category_id'] = (int)$filters['category_id'];
    }
    if (isset($filters['active']) && $filters['active'] !== '') {
        $where[]             = 'p.is_active = :active';
        $params['active']    = (int)!!$filters['active'];
    }
    if (!empty($filters['q'])) {
        $where[]             = 'p.name LIKE :q';
        $params['q']         = '%'.$filters['q'].'%';
    }

    if ($where) $sql .= ' WHERE '.implode(' AND ', $where);
    $sql .= ' ORDER BY p.id DESC';

    $st = $db->prepare($sql);
    $st->execute($params);
    return $st->fetchAll();
}

try {
    if ($method === 'GET') {
        // GET /api/products           -> lista
        // GET /api/products/{id}      -> um item
        if ($id) {
            $row = fetchOne($db, $id);
            if (!$row) Response::send(404, ['error' => 'Produto não encontrado.']);
            Response::send(200, $row);
        } else {
            $filters = [
                'category_id' => $_GET['category_id'] ?? null,
                'active'      => $_GET['active'] ?? null,
                'q'           => $_GET['q'] ?? null,
            ];
            $rows = fetchList($db, $filters);
            Response::send(200, $rows);
        }
    }

    if ($method === 'POST' && !$id) {
        // (Opcional para depois) criar novo produto
        $data        = Request::getBody();
        $name        = trim($data['name'] ?? '');
        $price       = (float)($data['base_price'] ?? $data['price'] ?? 0);
        $category_id = (int)($data['category_id'] ?? 0);
        $active      = isset($data['active']) ? (int)!!$data['active'] : 1;

        if ($name === '' || !$category_id) {
            Response::send(400, ['error' => 'Nome e categoria são obrigatórios.']);
        }

        $st = $db->prepare("
            INSERT INTO products (name, description, price, category_id, is_active)
            VALUES (:name, :description, :price, :category_id, :is_active)
        ");
        $st->execute([
            'name'        => $name,
            'description' => $data['description'] ?? null,
            'price'       => $price,
            'category_id' => $category_id,
            'is_active'   => $active,
        ]);
        $newId = (int)$db->lastInsertId();

        // Primeira imagem (opcional)
        if (!empty($data['image_url'])) {
            $st = $db->prepare("
                INSERT INTO product_images (product_id, image_url, sort_order)
                VALUES (:pid, :url, 1)
            ");
            $st->execute(['pid' => $newId, 'url' => $data['image_url']]);
        }

        $row = fetchOne($db, $newId);
        Response::send(201, $row);
    }

    if ($method === 'PUT' && $id) {
        // EDITAR /api/products/{id}
        $data        = Request::getBody();
        $fields      = [];
        $params      = ['id' => $id];

        if (isset($data['name'])) {
            $fields[]         = 'name = :name';
            $params['name']   = trim((string)$data['name']);
        }
        if (array_key_exists('base_price', $data) || array_key_exists('price', $data)) {
            $fields[]         = 'price = :price';
            $params['price']  = (float)($data['base_price'] ?? $data['price'] ?? 0);
        }
        if (isset($data['category_id'])) {
            $fields[]              = 'category_id = :category_id';
            $params['category_id'] = (int)$data['category_id'];
        }
        if (isset($data['active'])) {
            $fields[]             = 'is_active = :is_active';
            $params['is_active']  = (int)!!$data['active'];
        }

        if ($fields) {
            $sql = 'UPDATE products SET '.implode(', ', $fields).' WHERE id = :id';
            $st  = $db->prepare($sql);
            $st->execute($params);
        }

        // Atualiza/insere a primeira imagem (opcional)
        if (!empty($data['image_url'])) {
            // Já existe uma primeira imagem?
            $st = $db->prepare("
                SELECT id FROM product_images
                WHERE product_id = :pid
                ORDER BY sort_order ASC, id ASC
                LIMIT 1
            ");
            $st->execute(['pid' => $id]);
            $img = $st->fetch();

            if ($img) {
                $st = $db->prepare("UPDATE product_images SET image_url = :url WHERE id = :img_id");
                $st->execute(['url' => $data['image_url'], 'img_id' => $img['id']]);
            } else {
                $st = $db->prepare("
                    INSERT INTO product_images (product_id, image_url, sort_order)
                    VALUES (:pid, :url, 1)
                ");
                $st->execute(['pid' => $id, 'url' => $data['image_url']]);
            }
        }

        $row = fetchOne($db, $id);
        if (!$row) Response::send(404, ['error' => 'Produto não encontrado.']);
        Response::send(200, $row);
    }

    // (DELETE ficará para quando você pedir)
    Response::send(405, ['error' => 'Método não permitido.']);

} catch (Exception $e) {
    Response::send(500, ['error' => 'Erro no servidor: ' . $e->getMessage()]);
}
