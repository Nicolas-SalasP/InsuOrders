<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;

class MantencionRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // --- ACTIVOS (MÁQUINAS) ---
    public function getActivos()
    {
        return $this->db->query("SELECT * FROM activos ORDER BY nombre ASC")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getKitActivo($activoId)
    {
        $sql = "SELECT 
                    ai.insumo_id as id, i.nombre, i.codigo_sku, 
                    ai.cantidad_default as cantidad, i.stock_actual, i.unidad_medida,
                    i.precio_costo as precio 
                FROM activos_insumos ai
                JOIN insumos i ON ai.insumo_id = i.id
                WHERE ai.activo_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $activoId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addInsumoToKit($activoId, $insumoId, $cant)
    {
        $check = $this->db->prepare("SELECT id FROM activos_insumos WHERE activo_id=:a AND insumo_id=:i");
        $check->execute([':a' => $activoId, ':i' => $insumoId]);

        if ($check->fetch()) {
            $sql = "UPDATE activos_insumos SET cantidad_default = :c WHERE activo_id=:a AND insumo_id=:i";
        } else {
            $sql = "INSERT INTO activos_insumos (activo_id, insumo_id, cantidad_default) VALUES (:a, :i, :c)";
        }
        $this->db->prepare($sql)->execute([':a' => $activoId, ':i' => $insumoId, ':c' => $cant]);
    }

    public function removeInsumoFromKit($activoId, $insumoId)
    {
        $sql = "DELETE FROM activos_insumos WHERE activo_id=:a AND insumo_id=:i";
        $this->db->prepare($sql)->execute([':a' => $activoId, ':i' => $insumoId]);
    }

    public function createActivo($data)
    {
        $sql = "INSERT INTO activos (codigo_interno, nombre, tipo, ubicacion, descripcion) 
                VALUES (:cod, :nom, :tipo, :ubi, :desc)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':cod' => $data['codigo_interno'],
            ':nom' => $data['nombre'],
            ':tipo' => $data['tipo'],
            ':ubi' => $data['ubicacion'],
            ':desc' => $data['descripcion']
        ]);
        return $this->db->lastInsertId();
    }

    public function addDoc($activoId, $nombre, $url)
    {
        $sql = "INSERT INTO activos_docs (activo_id, nombre_archivo, url_archivo) VALUES (:id, :nom, :url)";
        $this->db->prepare($sql)->execute([':id' => $activoId, ':nom' => $nombre, ':url' => $url]);
    }

    public function getDocs($activoId)
    {
        $sql = "SELECT * FROM activos_docs WHERE activo_id = :id ORDER BY fecha_subida DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $activoId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // --- SOLICITUDES (OT) ---
    public function getSolicitudes()
    {
        $sql = "SELECT 
                    s.*, 
                    a.nombre as activo, a.codigo_interno as activo_codigo,
                    u.nombre as solicitante_nombre, u.apellido as solicitante_apellido,
                    e.nombre as estado, e.id as estado_id
                FROM solicitudes_ot s
                LEFT JOIN activos a ON s.activo_id = a.id
                JOIN usuarios u ON s.usuario_solicitante_id = u.id
                JOIN estados_solicitud e ON s.estado_id = e.id
                ORDER BY s.id DESC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getDetallesOT($id)
    {
        $sql = "SELECT d.insumo_id as id, d.cantidad, d.estado_linea,
                    i.nombre, i.codigo_sku, i.stock_actual, i.unidad_medida, i.precio_costo as precio
                FROM detalle_solicitud d
                JOIN insumos i ON d.insumo_id = i.id
                WHERE d.solicitud_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createSolicitud($cabecera)
    {
        $sql = "INSERT INTO solicitudes_ot (usuario_solicitante_id, activo_id, estado_id, descripcion_trabajo) 
                VALUES (:user, :activo, 1, :desc)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':user' => $cabecera['usuario_id'],
            ':activo' => $cabecera['activo_id'],
            ':desc' => $cabecera['observacion']
        ]);
        return $this->db->lastInsertId();
    }

    public function updateSolicitud($id, $activoId, $observacion)
    {
        $sql = "UPDATE solicitudes_ot SET activo_id = :activo, descripcion_trabajo = :desc WHERE id = :id";
        $this->db->prepare($sql)->execute([
            ':activo' => $activoId,
            ':desc' => $observacion,
            ':id' => $id
        ]);
    }

    public function updateEstado($id, $estadoId)
    {
        $sql = "UPDATE solicitudes_ot SET estado_id = :estado WHERE id = :id";
        $this->db->prepare($sql)->execute([':estado' => $estadoId, ':id' => $id]);
    }

    public function clearDetalles($solicitudId)
    {
        $sql = "DELETE FROM detalle_solicitud WHERE solicitud_id = :id";
        $this->db->prepare($sql)->execute([':id' => $solicitudId]);
    }

    public function addDetalle($item)
    {
        $sql = "INSERT INTO detalle_solicitud (solicitud_id, insumo_id, cantidad, estado_linea) 
                VALUES (:sid, :iid, :cant, :estado)";
        $this->db->prepare($sql)->execute([
            ':sid' => $item['solicitud_id'],
            ':iid' => $item['insumo_id'],
            ':cant' => $item['cantidad'],
            ':estado' => $item['estado_linea']
        ]);
    }

    // PARA BODEGA: Buscar líneas reservadas
    public function getPendientesEntrega()
    {
        $sql = "SELECT 
                    ds.id as detalle_id, ds.cantidad, ds.estado_linea,
                    i.id as insumo_id, i.nombre as insumo, i.codigo_sku, i.unidad_medida,
                    s.id as ot_id, s.fecha_solicitud,
                    COALESCE(u.nombre, 'Usuario Eliminado') as solicitante, 
                    COALESCE(u.apellido, '') as solicitante_apellido,
                    COALESCE(a.nombre, 'General / Sin Máquina') as maquina
                FROM detalle_solicitud ds
                JOIN solicitudes_ot s ON ds.solicitud_id = s.id
                JOIN insumos i ON ds.insumo_id = i.id
                LEFT JOIN usuarios u ON s.usuario_solicitante_id = u.id
                LEFT JOIN activos a ON s.activo_id = a.id
                WHERE ds.estado_linea = 'EN_BODEGA' 
                AND s.estado_id IN (1, 2)
                ORDER BY s.fecha_solicitud ASC";

        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    // PARA BODEGA: Confirmar entrega física
    public function entregarMaterial($detalleId, $usuarioId)
    {
        try {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("SELECT insumo_id, cantidad FROM detalle_solicitud WHERE id = :id");
            $stmt->execute([':id' => $detalleId]);
            $linea = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$linea)
                throw new \Exception("Línea no encontrada");


            $sqlMov = "INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, referencia_id) 
                    VALUES (:iid, 2, :cant, :uid, 'Entrega por OT', :ref)";
            $this->db->prepare($sqlMov)->execute([
                ':iid' => $linea['insumo_id'],
                ':cant' => $linea['cantidad'],
                ':uid' => $usuarioId,
                ':ref' => $detalleId
            ]);

            $this->db->prepare("UPDATE insumos SET stock_actual = stock_actual - :cant WHERE id = :id")
                ->execute([':cant' => $linea['cantidad'], ':id' => $linea['insumo_id']]);

            $this->db->prepare("UPDATE detalle_solicitud SET estado_linea = 'ENTREGADO' WHERE id = :id")
                ->execute([':id' => $detalleId]);

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}