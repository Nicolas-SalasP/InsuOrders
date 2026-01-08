<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;

class CronogramaRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll($filtros = [])
    {
        $sql = "SELECT c.*, 
                       a.nombre as activo_nombre, a.codigo_interno as activo_codigo,
                       i.nombre as insumo_nombre, i.codigo_sku as insumo_sku,
                       s.id as ot_id, s.estado_id as ot_estado
                FROM cronograma_mantencion c
                LEFT JOIN activos a ON c.activo_id = a.id
                LEFT JOIN insumos i ON c.insumo_id = i.id
                LEFT JOIN solicitudes_ot s ON c.solicitud_ot_id = s.id
                WHERE 1=1";

        $params = [];
        if (!empty($filtros['tipo'])) {
            $sql .= " AND c.tipo_evento = ?";
            $params[] = $filtros['tipo'];
        }

        $sql .= " ORDER BY c.fecha_programada ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM cronograma_mantencion WHERE id = ?");
        $stmt->execute([$id]);
        $evento = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($evento) {
            $stmtItems = $this->db->prepare("
                SELECT ci.insumo_id as id, ci.insumo_id, i.nombre, i.codigo_sku, ci.cantidad, i.stock_actual 
                FROM cronograma_insumos ci 
                JOIN insumos i ON ci.insumo_id = i.id 
                WHERE ci.cronograma_id = ?
            ");
            $stmtItems->execute([$id]);
            $evento['items'] = $stmtItems->fetchAll(PDO::FETCH_ASSOC);
            $evento['insumos'] = $evento['items'];
        }

        return $evento;
    }

    public function create($data)
    {
        $sql = "INSERT INTO cronograma_mantencion 
            (tipo_evento, activo_id, insumo_id, titulo, descripcion, fecha_programada, hora_programada, cantidad, monto_estimado, estado, icono, color, solicitud_ot_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $data['tipo_evento'],
            $data['activo_id'] ?: null,
            $data['insumo_id'] ?: null,
            $data['titulo'],
            $data['descripcion'] ?? null,
            $data['fecha_programada'],
            $data['hora_programada'] ?? null,
            $data['cantidad'] ?? null,
            $data['monto_estimado'] ?? null,
            $data['estado'] ?? 'PROCESADO',
            $data['icono'] ?? 'bi-tools',
            $data['color'] ?? '#0d6efd',
            $data['solicitud_ot_id'] ?? null
        ]);
        return $this->db->lastInsertId();
    }

    public function update($id, $data)
    {
        $sql = "UPDATE cronograma_mantencion SET 
                activo_id = ?, insumo_id = ?, titulo = ?, descripcion = ?, 
                fecha_programada = ?, hora_programada = ?, cantidad = ?, monto_estimado = ?, 
                estado = ?, icono = ?, color = ?
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['activo_id'] ?: null,
            $data['insumo_id'] ?: null,
            $data['titulo'],
            $data['descripcion'] ?? null,
            $data['fecha_programada'],
            $data['hora_programada'] ?? null,
            $data['cantidad'] ?? null,
            $data['monto_estimado'] ?? null,
            $data['estado'],
            $data['icono'],
            $data['color'],
            $id
        ]);
    }

    public function addInsumos($cronogramaId, $items)
    {
        $stmt = $this->db->prepare("INSERT INTO cronograma_insumos (cronograma_id, insumo_id, cantidad) VALUES (?, ?, ?)");
        foreach ($items as $it) {
            $iid = $it['insumo_id'] ?? $it['id'] ?? null;
            if ($iid) {
                $stmt->execute([$cronogramaId, $iid, $it['cantidad']]);
            }
        }
    }

    public function deleteInsumos($cronogramaId)
    {
        return $this->db->prepare("DELETE FROM cronograma_insumos WHERE cronograma_id = ?")->execute([$cronogramaId]);
    }

    public function delete($id)
    {
        $this->deleteInsumos($id);
        return $this->db->prepare("DELETE FROM cronograma_mantencion WHERE id = ?")->execute([$id]);
    }

    public function getPendientesAlerta()
    {
        return $this->db->query("
            SELECT * FROM cronograma_mantencion 
            WHERE estado = 'PENDIENTE' 
            AND tipo_evento = 'MANTENCION'
            AND fecha_programada BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
        ")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateEstado($id, $estado, $otId = null)
    {
        $sql = "UPDATE cronograma_mantencion SET estado = ?, solicitud_ot_id = ? WHERE id = ?";
        return $this->db->prepare($sql)->execute([$estado, $otId, $id]);
    }
}