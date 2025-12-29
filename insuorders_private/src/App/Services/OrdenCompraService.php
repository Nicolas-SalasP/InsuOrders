<?php
namespace App\Services;

use App\Repositories\OrdenCompraRepository;
use App\Repositories\InsumoRepository;
use App\Repositories\ProveedorRepository;
use App\Services\PDFService;
use App\Database\Database;

class OrdenCompraService
{
    private $repo;
    private $insumoRepo;
    private $proveedorRepo;
    private $db;

    public function __construct()
    {
        $this->repo = new OrdenCompraRepository();
        $this->insumoRepo = new InsumoRepository();
        $this->proveedorRepo = new ProveedorRepository();
        $this->db = Database::getConnection();
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

        foreach ($data['items'] as $item) {
            $insumoId = $item['id'] ?? null;

            if (!$insumoId) {
                $nuevoInsumo = [
                    'codigo_sku' => null,
                    'nombre' => $item['nombre'],
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
        }

        $porcIVA = isset($data['impuesto_porcentaje']) ? floatval($data['impuesto_porcentaje']) : 19.0;
        $iva = $montoNeto * ($porcIVA / 100);

        $datosCabecera = [
            'proveedor_id' => $data['proveedor_id'],
            'usuario_id' => $usuarioId,
            'neto' => $montoNeto,
            'impuesto' => $iva,
            'total' => $montoNeto + $iva,
            'moneda' => $data['moneda'] ?? 'CLP'
        ];

        $ordenId = $this->repo->create($datosCabecera);

        foreach ($itemsProcesados as $item) {
            $item['orden_id'] = $ordenId;
            $this->repo->addDetalle($item);
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
        $pdf = new PDFService();
        $pdf->setOrdenData($data['cabecera']);
        return $pdf->generarPDF($data['detalles']);
    }

    public function subirArchivo($id, $file)
    {
        $uploadDir = realpath(__DIR__ . '/../../../../public_html/api') . '/uploads/ordenes/';
        
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = "OC_" . $id . "_" . time() . "." . $ext;
        $targetPath = $uploadDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $urlPath = "uploads/ordenes/" . $fileName;
            
            $stmt = $this->db->prepare("UPDATE ordenes_compra SET url_archivo = ? WHERE id = ?");
            $stmt->execute([$urlPath, $id]);
            
            return "/" . $urlPath;
        } else {
            throw new \Exception("No se pudo mover el archivo. Carpeta: " . $uploadDir);
        }
    }
}