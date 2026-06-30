<?php
namespace App\Controllers;
use App\Utils\ErrorHelper;

use App\Services\InsumoService;
use App\Repositories\OperarioRepository;
use App\Services\PDFService;
use App\Middleware\AuthMiddleware;
use App\Utils\FileUpload;
use Exception;

class InsumoController
{
    private $service;
    private $operarioRepo;

    public function __construct()
    {
        $this->service = new InsumoService();
        $this->operarioRepo = new OperarioRepository();
    }

    public function index()
    {
        echo json_encode(["success" => true, "data" => $this->service->listarTodo()]);
    }

    public function auxiliares()
    {
        echo json_encode(["success" => true, "data" => $this->service->obtenerAuxiliares()]);
    }

    private function procesarImagen()
    {
        if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] === UPLOAD_ERR_NO_FILE) {
            return null;
        }
        if ($_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Error al recibir el archivo de imagen (código: ' . $_FILES['imagen']['error'] . ').');
        }
        $uploadDir = rtrim($_SERVER['DOCUMENT_ROOT'], '/') . '/uploads/insumos/';
        $filename = FileUpload::guardar($_FILES['imagen'], $uploadDir, 'imagen', 'insumo');
        return '/uploads/insumos/' . $filename;
    }

    private function limpiarDato($valor, $tipo = 'string')
    {
        if ($valor === '' || $valor === 'null' || $valor === null) {
            return null;
        }
        if ($tipo === 'int')
            return (int) $valor;
        if ($tipo === 'float')
            return (float) $valor;
        return trim($valor);
    }

    public function store()
    {
        $data = [
            'codigo_sku' => $_POST['codigo_sku'] ?? null,
            'nombre' => $_POST['nombre'] ?? null,
            'descripcion' => $_POST['descripcion'] ?? '',
            'categoria_id' => !empty($_POST['categoria_id']) ? $_POST['categoria_id'] : null,
            'ubicacion_id' => !empty($_POST['ubicacion_id']) ? $_POST['ubicacion_id'] : null,
            'stock_actual' => $this->limpiarDato($_POST['stock_actual'] ?? 0, 'float') ?? 0,
            'stock_minimo' => $this->limpiarDato($_POST['stock_minimo'] ?? 0, 'float') ?? 0,
            'precio_costo' => $this->limpiarDato($_POST['precio_costo'] ?? 0, 'float') ?? 0,
            'moneda' => $_POST['moneda'] ?? 'CLP',
            'unidad_medida' => $_POST['unidad_medida'] ?? 'UN'
        ];

        try {
            $data['imagen_url'] = $this->procesarImagen();

            $id = $this->service->crearInsumo($data);
            echo json_encode(["success" => true, "message" => "Insumo creado correctamente", "id" => $id]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function update()
    {
        $usuarioId = AuthMiddleware::verify();

        $id = $_POST['id'] ?? $_GET['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "No se especificó el ID para editar."]);
            return;
        }

        $data = [
            'codigo_sku' => $_POST['codigo_sku'] ?? null,
            'nombre' => $_POST['nombre'] ?? null,
            'descripcion' => $_POST['descripcion'] ?? '',
            'categoria_id' => !empty($_POST['categoria_id']) ? $_POST['categoria_id'] : null,
            'ubicacion_id' => !empty($_POST['ubicacion_id']) ? $_POST['ubicacion_id'] : null,
            'stock_distribucion' => $_POST['stock_distribucion'] ?? null,
            'stock_actual' => $this->limpiarDato($_POST['stock_actual'] ?? 0, 'float') ?? 0,
            'stock_minimo' => $this->limpiarDato($_POST['stock_minimo'] ?? 0, 'float') ?? 0,
            'precio_costo' => $this->limpiarDato($_POST['precio_costo'] ?? 0, 'float') ?? 0,
            'moneda' => $_POST['moneda'] ?? 'CLP',
            'unidad_medida' => $_POST['unidad_medida'] ?? 'UN'
        ];

        try {
            $nuevaImagen = $this->procesarImagen();
            if ($nuevaImagen) {
                $data['imagen_url'] = $nuevaImagen;
            }

            $resultado = $this->service->actualizarInsumo($id, $data, $usuarioId);

            if ($resultado) {
                echo json_encode(["success" => true, "message" => "Actualizado correctamente"]);
            } else {
                echo json_encode(["success" => true, "message" => "Datos procesados correctamente"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error interno: " . ErrorHelper::safeMessage($e)]);
        }
    }

    public function ajustar($uid = null)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $usuarioId = $uid ?? AuthMiddleware::verify();

        if (!isset($data['insumo_id']) || !isset($data['cantidad'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos obligatorios"]);
            return;
        }

        try {
            $ubicacionEnvioId = !empty($data['ubicacion_envio_id']) ? $data['ubicacion_envio_id'] : null;

            if (!empty($data['empleado_id'])) {
                $obs = $data['observacion'] ?? $data['motivo'] ?? 'Entrega operario';
                
                $datos = [
                    'insumo_id' => (int) $data['insumo_id'],
                    'cantidad' => abs((float) $data['cantidad']),
                    'empleado_id' => (int) $data['empleado_id'],
                    'observacion' => $obs,
                    'bodeguero_id' => $usuarioId,
                    'ubicacion_envio_id' => $ubicacionEnvioId
                ];
                $this->operarioRepo->asignarInsumo($datos);
            } else {
                $cantidadOriginal = (float) $data['cantidad'];
                if (isset($data['tipo_movimiento_id'])) {
                    $tipoMovimiento = (int) $data['tipo_movimiento_id'];
                } else {
                    $tipoMovimiento = ($cantidadOriginal >= 0) ? 3 : 4;
                }

                $datosAjuste = [
                    'insumo_id' => (int) $data['insumo_id'],
                    'cantidad' => abs($cantidadOriginal),
                    'tipo_movimiento_id' => $tipoMovimiento,
                    'observacion' => $data['observacion'] ?? $data['motivo'] ?? 'Ajuste manual',
                    'usuario_id' => $usuarioId,
                    'empleado_id' => null,
                    'ubicacion_id' => null,
                    'ubicacion_envio_id' => $ubicacionEnvioId
                ];

                $this->service->gestionarStock($datosAjuste, $usuarioId);
            }

            echo json_encode(["success" => true, "message" => "Operación registrada exitosamente"]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al procesar: " . ErrorHelper::safeMessage($e)]);
        }
    }

    public function delete()
    {
        $id = $_GET['id'] ?? null;
        try {
            if ($this->service->eliminarInsumo($id)) {
                echo json_encode(["success" => true, "message" => "Insumo eliminado"]);
            } else {
                throw new Exception("No se pudo eliminar el insumo");
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function nextSku()
    {
        AuthMiddleware::verify(); 

        try {
            $sku = $this->service->getNextSku();
            echo json_encode(['success' => true, 'sku' => $sku]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => ErrorHelper::safeMessage($e)]);
        }
    }

    public function getOTsActivas()
    {
        try {
            AuthMiddleware::verify();
            $data = $this->service->obtenerOTsParaSalida();
            echo json_encode(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function salidaManual()
    {
        try {
            $userId = AuthMiddleware::verify();
            
            $inputJSON = file_get_contents("php://input");
            $data = json_decode($inputJSON, true);

            if (!$data) {
                throw new Exception("Datos inválidos (JSON incorrecto).");
            }
            $movimientosIds = $this->service->registrarSalida($data, $userId);

            echo json_encode([
                "success" => true, 
                "message" => "Salida registrada correctamente.",
                "ids" => $movimientosIds
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => ErrorHelper::safeMessage($e)]);
        }
    }

    public function comprobanteEntrega()
    {
        $ids = $_GET['ids'] ?? '';
        
        try {
            $datos = $this->service->obtenerDatosComprobante($ids);

            if (empty($datos)) {
                die("No se encontraron datos para el comprobante.");
            }

            $pdf = new PDFService();
            $pdf->setOrdenData(['id' => 'V-' . date('Hi'), 'proveedor' => 'INTERNO']); 
            
            $content = $pdf->generarComprobanteEntrega($datos);
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="Comprobante_' . time() . '.pdf"');
            echo $content;

        } catch (Exception $e) {
            die("Error generando PDF: " . ErrorHelper::safeMessage($e));
        }
    }
}