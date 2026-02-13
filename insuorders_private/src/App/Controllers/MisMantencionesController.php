<?php
namespace App\Controllers;

use App\Services\MisMantencionesService;
use App\Services\PDFService;
use App\Middleware\AuthMiddleware;
use Exception;

class MisMantencionesController
{
    private $service;

    public function __construct()
    {
        $this->service = new MisMantencionesService();
    }

    public function index()
    {
        try {
            AuthMiddleware::hasPermission('ope_mant');
            $userId = AuthMiddleware::verify();
            
            $data = $this->service->listarMisOts($userId);
            echo json_encode(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            http_response_code($e->getMessage() === 'No tienes permiso' ? 403 : 500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function guardar()
    {
        try {
            AuthMiddleware::hasPermission('ope_mant');
            $userId = AuthMiddleware::verify(); 

            $input = json_decode(file_get_contents("php://input"), true); 
            $otId = $input['ot_id'] ?? null; 
            $checklistData = $input['respuestas'] ?? []; 
            $firma = $input['firma'] ?? null; 
            $comentarios = $input['comentarios'] ?? null; 

            if (!$this->service->repository->inTransaction()) { 
                $this->service->repository->beginTransaction(); 
            }

            $itemsChecklist = isset($checklistData['respuestas']) ? $checklistData['respuestas'] : $checklistData; 
            $this->service->guardarAvance($otId, $itemsChecklist);
            
            $this->service->registrarInicioTrabajo($otId);

            if ($firma) {
                $this->service->ejecutarDescuentos($otId, $userId);
                $this->service->guardarCierre($otId, $firma, $comentarios); 

                $datosReporte = $this->service->getDatosReporte($otId); 
                $pdfService = new PDFService(); 

                $pdfUrl = $pdfService->generarReporteFinalOT( 
                    $datosReporte['header'],
                    $itemsChecklist,
                    $datosReporte['detalles'],
                    $firma,
                    $comentarios
                );

                $this->service->guardarUrlPdf($otId, $pdfUrl); 
            }

            $this->service->repository->commit(); 
            echo json_encode(["success" => true, "message" => "Guardado correctamente."]); 

        } catch (Exception $e) {
            if ($this->service->repository->inTransaction()) { 
                $this->service->repository->rollBack(); 
            }

            http_response_code(400); 
            echo json_encode(["success" => false, "message" => "Error en proceso: " . $e->getMessage()]); 
        }
    }

    public function detalle()
    {
        try {
            AuthMiddleware::hasPermission('ope_mant');
            $userId = AuthMiddleware::verify();

            $otId = $_GET['id'] ?? null;
            if (!$otId) throw new Exception("Falta ID");
            
            $data = $this->service->getDetalleCompletoOt($otId, $userId);
            echo json_encode(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}