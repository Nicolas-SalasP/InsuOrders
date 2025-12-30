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

    private function resolveCentroCostoId($input)
    {
        if (empty($input))
            return null;
        $stmt = $this->db->prepare("SELECT id FROM centros_costo WHERE id = :val");
        $stmt->execute([':val' => $input]);
        if ($stmt->fetch())
            return $input;
        $stmt = $this->db->prepare("SELECT id FROM centros_costo WHERE codigo = :val");
        $stmt->execute([':val' => $input]);
        return $stmt->fetchColumn() ?: null;
    }

    public function getActivos()
    {
        $sql = "SELECT a.*, COALESCE(cc.nombre, cc_legacy.nombre) as centro_costo_nombre, COALESCE(cc.codigo, cc_legacy.codigo) as centro_costo_codigo, COALESCE(cc.id, cc_legacy.id) as centro_costo_real_id
                FROM activos a
                LEFT JOIN centros_costo cc ON a.centro_costo_id = cc.id
                LEFT JOIN centros_costo cc_legacy ON a.centro_costo_id = cc_legacy.codigo
                ORDER BY a.nombre ASC";
        $data = $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        foreach ($data as &$row) {
            if (empty($row['centro_costo_id']) && !empty($row['centro_costo_real_id'])) {
                $row['centro_costo_id'] = $row['centro_costo_real_id'];
            }
        }
        return $data;
    }

    public function createActivo($data)
    {
        $check = $this->db->prepare("SELECT id FROM activos WHERE codigo_interno = :cod");
        $check->execute([':cod' => $data['codigo_interno']]);
        if ($check->fetch())
            throw new \Exception("El código '{$data['codigo_interno']}' ya existe.");

        $ccId = $this->resolveCentroCostoId($data['centro_costo'] ?? null);
        $sql = "INSERT INTO activos (codigo_interno, nombre, tipo, ubicacion, descripcion, centro_costo_id) VALUES (:cod, :nom, :tipo, :ubi, :desc, :cc)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':cod' => $data['codigo_interno'], ':nom' => $data['nombre'], ':tipo' => $data['tipo'], ':ubi' => $data['ubicacion'], ':desc' => $data['descripcion'] ?? '', ':cc' => $ccId]);
        return $this->db->lastInsertId();
    }

    public function updateActivo($data)
    {
        $ccId = $this->resolveCentroCostoId($data['centro_costo'] ?? null);
        $sql = "UPDATE activos SET codigo_interno = :cod, nombre = :nom, tipo = :tipo, ubicacion = :ubi, descripcion = :desc, centro_costo_id = :cc WHERE id = :id";
        $this->db->prepare($sql)->execute([':cod' => $data['codigo_interno'], ':nom' => $data['nombre'], ':tipo' => $data['tipo'], ':ubi' => $data['ubicacion'], ':desc' => $data['descripcion'] ?? '', ':cc' => $ccId, ':id' => $data['id']]);
    }

    public function getCentrosCosto()
    {
        return $this->db->query("SELECT * FROM centros_costo ORDER BY codigo ASC")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addDoc($activoId, $nombre, $url)
    {
        $this->db->prepare("INSERT INTO activos_docs (activo_id, nombre_archivo, url_archivo) VALUES (:id, :nom, :url)")->execute([':id' => $activoId, ':nom' => $nombre, ':url' => $url]);
    }

    public function getDocs($activoId)
    {
        $stmt = $this->db->prepare("SELECT * FROM activos_docs WHERE activo_id = :id ORDER BY fecha_subida DESC");
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
            if (file_exists($filePath))
                unlink($filePath);
            $this->db->prepare("DELETE FROM activos_docs WHERE id = :id")->execute([':id' => $docId]);
        }
    }

    private function recalcularMinimoInsumo($insumoId)
    {
        $sql = "SELECT SUM(cantidad_default) FROM activos_insumos WHERE insumo_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $insumoId]);
        $total = $stmt->fetchColumn() ?: 0;
        $this->db->prepare("UPDATE insumos SET stock_minimo = :min WHERE id = :id")->execute([':min' => $total, ':id' => $insumoId]);
    }

    public function getKitActivo($activoId)
    {
        $sql = "SELECT ai.insumo_id as id, i.nombre, i.codigo_sku, ai.cantidad_default as cantidad, i.stock_actual, i.unidad_medida, i.precio_costo as precio FROM activos_insumos ai JOIN insumos i ON ai.insumo_id = i.id WHERE ai.activo_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $activoId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addInsumoToKit($activoId, $insumoId, $cant)
    {
        $check = $this->db->prepare("SELECT id FROM activos_insumos WHERE activo_id=:a AND insumo_id=:i");
        $check->execute([':a' => $activoId, ':i' => $insumoId]);
        $sql = $check->fetch() ? "UPDATE activos_insumos SET cantidad_default = :c WHERE activo_id=:a AND insumo_id=:i" : "INSERT INTO activos_insumos (activo_id, insumo_id, cantidad_default) VALUES (:a, :i, :c)";
        $this->db->prepare($sql)->execute([':a' => $activoId, ':i' => $insumoId, ':c' => $cant]);
        $this->recalcularMinimoInsumo($insumoId);
    }

    public function removeInsumoFromKit($activoId, $insumoId)
    {
        $this->db->prepare("DELETE FROM activos_insumos WHERE activo_id=:a AND insumo_id=:i")->execute([':a' => $activoId, ':i' => $insumoId]);
        $this->recalcularMinimoInsumo($insumoId);
    }

    public function updateKitQuantity($activoId, $insumoId, $cantidad)
    {
        $this->db->prepare("UPDATE activos_insumos SET cantidad_default = :c WHERE activo_id = :a AND insumo_id = :i")->execute([':c' => $cantidad, ':a' => $activoId, ':i' => $insumoId]);
        $this->recalcularMinimoInsumo($insumoId);
    }

    public function getSolicitudes()
    {
        $sql = "SELECT s.*, COALESCE(a.nombre, 'SERVICIO GENERAL') as activo, COALESCE(a.codigo_interno, 'N/A') as activo_codigo, u.nombre as solicitante_nombre, u.apellido as solicitante_apellido, e.nombre as estado, e.id as estado_id FROM solicitudes_ot s LEFT JOIN activos a ON s.activo_id = a.id JOIN usuarios u ON s.usuario_solicitante_id = u.id JOIN estados_solicitud e ON s.estado_id = e.id ORDER BY s.id DESC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getDetallesOT($id)
    {
        $sql = "SELECT d.id as detalle_id, d.insumo_id as id, d.cantidad, d.cantidad_entregada, d.estado_linea, i.nombre, i.codigo_sku, i.stock_actual, i.unidad_medida, oc.id as oc_id, prov.nombre as oc_proveedor, GROUP_CONCAT(DISTINCT emp.nombre_completo SEPARATOR ', ') as retirado_por, MAX(mov.fecha) as fecha_retiro FROM detalle_solicitud d JOIN insumos i ON d.insumo_id = i.id LEFT JOIN ordenes_compra oc ON d.orden_compra_id = oc.id LEFT JOIN proveedores prov ON oc.proveedor_id = prov.id LEFT JOIN movimientos_inventario mov ON mov.referencia_id = d.id AND mov.tipo_movimiento_id = 2 LEFT JOIN empleados emp ON mov.empleado_id = emp.id WHERE d.solicitud_id = :id GROUP BY d.id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createOT($data)
    {
        try {
            $this->db->beginTransaction();
            $sql = "INSERT INTO solicitudes_ot (usuario_solicitante_id, activo_id, descripcion_trabajo, origen_tipo, area_negocio, centro_costo_ot, solicitante_externo, estado_id, fecha_solicitud) VALUES (:uid, :aid, :desc, :orig, :area, :cc, :ext, 1, NOW())";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':uid' => $data['usuario_id'], ':aid' => $data['activo_id'], ':desc' => $data['observacion'], ':orig' => $data['origen_tipo'], ':area' => $data['area_negocio'], ':cc' => $data['centro_costo_ot'], ':ext' => $data['solicitante_externo']]);
            $otId = $this->db->lastInsertId();
            if (!empty($data['items'])) {
                $stmtItem = $this->db->prepare("INSERT INTO detalle_solicitud (solicitud_id, insumo_id, cantidad, estado_linea) VALUES (:sid, :iid, :cant, 'PENDIENTE')");
                foreach ($data['items'] as $item) {
                    $stmtItem->execute([':sid' => $otId, ':iid' => $item['insumo_id'] ?? $item['id'] ?? $item['id_producto'], ':cant' => $item['cantidad']]);
                }
            }
            $this->db->commit();
            return $otId;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function updateOT($id, $data)
    {
        try {
            $this->db->beginTransaction();
            $sql = "UPDATE solicitudes_ot SET activo_id = :aid, descripcion_trabajo = :desc, solicitante_externo = :se, centro_costo_ot = :cc, origen_tipo = :ot WHERE id = :id";
            $this->db->prepare($sql)->execute([':aid' => $data['activo_id'] ?: null, ':desc' => $data['observacion'], ':se' => $data['solicitante_externo'] ?: null, ':cc' => $data['centro_costo_ot'] ?: null, ':ot' => $data['origen_tipo'], ':id' => $id]);
            $stmtCurrent = $this->db->prepare("SELECT id FROM detalle_solicitud WHERE solicitud_id = :sid");
            $stmtCurrent->execute([':sid' => $id]);
            $idsEnBD = $stmtCurrent->fetchAll(PDO::FETCH_COLUMN);
            $idsRecibidos = [];
            foreach ($data['items'] as $item) {
                if (!empty($item['id_linea'])) {
                    $idsRecibidos[] = $item['id_linea'];
                }
            }
            $idsParaBorrar = array_diff($idsEnBD, $idsRecibidos);
            if (!empty($idsParaBorrar)) {
                $placeholders = implode(',', array_fill(0, count($idsParaBorrar), '?'));
                $this->db->prepare("DELETE FROM detalle_solicitud WHERE id IN ($placeholders)")->execute(array_values($idsParaBorrar));
            }
            $stmtUpdate = $this->db->prepare("UPDATE detalle_solicitud SET cantidad = :cant WHERE id = :id_linea");
            $stmtInsert = $this->db->prepare("INSERT INTO detalle_solicitud (solicitud_id, insumo_id, cantidad, estado_linea) VALUES (:sid, :iid, :cant, 'PENDIENTE')");
            foreach ($data['items'] as $item) {
                if (!empty($item['id_linea'])) {
                    $stmtUpdate->execute([':cant' => $item['cantidad'], ':id_linea' => $item['id_linea']]);
                } else {
                    $stmtInsert->execute([':sid' => $id, ':iid' => $item['insumo_id'] ?? $item['id_producto'], ':cant' => $item['cantidad']]);
                }
            }
            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function finalizar($id)
    {
        try {
            $this->db->beginTransaction();
            $this->db->prepare("UPDATE solicitudes_ot SET estado_id = 5 WHERE id = :id")->execute([':id' => $id]);
            $this->db->prepare("UPDATE insumos i JOIN detalle_solicitud ds ON i.id = ds.insumo_id SET i.stock_actual = i.stock_actual + (ds.cantidad - ds.cantidad_entregada) WHERE ds.solicitud_id = :id AND ds.estado_linea = 'RESERVADO'")->execute([':id' => $id]);
            $this->db->prepare("UPDATE detalle_solicitud SET estado_linea = 'CANCELADO' WHERE solicitud_id = :id AND estado_linea NOT IN ('ENTREGADO', 'FINALIZADO')")->execute([':id' => $id]);
            $this->db->commit();
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function delete($id)
    {
        try {
            $this->db->beginTransaction();
            $this->db->prepare("UPDATE solicitudes_ot SET estado_id = 6 WHERE id = :id")->execute([':id' => $id]);
            $this->db->prepare("UPDATE detalle_solicitud SET estado_linea = 'ANULADO' WHERE solicitud_id = :id")->execute([':id' => $id]);
            $this->db->commit();
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getPendientesEntrega()
    {
        $sql = "SELECT ds.id as detalle_id, ds.cantidad, ds.cantidad_entregada, (ds.cantidad - ds.cantidad_entregada) as cantidad_pendiente, s.fecha_solicitud, i.id as insumo_id, i.nombre as insumo, i.codigo_sku, i.unidad_medida, i.stock_actual, s.id as ot_id, u.nombre as solicitante, u.apellido as solicitante_apellido, a.nombre as maquina FROM detalle_solicitud ds JOIN solicitudes_ot s ON ds.solicitud_id = s.id JOIN insumos i ON ds.insumo_id = i.id JOIN usuarios u ON s.usuario_solicitante_id = u.id LEFT JOIN activos a ON s.activo_id = a.id WHERE ds.estado_linea IN ('PENDIENTE', 'EN_BODEGA', 'RESERVADO', 'PARCIAL') AND (ds.cantidad - ds.cantidad_entregada) > 0.001 AND s.estado_id IN (1, 2, 4) ORDER BY s.fecha_solicitud ASC";
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
            $pendiente = floatval($linea['cantidad']) - floatval($linea['cantidad_entregada']);
            if ($cantidadEntregar > ($pendiente + 0.001))
                throw new \Exception("Exceso de entrega.");
            $stmtStock = $this->db->prepare("SELECT ubicacion_id, cantidad FROM insumo_stock_ubicacion WHERE insumo_id = :id AND cantidad > 0 ORDER BY cantidad DESC");
            $stmtStock->execute([':id' => $linea['insumo_id']]);
            $ubicaciones = $stmtStock->fetchAll(PDO::FETCH_ASSOC);
            $cantidadRestantePorDescontar = $cantidadEntregar;
            if (empty($ubicaciones))
                throw new \Exception("No hay stock físico disponible en ninguna ubicación.");
            foreach ($ubicaciones as $ubi) {
                if ($cantidadRestantePorDescontar <= 0)
                    break;
                $descuento = min($cantidadRestantePorDescontar, $ubi['cantidad']);
                $this->db->prepare("UPDATE insumo_stock_ubicacion SET cantidad = cantidad - :c WHERE insumo_id = :i AND ubicacion_id = :u")->execute([':c' => $descuento, ':i' => $linea['insumo_id'], ':u' => $ubi['ubicacion_id']]);
                $this->db->prepare("INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, referencia_id, empleado_id, ubicacion_id, fecha) VALUES (:iid, 2, :cant, :uid, 'Entrega OT', :ref, :emp, :ubi, NOW())")->execute([':iid' => $linea['insumo_id'], ':cant' => $descuento, ':uid' => $usuarioId, ':ref' => $detalleId, ':emp' => $receptorId, ':ubi' => $ubi['ubicacion_id']]);
                $cantidadRestantePorDescontar -= $descuento;
            }
            if ($cantidadRestantePorDescontar > 0)
                throw new \Exception("Stock insuficiente para cubrir la entrega total.");
            $nuevaEntregada = floatval($linea['cantidad_entregada']) + $cantidadEntregar;
            $nuevoEstado = ($nuevaEntregada >= floatval($linea['cantidad'])) ? 'ENTREGADO' : 'PARCIAL';
            $this->db->prepare("UPDATE detalle_solicitud SET cantidad_entregada = :cant, estado_linea = :st WHERE id = :id")->execute([':cant' => $nuevaEntregada, ':st' => $nuevoEstado, ':id' => $detalleId]);
            $otId = $linea['solicitud_id'];
            $pendientes = $this->db->query("SELECT COUNT(*) FROM detalle_solicitud WHERE solicitud_id = $otId AND estado_linea NOT IN ('ENTREGADO','FINALIZADO','CANCELADO')")->fetchColumn();
            if ($pendientes == 0) {
                $this->db->prepare("UPDATE solicitudes_ot SET estado_id = 5 WHERE id = :id")->execute([':id' => $otId]);
            } else {
                $this->db->prepare("UPDATE solicitudes_ot SET estado_id = 2 WHERE id = :id AND estado_id = 1")->execute([':id' => $otId]);
            }
            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getOTHeader($id)
    {
        $sql = "SELECT s.*, u.nombre as solicitante_nombre, u.apellido as solicitante_apellido, CASE WHEN s.activo_id IS NOT NULL THEN a.nombre ELSE CONCAT('SERVICIO: ', COALESCE(s.area_negocio, 'General')) END as activo, COALESCE(a.codigo_interno, 'SERV') as activo_codigo, e.nombre as estado FROM solicitudes_ot s JOIN usuarios u ON s.usuario_solicitante_id = u.id LEFT JOIN activos a ON s.activo_id = a.id JOIN estados_solicitud e ON s.estado_id = e.id WHERE s.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getEntregasOT($otId)
    {
        $sql = "SELECT m.fecha, m.cantidad, i.nombre, i.codigo_sku, e.nombre_completo as receptor FROM movimientos_inventario m JOIN insumos i ON m.insumo_id = i.id LEFT JOIN empleados e ON m.empleado_id = e.id WHERE m.referencia_id IN (SELECT id FROM detalle_solicitud WHERE solicitud_id = :id) AND m.tipo_movimiento_id = 2 ORDER BY m.fecha DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $otId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}