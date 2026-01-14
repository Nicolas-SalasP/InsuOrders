<?php
namespace App\Services;

use App\Repositories\MantenedoresRepository;
use Exception;

class MantenedoresService
{
    private $repo;

    public function __construct()
    {
        $this->repo = new MantenedoresRepository();
    }

    // --- EMPLEADOS ---
    public function obtenerEmpleados()
    {
        return $this->repo->getEmpleados();
    }
    public function guardarEmpleado($data)
    {
        if (empty($data['rut']) || empty($data['nombre_completo']) || empty($data['centro_costo_id']))
            throw new Exception("Faltan datos obligatorios.");
        $this->repo->saveEmpleado($data);
    }
    public function eliminarEmpleado($id)
    {
        $this->repo->deleteEmpleado($id);
    }

    // --- CENTROS ---
    public function obtenerCentros()
    {
        return $this->repo->getCentros();
    }
    public function guardarCentro($data)
    {
        if (empty($data['codigo']) || empty($data['nombre']))
            throw new Exception("Datos incompletos.");
        $this->repo->saveCentro($data);
    }
    public function eliminarCentro($id)
    {
        $this->repo->deleteCentro($id);
    }

    // --- ÁREAS ---
    public function obtenerAreas()
    {
        return $this->repo->getAreas();
    }
    public function guardarArea($data)
    {
        if (empty($data['codigo']) || empty($data['nombre']))
            throw new Exception("Datos incompletos.");
        $this->repo->saveArea($data);
    }
    public function eliminarArea($id)
    {
        $this->repo->deleteArea($id);
    }

    // --- SECTORES (BODEGAS) ---
    public function obtenerSectores()
    {
        return $this->repo->getSectores();
    }
    public function guardarSector($data)
    {
        if (empty($data['nombre']))
            throw new Exception("El nombre del sector es obligatorio.");
        $this->repo->saveSector($data);
    }
    public function eliminarSector($id)
    {
        $this->repo->deleteSector($id);
    }

    // --- UBICACIONES (ESTANTERÍAS) ---
    public function obtenerUbicaciones()
    {
        return $this->repo->getUbicaciones();
    }
    public function guardarUbicacion($data)
    {
        if (empty($data['nombre']))
            throw new Exception("El nombre de la ubicación es obligatorio.");
        if (empty($data['sector_id']))
            throw new Exception("Debes asociar un Sector/Bodega.");
        $this->repo->saveUbicacion($data);
    }
    public function eliminarUbicacion($id)
    {
        $this->repo->deleteUbicacion($id);
    }

    // --- UBICACIONES DE ENVÍO ---
    
    public function obtenerUbicacionesEnvio($soloActivas = false)
    {
        return $this->repo->getUbicacionesEnvio($soloActivas);
    }

    public function guardarUbicacionEnvio($data)
    {
        if (empty($data['nombre'])) {
            throw new Exception("El nombre de la ubicación de envío es obligatorio.");
        }
        $this->repo->saveUbicacionEnvio($data);
    }

    public function eliminarUbicacionEnvio($id)
    {
        $this->repo->deleteUbicacionEnvio($id);
    }
}