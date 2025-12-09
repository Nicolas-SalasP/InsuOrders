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

    public function pendientes()
    {
        echo json_encode(["success" => true, "data" => $this->repo->getPendientesEntrega()]);
    }

    public function porOrganizar()
    {
        $db = Database::getConnection();
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
    }

    public function entregar($usuarioId)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(["success" => false]);
            return;
        }

        try {
            $this->repo->entregarMaterial($data['detalle_id'], $usuarioId, $data['cantidad'], $data['receptor_id']);
            echo json_encode(["success" => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

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
            echo json_encode(["success" => false, "message" => "Error SQL: " . $e->getMessage()]);
        }
    }
}