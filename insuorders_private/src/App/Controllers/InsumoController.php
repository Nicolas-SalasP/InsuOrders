<?php
namespace App\Controllers;

use App\Services\InsumoService;
use App\Middleware\AuthMiddleware;

class InsumoController
{
    private $service;

    public function __construct()
    {
        $this->service = new InsumoService();
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

    public function store()
    {
        $data = $_POST;

        try {
            $data['imagen_url'] = $this->procesarImagen();

            $id = $this->service->crearInsumo($data);
            echo json_encode(["success" => true, "message" => "Insumo creado correctamente", "id" => $id]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function update()
    {
        // 1. Detectar el ID (puede venir en POST o GET)
        $id = $_POST['id'] ?? $_GET['id'] ?? null;

        if (!$id) {
            jsonResponse(400, ["error" => "No se especificó el ID para editar."]);
            return;
        }

        // 2. Recoger TODOS los datos del formulario (incluyendo el stock)
        $data = [
            'codigo_sku'    => $_POST['codigo_sku'] ?? null,
            'nombre'        => $_POST['nombre'] ?? null,
            'descripcion'   => $_POST['descripcion'] ?? '',
            'categoria_id'  => $_POST['categoria_id'] ?? null,
            'ubicacion_id'  => $_POST['ubicacion_id'] ?? null,
            
            // --- ¡ESTA ES LA LÍNEA CLAVE QUE SEGURAMENTE TE FALTA! ---
            'stock_actual'  => $_POST['stock_actual'] ?? 0, 
            // ---------------------------------------------------------
            
            'stock_minimo'  => $_POST['stock_minimo'] ?? 0,
            'precio_costo'  => $_POST['precio_costo'] ?? 0,
            'moneda'        => $_POST['moneda'] ?? 'CLP',
            'unidad_medida' => $_POST['unidad_medida'] ?? 'UN'
        ];

        // 3. Procesar Imagen (si se subió una nueva)
        if (!empty($_FILES['imagen']['name'])) {
            $targetDir = __DIR__ . '/../../../../public_html/uploads/insumos/';
            if (!is_dir($targetDir)) mkdir($targetDir, 0777, true);

            $ext = pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
            $fileName = 'prod_' . $id . '_' . time() . '.' . $ext;
            
            if (move_uploaded_file($_FILES['imagen']['tmp_name'], $targetDir . $fileName)) {
                $data['imagen_url'] = '/uploads/insumos/' . $fileName;
            }
        }

        // 4. Llamar al Repositorio
        try {
            // Asegúrate de que tu clase tenga: private $repository; en el constructor
            $this->repository = new InsumoRepository();
            $resultado = $this->repository->update($id, $data);

            if ($resultado) {
                jsonResponse(200, ["success" => true, "message" => "Actualizado correctamente"]);
            } else {
                jsonResponse(500, ["error" => "No se realizaron cambios en la base de datos"]);
            }
        } catch (\Exception $e) {
            jsonResponse(500, ["error" => "Error interno: " . $e->getMessage()]);
        }
    }

    public function ajustar()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['insumo_id']) || !isset($data['cantidad'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos obligatorios"]);
            return;
        }

        try {
            $usuarioId = AuthMiddleware::verify();

            $this->service->gestionarStock($data, $usuarioId);

            echo json_encode(["success" => true, "message" => "Movimiento registrado correctamente"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function delete()
    {
        $id = $_GET['id'] ?? null;
        try {
            if ($this->service->eliminarInsumo($id)) {
                echo json_encode(["success" => true, "message" => "Insumo eliminado"]);
            } else {
                throw new \Exception("No se pudo eliminar el insumo");
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}