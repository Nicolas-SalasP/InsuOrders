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

    public function getStats()
    {
        $sqlOT = "SELECT COUNT(*) FROM solicitudes_ot WHERE estado_id IN (1, 4)";
        $pendientesOT = $this->db->query($sqlOT)->fetchColumn();

        $sqlStock = "SELECT COUNT(*) FROM insumos WHERE stock_actual <= stock_minimo";
        $bajoStock = $this->db->query($sqlStock)->fetchColumn();

        $sqlBodega = "SELECT COUNT(*) FROM detalle_solicitud ds 
                    JOIN solicitudes_ot s ON ds.solicitud_id = s.id 
                    WHERE ds.estado_linea = 'EN_BODEGA' AND s.estado_id IN (1, 2, 4)";
        $pendientesBodega = $this->db->query($sqlBodega)->fetchColumn();

        $sqlOC = "SELECT COUNT(*) FROM ordenes_compra WHERE estado_id NOT IN (4, 5)";
        $pendientesOC = $this->db->query($sqlOC)->fetchColumn();

        return [
            'ot_pendientes' => $pendientesOT,
            'stock_critico' => $bajoStock,
            'bodega_pendientes' => $pendientesBodega,
            'compras_pendientes' => $pendientesOC
        ];
    }

    public function getLogs($area = 'general')
    {
        $logs = [];
        if ($area == 'general' || $area == 'sistema') {
            $sql = "SELECT l.fecha, u.nombre as usuario, l.accion, l.descripcion, 'Sistema' as area 
                    FROM sistema_logs l 
                    LEFT JOIN usuarios u ON l.usuario_id = u.id 
                    ORDER BY l.fecha DESC LIMIT 20";
            $res = $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            $logs = array_merge($logs, $res);
        }

        if ($area == 'general' || $area == 'bodega' || $area == 'inventario') {
            $sql = "SELECT m.fecha, u.nombre as usuario, 
                    CONCAT(tm.nombre, ': ', m.cantidad, ' de ', i.nombre) as descripcion, 
                    'Bodega' as area, 'MOVIMIENTO' as accion
                    FROM movimientos_inventario m
                    JOIN usuarios u ON m.usuario_id = u.id
                    JOIN tipos_movimiento tm ON m.tipo_movimiento_id = tm.id
                    JOIN insumos i ON m.insumo_id = i.id
                    ORDER BY m.fecha DESC LIMIT 20";
            $res = $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            $logs = array_merge($logs, $res);
        }

        if ($area == 'general' || $area == 'mantencion') {
            $sql = "SELECT s.fecha_solicitud as fecha, u.nombre as usuario, 
                    CONCAT('Creó OT #', s.id, ' para ', COALESCE(a.nombre, 'General')) as descripcion,
                    'Mantención' as area, 'CREACION_OT' as accion
                    FROM solicitudes_ot s
                    JOIN usuarios u ON s.usuario_solicitante_id = u.id
                    LEFT JOIN activos a ON s.activo_id = a.id
                    ORDER BY s.fecha_solicitud DESC LIMIT 20";
            $res = $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            $logs = array_merge($logs, $res);
        }

        if ($area == 'general' || $area == 'compras') {
            $sql = "SELECT oc.fecha_creacion as fecha, u.nombre as usuario, 
                    CONCAT('Generó OC #', oc.id, ' a ', p.nombre) as descripcion,
                    'Compras' as area, 'CREACION_OC' as accion
                    FROM ordenes_compra oc
                    JOIN usuarios u ON oc.usuario_creador_id = u.id
                    JOIN proveedores p ON oc.proveedor_id = p.id
                    ORDER BY oc.fecha_creacion DESC LIMIT 20";
            $res = $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            $logs = array_merge($logs, $res);
        }

        usort($logs, function($a, $b) {
            return strtotime($b['fecha']) - strtotime($a['fecha']);
        });

        return array_slice($logs, 0, 50);
    }
}