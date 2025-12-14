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

        // 1. Intentar obtener el encabezado de varias fuentes posibles
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        }
        else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        }
        else if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) { // Fix para algunos servidores Apache
            $headers = trim($_SERVER["REDIRECT_HTTP_AUTHORIZATION"]);
        }
        elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            // Normalizar keys a minúsculas para evitar problemas de case-sensitivity
            $requestHeaders = array_change_key_case($requestHeaders, CASE_LOWER);
            if (isset($requestHeaders['authorization'])) {
                $headers = trim($requestHeaders['authorization']);
            }
        }

        // 2. Extraer el token del encabezado "Bearer"
        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                $token = $matches[1];
            }
        }

        // 3. Fallback: Intentar obtenerlo por GET (útil para pruebas o descargas)
        if (!$token && isset($_GET['token'])) {
            $token = $_GET['token'];
        }

        // 4. Validación Final
        if (!$token) {
            self::response(401, "Token de acceso no proporcionado o inválido.");
        }

        try {
            $decoded = JWT::decode($token, new Key(Config::JWT_SECRET, Config::JWT_ALGO));
            
            // Verificación de Roles
            if (!empty($allowedRoles)) {
                // Admin siempre tiene acceso
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
        header('Content-Type: application/json'); // Asegurar header JSON
        echo json_encode(["success" => false, "message" => $message]);
        exit;
    }
}