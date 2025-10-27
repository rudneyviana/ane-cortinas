<?php
require_once __DIR__ . '/../core/BaseModel.php';

class Order extends BaseModel {
    public function __construct() {
        parent::__construct('orders');
    }

    public function create(array $data): int {
        $this->db->beginTransaction();
        try {
            $sql = "INSERT INTO {$this->table} (customer_id, guest_customer_details, total_amount, status) VALUES (:customer_id, :guest_customer_details, :total_amount, :status)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'customer_id' => $data['customer_id'] ?? null,
                'guest_customer_details' => isset($data['guest_customer_details']) ? json_encode($data['guest_customer_details']) : null,
                'total_amount' => $data['total_amount'],
                'status' => $data['status'] ?? 'pending'
            ]);
            $orderId = (int)$this->db->lastInsertId();

            $itemSql = "INSERT INTO order_items (order_id, product_id, quantity, unit_price, item_details_json) VALUES (:order_id, :product_id, :quantity, :unit_price, :item_details_json)";
            $itemStmt = $this->db->prepare($itemSql);

            foreach ($data['items'] as $item) {
                $itemStmt->execute([
                    'order_id' => $orderId,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'item_details_json' => isset($item['item_details_json']) ? json_encode($item['item_details_json']) : null
                ]);
            }

            $this->db->commit();
            return $orderId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function update(int $id, array $data): bool {
        $sql = "UPDATE {$this->table} SET status = :status WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id, 'status' => $data['status']]);
    }

    public function findWithItems(int $id): array|false {
        $order = $this->findById($id);
        if (!$order) return false;

        $stmt = $this->db->prepare("SELECT oi.*, p.name as product_name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE order_id = :order_id");
        $stmt->execute(['order_id' => $id]);
        $order['items'] = $stmt->fetchAll();
        return $order;
    }

    public function findAllWithDetails(): array {
        $sql = "SELECT o.*, c.name as customer_name, c.email as customer_email FROM {$this->table} o LEFT JOIN customers c ON o.customer_id = c.id ORDER BY o.created_at DESC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }
}
