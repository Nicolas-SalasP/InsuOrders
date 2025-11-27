<?php
namespace App\Services;

use App\Repositories\ProveedorRepository;

class ProveedorService {
    private $repo;

    public function __construct() {
        $this->repo = new ProveedorRepository();
    }

    public function listarTodos() {
        return $this->repo->getAll();
    }

    public function crear($data) {
        return $this->repo->create($data);
    }

    public function actualizar($id, $data) {
        return $this->repo->update($id, $data);
    }

    public function eliminar($id) {
        return $this->repo->delete($id);
    }
}