<?php
namespace App\Services;

use App\Repositories\MantencionRepository;
use App\Repositories\CronogramaRepository;

class MantencionService
{
    private $repo;
    private $cronogramaRepo;

    public function __construct()
    {
        $this->repo = new MantencionRepository();
        $this->cronogramaRepo = new CronogramaRepository();
    }

    public function listarSolicitudes()
    {
        return $this->repo->getSolicitudes();
    }

    public function obtenerDetalleOT($id)
    {
        $header = $this->repo->getOTHeader($id);
        if (!$header)
            return null;

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
        $resultado = $this->repo->updateOT($id, $data);
        $this->cronogramaRepo->syncByOT($id, $data);

        return $resultado;
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