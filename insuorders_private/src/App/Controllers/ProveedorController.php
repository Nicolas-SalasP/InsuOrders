<?php
namespace App\Controllers;

use App\Services\ProveedorService;
use App\Middleware\AuthMiddleware;

class ProveedorController
{
    private $service;

    public function __construct()
    {
        $this->service = new ProveedorService();
    }

    public function index()
    {
        AuthMiddleware::hasPermission('prov_ver'); 
        echo json_encode(["success" => true, "data" => $this->service->listarTodos()]);
    }

    public function auxiliares()
    {
        AuthMiddleware::verify();
        echo json_encode(["success" => true, "data" => $this->service->obtenerAuxiliares()]);
    }

    public function store()
    {
        try {
            AuthMiddleware::hasPermission('prov_crear'); 
            
            $data = !empty($_POST) ? $_POST : json_decode(file_get_contents("php://input"), true);
            if (!$data)
                throw new \Exception("No se recibieron datos para crear el proveedor.");
            
            $id = $this->service->crear($data, $_FILES['documento'] ?? null);
            echo json_encode(["success" => true, "message" => "Proveedor creado correctamente", "id" => $id]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function update()
    {
        try {
            AuthMiddleware::hasPermission('prov_editar'); 
            
            $id = $_GET['id'] ?? $_POST['id'] ?? null;
            if (!$id)
                throw new \Exception("ID no especificado para la actualización.");
            
            $data = !empty($_POST) ? $_POST : json_decode(file_get_contents("php://input"), true);
            $this->service->actualizar($id, $data, $_FILES['documento'] ?? null);
            
            echo json_encode(["success" => true, "message" => "Proveedor actualizado correctamente"]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function delete()
    {
        try {
            AuthMiddleware::hasPermission('prov_eliminar'); 
            
            $id = $_GET['id'] ?? null;
            if (!$id)
                throw new \Exception("ID no especificado para la eliminación.");
            
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