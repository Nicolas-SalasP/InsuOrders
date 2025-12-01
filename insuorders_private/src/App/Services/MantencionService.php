<?php
namespace App\Services;

use App\Repositories\MantencionRepository;
use App\Repositories\InsumoRepository;

class MantencionService
{
    private $repo;
    private $insumoRepo;

    public function __construct()
    {
        $this->repo = new MantencionRepository();
        $this->insumoRepo = new InsumoRepository();
    }

    public function listarActivos()
    {
        return $this->repo->getActivos();
    }
    public function listarSolicitudes()
    {
        return $this->repo->getSolicitudes();
    }
    public function obtenerDetalleOT($id)
    {
        return $this->repo->getDetallesOT($id);
    }

    public function crearOT($data, $usuarioId)
    {
        if (empty($data['items']))
            throw new \Exception("La solicitud debe tener insumos.");

        $otId = $this->repo->createSolicitud([
            'usuario_id' => $usuarioId,
            'activo_id' => $data['activo_id'],
            'observacion' => $data['observacion'] ?? ''
        ]);

        $this->procesarItems($otId, $data['items']);
        return $otId;
    }

    public function editarOT($id, $data)
    {
        if (empty($data['items']))
            throw new \Exception("La OT debe tener insumos.");

        $this->repo->updateSolicitud($id, $data['activo_id'], $data['observacion']);

        $this->repo->clearDetalles($id);

        $this->procesarItems($id, $data['items']);
    }

    public function anularOT($id)
    {
        $this->repo->updateEstado($id, 3);
    }

    private function procesarItems($otId, $items)
    {
        $insumos = $this->insumoRepo->getAll();

        foreach ($items as $item) {
            $stockActual = 0;
            foreach ($insumos as $i) {
                if ($i['id'] == $item['id']) {
                    $stockActual = $i['stock_actual'];
                    break;
                }
            }

            $$estadoLinea = 'REQUIERE_COMPRA';

            $this->repo->addDetalle([
                'solicitud_id' => $otId,
                'insumo_id' => $item['id'],
                'cantidad' => $item['cantidad'],
                'estado_linea' => $estadoLinea
            ]);
        }
    }
}