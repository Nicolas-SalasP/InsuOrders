<?php
namespace App\Services;

use App\Repositories\ProveedorRepository;

class ProveedorService
{
    private $repo;

    public function __construct()
    {
        $this->repo = new ProveedorRepository();
    }

    public function listarTodos()
    {
        return $this->repo->getAll();
    }

    public function obtenerAuxiliares()
    {
        return $this->repo->getAuxiliares();
    }

    public function crear($data, $archivo = null)
    {
        $id = $this->repo->create($data);
        if ($archivo && $archivo['error'] === UPLOAD_ERR_OK) {
            $this->procesarArchivo($id, $archivo);
        }
        return $id;
    }

    public function actualizar($id, $data, $archivo = null)
    {
        $resultado = $this->repo->update($id, $data);
        if ($archivo && $archivo['error'] === UPLOAD_ERR_OK) {
            $this->procesarArchivo($id, $archivo);
        }
        return $resultado;
    }

    public function eliminar($id)
    {
        return $this->repo->delete($id);
    }

    private function procesarArchivo($id, $file)
    {
        $uploadDir = __DIR__ . '/../../../../public_html/uploads/proveedores/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = "prov_{$id}_" . time() . "." . $extension;
        $targetPath = $uploadDir . $fileName;
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $rutaWeb = '/uploads/proveedores/' . $fileName;
            $this->repo->guardarDocumento($id, $file['name'], $rutaWeb);
        }
    }
}