<?php
require_once __DIR__ . '/../../insuorders_private/src/core/init.php';

use App\Controllers\AuthController;
use App\Controllers\ProveedorController;
use App\Controllers\InsumoController;
use App\Controllers\OrdenCompraController;
use App\Controllers\PersonalController;

// ============================================================================
// 1. DETECCIÓN DE RUTA (Lógica Blindada para Windows/XAMPP)
// ============================================================================

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$scriptName = $_SERVER['SCRIPT_NAME'];
$baseDir = dirname($scriptName);

$baseDir = str_replace('\\', '/', $baseDir);

if ($baseDir !== '/' && strpos($requestUri, $baseDir) === 0) {
    $path = substr($requestUri, strlen($baseDir));
} else {
    $path = $requestUri;
}

$path = str_replace('/index.php', '', $path);

$path = trim($path, '/');

if ($path === '')
    $path = 'test';

// ============================================================================
// 2. ENRUTAMIENTO
// ============================================================================

switch ($path) {
    // --- AUTENTICACIÓN ---
    case 'login':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/AuthController.php';
        $controller = new AuthController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->login();
        else
            jsonResponse(405, ["error" => "Método no permitido"]);
        break;

    case 'test':
        echo json_encode(["message" => "API Online 🚀", "ruta_detectada" => $path]);
        break;

    // --- PROVEEDORES ---
    case 'proveedores':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/ProveedorController.php';
        $controller = new ProveedorController();
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET')
            $controller->index();
        elseif ($method === 'POST')
            $controller->store();
        elseif ($method === 'PUT')
            $controller->update();
        elseif ($method === 'DELETE')
            $controller->delete();
        else
            jsonResponse(405, ["error" => "Método no permitido"]);
        break;

    case 'proveedores/auxiliares':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/ProveedorController.php';
        $controller = new ProveedorController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->auxiliares();
        break;

    // --- INVENTARIO ---
    case 'inventario':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/InsumoController.php';
        $controller = new InsumoController();
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET')
            $controller->index();
        elseif ($method === 'POST')
            $controller->store();
        elseif ($method === 'DELETE')
            $controller->delete();
        else
            jsonResponse(405, ["error" => "Método no permitido"]);
        break;

    case 'inventario/auxiliares':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/InsumoController.php';
        $controller = new InsumoController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->auxiliares();
        break;

    case 'inventario/ajuste':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/InsumoController.php';
        $controller = new InsumoController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->ajustar();
        else
            jsonResponse(405, ["error" => "Método no permitido"]);
        break;

    // --- PERSONAL ---
    case 'personal':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/PersonalController.php';
        $controller = new PersonalController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->index();
        break;

    // --- COMPRAS ---
    case 'compras':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/OrdenCompraController.php';
        $controller = new OrdenCompraController();

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (isset($_GET['id']))
                $controller->show();
            else
                $controller->index();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->store();
        } else {
            jsonResponse(405, ["error" => "Método no permitido"]);
        }
        break;

    case 'compras/upload':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/OrdenCompraController.php';
        $controller = new OrdenCompraController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->uploadFile();
        else
            jsonResponse(405, ["error" => "Método no permitido"]);
        break;

    case 'compras/pdf':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/OrdenCompraController.php';
        $controller = new OrdenCompraController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->downloadPdf();
        else
            jsonResponse(405, ["error" => "Método no permitido"]);
        break;

    // --- DEFAULT ---
    default:
        jsonResponse(404, [
            "error" => "Ruta no encontrada",
            "path_recibido" => $path,
            "solucion" => "Verifica que la URL coincida con un case en el switch"
        ]);
        break;
}

// Función Helper para responder JSON limpio
function jsonResponse($code, $data)
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}