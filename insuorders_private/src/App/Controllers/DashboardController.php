<?php
namespace App\Controllers;

use App\Repositories\DashboardRepository;
use App\Middleware\AuthMiddleware;
use App\Database\Database;
use PDO;

class DashboardController
{
    private $repo;
    private $db;

    public function __construct()
    {
        $this->repo = new DashboardRepository();
        $this->db = Database::getConnection();
    }

    public function analytics()
    {
        $userId = AuthMiddleware::verify(); 
        
        try {
            $stmtRole = $this->db->prepare("SELECT r.nombre FROM roles r JOIN usuarios u ON u.rol_id = r.id WHERE u.id = ?");
            $stmtRole->execute([$userId]);
            $userRole = $stmtRole->fetchColumn();
            $stmtPerms = $this->db->prepare("SELECT p.codigo FROM permisos p JOIN usuario_permisos up ON p.id = up.permiso_id WHERE up.usuario_id = ?");
            $stmtPerms->execute([$userId]);
            $permisos = $stmtPerms->fetchAll(PDO::FETCH_COLUMN);
            $isAdmin = ($userRole === 'Admin' || $userId == 1);
            $canVerCompras = $isAdmin || 
                            stripos($userRole, 'Encargado Compras') !== false || 
                            in_array('dash_compras', $permisos) || 
                            in_array('ver_compras', $permisos);
            $canVerMant = $isAdmin || 
                        stripos($userRole, 'Jefe Mantención') !== false || 
                        in_array('dash_mantencion', $permisos) || 
                        in_array('mant_ver', $permisos);
            $canVerBodega = $isAdmin || 
                            stripos($userRole, 'Bodega') !== false || 
                            in_array('dash_bodega', $permisos) || 
                            in_array('bodega_ver', $permisos);

            $start = $_GET['start'] ?? date('Y-m-01');
            $end = $_GET['end'] ?? date('Y-m-d 23:59:59');
            $empleadoId = $_GET['empleado_id'] ?? null;

            $data = [
                'kpis' => [], 
                'compras' => null,
                'mantencion' => null,
                'bodega' => null
            ];
            $data['kpis'] = $this->repo->getGeneralKPIs($start, $end);
            if ($canVerCompras) {
                $data['compras'] = $this->repo->getComprasAnalytics($start, $end);
            }

            if ($canVerMant) {
                $data['mantencion'] = $this->repo->getMantencionAnalytics($start, $end);
            }

            if ($canVerBodega) {
                $data['bodega'] = $this->repo->getBodegaAnalytics($start, $end, $empleadoId);
            }

            echo json_encode(["success" => true, "data" => $data]);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function index()
    {
        $this->analytics();
    }

    public function logs()
    {
        try {
            $logs = $this->repo->getLogs('general');
            echo json_encode(["success" => true, "data" => $logs]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}