<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;

class ProveedorRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    // LISTAR: Corregido para traer nombres de comuna y tipo venta
    public function getAll() {
        $sql = "SELECT 
                    p.*,
                    tv.descripcion as tipo_venta_nombre,
                    c.nombre as comuna_nombre,
                    r.nombre as region_nombre,
                    pa.nombre as pais_nombre,
                    pa.id as pais_id,
                    r.id as region_id
                FROM proveedores p
                LEFT JOIN tipos_venta tv ON p.tipo_venta_id = tv.id
                LEFT JOIN comunas c ON p.comuna_id = c.id
                LEFT JOIN regiones r ON c.region_id = r.id
                LEFT JOIN paises pa ON r.pais_id = pa.id
                ORDER BY p.nombre ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAuxiliares() {
        return [
            'tipos_venta' => $this->db->query("SELECT * FROM tipos_venta")->fetchAll(PDO::FETCH_ASSOC),
            'paises'      => $this->db->query("SELECT * FROM paises")->fetchAll(PDO::FETCH_ASSOC),
            'regiones'    => $this->db->query("SELECT * FROM regiones")->fetchAll(PDO::FETCH_ASSOC),
            'comunas'     => $this->db->query("SELECT * FROM comunas")->fetchAll(PDO::FETCH_ASSOC)
        ];
    }

    public function existeRut($rut, $idExcluir = null) {
        $sql = "SELECT COUNT(*) as total FROM proveedores WHERE rut = :rut";
        if ($idExcluir) $sql .= " AND id != :id";
        
        $stmt = $this->db->prepare($sql);
        $params = [':rut' => $rut];
        if ($idExcluir) $params[':id'] = $idExcluir;
        
        $stmt->execute($params);
        return $stmt->fetch(PDO::FETCH_ASSOC)['total'] > 0;
    }

    public function registrarLog($accion, $id, $descripcion) {
        $usuarioId = 1;
        
        $sql = "INSERT INTO sistema_logs (usuario_id, accion, tabla_afectada, registro_id, descripcion) 
                VALUES (:u, :a, 'proveedores', :id, :d)";
        $this->db->prepare($sql)->execute([
            ':u' => $usuarioId, ':a' => $accion, ':id' => $id, ':d' => $descripcion
        ]);
    }

    public function create($data) {
        if ($this->existeRut($data['rut'])) {
            throw new \Exception("El RUT {$data['rut']} ya está registrado.");
        }

        $sql = "INSERT INTO proveedores (rut, nombre, direccion, email, telefono, contacto_vendedor, tipo_venta_id, comuna_id) 
                VALUES (:rut, :nombre, :dir, :email, :tel, :contacto, :tv, :comuna)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':rut' => $data['rut'], ':nombre' => $data['nombre'], ':dir' => $data['direccion'],
            ':email' => $data['email'], ':tel' => $data['telefono'], ':contacto' => $data['contacto_vendedor'],
            ':tv' => $data['tipo_venta_id'], ':comuna' => $data['comuna_id']
        ]);

        $id = $this->db->lastInsertId();
        $this->registrarLog('CREAR', $id, "Creación de proveedor: " . $data['nombre']);
        return $id;
    }

    public function update($id, $data) {
        if ($this->existeRut($data['rut'], $id)) {
            throw new \Exception("El RUT {$data['rut']} ya pertenece a otro proveedor.");
        }

        // Obtener datos anteriores para el log
        $stmt = $this->db->prepare("SELECT * FROM proveedores WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $anterior = $stmt->fetch(PDO::FETCH_ASSOC);

        $sql = "UPDATE proveedores SET 
                rut=:rut, nombre=:nombre, direccion=:dir, email=:email, telefono=:tel, 
                contacto_vendedor=:contacto, tipo_venta_id=:tv, comuna_id=:comuna 
                WHERE id=:id";
        
        $stmt = $this->db->prepare($sql);
        $res = $stmt->execute([
            ':id' => $id, ':rut' => $data['rut'], ':nombre' => $data['nombre'], ':dir' => $data['direccion'],
            ':email' => $data['email'], ':tel' => $data['telefono'], ':contacto' => $data['contacto_vendedor'],
            ':tv' => $data['tipo_venta_id'], ':comuna' => $data['comuna_id']
        ]);

        // Generar descripción del cambio
        $cambios = [];
        foreach ($anterior as $key => $val) {
            if (isset($data[$key]) && $data[$key] != $val) {
                $cambios[] = "$key cambió de '$val' a '{$data[$key]}'";
            }
        }
        if (!empty($cambios)) {
            $this->registrarLog('EDITAR', $id, implode(", ", $cambios));
        }

        return $res;
    }

    // Método para guardar documento
    public function guardarDocumento($proveedorId, $nombre, $ruta) {
        $sql = "INSERT INTO proveedor_docs (proveedor_id, nombre_archivo, ruta_archivo) VALUES (:id, :nom, :ruta)";
        $this->db->prepare($sql)->execute([':id' => $proveedorId, ':nom' => $nombre, ':ruta' => $ruta]);
    }
}