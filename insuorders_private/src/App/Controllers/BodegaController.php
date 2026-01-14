<?php
namespace App\Controllers;

use App\Repositories\MantencionRepository;
use App\Repositories\InsumoRepository;
use App\Repositories\OperarioRepository;
use App\Database\Database;
use Exception;
use PDO;

class BodegaController
{
    private $repo;
    private $insumoRepo;
    private $operarioRepo;

    public function __construct()
    {
        $this->repo = new MantencionRepository();
        $this->insumoRepo = new InsumoRepository();
        $this->operarioRepo = new OperarioRepository();
    }

    public function pendientes()
    {
        header('Content-Type: application/json');
        try {
            $data = $this->repo->getPendientesEntrega();
            echo json_encode(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function porOrganizar()
    {
        header('Content-Type: application/json');
        try {
            $db = Database::getConnection();
            $sql = "SELECT 
                        i.id, i.codigo_sku, i.nombre, c.nombre as categoria_nombre, 
                        i.stock_actual, i.unidad_medida,
                        isu.cantidad as por_organizar
                    FROM insumos i
                    JOIN insumo_stock_ubicacion isu ON i.id = isu.insumo_id
                    LEFT JOIN categorias_insumo c ON i.categoria_id = c.id
                    WHERE isu.ubicacion_id = 1 AND isu.cantidad > 0.01
                    ORDER BY i.nombre ASC";

            $data = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function entregar($usuarioId)
    {
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(["success" => false, "error" => "Sesión expirada o inválida"]);
            return;
        }

        $cantidad = isset($data['cantidad_entregar']) ? $data['cantidad_entregar'] : ($data['cantidad'] ?? 0);

        if ($cantidad <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Cantidad inválida"]);
            return;
        }

        try {
            if (!empty($data['empleado_id']) && empty($data['detalle_id'])) {

                $datosEntrega = [
                    'insumo_id' => $data['insumo_id'],
                    'cantidad' => (float) $cantidad,
                    'empleado_id' => (int) $data['empleado_id'],
                    'observacion' => $data['observacion'] ?? 'Entrega directa desde Bodega',
                    'bodeguero_id' => $usuarioId
                ];

                $this->operarioRepo->asignarInsumo($datosEntrega);
                echo json_encode(["success" => true, "message" => "Material entregado al empleado correctamente"]);

            } elseif (!empty($data['detalle_id']) && !empty($data['receptor_id'])) {

                $this->repo->entregarMaterial(
                    (int) $data['detalle_id'],
                    (int) $usuarioId,
                    (float) $cantidad,
                    (int) $data['receptor_id']
                );

                $db = Database::getConnection();
                $stmt = $db->prepare("SELECT insumo_id, solicitud_id FROM detalle_solicitud WHERE id = ?");
                $stmt->execute([$data['detalle_id']]);
                $fila = $stmt->fetch(PDO::FETCH_ASSOC);

                $insumoId = $fila['insumo_id'] ?? null;
                $otIdReal = $fila['solicitud_id'] ?? null;

                $datosPersonal = [
                    'insumo_id' => $insumoId,
                    'cantidad' => (float) $cantidad,
                    'empleado_id' => (int) $data['receptor_id'],
                    'observacion' => "Material para OT #" . ($otIdReal ?? 'S/N'),
                    'bodeguero_id' => $usuarioId,
                    'ot_id' => $otIdReal
                ];

                $this->operarioRepo->vincularEntregaOT($datosPersonal);

                echo json_encode(["success" => true, "message" => "Entrega de OT registrada exitosamente"]);

            } else {
                throw new Exception("Faltan datos: Se requiere 'empleado_id' o 'detalle_id' + 'receptor_id'.");
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function organizar()
    {
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents("php://input"), true);

        $insumoId = $data['insumo_id'];
        $ubicacionDestino = $data['ubicacion_id'];
        $cantidad = (float) $data['cantidad'];
        $ubicacionOrigen = 1;

        if ($cantidad <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "La cantidad debe ser mayor a 0"]);
            return;
        }

        if ($ubicacionOrigen == $ubicacionDestino) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "La ubicación destino debe ser diferente a la de origen"]);
            return;
        }

        try {
            $db = Database::getConnection();
            $db->beginTransaction();

            $stmtCheck = $db->prepare("SELECT cantidad FROM insumo_stock_ubicacion WHERE insumo_id = :iid AND ubicacion_id = :uid FOR UPDATE");
            $stmtCheck->execute([':iid' => $insumoId, ':uid' => $ubicacionOrigen]);
            $stockPendiente = $stmtCheck->fetchColumn();

            if ($stockPendiente === false || $stockPendiente < $cantidad) {
                throw new Exception("No hay stock suficiente por organizar. Disponible: " . ($stockPendiente ?: 0));
            }

            $sqlRestar = "UPDATE insumo_stock_ubicacion SET cantidad = cantidad - :cant 
                        WHERE insumo_id = :iid AND ubicacion_id = :uid";
            $db->prepare($sqlRestar)->execute([
                ':cant' => $cantidad,
                ':iid' => $insumoId,
                ':uid' => $ubicacionOrigen
            ]);

            $sqlSumar = "INSERT INTO insumo_stock_ubicacion (insumo_id, ubicacion_id, cantidad) 
                        VALUES (:iid, :uid, :cant) 
                        ON DUPLICATE KEY UPDATE cantidad = cantidad + :cant_upd";

            $db->prepare($sqlSumar)->execute([
                ':iid' => $insumoId,
                ':uid' => $ubicacionDestino,
                ':cant' => $cantidad,
                ':cant_upd' => $cantidad
            ]);

            $db->commit();
            echo json_encode(["success" => true, "message" => "Stock movido correctamente"]);

        } catch (Exception $e) {
            if (isset($db) && $db->inTransaction()) {
                $db->rollBack();
            }
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Error al organizar: " . $e->getMessage()]);
        }
    }

    public function entregarMasivo($usuarioId)
    {
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(["success" => false, "error" => "Sesión expirada"]);
            return;
        }

        if (empty($data['items']) || empty($data['receptor_id'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Faltan datos para la entrega masiva."]);
            return;
        }

        $items = $data['items'];
        $receptorId = (int) $data['receptor_id'];
        $errores = [];
        $procesados = 0;

        try {
            $this->repo->getDb()->beginTransaction();
            $stmtInfo = $this->repo->getDb()->prepare("SELECT insumo_id, solicitud_id FROM detalle_solicitud WHERE id = ?");

            foreach ($items as $item) {
                try {
                    $cantidad = (float) $item['cantidad'];
                    $detalleId = (int) $item['detalle_id'];
                    $this->repo->entregarMaterial(
                        $detalleId,
                        (int) $usuarioId,
                        $cantidad,
                        $receptorId
                    );

                    $stmtInfo->execute([$detalleId]);
                    $info = $stmtInfo->fetch(PDO::FETCH_ASSOC);

                    if ($info) {
                        $insumoId = $info['insumo_id'];
                        $otId = $info['solicitud_id'];

                        $datosPersonal = [
                            'insumo_id' => $insumoId,
                            'cantidad' => $cantidad,
                            'empleado_id' => $receptorId,
                            'observacion' => "Entrega Masiva OT #" . $otId,
                            'bodeguero_id' => $usuarioId,
                            'ot_id' => $otId
                        ];

                        $this->operarioRepo->vincularEntregaOT($datosPersonal);
                        $procesados++;
                    }

                } catch (Exception $e) {
                    $errores[] = "Item ID $detalleId: " . $e->getMessage();
                }
            }

            if ($procesados === 0 && count($errores) > 0) {
                $this->repo->getDb()->rollBack();
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Fallaron todos los ítems: " . implode(", ", $errores)]);
                return;
            }

            $this->repo->getDb()->commit();

            $msg = "Se entregaron $procesados ítems correctamente.";
            if (count($errores) > 0) {
                $msg .= " (Hubo errores en: " . count($errores) . " ítems).";
            }

            echo json_encode(["success" => true, "message" => $msg]);

        } catch (Exception $e) {
            if ($this->repo->getDb()->inTransaction()) {
                $this->repo->getDb()->rollBack();
            }
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Error crítico: " . $e->getMessage()]);
        }
    }

    public function devolver($usuarioId)
    {
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(["success" => false, "error" => "Sesión inválida"]);
            return;
        }

        $detalleId = $data['detalle_id'] ?? null;
        $cantidad = $data['cantidad'] ?? 0;
        $empleadoId = $data['empleado_id'] ?? null;

        if (!$detalleId || $cantidad <= 0 || !$empleadoId) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Faltan datos para la devolución"]);
            return;
        }

        try {
            $this->repo->getDb()->beginTransaction();
            $insumoId = $this->repo->devolverMaterial($detalleId, $cantidad, $usuarioId);
            $stmt = $this->repo->getDb()->prepare("SELECT solicitud_id FROM detalle_solicitud WHERE id = ?");
            $stmt->execute([$detalleId]);
            $otId = $stmt->fetchColumn();
            $datosDevolucion = [
                'insumo_id' => $insumoId,
                'empleado_id' => $empleadoId,
                'ot_id' => $otId,
                'cantidad' => $cantidad,
                'bodeguero_id' => $usuarioId
            ];
            $this->operarioRepo->procesarDevolucionOT($datosDevolucion);

            $this->repo->getDb()->commit();
            echo json_encode(["success" => true, "message" => "Devolución procesada correctamente. Stock restaurado."]);

        } catch (Exception $e) {
            if ($this->repo->getDb()->inTransaction()) {
                $this->repo->getDb()->rollBack();
            }
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }
}