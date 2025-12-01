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

    public function getAll()
    {
        $sql = "SELECT 
                    oc.id, oc.fecha_creacion, oc.monto_total, oc.url_archivo,
                    p.nombre as proveedor, p.rut as proveedor_rut,
                    e.nombre as estado, e.id as estado_id,
                    u.nombre as creador
                FROM ordenes_compra oc
                JOIN proveedores p ON oc.proveedor_id = p.id
                JOIN estados_orden_compra e ON oc.estado_id = e.id
                JOIN usuarios u ON oc.usuario_creador_id = u.id
                ORDER BY oc.id DESC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getDetalle($ordenId)
    {
        $sql = "SELECT 
                    doc.*, i.nombre as insumo, i.codigo_sku
                FROM detalle_orden_compra doc
                JOIN insumos i ON doc.insumo_id = i.id
                WHERE doc.orden_compra_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $ordenId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOrdenCompleta($id)
    {
        $sqlHead = "SELECT oc.*, p.nombre as proveedor, p.rut as proveedor_rut, 
                        p.direccion as proveedor_direccion, p.telefono as proveedor_telefono,
                        p.contacto_vendedor, p.email as proveedor_email,
                        u.nombre as creador_nombre, u.apellido as creador_apellido,
                        e.nombre as estado_nombre 
                    FROM ordenes_compra oc
                    JOIN proveedores p ON oc.proveedor_id = p.id
                    JOIN usuarios u ON oc.usuario_creador_id = u.id
                    JOIN estados_orden_compra e ON oc.estado_id = e.id
                    WHERE oc.id = :id";
        $stmt = $this->db->prepare($sqlHead);
        $stmt->execute([':id' => $id]);
        $cabecera = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$cabecera)
            return null;

        $sqlDet = "SELECT doc.*, i.nombre as insumo, i.codigo_sku, i.unidad_medida 
                FROM detalle_orden_compra doc
                JOIN insumos i ON doc.insumo_id = i.id
                WHERE doc.orden_compra_id = :id";
        $stmtDet = $this->db->prepare($sqlDet);
        $stmtDet->execute([':id' => $id]);
        $detalles = $stmtDet->fetchAll(PDO::FETCH_ASSOC);

        return ['cabecera' => $cabecera, 'detalles' => $detalles];
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
                AND s.estado_id IN (1, 2)
                GROUP BY ds.insumo_id";

        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function asociarSolicitudesAOrden($ordenId, $idsDetalleSolicitud)
    {
        if (empty($idsDetalleSolicitud))
            return;

        if (is_array($idsDetalleSolicitud)) {
            $idsStr = implode(',', array_map('intval', $idsDetalleSolicitud));
        } else {
            $idsStr = $idsDetalleSolicitud;
        }

        if (empty($idsStr))
            return;

        $sql = "UPDATE detalle_solicitud 
                SET estado_linea = 'COMPRADO', orden_compra_id = :oc_id 
                WHERE id IN ($idsStr)";

        $this->db->prepare($sql)->execute([':oc_id' => $ordenId]);

        if (!empty($idsStr)) {
            $sqlOTs = "SELECT DISTINCT solicitud_id FROM detalle_solicitud WHERE id IN ($idsStr)";
            $ots = $this->db->query($sqlOTs)->fetchAll(PDO::FETCH_COLUMN);

            if (!empty($ots)) {
                $idsOTs = implode(',', $ots);
                $this->db->query("UPDATE solicitudes_ot SET estado_id = 4 WHERE id IN ($idsOTs)");
            }
        }
    }

    public function create($cabecera)
    {
        $sql = "INSERT INTO ordenes_compra 
                (proveedor_id, usuario_creador_id, estado_id, monto_neto, impuesto, monto_total, moneda, tipo_cambio, numero_cotizacion) 
                VALUES (:prov, :user, :estado, :neto, :impuesto, :total, :moneda, :tc, :cotiz)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':prov' => $cabecera['proveedor_id'],
            ':user' => $cabecera['usuario_id'],
            ':estado' => 2,
            ':neto' => $cabecera['neto'],
            ':impuesto' => $cabecera['impuesto'],
            ':total' => $cabecera['total'],
            ':moneda' => $cabecera['moneda'],
            ':tc' => $cabecera['tipo_cambio'],
            ':cotiz' => $cabecera['numero_cotizacion'] ?? null
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
        $sql = "UPDATE ordenes_compra SET url_archivo = :url WHERE id = :id";
        $this->db->prepare($sql)->execute([':url' => $url, ':id' => $id]);
    }


    public function recepcionarOrden($ordenId, $itemsRecibidos, $usuarioId)
    {
        try {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("SELECT estado_id FROM ordenes_compra WHERE id = :id");
            $stmt->execute([':id' => $ordenId]);
            $estadoActual = $stmt->fetchColumn();

            if ($estadoActual == 4 || $estadoActual == 5) {
                throw new \Exception("Esta orden ya está cerrada o anulada.");
            }

            foreach ($itemsRecibidos as $item) {
                $detalleId = $item['detalle_id'];
                $cantidadIngresa = floatval($item['cantidad']);

                if ($cantidadIngresa <= 0)
                    continue;

                $stmtDet = $this->db->prepare("SELECT insumo_id, cantidad_solicitada, cantidad_recibida FROM detalle_orden_compra WHERE id = :id");
                $stmtDet->execute([':id' => $detalleId]);
                $linea = $stmtDet->fetch(\PDO::FETCH_ASSOC);

                if (!$linea)
                    throw new \Exception("Línea no encontrada");

                $nuevoRecibido = $linea['cantidad_recibida'] + $cantidadIngresa;
                if ($nuevoRecibido > $linea['cantidad_solicitada']) {
                    throw new \Exception("Exceso de cantidad en insumo ID: " . $linea['insumo_id']);
                }

                $this->db->prepare("UPDATE detalle_orden_compra SET cantidad_recibida = :cant WHERE id = :id")
                    ->execute([':cant' => $nuevoRecibido, ':id' => $detalleId]);

                $this->db->prepare("UPDATE insumos SET stock_actual = stock_actual + :cant WHERE id = :id")
                    ->execute([':cant' => $cantidadIngresa, ':id' => $linea['insumo_id']]);

                $this->db->prepare("INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, referencia_id, observacion) VALUES (:insumo, 1, :cant, :user, :ref, 'Recepción OC #' || :oc)")
                    ->execute([':insumo' => $linea['insumo_id'], ':cant' => $cantidadIngresa, ':user' => $usuarioId, ':ref' => $ordenId, ':oc' => $ordenId]);

                $sqlRelease = "UPDATE detalle_solicitud 
                        SET estado_linea = 'EN_BODEGA' 
                        WHERE orden_compra_id = :oc_id 
                        AND insumo_id = :insumo_id 
                        AND estado_linea = 'COMPRADO'";

                $this->db->prepare($sqlRelease)->execute([
                    ':oc_id' => $ordenId,
                    ':insumo_id' => $linea['insumo_id']
                ]);

                $this->db->prepare("UPDATE solicitudes_ot SET estado_id = 4 WHERE id IN (SELECT solicitud_id FROM detalle_solicitud WHERE orden_compra_id = :oc)")
                    ->execute([':oc' => $ordenId]);
            }
            $stmtTotales = $this->db->prepare("SELECT SUM(cantidad_solicitada) as sol, SUM(cantidad_recibida) as rec FROM detalle_orden_compra WHERE orden_compra_id = :id");
            $stmtTotales->execute([':id' => $ordenId]);
            $totales = $stmtTotales->fetch(\PDO::FETCH_ASSOC);

            $nuevoEstado = 2;
            if ($totales['rec'] > 0 && $totales['rec'] < $totales['sol']) {
                $nuevoEstado = 3;
            } elseif ($totales['rec'] >= $totales['sol']) {
                $nuevoEstado = 4;
            }

            $this->db->prepare("UPDATE ordenes_compra SET estado_id = :st WHERE id = :id")
                ->execute([':st' => $nuevoEstado, ':id' => $ordenId]);

            $this->db->commit();
            return ["nuevo_estado" => $nuevoEstado];

        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}