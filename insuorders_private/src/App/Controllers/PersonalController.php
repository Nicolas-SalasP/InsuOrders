<?php
namespace App\Controllers;

// IMPORTANTE: Usamos el Service, no el Repository
use App\Services\PersonalService; 

class PersonalController {
    private $service;

    public function __construct() {
        $this->service = new PersonalService();
    }

    public function index() {
        try {
            $data = $this->service->listarEmpleados();
            echo json_encode(["success" => true, "data" => $data]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }
}