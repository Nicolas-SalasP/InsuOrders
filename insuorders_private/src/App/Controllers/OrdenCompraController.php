<?php
namespace App\Controllers;

use App\Services\OrdenCompraService;

class OrdenCompraController {
    private $service;

    public function __construct() {
        $this->service = new OrdenCompraService();
    }

    public function index() {
        echo json_encode(["success" => true, "data" => $this->service->listarOrdenes()]);
    }

    public function show() {
        $id = $_GET['id'];
        echo json_encode(["success" => true, "data" => $this->service->obtenerDetalleOrden($id)]);
    }

    public function store() {
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

    public function downloadPdf() {
        $id = $_GET['id'] ?? null;
        if (!$id) die("ID requerido");

        try {
            $pdfContent = $this->service->generarPDF($id);

            while (ob_get_level()) {
                ob_end_clean();
            }

            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="Orden_Compra_'.$id.'.pdf"');
            header('Cache-Control: private, max-age=0, must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . strlen($pdfContent));

            echo $pdfContent;
            exit;

        } catch (\Exception $e) {
            while (ob_get_level()) ob_end_clean();
            http_response_code(500);
            die("Error Crítico generando PDF: " . $e->getMessage());
        }
    }

    public function uploadFile() {
        $id = $_POST['orden_id'] ?? null;
        if (!$id || !isset($_FILES['archivo'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos o archivo"]);
            return;
        }

        try {
            $uploadDir = __DIR__ . '/../../../../public_html/uploads/ordenes/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

            $ext = pathinfo($_FILES['archivo']['name'], PATHINFO_EXTENSION);
            $fileName = "OC_{$id}_" . time() . ".{$ext}";
            $targetPath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['archivo']['tmp_name'], $targetPath)) {
                $webPath = "/uploads/ordenes/" . $fileName;
                $this->service->adjuntarArchivo($id, $webPath);

                echo json_encode(["success" => true, "message" => "Archivo subido correctamente", "url" => $webPath]);
            } else {
                throw new \Exception("Error al mover el archivo al servidor");
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}