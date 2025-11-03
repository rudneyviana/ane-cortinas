<?php
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

// ------------ helpers ------------
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

// ------------ queries ------------
function fetchImages(PDO $db, int $id): array {
    $img = $db->prepare("SELECT id, image_url, alt_text, sort_order
                         FROM product_images
                         WHERE product_id = :id
                         ORDER BY sort_order ASC, id ASC");
    $img->execute(['id' => $id]);
    return $img->fetchAll(PDO::FETCH_ASSOC) ?: [];
}

function fetchCurtainDetails(PDO $db, int $id): ?array {
    $st = $db->prepare("SELECT rail_type, rail_color, rail_width
                        FROM product_curtains WHERE product_id = :id LIMIT 1");
    $st->execute(['id' => $id]);
    $row = $st->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function fetchCushionPendantDetails(PDO $db, int $id): ?array {
    $st = $db->prepare("SELECT color_id, height, width, stock_quantity
                        FROM product_cushions_pendants WHERE product_id = :id LIMIT 1");
    $st->execute(['id' => $id]);
    $row = $st->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function fetchOne(PDO $db, int $id): ?array {
    $sql = "
        SELECT 
            p.*,
            c.name AS category_name,
            (SELECT pi.image_url
               FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.sort_order ASC, pi.id ASC
              LIMIT 1) AS image_url,
            (SELECT detail_value FROM product_details pd WHERE pd.product_id = p.id AND pd.detail_key = 'sku'        LIMIT 1) AS sku,
            (SELECT detail_value FROM product_details pd WHERE pd.product_id = p.id AND pd.detail_key = 'stock_text' LIMIT 1) AS stock_text
        FROM products p
        JOIN categories c ON c.id = p.category_id
       WHERE p.id = :id
       LIMIT 1
    ";
    $st = $db->prepare($sql);
    $st->execute(['id' => $id]);
    $row = $st->fetch(PDO::FETCH_ASSOC);
    if (!$row) return null;

    $row = normalize_product_row($row);

    // Galeria
    $row['images'] = fetchImages($db, $id);

    // Detalhes por tipo
    $details = [];
    $curtain  = fetchCurtainDetails($db, $id);
    $cushPend = fetchCushionPendantDetails($db, $id);

    if ($curtain) {
        $details['type'] = 'curtain';
        $details = array_merge($details, $curtain);
    } elseif ($cushPend) {
        $details['type'] = 'cushion_pendant';
        $details = array_merge($details, $cushPend);
    } else {
        if (isset($row['category_name']) && mb_strtolower($row['category_name']) === 'cortinas') {
            $details['type'] = 'curtain';
        }
    }

    if (!array_key_exists('sku', $row))        $row['sku'] = null;
    if (!array_key_exists('stock_text', $row)) $row['stock_text'] = null;

    $row['details'] = $details;

    return $row;
}

function fetchList(PDO $db, array $filters = []): array {
    $where  = [];
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

    // Ordenação
    $orderBy = 'p.id DESC'; // padrão anterior (mantido)
    $sort = isset($filters['sort']) ? strtolower(trim((string)$filters['sort'])) : null;
    if ($sort === 'price_asc') {
        $orderBy = 'p.price ASC, p.id DESC';
    } elseif ($sort === 'price_desc') {
        $orderBy = 'p.price DESC, p.id DESC';
    } elseif ($sort === 'oldest') {
        $orderBy = 'p.id ASC';
    } elseif ($sort === 'newest') {
        $orderBy = 'p.id DESC';
    } elseif ($sort === 'cortinas_first') {
        // coloca a categoria "Cortinas" primeiro e mantém o restante do comportamento
        $orderBy = 'CASE WHEN LOWER(c.name) = "cortinas" THEN 0 ELSE 1 END, p.id DESC';
    }

    $sql = "
        SELECT 
            p.*,
            c.name AS category_name,
            (SELECT pi.image_url
               FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.sort_order ASC, pi.id ASC
              LIMIT 1) AS image_url,
            (SELECT detail_value FROM product_details pd WHERE pd.product_id = p.id AND pd.detail_key = 'sku'        LIMIT 1) AS sku,
            (SELECT detail_value FROM product_details pd WHERE pd.product_id = p.id AND pd.detail_key = 'stock_text' LIMIT 1) AS stock_text
        FROM products p
        JOIN categories c ON c.id = p.category_id
        " . (count($where) ? ('WHERE ' . implode(' AND ', $where)) : '') . "
        ORDER BY $orderBy
    ";
    $st = $db->prepare($sql);
    $st->execute($params);
    $rows = $st->fetchAll(PDO::FETCH_ASSOC) ?: [];
    return array_map('normalize_product_row', $rows);
}

// ------------ controller ------------
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
                'sort'        => $_GET['sort'] ?? null, // <— novo
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

        if ($name === '')         Response::send(400, ['error' => 'O nome é obrigatório.']);
        if ($category_id <= 0)    Response::send(400, ['error' => 'Categoria inválida.']);
        if ($priceFloat === null) Response::send(400, ['error' => 'Preço inválido.']);

        $st = $db->prepare("
            INSERT INTO products (name, description, price, category_id, is_active)
            VALUES (:name, :description, :price, :category_id, :is_active)
        ");
        $st->execute([
            'name'        => $name,
            'description' => $data['description'] ?? null,
            'price'       => $priceFloat,
            'category_id' => $category_id,
            'is_active'   => $active,
        ]);
        $newId = (int)$db->lastInsertId();

        if (!empty($data['image_url'])) {
            $sti = $db->prepare("INSERT INTO product_images (product_id, image_url, sort_order) VALUES (:pid, :url, 1)");
            $sti->execute(['pid' => $newId, 'url' => $data['image_url']]);
        }

        if (array_key_exists('sku', $data)) {
            $db->prepare("INSERT INTO product_details (product_id, detail_key, detail_value) VALUES (:pid,'sku',:v)")
               ->execute(['pid' => $newId, 'v' => trim((string)$data['sku'])]);
        }
        if (array_key_exists('stock_text', $data)) {
            $db->prepare("INSERT INTO product_details (product_id, detail_key, detail_value) VALUES (:pid,'stock_text',:v)")
               ->execute(['pid' => $newId, 'v' => trim((string)$data['stock_text'])]);
        }

        $row = fetchOne($db, $newId);
        Response::send(201, $row);
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
                    $db->prepare("UPDATE product_images SET image_url = :url WHERE id = :imgId")
                       ->execute(['url' => $data['image_url'], 'imgId' => $imgId]);
                } else {
                    $db->prepare("INSERT INTO product_images (product_id, image_url, sort_order) VALUES (:pid,:url,1)")
                       ->execute(['pid' => $id, 'url' => $data['image_url']]);
                }
            } elseif ($imgId) {
                $db->prepare("DELETE FROM product_images WHERE id = :imgId")
                   ->execute(['imgId' => $imgId]);
            }
        }

        // metas (sku/stock_text) — upsert simples
        if (array_key_exists('sku', $data)) {
            $sel = $db->prepare("SELECT id FROM product_details WHERE product_id = :pid AND detail_key = 'sku' LIMIT 1");
            $sel->execute(['pid' => $id]);
            $metaId = $sel->fetchColumn();
            $val = trim((string)$data['sku']);
            if ($metaId) {
                $db->prepare("UPDATE product_details SET detail_value = :v WHERE id = :id")->execute(['v' => $val, 'id' => $metaId]);
            } else {
                $db->prepare("INSERT INTO product_details (product_id, detail_key, detail_value) VALUES (:pid,'sku',:v)")
                   ->execute(['pid' => $id, 'v' => $val]);
            }
        }
        if (array_key_exists('stock_text', $data)) {
            $sel = $db->prepare("SELECT id FROM product_details WHERE product_id = :pid AND detail_key = 'stock_text' LIMIT 1");
            $sel->execute(['pid' => $id]);
            $metaId = $sel->fetchColumn();
            $val = trim((string)$data['stock_text']);
            if ($metaId) {
                $db->prepare("UPDATE product_details SET detail_value = :v WHERE id = :id")->execute(['v' => $val, 'id' => $metaId]);
            } else {
                $db->prepare("INSERT INTO product_details (product_id, detail_key, detail_value) VALUES (:pid,'stock_text',:v)")
                   ->execute(['pid' => $id, 'v' => $val]);
            }
        }

        $row = fetchOne($db, $id);
        Response::send(200, $row);
    }

    if ($method === 'DELETE' && $id) {
        try {
            $db->prepare("DELETE FROM product_images WHERE product_id = :id")->execute(['id' => $id]);
            $db->prepare("DELETE FROM product_details WHERE product_id = :id")->execute(['id' => $id]);
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
