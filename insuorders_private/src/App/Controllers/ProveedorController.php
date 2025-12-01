<?php
namespace App\Controllers;
use App\Repositories\ProveedorRepository;

class ProveedorController {
    private $repo;

    public function __construct() {
        $this->repo = new ProveedorRepository();
    }

    public function index() {
        echo json_encode(["success" => true, "data" => $this->repo->getAll()]);
    }

    public function auxiliares() {
        echo json_encode(["success" => true, "data" => $this->repo->getAuxiliares()]);
    }

    public function store() {
        try {
            $id = $this->repo->create($_POST);
            $this->procesarArchivo($id);

            echo json_encode(["success" => true, "message" => "Proveedor creado"]);
        } catch (\Exception $e) {
            http_response_code(400); 
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function update() {
        try {
            $id = $_GET['id'];
            $this->repo->update($id, $_POST);
            
            $this->procesarArchivo($id);

            echo json_encode(["success" => true, "message" => "Proveedor actualizado"]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    private function procesarArchivo($id) {
        if (isset($_FILES['documento']) && $_FILES['documento']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../../../../public_html/uploads/proveedores/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

            $fileName = "prov_{$id}_" . time() . "_" . basename($_FILES['documento']['name']);
            $targetPath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['documento']['tmp_name'], $targetPath)) {
                $this->repo->guardarDocumento($id, $_FILES['documento']['name'], $fileName);
            }
        }
    }
}