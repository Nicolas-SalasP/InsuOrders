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
        $authHeader = self::getAuthHeader();

        if (!$authHeader) {
            self::jsonResponse(401, ["error" => "Acceso denegado. Token no proporcionado."]);
        }

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            self::jsonResponse(401, ["error" => "Acceso denegado. Formato de token inválido."]);
        }

        $jwt = $matches[1];

        try {
            $decoded = JWT::decode($jwt, new Key(Config::JWT_SECRET, Config::JWT_ALGO));

            if (($decoded->data->rol ?? '') === 'Admin' || ($decoded->data->rol_id ?? 0) == 1) {
                return $decoded->data->id;
            }

            if (!empty($allowedRoles)) {
                if (!in_array($decoded->data->rol, $allowedRoles)) {
                    self::jsonResponse(403, ["error" => "No tienes el rol necesario para acceder."]);
                }
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
        if ($stmtRole->fetchColumn() == 1)
            return $userId;

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

    public static function checkPermissionSilently($permisoRequerido)
    {
        $authHeader = self::getAuthHeader();
        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return false;
        }

        try {
            $decoded = JWT::decode($matches[1], new Key(Config::JWT_SECRET, Config::JWT_ALGO));
            $userId = $decoded->data->id;

            if (($decoded->data->rol ?? '') === 'Admin' || ($decoded->data->rol_id ?? 0) == 1) {
                return true;
            }

            $db = Database::getConnection();
            $sql = "SELECT count(*) FROM usuario_permisos up 
                    JOIN permisos p ON up.permiso_id = p.id 
                    WHERE up.usuario_id = :uid AND p.codigo = :code";

            $stmt = $db->prepare($sql);
            $stmt->execute([':uid' => $userId, ':code' => $permisoRequerido]);

            return $stmt->fetchColumn() > 0;

        } catch (\Exception $e) {
            return false;
        }
    }

    private static function getAuthHeader()
    {
        if (isset($_SERVER['HTTP_AUTHORIZATION']))
            return $_SERVER['HTTP_AUTHORIZATION'];
        if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']))
            return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            if (isset($headers['Authorization']))
                return $headers['Authorization'];
        }
        return null;
    }

    private static function jsonResponse($code, $data)
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}