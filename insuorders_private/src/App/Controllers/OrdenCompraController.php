<?php
namespace App\Controllers;

use App\Services\OrdenCompraService;
use App\Repositories\OrdenCompraRepository;

class OrdenCompraController
{
    private $service;

    public function __construct()
    {
        $this->service = new OrdenCompraService();
    }

    /**
     * List orders with filtering
     */
    public function index()
    {
        // Parse filters from GET parameters
        $filtros = [
            'search'       => $_GET['search'] ?? null,
            'insumo_id'    => $_GET['insumo_id'] ?? null,
            'fecha_inicio' => $_GET['start'] ?? null,
            'fecha_fin'    => $_GET['end'] ?? null
        ];

        echo json_encode(["success" => true, "data" => $this->service->listarOrdenes($filtros)]);
    }

    /**
     * Endpoint to get the list of items for the filter dropdown
     */
    public function filtros()
    {
        try {
            $insumos = $this->service->obtenerFiltrosInsumos();
            echo json_encode(["success" => true, "data" => $insumos]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function show()
    {
        $id = $_GET['id'];
        echo json_encode(["success" => true, "data" => $this->service->obtenerDetalleOrden($id)]);
    }

    public function store($usuarioId = null)
    {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "JSON Inválido"]);
            return;
        }

        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Usuario no identificado"]);
            return;
        }

        try {
            $id = $this->service->crearOrden($data, $usuarioId);
            echo json_encode(["success" => true, "message" => "Orden #$id creada exitosamente", "id" => $id]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Error al procesar: " . $e->getMessage()
            ]);
        }
    }


    public function downloadPdf()
    {
        if (ob_get_length()) ob_clean(); 

        $id = $_GET['id'] ?? null;
        if (!$id) die("ID requerido");

        try {
            $data = $this->service->obtenerDetalleOrden($id);
            $provName = preg_replace('/[^A-Za-z0-9]/', '_', $data['cabecera']['proveedor'] ?? 'Proveedor');
            $filename = "OC_{$id}_{$provName}.pdf";

            $pdfContent = $this->service->generarPDF($id);
            
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="' . $filename . '"');
            header('Cache-Control: private, max-age=0, must-revalidate');
            header('Pragma: public');
            echo $pdfContent;
            exit;
        } catch (\Exception $e) {
            die("Error generando PDF: " . $e->getMessage());
        }
    }

    public function uploadFile()
    {
        $id = $_POST['orden_id'] ?? null;
        if (!$id || !isset($_FILES['archivo'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos"]);
            return;
        }
        try {
            $uploadDir = __DIR__ . '/../../../../public_html/uploads/ordenes/';
            if (!is_dir($uploadDir))
                mkdir($uploadDir, 0777, true);
            $ext = pathinfo($_FILES['archivo']['name'], PATHINFO_EXTENSION);
            $fileName = "OC_{$id}_" . time() . ".{$ext}";
            if (move_uploaded_file($_FILES['archivo']['tmp_name'], $uploadDir . $fileName)) {
                $this->service->adjuntarArchivo($id, "/uploads/ordenes/" . $fileName);
                echo json_encode(["success" => true, "message" => "Archivo subido", "url" => "/uploads/ordenes/" . $fileName]);
            } else {
                throw new \Exception("Error al mover el archivo");
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function pendientes()
    {
        try {
            $repo = new OrdenCompraRepository();
            $data = $repo->getPendientesMantencion();
            echo json_encode(["success" => true, "data" => $data]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function recepcionar($usuarioId)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(["success" => false]);
            return;
        }
        if (empty($data['orden_id']) || empty($data['items'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Datos incompletos"]);
            return;
        }
        try {
            $res = $this->service->recepcionarOrden($data['orden_id'], $data['items'], $usuarioId);
            echo json_encode(["success" => true, "data" => $res]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}