<?php
namespace App\Controllers;

use App\Services\OrdenCompraService;

class OrdenCompraController
{
    private $service;

    public function __construct()
    {
        $this->service = new OrdenCompraService();
    }

    public function index()
    {
        $filtros = [
            'search'       => $_GET['search'] ?? null,
            'insumo_id'    => $_GET['insumo_id'] ?? null,
            'fecha_inicio' => $_GET['start'] ?? null,
            'fecha_fin'    => $_GET['end'] ?? null
        ];

        try {
            $data = $this->service->listarOrdenes($filtros);
            echo json_encode(["success" => true, "data" => $data]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function filtros()
    {
        try {
            $data = $this->service->obtenerDatosFiltros();
            echo json_encode(["success" => true, "data" => $data]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function pendientes()
    {
        try {
            $data = $this->service->obtenerAlertasCompra();
            echo json_encode(["success" => true, "data" => $data]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function show()
    {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID requerido"]);
            return;
        }
        
        $data = $this->service->obtenerDetalleOrden($id);
        if ($data) {
            echo json_encode(["success" => true, "data" => $data]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Orden no encontrada"]);
        }
    }

    public function store($usuarioId = null)
    {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "No autorizado"]);
            return;
        }

        try {
            $id = $this->service->crearOrden($data, $usuarioId);
            echo json_encode(["success" => true, "message" => "Orden creada exitosamente", "id" => $id]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function recepcionar($usuarioId)
    {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        if (!$usuarioId) {
            http_response_code(401);
            return;
        }

        try {
            if (empty($data['orden_id']) || empty($data['items'])) {
                throw new \Exception("Datos incompletos para recepción.");
            }
            $resultado = $this->service->recepcionarOrden($data['orden_id'], $data['items'], $usuarioId);
            echo json_encode(["success" => true, "data" => $resultado]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function downloadPdf()
    {
        $id = $_GET['id'] ?? null;
        if (!$id) die("ID requerido");

        try {
            $pdfContent = $this->service->generarPDF($id);
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="OC_'.$id.'.pdf"');
            echo $pdfContent;
        } catch (\Exception $e) {
            die("Error PDF: " . $e->getMessage());
        }
    }

    public function uploadFile()
    {
        if (!isset($_POST['orden_id']) || !isset($_FILES['archivo'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos"]);
            return;
        }

        try {
            $url = $this->service->subirArchivo($_POST['orden_id'], $_FILES['archivo']);
            echo json_encode(["success" => true, "url" => $url]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}