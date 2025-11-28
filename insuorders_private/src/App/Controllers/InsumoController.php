<?php
namespace App\Controllers;

use App\Services\InsumoService;

class InsumoController {
    private $service;

    public function __construct() {
        $this->service = new InsumoService();
    }

    public function index() {
        echo json_encode(["success" => true, "data" => $this->service->listarTodo()]);
    }

    public function auxiliares() {
        echo json_encode(["success" => true, "data" => $this->service->obtenerAuxiliares()]);
    }

    public function store() {
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            $this->service->crearInsumo($data);
            echo json_encode(["success" => true, "message" => "Insumo creado correctamente"]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function ajustar() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['insumo_id']) || !isset($data['cantidad'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos obligatorios"]);
            return;
        }

        try {
            $usuarioId = 1;
            
            $this->service->gestionarStock($data, $usuarioId); 
            
            echo json_encode(["success" => true, "message" => "Movimiento registrado correctamente"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
    
    public function delete() {
        $id = $_GET['id'] ?? null;
        if ($this->service->eliminarInsumo($id)) {
            echo json_encode(["success" => true, "message" => "Insumo eliminado"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al eliminar"]);
        }
    }
}