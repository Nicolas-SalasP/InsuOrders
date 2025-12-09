<?php
// Cargar el núcleo del sistema
require_once __DIR__ . '/../../insuorders_private/src/core/init.php';

use App\Controllers\AuthController;
use App\Controllers\ProveedorController;
use App\Controllers\InsumoController;
use App\Controllers\OrdenCompraController;
use App\Controllers\PersonalController;
use App\Controllers\MantencionController;
use App\Controllers\NotificationController;
use App\Controllers\BodegaController;
use App\Controllers\DashboardController;
use App\Controllers\UsuariosController;
use App\Controllers\ExportController; // Nuevo Controller
use App\Middleware\AuthMiddleware;

// ============================================================================
// 1. DETECCIÓN DE RUTA
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

function jsonResponse($code, $data)
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// ============================================================================
// 2. ENRUTAMIENTO SEGURO
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
        AuthMiddleware::verify(['Compras', 'Mantencion', 'Bodega']);
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
        AuthMiddleware::verify(['Compras', 'Mantencion', 'Bodega']);
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/ProveedorController.php';
        $controller = new ProveedorController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->auxiliares();
        break;

    // --- INVENTARIO ---
    case 'inventario':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            AuthMiddleware::verify();
        } else {
            AuthMiddleware::verify(['Bodega', 'Compras']);
        }
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
        AuthMiddleware::verify();
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/InsumoController.php';
        $controller = new InsumoController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->auxiliares();
        break;

    case 'inventario/ajuste':
        $userId = AuthMiddleware::verify(['Bodega']);
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/InsumoController.php';
        $controller = new InsumoController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->ajustar($userId);
        break;

    // --- MANTENCIÓN ---
    case 'mantencion':
        $method = $_SERVER['REQUEST_METHOD'];
        if ($method === 'GET') {
            AuthMiddleware::verify(['Mantencion', 'Compras', 'Bodega']);
            require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/MantencionController.php';
            $controller = new MantencionController();
            if (isset($_GET['detalle']))
                $controller->detalles();
            else
                $controller->index();
        } else {
            $userId = AuthMiddleware::verify(['Mantencion']);
            require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/MantencionController.php';
            $controller = new MantencionController();
            if ($method === 'POST')
                $controller->store($userId);
            elseif ($method === 'PUT')
                $controller->update();
            elseif ($method === 'DELETE')
                $controller->delete();
        }
        break;

    case 'mantencion/finalizar':
        $userId = AuthMiddleware::verify(['Mantencion']);
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/MantencionController.php';
        $controller = new MantencionController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->finalizar();
        break;

    case 'mantencion/activos':
        AuthMiddleware::verify(['Mantencion', 'Compras', 'Bodega']);
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/MantencionController.php';
        $controller = new MantencionController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->activos();
        break;

    case 'mantencion/kit':
        AuthMiddleware::verify(['Mantencion']);
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/MantencionController.php';
        $controller = new MantencionController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->getKit();
        elseif ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->saveKit();
        break;

    case 'mantencion/docs':
        AuthMiddleware::verify(['Mantencion']);
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/MantencionController.php';
        $controller = new MantencionController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->listDocs();
        elseif ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->uploadDoc();
        break;

    case 'mantencion/crear-activo':
        AuthMiddleware::verify(['Mantencion']);
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/MantencionController.php';
        $controller = new MantencionController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->storeActivo();
        break;

    // --- PERSONAL ---
    case 'personal':
        AuthMiddleware::verify();
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/PersonalController.php';
        $controller = new PersonalController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->index();
        break;

    // --- COMPRAS ---
    case 'compras':
        $method = $_SERVER['REQUEST_METHOD'];
        if ($method === 'GET')
            AuthMiddleware::verify(['Compras', 'Bodega']);
        else
            AuthMiddleware::verify(['Compras']);

        $userId = AuthMiddleware::verify();
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/OrdenCompraController.php';
        $controller = new OrdenCompraController();

        if ($method === 'GET') {
            if (isset($_GET['id']))
                $controller->show();
            else
                $controller->index();
        } elseif ($method === 'POST') {
            $controller->store($userId);
        }
        break;

    case 'compras/recepcionar':
        $userId = AuthMiddleware::verify(['Bodega', 'Compras']);
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/OrdenCompraController.php';
        $controller = new OrdenCompraController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->recepcionar($userId);
        break;

    case 'compras/pdf':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/OrdenCompraController.php';
        $controller = new OrdenCompraController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->downloadPdf();
        break;

    case 'compras/upload':
        AuthMiddleware::verify(['Compras']);
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/OrdenCompraController.php';
        $controller = new OrdenCompraController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->uploadFile();
        break;

    case 'compras/pendientes':
        AuthMiddleware::verify(['Compras']);
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/OrdenCompraController.php';
        $controller = new OrdenCompraController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->pendientes();
        break;

    // --- NOTIFICACIONES ---
    case 'notifications':
        AuthMiddleware::verify();
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/NotificationController.php';
        $controller = new NotificationController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->index();
        break;

    // --- BODEGA ---
    case 'bodega/entregar':
        $userId = AuthMiddleware::verify(['Bodega']);
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/BodegaController.php';
        $controller = new BodegaController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->entregar($userId);
        break;

    case 'bodega/pendientes':
        AuthMiddleware::verify(['Bodega']);
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/BodegaController.php';
        $controller = new BodegaController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->pendientes();
        break;

    case 'bodega/por-organizar':
        AuthMiddleware::verify(['Bodega']);
        (new BodegaController())->porOrganizar();
        break;

    case 'bodega/organizar':
        AuthMiddleware::verify(['Bodega']);
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            (new BodegaController())->organizar();
        break;

    // --- USUARIOS ---
    case 'usuarios':
    case 'usuarios/roles':
    case 'usuarios/toggle':
        AuthMiddleware::verify(['Admin']);
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/UsuariosController.php';
        $controller = new UsuariosController();
        if ($path === 'usuarios') {
            if ($_SERVER['REQUEST_METHOD'] === 'GET')
                $controller->index();
            elseif ($_SERVER['REQUEST_METHOD'] === 'POST')
                $controller->store();
            elseif ($_SERVER['REQUEST_METHOD'] === 'PUT')
                $controller->update();
        } elseif ($path === 'usuarios/roles') {
            $controller->roles();
        } elseif ($path === 'usuarios/toggle') {
            $controller->toggle();
        }
        break;

    // --- DASHBOARD ---
    case 'dashboard':
    case 'dashboard/logs':
        AuthMiddleware::verify(['Admin', 'Compras', 'Mantencion', 'Bodega']);
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/DashboardController.php';
        $controller = new DashboardController();
        if ($path === 'dashboard')
            $controller->index();
        elseif ($path === 'dashboard/logs')
            $controller->logs();
        break;

    // --- EXPORTAR EXCEL (NUEVO) ---
    case 'exportar':
        $m = $_GET['modulo'] ?? '';
        if ($m === 'todo' || $m === 'usuarios')
            AuthMiddleware::verify(['Admin']);
        elseif ($m === 'mantencion' || $m === 'activos')
            AuthMiddleware::verify(['Admin', 'Mantencion']);
        elseif ($m === 'compras' || $m === 'proveedores')
            AuthMiddleware::verify(['Admin', 'Compras']);
        else
            AuthMiddleware::verify();

        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/ExportController.php';
        $controller = new ExportController();
        $controller->exportar($m);
        break;

    default:
        jsonResponse(404, ["error" => "Ruta no encontrada: $path"]);
        break;
}