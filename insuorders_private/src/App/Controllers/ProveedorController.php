<?php
namespace App\Controllers;

use App\Services\ProveedorService;

class ProveedorController {
    private $service;

    public function __construct() {
        $this->service = new ProveedorService();
    }

    public function index() {
        echo json_encode(["success" => true, "data" => $this->service->listarTodos()]);
    }

    public function auxiliares() {
        echo json_encode(["success" => true, "data" => $this->service->obtenerAuxiliares()]);
    }

    public function store() {
        try {
            // Pasamos $_POST y $_FILES al servicio
            $id = $this->service->crear($_POST, $_FILES['documento'] ?? null);
            echo json_encode(["success" => true, "message" => "Proveedor creado correctamente", "id" => $id]);
        } catch (\Exception $e) {
            http_response_code(400); 
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function update() {
        try {
            $id = $_GET['id'] ?? $_POST['id'] ?? null;
            if (!$id) throw new \Exception("ID no especificado");

            // Pasamos ID, datos y posible archivo nuevo
            $this->service->actualizar($id, $_POST, $_FILES['documento'] ?? null);
            echo json_encode(["success" => true, "message" => "Proveedor actualizado correctamente"]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) throw new \Exception("ID no especificado");

            if ($this->service->eliminar($id)) {
                echo json_encode(["success" => true, "message" => "Proveedor eliminado"]);
            } else {
                throw new \Exception("No se pudo eliminar el proveedor");
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}