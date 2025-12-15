<?php
namespace App\Services;

use App\Repositories\OrdenCompraRepository;
use App\Repositories\InsumoRepository;
use App\Services\PDFService;

class OrdenCompraService
{
    private $repo;
    private $insumoRepo;

    public function __construct()
    {
        $this->repo = new OrdenCompraRepository();
        $this->insumoRepo = new InsumoRepository();
    }

    public function listarOrdenes($filtros = [])
    {
        return $this->repo->getAll($filtros);
    }

    public function obtenerFiltrosInsumos()
    {
        return $this->repo->getInsumosHistorial();
    }

    public function obtenerDetalleOrden($id)
    {
        return $this->repo->getOrdenCompleta($id);
    }

    public function crearOrden($data, $usuarioId)
    {
        if (empty($data['items']))
            throw new \Exception("La orden está vacía.");
        if (empty($data['proveedor_id']))
            throw new \Exception("Falta el proveedor.");

        $itemsProcesados = [];
        $montoNeto = 0;
        $idsOrigenGlobales = [];

        foreach ($data['items'] as $item) {
            $insumoId = null;

            // Si el insumo ya existe (viene con ID), lo usamos
            if (!empty($item['id'])) {
                $insumoId = $item['id'];
            } else {
                // SI ES NUEVO:
                // Pasamos 'codigo_sku' como NULL. 
                // El InsumoRepository detectará esto y generará el correlativo 99000007199XXXX

                $nuevoInsumo = [
                    'codigo_sku' => null,
                    'nombre' => $item['nombre'],
                    'descripcion' => 'Ingresado desde Compras',
                    'categoria_id' => $item['categoria_id'] ?? 1, // Categoría default si no se especifica
                    'ubicacion_id' => null,
                    'stock_actual' => 0,
                    'stock_minimo' => 0,
                    'precio_costo' => $item['precio'],
                    'moneda' => $data['moneda'] ?? 'CLP',
                    'unidad_medida' => $item['unidad']
                ];

                $insumoId = $this->insumoRepo->create($nuevoInsumo);
            }

            $subtotal = $item['cantidad'] * $item['precio'];
            $montoNeto += $subtotal;

            $itemsProcesados[] = [
                'insumo_id' => $insumoId,
                'cantidad' => $item['cantidad'],
                'precio' => $item['precio'],
                'total' => $subtotal
            ];

            // Manejo de referencias a Solicitudes de Mantención
            if (!empty($item['origen_ids'])) {
                if (is_array($item['origen_ids'])) {
                    $idsOrigenGlobales = array_merge($idsOrigenGlobales, $item['origen_ids']);
                } else {
                    $exploded = explode(',', $item['origen_ids']);
                    $idsOrigenGlobales = array_merge($idsOrigenGlobales, $exploded);
                }
            }
        }

        $moneda = $data['moneda'] ?? 'CLP';
        $tipoCambio = $data['tipo_cambio'] ?? 1;
        $numeroCotizacion = $data['numero_cotizacion'] ?? null;

        // Cálculo de IVA
        $porcentajeIVA = isset($data['impuesto_porcentaje']) ? floatval($data['impuesto_porcentaje']) : 19.0;
        $iva = $montoNeto * ($porcentajeIVA / 100);
        $total = $montoNeto + $iva;

        // Crear Cabecera
        $ordenId = $this->repo->create([
            'proveedor_id' => $data['proveedor_id'],
            'usuario_id' => $usuarioId,
            'neto' => $montoNeto,
            'impuesto' => $iva,
            'total' => $total,
            'moneda' => $moneda,
            'tipo_cambio' => $tipoCambio,
            'numero_cotizacion' => $numeroCotizacion,
            'impuesto_porcentaje' => $porcentajeIVA
        ]);

        // Insertar Detalles
        foreach ($itemsProcesados as $item) {
            $this->repo->addDetalle(array_merge($item, ['orden_id' => $ordenId]));
        }

        // Vincular con Mantención si aplica
        if (!empty($idsOrigenGlobales)) {
            $this->repo->asociarSolicitudesAOrden($ordenId, array_unique($idsOrigenGlobales));
        }

        return $ordenId;
    }

    public function generarPDF($ordenId)
    {
        $data = $this->repo->getOrdenCompleta($ordenId);
        if (!$data || !$data['cabecera']) {
            throw new \Exception("Orden #$ordenId no encontrada o sin datos.");
        }

        $pdf = new PDFService();
        $pdf->setOrdenData($data['cabecera']);
        return $pdf->generarPDF($data['detalles']);
    }

    public function adjuntarArchivo($id, $url)
    {
        return $this->repo->updateArchivo($id, $url);
    }

    public function recepcionarOrden($ordenId, $items, $usuarioId)
    {
        return $this->repo->recepcionarOrden($ordenId, $items, $usuarioId);
    }
}