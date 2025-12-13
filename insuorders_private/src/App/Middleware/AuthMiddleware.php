<?php
namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Config\Config;
use Exception;

class AuthMiddleware {
    public static function verify($allowedRoles = []) {
        $token = null;
        $headers = null;

        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        }
        else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        }
        elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_change_key_case($requestHeaders, CASE_LOWER);
            if (isset($requestHeaders['authorization'])) {
                $headers = trim($requestHeaders['authorization']);
            }
        }

        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token && isset($_GET['token'])) {
            $token = $_GET['token'];
        }

        if (!$token) {
            self::response(401, "Token de acceso no proporcionado o inválido.");
        }

        try {
            $decoded = JWT::decode($token, new Key(Config::JWT_SECRET, Config::JWT_ALGO));
            if (!empty($allowedRoles)) {
                if (!in_array('Admin', $allowedRoles)) {
                    $allowedRoles[] = 'Admin';
                }

                $userRole = $decoded->data->rol;

                if (!in_array($userRole, $allowedRoles)) {
                    self::response(403, "Acceso Denegado: Rol insuficiente.");
                }
            }

            return $decoded->data->id;

        } catch (Exception $e) {
            self::response(401, "Sesión inválida: " . $e->getMessage());
        }
    }

    private static function response($code, $message) {
        http_response_code($code);
        echo json_encode(["success" => false, "message" => $message]);
        exit;
    }
}