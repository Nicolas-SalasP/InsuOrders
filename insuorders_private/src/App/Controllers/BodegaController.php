<?php
namespace App\Controllers;

use App\Repositories\MantencionRepository;
use App\Repositories\InsumoRepository;
use App\Database\Database;

class BodegaController
{
    private $repo;
    private $insumoRepo;

    public function __construct()
    {
        $this->repo = new MantencionRepository();
        $this->insumoRepo = new InsumoRepository();
    }

    // LISTAR PENDIENTES (Salidas por OT)
    public function pendientes()
    {
        try {
            $data = $this->repo->getPendientesEntrega();
            echo json_encode(["success" => true, "data" => $data]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    // LISTAR POR ORGANIZAR (Entradas de Compras - Stock Flotante)
    public function porOrganizar()
    {
        try {
            $db = Database::getConnection();
            // Tu query original mantenida para calcular stock flotante
            $sql = "SELECT 
                        i.id, i.codigo_sku, i.nombre, c.nombre as categoria_nombre, 
                        i.stock_actual, i.unidad_medida,
                        ROUND(
                            i.stock_actual - COALESCE((SELECT SUM(cantidad) FROM insumo_stock_ubicacion WHERE insumo_id = i.id), 0), 
                            2
                        ) as por_organizar
                    FROM insumos i
                    LEFT JOIN categorias_insumo c ON i.categoria_id = c.id
                    HAVING por_organizar > 0.01
                    ORDER BY i.nombre ASC";

            $data = $db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $data]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    // PROCESAR ENTREGA (Rebajar Stock y Actualizar OT)
    public function entregar($usuarioId)
    {
        // 1. Obtener JSON RAW
        $data = json_decode(file_get_contents("php://input"), true);

        // 2. Validar sesión
        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(["success" => false, "error" => "Sesión expirada"]);
            return;
        }

        // 3. Validar datos mínimos
        if (empty($data['detalle_id']) || empty($data['receptor_id'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Faltan datos (ID o Receptor)"]);
            return;
        }

        // 4. Normalizar nombre de la variable cantidad
        // React puede estar enviando 'cantidad' o 'cantidad_entregar'. Revisamos ambos.
        $cantidad = isset($data['cantidad_entregar']) ? $data['cantidad_entregar'] : ($data['cantidad'] ?? 0);

        if ($cantidad <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Cantidad inválida"]);
            return;
        }

        try {
            // 5. Llamar al repositorio con tipos forzados (INT para IDs, FLOAT para cantidades)
            $this->repo->entregarMaterial(
                (int)$data['detalle_id'], 
                (int)$usuarioId, 
                (float)$cantidad, 
                (int)$data['receptor_id']
            );
            
            echo json_encode(["success" => true, "message" => "Entrega registrada correctamente"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]); // Cambiado 'message' a 'error' para estandarizar
        }
    }

    // ASIGNAR UBICACIÓN
    public function organizar()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            $db = Database::getConnection();
            $sql = "INSERT INTO insumo_stock_ubicacion (insumo_id, ubicacion_id, cantidad) 
                    VALUES (:iid, :uid, :cant) 
                    ON DUPLICATE KEY UPDATE cantidad = cantidad + :cant_upd";

            $db->prepare($sql)->execute([
                ':iid' => $data['insumo_id'],
                ':uid' => $data['ubicacion_id'],
                ':cant' => $data['cantidad'],
                ':cant_upd' => $data['cantidad']
            ]);

            echo json_encode(["success" => true, "message" => "Ubicación asignada correctamente"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Error SQL: " . $e->getMessage()]);
        }
    }
}