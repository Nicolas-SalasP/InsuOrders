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
        $insumosRaw = $this->insumoRepo->getAll();
        $insumos = [];
        foreach ($insumosRaw as $ins) {
            $insumos[$ins['id']] = $ins;
        }

        foreach ($items as $item) {
            $stockActual = 0;
            if (isset($insumos[$item['id']])) {
                $stockActual = (float) $insumos[$item['id']]['stock_actual'];
            }
            $cantidadSolicitada = (float) $item['cantidad'];

            // === LÓGICA DE SPLIT INTELIGENTE ===
            if ($stockActual >= $cantidadSolicitada) {
                $this->repo->addDetalle([
                    'solicitud_id' => $otId,
                    'insumo_id' => $item['id'],
                    'cantidad' => $cantidadSolicitada,
                    'estado_linea' => 'EN_BODEGA'
                ]);
            } elseif ($stockActual > 0 && $stockActual < $cantidadSolicitada) {
                $this->repo->addDetalle([
                    'solicitud_id' => $otId,
                    'insumo_id' => $item['id'],
                    'cantidad' => $stockActual,
                    'estado_linea' => 'EN_BODEGA'
                ]);

                $faltante = $cantidadSolicitada - $stockActual;
                $this->repo->addDetalle([
                    'solicitud_id' => $otId,
                    'insumo_id' => $item['id'],
                    'cantidad' => $faltante,
                    'estado_linea' => 'REQUIERE_COMPRA'
                ]);
            } else {
                $this->repo->addDetalle([
                    'solicitud_id' => $otId,
                    'insumo_id' => $item['id'],
                    'cantidad' => $cantidadSolicitada,
                    'estado_linea' => 'REQUIERE_COMPRA'
                ]);
            }
        }
    }
}