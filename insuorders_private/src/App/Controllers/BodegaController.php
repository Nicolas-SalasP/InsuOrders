<?php
namespace App\Controllers;

use App\Repositories\MantencionRepository;
use App\Repositories\InsumoRepository;
use App\Repositories\OperarioRepository;
use App\Database\Database;
use Exception;

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

            $data = $db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function entregar($usuarioId)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(["success" => false, "error" => "Sesión expirada"]);
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
                    'insumo_id'    => $data['insumo_id'],
                    'cantidad'     => (float)$cantidad,
                    'empleado_id'  => (int)$data['empleado_id'],
                    'observacion'  => $data['observacion'] ?? 'Entrega directa desde Bodega',
                    'bodeguero_id' => $usuarioId
                ];

                $this->operarioRepo->asignarInsumo($datosEntrega);
                echo json_encode(["success" => true, "message" => "Material entregado al empleado correctamente"]);

            } 
            elseif (!empty($data['detalle_id']) && !empty($data['receptor_id'])) {
                $this->repo->entregarMaterial(
                    (int)$data['detalle_id'], 
                    (int)$usuarioId, 
                    (float)$cantidad, 
                    (int)$data['receptor_id']
                );
                
                $db = Database::getConnection();
                $stmt = $db->prepare("SELECT insumo_id FROM detalle_solicitud WHERE id = ?");
                $stmt->execute([$data['detalle_id']]);
                $insumoId = $stmt->fetchColumn();

                $datosPersonal = [
                    'insumo_id'    => $insumoId,
                    'cantidad'     => (float)$cantidad,
                    'empleado_id'  => (int)$data['receptor_id'],
                    'observacion'  => "Material para OT #" . ($data['ot_id'] ?? 'S/N'),
                    'bodeguero_id' => $usuarioId,
                    'ot_id'        => $data['ot_id'] ?? null
                ];
                
                $this->operarioRepo->vincularEntregaOT($datosPersonal);
                
                echo json_encode(["success" => true, "message" => "Entrega de OT registrada y enviada al técnico"]);

            } else {
                throw new Exception("Faltan datos: Se requiere 'empleado_id' o 'detalle_id'.");
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function organizar()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $insumoId = $data['insumo_id'];
        $ubicacionDestino = $data['ubicacion_id'];
        $cantidad = (float)$data['cantidad'];
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
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Error al organizar: " . $e->getMessage()]);
        }
    }
}