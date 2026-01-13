<?php
namespace App\Services;

use App\Repositories\CotizacionRepository;
use Exception;

class CotizacionService
{
    private $repo;

    public function __construct()
    {
        $this->repo = new CotizacionRepository();
    }

    public function listarCotizaciones($filtros)
    {
        return $this->repo->getAll($filtros);
    }

    public function obtenerCotizacion($id)
    {
        $cotizacion = $this->repo->getById($id);
        if (!$cotizacion) {
            throw new Exception("Cotización no encontrada.");
        }
        return $cotizacion;
    }

    public function crearCotizacion($data, $userId)
    {
        if (empty($data['items']) || !is_array($data['items'])) {
            throw new Exception("La cotización debe tener al menos un ítem.");
        }

        $total = 0;
        foreach ($data['items'] as $item) {
            if (empty($item['nombre_item'])) {
                throw new Exception("Todos los ítems deben tener un nombre.");
            }
            if ($item['cantidad'] <= 0) {
                throw new Exception("La cantidad debe ser mayor a 0.");
            }
            $total += ($item['cantidad'] * $item['precio']);
        }

        return $this->repo->create($data, $userId, $total);
    }

    public function gestionarEstado($id, $accion)
    {
        $cotizacion = $this->obtenerCotizacion($id);

        if ($cotizacion['estado_id'] != 1) {
            throw new Exception("Solo se pueden aprobar o rechazar cotizaciones en estado Pendiente.");
        }

        if ($accion === 'APROBAR') {
            $nuevoEstado = 2;
        } elseif ($accion === 'RECHAZAR') {
            $nuevoEstado = 3;
        } else {
            throw new Exception("Acción no válida.");
        }

        return $this->repo->updateStatus($id, $nuevoEstado);
    }

    public function obtenerListaEstados()
    {
        return $this->repo->getEstados();
    }
}