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

function parse_money($val) {
    if ($val === null) return null;
    $s = trim((string)$val);
    if ($s === '') return null;
    $s = str_replace(['R$', ' '], '', $s);
    if (strpos($s, '.') !== false && strpos($s, ',') !== false) {
        $s = str_replace('.', '', $s);
        $s = str_replace(',', '.', $s);
    } elseif (strpos($s, ',') !== false) {
        $s = str_replace(',', '.', $s);
    }
    if (!is_numeric($s)) return null;
    return (float)$s;
}

function normalize_product_row(array $row) {
    if (isset($row['price'])) {
        $row['base_price'] = $row['price'];
    } elseif (isset($row['base_price'])) {
        $row['price'] = $row['base_price'];
    } else {
        $row['price'] = $row['base_price'] = 0.0;
    }
    if (isset($row['is_active'])) {
        $row['is_active'] = (int)$row['is_active'];
    }
    return $row;
}

function fetchOne(PDO $db, int $id): ?array {
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
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.id = :id
        LIMIT 1
    ";
    $st = $db->prepare($sql);
    $st->execute(['id' => $id]);
    $row = $st->fetch(PDO::FETCH_ASSOC);
    return $row ? normalize_product_row($row) : null;
}

function fetchList(PDO $db, array $filters = []): array {
    $where = [];
    $params = [];

    if (!empty($filters['category_id'])) {
        $where[] = 'p.category_id = :category_id';
        $params['category_id'] = (int)$filters['category_id'];
    }
    if ($filters['active'] !== null && $filters['active'] !== '') {
        $where[] = 'p.is_active = :active';
        $params['active'] = (int)!!$filters['active'];
    }
    if (!empty($filters['q'])) {
        $where[] = '(p.name LIKE :q OR p.description LIKE :q)';
        $params['q'] = '%' . $filters['q'] . '%';
    }

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
        LEFT JOIN categories c ON c.id = p.category_id
        " . (count($where) ? ('WHERE ' . implode(' AND ', $where)) : '') . "
        ORDER BY p.id DESC
    ";
    $st = $db->prepare($sql);
    $st->execute($params);
    $rows = $st->fetchAll(PDO::FETCH_ASSOC) ?: [];
    return array_map('normalize_product_row', $rows);
}

try {
    $db = Database::getInstance();
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $method = Request::getMethod();
    $id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

    if ($method === 'GET') {
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
        $data        = Request::getBody();
        $name        = trim($data['name'] ?? '');
        $priceFloat  = parse_money($data['base_price'] ?? $data['price'] ?? null);
        $category_id = (int)($data['category_id'] ?? 0);
        $active      = isset($data['active']) ? (int)!!$data['active'] : 1;

        if ($name === '') Response::send(400, ['error' => 'O nome é obrigatório.']);
        if ($category_id <= 0) Response::send(400, ['error' => 'Categoria inválida.']);
        if ($priceFloat === null) Response::send(400, ['error' => 'Preço inválido.']);

        $st = $db->prepare("
            INSERT INTO products (name, description, price, category_id, is_active)
            VALUES (:name, :description, :price, :category_id, :is_active)
        ");
        $ok = $st->execute([
            'name'        => $name,
            'description' => $data['description'] ?? null,
            'price'       => $priceFloat,
            'category_id' => $category_id,
            'is_active'   => $active,
        ]);
        if (!$ok) {
            $err = $st->errorInfo();
            Response::send(400, ['error' => 'Falha ao inserir produto.', 'detail' => $err[2] ?? null]);
        }

        $newId = (int)$db->lastInsertId();
        if ($newId <= 0) Response::send(500, ['error' => 'Falha ao obter o ID do novo produto.']);

        if (!empty($data['image_url'])) {
            $sti = $db->prepare("INSERT INTO product_images (product_id, image_url, sort_order) VALUES (:pid, :url, 1)");
            $sti->execute(['pid' => $newId, 'url' => $data['image_url']]);
        }

        $row = fetchOne($db, $newId);
        Response::send(201, $row ?: ['id' => $newId]); // garante um corpo com id
    }

    if ($method === 'PUT' && $id) {
        $data   = Request::getBody();
        $fields = [];
        $params = ['id' => $id];

        if (isset($data['name'])) {
            $fields[] = 'name = :name';
            $params['name'] = trim((string)$data['name']);
        }

        $priceCandidate = $data['base_price'] ?? $data['price'] ?? null;
        $priceFloat     = parse_money($priceCandidate);
        if ($priceFloat !== null) {
            $fields[] = 'price = :price';
            $params['price'] = $priceFloat;
        }

        if (isset($data['category_id'])) {
            $fields[] = 'category_id = :category_id';
            $params['category_id'] = (int)$data['category_id'];
        }

        if (isset($data['active'])) {
            $fields[] = 'is_active = :active';
            $params['active'] = (int)!!$data['active'];
        }

        if (isset($data['description'])) {
            $fields[] = 'description = :description';
            $params['description'] = $data['description'];
        }

        if ($fields) {
            $sql = 'UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = :id';
            $st  = $db->prepare($sql);
            $st->execute($params);
        }

        if (array_key_exists('image_url', $data)) {
            $first = $db->prepare("SELECT id FROM product_images WHERE product_id = :id ORDER BY sort_order ASC, id ASC LIMIT 1");
            $first->execute(['id' => $id]);
            $imgId = $first->fetchColumn();

            if ($data['image_url']) {
                if ($imgId) {
                    $up = $db->prepare("UPDATE product_images SET image_url = :url WHERE id = :imgId");
                    $up->execute(['url' => $data['image_url'], 'imgId' => $imgId]);
                } else {
                    $ins = $db->prepare("INSERT INTO product_images (product_id, image_url, sort_order) VALUES (:pid, :url, 1)");
                    $ins->execute(['pid' => $id, 'url' => $data['image_url']]);
                }
            } elseif ($imgId) {
                $del = $db->prepare("DELETE FROM product_images WHERE id = :imgId");
                $del->execute(['imgId' => $imgId]);
            }
        }

        $row = fetchOne($db, $id);
        Response::send(200, $row ?: ['id' => $id]);
    }

    if ($method === 'DELETE' && $id) {
        try {
            $db->prepare("DELETE FROM product_images WHERE product_id = :id")->execute(['id' => $id]);
            $st = $db->prepare("DELETE FROM products WHERE id = :id");
            $st->execute(['id' => $id]);
            if ($st->rowCount() === 0) Response::send(404, ['error' => 'Produto não encontrado.']);
            Response::send(204, null);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                Response::send(409, ['error' => 'Não é possível excluir: o produto está vinculado a pedidos. Desative-o em vez de excluir.']);
            }
            throw $e;
        }
    }

    Response::send(405, ['error' => 'Método não permitido.']);

} catch (Exception $e) {
    Response::send(500, ['error' => 'Erro no servidor: ' . $e->getMessage()]);
}
