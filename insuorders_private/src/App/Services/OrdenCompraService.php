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
        // Usa el método completo del repo para traer cabecera + detalles
        return $this->repo->getOrdenCompleta($id);
    }

    public function crearOrden($data, $usuarioId) {
        if (empty($data['items'])) throw new \Exception("La orden está vacía.");
        if (empty($data['proveedor_id'])) throw new \Exception("Falta el proveedor.");

        // 1. Procesar Ítems
        $itemsProcesados = [];
        $montoNeto = 0;

        foreach ($data['items'] as $item) {
            $insumoId = null;

            // Si tiene ID, es producto existente
            if (!empty($item['id'])) {
                $insumoId = $item['id'];
            } 
            // Si no, es NUEVO -> Crear en Inventario
            else {
                // Generar SKU temporal o incremental
                $skuTemp = 'NEW-' . strtoupper(substr($item['nombre'], 0, 3)) . rand(1000,9999);
                
                $nuevoInsumo = [
                    'codigo_sku' => $skuTemp,
                    'nombre' => $item['nombre'],
                    'descripcion' => 'Ingresado desde Compras',
                    'categoria_id' => $item['categoria_id'],
                    'ubicacion_id' => 1, // Ubicación por defecto (Bodega General)
                    'stock_actual' => 0,
                    'stock_minimo' => 0,
                    'precio_costo' => $item['precio'],
                    'moneda' => $data['moneda'] ?? 'CLP', // Guardamos la moneda base
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
        }

        // 2. Cálculos Finales
        $moneda = $data['moneda'] ?? 'CLP';
        $tipoCambio = $data['tipo_cambio'] ?? 1;
        $numeroCotizacion = $data['numero_cotizacion'] ?? null;
        
        $iva = $montoNeto * 0.19; // IVA Chile
        $total = $montoNeto + $iva;

        // 3. Guardar Orden (Cabecera)
        $ordenId = $this->repo->create([
            'proveedor_id' => $data['proveedor_id'],
            'usuario_id' => $usuarioId,
            'neto' => $montoNeto,
            'impuesto' => $iva,
            'total' => $total,
            'moneda' => $moneda,
            'tipo_cambio' => $tipoCambio,
            'numero_cotizacion' => $numeroCotizacion
        ]);

        // 4. Guardar Detalles
        foreach ($itemsProcesados as $item) {
            $this->repo->addDetalle(array_merge($item, ['orden_id' => $ordenId]));
        }

        return $ordenId;
    }

    public function generarPDF($ordenId) {
        // Obtener la orden completa con todos los datos enriquecidos (proveedor, usuario, etc.)
        $data = $this->repo->getOrdenCompleta($ordenId);
        
        if (!$data || !$data['cabecera']) {
            throw new \Exception("Orden #$ordenId no encontrada.");
        }

        $pdf = new PDFService();
        $pdf->setOrdenData($data['cabecera']);
        return $pdf->generarPDF($data['detalles']);
    }

    public function adjuntarArchivo($id, $url) {
        return $this->repo->updateArchivo($id, $url);
    }
}