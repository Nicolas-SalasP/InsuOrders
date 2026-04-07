<?php
namespace App\Services;

use App\Repositories\BodegaRepository;
use App\Repositories\MantencionRepository;
use App\Repositories\OperarioRepository;
use App\Database\Database;
use Exception;
use PDO;

class BodegaService
{
    private $repo;
    private $mantencionRepo;
    private $operarioRepo;

    public function __construct()
    {
        $this->repo = new BodegaRepository();
        $this->mantencionRepo = new MantencionRepository();
        $this->operarioRepo = new OperarioRepository();
    }

    public function getPendientes()
    {
        return $this->mantencionRepo->getPendientesEntrega();
    }
    public function getPorOrganizar()
    {
        return $this->repo->getPorOrganizar();
    }
    public function getDevolucionesPendientes()
    {
        return $this->repo->getDevolucionesPendientes();
    }

    public function entregarMaterial($data, $usuarioId)
    {
        $cantidad = isset($data['cantidad_entregar']) ? $data['cantidad_entregar'] : ($data['cantidad'] ?? 0);
        if ($cantidad <= 0)
            throw new Exception("Cantidad inválida");

        if (!empty($data['empleado_id']) && empty($data['detalle_id'])) {
            $datosEntrega = [
                'insumo_id' => $data['insumo_id'],
                'cantidad' => (float) $cantidad,
                'empleado_id' => (int) $data['empleado_id'],
                'observacion' => $data['observacion'] ?? 'Entrega directa desde Bodega',
                'bodeguero_id' => $usuarioId
            ];
            $this->operarioRepo->asignarInsumo($datosEntrega);
            return "Material entregado al empleado correctamente";
        } elseif (!empty($data['detalle_id']) && !empty($data['receptor_id'])) {
            $this->mantencionRepo->entregarMaterial((int) $data['detalle_id'], (int) $usuarioId, (float) $cantidad, (int) $data['receptor_id']);

            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT insumo_id, solicitud_id FROM detalle_solicitud WHERE id = ?");
            $stmt->execute([$data['detalle_id']]);
            $fila = $stmt->fetch(PDO::FETCH_ASSOC);

            $datosPersonal = [
                'insumo_id' => $fila['insumo_id'] ?? null,
                'cantidad' => (float) $cantidad,
                'empleado_id' => (int) $data['receptor_id'],
                'observacion' => "Material para OT #" . ($fila['solicitud_id'] ?? 'S/N'),
                'bodeguero_id' => $usuarioId,
                'ot_id' => $fila['solicitud_id'] ?? null
            ];
            $this->operarioRepo->vincularEntregaOT($datosPersonal);
            return "Entrega de OT registrada exitosamente";
        } else {
            throw new Exception("Faltan datos requeridos.");
        }
    }

    public function entregarMasivo($items, $receptorId, $usuarioId)
    {
        $db = Database::getConnection();
        $errores = [];
        $procesados = 0;

        try {
            $db->beginTransaction();
            $stmtInfo = $db->prepare("SELECT insumo_id, solicitud_id FROM detalle_solicitud WHERE id = ?");

            foreach ($items as $item) {
                try {
                    $cantidad = (float) $item['cantidad'];
                    $detalleId = (int) $item['detalle_id'];
                    $this->mantencionRepo->entregarMaterial($detalleId, (int) $usuarioId, $cantidad, $receptorId);

                    $stmtInfo->execute([$detalleId]);
                    $info = $stmtInfo->fetch(PDO::FETCH_ASSOC);
                    if ($info) {
                        $this->operarioRepo->vincularEntregaOT([
                            'insumo_id' => $info['insumo_id'],
                            'cantidad' => $cantidad,
                            'empleado_id' => $receptorId,
                            'observacion' => "Entrega Masiva OT #" . $info['solicitud_id'],
                            'bodeguero_id' => $usuarioId,
                            'ot_id' => $info['solicitud_id']
                        ]);
                        $procesados++;
                    }
                } catch (Exception $e) {
                    $errores[] = "Item ID $detalleId: " . $e->getMessage();
                }
            }

            if ($procesados === 0 && count($errores) > 0) {
                $db->rollBack();
                throw new Exception("Fallaron todos los ítems: " . implode(", ", $errores));
            }

            $db->commit();
            return ["procesados" => $procesados, "errores" => $errores];
        } catch (Exception $e) {
            if ($db->inTransaction())
                $db->rollBack();
            throw $e;
        }
    }

    public function organizar($insumoId, $ubicacionDestino, $cantidad)
    {
        $ubicacionOrigen = 1;
        if ($cantidad <= 0)
            throw new Exception("La cantidad debe ser mayor a 0");
        if ($ubicacionOrigen == $ubicacionDestino)
            throw new Exception("La ubicación destino debe ser diferente a la de origen");

        $db = Database::getConnection();
        try {
            $db->beginTransaction();
            $stmtCheck = $db->prepare("SELECT cantidad FROM insumo_stock_ubicacion WHERE insumo_id = :iid AND ubicacion_id = :uid FOR UPDATE");
            $stmtCheck->execute([':iid' => $insumoId, ':uid' => $ubicacionOrigen]);
            $stockPendiente = $stmtCheck->fetchColumn();

            if ($stockPendiente === false || $stockPendiente < $cantidad) {
                throw new Exception("No hay stock suficiente por organizar. Disponible: " . ($stockPendiente ?: 0));
            }

            $db->prepare("UPDATE insumo_stock_ubicacion SET cantidad = cantidad - :cant WHERE insumo_id = :iid AND ubicacion_id = :uid")
                ->execute([':cant' => $cantidad, ':iid' => $insumoId, ':uid' => $ubicacionOrigen]);

            $db->prepare("INSERT INTO insumo_stock_ubicacion (insumo_id, ubicacion_id, cantidad) VALUES (:iid, :uid, :cant) ON DUPLICATE KEY UPDATE cantidad = cantidad + :cant_upd")
                ->execute([':iid' => $insumoId, ':uid' => $ubicacionDestino, ':cant' => $cantidad, ':cant_upd' => $cantidad]);

            $db->commit();
            return true;
        } catch (Exception $e) {
            if ($db->inTransaction())
                $db->rollBack();
            throw $e;
        }
    }

    public function aprobarDevolucion($devolucionId, $usuarioId)
    {
        $db = Database::getConnection();
        try {
            $db->beginTransaction();
            $this->repo->aprobarDevolucion($devolucionId, $usuarioId);
            $db->commit();
            return true;
        } catch (Exception $e) {
            if ($db->inTransaction())
                $db->rollBack();
            throw $e;
        }
    }

    public function rechazarDevolucion($devolucionId, $usuarioId, $motivo)
    {
        if (empty($motivo))
            throw new Exception("Debe especificar un motivo para el rechazo.");
        $db = Database::getConnection();
        try {
            $db->beginTransaction();
            $this->repo->rechazarDevolucion($devolucionId, $usuarioId, $motivo);
            $db->commit();
            return true;
        } catch (Exception $e) {
            if ($db->inTransaction())
                $db->rollBack();
            throw $e;
        }
    }

    public function getTiposDevolucion()
    {
        return $this->repo->getTiposDevolucion();
    }
}