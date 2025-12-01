<?php
namespace App\Controllers;
use App\Services\MantencionService;
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

    public function activos()
    {
        echo json_encode(["success" => true, "data" => $this->service->listarActivos()]);
    }

    // MODIFICADO: Acepta $usuarioId
    public function store($usuarioId = null)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Usuario no identificado"]);
            return;
        }

        try {
            $id = $this->service->crearOT($data, $usuarioId);
            echo json_encode(["success" => true, "message" => "OT #$id creada exitosamente"]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function update()
    {
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            if (!$id)
                throw new \Exception("Falta ID");
            $this->service->editarOT($id, $data);
            echo json_encode(["success" => true, "message" => "OT actualizada correctamente"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function delete()
    {
        $id = $_GET['id'] ?? null;
        try {
            if (!$id)
                throw new \Exception("Falta ID");
            $this->service->anularOT($id);
            echo json_encode(["success" => true, "message" => "OT Anulada"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function detalles()
    {
        $id = $_GET['id'];
        echo json_encode(["success" => true, "data" => $this->service->obtenerDetalleOT($id)]);
    }

    public function getKit()
    {
        $repo = new MantencionRepository();
        echo json_encode(["success" => true, "data" => $repo->getKitActivo($_GET['id'])]);
    }
    public function saveKit()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $repo = new MantencionRepository();
        if ($data['accion'] == 'add')
            $repo->addInsumoToKit($data['activo_id'], $data['insumo_id'], $data['cantidad']);
        else
            $repo->removeInsumoFromKit($data['activo_id'], $data['insumo_id']);
        echo json_encode(["success" => true]);
    }
    public function listDocs()
    {
        $repo = new MantencionRepository();
        echo json_encode(["success" => true, "data" => $repo->getDocs($_GET['id'])]);
    }
    public function uploadDoc()
    {
        if (!isset($_FILES['archivo']) || !isset($_POST['activo_id'])) {
            http_response_code(400);
            echo json_encode(["success" => false]);
            return;
        }
        $id = $_POST['activo_id'];
        $uploadDir = __DIR__ . '/../../../../public_html/uploads/activos/';
        if (!is_dir($uploadDir))
            mkdir($uploadDir, 0777, true);

        $fileName = "act_{$id}_" . time() . "_" . basename($_FILES['archivo']['name']);
        if (move_uploaded_file($_FILES['archivo']['tmp_name'], $uploadDir . $fileName)) {
            $repo = new MantencionRepository();
            $repo->addDoc($id, $_FILES['archivo']['name'], "/uploads/activos/" . $fileName);
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al mover archivo"]);
        }
    }
    public function storeActivo()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $repo = new MantencionRepository();
        try {
            $repo->createActivo($data);
            echo json_encode(["success" => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function finalizar()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;
        $usuarioId = 1;

        try {
            if (!$id) throw new \Exception("Falta ID");
            
            $repo = new MantencionRepository();
            $repo->finalizarOT($id, $usuarioId);
            
            echo json_encode(["success" => true, "message" => "OT Finalizada. Pendientes cancelados/devueltos."]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}