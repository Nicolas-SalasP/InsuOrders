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

            $insumoId = $datos['insumo_id'];
            $cantidadRequerida = floatval($datos['cantidad']);
            $bodegueroId = $datos['bodeguero_id'];
            $empleadoId = $datos['empleado_id'];
            $sqlStock = "SELECT id, ubicacion_id, cantidad FROM insumo_stock_ubicacion 
                        WHERE insumo_id = :iid AND cantidad > 0 
                        ORDER BY cantidad DESC";
            $stmtStock = $this->db->prepare($sqlStock);
            $stmtStock->execute([':iid' => $insumoId]);
            $ubicaciones = $stmtStock->fetchAll(PDO::FETCH_ASSOC);

            $stockTotal = 0;
            foreach ($ubicaciones as $u) {
                $stockTotal += floatval($u['cantidad']);
            }

            if ($stockTotal < $cantidadRequerida) {
                throw new Exception("Stock insuficiente. Tienes $stockTotal pero necesitas $cantidadRequerida.");
            }

            $porDescontar = $cantidadRequerida;
            $ubicacionRef = 1;

            foreach ($ubicaciones as $ubicacion) {
                if ($porDescontar <= 0)
                    break;

                $disponible = floatval($ubicacion['cantidad']);
                $aDescontar = min($disponible, $porDescontar);

                $sqlUpdate = "UPDATE insumo_stock_ubicacion SET cantidad = cantidad - :cant WHERE id = :id";
                $this->db->prepare($sqlUpdate)->execute([
                    ':cant' => $aDescontar,
                    ':id' => $ubicacion['id']
                ]);

                $porDescontar -= $aDescontar;
                $ubicacionRef = $ubicacion['ubicacion_id'];
            }

            $stmtEmp = $this->db->prepare("SELECT id, nombre_completo, usuario_id FROM empleados WHERE id = :eid");
            $stmtEmp->execute([':eid' => $empleadoId]);
            $empleado = $stmtEmp->fetch(PDO::FETCH_ASSOC);

            if (!$empleado) {
                throw new Exception("El empleado seleccionado no existe.");
            }

            $usuarioOperarioId = $empleado['usuario_id'];
            $receptorExterno = null;
            $fechaAceptacion = null;

            if (!empty($usuarioOperarioId)) {
                $estadoId = 1; // Pendiente de aceptar en App
                $nombreReceptor = $empleado['nombre_completo'] . " (App)";
            } else {
                $estadoId = 2; // Entregado directo (sin App)
                $usuarioOperarioId = null;
                $receptorExterno = $empleado['nombre_completo'];
                $nombreReceptor = $empleado['nombre_completo'] . " (Físico)";
                $fechaAceptacion = date('Y-m-d H:i:s');
            }

            $obsKardex = "Entrega a: $nombreReceptor. Obs: " . ($datos['observacion'] ?? 'Sin obs');

            $sqlMov = "INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, ubicacion_id, empleado_id, fecha) 
                    VALUES (:iid, 2, :cant, :uid, :obs, :ubi, :emp, NOW())";

            $this->db->prepare($sqlMov)->execute([
                ':iid' => $insumoId,
                ':cant' => $cantidadRequerida,
                ':uid' => $bodegueroId,
                ':obs' => substr($obsKardex, 0, 255),
                ':ubi' => $ubicacionRef,
                ':emp' => $empleadoId
            ]);

            $sqlEntrega = "INSERT INTO entregas_personal 
                (insumo_id, usuario_operario_id, receptor_externo, usuario_bodeguero_id, cantidad_entregada, cantidad_utilizada, estado_id, observacion, fecha_entrega, fecha_aceptacion) 
                VALUES (:iid, :u_op, :ext, :u_bod, :cant, 0, :est, :obs, NOW(), :fecha_ac)";

            $this->db->prepare($sqlEntrega)->execute([
                ':iid' => $insumoId,
                ':u_op' => $usuarioOperarioId,
                ':ext' => $receptorExterno,
                ':u_bod' => $bodegueroId,
                ':cant' => $cantidadRequerida,
                ':est' => $estadoId,
                ':obs' => $datos['observacion'] ?? null,
                ':fecha_ac' => $fechaAceptacion
            ]);

            $this->db->commit();
            return true;

        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    public function vincularEntregaOT($datos)
    {
        try {
            $stmtEmp = $this->db->prepare("SELECT id, nombre_completo, usuario_id FROM empleados WHERE id = :eid");
            $stmtEmp->execute([':eid' => $datos['empleado_id']]);
            $empleado = $stmtEmp->fetch(PDO::FETCH_ASSOC);

            if (!$empleado)
                return false;

            $usuarioOperarioId = $empleado['usuario_id'];
            $receptorExterno = null;
            $fechaAceptacion = null;

            if (!empty($usuarioOperarioId)) {
                $estadoId = 1;
            } else {
                $estadoId = 2;
                $receptorExterno = $empleado['nombre_completo'];
                $fechaAceptacion = date('Y-m-d H:i:s');
            }

            $sqlEntrega = "INSERT INTO entregas_personal 
                (insumo_id, usuario_operario_id, receptor_externo, usuario_bodeguero_id, cantidad_entregada, cantidad_utilizada, estado_id, observacion, fecha_entrega, fecha_aceptacion, referencia_ot_id) 
                VALUES (:iid, :u_op, :ext, :u_bod, :cant, 0, :est, :obs, NOW(), :fecha_ac, :otid)";

            $this->db->prepare($sqlEntrega)->execute([
                ':iid' => $datos['insumo_id'],
                ':u_op' => $usuarioOperarioId,
                ':ext' => $receptorExterno,
                ':u_bod' => $datos['bodeguero_id'],
                ':cant' => $datos['cantidad'],
                ':est' => $estadoId,
                ':obs' => $datos['observacion'] ?? null,
                ':fecha_ac' => $fechaAceptacion,
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
                                e.referencia_ot_id as ot_id, e.insumo_id
                            FROM entregas_personal e
                            JOIN insumos i ON e.insumo_id = i.id
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

    public function gestionarRecepcion($entregaId, $accion, $observacion = null)
    {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("SELECT * FROM entregas_personal WHERE id = :id FOR UPDATE");
            $stmt->execute([':id' => $entregaId]);
            $entrega = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$entrega)
                throw new Exception("Entrega no encontrada.");

            if ($accion === 'RECHAZAR') {
                $nuevoEstado = 4;
                $cantidad = floatval($entrega['cantidad_entregada']);
                $bodegaId = 1;

                $sqlUpd = "UPDATE entregas_personal 
                        SET estado_id = :est, fecha_aceptacion = NOW(), observacion_rechazo = :obs,
                            cantidad_utilizada = 0 
                        WHERE id = :id";
                $this->db->prepare($sqlUpd)->execute([
                    ':est' => $nuevoEstado,
                    ':obs' => $observacion ?? 'Rechazado por operario',
                    ':id' => $entregaId
                ]);

                // Devolver stock
                $sqlRestock = "INSERT INTO insumo_stock_ubicacion (insumo_id, ubicacion_id, cantidad) 
                            VALUES (:iid, :uid, :cant) 
                            ON DUPLICATE KEY UPDATE cantidad = cantidad + :cant_upd";

                $this->db->prepare($sqlRestock)->execute([
                    ':iid' => $entrega['insumo_id'],
                    ':uid' => $bodegaId,
                    ':cant' => $cantidad,
                    ':cant_upd' => $cantidad
                ]);

                // Log devolución
                $sqlMov = "INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, ubicacion_id, fecha) 
                        VALUES (:iid, 1, :cant, :uid, 'Devuelto por Rechazo', :ubi, NOW())";
                $this->db->prepare($sqlMov)->execute([
                    ':iid' => $entrega['insumo_id'],
                    ':cant' => $cantidad,
                    ':uid' => $entrega['usuario_operario_id'],
                    ':ubi' => $bodegaId
                ]);

            } else {
                $nuevoEstado = 2;
                $sqlUpd = "UPDATE entregas_personal SET estado_id = :est, fecha_aceptacion = NOW() WHERE id = :id";
                $this->db->prepare($sqlUpd)->execute([':est' => $nuevoEstado, ':id' => $entregaId]);
            }

            $this->db->commit();
            return true;

        } catch (Exception $e) {
            if ($this->db->inTransaction())
                $this->db->rollBack();
            throw $e;
        }
    }

    public function devolverInsumo($entregaId, $cantidad)
    {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("SELECT * FROM entregas_personal WHERE id = :id FOR UPDATE");
            $stmt->execute([':id' => $entregaId]);
            $entrega = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$entrega)
                throw new Exception("Entrega no encontrada");

            $saldo = floatval($entrega['cantidad_entregada']) - floatval($entrega['cantidad_utilizada']);
            if ($cantidad > ($saldo + 0.001)) {
                throw new Exception("No puedes devolver más de lo que tienes ($saldo).");
            }

            $nuevaEntregada = floatval($entrega['cantidad_entregada']) - $cantidad;
            $nuevoEstado = ($nuevaEntregada - floatval($entrega['cantidad_utilizada']) <= 0.001) ? 3 : 2;

            $this->db->prepare("UPDATE entregas_personal SET cantidad_entregada = :newCant, estado_id = :est WHERE id = :id")
                ->execute([':newCant' => $nuevaEntregada, ':est' => $nuevoEstado, ':id' => $entregaId]);

            $bodegaId = 1;
            $this->db->prepare("INSERT INTO insumo_stock_ubicacion (insumo_id, ubicacion_id, cantidad) 
                                VALUES (:iid, :uid, :cant) 
                                ON DUPLICATE KEY UPDATE cantidad = cantidad + :cant")
                ->execute([':iid' => $entrega['insumo_id'], ':uid' => $bodegaId, ':cant' => $cantidad]);

            $obs = "Devolución voluntaria. OT: " . ($entrega['referencia_ot_id'] ?? 'N/A');
            $this->db->prepare("INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, ubicacion_id, fecha) 
                                VALUES (:iid, 1, :cant, :uid, :obs, :ubi, NOW())")
                ->execute([
                    ':iid' => $entrega['insumo_id'],
                    ':cant' => $cantidad,
                    ':uid' => $entrega['usuario_operario_id'] ?? $entrega['usuario_bodeguero_id'],
                    ':obs' => $obs,
                    ':ubi' => $bodegaId
                ]);

            $this->db->commit();
            return true;

        } catch (Exception $e) {
            if ($this->db->inTransaction())
                $this->db->rollBack();
            throw $e;
        }
    }

    public function reportarUso($entregaId, $cantidadUsada)
    {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("SELECT cantidad_entregada, cantidad_utilizada FROM entregas_personal WHERE id = :id FOR UPDATE");
            $stmt->execute([':id' => $entregaId]);
            $item = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$item)
                throw new Exception("Registro no encontrado");

            $nuevoTotal = floatval($item['cantidad_utilizada']) + $cantidadUsada;

            if ($nuevoTotal > floatval($item['cantidad_entregada'])) {
                throw new Exception("No puedes reportar más uso del stock que tienes asignado.");
            }

            $estadoFinal = ($nuevoTotal >= floatval($item['cantidad_entregada'])) ? 3 : 2;

            $sql = "UPDATE entregas_personal 
                    SET cantidad_utilizada = :uso, estado_id = :est, fecha_uso = NOW() 
                    WHERE id = :id";

            $this->db->prepare($sql)->execute([
                ':uso' => $nuevoTotal,
                ':est' => $estadoFinal,
                ':id' => $entregaId
            ]);

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            if ($this->db->inTransaction())
                $this->db->rollBack();
            throw $e;
        }
    }

    public function getDashboardSupervision()
    {
        $sql = "SELECT e.id, e.nombre_completo as nombre, e.email,
                    (SELECT COUNT(*) FROM entregas_personal ep WHERE ep.usuario_operario_id = e.usuario_id AND ep.estado_id = 1) as pendientes,
                    (SELECT COUNT(*) FROM entregas_personal ep WHERE ep.usuario_operario_id = e.usuario_id AND ep.estado_id = 2) as en_posesion
                FROM empleados e
                WHERE e.activo = 1";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function procesarDevolucionOT($datos)
    {
        $sqlHistorial = "INSERT INTO historial_operario_insumos (empleado_id, insumo_id, cantidad, operacion, ot_ref, fecha, bodeguero_id) 
                        VALUES (:emp, :ins, :cant, 'DEVOLUCION', :ot, NOW(), :bod)";

        $this->db->prepare($sqlHistorial)->execute([
            ':emp' => $datos['empleado_id'],
            ':ins' => $datos['insumo_id'],
            ':cant' => $datos['cantidad'],
            ':ot' => $datos['ot_id'],
            ':bod' => $datos['bodeguero_id']
        ]);
    }
}