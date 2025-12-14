<?php
namespace App\Controllers;

use App\Database\Database;
use PDO;

class PersonalController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function index()
    {
        try {
            // AGREGAMOS 'rut' A LA CONSULTA
            $sql = "SELECT 
                        id, 
                        rut, 
                        nombre_completo as nombre, 
                        '' as apellido, 
                        '' as cargo 
                    FROM empleados 
                    WHERE activo = 1 
                    ORDER BY nombre_completo ASC";

            $stmt = $this->db->query($sql);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["success" => true, "data" => $data]);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}