<?php
namespace App\Controllers;

use App\Repositories\MantencionRepository;
use App\Services\PDFService;

class MantencionController
{
    private $repo;

    public function __construct()
    {
        $this->repo = new MantencionRepository();
    }

    public function index()
    {
        echo json_encode(["success" => true, "data" => $this->repo->getSolicitudes()]);
    }

    public function detalles()
    {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            echo json_encode(["success" => false, "message" => "Faltan datos"]);
            return;
        }
        echo json_encode(["success" => true, "data" => $this->repo->getDetallesOT($id)]);
    }

    public function store($usuarioId)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            if (!$usuarioId)
                throw new \Exception("Usuario no identificado");

            $id = $this->repo->createSolicitud([
                'usuario_id' => $usuarioId,
                'activo_id' => $data['activo_id'] ?? null,
                'observacion' => $data['observacion'],
                'origen_tipo' => $data['origen_tipo'] ?? 'Interna',
                'origen_referencia' => $data['origen_referencia'] ?? null,
                'solicitante_externo' => $data['solicitante_externo'] ?? null,
                'fecha_solicitud_externa' => $data['fecha_solicitud_externa'] ?? null,
                'area_negocio' => $data['area_negocio'] ?? null,
                'centro_costo_ot' => $data['centro_costo_ot'] ?? null
            ]);

            if (!empty($data['items'])) {
                foreach ($data['items'] as $item) {
                    $this->repo->addDetalle([
                        'solicitud_id' => $id,
                        'insumo_id' => $item['id'],
                        'cantidad' => $item['cantidad']
                    ]);
                }
            }

            echo json_encode(["success" => true, "message" => "Solicitud #$id creada correctamente"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function update()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            $this->repo->updateSolicitud($data['id'], $data['activo_id'], $data['observacion']);

            if (isset($data['items'])) {
                $this->repo->clearDetalles($data['id']);
                foreach ($data['items'] as $item) {
                    $this->repo->addDetalle([
                        'solicitud_id' => $data['id'],
                        'insumo_id' => $item['id'],
                        'cantidad' => $item['cantidad'],
                        'estado_linea' => $item['estado_linea'] ?? 'PENDIENTE'
                    ]);
                }
            }
            echo json_encode(["success" => true, "message" => "Solicitud actualizada"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function delete()
    {
        $this->repo->delete();
    }

    public function finalizar()
    {
        $this->repo->finalizar();
    }

    public function activos()
    {
        echo json_encode(["success" => true, "data" => $this->repo->getActivos()]);
    }

    public function storeActivo()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            if (isset($data['id']) && !empty($data['id'])) {
                $this->repo->updateActivo($data);
                echo json_encode(["success" => true, "message" => "Activo actualizado correctamente"]);
            } else {
                $id = $this->repo->createActivo($data);
                echo json_encode(["success" => true, "message" => "Activo creado", "id" => $id]);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error BD: " . $e->getMessage()]);
        }
    }

    public function centrosCosto()
    {
        echo json_encode(["success" => true, "data" => $this->repo->getCentrosCosto()]);
    }

    // Kits y Docs
    public function getKit()
    {
        $id = $_GET['id'] ?? 0;
        echo json_encode(["success" => true, "data" => $this->repo->getKitActivo($id)]);
    }
    public function saveKit()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->repo->addInsumoToKit($data['activo_id'], $data['insumo_id'], $data['cantidad']);
        echo json_encode(["success" => true]);
    }
    public function removeKitItem()
    {
        $aid = $_GET['activo_id'];
        $iid = $_GET['insumo_id'];
        $this->repo->removeInsumoFromKit($aid, $iid);
        echo json_encode(["success" => true]);
    }

    public function listDocs()
    {
        $id = $_GET['id'] ?? 0;
        echo json_encode(["success" => true, "data" => $this->repo->getDocs($id)]);
    }
    public function uploadDoc()
    {
        if (!isset($_FILES['archivo']) || !isset($_POST['activo_id'])) {
            http_response_code(400);
            echo json_encode(["success" => false]);
            return;
        }
        try {
            $dir = __DIR__ . '/../../../../public_html/uploads/activos/';
            if (!is_dir($dir))
                mkdir($dir, 0777, true);
            $name = time() . '_' . $_FILES['archivo']['name'];
            move_uploaded_file($_FILES['archivo']['tmp_name'], $dir . $name);
            $this->repo->addDoc($_POST['activo_id'], $_FILES['archivo']['name'], "/uploads/activos/$name");
            echo json_encode(["success" => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function downloadPdf()
    {
        if (ob_get_length())
            ob_clean();
        $id = $_GET['id'] ?? null;
        $tipo = $_GET['type'] ?? 'solicitud';
        if (!$id)
            die("Falta ID");

        $ot = $this->repo->getOTHeader($id);
        if (!$ot)
            die("OT no encontrada");

        $pdf = new PDFService();
        if ($tipo === 'entrega') {
            $entregas = $this->repo->getEntregasOT($id);
            $content = $pdf->generarPdfEntrega($ot, $entregas);
            $filename = "Entrega_OT_{$id}.pdf";
        } else {
            $detalles = $this->repo->getDetallesOT($id);
            $content = $pdf->generarPdfOT($ot, $detalles);
            $filename = "Solicitud_OT_{$id}.pdf";
        }

        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="' . $filename . '"');
        echo $content;
        exit;
    }

    public function updateKitQty() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['activo_id']) && isset($data['insumo_id']) && isset($data['cantidad'])) {
            $this->repo->updateKitQuantity($data['activo_id'], $data['insumo_id'], $data['cantidad']);
            echo json_encode(["success" => true]);
        } else {
            http_response_code(400); echo json_encode(["success" => false, "message" => "Faltan datos"]);
        }
    }

    public function deleteDoc() {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $this->repo->deleteDoc($id);
            echo json_encode(["success" => true]);
        } else {
            http_response_code(400); echo json_encode(["success" => false]);
        }
    }
}