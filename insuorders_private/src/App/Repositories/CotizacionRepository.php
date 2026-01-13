<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;
use Exception;
class CotizacionRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll($filters = [])
    {
        $sql = "SELECT c.*, u.nombre as creador_nombre, u.apellido as creador_apellido,
                e.nombre as estado_nombre,
                (SELECT COUNT(*) FROM detalle_cotizacion WHERE cotizacion_id = c.id) as items_count
                FROM cotizaciones c
                JOIN usuarios u ON c.usuario_id = u.id
                JOIN estados_cotizacion e ON c.estado_id = e.id
                WHERE 1=1";
        
        $params = [];

        if (!empty($filters['id'])) {
            $sql .= " AND c.id = :id";
            $params[':id'] = $filters['id'];
        }
        if (!empty($filters['estado_id'])) {
            $sql .= " AND c.estado_id = :estado";
            $params[':estado'] = $filters['estado_id'];
        }
        if (!empty($filters['fecha_start'])) {
            $sql .= " AND DATE(c.fecha_creacion) >= :start";
            $params[':start'] = $filters['fecha_start'];
        }
        if (!empty($filters['fecha_end'])) {
            $sql .= " AND DATE(c.fecha_creacion) <= :end";
            $params[':end'] = $filters['fecha_end'];
        }
        if (!empty($filters['usuario_id'])) {
            $sql .= " AND c.usuario_id = :uid";
            $params[':uid'] = $filters['usuario_id'];
        }

        $sql .= " ORDER BY c.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $sql = "SELECT c.*, 
                    u.nombre as creador_nombre, 
                    u.apellido as creador_apellido, 
                    e.nombre as estado_nombre 
                FROM cotizaciones c 
                JOIN usuarios u ON c.usuario_id = u.id 
                JOIN estados_cotizacion e ON c.estado_id = e.id
                WHERE c.id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $cotizacion = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($cotizacion) {
            $stmtDet = $this->db->prepare("SELECT d.*, i.codigo_sku, i.unidad_medida 
                                        FROM detalle_cotizacion d 
                                        LEFT JOIN insumos i ON d.insumo_id = i.id 
                                        WHERE d.cotizacion_id = :id");
            $stmtDet->execute([':id' => $id]);
            $cotizacion['items'] = $stmtDet->fetchAll(PDO::FETCH_ASSOC);
        }
        return $cotizacion;
    }

    public function create($data, $userId, $totalCalculado)
    {
        try {
            $this->db->beginTransaction();

            $sqlHead = "INSERT INTO cotizaciones (usuario_id, observacion, total_estimado, estado_id, fecha_creacion) 
                        VALUES (:uid, :obs, :total, 1, NOW())";
            $stmt = $this->db->prepare($sqlHead);
            $stmt->execute([
                ':uid' => $userId,
                ':obs' => $data['observacion'] ?? '',
                ':total' => $totalCalculado
            ]);
            $cotId = $this->db->lastInsertId();

            $sqlDet = "INSERT INTO detalle_cotizacion (cotizacion_id, insumo_id, nombre_item, cantidad, precio_unitario) 
                    VALUES (:cid, :iid, :nom, :cant, :precio)";
            $stmtDet = $this->db->prepare($sqlDet);

            foreach ($data['items'] as $item) {
                $stmtDet->execute([
                    ':cid' => $cotId,
                    ':iid' => !empty($item['insumo_id']) ? $item['insumo_id'] : null,
                    ':nom' => $item['nombre_item'],
                    ':cant' => $item['cantidad'],
                    ':precio' => $item['precio']
                ]);
            }

            $this->db->commit();
            return $cotId;

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function updateStatus($id, $estadoId)
    {
        $stmt = $this->db->prepare("UPDATE cotizaciones SET estado_id = :est WHERE id = :id");
        return $stmt->execute([':est' => $estadoId, ':id' => $id]);
    }
    
    public function getEstados()
    {
        return $this->db->query("SELECT * FROM estados_cotizacion ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
    }
}