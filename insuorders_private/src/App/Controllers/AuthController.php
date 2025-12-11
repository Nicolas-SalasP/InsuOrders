<?php
namespace App\Controllers;

use App\Database\Database;
use App\Config\Config;
use Firebase\JWT\JWT;
use PDO;

class AuthController {
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function login() {
        $json = file_get_contents("php://input");
        $data = json_decode($json);

        if (!isset($data->username) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan credenciales"]);
            return;
        }

        $stmt = $this->db->prepare("SELECT u.*, r.nombre as rol_nombre 
                                    FROM usuarios u 
                                    JOIN roles r ON u.rol_id = r.id 
                                    WHERE u.username = :u AND u.activo = 1 LIMIT 1");
        $stmt->bindParam(":u", $data->username);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($data->password, $user['password_hash'])) {

            $issuedAt = time();
            $expirationTime = $issuedAt + Config::JWT_EXP; 
            
            $payload = [
                'iss' => 'insuorders.system',
                'aud' => 'insuorders_users',
                'iat' => $issuedAt,
                'exp' => $expirationTime,
                'data' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'rol' => $user['rol_nombre']
                ]
            ];

            $jwt = JWT::encode($payload, Config::JWT_SECRET, Config::JWT_ALGO);

            echo json_encode([
                "success" => true,
                "message" => "Bienvenido " . $user['nombre'],
                "token" => $jwt,
                "user" => [
                    "id" => $user['id'],
                    "nombre" => $user['nombre'],
                    "apellido" => $user['apellido'],
                    "rol" => $user['rol_nombre'],
                    "email" => $user['email']
                ]
            ]);
        } else {
            usleep(200000);
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Credenciales incorrectas o cuenta inactiva"]);
        }
    }
}