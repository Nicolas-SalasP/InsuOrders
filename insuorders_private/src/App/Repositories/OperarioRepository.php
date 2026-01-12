<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;
use Exception;

class OperarioRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function asignarInsumo($datos)
    {
        try {
            $this->db->beginTransaction();

            $bodegaId = 1;

            $stmtCheck = $this->db->prepare("SELECT cantidad FROM insumo_stock_ubicacion WHERE insumo_id = :iid AND ubicacion_id = :uid");
            $stmtCheck->execute([':iid' => $datos['insumo_id'], ':uid' => $bodegaId]);
            $stockActual = $stmtCheck->fetchColumn();

            if ($stockActual === false || $stockActual < $datos['cantidad']) {
                throw new Exception("Stock insuficiente en Bodega para realizar esta entrega.");
            }

            $stmtEmp = $this->db->prepare("SELECT id, nombre_completo, usuario_id FROM empleados WHERE id = :eid");
            $stmtEmp->execute([':eid' => $datos['empleado_id']]);
            $empleado = $stmtEmp->fetch(PDO::FETCH_ASSOC);

            if (!$empleado) {
                throw new Exception("El empleado seleccionado no existe.");
            }

            $usuarioOperarioId = null;
            $receptorExterno = null;
            $estadoId = 3;
            $nombreReceptor = "";

            if (!empty($empleado['usuario_id'])) {
                $usuarioOperarioId = $empleado['usuario_id'];
                $estadoId = 1;
                $nombreReceptor = $empleado['nombre_completo'] . " (App)";
            } else {
                $receptorExterno = $empleado['nombre_completo'];
                $estadoId = 3;
                $nombreReceptor = $empleado['nombre_completo'] . " (Directo)";
            }

            $this->db->prepare("UPDATE insumo_stock_ubicacion SET cantidad = cantidad - :cant WHERE insumo_id = :iid AND ubicacion_id = :uid")
                ->execute([
                    ':cant' => $datos['cantidad'],
                    ':iid' => $datos['insumo_id'],
                    ':uid' => $bodegaId
                ]);

            $obsKardex = "Entrega a: " . $nombreReceptor . ". Obs: " . ($datos['observacion'] ?? 'Sin obs');

            $sqlMov = "INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, ubicacion_id, fecha) 
                       VALUES (:iid, 2, :cant, :uid, :obs, :ubi, NOW())";

            $this->db->prepare($sqlMov)->execute([
                ':iid' => $datos['insumo_id'],
                ':cant' => $datos['cantidad'],
                ':uid' => $datos['bodeguero_id'],
                ':obs' => $obsKardex,
                ':ubi' => $bodegaId
            ]);

            $cantidadUtilizada = ($estadoId === 3) ? $datos['cantidad'] : 0;

            $sqlEntrega = "INSERT INTO entregas_personal 
                (insumo_id, usuario_operario_id, receptor_externo, usuario_bodeguero_id, cantidad_entregada, cantidad_utilizada, estado_id, observacion, fecha_entrega) 
                VALUES (:iid, :u_op, :ext, :u_bod, :cant, :used, :est, :obs, NOW())";

            $this->db->prepare($sqlEntrega)->execute([
                ':iid' => $datos['insumo_id'],
                ':u_op' => $usuarioOperarioId,
                ':ext' => $receptorExterno,
                ':u_bod' => $datos['bodeguero_id'],
                ':cant' => $datos['cantidad'],
                ':used' => $cantidadUtilizada,
                ':est' => $estadoId,
                ':obs' => $datos['observacion'] ?? null
            ]);

            $this->db->commit();
            return true;

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function vincularEntregaOT($datos)
    {
        try {
            $stmtEmp = $this->db->prepare("SELECT id, nombre_completo, usuario_id FROM empleados WHERE id = :eid");
            $stmtEmp->execute([':eid' => $datos['empleado_id']]);
            $empleado = $stmtEmp->fetch(PDO::FETCH_ASSOC);

            if (!$empleado) return false;

            $usuarioOperarioId = $empleado['usuario_id'] ?? null;
            $receptorExterno = empty($usuarioOperarioId) ? $empleado['nombre_completo'] : null;
            $estadoId = empty($usuarioOperarioId) ? 3 : 1;
            $cantidadUtilizada = ($estadoId === 3) ? $datos['cantidad'] : 0;

            $sqlEntrega = "INSERT INTO entregas_personal 
                (insumo_id, usuario_operario_id, receptor_externo, usuario_bodeguero_id, cantidad_entregada, cantidad_utilizada, estado_id, observacion, fecha_entrega, referencia_ot_id) 
                VALUES (:iid, :u_op, :ext, :u_bod, :cant, :used, :est, :obs, NOW(), :otid)";

            $this->db->prepare($sqlEntrega)->execute([
                ':iid' => $datos['insumo_id'],
                ':u_op' => $usuarioOperarioId,
                ':ext' => $receptorExterno,
                ':u_bod' => $datos['bodeguero_id'],
                ':cant' => $datos['cantidad'],
                ':used' => $cantidadUtilizada,
                ':est' => $estadoId,
                ':obs' => $datos['observacion'] ?? null,
                ':otid' => $datos['ot_id'] ?? null
            ]);

            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    public function getMisInsumosCorrecto($usuarioId)
    {
        $sqlPendientes = "SELECT e.id, e.cantidad_entregada, e.fecha_entrega, e.observacion,
                                i.nombre as insumo, i.codigo_sku, i.unidad_medida, 
                                u.nombre as bodeguero_nombre, e.referencia_ot_id as ot_id
                            FROM entregas_personal e
                            JOIN insumos i ON e.insumo_id = i.id
                            JOIN usuarios u ON e.usuario_bodeguero_id = u.id
                            WHERE e.usuario_operario_id = :uid AND e.estado_id = 1
                            ORDER BY e.fecha_entrega DESC";

        $stmt1 = $this->db->prepare($sqlPendientes);
        $stmt1->execute([':uid' => $usuarioId]);
        $sqlInventario = "SELECT e.id, e.cantidad_entregada, e.cantidad_utilizada, 
                                (e.cantidad_entregada - e.cantidad_utilizada) as saldo_actual,
                                i.nombre as insumo, i.codigo_sku, i.unidad_medida,
                                e.referencia_ot_id as ot_id,
                                COALESCE(a.nombre, 'General') as maquina,
                                COALESCE(a.codigo_interno, '-') as codigo_maquina
                        FROM entregas_personal e
                        JOIN insumos i ON e.insumo_id = i.id
                        LEFT JOIN solicitudes_ot s ON e.referencia_ot_id = s.id
                        LEFT JOIN activos a ON s.activo_id = a.id
                        WHERE e.usuario_operario_id = :uid AND e.estado_id = 2
                        AND (e.cantidad_entregada - e.cantidad_utilizada) > 0.001
                        ORDER BY e.referencia_ot_id DESC, i.nombre ASC";

        $stmt2 = $this->db->prepare($sqlInventario);
        $stmt2->execute([':uid' => $usuarioId]);

        return [
            'pendientes' => $stmt1->fetchAll(PDO::FETCH_ASSOC),
            'inventario' => $stmt2->fetchAll(PDO::FETCH_ASSOC)
        ];
    }

    public function devolverInsumo($entregaId, $cantidad)
    {
        try {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("SELECT * FROM entregas_personal WHERE id = :id FOR UPDATE");
            $stmt->execute([':id' => $entregaId]);
            $entrega = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$entrega) throw new Exception("Entrega no encontrada");

            $saldo = floatval($entrega['cantidad_entregada']) - floatval($entrega['cantidad_utilizada']);
            if ($cantidad > $saldo) throw new Exception("No puedes devolver más de lo que tienes.");
            $nuevaEntregada = floatval($entrega['cantidad_entregada']) - $cantidad;
            $nuevoEstado = ($nuevaEntregada - floatval($entrega['cantidad_utilizada']) <= 0.001) ? 3 : 2;

            $this->db->prepare("UPDATE entregas_personal SET cantidad_entregada = :newCant, estado_id = :est WHERE id = :id")
                ->execute([':newCant' => $nuevaEntregada, ':est' => $nuevoEstado, ':id' => $entregaId]);
            $bodegaId = 1;
            $this->db->prepare("INSERT INTO insumo_stock_ubicacion (insumo_id, ubicacion_id, cantidad) VALUES (:iid, :uid, :cant) ON DUPLICATE KEY UPDATE cantidad = cantidad + :cant")
                ->execute([':iid' => $entrega['insumo_id'], ':uid' => $bodegaId, ':cant' => $cantidad]);
            $obs = "Devolución de operario (Entrega #$entregaId). OT: " . ($entrega['referencia_ot_id'] ?? 'N/A');
            
            $this->db->prepare("INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, ubicacion_id, fecha) 
                                VALUES (:iid, 5, :cant, :uid, :obs, :ubi, NOW())")
                ->execute([
                    ':iid' => $entrega['insumo_id'],
                    ':cant' => $cantidad,
                    ':uid' => $entrega['usuario_operario_id'],
                    ':obs' => $obs,
                    ':ubi' => $bodegaId
                ]);
            $this->db->prepare("UPDATE insumos SET stock_actual = stock_actual + :cant WHERE id = :id")
                ->execute([':cant' => $cantidad, ':id' => $entrega['insumo_id']]);

            $this->db->commit();
            return true;

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function gestionarRecepcion($entregaId, $accion, $observacion = null)
    {
        $nuevoEstado = ($accion === 'ACEPTAR') ? 2 : 4;

        $sql = "UPDATE entregas_personal 
                SET estado_id = :est, fecha_aceptacion = NOW(), observacion_rechazo = :obs 
                WHERE id = :id";

        return $this->db->prepare($sql)->execute([
            ':est' => $nuevoEstado,
            ':obs' => $observacion,
            ':id' => $entregaId
        ]);
    }

    public function reportarUso($entregaId, $cantidadUsada)
    {
        $stmt = $this->db->prepare("SELECT cantidad_entregada, cantidad_utilizada FROM entregas_personal WHERE id = :id");
        $stmt->execute([':id' => $entregaId]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$item)
            throw new Exception("Registro no encontrado");

        $nuevoTotal = $item['cantidad_utilizada'] + $cantidadUsada;

        if ($nuevoTotal > $item['cantidad_entregada']) {
            throw new Exception("No puedes reportar más uso del stock que tienes asignado.");
        }

        $estadoFinal = ($nuevoTotal >= $item['cantidad_entregada']) ? 3 : 2;

        $sql = "UPDATE entregas_personal 
                SET cantidad_utilizada = :uso, estado_id = :est, fecha_uso = NOW() 
                WHERE id = :id";

        return $this->db->prepare($sql)->execute([
            ':uso' => $nuevoTotal,
            ':est' => $estadoFinal,
            ':id' => $entregaId
        ]);
    }

    public function getDashboardSupervision()
    {
        $sql = "SELECT e.id, e.nombre_completo as nombre, e.email,
                    (SELECT COUNT(*) FROM entregas_personal ep WHERE ep.usuario_operario_id = e.usuario_id AND ep.estado_id = 1) as pendientes,
                    (SELECT COUNT(*) FROM entregas_personal ep WHERE ep.usuario_operario_id = e.usuario_id AND ep.estado_id = 2) as en_posesion
                FROM empleados e
                WHERE e.usuario_id IS NOT NULL AND e.activo = 1";

        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    
}