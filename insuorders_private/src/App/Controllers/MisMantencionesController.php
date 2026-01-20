<?php
namespace App\Controllers;

use App\Services\MisMantencionesService;
use App\Services\PDFService;
use App\Middleware\AuthMiddleware;

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
            $userId = AuthMiddleware::verify(); 
            $data = $this->service->listarMisOts($userId);
            echo json_encode(["success" => true, "data" => $data]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function guardar()
    {
        try {
            AuthMiddleware::verify();
            
            $input = json_decode(file_get_contents("php://input"), true);
            $otId = $input['ot_id'] ?? null;
            $checklistData = $input['respuestas'] ?? []; 
            $firma = $input['firma'] ?? null;
            $comentarios = $input['comentarios'] ?? null;
            $itemsChecklist = isset($checklistData['respuestas']) ? $checklistData['respuestas'] : $checklistData;
            
            $this->service->guardarAvance($otId, $itemsChecklist);
            if ($firma) {
                $this->service->guardarCierre($otId, $firma, $comentarios);
                $datosReporte = $this->service->getDatosReporte($otId);
                $pdfService = new PDFService();
                $pdfUrl = $pdfService->generarReporteFinalOT(
                    $datosReporte['header'],    // Datos OT
                    $itemsChecklist,            // Datos Checklist
                    $datosReporte['detalles'],  // Datos Insumos
                    $firma,                     // Imagen Firma
                    $comentarios                // Texto Comentarios
                );

                $this->service->guardarUrlPdf($otId, $pdfUrl);
            }

            echo json_encode(["success" => true, "message" => "Guardado correctamente."]);

        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function detalle()
    {
        try {
            AuthMiddleware::verify();
            $otId = $_GET['id'] ?? null;
            if (!$otId) throw new \Exception("Falta ID");

            $data = $this->service->getDetalleCompletoOt($otId);
            echo json_encode(["success" => true, "data" => $data]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}