<?php
namespace App\Controllers;
use App\Utils\ErrorHelper;

use App\Services\MantencionService;
use App\Services\PDFService;
use App\Middleware\AuthMiddleware;
use App\Database\Database;
use Exception;

class MantencionController
{
    private $service;

    public function __construct()
    {
        $this->service = new MantencionService();
    }

    // Catálogo liviano de insumos para usuarios de mantenimiento (crear/editar OTs)
    public function insumosParaOT()
    {
        try {
            $db = Database::getConnection();
            $stmt = $db->query("SELECT id, nombre, codigo_sku, unidad_medida, stock_actual FROM insumos WHERE deleted_at IS NULL ORDER BY nombre ASC");
            echo json_encode(["success" => true, "data" => $stmt->fetchAll(\PDO::FETCH_ASSOC)]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
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

        $userId = AuthMiddleware::getCurrentUserId() ?: 0;
        $rol = AuthMiddleware::getUser()->rol ?? '';

        $tieneMantVer = AuthMiddleware::checkPermissionSilently('mant_ver');
        if ($rol !== 'Admin' && !$tieneMantVer) {
            if (!$this->service->getRepo()->isUserAssignedToOT((int)$id, (int)$userId)) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Acceso denegado."]);
                return;
            }
        }

        echo json_encode(["success" => true, "data" => $this->service->obtenerDetalleOT($id, $userId)]);
    }

    public function tiposPermiso()
    {
        echo json_encode(["success" => true, "data" => $this->service->listarTiposPermiso()]);
    }

    public function tiposTrabajo()
    {
        echo json_encode(["success" => true, "data" => $this->service->listarTiposTrabajo()]);
    }

    public function store($usuarioId)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            if (!$usuarioId) {
                throw new Exception("Usuario no identificado");
            }

            if (empty($data['titulo']) || trim($data['titulo']) === '') {
                throw new Exception("El título de la OT es obligatorio.");
            }

            $payload = [
                'usuario_id' => $usuarioId,
                'titulo' => trim($data['titulo']),
                'activo_id' => $data['activo_id'] ?? null,
                'sub_activo_id' => $data['sub_activo_id'] ?? null,
                'observacion' => $data['observacion'] ?? '',
                'origen_tipo' => $data['origen_tipo'] ?? 'Interna',
                'area_negocio' => $data['area_negocio'] ?? null,
                'centro_costo_ot' => $data['centro_costo_ot'] ?? null,
                'solicitante_externo' => $data['solicitante_externo'] ?? null,
                'prioridad' => $data['prioridad'] ?? 'MEDIA',
                'ubicacion' => $data['ubicacion'] ?? null,
                'usuario_solicitante_id' => $usuarioId,
                'asignados' => $data['asignados'] ?? [],
                'items' => $data['items'] ?? [],
                'requiere_permiso' => $data['requiere_permiso'] ?? 0,
                'tipo_permiso_id' => $data['tipo_permiso_id'] ?? null,
                'descripcion_permiso' => $data['descripcion_permiso'] ?? null
            ];

            $id = $this->service->crearOT($payload, $usuarioId);

            echo json_encode(["success" => true, "message" => "Solicitud #$id creada correctamente"]);
        } catch (Exception $e) {
            http_response_code(400); 
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
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
            echo json_encode(["success" => false, "message" => "Error al actualizar: " . ErrorHelper::safeMessage($e)]);
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
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function reabrirOT()
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            $otId = $data['id'] ?? null;

            if (!$otId) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Falta ID de la OT."]);
                return;
            }

            $this->service->reabrirOT($otId);
            echo json_encode(["success" => true, "message" => "OT reabierta correctamente."]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
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
            $force = !empty($data['force']);
            $resultado = $this->service->finalizarTarea($otId, $usuarioId, $notas, $force);

            echo json_encode([
                "success" => true,
                "message" => $resultado['message'],
                "data" => $resultado
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
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
        if (!empty($data['estado_activo'])) {
            $estadoUpper = strtoupper(trim($data['estado_activo']));
            if ($estadoUpper === 'EN MANTENCION' || $estadoUpper === 'EN_MANTENCION' || $estadoUpper === 'EN MANTENCIÓN') {
                $data['estado_activo'] = 'EN_MANTENCION';
            } elseif ($estadoUpper === 'FUERA DE SERVICIO' || $estadoUpper === 'FUERA' || $estadoUpper === 'BAJA') {
                $data['estado_activo'] = 'BAJA';
            } else {
                $data['estado_activo'] = 'OPERATIVO';
            }
        } else {
            $data['estado_activo'] = 'OPERATIVO'; 
        }

        try {
            $this->service->crearActivo($data, $files);
            echo json_encode(["success" => true, "message" => "Activo creado con imágenes"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
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
        if (!empty($data['estado_activo'])) {
            $estadoUpper = strtoupper(trim($data['estado_activo']));
            if ($estadoUpper === 'EN MANTENCION' || $estadoUpper === 'EN_MANTENCION' || $estadoUpper === 'EN MANTENCIÓN') {
                $data['estado_activo'] = 'EN_MANTENCION';
            } elseif ($estadoUpper === 'FUERA DE SERVICIO' || $estadoUpper === 'FUERA' || $estadoUpper === 'BAJA') {
                $data['estado_activo'] = 'BAJA';
            } else {
                $data['estado_activo'] = 'OPERATIVO';
            }
        } else {
            $data['estado_activo'] = 'OPERATIVO';
        }

        try {
            $this->service->editarActivo($data, $files);
            echo json_encode(["success" => true, "message" => "Activo actualizado"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
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
            $code = (strpos(ErrorHelper::safeMessage($e), 'No se puede eliminar') !== false) ? 400 : 500;
            http_response_code($code);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
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
        $tipo = $_GET['tipo'] ?? null;
        $activoId = $_GET['activo_id'] ?? null;

        try {
            if ($tipo === 'principal' && $activoId) {
                $db = \App\Database\Database::getConnection();
                $stmtChk = $db->prepare("SELECT id FROM activos WHERE id = ?");
                $stmtChk->execute([(int) $activoId]);
                if (!$stmtChk->fetch()) {
                    http_response_code(404);
                    echo json_encode(["success" => false, "message" => "Activo no encontrado."]);
                    return;
                }
                $db->prepare("UPDATE activos SET imagen_url = NULL WHERE id = ?")->execute([(int) $activoId]);
                echo json_encode(["success" => true, "message" => "Portada principal eliminada"]);
                return;
            }
            if (!$id || $id == '-1') {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID de imagen de galería faltante"]);
                return;
            }
            $this->service->eliminarImagenGaleria($id);
            echo json_encode(["success" => true, "message" => "Imagen de galería eliminada"]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al eliminar: " . ErrorHelper::safeMessage($e)]);
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
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
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
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
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
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
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
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
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
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
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
            echo "Error generando PDF: " . ErrorHelper::safeMessage($e);
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
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
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
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
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
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
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
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
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
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function asignarOT()
    {
        AuthMiddleware::hasPermission('mant_editar');
        $data = json_decode(file_get_contents("php://input"), true);
        $otId = $data['ot_id'] ?? null;
        if (!$otId) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Falta ot_id"]);
            return;
        }
        try {
            $asignados = isset($data['asignados']) ? array_map('intval', $data['asignados']) : [];
            $ubicacion = array_key_exists('ubicacion', $data) ? $data['ubicacion'] : null;
            $this->service->asignarOT($otId, $asignados, $ubicacion);
            echo json_encode(["success" => true, "message" => "Asignación actualizada."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }
}