<?php
namespace App\Controllers;

use App\Database\Database;
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
            echo json_encode(["success" => false, "message" => "Faltan datos"]);
            return;
        }

        $username = $data->username;
        $password = $data->password;

        $stmt = $this->db->prepare("SELECT u.*, r.nombre as rol_nombre 
                                    FROM usuarios u 
                                    JOIN roles r ON u.rol_id = r.id 
                                    WHERE u.username = :u LIMIT 1");
        $stmt->bindParam(":u", $username);
        $stmt->execute();
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            
            // Opcional: Iniciar sesión PHP si no usas JWT aún
            // session_start();
            // $_SESSION['user_id'] = $user['id'];

            echo json_encode([
                "success" => true,
                "message" => "Bienvenido " . $user['nombre'],
                "token" => "token_falso_por_ahora_12345",
                "user" => [
                    "id" => $user['id'],
                    "nombre" => $user['nombre'],
                    "rol" => $user['rol_nombre']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Usuario o contraseña incorrectos"]);
        }
    }
}