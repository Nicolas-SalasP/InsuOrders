<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;

class UsuariosRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll()
    {
        $sql = "SELECT u.id, u.nombre, u.apellido, u.username, u.email, u.telefono, u.activo,
                    r.nombre as rol, r.id as rol_id
                FROM usuarios u
                JOIN roles r ON u.rol_id = r.id
                ORDER BY u.nombre ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRoles()
    {
        return $this->db->query("SELECT * FROM roles")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $check = $this->db->prepare("SELECT id FROM usuarios WHERE username = :u OR email = :e");
        $check->execute([':u' => $data['username'], ':e' => $data['email']]);
        if ($check->fetch())
            throw new \Exception("El usuario o email ya existe.");

        $sql = "INSERT INTO usuarios (nombre, apellido, username, password_hash, email, telefono, rol_id, activo) 
                VALUES (:nom, :ape, :user, :pass, :email, :tel, :rol, 1)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':nom' => $data['nombre'],
            ':ape' => $data['apellido'],
            ':user' => $data['username'],
            ':pass' => password_hash($data['password'], PASSWORD_DEFAULT),
            ':email' => $data['email'],
            ':tel' => $data['telefono'] ?? null,
            ':rol' => $data['rol_id']
        ]);
        return $this->db->lastInsertId();
    }

    public function update($id, $data)
    {
        $sqlPass = !empty($data['password']) ? ", password_hash = :pass" : "";

        $sql = "UPDATE usuarios SET 
                nombre = :nom, apellido = :ape, email = :email, 
                telefono = :tel, rol_id = :rol $sqlPass
                WHERE id = :id";

        $params = [
            ':nom' => $data['nombre'],
            ':ape' => $data['apellido'],
            ':email' => $data['email'],
            ':tel' => $data['telefono'] ?? null,
            ':rol' => $data['rol_id'],
            ':id' => $id
        ];

        if (!empty($data['password'])) {
            $params[':pass'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        $this->db->prepare($sql)->execute($params);
    }

    public function toggleActivo($id)
    {
        $stmt = $this->db->prepare("UPDATE usuarios SET activo = NOT activo WHERE id = :id");
        $stmt->execute([':id' => $id]);
    }

    public function findByUsername($username)
    {
        $sql = "SELECT u.*, r.nombre as rol_nombre 
                FROM usuarios u 
                INNER JOIN roles r ON u.rol_id = r.id 
                WHERE u.username = :username 
                AND u.activo = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':username' => $username]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}