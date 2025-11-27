<?php
// Cargamos el init
require_once __DIR__ . '/../../insuorders_private/src/core/init.php';

use App\Controllers\AuthController;

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$endpoint = basename($requestUri);

switch ($endpoint) {
    case 'login':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/AuthController.php';
        $controller = new AuthController();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->login();
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Método no permitido. Usa POST."]);
        }
        break;

    case 'test':
        echo json_encode([
            "message" => "API conectada 🚀",
            "endpoint_detectado" => $endpoint
        ]);
        break;

    case 'proveedores/auxiliares':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/ProveedorController.php';
        $controller = new \App\Controllers\ProveedorController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->auxiliares();
        }
        break;

    case 'proveedores':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/ProveedorController.php';
        $controller = new \App\Controllers\ProveedorController();

        $method = $_SERVER['REQUEST_METHOD'];
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (isset($_GET['id'])) {
                $controller->update();
            } else {
                $controller->store();
            }
        }
        if ($method === 'GET') {
            $controller->index();
        } elseif ($method === 'POST') {
            $controller->store();
        } elseif ($method === 'PUT') {
            $controller->update();
        } elseif ($method === 'DELETE') {
            $controller->delete();
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Método no permitido"]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode([
            "error" => "Ruta desconocida",
            "endpoint_buscado" => $endpoint,
            "nota" => "Asegurate de que la URL termine en /login o /test"
        ]);
        break;
}