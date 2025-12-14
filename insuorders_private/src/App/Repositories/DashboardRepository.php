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

    // --- ESTADÍSTICAS GENERALES (ADMIN) ---
    public function getStats()
    {
        return [
            'total_gasto' => $this->db->query("SELECT SUM(monto_total) FROM ordenes_compra WHERE estado_id != 5")->fetchColumn() ?: 0,
            'total_ots' => $this->db->query("SELECT COUNT(*) FROM solicitudes_ot")->fetchColumn(),
            'stock_bajo' => $this->db->query("SELECT COUNT(*) FROM insumos WHERE stock_actual <= stock_minimo")->fetchColumn(),
            'proveedores_activos' => $this->db->query("SELECT COUNT(*) FROM proveedores")->fetchColumn()
        ];
    }

    // --- ANALÍTICAS DE COMPRAS ---
    public function getComprasStats($start, $end)
    {
        $data = [];

        // 1. Gasto Mensual (Últimos 6 meses)
        $sqlTrend = "SELECT DATE_FORMAT(fecha_creacion, '%Y-%m') as mes, SUM(monto_total) as total 
                     FROM ordenes_compra 
                     WHERE estado_id != 5 AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                     GROUP BY mes ORDER BY mes ASC";
        $data['tendencia'] = $this->db->query($sqlTrend)->fetchAll(PDO::FETCH_ASSOC);

        // 2. Top Proveedores ($)
        $sqlProv = "SELECT p.nombre, SUM(oc.monto_total) as total
                    FROM ordenes_compra oc
                    JOIN proveedores p ON oc.proveedor_id = p.id
                    WHERE oc.estado_id != 5 AND oc.fecha_creacion BETWEEN :s AND :e
                    GROUP BY p.id ORDER BY total DESC LIMIT 5";
        $stmt = $this->db->prepare($sqlProv);
        $stmt->execute([':s' => $start, ':e' => $end]);
        $data['top_proveedores'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Top Insumos Comprados ($)
        $sqlItems = "SELECT i.nombre, SUM(doc.total_linea) as total
                     FROM detalle_orden_compra doc
                     JOIN ordenes_compra oc ON doc.orden_compra_id = oc.id
                     JOIN insumos i ON doc.insumo_id = i.id
                     WHERE oc.estado_id != 5 AND oc.fecha_creacion BETWEEN :s AND :e
                     GROUP BY i.id ORDER BY total DESC LIMIT 5";
        $stmt = $this->db->prepare($sqlItems);
        $stmt->execute([':s' => $start, ':e' => $end]);
        $data['top_insumos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $data;
    }

    // --- ANALÍTICAS DE MANTENCIÓN ---
    public function getMantencionStats($start, $end)
    {
        $data = [];

        // 1. Insumos más usados (Cantidad)
        $sqlUsados = "SELECT i.nombre, SUM(m.cantidad) as cantidad
                      FROM movimientos_inventario m
                      JOIN insumos i ON m.insumo_id = i.id
                      WHERE m.tipo_movimiento_id = 2 AND m.fecha BETWEEN :s AND :e
                      GROUP BY i.id ORDER BY cantidad DESC LIMIT 8";
        $stmt = $this->db->prepare($sqlUsados);
        $stmt->execute([':s' => $start, ':e' => $end]);
        $data['insumos_usados'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 2. Máquinas con más OTs
        $sqlMaq = "SELECT a.nombre, COUNT(s.id) as total
                   FROM solicitudes_ot s
                   JOIN activos a ON s.activo_id = a.id
                   WHERE s.fecha_solicitud BETWEEN :s AND :e
                   GROUP BY a.id ORDER BY total DESC LIMIT 5";
        $stmt = $this->db->prepare($sqlMaq);
        $stmt->execute([':s' => $start, ':e' => $end]);
        $data['top_maquinas'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Resumen OTs (Completadas vs Pendientes)
        $sqlEstado = "SELECT e.nombre as estado, COUNT(s.id) as cantidad
                      FROM solicitudes_ot s
                      JOIN estados_solicitud e ON s.estado_id = e.id
                      WHERE s.fecha_solicitud BETWEEN :s AND :e
                      GROUP BY e.id";
        $stmt = $this->db->prepare($sqlEstado);
        $stmt->execute([':s' => $start, ':e' => $end]);
        $data['estado_ots'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $data;
    }

    // --- LOGS DEL SISTEMA (Mantiene tu funcionalidad actual) ---
    public function getLogs($area)
    {
        $sql = "SELECT l.*, u.username 
                FROM sistema_logs l 
                LEFT JOIN usuarios u ON l.usuario_id = u.id 
                ORDER BY l.fecha DESC LIMIT 50";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
}