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
                    (
                        SELECT GROUP_CONCAT(
                            CONCAT(
                                IFNULL(s.nombre, 'General'), ' - ', u.nombre, 
                                ' (', REPLACE(FORMAT(isu.cantidad, 2), '.00', ''), ')'
                            ) 
                            SEPARATOR '||'
                        )
                        FROM insumo_stock_ubicacion isu
                        JOIN ubicaciones u ON isu.ubicacion_id = u.id
                        LEFT JOIN sectores s ON u.sector_id = s.id
                        WHERE isu.insumo_id = i.id AND isu.cantidad > 0
                    ) as ubicaciones_multiples

                FROM insumos i
                LEFT JOIN categorias_insumo c ON i.categoria_id = c.id
                ORDER BY i.nombre ASC";

        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAuxiliares()
    {
        $categorias = $this->db->query("SELECT * FROM categorias_insumo ORDER BY nombre")->fetchAll(PDO::FETCH_ASSOC);
        $sectores = $this->db->query("SELECT * FROM sectores ORDER BY nombre")->fetchAll(PDO::FETCH_ASSOC);

        $ubicaciones = $this->db->query("SELECT u.id, u.nombre, u.sector_id, s.nombre as sector_nombre 
                                            FROM ubicaciones u 
                                            LEFT JOIN sectores s ON u.sector_id = s.id 
                                            ORDER BY s.nombre, u.nombre")->fetchAll(PDO::FETCH_ASSOC);

        return [
            'categorias' => $categorias,
            'sectores' => $sectores,
            'ubicaciones' => $ubicaciones
        ];
    }

    public function create($data)
    {
        $sql = "INSERT INTO insumos (
                    codigo_sku, nombre, descripcion, categoria_id, ubicacion_id, 
                    stock_actual, stock_minimo, precio_costo, moneda, unidad_medida
                ) VALUES (
                    :sku, :nom, :desc, :cat, NULL, 
                    :stock, :min, :precio, :moneda, :unidad
                )";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':sku' => $data['codigo_sku'],
            ':nom' => $data['nombre'],
            ':desc' => $data['descripcion'] ?? '',
            ':cat' => $data['categoria_id'],
            ':stock' => $data['stock_actual'],
            ':min' => $data['stock_minimo'],
            ':precio' => $data['precio_costo'],
            ':moneda' => $data['moneda'],
            ':unidad' => $data['unidad_medida']
        ]);
        return $this->db->lastInsertId();
    }

    public function delete($id)
    {
        $this->db->prepare("DELETE FROM movimientos_inventario WHERE insumo_id = :id")->execute([':id' => $id]);
        $this->db->prepare("DELETE FROM insumo_stock_ubicacion WHERE insumo_id = :id")->execute([':id' => $id]);
        $this->db->prepare("DELETE FROM insumos WHERE id = :id")->execute([':id' => $id]);
        return true;
    }

    public function updateStock($id, $cantidad, $operacion)
    {
        $sql = "UPDATE insumos SET stock_actual = stock_actual $operacion :cant WHERE id = :id";
        $this->db->prepare($sql)->execute([':cant' => $cantidad, ':id' => $id]);
    }

    public function registrarMovimiento($data)
    {
        $sql = "INSERT INTO movimientos_inventario (
                    insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, empleado_id
                ) VALUES (
                    :iid, :tid, :cant, :uid, :obs, :emp
                )";

        $this->db->prepare($sql)->execute([
            ':iid' => $data['insumo_id'],
            ':tid' => $data['tipo_movimiento_id'],
            ':cant' => $data['cantidad'],
            ':uid' => $data['usuario_id'],
            ':obs' => $data['observacion'],
            ':emp' => $data['empleado_id'] ?? null
        ]);
    }

    // Método necesario para gestionar stock desde InsumoService
    public function ajustarStock($insumoId, $cantidad, $tipoMovimiento, $usuarioId, $observacion, $empleadoId = null)
    {
        try {
            $this->db->beginTransaction();
            $this->registrarMovimiento([
                'insumo_id' => $insumoId,
                'tipo_movimiento_id' => $tipoMovimiento,
                'cantidad' => $cantidad,
                'usuario_id' => $usuarioId,
                'observacion' => $observacion,
                'empleado_id' => $empleadoId
            ]);

            $operador = ($tipoMovimiento == 3) ? '+' : '-';
            $this->updateStock($insumoId, $cantidad, $operador);

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}