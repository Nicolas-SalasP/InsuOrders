<?php
namespace App\Controllers;

use App\Services\NotificationService;
use App\Middleware\AuthMiddleware;
use Exception;

class NotificationController
{
    private $service;

    public function __construct()
    {
        $this->service = new NotificationService();
    }

    public function index()
    {
        try {
            $userId = AuthMiddleware::verify();
            $data = $this->service->obtenerPanelDeNotificaciones($userId);
            echo json_encode(["success" => true, "data" => $data]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function leer()
    {
        try {
            $userId = AuthMiddleware::verify();
            
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $input['id'] ?? null;

            if ($id === 'all') {
                $this->service->leerTodas($userId);
            } elseif ($id) {
                $this->service->leerNotificacion($id, $userId);
            }

            echo json_encode(["success" => true, "message" => "Notificación leída."]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}