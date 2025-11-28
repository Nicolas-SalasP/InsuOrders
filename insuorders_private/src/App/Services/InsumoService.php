<?php
namespace App\Services;

use App\Repositories\InsumoRepository;

class InsumoService {
    private $repo;

    public function __construct() {
        $this->repo = new InsumoRepository();
    }

    public function listarTodo() {
        return $this->repo->getAll();
    }
    
    public function obtenerAuxiliares() {
        return $this->repo->getAuxiliares();
    }

    public function crearInsumo($data) {
        if ($data['precio_costo'] < 0) {
            throw new \Exception("El valor neto no puede ser negativo.");
        }
        if (strlen($data['codigo_sku']) < 3) throw new \Exception("SKU muy corto");

        return $this->repo->create($data);
    }

    public function gestionarStock($data, $usuarioId) {
        if ($data['cantidad'] <= 0) {
            throw new \Exception("La cantidad debe ser mayor a 0.");
        }
        $empleadoId = isset($data['empleado_id']) ? $data['empleado_id'] : null;

        return $this->repo->ajustarStock(
            $data['insumo_id'], 
            $data['cantidad'], 
            $data['tipo_movimiento_id'], 
            $usuarioId, 
            $data['observacion'] ?? '',
            $empleadoId
        );
    }

    public function eliminarInsumo($id) {
        return $this->repo->delete($id);
    }
}