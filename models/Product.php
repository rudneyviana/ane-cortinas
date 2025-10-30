<?php
require_once __DIR__ . '/../core/BaseModel.php';

class Product extends BaseModel {
    public function __construct() {
        parent::__construct('products');
    }

    public function findAllWithDetails(array $filters = []): array {
        // Traz categoria e a PRIMEIRA imagem (por sort_order) como thumbnail 'image_url'
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
            FROM {$this->table} p
            JOIN categories c ON p.category_id = c.id
        ";

        $where = [];
        $params = [];

        if (!empty($filters['category_id'])) {
            $where[] = "p.category_id = :category_id";
            $params['category_id'] = $filters['category_id'];
        }

        if (!empty($where)) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function findWithDetails(int $id): array|false {
        $product = $this->findById($id);
        if (!$product) return false;

        $product['category_name'] = $this->db->query("SELECT name FROM categories WHERE id = {$product['category_id']}")->fetchColumn();

        if ($product['category_name'] === 'Cortinas') {
            $stmt = $this->db->prepare("SELECT * FROM product_curtains WHERE product_id = :id");
            $stmt->execute(['id' => $id]);
            $product['details'] = $stmt->fetch();
        } elseif (in_array($product['category_name'], ['Almofadas', 'Pingentes'])) {
            $stmt = $this->db->prepare("SELECT * FROM product_cushions_pendants WHERE product_id = :id");
            $stmt->execute(['id' => $id]);
            $product['details'] = $stmt->fetch();
        }

        $stmt = $this->db->prepare("SELECT * FROM product_images WHERE product_id = :id ORDER BY sort_order");
        $stmt->execute(['id' => $id]);
        $product['images'] = $stmt->fetchAll();

        return $product;
    }

    public function createComplete(array $data): int {
        $this->db->beginTransaction();
        try {
            $sql = "INSERT INTO products (name, description, price, category_id, is_active) VALUES (:name, :description, :price, :category_id, :is_active)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'price' => $data['price'],
                'category_id' => $data['category_id'],
                'is_active' => $data['is_active'] ?? true
            ]);
            $productId = (int)$this->db->lastInsertId();

            $categoryName = $this->db->query("SELECT name FROM categories WHERE id = {$data['category_id']}")->fetchColumn();
            $details = $data['details'] ?? [];

            if ($categoryName === 'Cortinas') {
                $sqlDetails = "INSERT INTO product_curtains (product_id, rail_type, rail_color, rail_width, fabric_id_main, fabric_id_lining, fabric_id_voile) VALUES (:product_id, :rail_type, :rail_color, :rail_width, :fabric_id_main, :fabric_id_lining, :fabric_id_voile)";
                $stmtDetails = $this->db->prepare($sqlDetails);
                $stmtDetails->execute([
                    'product_id' => $productId,
                    'rail_type' => $details['rail_type'] ?? null,
                    'rail_color' => $details['rail_color'] ?? null,
                    'rail_width' => $details['rail_width'] ?? null,
                    'fabric_id_main' => $details['fabric_id_main'],
                    'fabric_id_lining' => $details['fabric_id_lining'] ?: null,
                    'fabric_id_voile' => $details['fabric_id_voile'] ?: null,
                ]);
            } elseif (in_array($categoryName, ['Almofadas', 'Pingentes'])) {
                $sqlDetails = "INSERT INTO product_cushions_pendants (product_id, color_id, height, width, stock_quantity) VALUES (:product_id, :color_id, :height, :width, :stock_quantity)";
                $stmtDetails = $this->db->prepare($sqlDetails);
                $stmtDetails->execute([
                    'product_id' => $productId,
                    'color_id' => $details['color_id'] ?: null,
                    'height' => $details['height'] ?? null,
                    'width' => $details['width'] ?? null,
                    'stock_quantity' => $details['stock_quantity'] ?? 0,
                ]);
            }

            $this->db->commit();
            return $productId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function updateComplete(int $id, array $data): bool {
        $this->db->beginTransaction();
        try {
            $product = $this->findById($id);
            if (!$product) throw new Exception("Produto não encontrado");

            $sql = "UPDATE products SET name=:name, description=:description, price=:price, category_id=:category_id, is_active=:is_active WHERE id=:id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'id' => $id,
                'name' => $data['name'] ?? $product['name'],
                'description' => $data['description'] ?? $product['description'],
                'price' => $data['price'] ?? $product['price'],
                'category_id' => $data['category_id'] ?? $product['category_id'],
                'is_active' => $data['is_active'] ?? $product['is_active']
            ]);

            $categoryName = $this->db->query("SELECT name FROM categories WHERE id = {$data['category_id']}")->fetchColumn();
            $details = $data['details'] ?? [];

            if ($categoryName === 'Cortinas' && !empty($details)) {
                $sqlDetails = "UPDATE product_curtains SET rail_type=:rail_type, rail_color=:rail_color, rail_width=:rail_width, fabric_id_main=:fabric_id_main, fabric_id_lining=:fabric_id_lining, fabric_id_voile=:fabric_id_voile WHERE product_id=:id";
                $stmtDetails = $this->db->prepare($sqlDetails);
                $stmtDetails->execute([
                    'id' => $id,
                    'rail_type' => $details['rail_type'] ?? null,
                    'rail_color' => $details['rail_color'] ?? null,
                    'rail_width' => $details['rail_width'] ?? null,
                    'fabric_id_main' => $details['fabric_id_main'],
                    'fabric_id_lining' => $details['fabric_id_lining'] ?: null,
                    'fabric_id_voile' => $details['fabric_id_voile'] ?: null,
                ]);
            } elseif (in_array($categoryName, ['Almofadas', 'Pingentes']) && !empty($details)) {
                 $sqlDetails = "UPDATE product_cushions_pendants SET color_id=:color_id, height=:height, width=:width, stock_quantity=:stock_quantity WHERE product_id=:id";
                 $stmtDetails = $this->db->prepare($sqlDetails);
                 $stmtDetails->execute([
                    'id' => $id,
                    'color_id' => $details['color_id'] ?: null,
                    'height' => $details['height'] ?? null,
                    'width' => $details['width'] ?? null,
                    'stock_quantity' => $details['stock_quantity'] ?? 0,
                 ]);
            }

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
