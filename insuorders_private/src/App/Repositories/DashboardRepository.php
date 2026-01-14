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

    public function getGeneralKPIs($start, $end)
    {
        return [
            'total_gasto' => $this->db->query("SELECT COALESCE(SUM(monto_total), 0) FROM ordenes_compra WHERE estado_id != 5 AND fecha_creacion BETWEEN '$start' AND '$end'")->fetchColumn(),
            'total_ots' => $this->db->query("SELECT COUNT(*) FROM solicitudes_ot WHERE fecha_solicitud BETWEEN '$start' AND '$end'")->fetchColumn(),
            'stock_bajo' => $this->db->query("SELECT COUNT(*) FROM insumos WHERE stock_actual <= stock_minimo")->fetchColumn(),
            'proveedores_activos' => $this->db->query("SELECT COUNT(*) FROM proveedores")->fetchColumn(),
            'insumos_usados' => $this->db->query("SELECT COALESCE(SUM(cantidad), 0) FROM movimientos_inventario WHERE tipo_movimiento_id = 2 AND fecha BETWEEN '$start' AND '$end'")->fetchColumn()
        ];
    }

    public function getComprasAnalytics($start, $end)
    {
        $sqlTendencia = "SELECT DATE_FORMAT(fecha_creacion, '%Y-%m') as mes, SUM(monto_total) as total 
                        FROM ordenes_compra 
                        WHERE estado_id != 5 AND fecha_creacion BETWEEN '$start' AND '$end'
                        GROUP BY mes ORDER BY mes ASC";

        $sqlTopProv = "SELECT p.nombre, SUM(oc.monto_total) as total
                    FROM ordenes_compra oc
                    JOIN proveedores p ON oc.proveedor_id = p.id
                    WHERE oc.estado_id != 5 AND oc.fecha_creacion BETWEEN '$start' AND '$end'
                    GROUP BY p.id ORDER BY total DESC LIMIT 5";

        $sqlTopInsumos = "SELECT i.nombre, SUM(doc.total_linea) as total_gasto
                        FROM detalle_orden_compra doc
                        JOIN ordenes_compra oc ON doc.orden_compra_id = oc.id
                        JOIN insumos i ON doc.insumo_id = i.id
                        WHERE oc.estado_id != 5 AND oc.fecha_creacion BETWEEN '$start' AND '$end'
                        GROUP BY i.id ORDER BY total_gasto DESC LIMIT 5";

        return [
            'tendencia_gasto' => $this->db->query($sqlTendencia)->fetchAll(PDO::FETCH_ASSOC),
            'top_proveedores' => $this->db->query($sqlTopProv)->fetchAll(PDO::FETCH_ASSOC),
            'top_insumos_comprados' => $this->db->query($sqlTopInsumos)->fetchAll(PDO::FETCH_ASSOC)
        ];
    }

    public function getMantencionAnalytics($start, $end)
    {
        $sqlTopMaq = "SELECT a.nombre, COUNT(s.id) as total_ots
                    FROM solicitudes_ot s
                    JOIN activos a ON s.activo_id = a.id
                    WHERE s.fecha_solicitud BETWEEN '$start' AND '$end'
                    GROUP BY a.id ORDER BY total_ots DESC LIMIT 5";

        $sqlInsumosUso = "SELECT i.nombre, SUM(m.cantidad) as cantidad
                        FROM movimientos_inventario m
                        JOIN insumos i ON m.insumo_id = i.id
                        WHERE m.tipo_movimiento_id = 2 AND m.fecha BETWEEN '$start' AND '$end'
                        GROUP BY i.id ORDER BY cantidad DESC LIMIT 8";

        $entregas = $this->db->query("SELECT COUNT(*) FROM movimientos_inventario WHERE tipo_movimiento_id = 2 AND fecha BETWEEN '$start' AND '$end'")->fetchColumn();
        $devoluciones = $this->db->query("SELECT COUNT(*) FROM movimientos_inventario WHERE tipo_movimiento_id = 5 AND fecha BETWEEN '$start' AND '$end'")->fetchColumn();

        return [
            'top_maquinas' => $this->db->query($sqlTopMaq)->fetchAll(PDO::FETCH_ASSOC),
            'insumos_mas_usados' => $this->db->query($sqlInsumosUso)->fetchAll(PDO::FETCH_ASSOC),
            'ratio_devolucion' => ['entregas' => (int) $entregas, 'devoluciones' => (int) $devoluciones]
        ];
    }

    public function getBodegaAnalytics($start, $end, $empleadoId = null)
    {
        $sqlTopReceptores = "SELECT COALESCE(e.nombre_completo, u.nombre, 'Externo') as nombre, 
                                    SUM(m.cantidad) as total_items
                            FROM movimientos_inventario m
                            LEFT JOIN empleados e ON m.empleado_id = e.id
                            LEFT JOIN usuarios u ON m.empleado_id = u.id
                            WHERE m.tipo_movimiento_id = 2 
                            AND m.fecha BETWEEN '$start' AND '$end'
                            GROUP BY nombre 
                            ORDER BY total_items DESC LIMIT 5";

        $sqlTimeline = "SELECT m.fecha as fecha_entrega, 
                            i.nombre as insumo, 
                            m.cantidad, 
                            COALESCE(e.nombre_completo, u.nombre, u_sol.nombre, 'Externo/Manual') as retirado_por, 
                            ds.solicitud_id as ot_id, 
                            i.unidad_medida
                        FROM movimientos_inventario m
                        JOIN insumos i ON m.insumo_id = i.id
                        LEFT JOIN empleados e ON m.empleado_id = e.id
                        LEFT JOIN usuarios u ON m.empleado_id = u.id
                        LEFT JOIN detalle_solicitud ds ON m.referencia_id = ds.id
                        LEFT JOIN solicitudes_ot sot ON ds.solicitud_id = sot.id
                        LEFT JOIN usuarios u_sol ON sot.usuario_solicitante_id = u_sol.id
                        
                        WHERE m.tipo_movimiento_id = 2 
                        AND m.fecha BETWEEN '$start' AND '$end'";

        if ($empleadoId) {
            $sqlTimeline .= " AND m.empleado_id = " . intval($empleadoId);
        }

        $sqlTimeline .= " ORDER BY m.fecha DESC LIMIT 20";

        return [
            'top_receptores' => $this->db->query($sqlTopReceptores)->fetchAll(PDO::FETCH_ASSOC),
            'timeline_entregas' => $this->db->query($sqlTimeline)->fetchAll(PDO::FETCH_ASSOC),
            'lista_empleados' => $this->db->query("SELECT id, nombre_completo FROM empleados WHERE activo = 1 ORDER BY nombre_completo ASC")->fetchAll(PDO::FETCH_ASSOC)
        ];
    }

    public function getLogs($tipo = 'general')
    {
        $sql = "SELECT l.*, u.nombre as usuario 
                FROM sistema_logs l 
                LEFT JOIN usuarios u ON l.usuario_id = u.id 
                ORDER BY l.fecha DESC LIMIT 50";
        
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getEntregasParaExcel($start, $end, $empleadoId = null)
    {
        $sql = "SELECT 
                    DATE_FORMAT(m.fecha, '%d-%m-%Y') as fecha,
                    DATE_FORMAT(m.fecha, '%H:%i:%s') as hora,
                    u_bod.nombre as quien_entrego,
                    COALESCE(e.nombre_completo, u_rec.nombre, 'Externo/Manual') as quien_recibio,
                    i.nombre as que_recibio,
                    i.codigo_sku as codigo_producto,
                    m.cantidad as cuanto,
                    i.unidad_medida,
                    ds.solicitud_id as ot_referencia
                FROM movimientos_inventario m
                JOIN insumos i ON m.insumo_id = i.id
                JOIN usuarios u_bod ON m.usuario_id = u_bod.id
                LEFT JOIN empleados e ON m.empleado_id = e.id
                LEFT JOIN usuarios u_rec ON m.empleado_id = u_rec.id
                LEFT JOIN detalle_solicitud ds ON m.referencia_id = ds.id
                
                WHERE m.tipo_movimiento_id = 2 
                AND m.fecha BETWEEN '$start' AND '$end'";

        if ($empleadoId) {
            $sql .= " AND m.empleado_id = " . intval($empleadoId);
        }

        $sql .= " ORDER BY m.fecha DESC";

        return $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
    }
}