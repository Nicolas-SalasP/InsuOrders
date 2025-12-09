<?php
namespace App\Services;

use App\Repositories\OrdenCompraRepository;
use App\Repositories\InsumoRepository;
use App\Services\PDFService;

class OrdenCompraService {
    private $repo;
    private $insumoRepo;

    public function __construct() {
        $this->repo = new OrdenCompraRepository();
        $this->insumoRepo = new InsumoRepository();
    }

    public function listarOrdenes() {
        return $this->repo->getAll();
    }

    public function obtenerDetalleOrden($id) {
        return $this->repo->getOrdenCompleta($id);
    }

    public function crearOrden($data, $usuarioId) {
        if (empty($data['items'])) throw new \Exception("La orden está vacía.");
        if (empty($data['proveedor_id'])) throw new \Exception("Falta el proveedor.");

        $itemsProcesados = [];
        $montoNeto = 0;
        $idsOrigenGlobales = [];

        foreach ($data['items'] as $item) {
            $insumoId = null;

            if (!empty($item['id'])) {
                $insumoId = $item['id'];
            } 
            else {
                $skuTemp = 'NEW-' . strtoupper(substr($item['nombre'], 0, 3)) . rand(1000,9999);
                $nuevoInsumo = [
                    'codigo_sku' => $skuTemp,
                    'nombre' => $item['nombre'],
                    'descripcion' => 'Ingresado desde Compras',
                    'categoria_id' => $item['categoria_id'],
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
        
        // IVA Variable
        $porcentajeIVA = isset($data['impuesto_porcentaje']) ? floatval($data['impuesto_porcentaje']) : 19.0;
        $iva = $montoNeto * ($porcentajeIVA / 100);
        $total = $montoNeto + $iva;

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

        foreach ($itemsProcesados as $item) {
            $this->repo->addDetalle(array_merge($item, ['orden_id' => $ordenId]));
        }

        if (!empty($idsOrigenGlobales)) {
            $this->repo->asociarSolicitudesAOrden($ordenId, array_unique($idsOrigenGlobales));
        }

        return $ordenId;
    }

    public function generarPDF($ordenId) {
        $data = $this->repo->getOrdenCompleta($ordenId);
        if (!$data || !$data['cabecera']) throw new \Exception("Orden #$ordenId no encontrada.");
        
        $pdf = new PDFService();
        $pdf->setOrdenData($data['cabecera']);
        return $pdf->generarPDF($data['detalles']);
    }

    public function adjuntarArchivo($id, $url) {
        return $this->repo->updateArchivo($id, $url);
    }

    public function recepcionarOrden($ordenId, $items, $usuarioId) {
        return $this->repo->recepcionarOrden($ordenId, $items, $usuarioId);
    }
}