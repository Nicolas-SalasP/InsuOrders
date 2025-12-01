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

    public function index()
    {
        echo json_encode(["success" => true, "data" => $this->service->listarOrdenes()]);
    }

    public function show()
    {
        $id = $_GET['id'];
        echo json_encode(["success" => true, "data" => $this->service->obtenerDetalleOrden($id)]);
    }

    public function store()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            $usuarioId = 1;
            $id = $this->service->crearOrden($data, $usuarioId);
            echo json_encode(["success" => true, "message" => "Orden #$id creada exitosamente", "id" => $id]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function downloadPdf()
    {
        if (ob_get_length())
            ob_clean();
        $id = $_GET['id'] ?? null;
        if (!$id)
            die("ID requerido");

        try {
            $pdfContent = $this->service->generarPDF($id);
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="Orden_Compra_' . $id . '.pdf"');
            header('Cache-Control: private, max-age=0, must-revalidate');
            header('Pragma: public');
            echo $pdfContent;
            exit;
        } catch (\Exception $e) {
            die("Error PDF: " . $e->getMessage());
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

    // Endpoint de alertas
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
}