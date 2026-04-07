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

        $tipoId = isset($data['tipo_devolucion_id']) ? intval($data['tipo_devolucion_id']) : 1;
        $observacion = isset($data['observacion']) ? trim($data['observacion']) : null;
        if ($data['accion'] === 'RECHAZAR' && $tipoId > 1 && empty($observacion)) {
            throw new Exception("Debe proporcionar una justificación para este tipo de rechazo.");
        }

        if (!empty($data['entregas_ids']) && is_array($data['entregas_ids'])) {
            return $this->repo->gestionarRecepcionMasiva($data['entregas_ids'], $data['accion'], $observacion, $tipoId);
        }

        return $this->repo->gestionarRecepcion($data['entrega_id'], $data['accion'], $observacion, $tipoId);
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

        $tipoId = isset($data['tipo_devolucion_id']) ? intval($data['tipo_devolucion_id']) : 1;
        $comentario = isset($data['comentario_tecnico']) ? trim($data['comentario_tecnico']) : null;

        if ($tipoId > 1 && empty($comentario)) {
            throw new Exception("Debe proporcionar una justificación para este tipo de rechazo/devolución.");
        }

        return $this->repo->devolverInsumo($usuarioId, $data['insumo_id'], $data['cantidad'], $tipoId, $comentario);
    }

    public function getDashboard()
    {
        return $this->repo->getDashboardSupervision();
    }
}