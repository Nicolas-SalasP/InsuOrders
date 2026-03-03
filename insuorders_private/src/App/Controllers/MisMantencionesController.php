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

            $input = [];
            if (!empty($_POST)) {
                $input = $_POST;
                $input['respuestas'] = json_decode($_POST['respuestas'] ?? '[]', true);
            } else {
                $input = json_decode(file_get_contents("php://input"), true); 
            }

            $otId = $input['ot_id'] ?? null; 
            $checklistData = $input['respuestas'] ?? []; 
            $firma = $input['firma'] ?? null; 
            $comentarios = $input['comentarios'] ?? null; 

            $evidenciaUrls = [];
            if (!empty($_FILES)) {
                $uploadDir = __DIR__ . '/../../public_html/api/uploads/cierre/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

                foreach ($_FILES as $key => $file) {
                    if (strpos($key, 'evidencia_') === 0 && $file['error'] === UPLOAD_ERR_OK) {
                        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
                        $filename = 'cierre_' . $otId . '_' . uniqid() . '.' . $ext;
                        if (move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
                            $evidenciaUrls[] = 'uploads/cierre/' . $filename;
                        }
                    }
                }
            }

            if (!$this->service->repository->inTransaction()) { 
                $this->service->repository->beginTransaction(); 
            }

            $itemsChecklist = isset($checklistData['respuestas']) ? $checklistData['respuestas'] : $checklistData; 
            $this->service->guardarAvance($otId, $itemsChecklist);
            
            $this->service->registrarInicioTrabajo($otId);

            if ($firma) {
                $this->service->ejecutarDescuentos($otId, $userId);
                $evidenciasStr = !empty($evidenciaUrls) ? json_encode($evidenciaUrls) : null;
                $this->service->guardarCierre($otId, $firma, $comentarios, $evidenciasStr); 

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

    public function actualizarEstadoManual()
    {
        try {
            AuthMiddleware::hasPermission('ope_mant');
            $input = json_decode(file_get_contents("php://input"), true);
            
            $otId = $input['ot_id'] ?? null;
            $nuevoEstadoId = $input['estado_id'] ?? null;

            if (!$otId || !$nuevoEstadoId) throw new Exception("Datos incompletos.");
            
            if ((int)$nuevoEstadoId === 5) {
                throw new Exception("Para finalizar la orden debe utilizar el proceso de firma.");
            }

            $this->service->actualizarEstadoOT($otId, $nuevoEstadoId);

            echo json_encode(["success" => true, "message" => "Estado actualizado"]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}