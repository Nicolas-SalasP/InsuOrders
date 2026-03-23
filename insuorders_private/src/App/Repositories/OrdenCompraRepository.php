<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;
use Exception;

class OrdenCompraRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll($filtros = [])
    {
        $sql = "SELECT DISTINCT 
                    oc.id, oc.fecha_creacion, oc.monto_total, oc.url_archivo,
                    p.nombre as proveedor, p.rut as proveedor_rut,
                    e.nombre as estado, e.id as estado_id,
                    u.nombre as creador,
                    oc.destino 
                FROM ordenes_compra oc
                JOIN proveedores p ON oc.proveedor_id = p.id
                JOIN estados_orden_compra e ON oc.estado_id = e.id
                JOIN usuarios u ON oc.usuario_creador_id = u.id
                LEFT JOIN detalle_orden_compra doc ON oc.id = doc.orden_compra_id
                WHERE 1=1";

        $params = [];

        if (!empty($filtros['insumo_id'])) {
            $sql .= " AND doc.insumo_id = :iid";
            $params[':iid'] = $filtros['insumo_id'];
        }

        if (!empty($filtros['search'])) {
            $sql .= " AND (oc.id LIKE :s OR p.nombre LIKE :s OR oc.destino LIKE :s)";
            $params[':s'] = "%" . $filtros['search'] . "%";
        }

        if (!empty($filtros['destino'])) {
            $sql .= " AND oc.destino LIKE :dest";
            $params[':dest'] = "%" . $filtros['destino'] . "%";
        }

        if (!empty($filtros['estado'])) {
            if (is_array($filtros['estado'])) {
                $estadosStr = implode("','", array_map(function ($s) {
                    return htmlspecialchars($s);
                }, $filtros['estado']));
                $sql .= " AND e.nombre IN ('$estadosStr')";
            } else {
                $sql .= " AND e.nombre = :estado";
                $params[':estado'] = $filtros['estado'];
            }
        }

        if (!empty($filtros['fecha_inicio'])) {
            $sql .= " AND oc.fecha_creacion >= :fi";
            $params[':fi'] = $filtros['fecha_inicio'];
        }

        if (!empty($filtros['fecha_fin'])) {
            $sql .= " AND oc.fecha_creacion <= :ff";
            $params[':ff'] = $filtros['fecha_fin'] . ' 23:59:59';
        }

        $sql .= " ORDER BY oc.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getInsumosHistorial()
    {
        $sql = "SELECT DISTINCT i.id, i.nombre, i.codigo_sku 
                FROM insumos i
                JOIN detalle_orden_compra doc ON i.id = doc.insumo_id
                ORDER BY i.nombre ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOrdenCompleta($id)
    {
        $sqlCabecera = "SELECT oc.*, oc.destino,
                            p.nombre as proveedor, p.rut as proveedor_rut, p.contacto_vendedor, p.direccion as proveedor_direccion, p.telefono as proveedor_telefono,
                            e.nombre as estado_nombre,
                            u.nombre as creador_nombre, u.apellido as creador_apellido, u.email as creador_email
                        FROM ordenes_compra oc
                        JOIN proveedores p ON oc.proveedor_id = p.id
                        JOIN estados_orden_compra e ON oc.estado_id = e.id
                        JOIN usuarios u ON oc.usuario_creador_id = u.id
                        WHERE oc.id = :id";

        $stmt = $this->db->prepare($sqlCabecera);
        $stmt->execute([':id' => $id]);
        $cabecera = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cabecera)
            return null;

        $sqlDetalles = "SELECT doc.*, 
                            i.nombre as insumo, 
                            i.codigo_sku, 
                            i.unidad_medida
                        FROM detalle_orden_compra doc
                        JOIN insumos i ON doc.insumo_id = i.id
                        WHERE doc.orden_compra_id = :id";

        $stmtDet = $this->db->prepare($sqlDetalles);
        $stmtDet->execute([':id' => $id]);
        $detalles = $stmtDet->fetchAll(PDO::FETCH_ASSOC);

        foreach ($detalles as &$d) {
            $d['total_linea'] = $d['cantidad_solicitada'] * $d['precio_unitario'];
        }

        return ['cabecera' => $cabecera, 'detalles' => $detalles];
    }

    public function getById($id)
    {
        return $this->getOrdenCompleta($id);
    }

    public function getPendientesMantencion()
    {
        $sql = "SELECT 
                    ds.insumo_id as id, i.nombre, i.codigo_sku, i.unidad_medida,
                    i.stock_actual,
                    GREATEST(0, SUM(ds.cantidad) - i.stock_actual) as cantidad_total,
                    i.precio_costo as precio,
                    GROUP_CONCAT(ds.id SEPARATOR ',') as ids_detalle_solicitud,
                    GROUP_CONCAT(DISTINCT s.id ORDER BY s.id ASC SEPARATOR ', ') as lista_ots,
                    MAX(CASE WHEN UPPER(s.prioridad) IN ('URGENTE', 'CRITICA', 'CRÍTICA', 'CRITICO', 'CRÍTICO') THEN 1 ELSE 0 END) as es_urgente
                FROM detalle_solicitud ds
                JOIN solicitudes_ot s ON ds.solicitud_id = s.id
                JOIN insumos i ON ds.insumo_id = i.id
                WHERE ds.estado_linea = 'REQUIERE_COMPRA'
                AND s.estado_id IN (1, 2, 4)
                GROUP BY ds.insumo_id
                HAVING cantidad_total > 0";

        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function asociarSolicitudesAOrden($ordenId, $idsDetalleSolicitud)
    {
        if (empty($idsDetalleSolicitud))
            return;

        if (is_array($idsDetalleSolicitud))
            $idsStr = implode(',', array_map('intval', $idsDetalleSolicitud));
        else
            $idsStr = $idsDetalleSolicitud;

        if (empty($idsStr))
            return;

        $this->db->prepare("UPDATE detalle_solicitud SET estado_linea = 'COMPRADO', orden_compra_id = :oc WHERE id IN ($idsStr)")
            ->execute([':oc' => $ordenId]);
    }

    public function create($cabecera)
    {
        $sql = "INSERT INTO ordenes_compra (proveedor_id, usuario_creador_id, estado_id, monto_neto, impuesto, monto_total, moneda, tipo_cambio, numero_cotizacion, impuesto_porcentaje, fecha_creacion, destino) 
                VALUES (:prov, :user, 2, :neto, :imp, :total, :moneda, :tc, :cotiz, :iva_pct, NOW(), :dest)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':prov' => $cabecera['proveedor_id'],
            ':user' => $cabecera['usuario_id'],
            ':neto' => $cabecera['neto'],
            ':imp' => $cabecera['impuesto'],
            ':total' => $cabecera['total'],
            ':moneda' => $cabecera['moneda'],
            ':tc' => $cabecera['tipo_cambio'],
            ':cotiz' => $cabecera['numero_cotizacion'] ?? null,
            ':iva_pct' => $cabecera['impuesto_porcentaje'],
            ':dest' => $cabecera['destino'] ?? null
        ]);
        return $this->db->lastInsertId();
    }

    public function addDetalle($item)
    {
        $sql = "INSERT INTO detalle_orden_compra (orden_compra_id, insumo_id, cantidad_solicitada, precio_unitario, total_linea, nota_linea) 
            VALUES (:oc_id, :insumo, :cant, :precio, :total, :nota)";
        $this->db->prepare($sql)->execute([
            ':oc_id' => $item['orden_id'],
            ':insumo' => $item['insumo_id'],
            ':cant' => $item['cantidad'],
            ':precio' => $item['precio'],
            ':total' => $item['total'],
            ':nota' => $item['nota_linea'] ?? null
        ]);
    }

    public function updateArchivo($id, $url)
    {
        $this->db->prepare("UPDATE ordenes_compra SET url_archivo = :url WHERE id = :id")->execute([':url' => $url, ':id' => $id]);
    }

    public function update($id, $data)
    {
        if (empty($data))
            return false;

        $fields = [];
        $params = [':id' => $id];

        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
            $params[":$key"] = $value;
        }

        $sql = "UPDATE ordenes_compra SET " . implode(', ', $fields) . " WHERE id = :id";
        return $this->db->prepare($sql)->execute($params);
    }

    public function recepcionarOrden($ordenId, $itemsRecibidos, $usuarioId)
    {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("SELECT estado_id FROM ordenes_compra WHERE id = :id");
            $stmt->execute([':id' => $ordenId]);
            $estadoActual = $stmt->fetchColumn();

            if ($estadoActual == 4 || $estadoActual == 5 || $estadoActual == 6)
                throw new Exception("No se puede recepcionar: La orden está cerrada, incompleta o anulada.");

            $ubicacionRecepcionId = 1;

            foreach ($itemsRecibidos as $item) {
                $detalleId = $item['detalle_id'];
                $cantidad = floatval($item['cantidad']);
                if ($cantidad <= 0)
                    continue;

                $stmtDet = $this->db->prepare("SELECT insumo_id, cantidad_solicitada, cantidad_recibida FROM detalle_orden_compra WHERE id = :id FOR UPDATE");
                $stmtDet->execute([':id' => $detalleId]);
                $linea = $stmtDet->fetch(PDO::FETCH_ASSOC);

                if ($cantidad + $linea['cantidad_recibida'] > $linea['cantidad_solicitada'])
                    throw new Exception("Exceso de recepción en insumo ID: " . $linea['insumo_id']);

                $this->db->prepare("UPDATE detalle_orden_compra SET cantidad_recibida = cantidad_recibida + :c WHERE id = :id")
                    ->execute([':c' => $cantidad, ':id' => $detalleId]);

                $sqlStock = "INSERT INTO insumo_stock_ubicacion (insumo_id, ubicacion_id, cantidad) 
                            VALUES (:iid, :uid, :cant)
                            ON DUPLICATE KEY UPDATE cantidad = cantidad + :cant_update";

                $this->db->prepare($sqlStock)->execute([
                    ':iid' => $linea['insumo_id'],
                    ':uid' => $ubicacionRecepcionId,
                    ':cant' => $cantidad,
                    ':cant_update' => $cantidad
                ]);

                $this->db->prepare("INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, referencia_id, observacion, ubicacion_id, fecha) 
                                    VALUES (:iid, 1, :cant, :uid, :ref, 'Recepción OC', :ubi, NOW())")
                    ->execute([
                        ':iid' => $linea['insumo_id'],
                        ':cant' => $cantidad,
                        ':uid' => $usuarioId,
                        ':ref' => $ordenId,
                        ':ubi' => $ubicacionRecepcionId
                    ]);

                $this->db->prepare("UPDATE detalle_solicitud SET estado_linea = 'EN_BODEGA' WHERE orden_compra_id = :oc AND insumo_id = :iid")
                    ->execute([':oc' => $ordenId, ':iid' => $linea['insumo_id']]);
            }

            $stmtTotales = $this->db->prepare("SELECT SUM(cantidad_solicitada) as sol, SUM(cantidad_recibida) as rec FROM detalle_orden_compra WHERE orden_compra_id = :id");
            $stmtTotales->execute([':id' => $ordenId]);
            $totales = $stmtTotales->fetch(PDO::FETCH_ASSOC);
            $nuevoEstado = ($totales['rec'] >= $totales['sol']) ? 4 : ($totales['rec'] > 0 ? 3 : 2);

            $this->db->prepare("UPDATE ordenes_compra SET estado_id = :st WHERE id = :id")->execute([':st' => $nuevoEstado, ':id' => $ordenId]);

            $this->db->commit();
            return ["nuevo_estado" => $nuevoEstado];
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function cancelar($id)
    {
        $sql = "UPDATE ordenes_compra SET estado_id = 5 WHERE id = :id";
        return $this->db->prepare($sql)->execute([':id' => $id]);
    }

    public function getHistorialRecepciones()
    {
        $sql = "SELECT 
                    oc.id AS numero_oc,
                    p.nombre AS proveedor,
                    p.rut AS rut_proveedor,
                    oc.estado_id,
                    DATE_FORMAT(oc.updated_at, '%d/%m/%Y %H:%i') as fecha_recepcion,
                    i.codigo_sku,
                    i.nombre AS insumo,
                    doc.cantidad_solicitada,
                    doc.cantidad_recibida,
                    doc.precio_unitario,
                    (doc.cantidad_recibida * doc.precio_unitario) as total_linea,
                    'No Registrado' as recepcionado_por
                FROM ordenes_compra oc
                JOIN proveedores p ON oc.proveedor_id = p.id
                JOIN detalle_orden_compra doc ON oc.id = doc.orden_compra_id
                JOIN insumos i ON doc.insumo_id = i.id
                WHERE doc.cantidad_recibida > 0 
                AND oc.estado_id IN (3, 4)
                ORDER BY oc.updated_at DESC";

        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function archivarSolicitudesPendientes($idsArray)
    {
        if (empty($idsArray))
            return false;
        $placeholders = implode(',', array_fill(0, count($idsArray), '?'));
        $sql = "UPDATE detalle_solicitud 
                SET estado_linea = 'OMITIDO' 
                WHERE id IN ($placeholders)";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($idsArray);
    }

    public function obtenerDatosParaNotificar($idsArray)
    {
        if (empty($idsArray))
            return [];

        $placeholders = implode(',', array_fill(0, count($idsArray), '?'));

        $sql = "SELECT 
                    ds.id, 
                    i.nombre as nombre_insumo, 
                    s.id as ot_id, 
                    s.usuario_solicitante_id as usuario_id
                FROM detalle_solicitud ds
                JOIN solicitudes_ot s ON ds.solicitud_id = s.id
                JOIN insumos i ON ds.insumo_id = i.id
                WHERE ds.id IN ($placeholders)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($idsArray);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function forzarCierre($id)
    {
        $sql = "UPDATE ordenes_compra SET estado_id = 6 WHERE id = :id";
        return $this->db->prepare($sql)->execute([':id' => $id]);
    }
}