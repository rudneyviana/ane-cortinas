<?php
class Request {
    /**
     * Retorna o método HTTP da requisição
     */
    public static function getMethod(): string {
        return $_SERVER['REQUEST_METHOD'] ?? 'GET';
    }

    /**
     * Retorna o corpo da requisição (JSON ou POST)
     */
    public static function getBody(): array {
        $input = file_get_contents('php://input');
        $json = json_decode($input, true);
        
        if ($json !== null) {
            return $json;
        }
        
        return $_POST ?? [];
    }

    /**
     * Retorna os parâmetros da query string
     */
    public static function getQuery(): array {
        return $_GET ?? [];
    }

    /**
     * Retorna um parâmetro específico da query string
     */
    public static function getQueryParam(string $key, $default = null) {
        return $_GET[$key] ?? $default;
    }

    /**
     * Retorna os arquivos enviados
     */
    public static function getFiles(): array {
        return $_FILES ?? [];
    }

    /**
     * Retorna os headers da requisição
     */
    public static function getHeaders(): array {
        return getallheaders() ?: [];
    }
}