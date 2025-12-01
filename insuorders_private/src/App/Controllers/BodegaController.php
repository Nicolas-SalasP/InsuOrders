<?php
namespace App\Controllers;

use App\Repositories\MantencionRepository;

class BodegaController
{
    private $repo;

    public function __construct()
    {
        $this->repo = new MantencionRepository();
    }

    public function pendientes()
    {
        echo json_encode(["success" => true, "data" => $this->repo->getPendientesEntrega()]);
    }

    public function entregar($usuarioId)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "No autorizado"]);
            return;
        }
        if (empty($data['detalle_id']) || empty($data['cantidad']) || empty($data['receptor_id'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos (ID, Cantidad o Receptor)"]);
            return;
        }

        try {
            $this->repo->entregarMaterial($data['detalle_id'], $usuarioId, $data['cantidad'], $data['receptor_id']);
            echo json_encode(["success" => true, "message" => "Material entregado correctamente"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}