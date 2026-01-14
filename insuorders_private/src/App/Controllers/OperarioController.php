<?php
namespace App\Controllers;

use App\Database\Database;
use App\Services\OperarioService;
use App\Middleware\AuthMiddleware;
use Exception;
use PDO;

class OperarioController
{
    private $service;

    public function __construct()
    {
        $this->service = new OperarioService();
    }

    public function getMisInsumos()
    {
        $userId = AuthMiddleware::verify(); 

        try {
            $data = $this->service->obtenerMisDatos($userId); 
            echo json_encode(['success' => true, 'data' => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function asignar()
    {
        $bodegueroId = AuthMiddleware::verify(); 
        
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            $this->service->asignarInsumo($data, $bodegueroId);
            echo json_encode(['success' => true, 'message' => 'Entrega registrada exitosamente.']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function responder($usuarioId)
    {
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents("php://input"), true);

        $entregaId = $data['entrega_id'] ?? null;
        $accion = $data['accion'] ?? null; // 'ACEPTAR' o 'RECHAZAR'

        if (!$entregaId || !in_array($accion, ['ACEPTAR', 'RECHAZAR'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Datos inválidos"]);
            return;
        }

        try {
            $db = Database::getConnection();
            $db->beginTransaction();
            $stmt = $db->prepare("SELECT insumo_id, cantidad_entregada, solicitud_id FROM detalle_solicitud WHERE id = :id FOR UPDATE");
            $stmt->execute([':id' => $entregaId]);
            $linea = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$linea) throw new Exception("Entrega no encontrada");

            $cantidad = floatval($linea['cantidad_entregada']);
            $insumoId = $linea['insumo_id'];

            if ($accion === 'RECHAZAR') {
                $db->prepare("UPDATE detalle_solicitud SET estado_linea = 'RECHAZADO', cantidad_entregada = 0 WHERE id = :id")
                ->execute([':id' => $entregaId]);
                $sqlRestock = "INSERT INTO insumo_stock_ubicacion (insumo_id, ubicacion_id, cantidad) 
                            VALUES (:iid, 1, :cant) 
                            ON DUPLICATE KEY UPDATE cantidad = cantidad + :cant_upd";
                $db->prepare($sqlRestock)->execute([
                    ':iid' => $insumoId,
                    ':cant' => $cantidad,
                    ':cant_upd' => $cantidad
                ]);
                $db->prepare("INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, referencia_id, ubicacion_id, fecha) 
                            VALUES (:iid, 1, :cant, :uid, 'Rechazo Operario', :ref, 1, NOW())")
                ->execute([':iid' => $insumoId, ':cant' => $cantidad, ':uid' => $usuarioId, ':ref' => $entregaId]);

                $msg = "Entrega rechazada. El stock ha vuelto a bodega.";

            } else {
                $db->prepare("UPDATE detalle_solicitud SET estado_linea = 'RECIBIDO' WHERE id = :id")
                ->execute([':id' => $entregaId]);

                $msg = "Entrega aceptada. El material ahora está en tu pañol.";
            }

            $db->commit();
            echo json_encode(["success" => true, "message" => $msg]);

        } catch (Exception $e) {
            if ($db->inTransaction()) $db->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function consumir()
    {
        AuthMiddleware::verify();
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            $this->service->reportarConsumo($data);
            echo json_encode(['success' => true, 'message' => 'Consumo registrado.']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
    
    public function dashboard()
    {
        AuthMiddleware::verify();
        try {
            $data = $this->service->getDashboard();
            echo json_encode(['success' => true, 'data' => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function devolver()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            $this->service->devolverInsumo($data);
            echo json_encode(["success" => true, "message" => "Insumo devuelto a bodega correctamente."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }
}