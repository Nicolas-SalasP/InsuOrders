<?php
namespace App\Services;

use App\Repositories\CategoriaRepository;
use Exception;

class CategoriaService
{
    private $repo;

    public function __construct()
    {
        $this->repo = new CategoriaRepository();
    }

    public function listarTodas()
    {
        return $this->repo->getAll();
    }

    private function formatearNombre($nombre)
    {
        if (empty($nombre)) return null;
        return mb_convert_case(mb_strtolower(trim($nombre), 'UTF-8'), MB_CASE_TITLE, 'UTF-8');
    }

    public function crearCategoria($nombreRaw)
    {
        if (empty($nombreRaw)) {
            throw new Exception("El nombre de la categoría es obligatorio.");
        }

        $nombre = $this->formatearNombre($nombreRaw);
        return $this->repo->create($nombre);
    }

    public function actualizarCategoria($id, $nombreRaw)
    {
        if (empty($id) || empty($nombreRaw)) {
            throw new Exception("Datos incompletos.");
        }

        $nombre = $this->formatearNombre($nombreRaw);
        return $this->repo->update($id, $nombre);
    }

    public function eliminarCategoria($id)
    {
        if (empty($id)) throw new Exception("ID no proporcionado.");
        return $this->repo->delete($id);
    }
}