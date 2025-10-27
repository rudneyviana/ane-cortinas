<?php
require_once __DIR__ . '/../core/BaseModel.php';

class User extends BaseModel {
    public function __construct() {
        parent::__construct('users');
    }

    public function findByEmail(string $email): array|false {
        try {
            $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE email = :email");
            $stmt->execute(['email' => $email]);
            $result = $stmt->fetch();
            error_log('findByEmail - Email: ' . $email . ' - Resultado: ' . ($result ? 'encontrado' : 'não encontrado'));
            error_log('findByEmail - SQL: ' . $stmt->queryString);
            error_log('findByEmail - Params: ' . json_encode(['email' => $email]));
            return $result;
        } catch (PDOException $e) {
            error_log('findByEmail - Error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function create(array $data): int {
        try {
            error_log('User::create - Dados recebidos: ' . json_encode($data));
            
            $stmt = $this->db->prepare("INSERT INTO {$this->table} (name, email, password_hash, role) VALUES (:name, :email, :password_hash, :role)");
            $result = $stmt->execute([
                'name' => $data['name'],
                'email' => $data['email'],
                'password_hash' => $data['password'],
                'role' => $data['role'] ?? 'CUSTOMER'
            ]);
            
            if (!$result) {
                error_log('User::create - Erro ao executar insert');
                throw new Exception('Erro ao criar usuário');
            }
            
            $id = (int)$this->db->lastInsertId();
            error_log('User::create - Usuário criado com ID: ' . $id);
            return $id;
        } catch (Exception $e) {
            error_log('User::create - Erro: ' . $e->getMessage());
            throw $e;
        }
    }
}
