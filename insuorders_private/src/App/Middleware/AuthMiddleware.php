<?php
namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Database\Database;
use App\Config\Config;

class AuthMiddleware
{
    private static $currentUser = null;

    public static function verify($requirement = null)
    {
        $jwt = $_COOKIE['jwt_token'] ?? null;

        if (!$jwt) {
            $authHeader = self::getAuthHeader();

            if (!$authHeader) {
                self::jsonResponse(401, ["error" => "Acceso denegado. Token no proporcionado."]);
            }

            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                self::jsonResponse(401, ["error" => "Acceso denegado. Formato de token inválido."]);
            }

            $jwt = $matches[1];
        }

        try {
            $decoded = JWT::decode($jwt, new Key(Config::getJwtSecret(), Config::JWT_ALGO));
            $data = $decoded->data;
            $userId = $data->id;
            
            self::$currentUser = $data;

            // C5 fix: solo comprobamos el nombre del rol, no el id numérico
            if (($data->rol ?? '') === 'Admin') {
                return $userId;
            }

            if (!empty($requirement)) {
                
                if (is_string($requirement)) {
                    if (!self::checkDbPermission($userId, $requirement)) {
                        self::jsonResponse(403, ["error" => "Permisos insuficientes."]);
                    }
                }
                
                elseif (is_array($requirement)) {
                    if (!in_array($data->rol, $requirement)) {
                        self::jsonResponse(403, ["error" => "No tienes el rol necesario para acceder."]);
                    }
                }
            }

            return $userId;

        } catch (\Exception $e) {
            // C4 fix: no exponer detalles del error al cliente
            error_log('[Auth] Token error: ' . $e->getMessage());
            self::jsonResponse(401, ["error" => "Acceso denegado. Token inválido o expirado."]);
        }
    }

    public static function getUser()
    {
        return self::$currentUser;
    }

    private static function checkDbPermission($userId, $permisoCodigo)
    {
        $db = Database::getConnection();
        
        $sql = "SELECT count(*) FROM usuario_permisos up 
                JOIN permisos p ON up.permiso_id = p.id 
                WHERE up.usuario_id = :uid AND p.codigo = :code";

        $stmt = $db->prepare($sql);
        $stmt->execute([':uid' => $userId, ':code' => $permisoCodigo]);

        return $stmt->fetchColumn() > 0;
    }

    public static function hasPermission($permisoRequerido)
    {
        return self::verify($permisoRequerido);
    }

    public static function checkPermissionSilently($permisoRequerido)
    {
        $jwt = $_COOKIE['jwt_token'] ?? null;

        if (!$jwt) {
            $authHeader = self::getAuthHeader();
            if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                return false;
            }
            $jwt = $matches[1];
        }

        try {
            $decoded = JWT::decode($jwt, new Key(Config::getJwtSecret(), Config::JWT_ALGO));
            
            // C5 fix: solo comprobamos el nombre del rol
            if (($decoded->data->rol ?? '') === 'Admin') {
                return true;
            }

            return self::checkDbPermission($decoded->data->id, $permisoRequerido);

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