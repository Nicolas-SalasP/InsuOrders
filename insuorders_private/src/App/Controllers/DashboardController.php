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