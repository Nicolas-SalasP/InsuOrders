<?php
namespace App\Controllers;

use App\Services\CotizacionService;
use App\Services\PDFService;
use App\Middleware\AuthMiddleware;
use Exception;

class CotizacionController
{
    private $service;

    public function __construct()
    {
        $this->service = new CotizacionService();
    }

    public function index()
    {
        AuthMiddleware::hasPermission('cot_ver');
        
        $filters = [
            'id' => $_GET['id'] ?? null,
            'estado_id' => $_GET['estado'] ?? null,
            'fecha_start' => $_GET['start'] ?? null,
            'fecha_end' => $_GET['end'] ?? null,
            'usuario_id' => $_GET['usuario'] ?? null
        ];
        
        try {
            $data = $this->service->listarCotizaciones($filters);
            echo json_encode(['success' => true, 'data' => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function store()
    {
        $userId = AuthMiddleware::hasPermission('cot_crear');
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            $id = $this->service->crearCotizacion($data, $userId);
            echo json_encode(['success' => true, 'message' => 'Cotización creada exitosamente.', 'id' => $id]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function show()
    {
        AuthMiddleware::hasPermission('cot_ver');
        $id = $_GET['id'] ?? 0;
        
        try {
            $data = $this->service->obtenerCotizacion($id);
            echo json_encode(['success' => true, 'data' => $data]);
        } catch (Exception $e) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function cambiarEstado()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $accion = $data['accion'] ?? ''; 
        $id = $data['id'] ?? 0;

        if ($accion === 'APROBAR') {
            AuthMiddleware::hasPermission('cot_aprobar');
        } elseif ($accion === 'RECHAZAR') {
            AuthMiddleware::hasPermission('cot_anular');
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Acción inválida']);
            return;
        }

        try {
            $this->service->gestionarEstado($id, $accion);
            echo json_encode(['success' => true, 'message' => "Cotización actualizada correctamente."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
    
    public function getEstados() {
        AuthMiddleware::verify(); 
        try {
            $data = $this->service->obtenerListaEstados();
            echo json_encode(['success' => true, 'data' => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function downloadPdf()
    {
        AuthMiddleware::verify(); 
        
        $id = $_GET['id'] ?? 0;

        try {
            $cotizacion = $this->service->obtenerCotizacion($id);
            (new PDFService())->generarCotizacion($cotizacion);

        } catch (Exception $e) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => "Error PDF: " . $e->getMessage()]);
        }
    }
}