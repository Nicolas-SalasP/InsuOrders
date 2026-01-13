<?php
namespace App\Services;

use App\Repositories\InsumoRepository;
use Exception;
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

    private function sanearDatos($data)
    {
        if (isset($data['stock_actual']))
            $data['stock_actual'] = (int) $data['stock_actual'];
        if (isset($data['stock_minimo']))
            $data['stock_minimo'] = (int) $data['stock_minimo'];
        if (isset($data['precio_costo']))
            $data['precio_costo'] = (int) $data['precio_costo'];

        if (isset($data['nombre'])) {
            $data['nombre'] = $this->formatearNombre($data['nombre']);
        }
        if (isset($data['codigo_sku'])) {
            $data['codigo_sku'] = strtoupper(trim($data['codigo_sku']));
        }

        return $data;
    }

    public function crearInsumo($data)
    {
        if (strlen($data['codigo_sku']) < 3)
            throw new Exception("El SKU es muy corto.");
        if (empty($data['nombre']))
            throw new Exception("El nombre es obligatorio.");

        $data = $this->sanearDatos($data);

        if ($data['precio_costo'] < 0)
            throw new Exception("El precio no puede ser negativo.");
        if (empty($data['moneda']))
            $data['moneda'] = 'CLP';

        return $this->repo->create($data);
    }

    public function actualizarInsumo($id, $data, $usuarioId = null)
    {
        if (!$id)
            throw new Exception("ID no proporcionado.");

        $data = $this->sanearDatos($data);

        if (isset($data['codigo_sku']) && strlen($data['codigo_sku']) < 3) {
            throw new Exception("El SKU es muy corto.");
        }

        return $this->repo->update($id, $data, $usuarioId);
    }

    public function gestionarStock($data, $usuarioId)
    {
        if (!isset($data['cantidad']) || abs($data['cantidad']) == 0) {
            throw new Exception("La cantidad debe ser distinta de 0.");
        }
        return $this->repo->ajustarStock(
            $data['insumo_id'],
            $data['cantidad'],
            $data['tipo_movimiento_id'],
            $usuarioId,
            $data['observacion'],
            $data['empleado_id'] ?? null
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