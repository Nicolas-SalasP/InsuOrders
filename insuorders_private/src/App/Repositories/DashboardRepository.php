<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;

class DashboardRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    private function safeQuery($sql, $params = [])
    {
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            return [];
        }
    }

    private function safeScalar($sql, $params = [], $default = 0)
    {
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $val = $stmt->fetchColumn();
            return $val === false ? $default : $val;
        } catch (\Exception $e) {
            return $default;
        }
    }

    public function getGeneralKPIs($start, $end)
    {
        $rango = [':start' => $start, ':end' => $end];
        return [
            'total_gasto' => $this->safeScalar("SELECT COALESCE(SUM(monto_total), 0) FROM ordenes_compra WHERE estado_id != 5 AND fecha_creacion BETWEEN :start AND :end", $rango),
            'total_neto' => $this->safeScalar("SELECT COALESCE(SUM(monto_neto), 0) FROM ordenes_compra WHERE estado_id != 5 AND fecha_creacion BETWEEN :start AND :end", $rango),
            'total_ots' => $this->safeScalar("SELECT COUNT(*) FROM solicitudes_ot WHERE fecha_solicitud BETWEEN :start AND :end", $rango),
            'stock_bajo' => $this->safeScalar("SELECT COUNT(*) FROM insumos WHERE stock_actual <= stock_minimo"),
            'proveedores_activos' => $this->safeScalar("SELECT COUNT(*) FROM proveedores"),
            'insumos_usados' => $this->safeScalar("SELECT COALESCE(SUM(cantidad), 0) FROM movimientos_inventario WHERE tipo_movimiento_id = 2 AND fecha BETWEEN :start AND :end", $rango)
        ];
    }

    public function getComprasAnalytics($start, $end)
    {
        $rango = [':start' => $start, ':end' => $end];

        $sqlTendencia = "SELECT DATE_FORMAT(fecha_creacion, '%Y-%m') as mes,
                            SUM(monto_total) as total,
                            SUM(monto_neto)  as neto
                        FROM ordenes_compra
                        WHERE estado_id != 5 AND fecha_creacion BETWEEN :start AND :end
                        GROUP BY mes ORDER BY mes ASC";

        $sqlTopProv = "SELECT p.nombre,
                            SUM(oc.monto_total) as total,
                            SUM(oc.monto_neto)  as neto
                        FROM ordenes_compra oc
                        JOIN proveedores p ON oc.proveedor_id = p.id
                        WHERE oc.estado_id != 5 AND oc.fecha_creacion BETWEEN :start AND :end
                        GROUP BY p.id ORDER BY total DESC LIMIT 5";

        $sqlTopInsumos = "SELECT i.nombre, SUM(doc.total_linea) as total_gasto
                        FROM detalle_orden_compra doc
                        JOIN ordenes_compra oc ON doc.orden_compra_id = oc.id
                        JOIN insumos i ON doc.insumo_id = i.id
                        WHERE oc.estado_id != 5 AND oc.fecha_creacion BETWEEN :start AND :end
                        GROUP BY i.id ORDER BY total_gasto DESC LIMIT 5";

        $sqlTopInsumosQty = "SELECT i.nombre, SUM(doc.cantidad_solicitada) as total_cantidad
                        FROM detalle_orden_compra doc
                        JOIN ordenes_compra oc ON doc.orden_compra_id = oc.id
                        JOIN insumos i ON doc.insumo_id = i.id
                        WHERE oc.estado_id != 5 AND oc.fecha_creacion BETWEEN :start AND :end
                        GROUP BY i.id ORDER BY total_cantidad DESC LIMIT 5";

        $sqlCategorias = "SELECT c.nombre,
                            SUM(doc.total_linea) as value,
                            SUM(doc.total_linea) as value_neto
                        FROM detalle_orden_compra doc
                        JOIN ordenes_compra oc ON doc.orden_compra_id = oc.id
                        JOIN insumos i ON doc.insumo_id = i.id
                        LEFT JOIN categorias c ON i.categoria_id = c.id
                        WHERE oc.estado_id != 5 AND oc.fecha_creacion BETWEEN :start AND :end
                        GROUP BY c.id ORDER BY value DESC";

        $sqlUltimas = "SELECT oc.id, p.nombre as proveedor, oc.fecha_creacion,
                            oc.monto_total, oc.monto_neto, oc.estado_id
                        FROM ordenes_compra oc
                        JOIN proveedores p ON oc.proveedor_id = p.id
                        WHERE oc.estado_id != 5 AND oc.fecha_creacion BETWEEN :start AND :end
                        ORDER BY oc.fecha_creacion DESC LIMIT 5";

        return [
            'tendencia_gasto' => $this->safeQuery($sqlTendencia, $rango),
            'top_proveedores' => $this->safeQuery($sqlTopProv, $rango),
            'top_insumos_comprados' => $this->safeQuery($sqlTopInsumos, $rango),
            'top_insumos_cantidad' => $this->safeQuery($sqlTopInsumosQty, $rango),
            'gasto_por_categoria' => $this->safeQuery($sqlCategorias, $rango),
            'ultimas_ordenes' => $this->safeQuery($sqlUltimas, $rango)
        ];
    }

    public function getMantencionAnalytics($start, $end)
    {
        $rango = [':start' => $start, ':end' => $end];

        $sqlTopMaq = "SELECT a.nombre, COUNT(s.id) as total_ots
                    FROM solicitudes_ot s
                    JOIN activos a ON s.activo_id = a.id
                    WHERE s.fecha_solicitud BETWEEN :start AND :end
                    GROUP BY a.id ORDER BY total_ots DESC LIMIT 5";

        $sqlInsumosUso = "SELECT i.nombre, SUM(m.cantidad) as cantidad
                        FROM movimientos_inventario m
                        JOIN insumos i ON m.insumo_id = i.id
                        WHERE m.tipo_movimiento_id = 2 AND m.fecha BETWEEN :start AND :end
                        GROUP BY i.id ORDER BY cantidad DESC LIMIT 8";

        $entregas = $this->safeScalar("SELECT COUNT(*) FROM movimientos_inventario WHERE tipo_movimiento_id = 2 AND fecha BETWEEN :start AND :end", $rango);
        $devoluciones = $this->safeScalar("SELECT COUNT(*) FROM movimientos_inventario WHERE tipo_movimiento_id = 5 AND fecha BETWEEN :start AND :end", $rango);

        return [
            'top_maquinas' => $this->safeQuery($sqlTopMaq, $rango),
            'insumos_mas_usados' => $this->safeQuery($sqlInsumosUso, $rango),
            'ratio_devolucion' => ['entregas' => (int) $entregas, 'devoluciones' => (int) $devoluciones]
        ];
    }

    public function getBodegaAnalytics($start, $end, $empleadoId = null)
    {
        $rango = [':start' => $start, ':end' => $end];

        $sqlTopReceptores = "SELECT COALESCE(e.nombre_completo, u.nombre, 'Externo') as nombre,
                                    SUM(m.cantidad) as total_items
                            FROM movimientos_inventario m
                            LEFT JOIN empleados e ON m.empleado_id = e.id
                            LEFT JOIN usuarios u ON m.empleado_id = u.id
                            WHERE m.tipo_movimiento_id = 2
                            AND m.fecha BETWEEN :start AND :end
                            GROUP BY nombre
                            ORDER BY total_items DESC LIMIT 5";

        $sqlTimeline = "SELECT m.fecha as fecha_entrega,
                            i.nombre as insumo,
                            m.cantidad,
                            CASE
                                WHEN m.tipo_movimiento_id = 3 THEN u_resp.nombre
                                ELSE COALESCE(e.nombre_completo, u.nombre, u_sol.nombre, 'Externo/Manual')
                            END as retirado_por,
                            COALESCE(
                                ds.solicitud_id,
                                (SELECT ep.referencia_ot_id
                                 FROM entregas_personal ep
                                 WHERE ep.insumo_id = m.insumo_id
                                   AND ep.referencia_ot_id IS NOT NULL
                                   AND ABS(TIMESTAMPDIFF(SECOND, ep.fecha_entrega, m.fecha)) <= 10
                                 LIMIT 1)
                            ) as ot_id,
                            i.unidad_medida,
                            m.tipo_movimiento_id,
                            m.observacion,
                            ue.nombre as ubicacion_destino
                        FROM movimientos_inventario m
                        JOIN insumos i ON m.insumo_id = i.id
                        LEFT JOIN usuarios u_resp ON m.usuario_id = u_resp.id
                        LEFT JOIN empleados e ON m.empleado_id = e.id
                        LEFT JOIN usuarios u ON m.empleado_id = u.id
                        LEFT JOIN detalle_solicitud ds ON m.referencia_id = ds.id
                        LEFT JOIN solicitudes_ot sot ON ds.solicitud_id = sot.id
                        LEFT JOIN usuarios u_sol ON sot.usuario_solicitante_id = u_sol.id
                        LEFT JOIN ubicaciones_envio ue ON m.ubicacion_envio_id = ue.id
                        WHERE m.tipo_movimiento_id IN (2, 3)
                        AND m.fecha BETWEEN :start AND :end";

        $paramsTimeline = $rango;
        if ($empleadoId) {
            $sqlTimeline .= " AND m.empleado_id = :emp";
            $paramsTimeline[':emp'] = (int) $empleadoId;
        }

        $sqlTimeline .= " ORDER BY m.fecha DESC LIMIT 20";

        return [
            'top_receptores' => $this->safeQuery($sqlTopReceptores, $rango),
            'timeline_entregas' => $this->safeQuery($sqlTimeline, $paramsTimeline),
            'lista_empleados' => $this->safeQuery("SELECT id, nombre_completo FROM empleados WHERE activo = 1 ORDER BY nombre_completo ASC")
        ];
    }

    public function getLogs($tipo = 'general')
    {
        $sql = "SELECT l.*, u.nombre as usuario
                FROM sistema_logs l
                LEFT JOIN usuarios u ON l.usuario_id = u.id
                ORDER BY l.fecha DESC LIMIT 50";
        return $this->safeQuery($sql);
    }

    public function getEntregasParaExcel($start, $end, $empleadoId = null)
    {
        $sql = "SELECT
                    DATE_FORMAT(m.fecha, '%d-%m-%Y') as fecha,
                    DATE_FORMAT(m.fecha, '%H:%i:%s') as hora,
                    u_bod.nombre as quien_entrego,
                    COALESCE(e.nombre_completo, u_rec.nombre, 'Externo/Manual') as quien_recibio,
                    COALESCE(ue.nombre, '-') as ubicacion_destino,
                    m.observacion,
                    i.nombre as que_recibio,
                    i.codigo_sku as codigo_producto,
                    m.cantidad as cuanto,
                    i.unidad_medida,
                    COALESCE(
                        ot_ds.id,
                        ot_dir.id,
                        (SELECT ep.referencia_ot_id
                         FROM entregas_personal ep
                         WHERE ep.insumo_id = m.insumo_id
                           AND ep.referencia_ot_id IS NOT NULL
                           AND ABS(TIMESTAMPDIFF(SECOND, ep.fecha_entrega, m.fecha)) <= 10
                         LIMIT 1)
                    ) as ot_referencia,
                    COALESCE(
                        ot_ds.titulo,
                        ot_dir.titulo,
                        (SELECT sot.titulo
                         FROM solicitudes_ot sot
                         WHERE sot.id = (
                             SELECT ep.referencia_ot_id
                             FROM entregas_personal ep
                             WHERE ep.insumo_id = m.insumo_id
                               AND ep.referencia_ot_id IS NOT NULL
                               AND ABS(TIMESTAMPDIFF(SECOND, ep.fecha_entrega, m.fecha)) <= 10
                             LIMIT 1)
                         LIMIT 1)
                    ) as ot_titulo,
                    m.tipo_movimiento_id
                FROM movimientos_inventario m
                JOIN insumos i ON m.insumo_id = i.id
                JOIN usuarios u_bod ON m.usuario_id = u_bod.id
                LEFT JOIN empleados e ON m.empleado_id = e.id
                LEFT JOIN usuarios u_rec ON m.empleado_id = u_rec.id
                LEFT JOIN detalle_solicitud ds ON m.referencia_id = ds.id
                LEFT JOIN solicitudes_ot ot_ds ON ds.solicitud_id = ot_ds.id
                LEFT JOIN solicitudes_ot ot_dir ON m.referencia_id = ot_dir.id
                LEFT JOIN ubicaciones_envio ue ON m.ubicacion_envio_id = ue.id
                WHERE m.tipo_movimiento_id IN (2, 3)
                AND m.fecha BETWEEN :start AND :end";

        $params = [':start' => $start, ':end' => $end];
        if ($empleadoId) {
            $sql .= " AND m.empleado_id = :emp";
            $params[':emp'] = (int) $empleadoId;
        }

        $sql .= " ORDER BY m.fecha DESC";

        return $this->safeQuery($sql, $params);
    }
}
