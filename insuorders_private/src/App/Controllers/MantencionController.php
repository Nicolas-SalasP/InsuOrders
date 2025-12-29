<?php
namespace App\Controllers;

use App\Services\MantencionService;
use App\Services\PDFService;
use App\Repositories\MantencionRepository;

class MantencionController
{
    private $service;
    private $repo;

    public function __construct()
    {
        $this->service = new MantencionService();
        $this->repo = new MantencionRepository();
    }

    // =================================================================================
    // 1. GESTIÓN DE OTs (CRUD Principal)
    // =================================================================================

    public function index()
    {
        echo json_encode(["success" => true, "data" => $this->service->listarSolicitudes()]);
    }

    public function detalles()
    {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            echo json_encode(["success" => false, "message" => "Faltan datos"]);
            return;
        }
        echo json_encode(["success" => true, "data" => $this->service->obtenerDetalleOT($id)]);
    }

    public function store($usuarioId)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            if (!$usuarioId) throw new \Exception("Usuario no identificado");

            $id = $this->service->crearOT([
                'usuario_id' => $usuarioId,
                'activo_id' => $data['activo_id'] ?? null,
                'observacion' => $data['observacion'],
                'origen_tipo' => $data['origen_tipo'] ?? 'Interna',
                'area_negocio' => $data['area_negocio'] ?? null,
                'centro_costo_ot' => $data['centro_costo_ot'] ?? null,
                'solicitante_externo' => $data['solicitante_externo'] ?? null,
                'items' => $data['items'] ?? []
            ], $usuarioId);

            echo json_encode(["success" => true, "message" => "Solicitud #$id creada correctamente"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function update()
    {
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Falta ID de OT"]);
            return;
        }

        try {
            $this->repo->updateOT($id, $data);
            echo json_encode(["success" => true, "message" => "OT Actualizada correctamente"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al actualizar: " . $e->getMessage()]);
        }
    }

    public function delete()
    {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $this->service->anularOT($id);
            echo json_encode(["success" => true, "message" => "Orden anulada correctamente"]);
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Falta ID"]);
        }
    }

    public function finalizar()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;
        
        if ($id) {
            try {
                $this->repo->finalizar($id);
                echo json_encode(["success" => true, "message" => "Orden finalizada"]);
            } catch (\Exception $e) {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Falta ID"]);
        }
    }

    // =================================================================================
    // 2. GESTIÓN DE ACTIVOS Y CENTROS DE COSTO
    // =================================================================================

    public function activos()
    {
        echo json_encode(["success" => true, "data" => $this->repo->getActivos()]);
    }

    public function centrosCosto()
    {
        echo json_encode(["success" => true, "data" => $this->repo->getCentrosCosto()]);
    }

    public function storeActivo()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['codigo_interno']) || empty($data['nombre'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Datos incompletos"]);
            return;
        }

        try {
            $this->repo->createActivo($data);
            echo json_encode(["success" => true, "message" => "Activo creado"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function editarActivo()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Falta ID"]);
            return;
        }

        try {
            $this->repo->updateActivo($data);
            echo json_encode(["success" => true, "message" => "Activo actualizado"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    // =================================================================================
    // 3. KITS DE REPUESTOS (Mantenimiento Preventivo)
    // =================================================================================

    public function getKit()
    {
        $id = $_GET['id'] ?? 0;
        echo json_encode(["success" => true, "data" => $this->repo->getKitActivo($id)]);
    }

    public function saveKit()
    {
        $d = json_decode(file_get_contents("php://input"), true);
        try {
            $this->repo->addInsumoToKit($d['activo_id'], $d['insumo_id'], $d['cantidad']);
            echo json_encode(["success" => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function updateKitQty()
    {
        $d = json_decode(file_get_contents("php://input"), true);
        try {
            $this->repo->updateKitQuantity($d['activo_id'], $d['insumo_id'], $d['cantidad']);
            echo json_encode(["success" => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function removeKitItem()
    {
        $activoId = $_GET['activo_id'] ?? null;
        $insumoId = $_GET['insumo_id'] ?? null;

        try {
            if (!$activoId || !$insumoId) throw new \Exception("Faltan IDs");
            $this->repo->removeInsumoFromKit($activoId, $insumoId);
            echo json_encode(["success" => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    // =================================================================================
    // 4. DOCUMENTACIÓN (Archivos Adjuntos a Activos/OTs)
    // =================================================================================

    public function listDocs()
    {
        $id = $_GET['id'] ?? 0;
        echo json_encode(["success" => true, "data" => $this->repo->getDocs($id)]);
    }

    public function uploadDoc()
    {
        if (!isset($_FILES['archivo']) || !isset($_POST['activo_id'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Datos faltantes"]);
            return;
        }

        $activoId = $_POST['activo_id'];
        $file = $_FILES['archivo'];
        $nombre = $file['name'];
        
        $ext = pathinfo($nombre, PATHINFO_EXTENSION);
        $nuevoNombre = "DOC_{$activoId}_" . uniqid() . "." . $ext;
        
        $targetDir = __DIR__ . '/../../../../public_html/uploads/activos/';
        
        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        if (move_uploaded_file($file['tmp_name'], $targetDir . $nuevoNombre)) {
            $url = "/uploads/activos/" . $nuevoNombre;
            try {
                $this->repo->addDoc($activoId, $nombre, $url);
                echo json_encode(["success" => true, "url" => $url]);
            } catch (\Exception $e) {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al guardar archivo en disco"]);
        }
    }

    public function deleteDoc()
    {
        $id = $_GET['id'] ?? 0;
        try {
            $this->repo->deleteDoc($id);
            echo json_encode(["success" => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    // =================================================================================
    // 5. GENERACIÓN DE PDF
    // =================================================================================

    public function downloadPdf()
    {
        if (ob_get_length()) ob_clean();
        
        $id = $_GET['id'] ?? 0;
        $type = $_GET['type'] ?? 'sol';
        
        try {
            $ot = $this->repo->getOTHeader($id);
            $pdf = new PDFService();
            
            if ($type === 'entrega') {
                $entregas = $this->repo->getEntregasOT($id);
                echo $pdf->generarPdfEntrega($ot, $entregas);
            } else {
                $detalles = $this->repo->getDetallesOT($id);
                echo $pdf->generarPdfOT($ot, $detalles);
            }
            exit;
        } catch (\Exception $e) {
            http_response_code(500);
            echo "Error generando PDF: " . $e->getMessage();
        }
    }
}