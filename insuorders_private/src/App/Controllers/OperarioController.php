<?php
namespace App\Controllers;

use App\Services\OperarioService;
use App\Middleware\AuthMiddleware;
use Exception;

class OperarioController
{
    private $service;

    public function __construct()
    {
        $this->service = new OperarioService();
    }

    public function getMisInsumos()
    {
        $userId = AuthMiddleware::verify(); 

        try {
            $data = $this->service->obtenerMisDatos($userId); 
            echo json_encode(['success' => true, 'data' => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function asignar()
    {
        $bodegueroId = AuthMiddleware::verify(); 
        
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            $this->service->asignarInsumo($data, $bodegueroId);
            echo json_encode(['success' => true, 'message' => 'Entrega registrada exitosamente.']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function responder()
    {
        AuthMiddleware::verify(); 
        
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            $this->service->responderEntrega($data);

            $accion = $data['accion'] ?? '';
            $msg = ($accion === 'RECHAZAR') 
                ? "Entrega rechazada. Stock devuelto a bodega." 
                : "Entrega aceptada correctamente.";

            echo json_encode(["success" => true, "message" => $msg]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function consumir()
    {
        AuthMiddleware::verify();
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            $this->service->reportarConsumo($data);
            echo json_encode(['success' => true, 'message' => 'Consumo registrado.']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
    
    public function dashboard()
    {
        AuthMiddleware::verify();
        try {
            $data = $this->service->getDashboard();
            echo json_encode(['success' => true, 'data' => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function devolver()
    {
        AuthMiddleware::verify(); // Verificar sesión
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            $this->service->devolverInsumo($data);
            echo json_encode(["success" => true, "message" => "Insumo devuelto a bodega correctamente."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }
}