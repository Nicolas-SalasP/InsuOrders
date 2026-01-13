<?php
namespace App\Controllers;

use App\Services\MantenedoresService;

class MantenedoresController
{
    private $service;

    public function __construct()
    {
        $this->service = new MantenedoresService();
    }

    // --- EMPLEADOS ---
    public function getEmpleados()
    {
        echo json_encode(["success" => true, "data" => $this->service->obtenerEmpleados()]);
    }
    public function saveEmpleado()
    {
        $this->handleSave(fn($data) => $this->service->guardarEmpleado($data), "Empleado guardado");
    }
    public function deleteEmpleado()
    {
        $this->handleDelete(fn($id) => $this->service->eliminarEmpleado($id), "Empleado desactivado");
    }

    // --- CENTROS ---
    public function getCentros()
    {
        echo json_encode(["success" => true, "data" => $this->service->obtenerCentros()]);
    }
    public function saveCentro()
    {
        $this->handleSave(fn($data) => $this->service->guardarCentro($data), "Centro guardado");
    }
    public function deleteCentro()
    {
        $this->handleDelete(fn($id) => $this->service->eliminarCentro($id), "Centro eliminado");
    }

    // --- ÁREAS ---
    public function getAreas()
    {
        echo json_encode(["success" => true, "data" => $this->service->obtenerAreas()]);
    }
    public function saveArea()
    {
        $this->handleSave(fn($data) => $this->service->guardarArea($data), "Área guardada");
    }
    public function deleteArea()
    {
        $this->handleDelete(fn($id) => $this->service->eliminarArea($id), "Área eliminada");
    }

    // --- SECTORES ---
    public function getSectores()
    {
        echo json_encode(["success" => true, "data" => $this->service->obtenerSectores()]);
    }
    public function saveSector()
    {
        $this->handleSave(fn($data) => $this->service->guardarSector($data), "Sector guardado");
    }
    public function deleteSector()
    {
        $this->handleDelete(fn($id) => $this->service->eliminarSector($id), "Sector eliminado");
    }

    // --- UBICACIONES ---
    public function getUbicaciones()
    {
        echo json_encode(["success" => true, "data" => $this->service->obtenerUbicaciones()]);
    }
    public function saveUbicacion()
    {
        $this->handleSave(fn($data) => $this->service->guardarUbicacion($data), "Ubicación guardada");
    }
    public function deleteUbicacion()
    {
        $this->handleDelete(fn($id) => $this->service->eliminarUbicacion($id), "Ubicación eliminada");
    }

    // --- HELPERS PARA EVITAR REPETIR TRY/CATCH ---
    private function handleSave($callback, $successMsg)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            $callback($data);
            echo json_encode(["success" => true, "message" => $successMsg]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }

    private function handleDelete($callback, $successMsg)
    {
        $id = $_GET['id'] ?? null;
        try {
            $callback($id);
            echo json_encode(["success" => true, "message" => $successMsg]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Error: " . $e->getMessage()]);
        }
    }
}