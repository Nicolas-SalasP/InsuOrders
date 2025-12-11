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

    // --- ACTIVOS (MÁQUINAS) ---
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

    // --- GESTIÓN DOCUMENTAL ACTIVOS ---
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

    // --- KITS DE REPUESTOS ---
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
    }

    public function removeInsumoFromKit($activoId, $insumoId)
    {
        $sql = "DELETE FROM activos_insumos WHERE activo_id=:a AND insumo_id=:i";
        $this->db->prepare($sql)->execute([':a' => $activoId, ':i' => $insumoId]);
    }

    public function updateKitQuantity($activoId, $insumoId, $cantidad)
    {
        $sql = "UPDATE activos_insumos SET cantidad_default = :cant WHERE activo_id = :aid AND insumo_id = :iid";
        $this->db->prepare($sql)->execute([
            ':cant' => $cantidad,
            ':aid' => $activoId,
            ':iid' => $insumoId
        ]);
    }

    // --- SOLICITUDES (OT) ---

    public function getSolicitudes()
    {
        $sql = "SELECT 
                    s.*, 
                    a.nombre as activo, a.codigo_interno as activo_codigo,
                    u.nombre as solicitante_nombre, u.apellido as solicitante_apellido,
                    e.nombre as estado, e.id as estado_id
                FROM solicitudes_ot s
                LEFT JOIN activos a ON s.activo_id = a.id
                JOIN usuarios u ON s.usuario_solicitante_id = u.id
                JOIN estados_solicitud e ON s.estado_id = e.id
                ORDER BY s.id DESC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    // === AQUÍ ESTABA EL ERROR DE DUPLICIDAD ===
    public function getDetallesOT($id)
    {
        $sql = "SELECT 
                    d.id as detalle_id,
                    d.insumo_id as id,
                    d.cantidad, 
                    d.cantidad_entregada,
                    d.estado_linea,
                    i.nombre, 
                    i.codigo_sku, 
                    i.stock_actual, 
                    i.unidad_medida, 
                    i.precio_costo as precio,
                    oc.id as oc_id,
                    prov.nombre as oc_proveedor,
                    
                    -- CORRECCIÓN: Agrupar nombres para evitar filas duplicadas
                    GROUP_CONCAT(DISTINCT emp.nombre_completo SEPARATOR ', ') as retirado_por,
                    MAX(mov.fecha) as fecha_retiro

                FROM detalle_solicitud d
                JOIN insumos i ON d.insumo_id = i.id
                LEFT JOIN ordenes_compra oc ON d.orden_compra_id = oc.id
                LEFT JOIN proveedores prov ON oc.proveedor_id = prov.id
                -- Solo unimos movimientos de SALIDA (tipo 2)
                LEFT JOIN movimientos_inventario mov ON mov.referencia_id = d.id AND mov.tipo_movimiento_id = 2
                LEFT JOIN empleados emp ON mov.empleado_id = emp.id
                
                WHERE d.solicitud_id = :id
                GROUP BY d.id"; // <--- ESTO EVITA QUE SE DUPLIQUEN LOS INSUMOS

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createSolicitud($cabecera)
    {
        $sql = "INSERT INTO solicitudes_ot (
                    usuario_solicitante_id, activo_id, estado_id, descripcion_trabajo,
                    origen_tipo, origen_referencia, solicitante_externo, fecha_solicitud_externa,
                    area_negocio, centro_costo_ot
                ) VALUES (
                    :user, :activo, 1, :desc,
                    :otipo, :oref, :osol, :ofech,
                    :area, :cc
                )";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':user' => $cabecera['usuario_id'],
            ':activo' => !empty($cabecera['activo_id']) ? $cabecera['activo_id'] : null,
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
        $sql = "INSERT INTO detalle_solicitud (solicitud_id, insumo_id, cantidad, estado_linea) 
                VALUES (:sid, :iid, :cant, :estado)";
        $this->db->prepare($sql)->execute([
            ':sid' => $item['solicitud_id'],
            ':iid' => $item['insumo_id'],
            ':cant' => $item['cantidad'],
            ':estado' => $item['estado_linea'] ?? 'PENDIENTE'
        ]);
    }

    // --- FINALIZACIÓN Y ANULACIÓN ---

    public function finalizar()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'];

        try {
            $this->db->beginTransaction();

            $stmtCheck = $this->db->prepare("SELECT COALESCE(SUM(cantidad_entregada), 0) FROM detalle_solicitud WHERE solicitud_id = :id");
            $stmtCheck->execute([':id' => $id]);
            $totalEntregado = floatval($stmtCheck->fetchColumn());

            $nuevoEstado = ($totalEntregado > 0.001) ? 3 : 5;

            $this->db->prepare("UPDATE solicitudes_ot SET estado_id = :st, fecha_cierre = NOW() WHERE id = :id")
                ->execute([':st' => $nuevoEstado, ':id' => $id]);

            $estadoLinea = ($nuevoEstado == 5) ? 'ANULADO' : 'FINALIZADO';

            $this->db->prepare("UPDATE insumos i 
                                JOIN detalle_solicitud ds ON i.id = ds.insumo_id
                                SET i.stock_actual = i.stock_actual + (ds.cantidad - ds.cantidad_entregada)
                                WHERE ds.solicitud_id = :id AND ds.estado_linea = 'RESERVADO'")
                ->execute([':id' => $id]);

            $this->db->prepare("UPDATE detalle_solicitud SET estado_linea = :st WHERE solicitud_id = :id")
                ->execute([':st' => $estadoLinea, ':id' => $id]);

            $this->db->commit();

            $msg = ($nuevoEstado == 5) ? "OT cerrada como CANCELADA (sin consumo)." : "OT Completada Exitosamente.";
            echo json_encode(["success" => true, "message" => $msg]);

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
            $this->updateEstado($id, 6); // Estado 6 = Anulada
            $this->db->prepare("UPDATE detalle_solicitud SET estado_linea = 'ANULADO' WHERE solicitud_id = :id")->execute([':id' => $id]);
            $this->db->commit();
            echo json_encode(["success" => true]);
        } catch (\Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    // --- BODEGA ---
    public function getPendientesEntrega()
    {
        $sql = "SELECT 
                    ds.id as detalle_id, ds.cantidad, ds.cantidad_entregada,
                    (ds.cantidad - ds.cantidad_entregada) as cantidad_pendiente,
                    s.fecha_solicitud as fecha_solicitud,
                    i.id as insumo_id, i.nombre as insumo, i.codigo_sku, i.unidad_medida,
                    s.id as ot_id, u.nombre as solicitante, u.apellido as solicitante_apellido,
                    a.nombre as maquina
                FROM detalle_solicitud ds
                JOIN solicitudes_ot s ON ds.solicitud_id = s.id
                JOIN insumos i ON ds.insumo_id = i.id
                JOIN usuarios u ON s.usuario_solicitante_id = u.id
                LEFT JOIN activos a ON s.activo_id = a.id
                WHERE ds.estado_linea IN ('EN_BODEGA', 'PARCIAL', 'RESERVADO') 
                AND (ds.cantidad - ds.cantidad_entregada) > 0.01
                AND s.estado_id IN (1, 2, 4)
                ORDER BY s.id ASC";
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

            $pendiente = (float) $linea['cantidad'] - (float) $linea['cantidad_entregada'];
            if ((float) $cantidadEntregar > $pendiente)
                throw new \Exception("Exceso de entrega");

            $sqlMov = "INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, referencia_id, empleado_id) 
                       VALUES (:iid, 2, :cant, :uid, 'Entrega OT', :ref, :emp)";
            $this->db->prepare($sqlMov)->execute([
                ':iid' => $linea['insumo_id'],
                ':cant' => $cantidadEntregar,
                ':uid' => $usuarioId,
                ':ref' => $detalleId,
                ':emp' => $receptorId
            ]);

            $this->db->prepare("UPDATE insumos SET stock_actual = stock_actual - :cant WHERE id = :id")
                ->execute([':cant' => $cantidadEntregar, ':id' => $linea['insumo_id']]);

            $this->db->prepare("UPDATE insumo_stock_ubicacion SET cantidad = cantidad - :cant 
                                WHERE insumo_id = :iid AND cantidad >= :cant LIMIT 1")
                ->execute([':cant' => $cantidadEntregar, ':iid' => $linea['insumo_id']]);

            $nuevaEntregada = $linea['cantidad_entregada'] + $cantidadEntregar;
            $nuevoEstado = ($nuevaEntregada >= $linea['cantidad']) ? 'ENTREGADO' : 'PARCIAL';

            $this->db->prepare("UPDATE detalle_solicitud SET cantidad_entregada = :cant, estado_linea = :st WHERE id = :id")
                ->execute([':cant' => $nuevaEntregada, ':st' => $nuevoEstado, ':id' => $detalleId]);

            // Si es la primera entrega, pasamos OT a "En Proceso" (2)
            $this->db->prepare("UPDATE solicitudes_ot SET estado_id = 2 WHERE id = :id AND estado_id = 1")->execute([':id' => $linea['solicitud_id']]);

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    // --- PDF DATA ---
    public function getOTHeader($id)
    {
        $sql = "SELECT s.*, 
                       a.nombre as activo, a.codigo_interno as activo_codigo, a.centro_costo as activo_centro_costo,
                       u.nombre as solicitante_nombre, u.apellido as solicitante_apellido,
                       e.nombre as estado 
                FROM solicitudes_ot s
                LEFT JOIN activos a ON s.activo_id = a.id
                JOIN usuarios u ON s.usuario_solicitante_id = u.id
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