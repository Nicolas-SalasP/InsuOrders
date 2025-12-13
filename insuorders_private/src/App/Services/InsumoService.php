<?php
namespace App\Services;

use App\Repositories\InsumoRepository;

class InsumoService
{
    private $repo;

    public function __construct()
    {
        $this->repo = new InsumoRepository();
    }

    public function listarTodo()
    {
        return $this->repo->getAll();
    }

    public function obtenerAuxiliares()
    {
        return $this->repo->getAuxiliares();
    }

    public function crearInsumo($data)
    {
        if (strlen($data['codigo_sku']) < 3) {
            throw new \Exception("El SKU es muy corto (mínimo 3 caracteres).");
        }
        if (empty($data['nombre'])) {
            throw new \Exception("El nombre del insumo es obligatorio.");
        }
        if (!isset($data['precio_costo']) || $data['precio_costo'] === '') {
            $data['precio_costo'] = 0;
        }
        if (empty($data['moneda'])) {
            $data['moneda'] = 'CLP';
        }
        if ($data['precio_costo'] < 0) {
            throw new \Exception("El precio de costo no puede ser negativo.");
        }

        $data['nombre'] = $this->formatearNombre($data['nombre']);
        $data['codigo_sku'] = strtoupper(trim($data['codigo_sku']));

        return $this->repo->create($data);
    }

    public function actualizarInsumo($id, $data)
    {
        if (!$id) {
            throw new \Exception("ID de insumo no proporcionado.");
        }
        if (isset($data['codigo_sku']) && strlen($data['codigo_sku']) < 3) {
            throw new \Exception("El SKU es muy corto.");
        }
        if (isset($data['nombre'])) {
            $data['nombre'] = $this->formatearNombre($data['nombre']);
        }
        if (isset($data['codigo_sku'])) {
            $data['codigo_sku'] = strtoupper(trim($data['codigo_sku']));
        }

        return $this->repo->update($id, $data);
    }

    public function gestionarStock($data, $usuarioId)
    {
        if (!isset($data['cantidad']) || $data['cantidad'] <= 0) {
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

    public function eliminarInsumo($id)
    {
        return $this->repo->delete($id);
    }

    private function formatearNombre($nombre)
    {
        $nombre = mb_strtolower(trim($nombre), 'UTF-8');
        return mb_convert_case($nombre, MB_CASE_TITLE, 'UTF-8');
    }
}