<?php
namespace App\Controllers;

use App\Services\MantencionService;
use App\Services\PDFService;
use App\Repositories\MantencionRepository;

class MantencionController
{
    private $service;

    public function __construct()
    {
        $this->service = new MantencionService();
    }

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
            if (!$usuarioId)
                throw new \Exception("Usuario no identificado");

            // IMPORTANTE: Llamamos al servicio para que haga el cálculo de stock
            $id = $this->service->crearOT([
                'usuario_id' => $usuarioId,
                'activo_id' => $data['activo_id'] ?? null,
                'observacion' => $data['observacion'],
                'origen_tipo' => $data['origen_tipo'] ?? 'Interna',
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
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            $this->service->editarOT($data['id'], [
                'activo_id' => $data['activo_id'],
                'observacion' => $data['observacion'],
                'items' => $data['items'] ?? []
            ]);
            echo json_encode(["success" => true, "message" => "Solicitud actualizada"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function delete()
    {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $this->service->anularOT($id);
            echo json_encode(["success" => true, "message" => "Anulada"]);
        }
    }

    // --- Helpers Auxiliares (Directos al Repo o Service) ---

    public function activos()
    {
        echo json_encode(["success" => true, "data" => $this->service->listarActivos()]);
    }

    public function finalizar()
    {
        (new MantencionRepository())->finalizar();
    }
    public function centrosCosto()
    {
        echo json_encode(["success" => true, "data" => (new MantencionRepository())->getCentrosCosto()]);
    }
    public function getKit()
    {
        echo json_encode(["success" => true, "data" => (new MantencionRepository())->getKitActivo($_GET['id'] ?? 0)]);
    }

    public function saveKit()
    {
        $d = json_decode(file_get_contents("php://input"), true);
        (new MantencionRepository())->addInsumoToKit($d['activo_id'], $d['insumo_id'], $d['cantidad']);
        echo json_encode(["success" => true]);
    }

    public function removeKitItem()
    {
        (new MantencionRepository())->removeInsumoFromKit($_GET['activo_id'], $_GET['insumo_id']);
        echo json_encode(["success" => true]);
    }

    public function storeActivo()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $repo = new MantencionRepository();
        if (isset($data['id']) && $data['id'])
            $repo->updateActivo($data);
        else
            $repo->createActivo($data);
        echo json_encode(["success" => true]);
    }

    public function downloadPdf()
    {
        if (ob_get_length())
            ob_clean();
        $id = $_GET['id'] ?? 0;
        $t = $_GET['type'] ?? 'sol';
        $repo = new MantencionRepository();
        $ot = $repo->getOTHeader($id);
        $pdf = new PDFService();
        if ($t === 'entrega')
            echo $pdf->generarPdfEntrega($ot, $repo->getEntregasOT($id));
        else
            echo $pdf->generarPdfOT($ot, $repo->getDetallesOT($id));
        exit;
    }
}