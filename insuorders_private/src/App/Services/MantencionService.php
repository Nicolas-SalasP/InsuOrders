<?php
namespace App\Services;

use App\Repositories\MantencionRepository;

class MantencionService
{
    private $repo;

    public function __construct()
    {
        $this->repo = new MantencionRepository();
    }

    public function listarSolicitudes()
    {
        return $this->repo->getSolicitudes();
    }

    public function obtenerDetalleOT($id)
    {
        $header = $this->repo->getOTHeader($id);
        if (!$header) return null;
        
        $items = $this->repo->getDetallesOT($id);
        return array_merge($header, ['items' => $items]);
    }

    public function crearOT($data, $usuarioId)
    {
        if (empty($data['items'])) {
            throw new \Exception("Debe agregar al menos un insumo."); 
        }
        return $this->repo->createOT($data);
    }

    public function editarOT($id, $data)
    {
        return $this->repo->updateOT($id, $data);
    }

    public function anularOT($id)
    {
        $entregas = $this->repo->getEntregasOT($id);
        if (!empty($entregas)) {
            throw new \Exception("No se puede anular una OT que ya tiene materiales entregados. Debe finalizarlas.");
        }
        
        $this->repo->delete($id); 
    }
}