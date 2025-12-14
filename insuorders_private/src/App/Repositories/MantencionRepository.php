<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;

class MantencionRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // =================================================================================
    // 1. ACTIVOS (MÁQUINAS)
    // =================================================================================

    public function getActivos()
    {
        return $this->db->query("SELECT * FROM activos ORDER BY nombre ASC")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createActivo($data)
    {
        $sql = "INSERT INTO activos (codigo_interno, nombre, tipo, ubicacion, descripcion, centro_costo) 
                VALUES (:cod, :nom, :tipo, :ubi, :desc, :cc)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':cod' => $data['codigo_interno'],
            ':nom' => $data['nombre'],
            ':tipo' => $data['tipo'],
            ':ubi' => $data['ubicacion'],
            ':desc' => $data['descripcion'],
            ':cc' => $data['centro_costo'] ?? null
        ]);
        return $this->db->lastInsertId();
    }

    public function updateActivo($data)
    {
        $sql = "UPDATE activos SET 
                    codigo_interno = :cod, 
                    nombre = :nom, 
                    tipo = :tipo, 
                    ubicacion = :ubi, 
                    descripcion = :desc,
                    centro_costo = :cc
                WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':cod' => $data['codigo_interno'],
            ':nom' => $data['nombre'],
            ':tipo' => $data['tipo'],
            ':ubi' => $data['ubicacion'],
            ':desc' => $data['descripcion'],
            ':cc' => $data['centro_costo'] ?? null,
            ':id' => $data['id']
        ]);
    }

    public function getCentrosCosto()
    {
        return $this->db->query("SELECT * FROM centros_costo ORDER BY codigo ASC")->fetchAll(PDO::FETCH_ASSOC);
    }

    // =================================================================================
    // 2. GESTIÓN DOCUMENTAL ACTIVOS
    // =================================================================================

    public function addDoc($activoId, $nombre, $url)
    {
        $sql = "INSERT INTO activos_docs (activo_id, nombre_archivo, url_archivo) VALUES (:id, :nom, :url)";
        $this->db->prepare($sql)->execute([':id' => $activoId, ':nom' => $nombre, ':url' => $url]);
    }

    public function getDocs($activoId)
    {
        $sql = "SELECT * FROM activos_docs WHERE activo_id = :id ORDER BY fecha_subida DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $activoId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function deleteDoc($docId)
    {
        $stmt = $this->db->prepare("SELECT url_archivo FROM activos_docs WHERE id = :id");
        $stmt->execute([':id' => $docId]);
        $doc = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($doc) {
            $filePath = __DIR__ . '/../../../../public_html' . $doc['url_archivo'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            $this->db->prepare("DELETE FROM activos_docs WHERE id = :id")->execute([':id' => $docId]);
        }
    }

    // =================================================================================
    // 3. KITS DE REPUESTOS (STOCK MÍNIMO DINÁMICO)
    // =================================================================================

    private function recalcularMinimoInsumo($insumoId)
    {
        $sql = "SELECT SUM(cantidad_default) FROM activos_insumos WHERE insumo_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $insumoId]);
        $totalRequerido = $stmt->fetchColumn() ?: 0;

        $upd = "UPDATE insumos SET stock_minimo = :min WHERE id = :id";
        $this->db->prepare($upd)->execute([':min' => $totalRequerido, ':id' => $insumoId]);
    }

    public function getKitActivo($activoId)
    {
        $sql = "SELECT 
                    ai.insumo_id as id, i.nombre, i.codigo_sku, 
                    ai.cantidad_default as cantidad, i.stock_actual, i.unidad_medida,
                    i.precio_costo as precio 
                FROM activos_insumos ai
                JOIN insumos i ON ai.insumo_id = i.id
                WHERE ai.activo_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $activoId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addInsumoToKit($activoId, $insumoId, $cant)
    {
        $check = $this->db->prepare("SELECT id FROM activos_insumos WHERE activo_id=:a AND insumo_id=:i");
        $check->execute([':a' => $activoId, ':i' => $insumoId]);

        if ($check->fetch()) {
            $sql = "UPDATE activos_insumos SET cantidad_default = :c WHERE activo_id=:a AND insumo_id=:i";
        } else {
            $sql = "INSERT INTO activos_insumos (activo_id, insumo_id, cantidad_default) VALUES (:a, :i, :c)";
        }
        $this->db->prepare($sql)->execute([':a' => $activoId, ':i' => $insumoId, ':c' => $cant]);

        $this->recalcularMinimoInsumo($insumoId);
    }

    public function removeInsumoFromKit($activoId, $insumoId)
    {
        $sql = "DELETE FROM activos_insumos WHERE activo_id=:a AND insumo_id=:i";
        $this->db->prepare($sql)->execute([':a' => $activoId, ':i' => $insumoId]);

        $this->recalcularMinimoInsumo($insumoId);
    }

    public function updateKitQuantity($activoId, $insumoId, $cantidad)
    {
        $sql = "UPDATE activos_insumos SET cantidad_default = :cant WHERE activo_id = :aid AND insumo_id = :iid";
        $this->db->prepare($sql)->execute([
            ':cant' => $cantidad,
            ':aid' => $activoId,
            ':iid' => $insumoId
        ]);

        $this->recalcularMinimoInsumo($insumoId);
    }

    // =================================================================================
    // 4. SOLICITUDES OT (MANTENCIÓN)
    // =================================================================================

    public function getSolicitudes()
    {
        $sql = "SELECT 
                    s.*, 
                    COALESCE(a.nombre, 'SERVICIO GENERAL') as activo, 
                    COALESCE(a.codigo_interno, 'N/A') as activo_codigo,
                    u.nombre as solicitante_nombre, u.apellido as solicitante_apellido,
                    e.nombre as estado, e.id as estado_id,
                    s.solicitante_externo, s.area_negocio, s.centro_costo_ot
                FROM solicitudes_ot s
                LEFT JOIN activos a ON s.activo_id = a.id
                JOIN usuarios u ON s.usuario_solicitante_id = u.id
                JOIN estados_solicitud e ON s.estado_id = e.id
                ORDER BY s.id DESC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getDetallesOT($id)
    {
        $sql = "SELECT d.id as detalle_id, d.insumo_id as id, d.cantidad, d.cantidad_entregada, d.estado_linea,
                       i.nombre, i.codigo_sku, i.stock_actual, i.unidad_medida, 
                       GROUP_CONCAT(DISTINCT emp.nombre_completo SEPARATOR ', ') as retirado_por,
                       MAX(mov.fecha) as fecha_retiro
                FROM detalle_solicitud d
                JOIN insumos i ON d.insumo_id = i.id
                LEFT JOIN movimientos_inventario mov ON mov.referencia_id = d.id AND mov.tipo_movimiento_id = 2
                LEFT JOIN empleados emp ON mov.empleado_id = emp.id
                WHERE d.solicitud_id = :id
                GROUP BY d.id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createSolicitud($cabecera)
    {
        $activoId = !empty($cabecera['activo_id']) ? $cabecera['activo_id'] : null;

        $sql = "INSERT INTO solicitudes_ot (
                    usuario_solicitante_id, activo_id, estado_id, descripcion_trabajo,
                    origen_tipo, origen_referencia, solicitante_externo, fecha_solicitud_externa,
                    area_negocio, centro_costo_ot, fecha_solicitud
                ) VALUES (
                    :user, :activo, 1, :desc,
                    :otipo, :oref, :osol, :ofech,
                    :area, :cc, NOW()
                )";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':user' => $cabecera['usuario_id'],
            ':activo' => $activoId,
            ':desc' => $cabecera['observacion'],
            ':otipo' => $cabecera['origen_tipo'] ?? 'Interna',
            ':oref' => $cabecera['origen_referencia'] ?? null,
            ':osol' => $cabecera['solicitante_externo'] ?? null,
            ':ofech' => $cabecera['fecha_solicitud_externa'] ?? null,
            ':area' => $cabecera['area_negocio'] ?? null,
            ':cc' => $cabecera['centro_costo_ot'] ?? null
        ]);
        return $this->db->lastInsertId();
    }

    public function updateSolicitud($id, $activoId, $observacion)
    {
        $sql = "UPDATE solicitudes_ot SET activo_id = :activo, descripcion_trabajo = :desc WHERE id = :id";
        $this->db->prepare($sql)->execute([':activo' => $activoId, ':desc' => $observacion, ':id' => $id]);
    }

    public function updateEstado($id, $estadoId)
    {
        $sql = "UPDATE solicitudes_ot SET estado_id = :estado WHERE id = :id";
        $this->db->prepare($sql)->execute([':estado' => $estadoId, ':id' => $id]);
    }

    public function clearDetalles($solicitudId)
    {
        $this->db->prepare("DELETE FROM detalle_solicitud WHERE solicitud_id = :id")->execute([':id' => $solicitudId]);
    }

    public function addDetalle($item)
    {
        $sql = "INSERT INTO detalle_solicitud (solicitud_id, insumo_id, cantidad, cantidad_entregada, estado_linea) 
                VALUES (:sid, :iid, :cant, 0, :estado)";
        $this->db->prepare($sql)->execute([
            ':sid' => $item['solicitud_id'],
            ':iid' => $item['insumo_id'],
            ':cant' => $item['cantidad'],
            ':estado' => $item['estado_linea'] ?? 'PENDIENTE'
        ]);
    }

    // =================================================================================
    // 5. FINALIZACIÓN Y ANULACIÓN DE OT
    // =================================================================================

    public function finalizar()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'];

        try {
            $this->db->beginTransaction();

            // 1. FORZAR ESTADO A COMPLETADA (ID 5)
            $this->db->prepare("UPDATE solicitudes_ot SET estado_id = 5 WHERE id = :id")
                ->execute([':id' => $id]);

            // 2. LIMPIEZA DE PENDIENTES
            // Devolver reservas si las hubiera
            $this->db->prepare("UPDATE insumos i 
                                JOIN detalle_solicitud ds ON i.id = ds.insumo_id
                                SET i.stock_actual = i.stock_actual + (ds.cantidad - ds.cantidad_entregada)
                                WHERE ds.solicitud_id = :id AND ds.estado_linea = 'RESERVADO'")
                ->execute([':id' => $id]);

            // Marcar las líneas no entregadas como CANCELADO para que no aparezcan en Bodega
            $this->db->prepare("UPDATE detalle_solicitud 
                                SET estado_linea = 'CANCELADO' 
                                WHERE solicitud_id = :id 
                                AND estado_linea NOT IN ('ENTREGADO', 'FINALIZADO')")
                ->execute([':id' => $id]);

            $this->db->commit();
            echo json_encode(["success" => true, "message" => "Orden de Trabajo cerrada exitosamente."]);

        } catch (\Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function delete()
    {
        $id = $_GET['id'] ?? null;
        if (!$id)
            return;

        try {
            $this->db->beginTransaction();
            $this->updateEstado($id, 6); // 6 = Anulada
            $this->db->prepare("UPDATE detalle_solicitud SET estado_linea = 'ANULADO' WHERE solicitud_id = :id")->execute([':id' => $id]);
            $this->db->commit();
            echo json_encode(["success" => true]);
        } catch (\Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    // =================================================================================
    // 6. BODEGA (ENTREGAS Y MOVIMIENTOS)
    // =================================================================================

    public function getPendientesEntrega()
    {
        // Filtro actualizado para decimales (> 0.001)
        $sql = "SELECT 
                    ds.id as detalle_id, ds.cantidad, ds.cantidad_entregada,
                    (ds.cantidad - ds.cantidad_entregada) as cantidad_pendiente,
                    s.fecha_solicitud as fecha_solicitud,
                    i.id as insumo_id, i.nombre as insumo, i.codigo_sku, i.unidad_medida, i.stock_actual,
                    s.id as ot_id, u.nombre as solicitante, u.apellido as solicitante_apellido,
                    a.nombre as maquina
                FROM detalle_solicitud ds
                JOIN solicitudes_ot s ON ds.solicitud_id = s.id
                JOIN insumos i ON ds.insumo_id = i.id
                JOIN usuarios u ON s.usuario_solicitante_id = u.id
                LEFT JOIN activos a ON s.activo_id = a.id
                WHERE ds.estado_linea IN ('EN_BODEGA', 'PARCIAL', 'RESERVADO', 'PENDIENTE') 
                AND (ds.cantidad - ds.cantidad_entregada) > 0.001
                AND s.estado_id IN (1, 2, 4)
                ORDER BY s.fecha_requerida ASC, s.id ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function entregarMaterial($detalleId, $usuarioId, $cantidadEntregar, $receptorId)
    {
        try {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("SELECT * FROM detalle_solicitud WHERE id = :id FOR UPDATE");
            $stmt->execute([':id' => $detalleId]);
            $linea = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$linea)
                throw new \Exception("Línea no encontrada");

            // --- CORRECCIÓN CRÍTICA: USO DE FLOATVAL PARA DECIMALES ---
            $solicitado = floatval($linea['cantidad']);
            $yaEntregado = floatval($linea['cantidad_entregada']);
            $pendiente = $solicitado - $yaEntregado;
            $aEntregar = floatval($cantidadEntregar);

            // Validaciones con tolerancia pequeña
            if ($aEntregar > ($pendiente + 0.001))
                throw new \Exception("Exceso de entrega. Pendiente: " . $pendiente);

            $stmtInsumo = $this->db->prepare("SELECT stock_actual FROM insumos WHERE id = :id");
            $stmtInsumo->execute([':id' => $linea['insumo_id']]);
            $stockActual = floatval($stmtInsumo->fetchColumn());

            if ($stockActual < $aEntregar)
                throw new \Exception("Stock insuficiente en bodega.");

            // Registrar movimiento
            $sqlMov = "INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, referencia_id, empleado_id, fecha) 
                       VALUES (:iid, 2, :cant, :uid, 'Entrega OT', :ref, :emp, NOW())";
            $this->db->prepare($sqlMov)->execute([
                ':iid' => $linea['insumo_id'],
                ':cant' => $aEntregar,
                ':uid' => $usuarioId,
                ':ref' => $detalleId,
                ':emp' => $receptorId
            ]);

            // Descontar Stock
            $this->db->prepare("UPDATE insumos SET stock_actual = stock_actual - :cant WHERE id = :id")
                ->execute([':cant' => $aEntregar, ':id' => $linea['insumo_id']]);

            // Actualizar Línea de Solicitud
            $nuevaEntregada = $yaEntregado + $aEntregar;

            // Si se completa (con margen error), estado ENTREGADO
            if ($nuevaEntregada >= ($solicitado - 0.001)) {
                $nuevoEstado = 'ENTREGADO';
                $nuevaEntregada = $solicitado; // Forzar exactitud
            } else {
                $nuevoEstado = 'PARCIAL';
            }

            $this->db->prepare("UPDATE detalle_solicitud SET cantidad_entregada = :cant, estado_linea = :st WHERE id = :id")
                ->execute([':cant' => $nuevaEntregada, ':st' => $nuevoEstado, ':id' => $detalleId]);

            // =================================================================
            // AUTO-CIERRE DE LA OT (Si ya no queda nada pendiente)
            // =================================================================
            $otId = $linea['solicitud_id'];

            // Contamos cuántas líneas quedan pendientes (que no sean ENTREGADO, FINALIZADO, etc.)
            $sqlCheck = "SELECT COUNT(*) FROM detalle_solicitud 
                         WHERE solicitud_id = :id 
                         AND estado_linea NOT IN ('ENTREGADO', 'FINALIZADO', 'ANULADO', 'CANCELADO')";
            $stmtCheck = $this->db->prepare($sqlCheck);
            $stmtCheck->execute([':id' => $otId]);
            $itemsPendientes = $stmtCheck->fetchColumn();

            if ($itemsPendientes == 0) {
                // Si todo fue entregado, pasamos la OT a COMPLETADA (5)
                $this->db->prepare("UPDATE solicitudes_ot SET estado_id = 5 WHERE id = :id")->execute([':id' => $otId]);
            } else {
                // Si aún falta, aseguramos que esté EN PROCESO (2)
                $this->db->prepare("UPDATE solicitudes_ot SET estado_id = 2 WHERE id = :id AND estado_id IN (1, 4)")->execute([':id' => $otId]);
            }

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    // =================================================================================
    // 7. PDF Y EXCEL DATA
    // =================================================================================

    public function getOTHeader($id)
    {
        $sql = "SELECT s.id, s.fecha_solicitud, s.descripcion_trabajo,
                    u.nombre as solicitante_nombre, u.apellido as solicitante_apellido,
                    
                    -- Encabezado Híbrido: Nombre de Máquina o Área de Servicio
                    CASE 
                        WHEN s.activo_id IS NOT NULL THEN a.nombre 
                        ELSE CONCAT('SERVICIO: ', COALESCE(s.area_negocio, 'General')) 
                    END as activo,
                    
                    COALESCE(a.codigo_interno, 'SERV') as activo_codigo,
                    e.nombre as estado,
                    
                    -- Datos extras de Servicio
                    s.solicitante_externo, s.centro_costo_ot, s.area_negocio
                    
                FROM solicitudes_ot s
                JOIN usuarios u ON s.usuario_solicitante_id = u.id
                LEFT JOIN activos a ON s.activo_id = a.id
                JOIN estados_solicitud e ON s.estado_id = e.id
                WHERE s.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getEntregasOT($otId)
    {
        $sql = "SELECT m.fecha, m.cantidad, i.nombre, i.codigo_sku, e.nombre_completo as receptor
                FROM movimientos_inventario m
                JOIN insumos i ON m.insumo_id = i.id
                LEFT JOIN empleados e ON m.empleado_id = e.id
                JOIN detalle_solicitud ds ON m.referencia_id = ds.id
                WHERE m.tipo_movimiento_id = 2 AND ds.solicitud_id = :id
                ORDER BY m.fecha DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $otId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}