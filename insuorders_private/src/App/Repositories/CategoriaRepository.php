<?php
namespace App\Repositories;

use App\Database\Database;
use PDO;
use Exception;

class CategoriaRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll()
    {
        $sql = "SELECT * FROM categorias_insumo ORDER BY id ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM categorias_insumo WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($nombre)
    {
        try {
            $sql = "INSERT INTO categorias_insumo (nombre) VALUES (:nombre)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':nombre' => $nombre]);
            return $this->db->lastInsertId();
        } catch (\PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                throw new Exception("Ya existe una categoría con ese nombre.");
            }
            throw $e;
        }
    }

    public function update($id, $nombre)
    {
        try {
            $sql = "UPDATE categorias_insumo SET nombre = :nombre WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':nombre' => $nombre, ':id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (\PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                throw new Exception("Ya existe una categoría con ese nombre.");
            }
            throw $e;
        }
    }

    public function delete($id)
    {
        try {
            $stmt = $this->db->prepare("DELETE FROM categorias_insumo WHERE id = :id");
            $stmt->execute([':id' => $id]);
            return true;
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000 || strpos($e->getMessage(), 'foreign key constraint') !== false) {
                throw new Exception("No se puede eliminar: Hay insumos asociados a esta categoría.");
            }
            throw $e;
        }
    }
}