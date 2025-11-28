<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;

class PersonalRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll()
    {
        $sql = "SELECT 
                    e.id, e.rut, e.nombre_completo, 
                    cc.nombre as centro_costo, 
                    cc.codigo as cc_codigo,
                    cc.alias as cc_alias,
                    an.nombre as area_negocio, 
                    an.codigo as an_codigo
                FROM empleados e
                JOIN centros_costo cc ON e.centro_costo_id = cc.id
                JOIN areas_negocio an ON cc.area_negocio_id = an.id
                WHERE e.activo = 1
                ORDER BY e.nombre_completo ASC";

        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
}