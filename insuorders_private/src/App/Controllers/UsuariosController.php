<?php
namespace App\Controllers;

use App\Repositories\UsuariosRepository;
use App\Middleware\AuthMiddleware;
use App\Database\Database;

class UsuariosController
{
    private $repo;

    public function __construct()
    {
        $this->repo = new UsuariosRepository();
    }

    public function index()
    {
        echo json_encode(["success" => true, "data" => $this->repo->getAll()]);
    }

    public function roles()
    {
        echo json_encode(["success" => true, "data" => $this->repo->getRoles()]);
    }

    public function store()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            if (empty($data['password']))
                throw new \Exception("La contraseña es obligatoria.");
            $this->repo->create($data);
            echo json_encode(["success" => true, "message" => "Usuario creado exitosamente."]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function update()
    {
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            if (!$id)
                throw new \Exception("Falta ID");
            $this->repo->update($id, $data);
            echo json_encode(["success" => true, "message" => "Usuario actualizado."]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function toggle()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            if (empty($data['id']))
                throw new \Exception("Falta ID");
            $this->repo->toggleActivo($data['id']);
            echo json_encode(["success" => true, "message" => "Estado cambiado."]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function listarPermisos() {
        try {
            $db = Database::getConnection();
            $stmt = $db->query("SELECT * FROM permisos ORDER BY modulo, descripcion");
            $permisos = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $permisos]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function obtenerPermisosUsuario() {
        $id = $_GET['id'] ?? null;
        if(!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de usuario requerido']);
            return;
        }

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("
                SELECT p.id, p.codigo, p.descripcion 
                FROM permisos p
                INNER JOIN usuario_permisos up ON p.id = up.permiso_id
                WHERE up.usuario_id = :uid
            ");
            $stmt->execute([':uid' => $id]);
            $asignados = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $asignados]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function actualizarPermisos() {
        $data = json_decode(file_get_contents("php://input"), true);
        $usuarioId = $data['usuario_id'] ?? null;
        $permisosIds = $data['permisos'] ?? [];

        if (!$usuarioId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de usuario requerido']);
            return;
        }

        $db = Database::getConnection();
        
        try {
            $db->beginTransaction();

            $stmt = $db->prepare("DELETE FROM usuario_permisos WHERE usuario_id = :uid");
            $stmt->execute([':uid' => $usuarioId]);

            if (!empty($permisosIds)) {
                $sql = "INSERT INTO usuario_permisos (usuario_id, permiso_id) VALUES (:uid, :pid)";
                $stmt = $db->prepare($sql);
                foreach ($permisosIds as $permisoId) {
                    $stmt->execute([':uid' => $usuarioId, ':pid' => $permisoId]);
                }
            }

            $db->commit();
            echo json_encode(['success' => true, 'message' => 'Permisos actualizados correctamente']);

        } catch (\Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al guardar: ' . $e->getMessage()]);
        }
    }

    public function getTecnicos()
    {
        try {
            AuthMiddleware::verify();
            $data = $this->repo->getByRolNombre('Tecnico'); 
            if (empty($data)) {
                $data = $this->repo->getByRolNombre('Técnico');
            }

            echo json_encode(["success" => true, "data" => $data]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}