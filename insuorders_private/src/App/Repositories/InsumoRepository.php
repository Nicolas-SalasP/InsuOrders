<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;
use PDOException;

class InsumoRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    private function generarSkuCorrelativo()
    {
        $prefix = '99000007199';
        $sql = "SELECT MAX(CAST(codigo_sku AS UNSIGNED)) as max_sku 
                FROM insumos 
                WHERE codigo_sku LIKE :pattern";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':pattern' => $prefix . '%']);
        $maxSku = $stmt->fetchColumn();

        if ($maxSku) {
            // Si existe (ej: 990000071992462), le sumamos 1
            return (string) ($maxSku + 1);
        } else {
            // Si no existe ninguno, empezamos desde el inicio (ej: ...0000)
            return $prefix . '0000';
        }
    }

    public function getAll()
    {
        $sql = "SELECT i.*, c.nombre as categoria_nombre,
                (SELECT GROUP_CONCAT(CONCAT(IFNULL(s.nombre, 'General'), ' - ', u.nombre, ' (', REPLACE(FORMAT(isu.cantidad, 2), '.00', ''), ')') SEPARATOR '||')
                FROM insumo_stock_ubicacion isu JOIN ubicaciones u ON isu.ubicacion_id = u.id LEFT JOIN sectores s ON u.sector_id = s.id
                WHERE isu.insumo_id = i.id AND isu.cantidad > 0) as ubicaciones_multiples
                FROM insumos i LEFT JOIN categorias_insumo c ON i.categoria_id = c.id ORDER BY i.nombre ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAuxiliares()
    {
        $categorias = $this->db->query("SELECT * FROM categorias_insumo ORDER BY nombre")->fetchAll(PDO::FETCH_ASSOC);
        $sectores = $this->db->query("SELECT * FROM sectores ORDER BY nombre")->fetchAll(PDO::FETCH_ASSOC);
        $ubicaciones = $this->db->query("SELECT u.id, u.nombre, u.sector_id, s.nombre as sector_nombre FROM ubicaciones u LEFT JOIN sectores s ON u.sector_id = s.id ORDER BY s.nombre, u.nombre")->fetchAll(PDO::FETCH_ASSOC);
        return ['categorias' => $categorias, 'sectores' => $sectores, 'ubicaciones' => $ubicaciones];
    }

    public function create($data)
    {
        $skuAutomatico = $this->generarSkuCorrelativo();

        $sql = "INSERT INTO insumos (codigo_sku, nombre, descripcion, categoria_id, ubicacion_id, stock_actual, stock_minimo, precio_costo, moneda, unidad_medida, imagen_url) 
                VALUES (:sku, :nom, :desc, :cat, NULL, :stock, :min, :precio, :moneda, :unidad, :img)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':sku' => $skuAutomatico,
            ':nom' => $data['nombre'],
            ':desc' => $data['descripcion'] ?? '',
            ':cat' => $data['categoria_id'],
            ':stock' => $data['stock_actual'],
            ':min' => $data['stock_minimo'],
            ':precio' => $data['precio_costo'],
            ':moneda' => $data['moneda'] ?? 'CLP',
            ':unidad' => $data['unidad_medida'],
            ':img' => $data['imagen_url'] ?? null
        ]);

        return $this->db->lastInsertId();
    }

    // --- UPDATE CORREGIDO Y ROBUSTO ---
    public function update($id, $data)
    {
        try {
            $sql = "UPDATE insumos SET 
                        codigo_sku = :codigo_sku, 
                        nombre = :nombre, 
                        descripcion = :descripcion, 
                        categoria_id = :categoria_id, 
                        ubicacion_id = :ubicacion_id, 
                        stock_actual = :stock_actual,
                        stock_minimo = :stock_minimo, 
                        precio_costo = :precio_costo,
                        moneda = :moneda,
                        unidad_medida = :unidad_medida";

            if (isset($data['imagen_url']) && $data['imagen_url']) {
                $sql .= ", imagen_url = :imagen_url";
            }

            $sql .= " WHERE id = :id";

            $stmt = $this->db->prepare($sql);

            // Bindeo explícito de tipos para evitar errores silenciosos
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->bindValue(':codigo_sku', $data['codigo_sku']);
            $stmt->bindValue(':nombre', $data['nombre']);
            $stmt->bindValue(':descripcion', $data['descripcion']);

            // FKs pueden ser null
            $stmt->bindValue(':categoria_id', $data['categoria_id'] ?: null, $data['categoria_id'] ? PDO::PARAM_INT : PDO::PARAM_NULL);
            $stmt->bindValue(':ubicacion_id', $data['ubicacion_id'] ?: null, $data['ubicacion_id'] ? PDO::PARAM_INT : PDO::PARAM_NULL);

            // Numéricos
            $stmt->bindValue(':stock_actual', $data['stock_actual'], PDO::PARAM_INT);
            $stmt->bindValue(':stock_minimo', $data['stock_minimo'], PDO::PARAM_INT);
            $stmt->bindValue(':precio_costo', $data['precio_costo'], PDO::PARAM_INT);

            $stmt->bindValue(':moneda', $data['moneda']);
            $stmt->bindValue(':unidad_medida', $data['unidad_medida']);

            if (isset($data['imagen_url']) && $data['imagen_url']) {
                $stmt->bindValue(':imagen_url', $data['imagen_url']);
            }

            return $stmt->execute();

        } catch (PDOException $e) {
            error_log("Error Update SQL: " . $e->getMessage());
            throw new \Exception("Error al actualizar en BD: " . $e->getMessage());
        }
    }
    public function delete($id)
    {
        try {
            $this->db->beginTransaction();
            $this->db->prepare("DELETE FROM insumo_stock_ubicacion WHERE insumo_id = :id")->execute([':id' => $id]);
            $this->db->prepare("DELETE FROM insumos WHERE id = :id")->execute([':id' => $id]);
            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            $this->db->rollBack();
            if ($e->getCode() == '23000' || $e->errorInfo[1] == 1451)
                return false;
            throw $e;
        }
    }

    public function updateStock($id, $cantidad, $operacion)
    {
        $sql = "UPDATE insumos SET stock_actual = stock_actual $operacion :cant WHERE id = :id";
        $this->db->prepare($sql)->execute([':cant' => $cantidad, ':id' => $id]);
    }

    public function registrarMovimiento($data)
    {
        $sql = "INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, empleado_id) VALUES (:iid, :tid, :cant, :uid, :obs, :emp)";
        $this->db->prepare($sql)->execute([':iid' => $data['insumo_id'], ':tid' => $data['tipo_movimiento_id'], ':cant' => $data['cantidad'], ':uid' => $data['usuario_id'], ':obs' => $data['observacion'], ':emp' => $data['empleado_id'] ?? null]);
    }

    public function ajustarStock($insumoId, $cantidad, $tipoMovimiento, $usuarioId, $observacion, $empleadoId = null)
    {
        try {
            $this->db->beginTransaction();
            $this->registrarMovimiento(['insumo_id' => $insumoId, 'tipo_movimiento_id' => $tipoMovimiento, 'cantidad' => $cantidad, 'usuario_id' => $usuarioId, 'observacion' => $observacion, 'empleado_id' => $empleadoId]);
            $operador = in_array($tipoMovimiento, [1, 3, 5]) ? '+' : '-';
            $this->updateStock($insumoId, $cantidad, $operador);
            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}