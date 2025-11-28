<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;

class OrdenCompraRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll()
    {
        $sql = "SELECT 
                    oc.id, oc.fecha_creacion, oc.monto_total, oc.url_archivo,
                    p.nombre as proveedor, p.rut as proveedor_rut,
                    e.nombre as estado, e.id as estado_id,
                    u.nombre as creador
                FROM ordenes_compra oc
                JOIN proveedores p ON oc.proveedor_id = p.id
                JOIN estados_orden_compra e ON oc.estado_id = e.id
                JOIN usuarios u ON oc.usuario_creador_id = u.id
                ORDER BY oc.id DESC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getDetalle($ordenId)
    {
        $sql = "SELECT 
                    doc.*, i.nombre as insumo, i.codigo_sku
                FROM detalle_orden_compra doc
                JOIN insumos i ON doc.insumo_id = i.id
                WHERE doc.orden_compra_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $ordenId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($cabecera) {
        $sql = "INSERT INTO ordenes_compra 
                (proveedor_id, usuario_creador_id, estado_id, monto_neto, impuesto, monto_total, moneda, tipo_cambio, numero_cotizacion) 
                VALUES (:prov, :user, :estado, :neto, :impuesto, :total, :moneda, :tc, :cotiz)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':prov' => $cabecera['proveedor_id'],
            ':user' => $cabecera['usuario_id'],
            ':estado' => 2,
            ':neto' => $cabecera['neto'],
            ':impuesto' => $cabecera['impuesto'],
            ':total' => $cabecera['total'],
            ':moneda' => $cabecera['moneda'],
            ':tc' => $cabecera['tipo_cambio'],
            ':cotiz' => $cabecera['numero_cotizacion'] ?? null
        ]);
        return $this->db->lastInsertId();
    }

    public function addDetalle($item)
    {
        $sql = "INSERT INTO detalle_orden_compra (orden_compra_id, insumo_id, cantidad_solicitada, precio_unitario, total_linea) 
                VALUES (:oc_id, :insumo, :cant, :precio, :total)";

        $this->db->prepare($sql)->execute([
            ':oc_id' => $item['orden_id'],
            ':insumo' => $item['insumo_id'],
            ':cant' => $item['cantidad'],
            ':precio' => $item['precio'],
            ':total' => $item['cantidad'] * $item['precio']
        ]);
    }

    public function getOrdenCompleta($id)
    {
        $sqlHead = "SELECT 
                        oc.*, 
                        p.nombre as proveedor, p.rut as proveedor_rut, 
                        p.direccion as proveedor_direccion, p.telefono as proveedor_telefono,
                        p.contacto_vendedor, p.email as proveedor_email,
                        u.nombre as creador_nombre, u.apellido as creador_apellido,
                        e.nombre as estado_nombre 
                    FROM ordenes_compra oc
                    JOIN proveedores p ON oc.proveedor_id = p.id
                    JOIN usuarios u ON oc.usuario_creador_id = u.id
                    JOIN estados_orden_compra e ON oc.estado_id = e.id
                    WHERE oc.id = :id";

        $stmt = $this->db->prepare($sqlHead);
        $stmt->execute([':id' => $id]);
        $cabecera = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cabecera)
            return null;
        $sqlDet = "SELECT doc.*, i.nombre as insumo, i.codigo_sku, i.unidad_medida 
                FROM detalle_orden_compra doc
                JOIN insumos i ON doc.insumo_id = i.id
                WHERE doc.orden_compra_id = :id";
        $stmtDet = $this->db->prepare($sqlDet);
        $stmtDet->execute([':id' => $id]);
        $detalles = $stmtDet->fetchAll(PDO::FETCH_ASSOC);

        return ['cabecera' => $cabecera, 'detalles' => $detalles];
    }

    public function updateArchivo($id, $url)
    {
        $sql = "UPDATE ordenes_compra SET url_archivo = :url WHERE id = :id";
        $this->db->prepare($sql)->execute([':url' => $url, ':id' => $id]);
    }
}