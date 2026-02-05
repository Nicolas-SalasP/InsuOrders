<?php
namespace App\Controllers;

use App\Services\MantencionService;
use App\Services\PDFService;
use App\Repositories\MantencionRepository;
use App\Middleware\AuthMiddleware;
use Exception;

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
            if (!$usuarioId) throw new Exception("Usuario no identificado");

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
        } catch (Exception $e) {
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
            $this->service->editarOT($id, $data);
            
            echo json_encode(["success" => true, "message" => "OT Actualizada y Sincronizada correctamente"]);
        } catch (Exception $e) {
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
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            $otId = $data['id'] ?? null;
            $notas = $data['notas'] ?? '';
            
            if (!$otId) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Falta ID de la Orden"]);
                return;
            }
            $usuarioId = AuthMiddleware::verify(); 
            $resultado = $this->service->finalizarTarea($otId, $usuarioId, $notas);
            echo json_encode([
                "success" => true, 
                "message" => $resultado['message'],
                "data" => $resultado
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
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
        $data = $_POST;
        
        if (empty($data['codigo_interno']) || empty($data['nombre'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Datos incompletos"]);
            return;
        }

        try {
            if (!empty($_FILES['imagen_principal']) && $_FILES['imagen_principal']['error'] === UPLOAD_ERR_OK) {
                $data['imagen_url'] = $this->subirImagen($_FILES['imagen_principal']);
            }
            $galeria = [];
            if (!empty($_FILES['galeria_files'])) {
                foreach ($_FILES['galeria_files']['name'] as $key => $name) {
                    if ($_FILES['galeria_files']['error'][$key] === UPLOAD_ERR_OK) {
                        $fileArray = [
                            'name' => $_FILES['galeria_files']['name'][$key],
                            'type' => $_FILES['galeria_files']['type'][$key],
                            'tmp_name' => $_FILES['galeria_files']['tmp_name'][$key],
                            'error' => $_FILES['galeria_files']['error'][$key],
                            'size' => $_FILES['galeria_files']['size'][$key],
                        ];
                        
                        $url = $this->subirImagen($fileArray, 'galeria');
                        if ($url) {
                            $tipo = $_POST['galeria_tipos'][$key] ?? 'General';
                            $galeria[] = ['url' => $url, 'tipo' => $tipo];
                        }
                    }
                }
            }
            $data['galeria'] = $galeria;
            $this->service->crearActivo($data);
            
            echo json_encode(["success" => true, "message" => "Activo creado con imágenes"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function editarActivo()
    {
        $data = $_POST;

        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Falta ID"]);
            return;
        }

        try {
            if (!empty($_FILES['imagen_principal']) && $_FILES['imagen_principal']['error'] === UPLOAD_ERR_OK) {
                $data['imagen_url'] = $this->subirImagen($_FILES['imagen_principal']);
            }
            $galeria = [];
            if (!empty($_FILES['galeria_files'])) {
                foreach ($_FILES['galeria_files']['name'] as $key => $name) {
                    if ($_FILES['galeria_files']['error'][$key] === UPLOAD_ERR_OK) {
                        $fileArray = [
                            'name' => $_FILES['galeria_files']['name'][$key],
                            'type' => $_FILES['galeria_files']['type'][$key],
                            'tmp_name' => $_FILES['galeria_files']['tmp_name'][$key],
                            'error' => $_FILES['galeria_files']['error'][$key],
                            'size' => $_FILES['galeria_files']['size'][$key],
                        ];
                        
                        $url = $this->subirImagen($fileArray, 'galeria');
                        if ($url) {
                            $tipo = $_POST['galeria_tipos'][$key] ?? 'General';
                            $galeria[] = ['url' => $url, 'tipo' => $tipo];
                        }
                    }
                }
            }
            $data['galeria'] = $galeria;
            $this->service->editarActivo($data);
            
            echo json_encode(["success" => true, "message" => "Activo actualizado"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function galeria()
    {
        $id = $_GET['id'] ?? 0;
        echo json_encode(["success" => true, "data" => $this->service->obtenerGaleria($id)]);
    }


    private function subirImagen($file, $subFolder = '') {
        $targetDir = __DIR__ . '/../../../../public_html/uploads/activos/' . $subFolder;
        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0777, true);
        }
        
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('ACT_') . '.' . $extension;
        $targetPath = $targetDir . '/' . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return '/uploads/activos/' . $subFolder . ($subFolder ? '/' : '') . $filename;
        }
        return null;
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
        } catch (Exception $e) {
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
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function removeKitItem()
    {
        $activoId = $_GET['activo_id'] ?? null;
        $insumoId = $_GET['insumo_id'] ?? null;

        try {
            if (!$activoId || !$insumoId) throw new Exception("Faltan IDs");
            $this->repo->removeInsumoFromKit($activoId, $insumoId);
            echo json_encode(["success" => true]);
        } catch (Exception $e) {
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
            } catch (Exception $e) {
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
        } catch (Exception $e) {
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
        } catch (Exception $e) {
            http_response_code(500);
            echo "Error generando PDF: " . $e->getMessage();
        }
    }

    public function guardarPlantilla()
    {
        try {
            AuthMiddleware::verify();
            
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $input['activo_id'] ?? null;
            $plantilla = $input['plantilla'] ?? null;
            $this->service->guardarPlantilla($id, $plantilla);

            echo json_encode([
                "success" => true, 
                "message" => "Plantilla actualizada correctamente"
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}