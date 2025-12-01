<?php
// Cargar el núcleo del sistema
require_once __DIR__ . '/../../insuorders_private/src/core/init.php';

use App\Controllers\AuthController;
use App\Controllers\ProveedorController;
use App\Controllers\InsumoController;
use App\Controllers\OrdenCompraController;
use App\Controllers\PersonalController;
use App\Controllers\MantencionController; // Asegurar que este import esté

// ============================================================================
// 1. DETECCIÓN DE RUTA (Lógica Blindada)
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

// Helper
function jsonResponse($code, $data)
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

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
        echo json_encode(["message" => "API Online 🚀", "ruta" => $path]);
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
        break;

    // --- MANTENCIÓN ---
    case 'mantencion':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/MantencionController.php';
        $controller = new MantencionController();
        $method = $_SERVER['REQUEST_METHOD'];
        if ($method === 'GET') {
            if (isset($_GET['detalle']))
                $controller->detalles();
            else
                $controller->index();
        } elseif ($method === 'POST')
            $controller->store();
        elseif ($method === 'PUT')
            $controller->update();
        elseif ($method === 'DELETE')
            $controller->delete();
        break;

    case 'mantencion/activos':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/MantencionController.php';
        $controller = new MantencionController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->activos();
        break;

    case 'mantencion/kit':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/MantencionController.php';
        $controller = new MantencionController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->getKit();
        elseif ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->saveKit();
        break;

    case 'mantencion/docs':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/MantencionController.php';
        $controller = new MantencionController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->listDocs();
        elseif ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->uploadDoc();
        break;

    case 'mantencion/crear-activo':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/MantencionController.php';
        $controller = new MantencionController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->storeActivo();
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
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET') {
            if (isset($_GET['id']))
                $controller->show();
            else
                $controller->index();
        } elseif ($method === 'POST') {
            $controller->store();
        }
        break;

    case 'compras/pdf':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/OrdenCompraController.php';
        $controller = new OrdenCompraController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->downloadPdf();
        break;

    case 'compras/upload':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/OrdenCompraController.php';
        $controller = new OrdenCompraController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->uploadFile();
        break;

    case 'compras/pendientes':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/OrdenCompraController.php';
        $controller = new OrdenCompraController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->pendientes();
        break;

    // --- NOTIFICACIONES  ---
    case 'notifications':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/NotificationController.php';
        $controller = new \App\Controllers\NotificationController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET') $controller->index();
        break;

    // --- BODEGA  ---
    case 'bodega/pendientes':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/BodegaController.php';
        $controller = new \App\Controllers\BodegaController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET') $controller->pendientes();
        break;
        
    case 'bodega/entregar':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/BodegaController.php';
        $controller = new \App\Controllers\BodegaController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $controller->entregar();
        break;

    // --- DEFAULT ---
    default:
        jsonResponse(404, ["error" => "Ruta no encontrada: $path"]);
        break;
}