<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;
use Exception;

class BodegaRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getPorOrganizar()
    {
        $sql = "SELECT 
                    i.id, i.codigo_sku, i.nombre, c.nombre as categoria_nombre, 
                    i.stock_actual, i.unidad_medida,
                    isu.cantidad as por_organizar
                FROM insumos i
                JOIN insumo_stock_ubicacion isu ON i.id = isu.insumo_id
                LEFT JOIN categorias_insumo c ON i.categoria_id = c.id
                WHERE isu.ubicacion_id = 1 AND isu.cantidad > 0.01
                ORDER BY i.nombre ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getDevolucionesPendientes()
    {
        $sql = "SELECT dp.id, dp.cantidad, dp.fecha, i.nombre as insumo, i.codigo_sku, i.unidad_medida,
                    u.nombre as tecnico_nombre, u.apellido as tecnico_apellido, dp.insumo_id
                FROM devoluciones_pendientes dp
                JOIN insumos i ON dp.insumo_id = i.id
                JOIN usuarios u ON dp.usuario_id = u.id
                WHERE dp.estado = 'PENDIENTE'
                ORDER BY dp.fecha ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function aprobarDevolucion($devolucionId, $bodegueroId)
    {
        $stmt = $this->db->prepare("SELECT * FROM devoluciones_pendientes WHERE id = :id AND estado = 'PENDIENTE' FOR UPDATE");
        $stmt->execute([':id' => $devolucionId]);
        $dev = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dev) throw new Exception("Devolución no encontrada o ya fue aprobada.");

        $this->db->prepare("UPDATE devoluciones_pendientes SET estado = 'APROBADA' WHERE id = :id")
                ->execute([':id' => $devolucionId]);

        $sqlRestock = "INSERT INTO insumo_stock_ubicacion (insumo_id, ubicacion_id, cantidad) 
                    VALUES (:iid, 1, :cant) 
                    ON DUPLICATE KEY UPDATE cantidad = cantidad + :cant_upd";
        $this->db->prepare($sqlRestock)->execute([
            ':iid' => $dev['insumo_id'],
            ':cant' => $dev['cantidad'],
            ':cant_upd' => $dev['cantidad']
        ]);

        $obs = "Devolución aprobada en bodega (Técnico ID: " . $dev['usuario_id'] . ")";
        $sqlMov = "INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, ubicacion_id, fecha) 
                VALUES (:iid, 1, :cant, :uid, :obs, 1, NOW())";
        $this->db->prepare($sqlMov)->execute([
            ':iid' => $dev['insumo_id'],
            ':cant' => $dev['cantidad'],
            ':uid' => $bodegueroId,
            ':obs' => $obs
        ]);

        return true;
    }

    public function rechazarDevolucion($devolucionId, $bodegueroId, $motivo)
    {
        $stmt = $this->db->prepare("SELECT * FROM devoluciones_pendientes WHERE id = :id AND estado = 'PENDIENTE' FOR UPDATE");
        $stmt->execute([':id' => $devolucionId]);
        $dev = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dev) throw new Exception("Devolución no encontrada o ya procesada.");

        $this->db->prepare("UPDATE devoluciones_pendientes SET estado = 'RECHAZADA', observacion_rechazo = :motivo WHERE id = :id")
                ->execute([':id' => $devolucionId, ':motivo' => $motivo]);

        $sqlReasignar = "INSERT INTO entregas_personal 
            (insumo_id, usuario_operario_id, usuario_bodeguero_id, cantidad_entregada, cantidad_utilizada, estado_id, observacion, fecha_entrega, fecha_aceptacion) 
            VALUES (:iid, :u_op, :u_bod, :cant, 0, 2, :obs, NOW(), NOW())";
        
        $this->db->prepare($sqlReasignar)->execute([
            ':iid' => $dev['insumo_id'],
            ':u_op' => $dev['usuario_id'],
            ':u_bod' => $bodegueroId,
            ':cant' => $dev['cantidad'],
            ':obs' => "Devolución rechazada en bodega. Motivo: " . $motivo
        ]);

        $sqlMov = "INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, ubicacion_id, fecha) 
                VALUES (:iid, 2, :cant, :uid, :obs, 1, NOW())";
        $this->db->prepare($sqlMov)->execute([
            ':iid' => $dev['insumo_id'],
            ':cant' => $dev['cantidad'],
            ':uid' => $bodegueroId,
            ':obs' => "Devolución rechazada y reasignada a técnico ID: " . $dev['usuario_id'] . ". Motivo: " . $motivo
        ]);

        $notifRepo = new \App\Repositories\NotificationRepository();
        $mensaje = "Tu devolución de material ha sido RECHAZADA por bodega. Motivo: " . $motivo;
        $notifRepo->create($dev['usuario_id'], 'Devolución Rechazada', $mensaje, '/operario/mis-insumos', 'high');

        return true;
    }
}