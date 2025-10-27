<?php
class Response {
    public static function json($data, $status = 200) {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
            http_response_code($status);
        }
        if ($status !== 204) {
            error_log('Response - Status: ' . $status . ' - Data: ' . json_encode($data));
            echo json_encode($data);
        }
        exit;
    }

    // Compatibilidade com a API do documento (send)
    public static function send(int $status = 200, ?array $data = []) {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code($status);
        }
        if ($status !== 204 && $data !== null) {
            echo json_encode($data);
        }
        exit;
    }
}
