<?php
namespace App\Repositories;

use App\Database\Database;
use \App\Middleware\AuthMiddleware;
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
        $sql = "SELECT DISTINCT ot.id, ot.titulo, ot.descripcion_trabajo as descripcion_solicitud, 
                ot.fecha_solicitud, ot.fecha_requerida, ot.prioridad, ot.requiere_permiso,
                ot.estado_id, e.nombre as estado,
                ot.imagen_url, ot.ubicacion, ot.comentarios_finales, ot.evidencia_cierre,
                COALESCE(a.nombre, CONCAT('SERVICIO / ', COALESCE(ot.area_negocio, 'General'))) as activo, 
                COALESCE(a.codigo_interno, 'SERV') as codigo_interno, 
                ot.sub_activo_id, sa.nombre as sub_activo_nombre,
                a.plantilla_json,
                u.nombre as solicitante_nombre, u.apellido as solicitante_apellido,
                oa.completado as mi_completado,
                (SELECT GROUP_CONCAT(DISTINCT CONCAT(u2.nombre, ' ', u2.apellido) SEPARATOR ', ') 
                FROM ot_asignaciones oa2 
                JOIN usuarios u2 ON oa2.usuario_id = u2.id 
                WHERE oa2.solicitud_id = ot.id) as equipo_nombres
            FROM solicitudes_ot ot
            JOIN ot_asignaciones oa ON ot.id = oa.solicitud_id
            LEFT JOIN activos a ON ot.activo_id = a.id 
            LEFT JOIN activos sa ON ot.sub_activo_id = sa.id
            JOIN estados_solicitud e ON ot.estado_id = e.id
            JOIN usuarios u ON ot.usuario_solicitante_id = u.id
            WHERE oa.usuario_id = :uid 
            AND ot.estado_id != 6 
            ORDER BY ot.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllOtsWithAsignados()
    {
        $sql = "SELECT ot.id, ot.titulo, ot.descripcion_trabajo as descripcion_solicitud, 
                ot.fecha_solicitud, ot.fecha_requerida, ot.prioridad, ot.requiere_permiso,
                ot.estado_id, e.nombre as estado,
                ot.imagen_url, ot.ubicacion, ot.comentarios_finales, ot.evidencia_cierre,
                COALESCE(a.nombre, CONCAT('SERVICIO / ', COALESCE(ot.area_negocio, 'General'))) as activo, 
                COALESCE(a.codigo_interno, 'SERV') as codigo_interno, 
                ot.sub_activo_id, sa.nombre as sub_activo_nombre,
                a.plantilla_json,
                u.nombre as solicitante_nombre, u.apellido as solicitante_apellido,
                IFNULL(GROUP_CONCAT(DISTINCT tec.id ORDER BY tec.id ASC), '') as asignados_ids,
                IFNULL(GROUP_CONCAT(DISTINCT CONCAT(tec.nombre, ' ', tec.apellido) ORDER BY tec.id ASC SEPARATOR ', '), '') as asignados_nombres,
                0 as mi_completado
            FROM solicitudes_ot ot
            LEFT JOIN ot_asignaciones oa ON ot.id = oa.solicitud_id
            LEFT JOIN usuarios tec ON oa.usuario_id = tec.id
            LEFT JOIN activos a ON ot.activo_id = a.id 
            LEFT JOIN activos sa ON ot.sub_activo_id = sa.id
            JOIN estados_solicitud e ON ot.estado_id = e.id
            JOIN usuarios u ON ot.usuario_solicitante_id = u.id
            WHERE ot.estado_id != 6 
            GROUP BY ot.id
            ORDER BY ot.fecha_solicitud DESC";

        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
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
            if (!$inTransaction)
                $this->db->beginTransaction();

            $del = $this->db->prepare("DELETE FROM ot_checklist_respuestas WHERE solicitud_ot_id = ?");
            $del->execute([$otId]);

            $sql = "INSERT INTO ot_checklist_respuestas (solicitud_ot_id, seccion_key, item_key, valor, observacion) 
                VALUES (:ot, :sec, :key, :val, :obs)";
            $stmt = $this->db->prepare($sql);

            foreach ($respuestas as $resp) {
                if (!isset($resp['key']))
                    continue;

                $stmt->execute([
                    ':ot' => $otId,
                    ':sec' => $resp['seccion'] ?? null,
                    ':key' => $resp['key'],
                    ':val' => $resp['valor'] ?? null,
                    ':obs' => $resp['observacion'] ?? null
                ]);
            }

            if (!$inTransaction)
                $this->db->commit();
            return true;

        } catch (Exception $e) {
            if (!$inTransaction && $this->db->inTransaction())
                $this->db->rollBack();
            throw $e;
        }
    }

    public function guardarCierre($otId, $firmaBase64, $comentarios, $evidenciaStr = null)
    {
        $userId = AuthMiddleware::verify();
        $inTransaction = $this->db->inTransaction();
        try {
            if (!$inTransaction)
                $this->db->beginTransaction();

            $sqlTarea = "UPDATE ot_asignaciones SET completado = 1, fecha_completado = NOW(), notas_cierre = ? WHERE solicitud_id = ? AND usuario_id = ?";
            $this->db->prepare($sqlTarea)->execute([$comentarios, $otId, $userId]);

            if ($firmaBase64) {
                $this->db->prepare("UPDATE solicitudes_ot SET firma_tecnico = ? WHERE id = ?")
                    ->execute([$firmaBase64, $otId]);
            }

            $stmt = $this->db->prepare("SELECT COUNT(*) FROM ot_asignaciones WHERE solicitud_id = ? AND completado = 0");
            $stmt->execute([$otId]);
            $pendientes = $stmt->fetchColumn();

            if ($pendientes == 0) {
                $stmtTotal = $this->db->prepare("SELECT COUNT(*) FROM ot_asignaciones WHERE solicitud_id = ?");
                $stmtTotal->execute([$otId]);
                $totalAsignados = $stmtTotal->fetchColumn();

                $sqlConsolidar = "UPDATE solicitudes_ot SET estado_id = 5, fecha_cierre = NOW()";
                $paramsConsolidar = [];

                if ($totalAsignados > 0) {
                    $sqlConsolidar .= ", comentarios_finales = (SELECT GROUP_CONCAT(CONCAT(u.nombre, ': ', COALESCE(oa.notas_cierre, 'Sin notas')) SEPARATOR ' | ') FROM ot_asignaciones oa JOIN usuarios u ON oa.usuario_id = u.id WHERE oa.solicitud_id = ?)";
                    $paramsConsolidar[] = $otId;
                } else {
                    $sqlConsolidar .= ", comentarios_finales = ?";
                    $paramsConsolidar[] = $comentarios;
                }

                if ($evidenciaStr !== null) {
                    $sqlConsolidar .= ", evidencia_cierre = ?";
                    $paramsConsolidar[] = $this->appendEvidencia($otId, $evidenciaStr);
                }

                $sqlConsolidar .= " WHERE id = ?";
                $paramsConsolidar[] = $otId;
                $this->db->prepare($sqlConsolidar)->execute($paramsConsolidar);

                $sqlSnapshot = "UPDATE detalle_solicitud ds JOIN insumos i ON ds.insumo_id = i.id 
                                SET ds.costo_unitario_snapshot = i.costo_unitario WHERE ds.solicitud_id = ? AND ds.costo_unitario_snapshot <= 0";
                $this->db->prepare($sqlSnapshot)->execute([$otId]);

                $sqlTotal = "UPDATE solicitudes_ot SET costo_total_insumos = COALESCE((SELECT SUM(costo_total_linea) FROM detalle_solicitud WHERE solicitud_id = ?), 0) WHERE id = ?";
                $this->db->prepare($sqlTotal)->execute([$otId, $otId]);
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
            d.costo_unitario_snapshot, d.costo_total_linea,
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
            if ($pendiente <= 0)
                break;

            $disponible = floatval($entrega['cantidad_entregada']) - floatval($entrega['cantidad_utilizada']);

            $aDescontar = min($pendiente, $disponible);

            $nuevoUso = floatval($entrega['cantidad_utilizada']) + $aDescontar;

            $upd = $this->db->prepare("UPDATE entregas_personal SET cantidad_utilizada = :uso, fecha_uso = NOW() WHERE id = :id");
            $upd->execute([':uso' => $nuevoUso, ':id' => $entrega['id']]);

            $pendiente -= $aDescontar;
        }
    }

    public function actualizarEstadoOT($otId, $estadoId)
    {
        $sql = "UPDATE solicitudes_ot SET estado_id = :estado WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':estado' => $estadoId,
            ':id' => $otId
        ]);
    }

    private function appendEvidencia($otId, $nuevasEvidenciasStr)
    {
        $stmt = $this->db->prepare("SELECT evidencia_cierre FROM solicitudes_ot WHERE id = ?");
        $stmt->execute([$otId]);
        $actual = $stmt->fetchColumn();

        $arrActual = [];
        if ($actual) {
            $decoded = json_decode($actual, true);
            $arrActual = is_array($decoded) ? $decoded : [$actual];
        }
        $arrNuevas = json_decode($nuevasEvidenciasStr, true) ?: [];
        return json_encode(array_merge($arrActual, $arrNuevas));
    }

    public function iniciarTrabajoEnOrden($otId)
    {
        $stmt = $this->db->prepare("UPDATE solicitudes_ot SET estado_id = 2 WHERE id = ? AND estado_id IN (1, 4)");
        return $stmt->execute([$otId]);
    }

    public function guardarAvanceParcial($otId, $comentarios, $evidenciaStr = null)
    {
        $userId = AuthMiddleware::verify();
        $sql = "UPDATE ot_asignaciones SET notas_cierre = ? WHERE solicitud_id = ? AND usuario_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$comentarios, $otId, $userId]);
        if ($stmt->rowCount() == 0 && !empty($comentarios)) {
            $sqlMaster = "UPDATE solicitudes_ot SET comentarios_finales = ? WHERE id = ?";
            $this->db->prepare($sqlMaster)->execute([$comentarios, $otId]);
        }

        if ($evidenciaStr !== null) {
            $eviActual = $this->appendEvidencia($otId, $evidenciaStr);
            $sqlEvi = "UPDATE solicitudes_ot SET evidencia_cierre = ? WHERE id = ?";
            $this->db->prepare($sqlEvi)->execute([$eviActual, $otId]);
        }
    }

    public function beginTransaction()
    {
        return $this->db->beginTransaction();
    }
    public function commit()
    {
        return $this->db->commit();
    }
    public function rollBack()
    {
        return $this->db->rollBack();
    }
    public function inTransaction()
    {
        return $this->db->inTransaction();
    }
}