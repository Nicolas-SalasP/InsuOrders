<?php
namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Database\Database;
use App\Config\Config;

class AuthMiddleware
{
    public static function verify($allowedRoles = [])
    {
        // -----------------------------------------------------------
        // 1. OBTENCIÓN ROBUSTA DEL HEADER (A prueba de balas)
        // -----------------------------------------------------------
        $authHeader = null;
        if (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            
            if (isset($requestHeaders['Authorization'])) {
                $authHeader = $requestHeaders['Authorization'];
            }
        }

        if (!$authHeader) {
            if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            }
        }

        // -----------------------------------------------------------
        // 2. VALIDACIÓN DEL HEADER
        // -----------------------------------------------------------
        if (!$authHeader) {
            self::jsonResponse(401, ["error" => "Acceso denegado. Token no encontrado en la petición."]);
        }
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            self::jsonResponse(401, ["error" => "Acceso denegado. Formato de token inválido (Se espera: Bearer <token>)."]);
        }

        $jwt = $matches[1];

        // -----------------------------------------------------------
        // 3. DECODIFICACIÓN Y AUTORIZACIÓN
        // -----------------------------------------------------------
        try {
            $decoded = JWT::decode($jwt, new Key(Config::JWT_SECRET, Config::JWT_ALGO));
            
            if (empty($allowedRoles)) {
                return $decoded->data->id;
            }

            if (!in_array($decoded->data->rol, $allowedRoles)) {
                self::jsonResponse(403, ["error" => "No tienes permiso para acceder a este recurso."]);
            }

            return $decoded->data->id;

        } catch (\Exception $e) {
            self::jsonResponse(401, ["error" => "Acceso denegado. Token inválido o expirado.", "details" => $e->getMessage()]);
        }
    }

    public static function hasPermission($permisoRequerido)
    {
        $userId = self::verify([]); 

        $db = Database::getConnection();
        
        $stmtRole = $db->prepare("SELECT rol_id FROM usuarios WHERE id = :uid");
        $stmtRole->execute([':uid' => $userId]);
        
        if ($stmtRole->fetchColumn() == 1) return $userId; 

        $sql = "SELECT count(*) FROM usuario_permisos up 
                JOIN permisos p ON up.permiso_id = p.id 
                WHERE up.usuario_id = :uid AND p.codigo = :code";
                
        $stmt = $db->prepare($sql);
        $stmt->execute([':uid' => $userId, ':code' => $permisoRequerido]);
        
        if ($stmt->fetchColumn() > 0) {
            return $userId;
        } else {
            self::jsonResponse(403, ["error" => "Permisos insuficientes. Se requiere: $permisoRequerido"]);
        }
    }

    private static function jsonResponse($code, $data)
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}