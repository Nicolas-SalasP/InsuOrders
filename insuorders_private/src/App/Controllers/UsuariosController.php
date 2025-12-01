<?php
namespace App\Controllers;

use App\Repositories\UsuariosRepository;

class UsuariosController
{
    private $repo;

    public function __construct()
    {
        $this->repo = new UsuariosRepository();
    }

    public function index()
    {
        echo json_encode(["success" => true, "data" => $this->repo->getAll()]);
    }

    public function roles()
    {
        echo json_encode(["success" => true, "data" => $this->repo->getRoles()]);
    }

    public function store()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            if (empty($data['password']))
                throw new \Exception("La contraseña es obligatoria.");
            $this->repo->create($data);
            echo json_encode(["success" => true, "message" => "Usuario creado exitosamente."]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function update()
    {
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            if (!$id)
                throw new \Exception("Falta ID");
            $this->repo->update($id, $data);
            echo json_encode(["success" => true, "message" => "Usuario actualizado."]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function toggle()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            if (empty($data['id']))
                throw new \Exception("Falta ID");
            $this->repo->toggleActivo($data['id']);
            echo json_encode(["success" => true, "message" => "Estado cambiado."]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}