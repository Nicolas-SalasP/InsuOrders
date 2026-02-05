<?php
namespace App\Controllers;

use App\Services\InsumoService;
use App\Repositories\OperarioRepository;
use App\Middleware\AuthMiddleware;
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
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['imagen']['tmp_name'];
            $fileName = $_FILES['imagen']['name'];
            $fileNameCmps = explode(".", $fileName);
            $fileExtension = strtolower(end($fileNameCmps));

            $allowedfileExtensions = array('jpg', 'gif', 'png', 'jpeg', 'webp');

            if (in_array($fileExtension, $allowedfileExtensions)) {
                $uploadFileDir = __DIR__ . '/../../../../public_html/uploads/insumos/';

                if (!is_dir($uploadFileDir)) {
                    mkdir($uploadFileDir, 0777, true);
                }

                $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
                $dest_path = $uploadFileDir . $newFileName;

                if (move_uploaded_file($fileTmpPath, $dest_path)) {
                    return '/uploads/insumos/' . $newFileName;
                }
            }
        }
        return null;
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
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
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

        $nuevaImagen = $this->procesarImagen();
        if ($nuevaImagen) {
            $data['imagen_url'] = $nuevaImagen;
        }

        try {
            $resultado = $this->service->actualizarInsumo($id, $data, $usuarioId);

            if ($resultado) {
                echo json_encode(["success" => true, "message" => "Actualizado correctamente"]);
            } else {
                echo json_encode(["success" => true, "message" => "Datos procesados correctamente"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error interno: " . $e->getMessage()]);
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
            echo json_encode(["success" => false, "message" => "Error al procesar: " . $e->getMessage()]);
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
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
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
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}