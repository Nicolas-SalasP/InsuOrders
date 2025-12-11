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
        // CORREGIDO: Usamos 'categorias_insumo' en lugar de 'categorias'
        // También usamos GROUP_CONCAT para traer todas las ubicaciones físicas en un solo campo
        $sql = "SELECT 
                    i.*, 
                    c.nombre as categoria_nombre,
                    
                    -- Subconsulta para concatenar múltiples ubicaciones (Formato: Ubicación (Cantidad)||Ubicación (Cantidad))
                    (
                        SELECT GROUP_CONCAT(
                            CONCAT(
                                COALESCE(s.nombre, 'General'), ' - ', u.nombre, 
                                ' (', TRIM(TRAILING '.00' FROM CAST(isu.cantidad AS CHAR)), ')'
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
        
        try {
            return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            // Si hay error (ej. falta tabla insumo_stock_ubicacion), devolvemos array vacío
            // Tip: Revisa si ejecutaste el SQL para crear la tabla 'insumo_stock_ubicacion'
            return [];
        }
    }

    public function getAuxiliares()
    {
        try {
            // CORREGIDO: 'categorias_insumo'
            $categorias = $this->db->query("SELECT * FROM categorias_insumo ORDER BY nombre")->fetchAll(PDO::FETCH_ASSOC);
            $sectores = $this->db->query("SELECT * FROM sectores ORDER BY nombre")->fetchAll(PDO::FETCH_ASSOC);
            
            // Traemos ubicaciones con su sector para el filtro en cascada
            $ubicaciones = $this->db->query("SELECT u.id, u.nombre, u.sector_id, s.nombre as sector_nombre 
                                             FROM ubicaciones u 
                                             LEFT JOIN sectores s ON u.sector_id = s.id 
                                             ORDER BY s.nombre, u.nombre")->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'categorias' => $categorias, 
                'sectores' => $sectores,
                'ubicaciones' => $ubicaciones
            ];
        } catch (\Exception $e) {
            return ['categorias' => [], 'sectores' => [], 'ubicaciones' => []];
        }
    }

    public function create($data)
    {
        // Al crear, ubicacion_id va como NULL porque ahora se gestiona en la tabla hija (Bodega organiza después)
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
        // Borramos primero movimientos para mantener integridad (si no hay CASCADE configurado)
        $this->db->prepare("DELETE FROM movimientos_inventario WHERE insumo_id = :id")->execute([':id' => $id]);
        $this->db->prepare("DELETE FROM insumo_stock_ubicacion WHERE insumo_id = :id")->execute([':id' => $id]);
        $this->db->prepare("DELETE FROM insumos WHERE id = :id")->execute([':id' => $id]);
    }

    public function updateStock($id, $cantidad, $operacion) 
    {
        $sql = "UPDATE insumos SET stock_actual = stock_actual $operacion :cant WHERE id = :id";
        $this->db->prepare($sql)->execute([':cant' => $cantidad, ':id' => $id]);
    }

    public function registrarMovimiento($data)
    {
        $sql = "INSERT INTO movimientos_inventario (
                    insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion
                ) VALUES (
                    :iid, :tid, :cant, :uid, :obs
                )";
        
        $this->db->prepare($sql)->execute([
            ':iid' => $data['insumo_id'],
            ':tid' => $data['tipo_movimiento_id'], 
            ':cant' => $data['cantidad'],
            ':uid' => $data['usuario_id'],
            ':obs' => $data['observacion']
        ]);
    }
}