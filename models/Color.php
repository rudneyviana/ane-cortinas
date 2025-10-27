<?php
require_once __DIR__ . '/../core/BaseModel.php';

class Color extends BaseModel {
    public function __construct() {
        parent::__construct('colors');
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare(
            "INSERT INTO {$this->table} (name, hex_code, photo_url) VALUES (:name, :hex_code, :photo_url)"
        );
        $stmt->execute([
            'name' => $data['name'],
            'hex_code' => $data['hex_code'],
            'photo_url' => $data['photo_url'] ?? null
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $stmt = $this->db->prepare(
            "UPDATE {$this->table} SET name = :name, hex_code = :hex_code, photo_url = :photo_url WHERE id = :id"
        );
        return $stmt->execute([
            'id' => $id,
            'name' => $data['name'],
            'hex_code' => $data['hex_code'],
            'photo_url' => $data['photo_url'] ?? null
        ]);
    }
}
