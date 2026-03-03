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

    private $uploadBaseDir;
    private $publicUrlBase;

    public function __construct()
    {
        $this->repo = new OrdenCompraRepository();
        $this->insumoRepo = new InsumoRepository();
        $this->proveedorRepo = new ProveedorRepository();
        $this->db = Database::getConnection();
        $this->uploadBaseDir = __DIR__ . '/../../../../public_html/uploads/ordenes/';
        $this->publicUrlBase = 'uploads/ordenes/';
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
        return [
            'insumos' => $this->repo->getInsumosHistorial(),
            'proveedores' => $this->proveedorRepo->getAll()
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
            if (!$this->db->inTransaction()) {
                $this->db->beginTransaction();
            }

            $itemsProcesados = [];
            $montoNeto = 0;
            $idsSolicitudes = [];

            $fuentes = ['ids_solicitudes', 'ids_solicitudes_seleccionadas'];
            foreach ($fuentes as $key) {
                if (!empty($data[$key])) {
                    $vals = is_array($data[$key]) ? $data[$key] : explode(',', $data[$key]);
                    $idsSolicitudes = array_merge($idsSolicitudes, $vals);
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
                    $ids = is_array($item['ids_detalle_solicitud']) ? $item['ids_detalle_solicitud'] : explode(',', $item['ids_detalle_solicitud']);
                    $idsSolicitudes = array_merge($idsSolicitudes, $ids);
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
                'impuesto_porcentaje' => $porcIVA,
                'destino' => $data['destino'] ?? null
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

            if ($this->db->inTransaction()) {
                $this->db->commit();
            }
            
            return $ordenId;

        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
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
        if (!$data || !$data['cabecera'])
            throw new Exception("Orden no encontrada");

        $pdf = new PDFService();
        $pdf->setOrdenData($data['cabecera']);
        return $pdf->generarPDF($data['detalles']);
    }

    public function subirArchivo($id, $file)
    {
        if (!is_dir($this->uploadBaseDir)) {
            mkdir($this->uploadBaseDir, 0777, true);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = "OC_" . $id . "_" . time() . "." . $ext;
        $targetPath = $this->uploadBaseDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $urlPath = $this->publicUrlBase . $fileName;
            $this->repo->updateArchivo($id, $urlPath);
            return "/" . $urlPath;
        } else {
            throw new Exception("No se pudo mover el archivo al servidor.");
        }
    }

    public function cancelarOrden($id)
    {
        $orden = $this->repo->getById($id);
        if (!$orden)
            throw new Exception("Orden no encontrada.");

        $estadoActual = $orden['cabecera']['estado_id'];
        if ($estadoActual >= 3) {
            throw new Exception("No se puede cancelar la orden porque ya tiene recepciones o está finalizada.");
        }

        return $this->repo->cancelar($id);
    }

    public function regenerarDocumentoPdf($id)
    {
        $orden = $this->repo->getOrdenCompleta($id);
        if (!$orden || !$orden['cabecera'])
            throw new Exception("La orden de compra #$id no existe.");

        $pdfService = new PDFService();
        $pdfService->setOrdenData($orden['cabecera']);
        $pdfContent = $pdfService->generarPDF($orden['detalles']);

        if (!is_dir($this->uploadBaseDir)) {
            if (!mkdir($this->uploadBaseDir, 0777, true)) {
                throw new Exception("No se pudo crear el directorio de uploads.");
            }
        }

        $fileName = 'OC_' . $id . '_' . time() . '.pdf';
        $filePath = $this->uploadBaseDir . $fileName;

        if (file_put_contents($filePath, $pdfContent) === false) {
            throw new Exception("Error al escribir el archivo PDF en el disco.");
        }

        $relativePath = $this->publicUrlBase . $fileName;
        $this->repo->update($id, ['url_archivo' => $relativePath]);

        return $relativePath;
    }

    public function omitirPendientes($idsString)
    {
        if (empty($idsString)) throw new Exception("No se seleccionaron ítems.");
        
        $ids = explode(',', $idsString);
        $ids = array_filter($ids, 'is_numeric');

        if (empty($ids)) return false;
        $datosNotificacion = $this->repo->obtenerDatosParaNotificar($ids);

        $resultado = $this->repo->archivarSolicitudesPendientes($ids);

        if ($resultado && !empty($datosNotificacion)) {
            $notifRepo = new \App\Repositories\NotificationRepository();
            
            foreach ($datosNotificacion as $dato) {
                $mensaje = "Gestión de Compras: El insumo '{$dato['nombre_insumo']}' para la OT #{$dato['ot_id']} ha sido marcado como 'No Comprar' (Omitido).";
                $notifRepo->create(
                    $dato['usuario_id'], 
                    'Insumo Omitido', 
                    $mensaje, 
                    '/mis-mantenciones',
                    'high'
                );
            }
        }
        
        return $resultado;
    }
}