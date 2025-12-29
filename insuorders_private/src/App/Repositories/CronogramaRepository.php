<?php
namespace App\Repositories;

use App\Database\Database;

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
                       i.nombre as insumo_nombre, i.codigo_sku as insumo_sku
                FROM cronograma_mantencion c
                LEFT JOIN activos a ON c.activo_id = a.id
                LEFT JOIN insumos i ON c.insumo_id = i.id
                WHERE 1=1";

        $params = [];
        if (!empty($filtros['tipo'])) {
            $sql .= " AND c.tipo_evento = ?";
            $params[] = $filtros['tipo'];
        }

        $sql .= " ORDER BY c.fecha_programada ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM cronograma_mantencion WHERE id = ?");
        $stmt->execute([$id]);
        $evento = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($evento) {
            $stmtItems = $this->db->prepare("
                SELECT ci.insumo_id as id, i.nombre, i.codigo_sku, ci.cantidad 
                FROM cronograma_insumos ci 
                JOIN insumos i ON ci.insumo_id = i.id 
                WHERE ci.cronograma_id = ?
            ");
            $stmtItems->execute([$id]);
            $evento['items'] = $stmtItems->fetchAll(\PDO::FETCH_ASSOC);
        }

        return $evento;
    }

    public function create($data)
    {
        $sql = "INSERT INTO cronograma_mantencion 
            (tipo_evento, activo_id, insumo_id, titulo, descripcion, fecha_programada, cantidad, monto_estimado, estado, icono, color) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', ?, ?)";

        $activoId = (!empty($data['activo_id']) && $data['activo_id'] !== "") ? $data['activo_id'] : null;
        $insumoId = (!empty($data['insumo_id']) && $data['insumo_id'] !== "") ? $data['insumo_id'] : null;

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $data['tipo_evento'],
            $activoId,
            $insumoId,
            $data['titulo'],
            $data['descripcion'] ?? null,
            $data['fecha_programada'],
            $data['cantidad'] ?? null,
            $data['monto_estimado'] ?? null,
            $data['icono'] ?? ($data['tipo_evento'] === 'MANTENCION' ? 'bi-tools' : 'bi-cart-plus'),
            $data['color'] ?? ($data['tipo_evento'] === 'MANTENCION' ? '#0d6efd' : '#198754')
        ]);
        return $this->db->lastInsertId();
    }

    public function addInsumos($cronogramaId, $items)
    {
        $stmt = $this->db->prepare("INSERT INTO cronograma_insumos (cronograma_id, insumo_id, cantidad) VALUES (?, ?, ?)");
        foreach ($items as $it) {
            if (!empty($it['id'])) {
                $stmt->execute([$cronogramaId, $it['id'], $it['cantidad']]);
            }
        }
    }

    public function update($id, $data)
    {
        $sql = "UPDATE cronograma_mantencion SET 
                activo_id = ?, insumo_id = ?, titulo = ?, descripcion = ?, 
                fecha_programada = ?, cantidad = ?, monto_estimado = ?, 
                estado = ?, icono = ?, color = ?
                WHERE id = ?";

        $activoId = !empty($data['activo_id']) ? $data['activo_id'] : null;
        $insumoId = !empty($data['insumo_id']) ? $data['insumo_id'] : null;

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $activoId,
            $insumoId,
            $data['titulo'],
            $data['descripcion'] ?? null,
            $data['fecha_programada'],
            $data['cantidad'] ?? null,
            $data['monto_estimado'] ?? null,
            $data['estado'],
            $data['icono'],
            $data['color'],
            $id
        ]);
    }

    public function deleteInsumos($cronogramaId)
    {
        return $this->db->prepare("DELETE FROM cronograma_insumos WHERE cronograma_id = ?")->execute([$cronogramaId]);
    }

    public function delete($id)
    {
        return $this->db->prepare("DELETE FROM cronograma_mantencion WHERE id = ?")->execute([$id]);
    }

    public function getPendientesAlerta()
    {
        return $this->db->query("
            SELECT * FROM cronograma_mantencion 
            WHERE estado = 'PENDIENTE' 
            AND tipo_evento = 'MANTENCION'
            AND fecha_programada BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
        ")->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function updateEstado($id, $estado, $otId = null)
    {
        $sql = "UPDATE cronograma_mantencion SET estado = ?, solicitud_ot_id = ? WHERE id = ?";
        return $this->db->prepare($sql)->execute([$estado, $otId, $id]);
    }
}