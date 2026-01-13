<?php
namespace App\Services;

use App\Repositories\OrdenCompraRepository;
use App\Repositories\InsumoRepository;
use App\Repositories\ProveedorRepository;
use App\Services\PDFService;
use App\Database\Database;
use Exception;
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
            throw new Exception("La orden debe tener items.");
        if (empty($data['proveedor_id']))
            throw new Exception("Seleccione un proveedor.");

        try {
            $this->db->beginTransaction();

            $itemsProcesados = [];
            $montoNeto = 0;
            $idsSolicitudes = [];

            if (!empty($data['ids_solicitudes'])) {
                if (is_array($data['ids_solicitudes'])) {
                    $idsSolicitudes = array_merge($idsSolicitudes, $data['ids_solicitudes']);
                } else {
                    $idsSolicitudes = array_merge($idsSolicitudes, explode(',', $data['ids_solicitudes']));
                }
            }
            if (!empty($data['ids_solicitudes_seleccionadas'])) {
                if (is_array($data['ids_solicitudes_seleccionadas'])) {
                    $idsSolicitudes = array_merge($idsSolicitudes, $data['ids_solicitudes_seleccionadas']);
                } else {
                    $idsSolicitudes = array_merge($idsSolicitudes, explode(',', $data['ids_solicitudes_seleccionadas']));
                }
            }

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

                if (!empty($item['ids_detalle_solicitud'])) {
                    if (is_array($item['ids_detalle_solicitud'])) {
                        $idsSolicitudes = array_merge($idsSolicitudes, $item['ids_detalle_solicitud']);
                    } else {
                        $ids = explode(',', $item['ids_detalle_solicitud']);
                        $idsSolicitudes = array_merge($idsSolicitudes, $ids);
                    }
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
                'moneda' => $data['moneda'] ?? 'CLP',
                'tipo_cambio' => $data['tipo_cambio'] ?? 1,
                'numero_cotizacion' => $data['numero_cotizacion'] ?? null,
                'impuesto_porcentaje' => $porcIVA
            ];

            $ordenId = $this->repo->create($datosCabecera);

            foreach ($itemsProcesados as $item) {
                $item['orden_id'] = $ordenId;
                $this->repo->addDetalle($item);
            }

            if (!empty($idsSolicitudes)) {
                $idsUnicos = array_unique(array_filter($idsSolicitudes));
                $this->repo->asociarSolicitudesAOrden($ordenId, $idsUnicos);
            }

            $this->db->commit();
            return $ordenId;

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
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
            $this->repo->updateArchivo($id, $urlPath);
            return "/" . $urlPath;
        } else {
            throw new Exception("No se pudo mover el archivo. Carpeta: " . $uploadDir);
        }
    }

    public function cancelarOrden($id)
    {
        $orden = $this->repo->getById($id);

        if (!$orden) {
            throw new Exception("Orden no encontrada.");
        }

        $estadoActual = $orden['cabecera']['estado_id'];

        if ($estadoActual >= 3) {
            throw new Exception("No se puede cancelar la orden porque ya tiene recepciones o está finalizada.");
        }

        return $this->repo->cancelar($id);
    }
}