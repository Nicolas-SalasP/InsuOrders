<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;

class MantenedoresRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }
    // =========================================================================
    // EMPLEADOS
    // =========================================================================
    public function getEmpleados()
    {
        $sql = "SELECT e.*, c.codigo as cc_codigo, c.nombre as cc_nombre 
                FROM empleados e 
                LEFT JOIN centros_costo c ON e.centro_costo_id = c.id 
                ORDER BY e.nombre_completo ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveEmpleado($data)
    {
        $params = [
            ':rut' => $data['rut'], 
            ':nom' => $data['nombre_completo'], 
            ':mail' => $data['email'] ?? null,
            ':car' => $data['cargo'] ?? null,
            ':cc' => !empty($data['centro_costo_id']) ? $data['centro_costo_id'] : null, 
            ':uid' => !empty($data['usuario_id']) ? $data['usuario_id'] : null,
            ':act' => $data['activo'] ?? 1
        ];

        if (!empty($data['id'])) {
            $sql = "UPDATE empleados SET 
                    rut=:rut, 
                    nombre_completo=:nom, 
                    email=:mail,
                    cargo=:car,
                    centro_costo_id=:cc, 
                    usuario_id=:uid,
                    activo=:act 
                    WHERE id=:id";
            
            $params[':id'] = $data['id'];
            $this->db->prepare($sql)->execute($params);

        } else {
            $sql = "INSERT INTO empleados (rut, nombre_completo, email, cargo, centro_costo_id, usuario_id, activo) 
                    VALUES (:rut, :nom, :mail, :car, :cc, :uid, :act)";
            
            $this->db->prepare($sql)->execute($params);
        }
    }

    public function deleteEmpleado($id)
    {
        $this->db->prepare("UPDATE empleados SET activo = 0 WHERE id = ?")->execute([$id]);
    }

    // =========================================================================
    // CENTROS DE COSTOS
    // =========================================================================
    public function getCentros()
    {
        $sql = "SELECT c.*, a.nombre as area_nombre FROM centros_costo c LEFT JOIN areas_negocio a ON c.area_negocio_id = a.id ORDER BY c.codigo ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveCentro($data)
    {
        if (!empty($data['id'])) {
            $this->db->prepare("UPDATE centros_costo SET codigo=:c, nombre=:n, alias=:a, area_negocio_id=:ar WHERE id=:id")
                ->execute([':c'=>$data['codigo'], ':n'=>$data['nombre'], ':a'=>$data['alias']??null, ':ar'=>$data['area_negocio_id']??null, ':id'=>$data['id']]);
        } else {
            $this->db->prepare("INSERT INTO centros_costo (codigo, nombre, alias, area_negocio_id) VALUES (:c, :n, :a, :ar)")
                ->execute([':c'=>$data['codigo'], ':n'=>$data['nombre'], ':a'=>$data['alias']??null, ':ar'=>$data['area_negocio_id']??null]);
        }
    }

    public function deleteCentro($id)
    {
        $this->db->prepare("DELETE FROM centros_costo WHERE id = ?")->execute([$id]);
    }

    // =========================================================================
    // Areas de Negocios
    // =========================================================================
    public function getAreas()
    {
        return $this->db->query("SELECT * FROM areas_negocio ORDER BY codigo ASC")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveArea($data)
    {
        if (!empty($data['id'])) {
            $this->db->prepare("UPDATE areas_negocio SET codigo=:c, nombre=:n WHERE id=:id")->execute([':c'=>$data['codigo'], ':n'=>$data['nombre'], ':id'=>$data['id']]);
        } else {
            $this->db->prepare("INSERT INTO areas_negocio (codigo, nombre) VALUES (:c, :n)")->execute([':c'=>$data['codigo'], ':n'=>$data['nombre']]);
        }
    }

    public function deleteArea($id)
    {
        $this->db->prepare("DELETE FROM areas_negocio WHERE id = ?")->execute([$id]);
    }

    // =========================================================================
    // SECTORES (Bodegas)
    // =========================================================================
    public function getSectores()
    {
        return $this->db->query("SELECT * FROM sectores ORDER BY nombre ASC")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveSector($data)
    {
        if (!empty($data['id'])) {
            $this->db->prepare("UPDATE sectores SET nombre=:n, codigo=:c WHERE id=:id")
                ->execute([':n'=>$data['nombre'], ':c'=>$data['codigo']??null, ':id'=>$data['id']]);
        } else {
            $this->db->prepare("INSERT INTO sectores (nombre, codigo) VALUES (:n, :c)")
                ->execute([':n'=>$data['nombre'], ':c'=>$data['codigo']??null]);
        }
    }

    public function deleteSector($id)
    {
        $this->db->prepare("DELETE FROM sectores WHERE id = ?")->execute([$id]);
    }

    // =========================================================================
    // UBICACIONES (Estanterías - Asociadas a un Sector)
    // =========================================================================
    public function getUbicaciones()
    {
        $sql = "SELECT u.*, s.nombre as sector_nombre 
                FROM ubicaciones u 
                LEFT JOIN sectores s ON u.sector_id = s.id 
                ORDER BY s.nombre ASC, u.nombre ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveUbicacion($data)
    {
        $params = [
            ':n' => $data['nombre'],
            ':c' => $data['codigo'] ?? null,
            ':s' => !empty($data['sector_id']) ? $data['sector_id'] : null,
            ':d' => $data['descripcion'] ?? ''
        ];

        if (!empty($data['id'])) {
            $sql = "UPDATE ubicaciones SET nombre=:n, codigo=:c, sector_id=:s, descripcion=:d WHERE id=:id";
            $params[':id'] = $data['id'];
            $this->db->prepare($sql)->execute($params);
        } else {
            $sql = "INSERT INTO ubicaciones (nombre, codigo, sector_id, descripcion) VALUES (:n, :c, :s, :d)";
            $this->db->prepare($sql)->execute($params);
        }
    }

    public function deleteUbicacion($id)
    {
        $this->db->prepare("DELETE FROM ubicaciones WHERE id = ?")->execute([$id]);
    }

    // =========================================================================
    // UBICACIONES DE ENVÍO
    // =========================================================================
    public function getUbicacionesEnvio($soloActivas = false)
    {
        $sql = "SELECT * FROM ubicaciones_envio";
        if ($soloActivas) {
            $sql .= " WHERE activo = 1";
        }
        $sql .= " ORDER BY nombre ASC";
        
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveUbicacionEnvio($data)
    {
        if (!empty($data['id'])) {
            $sql = "UPDATE ubicaciones_envio SET nombre=:n, descripcion=:d, activo=:a WHERE id=:id";
            $this->db->prepare($sql)->execute([
                ':n'  => $data['nombre'],
                ':d'  => $data['descripcion'] ?? null,
                ':a'  => $data['activo'] ?? 1,
                ':id' => $data['id']
            ]);
        } else {
            $sql = "INSERT INTO ubicaciones_envio (nombre, descripcion, activo) VALUES (:n, :d, 1)";
            $this->db->prepare($sql)->execute([
                ':n' => $data['nombre'],
                ':d' => $data['descripcion'] ?? null
            ]);
        }
    }

    public function deleteUbicacionEnvio($id)
    {
        $this->db->prepare("UPDATE ubicaciones_envio SET activo = 0 WHERE id = ?")->execute([$id]);
    }
}