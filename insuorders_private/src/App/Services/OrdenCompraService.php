<?php
namespace App\Services;

use App\Repositories\OrdenCompraRepository;
use App\Repositories\InsumoRepository;
use App\Repositories\ProveedorRepository;
use App\Services\PDFService;

class OrdenCompraService
{
    private $repo;
    private $insumoRepo;
    private $proveedorRepo;

    public function __construct()
    {
        $this->repo = new OrdenCompraRepository();
        $this->insumoRepo = new InsumoRepository();
        $this->proveedorRepo = new ProveedorRepository();
    }

    public function listarOrdenes($filtros)
    {
        return $this->repo->getAll($filtros);
    }

    public function obtenerAlertasCompra()
    {
        return $this->repo->getPendientesMantencion();
    }

    public function obtenerDatosFiltros()
    {
        $insumos = $this->repo->getInsumosHistorial();

        $proveedores = $this->proveedorRepo->getAll();

        return [
            'insumos' => $insumos,
            'proveedores' => $proveedores
        ];
    }

    public function obtenerDetalleOrden($id)
    {
        return $this->repo->getOrdenCompleta($id);
    }

    public function crearOrden($data, $usuarioId)
    {
        if (empty($data['items']))
            throw new \Exception("La orden debe tener items.");
        if (empty($data['proveedor_id']))
            throw new \Exception("Seleccione un proveedor.");

        $itemsProcesados = [];
        $montoNeto = 0;
        $idsOrigenGlobales = [];

        foreach ($data['items'] as $item) {
            $insumoId = $item['id'] ?? null;

            if (!$insumoId) {
                $nuevoInsumo = [
                    'codigo_sku' => null,
                    'nombre' => $item['nombre'],
                    'descripcion' => 'Creado desde OC',
                    'categoria_id' => 1,
                    'stock_actual' => 0,
                    'stock_minimo' => 0,
                    'precio_costo' => $item['precio'],
                    'unidad_medida' => $item['unidad'] ?? 'UN'
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

            if (!empty($item['ids_detalle_solicitud'])) {
                $idsRaw = $item['ids_detalle_solicitud'];
                if (is_string($idsRaw))
                    $idsRaw = explode(',', $idsRaw);
                $idsOrigenGlobales = array_merge($idsOrigenGlobales, $idsRaw);
            }
        }

        $porcentajeIVA = isset($data['impuesto_porcentaje']) ? floatval($data['impuesto_porcentaje']) : 19.0;
        $iva = $montoNeto * ($porcentajeIVA / 100);
        $total = $montoNeto + $iva;

        $datosCabecera = [
            'proveedor_id' => $data['proveedor_id'],
            'usuario_id' => $usuarioId,
            'neto' => $montoNeto,
            'impuesto' => $iva,
            'total' => $total,
            'moneda' => $data['moneda'] ?? 'CLP',
            'tipo_cambio' => $data['tipo_cambio'] ?? 1,
            'numero_cotizacion' => $data['numero_cotizacion'] ?? null,
            'impuesto_porcentaje' => $porcentajeIVA
        ];

        $ordenId = $this->repo->create($datosCabecera);

        foreach ($itemsProcesados as $item) {
            $item['orden_id'] = $ordenId;
            $this->repo->addDetalle($item);
        }

        if (!empty($idsOrigenGlobales)) {
            $this->repo->asociarSolicitudesAOrden($ordenId, array_unique($idsOrigenGlobales));
        }

        return $ordenId;
    }

    public function recepcionarOrden($ordenId, $items, $usuarioId)
    {
        return $this->repo->recepcionarOrden($ordenId, $items, $usuarioId);
    }

    public function generarPDF($ordenId)
    {
        $data = $this->repo->getOrdenCompleta($ordenId);
        if (!$data)
            throw new \Exception("Orden no encontrada");

        $pdf = new PDFService();
        $pdf->setOrdenData($data['cabecera']);
        return $pdf->generarPDF($data['detalles']);
    }

    public function subirArchivo($ordenId, $file)
    {
        $uploadDir = __DIR__ . '/../../../../public_html/uploads/ordenes/';
        if (!is_dir($uploadDir))
            mkdir($uploadDir, 0777, true);

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = "OC_{$ordenId}_" . time() . ".{$ext}";

        if (move_uploaded_file($file['tmp_name'], $uploadDir . $fileName)) {
            $url = "/uploads/ordenes/" . $fileName;
            $this->repo->updateArchivo($ordenId, $url);
            return $url;
        }
        throw new \Exception("Error al mover el archivo al servidor.");
    }
}