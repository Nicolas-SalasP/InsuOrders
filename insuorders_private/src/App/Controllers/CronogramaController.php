<?php
namespace App\Controllers;

use App\Services\CronogramaService;
use App\Middleware\AuthMiddleware;

class CronogramaController
{
    private $service;

    public function __construct()
    {
        $this->service = new CronogramaService();
    }

    public function index()
    {
        AuthMiddleware::hasPermission('cron_ver');
        $filtros = $_GET;
        $allData = $this->service->listar($filtros);

        $dataFiltrada = array_filter($allData, function ($evento) {
            if (($evento['tipo_evento'] ?? '') === 'MANTENCION') {
                return AuthMiddleware::checkPermissionSilently('cron_mant_ver');
            }
            if (($evento['tipo_evento'] ?? '') === 'COMPRA') {
                return AuthMiddleware::checkPermissionSilently('cron_insumos_ver');
            }
            return true;
        });

        echo json_encode(["success" => true, "data" => array_values($dataFiltrada)]);
    }

    public function store()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $tipo = $data['tipo_evento'] ?? 'MANTENCION';

        if ($tipo === 'MANTENCION') {
            $userId = AuthMiddleware::hasPermission('cron_mant_crear');
        } else {
            $userId = AuthMiddleware::hasPermission('cron_compra_crear');
        }

        try {
            $data['activo_id'] = !empty($data['activo_id']) ? $data['activo_id'] : null;
            $data['insumo_id'] = !empty($data['insumo_id']) ? $data['insumo_id'] : null;
            $id = $this->service->crear($data, $userId);
            echo json_encode(["success" => true, "id" => $id, "message" => "Evento agendado y OT generada"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function update()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;
        $tipo = $data['tipo_evento'] ?? 'MANTENCION';

        if ($tipo === 'MANTENCION') {
            AuthMiddleware::hasPermission('cron_mant_editar');
        } else {
            AuthMiddleware::hasPermission('cron_compra_editar');
        }

        try {
            $data['activo_id'] = !empty($data['activo_id']) ? $data['activo_id'] : null;
            $data['insumo_id'] = !empty($data['insumo_id']) ? $data['insumo_id'] : null;

            $this->service->actualizar($id, $data);
            echo json_encode(["success" => true, "message" => "Evento y OT actualizados"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    public function delete()
    {
        $id = $_GET['id'] ?? null;
        $tipo = $_GET['tipo'] ?? 'MANTENCION';
        if ($tipo === 'MANTENCION') {
            AuthMiddleware::hasPermission('cron_mant_eliminar');
        } else {
            AuthMiddleware::hasPermission('cron_compra_eliminar');
        }

        try {
            $this->service->eliminar($id);
            echo json_encode(["success" => true, "message" => "Evento eliminado"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    public function show()
    {
        AuthMiddleware::hasPermission('cron_ver');
        $id = $_GET['id'] ?? null;
        $data = $this->service->obtener($id);

        if ($data) {
            if ($data['tipo_evento'] === 'MANTENCION')
                AuthMiddleware::hasPermission('cron_mant_ver');
            else
                AuthMiddleware::hasPermission('cron_insumos_ver');
        }

        echo json_encode(["success" => !!$data, "data" => $data]);
    }
}