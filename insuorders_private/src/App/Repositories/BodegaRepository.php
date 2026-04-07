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
        $sql = "SELECT dp.id, dp.cantidad, dp.fecha, dp.comentario_tecnico,
                    i.nombre as insumo, i.codigo_sku, i.unidad_medida,
                    u.nombre as tecnico_nombre, u.apellido as tecnico_apellido, dp.insumo_id,
                    td.nombre as tipo_motivo, td.codigo as tipo_codigo
                FROM devoluciones_pendientes dp
                JOIN insumos i ON dp.insumo_id = i.id
                JOIN usuarios u ON dp.usuario_id = u.id
                LEFT JOIN tipos_devolucion td ON dp.tipo_devolucion_id = td.id
                WHERE dp.estado = 'PENDIENTE'
                ORDER BY dp.fecha ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function aprobarDevolucion($devolucionId, $bodegueroId)
    {
        $inTransaction = $this->db->inTransaction();
        try {
            if (!$inTransaction)
                $this->db->beginTransaction();

            $sql = "SELECT dp.*, td.codigo as tipo_codigo, td.reintegra_stock, td.requiere_organizacion 
                    FROM devoluciones_pendientes dp
                    LEFT JOIN tipos_devolucion td ON dp.tipo_devolucion_id = td.id
                    WHERE dp.id = :id AND dp.estado = 'PENDIENTE' FOR UPDATE";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $devolucionId]);
            $dev = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$dev)
                throw new Exception("Devolución no encontrada o ya fue aprobada.");

            $requiereOrg = isset($dev['requiere_organizacion']) ? $dev['requiere_organizacion'] : 1;
            $reintegra = isset($dev['reintegra_stock']) ? $dev['reintegra_stock'] : 1;

            $this->db->prepare("UPDATE devoluciones_pendientes SET estado = 'APROBADA' WHERE id = :id")
                ->execute([':id' => $devolucionId]);

            if ($requiereOrg == 1) {
                // ==========================================
                // CASO A: SOBRANTE (Flujo Normal)
                // ==========================================
                $sqlRestock = "INSERT INTO insumo_stock_ubicacion (insumo_id, ubicacion_id, cantidad) 
                            VALUES (:iid, 1, :cant) 
                            ON DUPLICATE KEY UPDATE cantidad = cantidad + :cant_upd";
                $this->db->prepare($sqlRestock)->execute([
                    ':iid' => $dev['insumo_id'],
                    ':cant' => $dev['cantidad'],
                    ':cant_upd' => $dev['cantidad']
                ]);

                $obs = "Devolución (Sobrante) aprobada a Por Organizar (Técnico ID: " . $dev['usuario_id'] . ")";
                $sqlMov = "INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, ubicacion_id, fecha) 
                        VALUES (:iid, 1, :cant, :uid, :obs, 1, NOW())"; // Tipo 1 = Entrada
                $this->db->prepare($sqlMov)->execute([
                    ':iid' => $dev['insumo_id'],
                    ':cant' => $dev['cantidad'],
                    ':uid' => $bodegueroId,
                    ':obs' => $obs
                ]);

            } elseif ($requiereOrg == 0 && $reintegra == 1) {
                // ==========================================
                // CASO B: NO RECIBIDO (Error Logístico)
                // ==========================================
                $this->db->prepare("UPDATE insumos SET stock_actual = stock_actual + :cant WHERE id = :iid")
                    ->execute([':cant' => $dev['cantidad'], ':iid' => $dev['insumo_id']]);

                $obs = "Reintegro por NO RECIBIDO (Técnico ID: " . $dev['usuario_id'] . "). Devuelto al stock principal.";
                $sqlMov = "INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, fecha) 
                        VALUES (:iid, 1, :cant, :uid, :obs, NOW())";
                $this->db->prepare($sqlMov)->execute([
                    ':iid' => $dev['insumo_id'],
                    ':cant' => $dev['cantidad'],
                    ':uid' => $bodegueroId,
                    ':obs' => $obs
                ]);

            } elseif ($reintegra == 0) {
                // ==========================================
                // CASO C: DAÑO / MERMA
                // ==========================================
                $obs = "Baja por DAÑO/MERMA en rechazo de (Técnico ID: " . $dev['usuario_id'] . ")";
                $sqlMov = "INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, fecha) 
                        VALUES (:iid, 2, :cant, :uid, :obs, NOW())";
                $this->db->prepare($sqlMov)->execute([
                    ':iid' => $dev['insumo_id'],
                    ':cant' => $dev['cantidad'],
                    ':uid' => $bodegueroId,
                    ':obs' => $obs
                ]);
            }

            if (!$inTransaction)
                $this->db->commit();
            return true;

        } catch (Exception $e) {
            if (!$inTransaction)
                $this->db->rollBack();
            throw $e;
        }
    }

    public function rechazarDevolucion($devolucionId, $bodegueroId, $motivo)
    {
        $stmt = $this->db->prepare("SELECT * FROM devoluciones_pendientes WHERE id = :id AND estado = 'PENDIENTE' FOR UPDATE");
        $stmt->execute([':id' => $devolucionId]);
        $dev = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dev)
            throw new Exception("Devolución no encontrada o ya procesada.");

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

    public function getTiposDevolucion()
    {
        $sql = "SELECT id, codigo, nombre, descripcion FROM tipos_devolucion ORDER BY id ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
}