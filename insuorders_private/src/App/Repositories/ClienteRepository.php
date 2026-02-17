<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;

class ClienteRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function crearSolicitud($data)
    {
        $sql = "INSERT INTO solicitudes_ot (
                    usuario_solicitante_id, 
                    activo_id, 
                    titulo, 
                    descripcion_trabajo, 
                    prioridad, 
                    estado_id, 
                    fecha_solicitud, 
                    imagen_url
                ) VALUES (
                    :uid, 
                    :activo, 
                    :titulo, 
                    :desc, 
                    :prio, 
                    1, 
                    NOW(), 
                    :img
                )";
        
        $stmt = $this->db->prepare($sql);
        
        $stmt->execute([
            ':uid' => $data['usuario_id'],
            ':activo' => $data['activo_id'], 
            ':titulo' => $data['titulo'],
            ':desc' => $data['descripcion'],
            ':prio' => $data['prioridad'],
            ':img' => $data['imagen_url']
        ]);

        return $this->db->lastInsertId();
    }

    public function getMisSolicitudes($usuarioId)
    {
        $sql = "SELECT 
                    s.id, 
                    s.fecha_solicitud, 
                    s.titulo, 
                    s.descripcion_trabajo as descripcion, 
                    s.prioridad, 
                    s.imagen_url,
                    s.activo_id,
                    e.nombre as estado,
                    e.id as estado_id,
                    a.nombre as activo_nombre,
                    CONCAT(t.nombre, ' ', t.apellido) as tecnico_asignado
                FROM solicitudes_ot s
                JOIN estados_solicitud e ON s.estado_id = e.id
                LEFT JOIN activos a ON s.activo_id = a.id
                LEFT JOIN usuarios t ON s.asignado_a = t.id
                WHERE s.usuario_solicitante_id = :uid
                ORDER BY s.fecha_solicitud DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':uid' => $usuarioId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getActivosDisponibles()
    {
        $sql = "SELECT id, nombre, codigo_maquina FROM activos ORDER BY nombre ASC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getEmailUsuario($id)
    {
        $stmt = $this->db->prepare("SELECT email, nombre FROM usuarios WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getEmailsPorRol($nombreRol)
    {
        $sql = "SELECT u.email, u.nombre 
                FROM usuarios u 
                JOIN roles r ON u.rol_id = r.id 
                WHERE r.nombre = :rol AND u.estado = 1";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':rol' => $nombreRol]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}