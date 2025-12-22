<?php
namespace App\Controllers;

use App\Database\Database;
use PDO;

class MantenedoresController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // =========================================================
    // EMPLEADOS (Tiene campo 'activo')
    // =========================================================
    public function getEmpleados()
    {
        $sql = "SELECT e.*, c.codigo as cc_codigo, c.nombre as cc_nombre 
                FROM empleados e 
                LEFT JOIN centros_costo c ON e.centro_costo_id = c.id 
                ORDER BY e.nombre_completo ASC";
        echo json_encode(["success" => true, "data" => $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function saveEmpleado()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            // Validar campos obligatorios
            if (empty($data['rut']) || empty($data['nombre_completo']) || empty($data['centro_costo_id'])) {
                throw new \Exception("Faltan datos obligatorios (RUT, Nombre, Centro Costo)");
            }

            if (!empty($data['id'])) {
                $sql = "UPDATE empleados SET rut=:rut, nombre_completo=:nom, centro_costo_id=:cc, activo=:act WHERE id=:id";
                $this->db->prepare($sql)->execute([
                    ':rut' => $data['rut'], 
                    ':nom' => $data['nombre_completo'], 
                    ':cc' => $data['centro_costo_id'], 
                    ':act' => isset($data['activo']) ? $data['activo'] : 1, 
                    ':id' => $data['id']
                ]);
            } else {
                $sql = "INSERT INTO empleados (rut, nombre_completo, centro_costo_id, activo) VALUES (:rut, :nom, :cc, :act)";
                $this->db->prepare($sql)->execute([
                    ':rut' => $data['rut'], 
                    ':nom' => $data['nombre_completo'], 
                    ':cc' => $data['centro_costo_id'], 
                    ':act' => isset($data['activo']) ? $data['activo'] : 1
                ]);
            }
            echo json_encode(["success" => true]);
        } catch (\Exception $e) {
            http_response_code(500); echo json_encode(["error" => $e->getMessage()]);
        }
    }

    public function deleteEmpleado()
    {
        // Como tienes historial en movimientos_inventario, lo mejor es desactivarlo en vez de borrarlo
        $id = $_GET['id'] ?? null;
        if($id) {
            $this->db->prepare("UPDATE empleados SET activo = 0 WHERE id = ?")->execute([$id]);
            echo json_encode(["success" => true, "message" => "Empleado desactivado correctamente"]);
        }
    }

    // =========================================================
    // CENTROS DE COSTO (NO tiene campo 'activo')
    // =========================================================
    public function getCentros()
    {
        // Traemos el área de negocio para mostrarla
        $sql = "SELECT c.*, a.nombre as area_nombre 
                FROM centros_costo c
                LEFT JOIN areas_negocio a ON c.area_negocio_id = a.id
                ORDER BY c.codigo ASC";
        echo json_encode(["success" => true, "data" => $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function saveCentro()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            if (!empty($data['id'])) {
                $sql = "UPDATE centros_costo SET codigo=:cod, nombre=:nom, alias=:alias, area_negocio_id=:area WHERE id=:id";
                $this->db->prepare($sql)->execute([
                    ':cod' => $data['codigo'], 
                    ':nom' => $data['nombre'], 
                    ':alias' => $data['alias'] ?? null,
                    ':area' => $data['area_negocio_id'] ?? null,
                    ':id' => $data['id']
                ]);
            } else {
                $sql = "INSERT INTO centros_costo (codigo, nombre, alias, area_negocio_id) VALUES (:cod, :nom, :alias, :area)";
                $this->db->prepare($sql)->execute([
                    ':cod' => $data['codigo'], 
                    ':nom' => $data['nombre'],
                    ':alias' => $data['alias'] ?? null,
                    ':area' => $data['area_negocio_id'] ?? null
                ]);
            }
            echo json_encode(["success" => true]);
        } catch (\Exception $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
    }

    public function deleteCentro()
    {
        $id = $_GET['id'] ?? null;
        try {
            $this->db->prepare("DELETE FROM centros_costo WHERE id = ?")->execute([$id]);
            echo json_encode(["success" => true]);
        } catch (\Exception $e) {
            http_response_code(500); echo json_encode(["error" => "No se puede eliminar, posiblemente está en uso."]);
        }
    }

    // =========================================================
    // ÁREAS DE NEGOCIO (Tiene 'codigo', NO tiene 'activo')
    // =========================================================
    public function getAreas()
    {
        echo json_encode(["success" => true, "data" => $this->db->query("SELECT * FROM areas_negocio ORDER BY codigo ASC")->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function saveArea()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            if (!empty($data['id'])) {
                $this->db->prepare("UPDATE areas_negocio SET codigo=:cod, nombre=:nom WHERE id=:id")
                    ->execute([':cod'=>$data['codigo'], ':nom'=>$data['nombre'], ':id'=>$data['id']]);
            } else {
                $this->db->prepare("INSERT INTO areas_negocio (codigo, nombre) VALUES (:cod, :nom)")
                    ->execute([':cod'=>$data['codigo'], ':nom'=>$data['nombre']]);
            }
            echo json_encode(["success" => true]);
        } catch (\Exception $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
    }

    public function deleteArea()
    {
        $id = $_GET['id'] ?? null;
        try {
            $this->db->prepare("DELETE FROM areas_negocio WHERE id = ?")->execute([$id]);
            echo json_encode(["success" => true]);
        } catch (\Exception $e) {
            http_response_code(500); echo json_encode(["error" => "No se puede eliminar, posiblemente tiene centros asociados."]);
        }
    }

    public function editarActivo()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Falta el ID del activo."]);
            return;
        }

        try {
            $this->repo->updateActivo($data);
            echo json_encode(["success" => true, "message" => "Activo actualizado correctamente."]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al actualizar: " . $e->getMessage()]);
        }
    }
}