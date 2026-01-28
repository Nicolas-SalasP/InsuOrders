<?php
namespace App\Services;

use App\Repositories\MantencionRepository;
use App\Repositories\CronogramaRepository;
use Exception;

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
        
        // AGREGADO: Obtener el estado de la cuadrilla (asignaciones)
        // Esto permite ver quién ha firmado y quién falta
        $asignaciones = $this->repo->getAsignadosOT($id);

        return array_merge($header, [
            'items' => $items,
            'asignaciones' => $asignaciones
        ]);
    }

    public function crearOT($data, $usuarioId)
    {
        if (empty($data['items'])) {
            throw new Exception("Debe agregar al menos un insumo.");
        } 
        return $this->repo->createOT($data);
    }

    public function editarOT($id, $data)
    {
        $resultado = $this->repo->updateOT($id, $data);
        $this->cronogramaRepo->syncByOT($id, $data);

        return $resultado;
    }

    public function finalizarTarea($otId, $usuarioId, $notas = '')
    {
        return $this->repo->finalizarTareaTecnico($otId, $usuarioId, $notas);
    }

    public function anularOT($id)
    {
        $entregas = $this->repo->getEntregasOT($id);
        if (!empty($entregas)) {
            throw new Exception("No se puede anular una OT que ya tiene materiales entregados. Debe finalizarlas.");
        }

        $this->repo->delete($id);
    }

    public function obtenerGaleria($id)
    {
        return $this->repo->getGaleriaActivo($id);
    }

    public function crearActivo($data)
    {
        return $this->repo->createActivo($data);
    }

    public function editarActivo($data)
    {
        if (empty($data['id'])) {
            throw new Exception("ID de activo no proporcionado.");
        }
        return $this->repo->updateActivo($data);
    }

    public function guardarPlantilla($activoId, $plantillaData)
    {
        if (empty($activoId)) {
            throw new Exception("El ID del activo es obligatorio.");
        }

        if (empty($plantillaData)) {
            throw new Exception("La estructura de la plantilla no puede estar vacía.");
        }
        $jsonStr = is_array($plantillaData) ? json_encode($plantillaData, JSON_UNESCAPED_UNICODE) : $plantillaData;
        $this->repo->savePlantillaActivo($activoId, $jsonStr);
        
        return true;
    }
}