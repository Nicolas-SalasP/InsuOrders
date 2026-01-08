<?php
namespace App\Services;

use App\Repositories\OperarioRepository;
use App\Repositories\UsuarioRepository;

class OperarioService
{
    private $repo;

    public function __construct()
    {
        $this->repo = new OperarioRepository();
    }

    public function asignarInsumo($data, $bodegueroId)
    {
        if (empty($data['insumo_id']) || empty($data['operario_id']) || empty($data['cantidad'])) {
            throw new \Exception("Faltan datos obligatorios para la asignación.");
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
        if (empty($data['entrega_id']) || empty($data['accion'])) {
            throw new \Exception("Datos inválidos.");
        }
        return $this->repo->gestionarRecepcion($data['entrega_id'], $data['accion'], $data['observacion'] ?? null);
    }

    public function reportarConsumo($data)
    {
        if (empty($data['entrega_id']) || empty($data['cantidad']) || $data['cantidad'] <= 0) {
            throw new \Exception("Cantidad inválida.");
        }
        return $this->repo->reportarUso($data['entrega_id'], $data['cantidad']);
    }

    public function getDashboard()
    {
        return $this->repo->getDashboardSupervision();
    }
}