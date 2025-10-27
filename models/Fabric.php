<?php
require_once __DIR__ . '/../core/BaseModel.php';

class Fabric extends BaseModel {
    public function __construct() {
        parent::__construct('fabrics');
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare(
            "INSERT INTO {$this->table} (name, width, height, color_id, image_url, stock_quantity_sqm) VALUES (:name, :width, :height, :color_id, :image_url, :stock_quantity_sqm)"
        );
        $stmt->execute([
            'name' => $data['name'],
            'width' => $data['width'],
            'height' => $data['height'],
            'color_id' => $data['color_id'] ?: null,
            'image_url' => $data['image_url'] ?? null,
            'stock_quantity_sqm' => $data['stock_quantity_sqm']
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $setClauses = [];
        $params = ['id' => $id];

        foreach ($data as $key => $value) {
            $allowedFields = ['name', 'width', 'height', 'color_id', 'image_url', 'stock_quantity_sqm'];
            if (in_array($key, $allowedFields)) {
                $setClauses[] = "$key = :$key";
                $params[$key] = ($key === 'color_id' && $value === '') ? null : $value;
            }
        }

        if (empty($setClauses)) return false;

        $sql = "UPDATE {$this->table} SET " . implode(', ', $setClauses) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }
}
