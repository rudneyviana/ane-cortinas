<?php
require_once __DIR__ . '/../core/BaseModel.php';

class Category extends BaseModel {
    public function __construct() {
        parent::__construct('categories');
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare("INSERT INTO {$this->table} (name) VALUES (:name)");
        $stmt->execute(['name' => $data['name']]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $stmt = $this->db->prepare("UPDATE {$this->table} SET name = :name WHERE id = :id");
        return $stmt->execute(['id' => $id, 'name' => $data['name']]);
    }
}
