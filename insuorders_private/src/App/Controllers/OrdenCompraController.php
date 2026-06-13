<?php
namespace App\Controllers;
use App\Utils\ErrorHelper;

use App\Services\OrdenCompraService;
use App\Middleware\AuthMiddleware;
use Exception;

class OrdenCompraController
{
    private $service;

    public function __construct()
    {
        $this->service = new OrdenCompraService();
    }

    public function index()
    {
        AuthMiddleware::verify();
        $filtros = [
            'search' => $_GET['search'] ?? null,
            'insumo_id' => $_GET['insumo_id'] ?? null,
            'start' => $_GET['start'] ?? null,
            'end' => $_GET['end'] ?? null
        ];

        try {
            $data = $this->service->listarOrdenes($filtros);
            echo json_encode(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function filtros()
    {
        AuthMiddleware::verify();
        try {
            $data = $this->service->obtenerDatosFiltros();
            echo json_encode(["success" => true, "data" => $data['insumos']]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function pendientes()
    {
        AuthMiddleware::verify();
        try {
            $data = $this->service->obtenerAlertasCompra();
            echo json_encode(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function show()
    {
        AuthMiddleware::verify();
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID requerido"]);
            return;
        }

        try {
            $data = $this->service->obtenerDetalleOrden($id);
            if ($data) {
                echo json_encode(["success" => true, "data" => $data]);
            } else {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Orden no encontrada"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function store($usuarioId = null)
    {
        AuthMiddleware::verify();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "No autorizado"]);
            return;
        }

        try {
            $id = $this->service->crearOrden($data, $usuarioId);
            echo json_encode(["success" => true, "message" => "Orden creada exitosamente", "id" => $id]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function recepcionar($usuarioId)
    {
        AuthMiddleware::verify();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$usuarioId) {
            http_response_code(401);
            return;
        }

        try {
            if (empty($data['orden_id']) || empty($data['items'])) {
                throw new Exception("Datos incompletos para recepción.");
            }
            $resultado = $this->service->recepcionarOrden($data['orden_id'], $data['items'], $usuarioId);
            echo json_encode(["success" => true, "data" => $resultado]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function downloadPdf()
    {
        AuthMiddleware::verify();
        $id = $_GET['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            die("ID requerido");
        }

        try {
            $pdfContent = $this->service->generarPDF($id);
            if (ob_get_length())
                ob_clean();
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="OC_' . $id . '.pdf"');
            echo $pdfContent;
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            die("Error PDF: " . ErrorHelper::safeMessage($e));
        }
    }

    public function uploadFile()
    {
        try {
            AuthMiddleware::verify();
            $id = $_POST['id'] ?? null;
            $file = $_FILES['archivo'] ?? null;

            if (!$id || !$file) {
                throw new Exception("Faltan datos. ID: " . ($id ?: 'No recibido') . ", Archivo: " . ($file ? 'Recibido' : 'No recibido'));
            }

            $url = $this->service->subirArchivo($id, $file);

            echo json_encode(["success" => true, "message" => "Archivo subido correctamente", "url" => $url]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function cancelarOrden()
    {
        AuthMiddleware::verify();
        $input = json_decode(file_get_contents("php://input"), true);
        $id = $input['id'] ?? $_POST['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID no proporcionado']);
            return;
        }

        try {
            $this->service->cancelarOrden($id);
            echo json_encode(['success' => true, 'message' => 'Orden cancelada correctamente.']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => ErrorHelper::safeMessage($e)]);
        }
    }

    public function regenerarPdf()
    {
        AuthMiddleware::verify();
        $id = $_GET['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID faltante"]);
            return;
        }

        try {
            $url = $this->service->regenerarDocumentoPdf($id);
            echo json_encode([
                "success" => true,
                "message" => "PDF Regenerado correctamente",
                "url" => $url
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error regenerando: " . ErrorHelper::safeMessage($e)]);
        }
    }

    public function omitir()
    {
        try {
            AuthMiddleware::verify();
            AuthMiddleware::hasPermission('compras_crear_insumos');

            $input = json_decode(file_get_contents("php://input"), true);
            $ids = $input['ids'] ?? null;

            if (!$ids)
                throw new Exception("Faltan identificadores.");

            $this->service->omitirPendientes($ids);

            echo json_encode(["success" => true, "message" => "Ítems quitados de la lista de compra."]);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function cerrarManualmente()
    {
        AuthMiddleware::verify();
        $input = json_decode(file_get_contents("php://input"), true);
        $id = $input['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID no proporcionado']);
            return;
        }

        try {
            $this->service->cerrarOrdenParcial($id);
            echo json_encode(['success' => true, 'message' => 'Orden cerrada por recepción parcial exitosamente.']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => ErrorHelper::safeMessage($e)]);
        }
    }

    public function reabrirOC()
    {
        AuthMiddleware::verify();
        $input = json_decode(file_get_contents("php://input"), true);
        $id = $input['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID no proporcionado']);
            return;
        }

        try {
            $nuevoEstado = $this->service->reabrirOC($id);
            $nombre = $nuevoEstado === 3 ? 'Recepcion Parcial' : 'Emitida';
            echo json_encode([
                'success' => true,
                'message' => "Orden reabierta. Estado actualizado a: $nombre."
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => ErrorHelper::safeMessage($e)]);
        }
    }

    public function editar()
    {
        AuthMiddleware::verify();
        $input = json_decode(file_get_contents("php://input"), true);
        $id = $input['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de OC no proporcionado']);
            return;
        }

        try {
            $this->service->editarOrden($id, $input);
            echo json_encode(['success' => true, 'message' => 'Orden actualizada correctamente.']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => ErrorHelper::safeMessage($e)]);
        }
    }
}