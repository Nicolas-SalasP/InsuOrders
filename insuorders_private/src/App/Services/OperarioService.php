<?php
namespace App\Services;

use App\Repositories\OperarioRepository;
use Exception;

class OperarioService
{
    private $repo;

    public function __construct()
    {
        $this->repo = new OperarioRepository();
    }

    public function asignarInsumo($data, $bodegueroId)
    {
        if (empty($data['insumo_id']) || empty($data['empleado_id']) || empty($data['cantidad'])) {
            throw new Exception("Faltan datos obligatorios para la asignación.");
        }
        
        $data['bodeguero_id'] = $bodegueroId;
        return $this->repo->asignarInsumo($data);
    }

    public function obtenerMisDatos($usuarioId)
    {
        return $this->repo->getMisInsumosCorrecto($usuarioId);
    }

    public function responderEntrega($data)
    {
        if (empty($data['entrega_id']) && empty($data['entregas_ids'])) {
            throw new Exception("Datos inválidos. No se enviaron entregas.");
        }
        if (empty($data['accion'])) {
            throw new Exception("Acción no especificada.");
        }

        if (!empty($data['entregas_ids']) && is_array($data['entregas_ids'])) {
            return $this->repo->gestionarRecepcionMasiva($data['entregas_ids'], $data['accion'], $data['observacion'] ?? null);
        }

        return $this->repo->gestionarRecepcion($data['entrega_id'], $data['accion'], $data['observacion'] ?? null);
    }

    public function reportarConsumo($data)
    {
        if (empty($data['entrega_id']) || empty($data['cantidad']) || $data['cantidad'] <= 0) {
            throw new Exception("Cantidad inválida para consumo.");
        }
        return $this->repo->reportarUso($data['entrega_id'], $data['cantidad']);
    }

    public function devolverInsumo($data, $usuarioId)
    {
        if (empty($data['insumo_id']) || empty($data['cantidad']) || $data['cantidad'] <= 0) {
            throw new Exception("Cantidad o Insumo inválidos para devolución.");
        }
        return $this->repo->devolverInsumo($usuarioId, $data['insumo_id'], $data['cantidad']);
    }

    public function getDashboard()
    {
        return $this->repo->getDashboardSupervision();
    }
}