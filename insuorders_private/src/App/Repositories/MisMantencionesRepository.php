<?php
namespace App\Repositories;

use App\Database\Database;
use Exception;
use PDO;

class MisMantencionesRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getOtsAsignadas($userId)
    {
        $sql = "SELECT ot.id, ot.descripcion_trabajo as descripcion_solicitud, ot.fecha_solicitud, 
                ot.estado_id, e.nombre as estado,
                COALESCE(a.nombre, 'Servicio General') as activo, 
                COALESCE(a.codigo_interno, 'SERV') as codigo_interno, 
                a.plantilla_json,
                u.nombre as solicitante_nombre, u.apellido as solicitante_apellido
            FROM solicitudes_ot ot
            LEFT JOIN activos a ON ot.activo_id = a.id 
            JOIN estados_solicitud e ON ot.estado_id = e.id
            JOIN usuarios u ON ot.usuario_solicitante_id = u.id
            WHERE ot.asignado_a = :uid 
            AND ot.estado_id NOT IN (5, 6) 
            ORDER BY ot.fecha_solicitud DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRespuestasPorOt($otId)
    {
        $sql = "SELECT seccion_key, item_key, valor, observacion 
            FROM ot_checklist_respuestas 
            WHERE solicitud_ot_id = :otId";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':otId' => $otId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function guardarChecklist($otId, $respuestas)
    {
        try {
            $inTransaction = $this->db->inTransaction();
            if (!$inTransaction) $this->db->beginTransaction();

            $del = $this->db->prepare("DELETE FROM ot_checklist_respuestas WHERE solicitud_ot_id = ?");
            $del->execute([$otId]);

            $sql = "INSERT INTO ot_checklist_respuestas (solicitud_ot_id, seccion_key, item_key, valor, observacion) 
                VALUES (:ot, :sec, :key, :val, :obs)";
            $stmt = $this->db->prepare($sql);

            foreach ($respuestas as $resp) {
                if (!isset($resp['key'])) continue;

                $stmt->execute([
                    ':ot' => $otId,
                    ':sec' => $resp['seccion'] ?? null,
                    ':key' => $resp['key'],
                    ':val' => $resp['valor'] ?? null,
                    ':obs' => $resp['observacion'] ?? null
                ]);
            }

            if (!$inTransaction) $this->db->commit();
            return true;

        } catch (Exception $e) {
            if (!$inTransaction && $this->db->inTransaction()) $this->db->rollBack();
            throw $e;
        }
    }

    public function guardarCierre($otId, $firmaBase64, $comentarios)
    {
        $sql = "UPDATE solicitudes_ot SET 
            firma_tecnico = :firma, 
            comentarios_finales = :com,
            estado_id = 5, 
            fecha_cierre = NOW() 
            WHERE id = :id";

        $this->db->prepare($sql)->execute([
            ':firma' => $firmaBase64,
            ':com' => $comentarios,
            ':id' => $otId
        ]);
    }

    public function guardarUrlPdf($otId, $url)
    {
        $this->db->prepare("UPDATE solicitudes_ot SET pdf_url = :url WHERE id = :id")
            ->execute([':url' => $url, ':id' => $otId]);
    }

    public function getOTHeader($id)
    {
        $sql = "SELECT s.*, 
            CONCAT(u_asig.nombre, ' ', u_asig.apellido) as asignado_nombre,
            u.nombre as solicitante_nombre, u.apellido as solicitante_apellido, 
            CASE WHEN s.activo_id IS NOT NULL THEN a.nombre ELSE CONCAT('SERVICIO: ', COALESCE(s.area_negocio, 'General')) END as activo, 
            COALESCE(a.codigo_interno, 'SERV') as activo_codigo, e.nombre as estado 
            FROM solicitudes_ot s 
            JOIN usuarios u ON s.usuario_solicitante_id = u.id 
            LEFT JOIN usuarios u_asig ON s.asignado_a = u_asig.id
            LEFT JOIN activos a ON s.activo_id = a.id 
            JOIN estados_solicitud e ON s.estado_id = e.id 
            WHERE s.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getDetallesOT($id)
    {
        $sql = "SELECT d.cantidad, d.cantidad_entregada, d.estado_linea, 
            i.nombre, i.codigo_sku, i.unidad_medida
            FROM detalle_solicitud d 
            JOIN insumos i ON d.insumo_id = i.id 
            WHERE d.solicitud_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getInsumosPorOt($otId, $userId)
    {
        $sql = "SELECT d.id, d.cantidad, d.cantidad_entregada, d.estado_linea, 
                    i.id as insumo_id, i.nombre, i.codigo_sku, i.unidad_medida,
                    (
                        SELECT COALESCE(SUM(ep.cantidad_entregada - ep.cantidad_utilizada), 0)
                        FROM entregas_personal ep 
                        WHERE ep.insumo_id = d.insumo_id 
                            AND ep.usuario_operario_id = :uid 
                            AND ep.estado_id IN (1, 2)
                    ) as stock_usuario
            FROM detalle_solicitud d 
            JOIN insumos i ON d.insumo_id = i.id 
            WHERE d.solicitud_id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $otId, ':uid' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function descontarStockUsuario($userId, $insumoId, $cantidadRequerida)
    {
        $sql = "SELECT id, cantidad_entregada, cantidad_utilizada 
                FROM entregas_personal 
                WHERE usuario_operario_id = :uid 
                AND insumo_id = :iid 
                AND estado_id IN (1, 2) 
                AND (cantidad_entregada - cantidad_utilizada) > 0 
                ORDER BY fecha_entrega ASC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':uid' => $userId, ':iid' => $insumoId]);
        $misEntregas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $pendiente = floatval($cantidadRequerida);

        foreach ($misEntregas as $entrega) {
            if ($pendiente <= 0) break;

            $disponible = floatval($entrega['cantidad_entregada']) - floatval($entrega['cantidad_utilizada']);
            
            $aDescontar = min($pendiente, $disponible);
            
            $nuevoUso = floatval($entrega['cantidad_utilizada']) + $aDescontar;
            
            $upd = $this->db->prepare("UPDATE entregas_personal SET cantidad_utilizada = :uso, fecha_uso = NOW() WHERE id = :id");
            $upd->execute([':uso' => $nuevoUso, ':id' => $entrega['id']]);

            $pendiente -= $aDescontar;
        }
    }
    
    public function beginTransaction() { return $this->db->beginTransaction(); }
    public function commit() { return $this->db->commit(); }
    public function rollBack() { return $this->db->rollBack(); }
    public function inTransaction() { return $this->db->inTransaction(); }
}