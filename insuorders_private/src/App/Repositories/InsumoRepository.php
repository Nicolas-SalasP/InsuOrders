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
        // CAMBIO: Agregamos el LEFT JOIN para obtener el nombre de la ubicación principal (i.ubicacion_id)
        $sql = "SELECT 
                    i.*, 
                    c.nombre as categoria_nombre,
                    
                    -- Obtenemos el nombre de la ubicación principal guardada en la tabla insumos
                    CONCAT(IFNULL(s_main.nombre, 'General'), ' - ', u_main.nombre) as ubicacion_defecto,

                    -- Subconsulta para ubicaciones con stock (Logística avanzada)
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
                
                -- JOINS para la ubicación principal
                LEFT JOIN ubicaciones u_main ON i.ubicacion_id = u_main.id
                LEFT JOIN sectores s_main ON u_main.sector_id = s_main.id
                
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
                    stock_actual, stock_minimo, precio_costo, moneda, unidad_medida, imagen_url
                ) VALUES (
                    :sku, :nom, :desc, :cat, :ubi, 
                    :stock, :min, :precio, :moneda, :unidad, :img
                )";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':sku' => $data['codigo_sku'],
            ':nom' => $data['nombre'],
            ':desc' => $data['descripcion'] ?? '',
            ':cat' => $data['categoria_id'],
            ':ubi' => $data['ubicacion_id'],
            ':stock' => $data['stock_actual'],
            ':min' => $data['stock_minimo'],
            ':precio' => $data['precio_costo'],
            ':moneda' => $data['moneda'],
            ':unidad' => $data['unidad_medida'],
            ':img' => $data['imagen_url'] ?? null 
        ]);
        return $this->db->lastInsertId();
    }

    public function update($id, $data)
    {
        try {
            // Construcción dinámica de SQL para imagen (mantiene tu corrección anterior)
            $imageSql = "";
            if (!empty($data['imagen_url'])) {
                $imageSql = ", imagen_url = :imagen_url";
            }

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
                        unidad_medida = :unidad_medida
                        $imageSql
                    WHERE id = :id";

            $stmt = $this->db->prepare($sql);

            $stmt->bindValue(':codigo_sku', $data['codigo_sku']);
            $stmt->bindValue(':nombre', $data['nombre']);
            $stmt->bindValue(':descripcion', $data['descripcion']);
            $stmt->bindValue(':categoria_id', $data['categoria_id']);
            $stmt->bindValue(':ubicacion_id', $data['ubicacion_id']);
            $stmt->bindValue(':stock_actual', $data['stock_actual']);
            $stmt->bindValue(':stock_minimo', $data['stock_minimo']);
            $stmt->bindValue(':precio_costo', $data['precio_costo']);
            $stmt->bindValue(':moneda', $data['moneda']);
            $stmt->bindValue(':unidad_medida', $data['unidad_medida']);
            
            if (!empty($data['imagen_url'])) {
                $stmt->bindValue(':imagen_url', $data['imagen_url']);
            }
            
            $stmt->bindValue(':id', $id);

            return $stmt->execute();

        } catch (\PDOException $e) {
            error_log("Error update repositorio: " . $e->getMessage());
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