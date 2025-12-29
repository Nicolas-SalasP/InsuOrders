<?php
namespace App\Controllers;

use App\Repositories\UsuariosRepository;
use Firebase\JWT\JWT;
use App\Database\Database;
use App\Config\Config;

class AuthController
{
    private $repository;
    private $db;

    public function __construct()
    {
        $this->repository = new UsuariosRepository();
        $this->db = Database::getConnection();
    }

    public function login()
    {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->username) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Datos incompletos"]);
            return;
        }

        $user = $this->repository->findByUsername($data->username);

        if ($user && password_verify($data->password, $user['password_hash'])) {
            
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

            $jwt = JWT::encode($tokenPayload, Config::JWT_SECRET, Config::JWT_ALGO);

            echo json_encode([
                "success" => true,
                "message" => "Login exitoso",
                "token" => $jwt,
                "user" => [
                    "id" => $user['id'],
                    "nombre" => $user['nombre'],
                    "rol" => $user['rol_nombre'],
                    "permisos" => $permisos
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Credenciales inválidas"]);
        }
    }

    public function me()
    {
        $headers = apache_request_headers();
        if (!isset($headers['Authorization'])) {
            http_response_code(401);
            return;
        }
        list($jwt) = sscanf($headers['Authorization'], 'Bearer %s');
        
        try {
            $decoded = JWT::decode($jwt, new Key(Config::JWT_SECRET, Config::JWT_ALGO));
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
                WHERE u.id = :uid
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
}