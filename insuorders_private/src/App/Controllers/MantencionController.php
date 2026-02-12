<?php
namespace App\Controllers;

use App\Services\MantencionService;
use App\Services\PDFService;
use App\Middleware\AuthMiddleware;
use Exception;

class MantencionController
{
    private $service;

    public function __construct()
    {
        $this->service = new MantencionService();
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
            if (!$usuarioId) {
                throw new Exception("Usuario no identificado");
            }

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
        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Falta ID"]);
            return;
        }

        try {
            $this->service->anularOT($id);
            echo json_encode(["success" => true, "message" => "Orden anulada correctamente"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
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
        echo json_encode(["success" => true, "data" => $this->service->listarActivos()]);
    }

    public function centrosCosto()
    {
        echo json_encode(["success" => true, "data" => $this->service->listarCentrosCosto()]);
    }

    public function storeActivo()
    {
        $data = $_POST;
        $files = $_FILES;

        if (empty($data['codigo_interno']) || empty($data['nombre'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Datos incompletos"]);
            return;
        }

        try {
            $this->service->crearActivo($data, $files);
            echo json_encode(["success" => true, "message" => "Activo creado con imágenes"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function editarActivo()
    {
        $data = $_POST;
        $files = $_FILES;

        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Falta ID"]);
            return;
        }

        try {
            $this->service->editarActivo($data, $files);
            echo json_encode(["success" => true, "message" => "Activo actualizado"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function deleteActivo()
    {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Falta el ID del activo"]);
            return;
        }

        try {
            $this->service->eliminarActivo($id);
            echo json_encode(["success" => true, "message" => "Activo eliminado correctamente."]);
        } catch (Exception $e) {
            $code = (strpos($e->getMessage(), 'No se puede eliminar') !== false) ? 400 : 500;
            http_response_code($code);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function galeria()
    {
        $id = $_GET['id'] ?? 0;
        echo json_encode(["success" => true, "data" => $this->service->obtenerGaleria($id)]);
    }

    public function eliminarImagen()
    {
        AuthMiddleware::hasPermission('activos_editar');
        $id = $_GET['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID de imagen faltante"]);
            return;
        }

        try {
            $this->service->eliminarImagenGaleria($id);
            echo json_encode(["success" => true, "message" => "Imagen eliminada"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al eliminar: " . $e->getMessage()]);
        }
    }

    // =================================================================================
    // 3. KITS DE REPUESTOS (Mantenimiento Preventivo)
    // =================================================================================

    public function getKit()
    {
        $id = $_GET['id'] ?? 0;
        echo json_encode(["success" => true, "data" => $this->service->obtenerKitActivo($id)]);
    }

    public function saveKit()
    {
        $d = json_decode(file_get_contents("php://input"), true);
        try {
            $this->service->agregarItemKit($d);
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
            $this->service->actualizarCantidadKit($d);
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
            if (!$activoId || !$insumoId) {
                throw new Exception("Faltan IDs");
            }
            $this->service->removerItemKit($activoId, $insumoId);
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
        echo json_encode(["success" => true, "data" => $this->service->listarDocumentos($id)]);
    }

    public function uploadDoc()
    {
        if (!isset($_FILES['archivo']) || !isset($_POST['activo_id'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Datos faltantes"]);
            return;
        }

        try {
            $url = $this->service->subirDocumento($_POST['activo_id'], $_FILES['archivo']);
            echo json_encode(["success" => true, "url" => $url]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function deleteDoc()
    {
        $id = $_GET['id'] ?? 0;
        try {
            $this->service->eliminarDocumento($id);
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
        if (ob_get_length()) {
            ob_clean();
        }

        $id = $_GET['id'] ?? 0;
        $type = $_GET['type'] ?? 'sol';

        try {
            $otData = $this->service->obtenerHeaderOT($id);
            $pdf = new PDFService();

            if ($type === 'entrega') {
                $entregas = $this->service->obtenerEntregasOT($id);
                echo $pdf->generarPdfEntrega($otData, $entregas);
            } else {
                $detalles = $this->service->obtenerDetallesOT($id);
                echo $pdf->generarPdfOT($otData, $detalles);
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

    // =================================================================================
    // 6. GESTIÓN DE BODEGA E INVENTARIO (NUEVOS ENDPOINTS)
    // =================================================================================

    public function pendientesEntrega()
    {
        try {
            echo json_encode([
                "success" => true,
                "data" => $this->service->listarPendientesEntrega()
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function entregarMaterial()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            $usuarioId = AuthMiddleware::verify();

            $detalleId = $data['detalle_id'] ?? null;
            $cantidad = $data['cantidad'] ?? 0;
            $receptorId = $data['receptor_id'] ?? null;

            if (!$detalleId || !$cantidad || !$receptorId) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Faltan datos de entrega"]);
                return;
            }

            $this->service->realizarEntregaMaterial($detalleId, $usuarioId, $cantidad, $receptorId);

            echo json_encode(["success" => true, "message" => "Material entregado correctamente"]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function devolverMaterial()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            $bodegueroId = AuthMiddleware::verify();
            $detalleId = $data['detalle_id'] ?? null;
            $cantidad = $data['cantidad'] ?? 0;

            if (!$detalleId || !$cantidad) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Faltan datos de devolución"]);
                return;
            }

            $this->service->realizarDevolucionMaterial($detalleId, $cantidad, $bodegueroId);

            echo json_encode(["success" => true, "message" => "Devolución registrada correctamente"]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function cierreAdministrativo()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Falta ID de OT"]);
            return;
        }

        try {
            AuthMiddleware::verify();

            $this->service->cierreAdministrativoOT($id);
            echo json_encode(["success" => true, "message" => "OT cerrada administrativamente y stock liberado."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}