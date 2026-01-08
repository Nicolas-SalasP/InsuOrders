<?php
namespace App\Controllers;

use App\Repositories\OperarioRepository;
use App\Middleware\AuthMiddleware;

class OperarioController
{
    private $repo;

    public function __construct()
    {
        $this->repo = new OperarioRepository();
    }

    public function getMisInsumos()
    {
        $userId = AuthMiddleware::verify(); 

        try {
            $data = $this->repo->getMisInsumosCorrecto($userId); 
            echo json_encode(['success' => true, 'data' => $data]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function asignar()
    {
        $userId = AuthMiddleware::verify(); 
        
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            $data['bodeguero_id'] = $userId;

            $this->repo->asignarInsumo($data);
            echo json_encode(['success' => true, 'message' => 'Entrega registrada exitosamente.']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function responder()
    {
        AuthMiddleware::verify();
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            $this->repo->gestionarRecepcion($data['entrega_id'], $data['accion'], $data['observacion'] ?? null);
            echo json_encode(['success' => true, 'message' => 'Respuesta registrada.']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function consumir()
    {
        AuthMiddleware::verify();
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            $this->repo->reportarUso($data['entrega_id'], $data['cantidad']);
            echo json_encode(['success' => true, 'message' => 'Consumo registrado.']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
    
    public function dashboard()
    {
        AuthMiddleware::verify();
        try {
            $data = $this->repo->getDashboardSupervision();
            echo json_encode(['success' => true, 'data' => $data]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}