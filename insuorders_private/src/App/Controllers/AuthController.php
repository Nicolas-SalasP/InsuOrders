<?php
namespace App\Controllers;

use App\Repositories\UsuariosRepository;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Database\Database;
use App\Config\Config;

class AuthController
{
    private $repository;
    private $db;

    // A4: límites de intentos de login fallidos por IP
    private const LOGIN_MAX_FAILS = 8;
    private const LOGIN_WINDOW = 900; // 15 minutos

    public function __construct()
    {
        $this->repository = new UsuariosRepository();
        $this->db = Database::getConnection();
    }

    private function throttleFile()
    {
        return sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'insuorders_login_throttle.json';
    }

    /** ¿La IP superó el máximo de fallos dentro de la ventana? (fail-open) */
    private function loginIsBlocked($ip)
    {
        try {
            $file = $this->throttleFile();
            if (!is_file($file)) return false;
            $raw = @file_get_contents($file);
            $store = $raw ? json_decode($raw, true) : [];
            if (!is_array($store) || empty($store[$ip]) || !is_array($store[$ip])) return false;
            $now = time();
            $recientes = array_filter($store[$ip], fn($t) => ($now - (int) $t) < self::LOGIN_WINDOW);
            return count($recientes) >= self::LOGIN_MAX_FAILS;
        } catch (\Throwable $e) {
            return false; // nunca bloquear por un problema de almacenamiento
        }
    }

    /** Registra un intento fallido y poda entradas viejas. (best-effort) */
    private function registrarFalloLogin($ip)
    {
        try {
            $fp = @fopen($this->throttleFile(), 'c+');
            if (!$fp) return;
            @flock($fp, LOCK_EX);
            $raw = stream_get_contents($fp);
            $store = $raw ? json_decode($raw, true) : [];
            if (!is_array($store)) $store = [];
            $now = time();
            foreach ($store as $k => $items) {
                $store[$k] = array_values(array_filter((array) $items, fn($t) => ($now - (int) $t) < self::LOGIN_WINDOW));
                if (empty($store[$k])) unset($store[$k]);
            }
            $store[$ip][] = $now;
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, json_encode($store));
            @flock($fp, LOCK_UN);
            fclose($fp);
        } catch (\Throwable $e) {
            // throttling best-effort: ignorar errores de escritura
        }
    }

    /** Limpia los fallos de una IP tras un login exitoso. */
    private function limpiarFallosLogin($ip)
    {
        try {
            $file = $this->throttleFile();
            if (!is_file($file)) return;
            $fp = @fopen($file, 'c+');
            if (!$fp) return;
            @flock($fp, LOCK_EX);
            $raw = stream_get_contents($fp);
            $store = $raw ? json_decode($raw, true) : [];
            if (is_array($store) && isset($store[$ip])) {
                unset($store[$ip]);
                ftruncate($fp, 0);
                rewind($fp);
                fwrite($fp, json_encode($store));
            }
            @flock($fp, LOCK_UN);
            fclose($fp);
        } catch (\Throwable $e) {
        }
    }

    public function login()
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

        // A4 fix: cortar fuerza bruta tras demasiados fallos desde la misma IP
        if ($this->loginIsBlocked($ip)) {
            http_response_code(429);
            echo json_encode(["success" => false, "message" => "Demasiados intentos fallidos. Espera unos minutos e inténtalo nuevamente."]);
            return;
        }

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->username) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Datos incompletos"]);
            return;
        }

        $user = $this->repository->findByUsername($data->username);

        if ($user && password_verify($data->password, $user['password_hash'])) {

            $this->limpiarFallosLogin($ip);

            $stmt = $this->db->prepare("
                SELECT p.codigo 
                FROM permisos p 
                INNER JOIN usuario_permisos up ON p.id = up.permiso_id 
                WHERE up.usuario_id = :uid
            ");
            $stmt->execute([':uid' => $user['id']]);
            $permisos = $stmt->fetchAll(\PDO::FETCH_COLUMN);

            $time = time();

            $tokenPayload = [
                "iss" => "insuorders",
                "aud" => "insuorders_users",
                "iat" => $time,
                "nbf" => $time - 10,
                "exp" => $time + Config::JWT_EXP,
                "data" => [
                    "id" => $user['id'],
                    "nombre" => $user['nombre'],
                    "username" => $user['username'],
                    "rol_id" => $user['rol_id'],
                    "rol" => $user['rol_nombre']
                ]
            ];

            $jwt = JWT::encode($tokenPayload, Config::getJwtSecret(), Config::JWT_ALGO);

            // A1 fix: cookie endurecida — Secure cuando hay HTTPS, SameSite=Strict
            $isHttps = (
                !empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off'
            ) || (
                ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'
            );
            setcookie(
                "jwt_token",
                $jwt,
                [
                    'expires'  => $time + Config::JWT_EXP,
                    'path'     => '/',
                    'httponly' => true,
                    'secure'   => $isHttps,
                    'samesite' => 'Strict'
                ]
            );

            // A1 fix: no devolvemos el token en JSON. La cookie HttpOnly basta.
            echo json_encode([
                "success" => true,
                "message" => "Login exitoso",
                "user" => [
                    "id"       => $user['id'],
                    "nombre"   => $user['nombre'],
                    "rol"      => $user['rol_nombre'],
                    "permisos" => $permisos
                ]
            ]);
        } else {
            // A4 fix: registrar el intento fallido (throttle por IP + auditoría en error_log)
            $this->registrarFalloLogin($ip);
            $intento = (is_object($data) && isset($data->username)) ? $data->username : '?';
            error_log(sprintf('[LOGIN_FAIL] ip=%s username=%s', $ip, $intento));
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Credenciales inválidas"]);
        }
    }

    public function me()
    {
        $jwt = $_COOKIE['jwt_token'] ?? null;
        if (!$jwt) {
            $headers = apache_request_headers();
            if (isset($headers['Authorization'])) {
                list($jwt) = sscanf($headers['Authorization'], 'Bearer %s');
            }
        }

        if (!$jwt) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "No autorizado"]);
            return;
        }

        try {
            $decoded = JWT::decode($jwt, new Key(Config::getJwtSecret(), Config::JWT_ALGO));
            $userId = $decoded->data->id;

            $stmt = $this->db->prepare("
                SELECT p.codigo 
                FROM permisos p 
                INNER JOIN usuario_permisos up ON p.id = up.permiso_id 
                WHERE up.usuario_id = :uid
            ");
            $stmt->execute([':uid' => $userId]);
            $permisos = $stmt->fetchAll(\PDO::FETCH_COLUMN);

            $stmtUser = $this->db->prepare("
                SELECT u.nombre, r.nombre as rol_nombre
                FROM usuarios u
                JOIN roles r ON u.rol_id = r.id
                WHERE u.id = :uid AND u.activo = 1
            ");
            $stmtUser->execute([':uid' => $userId]);
            $userData = $stmtUser->fetch(\PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => $userId,
                    "nombre" => $userData['nombre'],
                    "rol" => $userData['rol_nombre'],
                    "permisos" => $permisos
                ]
            ]);

        } catch (\Exception $e) {
            http_response_code(401);
        }
    }

    public function logout()
    {
        setcookie("jwt_token", "", time() - 3600, "/");
        echo json_encode(["success" => true, "message" => "Sesión cerrada"]);
    }
}