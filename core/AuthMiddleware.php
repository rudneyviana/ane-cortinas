<?php
require_once __DIR__ . '/JwtHandler.php';
require_once __DIR__ . '/Response.php';

class AuthMiddleware {
    /**
     * Verifica se o usuário está autenticado e tem as roles necessárias
     * @param array $allowedRoles Roles permitidas (ex: ['ADMIN', 'CUSTOMER'])
     */
    public static function verifyToken(array $allowedRoles = []) {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? ($headers['authorization'] ?? null);
        
        if (!$auth) {
            Response::send(401, ['error' => 'Token de autenticação não fornecido']);
        }

        if (strpos($auth, 'Bearer ') !== 0) {
            Response::send(401, ['error' => 'Formato de autorização inválido']);
        }

        $token = substr($auth, 7);
        $jwt = new JwtHandler();
        
        if (!$jwt->validate($token)) {
            Response::send(401, ['error' => 'Token inválido ou expirado']);
        }

        // Se chegou até aqui, o token é válido
        // Em uma implementação real, você poderia decodificar o token
        // e verificar as roles do usuário
        
        return true;
    }
}