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

    // Procesamiento de imagen centralizado
    private function procesarImagen()
    {
        if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] === UPLOAD_ERR_NO_FILE) {
            return null;
        }

        if ($_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
            throw new \Exception("Error subida imagen: Código " . $_FILES['imagen']['error']);
        }

        $fileName = $_FILES['imagen']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowed = ['jpg', 'gif', 'png', 'jpeg', 'webp'];

        if (!in_array($fileExtension, $allowed)) {
            throw new \Exception("Formato no permitido: $fileExtension");
        }

        // Ruta absoluta ajustada
        $uploadFileDir = __DIR__ . '/../../../../public_html/uploads/insumos/';
        if (!is_dir($uploadFileDir))
            mkdir($uploadFileDir, 0777, true);

        $newFileName = md5(time() . $fileName) . '.' . $fileExtension;

        if (move_uploaded_file($_FILES['imagen']['tmp_name'], $uploadFileDir . $newFileName)) {
            return '/uploads/insumos/' . $newFileName;
        }

        throw new \Exception("No se pudo mover la imagen al directorio final.");
    }

    public function store()
    {
        try {
            if (empty($_POST))
                throw new \Exception("No se recibieron datos (POST vacío).");

            $data = $_POST;
            // Procesar imagen
            $img = $this->procesarImagen();
            if ($img)
                $data['imagen_url'] = $img;

            $id = $this->service->crearInsumo($data);
            echo json_encode(["success" => true, "message" => "Insumo creado", "id" => $id]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function update()
    {
        try {
            $id = $_POST['id'] ?? null;
            if (!$id)
                throw new \Exception("Falta el ID para actualizar.");

            // Recoger datos forzando enteros
            $data = [
                'codigo_sku' => $_POST['codigo_sku'] ?? '',
                'nombre' => $_POST['nombre'] ?? '',
                'descripcion' => $_POST['descripcion'] ?? '',
                'categoria_id' => $_POST['categoria_id'] ?? null,
                'ubicacion_id' => $_POST['ubicacion_id'] ?? null,
                'stock_actual' => (int) ($_POST['stock_actual'] ?? 0),
                'stock_minimo' => (int) ($_POST['stock_minimo'] ?? 0),
                'precio_costo' => (int) ($_POST['precio_costo'] ?? 0),
                'moneda' => $_POST['moneda'] ?? 'CLP',
                'unidad_medida' => $_POST['unidad_medida'] ?? 'UN'
            ];

            // Procesar imagen nueva si existe
            $nuevaImagen = $this->procesarImagen();
            if ($nuevaImagen) {
                $data['imagen_url'] = $nuevaImagen;
            }

            // Llamar al servicio
            $this->service->actualizarInsumo($id, $data);

            echo json_encode(["success" => true, "message" => "Actualizado correctamente"]);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al actualizar: " . $e->getMessage()]);
        }
    }

    public function ajustar()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['insumo_id'], $data['cantidad'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos"]);
            return;
        }
        $data['cantidad'] = (int) $data['cantidad'];

        try {
            $uid = AuthMiddleware::verify();
            $this->service->gestionarStock($data, $uid);
            echo json_encode(["success" => true, "message" => "Movimiento registrado"]);
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
                echo json_encode(["success" => true, "message" => "Eliminado"]);
            } else {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "No se puede eliminar (tiene historial)"]);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}