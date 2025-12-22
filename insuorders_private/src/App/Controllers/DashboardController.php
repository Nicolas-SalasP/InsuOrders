<?php
namespace App\Controllers;

use App\Repositories\DashboardRepository;

class DashboardController
{
    private $repo;

    public function __construct()
    {
        $this->repo = new DashboardRepository();
    }

    // Método para la página de inicio (Resumen simple)
    public function index()
    {
        try {
            $stats = $this->repo->getStats();
            echo json_encode(["success" => true, "data" => $stats]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    // NUEVO: Método para gráficos y filtros de fecha
    public function analytics()
    {
        // Recibimos rango de fechas (o usamos mes actual por defecto)
        $start = $_GET['start'] ?? date('Y-m-01');
        $end = $_GET['end'] ?? date('Y-m-d 23:59:59');

        try {
            $response = [
                'general' => $this->repo->getStats(), // KPIs Globales
                'compras' => $this->repo->getComprasStats($start, $end),
                'mantencion' => $this->repo->getMantencionStats($start, $end)
            ];
            echo json_encode(["success" => true, "data" => $response]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function logs()
    {
        $area = $_GET['area'] ?? 'general';
        try {
            $logs = $this->repo->getLogs($area);
            echo json_encode(["success" => true, "data" => $logs]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}