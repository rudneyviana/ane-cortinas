<?php
// core/Database.php

class Database {
    private static ?PDO $instance = null;

    // O construtor é privado para evitar criação direta de instâncias.
    private function __construct() {}

    // O método clone é privado para evitar clonagem da instância.
    private function __clone() {}

    /**
     * Retorna a única instância da conexão PDO.
     *
     * @return PDO A instância da conexão PDO.
     */
    public static function getInstance(): PDO {
        if (self::$instance === null) {
            // Carrega as configurações do banco de dados
            require_once __DIR__ . '/../config/database.php';

            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Falha na conexão com o banco de dados.', 'details' => $e->getMessage()]);
                exit;
            }
        }
        return self::$instance;
    }
}
