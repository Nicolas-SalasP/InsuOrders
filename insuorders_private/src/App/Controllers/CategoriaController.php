<?php
namespace App\Controllers;

use App\Services\CategoriaService;
use App\Middleware\AuthMiddleware;
use Exception;

class CategoriaController
{
    private $service;

    public function __construct()
    {
        $this->service = new CategoriaService();
    }

    public function index()
    {
        AuthMiddleware::verify();
        try {
            $data = $this->service->listarTodas();
            echo json_encode(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function store()
    {
        AuthMiddleware::verify('crear_categorias');
        $input = json_decode(file_get_contents("php://input"), true);
        $nombre = $input['nombre'] ?? null;

        try {
            $id = $this->service->crearCategoria($nombre);
            echo json_encode(["success" => true, "message" => "Categoría creada", "id" => $id]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function update()
    {
        AuthMiddleware::verify('editar_categorias');
        $input = json_decode(file_get_contents("php://input"), true);
        $id = $input['id'] ?? null;
        $nombre = $input['nombre'] ?? null;

        try {
            $this->service->actualizarCategoria($id, $nombre);
            echo json_encode(["success" => true, "message" => "Categoría actualizada"]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function delete()
    {
        AuthMiddleware::verify('eliminar_categorias');
        $id = $_GET['id'] ?? null;

        try {
            $this->service->eliminarCategoria($id);
            echo json_encode(["success" => true, "message" => "Categoría eliminada"]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}