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
            'observacion' => $data['observacion'] ?? '',
            'origen_tipo' => $data['origen_tipo'] ?? 'Interna'
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
        $this->repo->delete($id); // Llama al método delete del repo que marca como anulada
    }

    private function procesarItems($otId, $items)
    {
        $insumosRaw = $this->insumoRepo->getAll();
        $insumos = [];
        foreach ($insumosRaw as $ins) {
            $insumos[$ins['id']] = $ins;
        }

        foreach ($items as $item) {
            $insumoId = $item['id'];
            $cantidadSolicitada = (float) $item['cantidad'];

            $stockActual = 0;
            if (isset($insumos[$insumoId])) {
                $stockActual = (float) $insumos[$insumoId]['stock_actual'];
            }

            // Lógica de Split Inteligente
            if ($stockActual >= $cantidadSolicitada) {
                // Hay stock completo -> Para Bodega
                $this->repo->addDetalle([
                    'solicitud_id' => $otId,
                    'insumo_id' => $insumoId,
                    'cantidad' => $cantidadSolicitada,
                    'estado_linea' => 'EN_BODEGA'
                ]);
            } elseif ($stockActual > 0 && $stockActual < $cantidadSolicitada) {
                // Hay stock parcial -> Split
                $faltante = $cantidadSolicitada - $stockActual;

                // Parte 1: Lo que hay en bodega
                $this->repo->addDetalle([
                    'solicitud_id' => $otId,
                    'insumo_id' => $insumoId,
                    'cantidad' => $stockActual,
                    'estado_linea' => 'EN_BODEGA'
                ]);

                // Parte 2: Lo que falta (Para Compras)
                $this->repo->addDetalle([
                    'solicitud_id' => $otId,
                    'insumo_id' => $insumoId,
                    'cantidad' => $faltante,
                    'estado_linea' => 'REQUIERE_COMPRA'
                ]);
            } else {
                // No hay stock -> Todo para Compras
                $this->repo->addDetalle([
                    'solicitud_id' => $otId,
                    'insumo_id' => $insumoId,
                    'cantidad' => $cantidadSolicitada,
                    'estado_linea' => 'REQUIERE_COMPRA'
                ]);
            }
        }
    }
}