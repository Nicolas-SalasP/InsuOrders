<?php
namespace App\Controllers;

use App\Services\BodegaService;
use App\Middleware\AuthMiddleware;
use Exception;

class BodegaController
{
    private $service;

    public function __construct()
    {
        $this->service = new BodegaService();
    }

    public function pendientes()
    {
        header('Content-Type: application/json');
        try {
            echo json_encode(["success" => true, "data" => $this->service->getPendientes()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function porOrganizar()
    {
        header('Content-Type: application/json');
        try {
            echo json_encode(["success" => true, "data" => $this->service->getPorOrganizar()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function entregar($usuarioId)
    {
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(["success" => false, "error" => "Sesión expirada o inválida"]);
            return;
        }
        try {
            $msg = $this->service->entregarMaterial($data, $usuarioId);
            echo json_encode(["success" => true, "message" => $msg]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function organizar()
    {
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            $this->service->organizar($data['insumo_id'], $data['ubicacion_id'], $data['cantidad']);
            echo json_encode(["success" => true, "message" => "Stock movido correctamente"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function entregarMasivo($usuarioId)
    {
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['items']) || empty($data['receptor_id'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Faltan datos para la entrega masiva."]);
            return;
        }
        try {
            $res = $this->service->entregarMasivo($data['items'], $data['receptor_id'], $usuarioId);
            $msg = "Se entregaron {$res['procesados']} ítems correctamente.";
            if (count($res['errores']) > 0) $msg .= " (Hubo errores en: " . count($res['errores']) . " ítems).";
            echo json_encode(["success" => true, "message" => $msg]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    // --- NUEVOS CONTROLADORES DE DEVOLUCIONES ---
    public function devolucionesPendientes()
    {
        header('Content-Type: application/json');
        try {
            echo json_encode(["success" => true, "data" => $this->service->getDevolucionesPendientes()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function aprobarDevolucion($usuarioId)
    {
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['devolucion_id'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "ID de devolución requerido"]);
            return;
        }
        try {
            $this->service->aprobarDevolucion($data['devolucion_id'], $usuarioId);
            echo json_encode(["success" => true, "message" => "Devolución aprobada. Stock en zona de Organización."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function rechazarDevolucion($usuarioId)
    {
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['devolucion_id']) || empty($data['motivo'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "ID de devolución y motivo requeridos"]);
            return;
        }
        try {
            $this->service->rechazarDevolucion($data['devolucion_id'], $usuarioId, $data['motivo']);
            echo json_encode(["success" => true, "message" => "Devolución rechazada correctamente."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function getTiposDevolucion() {
    try {
        $tipos = $this->service->getTiposDevolucion();
        echo json_encode(['success' => true, 'data' => $tipos]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
}