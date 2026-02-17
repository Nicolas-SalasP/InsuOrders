<?php
namespace App\Controllers;

use App\Services\ClienteService;
use App\Middleware\AuthMiddleware;

class ClienteController
{
    private $service;

    public function __construct()
    {
        $this->service = new ClienteService();
    }

    public function misSolicitudes()
    {
        try {
            $userId = AuthMiddleware::verify(); // Verifica Token y obtiene ID
            $data = $this->service->listarMisSolicitudes($userId);
            echo json_encode(["success" => true, "data" => $data]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function activosParaCliente()
    {
        try {
            AuthMiddleware::verify();
            $data = $this->service->obtenerActivos();
            echo json_encode(["success" => true, "data" => $data]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function store()
    {
        try {
            $userId = AuthMiddleware::verify();
            
            $data = $_POST;
            $files = $_FILES;
            $idSolicitud = $this->service->nuevaSolicitud($data, $files, $userId);
            
            echo json_encode([
                "success" => true, 
                "message" => "Solicitud creada exitosamente.",
                "id" => $idSolicitud 
            ]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }
}