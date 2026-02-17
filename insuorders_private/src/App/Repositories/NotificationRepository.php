<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;

class NotificationRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // ==========================================
    // NOTIFICACIONES PERSONALES (TABLA)
    // ==========================================
    public function create($userId, $titulo, $mensaje, $link = null, $tipo = 'info')
    {
        $sql = "INSERT INTO notificaciones (usuario_id, titulo, mensaje, link, tipo) 
                VALUES (:uid, :tit, :msg, :lnk, :tipo)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':uid' => $userId, ':tit' => $titulo, ':msg' => $mensaje, ':lnk' => $link, ':tipo' => $tipo]);
    }

    public function getByUser($userId, $limit = 20)
    {
        $stmt = $this->db->prepare("SELECT * FROM notificaciones WHERE usuario_id = :uid ORDER BY created_at DESC LIMIT $limit");
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUnreadCount($userId)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM notificaciones WHERE usuario_id = ? AND leido = 0");
        $stmt->execute([$userId]);
        return $stmt->fetchColumn();
    }

    public function markAsRead($notifId, $userId)
    {
        return $this->db->prepare("UPDATE notificaciones SET leido = 1 WHERE id = ? AND usuario_id = ?")->execute([$notifId, $userId]);
    }

    public function markAllRead($userId)
    {
        return $this->db->prepare("UPDATE notificaciones SET leido = 1 WHERE usuario_id = ?")->execute([$userId]);
    }

    // ==========================================
    // INDICADORES GLOBALES (DASHBOARD/CAMPANA)
    // ==========================================

    public function countFaltaStockReal()
    {
        $sql = "SELECT COUNT(*) FROM (
                    SELECT ds.insumo_id
                    FROM detalle_solicitud ds
                    JOIN solicitudes_ot s ON ds.solicitud_id = s.id
                    JOIN insumos i ON ds.insumo_id = i.id
                    WHERE ds.estado_linea = 'REQUIERE_COMPRA'
                    AND s.estado_id IN (1, 2, 4)
                    GROUP BY ds.insumo_id
                    HAVING (SUM(ds.cantidad) - MAX(i.stock_actual) - COALESCE((
                        SELECT SUM(doc.cantidad_solicitada - doc.cantidad_recibida)
                        FROM detalle_orden_compra doc
                        JOIN ordenes_compra oc ON doc.orden_compra_id = oc.id
                        WHERE doc.insumo_id = ds.insumo_id AND oc.estado_id IN (2, 3)
                    ), 0)) > 0
                ) as subquery";
        return (int) $this->db->query($sql)->fetchColumn();
    }

    public function countEntregasPendientes()
    {
        return (int) $this->db->query("SELECT COUNT(*) FROM detalle_solicitud WHERE estado_linea = 'PENDIENTE'")->fetchColumn();
    }

    public function countRecepcionesOc()
    {
        return (int) $this->db->query("SELECT COUNT(*) FROM ordenes_compra WHERE estado_id = 2")->fetchColumn(); // Emitida/En tránsito
    }

    public function countOtsNuevas()
    {
        return (int) $this->db->query("SELECT COUNT(*) FROM solicitudes_ot WHERE estado_id = 1")->fetchColumn(); // Pendientes
    }
}