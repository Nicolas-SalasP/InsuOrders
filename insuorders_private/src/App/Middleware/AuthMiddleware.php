<?php
namespace App\Middleware;

use App\Config\Config;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class AuthMiddleware {
    public static function verify($allowedRoles = []) {
        $headers = null;
        
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        if (empty($headers) || !preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            self::response(401, "Token de acceso no proporcionado o inválido.");
        }

        $jwt = $matches[1];

        try {
            $decoded = JWT::decode($jwt, new Key(Config::JWT_SECRET, Config::JWT_ALGO));
            if (!empty($allowedRoles)) {
                if (!in_array('Admin', $allowedRoles)) {
                    $allowedRoles[] = 'Admin';
                }

                $userRole = $decoded->data->rol;

                if (!in_array($userRole, $allowedRoles)) {
                    self::response(403, "Acceso Denegado: Tu rol de '$userRole' no tiene permisos para esta acción.");
                }
            }

            return $decoded->data->id;

        } catch (Exception $e) {
            self::response(401, "Sesión inválida: " . $e->getMessage());
        }
    }

    private static function response($code, $msg) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode(["success" => false, "message" => $msg]);
        exit();
    }
}