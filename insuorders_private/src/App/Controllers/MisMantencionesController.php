<?php
namespace App\Controllers;
use App\Utils\ErrorHelper;

use App\Services\MisMantencionesService;
use App\Services\MantencionService;
use App\Services\PDFService;
use App\Middleware\AuthMiddleware;
use App\Utils\FileUpload;
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
            
            $userId = AuthMiddleware::verify();

            $data = $this->service->listarMisOts($userId);
            echo json_encode(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            http_response_code(ErrorHelper::safeMessage($e) === 'No tienes permiso' ? 403 : 500);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function guardar()
    {
        try {
            
            $userId = AuthMiddleware::verify();

            $input = [];
            if (!empty($_POST)) {
                $input = $_POST;
                $input['respuestas'] = json_decode($_POST['respuestas'] ?? '[]', true);
            } else {
                $input = json_decode(file_get_contents("php://input"), true);
            }

            $otId = $input['ot_id'] ?? null;
            $permisoRetirado = isset($input['permiso_retirado']) ? (int)filter_var($input['permiso_retirado'], FILTER_VALIDATE_BOOLEAN) : null;
            $urlEliminar = $input['eliminar_evidencia_url'] ?? null;

            if ($urlEliminar) {
                $this->service->repository->eliminarEvidenciaYRegistrar($otId, $urlEliminar, $userId);
                echo json_encode(["success" => true, "message" => "Evidencia eliminada y registrada en bitácora."]);
                return;
            }

            $checklistData = $input['respuestas'] ?? [];
            $firma = $input['firma'] ?? null;
            $comentarios = $input['comentarios'] ?? null;
            $finalizar = filter_var($input['finalizar'] ?? false, FILTER_VALIDATE_BOOLEAN);

            $evidenciaUrls = [];
            if (!empty($_FILES)) {
                $uploadDir = __DIR__ . '/../../../../public_html/uploads/cierre/';
                foreach ($_FILES as $key => $file) {
                    if (strpos($key, 'evidencia_') === 0 && $file['error'] === UPLOAD_ERR_OK) {
                        try {
                            $filename = FileUpload::guardar($file, $uploadDir, 'evidencia', 'cierre');
                            $evidenciaUrls[] = 'uploads/cierre/' . $filename;
                        } catch (\InvalidArgumentException $e) {
                            // Archivo inválido: ignorar y continuar con los demás
                            error_log('[Upload] Archivo rechazado en cierre OT: ' . ErrorHelper::safeMessage($e));
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

            $evidenciasStr = !empty($evidenciaUrls) ? json_encode($evidenciaUrls) : null;

            $seCerro = false;
            if ($finalizar) {
                $this->service->ejecutarDescuentos($otId, $userId);
                $seCerro = $this->service->guardarCierre($otId, $firma, $comentarios, $evidenciasStr);
                if ($permisoRetirado !== null) {
                    $this->service->repository->guardarPermisoRetirado($otId, $userId, $permisoRetirado);
                }
                if ($firma) {
                    // El PDF es un artefacto derivado: si su generacion falla, NO debe abortar el
                    // cierre de la OT (que ya quedo consistente en BD). Se registra y puede regenerarse.
                    try {
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
                    } catch (\Throwable $pdfErr) {
                        error_log('[PDF cierre] OT ' . $otId . ' fallo en la generacion: ' . $pdfErr->getMessage());
                    }
                }
            } else {
                $this->service->guardarAvanceParcial($otId, $comentarios, $evidenciasStr);
            }

            $this->service->repository->commit();

            // Post-commit: email only (fire-and-forget, no rollback needed)
            $notifService = new MantencionService();
            if ($finalizar) {
                if ($seCerro) {
                    $notifService->notificarCambioOT($otId, 'finalizacion');
                }
            } else {
                $notifService->notificarCambioOT($otId, 'avance');
            }

            echo json_encode(["success" => true, "message" => $finalizar ? "Servicio Finalizado" : "Avance guardado correctamente."]);

        } catch (Exception $e) {
            if ($this->service->repository->inTransaction()) {
                $this->service->repository->rollBack();
            }
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Error en proceso: " . ErrorHelper::safeMessage($e)]);
        }
    }

    public function detalle()
    {
        try {
            
            $userId = AuthMiddleware::verify();

            $otId = $_GET['id'] ?? null;
            if (!$otId)
                throw new Exception("Falta ID");

            $data = $this->service->getDetalleCompletoOt($otId, $userId);
            echo json_encode(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function actualizarEstadoManual()
    {
        try {
            
            $input = json_decode(file_get_contents("php://input"), true);

            $otId = $input['ot_id'] ?? null;
            $nuevoEstadoId = $input['estado_id'] ?? null;

            if (!$otId || !$nuevoEstadoId)
                throw new Exception("Datos incompletos.");

            if ((int) $nuevoEstadoId === 5) {
                throw new Exception("Para finalizar la orden debe utilizar el proceso de firma.");
            }

            $this->service->actualizarEstadoOT($otId, $nuevoEstadoId);

            echo json_encode(["success" => true, "message" => "Estado actualizado"]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }
}