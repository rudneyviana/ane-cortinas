<?php
require_once __DIR__ . '/../core/BaseModel.php';

class Customer extends BaseModel {
    public function __construct() {
        parent::__construct('customers');
    }

    public function create(array $data): int {
        $sql = "INSERT INTO {$this->table} (name, email, phone, address_line1, address_line2, city, state, zip_code) VALUES (:name, :email, :phone, :address_line1, :address_line2, :city, :state, :zip_code)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'address_line1' => $data['address_line1'] ?? null,
            'address_line2' => $data['address_line2'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'zip_code' => $data['zip_code'] ?? null
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $sql = "UPDATE {$this->table} SET name = :name, email = :email, phone = :phone, address_line1 = :address_line1, address_line2 = :address_line2, city = :city, state = :state, zip_code = :zip_code WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'id' => $id,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'address_line1' => $data['address_line1'] ?? null,
            'address_line2' => $data['address_line2'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'zip_code' => $data['zip_code'] ?? null
        ]);
    }
}
