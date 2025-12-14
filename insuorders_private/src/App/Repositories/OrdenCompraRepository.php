<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;

class OrdenCompraRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Get all Purchase Orders with optional filters.
     * Updated to support filtering by Insumo ID.
     */
    public function getAll($filtros = [])
    {
        // Base query with DISTINCT to avoid duplicates when filtering by item
        $sql = "SELECT DISTINCT 
                    oc.id, oc.fecha_creacion, oc.monto_total, oc.url_archivo,
                    p.nombre as proveedor, p.rut as proveedor_rut,
                    e.nombre as estado, e.id as estado_id,
                    u.nombre as creador
                FROM ordenes_compra oc
                JOIN proveedores p ON oc.proveedor_id = p.id
                JOIN estados_orden_compra e ON oc.estado_id = e.id
                JOIN usuarios u ON oc.usuario_creador_id = u.id
                -- LEFT JOIN with details is only necessary if we filter by item, 
                -- but we include it conditionally or always if performance allows.
                LEFT JOIN detalle_orden_compra doc ON oc.id = doc.orden_compra_id
                WHERE 1=1";

        $params = [];

        // 1. FILTER BY INSUMO ID (New Requirement)
        if (!empty($filtros['insumo_id'])) {
            $sql .= " AND doc.insumo_id = :iid";
            $params[':iid'] = $filtros['insumo_id'];
        }

        // 2. Search Filter (ID or Provider)
        if (!empty($filtros['search'])) {
            $sql .= " AND (oc.id LIKE :s OR p.nombre LIKE :s)";
            $params[':s'] = "%" . $filtros['search'] . "%";
        }

        // 3. Date Filters
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

    /**
     * Get a list of all items that have been purchased historically.
     * Used to populate the filter dropdown in the frontend.
     */
    public function getInsumosHistorial()
    {
        $sql = "SELECT DISTINCT i.id, i.nombre, i.codigo_sku 
                FROM insumos i
                JOIN detalle_orden_compra doc ON i.id = doc.insumo_id
                ORDER BY i.nombre ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    // --- Existing Methods (Unchanged) ---

    public function getOrdenCompleta($id)
    {
        $sqlCabecera = "SELECT oc.*, 
                            p.nombre as proveedor, p.rut as proveedor_rut, p.contacto_vendedor,
                            e.nombre as estado_nombre,
                            u.nombre as creador_nombre, u.apellido as creador_apellido
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

        $sqlDetalles = "SELECT doc.*, i.nombre as insumo, i.codigo_sku
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
    
    public function getDetalle($id)
    {
        $res = $this->getOrdenCompleta($id);
        return $res ? $res['detalles'] : [];
    }

    public function getPendientesMantencion()
    {
        $sql = "SELECT 
                    ds.insumo_id as id, i.nombre, i.codigo_sku, i.unidad_medida,
                    SUM(ds.cantidad) as cantidad_total,
                    i.precio_costo as precio,
                    GROUP_CONCAT(ds.id SEPARATOR ',') as ids_detalle_solicitud
                FROM detalle_solicitud ds
                JOIN solicitudes_ot s ON ds.solicitud_id = s.id
                JOIN insumos i ON ds.insumo_id = i.id
                WHERE ds.estado_linea = 'REQUIERE_COMPRA'
                AND s.estado_id IN (1, 2, 4)
                GROUP BY ds.insumo_id";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function asociarSolicitudesAOrden($ordenId, $idsDetalleSolicitud)
    {
        if (empty($idsDetalleSolicitud)) return;
        
        if (is_array($idsDetalleSolicitud))
            $idsStr = implode(',', array_map('intval', $idsDetalleSolicitud));
        else
            $idsStr = $idsDetalleSolicitud;

        if (empty($idsStr)) return;

        $this->db->prepare("UPDATE detalle_solicitud SET estado_linea = 'COMPRADO', orden_compra_id = :oc WHERE id IN ($idsStr)")
            ->execute([':oc' => $ordenId]);

        $sqlOTs = "SELECT DISTINCT solicitud_id FROM detalle_solicitud WHERE id IN ($idsStr)";
        $ots = $this->db->query($sqlOTs)->fetchAll(PDO::FETCH_COLUMN);
        if (!empty($ots)) {
            $idsOTs = implode(',', $ots);
            $this->db->query("UPDATE solicitudes_ot SET estado_id = 4 WHERE id IN ($idsOTs)");
        }
    }

    public function create($cabecera)
    {
        $sql = "INSERT INTO ordenes_compra (proveedor_id, usuario_creador_id, estado_id, monto_neto, impuesto, monto_total, moneda, tipo_cambio, numero_cotizacion, impuesto_porcentaje, fecha_creacion) 
                VALUES (:prov, :user, 1, :neto, :imp, :total, :moneda, :tc, :cotiz, :iva_pct, NOW())";
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
            ':iva_pct' => $cabecera['impuesto_porcentaje']
        ]);
        return $this->db->lastInsertId();
    }

    public function addDetalle($item)
    {
        $sql = "INSERT INTO detalle_orden_compra (orden_compra_id, insumo_id, cantidad_solicitada, precio_unitario, total_linea) 
                VALUES (:oc_id, :insumo, :cant, :precio, :total)";
        $this->db->prepare($sql)->execute([
            ':oc_id' => $item['orden_id'],
            ':insumo' => $item['insumo_id'],
            ':cant' => $item['cantidad'],
            ':precio' => $item['precio'],
            ':total' => $item['total']
        ]);
    }

    public function updateArchivo($id, $url)
    {
        $this->db->prepare("UPDATE ordenes_compra SET url_archivo = :url WHERE id = :id")->execute([':url' => $url, ':id' => $id]);
    }

    public function recepcionarOrden($ordenId, $itemsRecibidos, $usuarioId)
    {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("SELECT estado_id FROM ordenes_compra WHERE id = :id");
            $stmt->execute([':id' => $ordenId]);
            $estadoActual = $stmt->fetchColumn();

            if ($estadoActual == 4 || $estadoActual == 5)
                throw new \Exception("Orden cerrada o anulada.");

            foreach ($itemsRecibidos as $item) {
                $detalleId = $item['detalle_id'];
                $cantidad = floatval($item['cantidad']);
                if ($cantidad <= 0) continue;

                $stmtDet = $this->db->prepare("SELECT insumo_id, cantidad_solicitada, cantidad_recibida FROM detalle_orden_compra WHERE id = :id");
                $stmtDet->execute([':id' => $detalleId]);
                $linea = $stmtDet->fetch(PDO::FETCH_ASSOC);

                if ($cantidad + $linea['cantidad_recibida'] > $linea['cantidad_solicitada'])
                    throw new \Exception("Exceso en insumo ID: " . $linea['insumo_id']);

                $this->db->prepare("UPDATE detalle_orden_compra SET cantidad_recibida = cantidad_recibida + :c WHERE id = :id")->execute([':c' => $cantidad, ':id' => $detalleId]);
                $this->db->prepare("UPDATE insumos SET stock_actual = stock_actual + :c WHERE id = :id")->execute([':c' => $cantidad, ':id' => $linea['insumo_id']]);

                $this->db->prepare("INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, referencia_id, observacion) VALUES (:iid, 1, :cant, :uid, :ref, 'Recepción OC')")
                    ->execute([':iid' => $linea['insumo_id'], ':cant' => $cantidad, ':uid' => $usuarioId, ':ref' => $ordenId]);

                $this->db->prepare("UPDATE detalle_solicitud SET estado_linea = 'EN_BODEGA' WHERE orden_compra_id = :oc AND insumo_id = :iid")->execute([':oc' => $ordenId, ':iid' => $linea['insumo_id']]);
                $this->db->prepare("UPDATE solicitudes_ot SET estado_id = 4 WHERE id IN (SELECT solicitud_id FROM detalle_solicitud WHERE orden_compra_id = :oc)")->execute([':oc' => $ordenId]);
            }

            // Recalcular estado
            $totales = $this->db->query("SELECT SUM(cantidad_solicitada) as sol, SUM(cantidad_recibida) as rec FROM detalle_orden_compra WHERE orden_compra_id = $ordenId")->fetch(PDO::FETCH_ASSOC);
            $nuevoEstado = ($totales['rec'] >= $totales['sol']) ? 4 : ($totales['rec'] > 0 ? 3 : 2);

            $this->db->prepare("UPDATE ordenes_compra SET estado_id = :st WHERE id = :id")->execute([':st' => $nuevoEstado, ':id' => $ordenId]);

            $this->db->commit();
            return ["nuevo_estado" => $nuevoEstado];
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}