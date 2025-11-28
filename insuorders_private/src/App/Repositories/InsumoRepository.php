<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;

class InsumoRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll()
    {
        $sql = "SELECT 
                    i.*,
                    c.nombre as categoria_nombre,
                    u.nombre as ubicacion_nombre,
                    u.codigo as ubicacion_codigo
                FROM insumos i
                LEFT JOIN categorias_insumo c ON i.categoria_id = c.id
                LEFT JOIN ubicaciones u ON i.ubicacion_id = u.id
                ORDER BY i.nombre ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAuxiliares()
    {
        return [
            'categorias' => $this->db->query("SELECT * FROM categorias_insumo ORDER BY nombre")->fetchAll(PDO::FETCH_ASSOC),
            'ubicaciones' => $this->db->query("SELECT * FROM ubicaciones ORDER BY nombre")->fetchAll(PDO::FETCH_ASSOC)
        ];
    }

    public function create($data)
    {
        $sql = "INSERT INTO insumos (codigo_sku, nombre, descripcion, categoria_id, ubicacion_id, stock_actual, stock_minimo, precio_costo, unidad_medida) 
                VALUES (:sku, :nom, :desc, :cat, :ubi, :stock, :min, :costo, :un)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':sku' => $data['codigo_sku'],
            ':nom' => $data['nombre'],
            ':desc' => $data['descripcion'],
            ':cat' => $data['categoria_id'],
            ':ubi' => $data['ubicacion_id'],
            ':stock' => $data['stock_actual'],
            ':min' => $data['stock_minimo'],
            ':costo' => $data['precio_costo'],
            ':un' => $data['unidad_medida']
        ]);
        return $this->db->lastInsertId();
    }

    public function ajustarStock($insumoId, $cantidad, $tipoMovimientoId, $usuarioId, $observacion, $empleadoId = null)
    {
        try {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("SELECT factor FROM tipos_movimiento WHERE id = :id");
            $stmt->execute([':id' => $tipoMovimientoId]);
            $factor = $stmt->fetchColumn();

            $sqlMov = "INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, empleado_id) 
                    VALUES (:iid, :tmid, :cant, :uid, :obs, :empid)";

            $this->db->prepare($sqlMov)->execute([
                ':iid' => $insumoId,
                ':tmid' => $tipoMovimientoId,
                ':cant' => $cantidad,
                ':uid' => $usuarioId,
                ':obs' => $observacion,
                ':empid' => $empleadoId
            ]);

            $cambioNeto = $cantidad * $factor;
            $this->db->prepare("UPDATE insumos SET stock_actual = stock_actual + :cambio WHERE id = :id")
                ->execute([':cambio' => $cambioNeto, ':id' => $insumoId]);

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function delete($id)
    {
        $this->db->prepare("DELETE FROM movimientos_inventario WHERE insumo_id = :id")->execute([':id' => $id]);
        return $this->db->prepare("DELETE FROM insumos WHERE id = :id")->execute([':id' => $id]);
    }
}