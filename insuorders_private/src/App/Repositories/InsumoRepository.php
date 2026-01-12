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
        $sql = "SELECT i.*, c.nombre as categoria_nombre,
                    (SELECT CONCAT(IFNULL(s.nombre, 'General'), ' - ', u.nombre) FROM insumo_stock_ubicacion isu JOIN ubicaciones u ON isu.ubicacion_id = u.id LEFT JOIN sectores s ON u.sector_id = s.id WHERE isu.insumo_id = i.id ORDER BY isu.cantidad DESC LIMIT 1) as ubicacion_defecto,
                    (SELECT GROUP_CONCAT(CONCAT(IFNULL(s.nombre, 'General'), ' - ', u.nombre, ' (', REPLACE(FORMAT(isu.cantidad, 2), '.00', ''), ')') SEPARATOR '||') FROM insumo_stock_ubicacion isu JOIN ubicaciones u ON isu.ubicacion_id = u.id LEFT JOIN sectores s ON u.sector_id = s.id WHERE isu.insumo_id = i.id AND isu.cantidad > 0) as ubicaciones_multiples
                FROM insumos i LEFT JOIN categorias_insumo c ON i.categoria_id = c.id ORDER BY i.nombre ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAuxiliares()
    {
        return [
            'categorias' => $this->db->query("SELECT * FROM categorias_insumo ORDER BY nombre")->fetchAll(PDO::FETCH_ASSOC),
            'sectores' => $this->db->query("SELECT * FROM sectores ORDER BY nombre")->fetchAll(PDO::FETCH_ASSOC),
            'ubicaciones' => $this->db->query("SELECT u.id, u.nombre, u.sector_id, s.nombre as sector_nombre FROM ubicaciones u LEFT JOIN sectores s ON u.sector_id = s.id ORDER BY s.nombre, u.nombre")->fetchAll(PDO::FETCH_ASSOC)
        ];
    }

    public function create($data)
    {
        try {
            if (!$this->db->inTransaction())
                $this->db->beginTransaction();

            $sql = "INSERT INTO insumos (codigo_sku, nombre, descripcion, categoria_id, stock_actual, stock_minimo, stock_critico, precio_costo, moneda, unidad_medida, imagen_url) 
                    VALUES (:sku, :nom, :desc, :cat, :stock, :min, :crit, :precio, :moneda, :unidad, :img)";

            $stmt = $this->db->prepare($sql);
            $stockInicial = !empty($data['stock_actual']) ? floatval($data['stock_actual']) : 0;

            $stmt->execute([
                ':sku' => !empty($data['codigo_sku']) ? $data['codigo_sku'] : null,
                ':nom' => $data['nombre'],
                ':desc' => $data['descripcion'] ?? null,
                ':cat' => !empty($data['categoria_id']) ? $data['categoria_id'] : null,
                ':stock' => $stockInicial,
                ':min' => $data['stock_minimo'] ?? 5.00,
                ':crit' => $data['stock_critico'] ?? 2.00,
                ':precio' => $data['precio_costo'] ?? 0.00,
                ':moneda' => $data['moneda'] ?? 'CLP',
                ':unidad' => $data['unidad_medida'] ?? 'UN',
                ':img' => $data['imagen_url'] ?? null
            ]);

            $insumoId = $this->db->lastInsertId();
            $ubicacionId = !empty($data['ubicacion_id']) ? $data['ubicacion_id'] : 1;

            if ($stockInicial > 0) {
                $sqlStock = "INSERT INTO insumo_stock_ubicacion (insumo_id, ubicacion_id, cantidad) 
                            VALUES (:iid, :uid, :cant)
                            ON DUPLICATE KEY UPDATE cantidad = cantidad + :cant";

                $this->db->prepare($sqlStock)->execute([
                    ':iid' => $insumoId,
                    ':uid' => $ubicacionId,
                    ':cant' => $stockInicial
                ]);
            }

            $this->db->commit();
            return $insumoId;

        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    public function update($id, $data)
    {
        try {
            $imageSql = !empty($data['imagen_url']) ? ", imagen_url = :imagen_url" : "";
            $sql = "UPDATE insumos SET codigo_sku=:sku, nombre=:nom, descripcion=:desc, categoria_id=:cat, stock_minimo=:min, precio_costo=:precio, moneda=:mon, unidad_medida=:uni $imageSql WHERE id=:id";
            $stmt = $this->db->prepare($sql);
            $params = [
                ':sku' => $data['codigo_sku'],
                ':nom' => $data['nombre'],
                ':desc' => $data['descripcion'],
                ':cat' => $data['categoria_id'],
                ':min' => $data['stock_minimo'],
                ':precio' => $data['precio_costo'],
                ':mon' => $data['moneda'],
                ':uni' => $data['unidad_medida'],
                ':id' => $id
            ];

            if (!empty($data['imagen_url']))
                $params[':imagen_url'] = $data['imagen_url'];
            return $stmt->execute($params);
        } catch (\PDOException $e) {
            throw $e;
        }
    }

    public function delete($id)
    {
        $this->db->prepare("DELETE FROM movimientos_inventario WHERE insumo_id = :id")->execute([':id' => $id]);
        $this->db->prepare("DELETE FROM insumo_stock_ubicacion WHERE insumo_id = :id")->execute([':id' => $id]);
        $this->db->prepare("DELETE FROM insumos WHERE id = :id")->execute([':id' => $id]);
        return true;
    }

    public function registrarMovimiento($data)
    {
        $sql = "INSERT INTO movimientos_inventario 
            (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, empleado_id, ubicacion_id, fecha) 
            VALUES (:iid, :tid, :cant, :uid, :obs, :emp, :ubi, NOW())";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':iid' => $data['insumo_id'],
            ':tid' => $data['tipo_movimiento_id'],
            ':cant' => $data['cantidad'],
            ':uid' => $data['usuario_id'],
            ':obs' => $data['observacion'] ?? '',
            ':emp' => !empty($data['empleado_id']) ? $data['empleado_id'] : null,
            ':ubi' => !empty($data['ubicacion_id']) ? $data['ubicacion_id'] : null
        ]);
    }

    public function ajustarStock($insumoId, $cantidad, $tipoMovimiento, $usuarioId, $observacion, $empleadoId = null)
    {
        try {
            $this->db->beginTransaction();

            $stmtLoc = $this->db->prepare("SELECT ubicacion_id FROM insumo_stock_ubicacion WHERE insumo_id = ? ORDER BY cantidad DESC LIMIT 1");
            $stmtLoc->execute([$insumoId]);
            $ubicacionId = $stmtLoc->fetchColumn() ?: 1;

            $this->registrarMovimiento([
                'insumo_id' => $insumoId,
                'tipo_movimiento_id' => $tipoMovimiento,
                'cantidad' => $cantidad,
                'usuario_id' => $usuarioId,
                'observacion' => $observacion,
                'ubicacion_id' => $ubicacionId,
                'empleado_id' => $empleadoId
            ]);

            $operador = ($tipoMovimiento == 3) ? '+' : '-';

            if ($operador === '+') {
                $sqlUpd = "INSERT INTO insumo_stock_ubicacion (insumo_id, ubicacion_id, cantidad) 
                        VALUES (?, ?, ?) 
                        ON DUPLICATE KEY UPDATE cantidad = cantidad + ?";

                $this->db->prepare($sqlUpd)->execute([
                    $insumoId,
                    $ubicacionId,
                    $cantidad,
                    $cantidad
                ]);
            } else {
                $sqlUpd = "UPDATE insumo_stock_ubicacion 
                        SET cantidad = GREATEST(0, cantidad - ?) 
                        WHERE insumo_id = ? AND ubicacion_id = ?";

                $this->db->prepare($sqlUpd)->execute([
                    $cantidad,
                    $insumoId,
                    $ubicacionId
                ]);
            }

            $this->db->prepare("UPDATE insumos SET stock_actual = (SELECT SUM(cantidad) FROM insumo_stock_ubicacion WHERE insumo_id = ?) WHERE id = ?")
                ->execute([$insumoId, $insumoId]);

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }
}