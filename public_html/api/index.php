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
use App\Controllers\ExportController;
use App\Middleware\AuthMiddleware;

// ============================================================================
// 1. DETECCIÓN DE RUTA (ROUTER)
// ============================================================================

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$scriptName = $_SERVER['SCRIPT_NAME'];
$baseDir = dirname($scriptName);
// Normalizar slashes para evitar problemas en Windows/Linux
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
// 2. ENRUTAMIENTO DE MÓDULOS
// ============================================================================

switch ($path) {
    // --- AUTENTICACIÓN ---
    case 'login':
        $controller = new AuthController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->login();
        else
            jsonResponse(405, ["error" => "Método no permitido"]);
        break;

    case 'test':
        echo json_encode(["message" => "API InsuOrders Online 🚀", "ruta" => $path]);
        break;

    // --- PROVEEDORES ---
    case 'proveedores':
        AuthMiddleware::verify(['Compras', 'Mantencion', 'Bodega', 'Admin']);
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
        AuthMiddleware::verify(['Compras', 'Mantencion', 'Bodega', 'Admin']);
        (new ProveedorController())->auxiliares();
        break;

    // --- INVENTARIO (INSUMOS) ---
    case 'inventario':
        // GET permitido para todos los logueados, Modificación solo Bodega/Compras
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            AuthMiddleware::verify();
        else
            AuthMiddleware::verify(['Bodega', 'Compras', 'Admin']);

        $controller = new InsumoController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $controller->index();
        elseif ($_SERVER['REQUEST_METHOD'] === 'POST')
            $controller->store(); // Crea o Edita
        elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE')
            $controller->delete();
        break;

    case 'inventario/auxiliares':
        AuthMiddleware::verify();
        (new InsumoController())->auxiliares();
        break;

    case 'inventario/ajuste':
        $userId = AuthMiddleware::verify(['Bodega', 'Admin']);
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            (new InsumoController())->ajustar($userId);
        break;

    // --- MANTENCIÓN ---
    case 'mantencion':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            AuthMiddleware::verify(['Mantencion', 'Compras', 'Bodega', 'Admin']);
            $controller = new MantencionController();
            // Soporte para ver detalle específico o listado general
            if (isset($_GET['detalle']))
                $controller->detalles();
            else
                $controller->index();
        } else {
            $userId = AuthMiddleware::verify(['Mantencion', 'Admin']);
            $controller = new MantencionController();
            if ($_SERVER['REQUEST_METHOD'] === 'POST')
                $controller->store($userId);
            elseif ($_SERVER['REQUEST_METHOD'] === 'PUT')
                $controller->update();
            elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE')
                $controller->delete(); // Anular
        }
        break;

    case 'mantencion/finalizar':
        AuthMiddleware::verify(['Mantencion', 'Admin']);
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            (new MantencionController())->finalizar();
        break;

    case 'mantencion/activos':
        AuthMiddleware::verify(['Mantencion', 'Compras', 'Bodega', 'Admin']);
        (new MantencionController())->activos();
        break;

    case 'mantencion/crear-activo':
        AuthMiddleware::verify(['Mantencion', 'Admin']);
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            (new MantencionController())->storeActivo();
        break;

    case 'mantencion/centros-costo': // <--- NUEVA RUTA SOLICITADA
        AuthMiddleware::verify(['Mantencion', 'Admin']);
        (new MantencionController())->centrosCosto();
        break;

case 'mantencion/kit':
        AuthMiddleware::verify(['Mantencion', 'Admin']);
        $c = new MantencionController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET') $c->getKit();
        elseif ($_SERVER['REQUEST_METHOD'] === 'POST') $c->saveKit();
        elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') $c->updateKitQty();
        elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') $c->removeKitItem();
        break;

    case 'mantencion/docs':
        AuthMiddleware::verify(['Mantencion', 'Admin']);
        $c = new MantencionController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET') $c->listDocs();
        elseif ($_SERVER['REQUEST_METHOD'] === 'POST') $c->uploadDoc();
        elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') $c->deleteDoc();
        break;

    case 'mantencion/pdf': // <--- RUTA PDF DE CONSUMO
        AuthMiddleware::verify(['Mantencion', 'Bodega', 'Admin']);
        (new MantencionController())->downloadPdf();
        break;

    // --- PERSONAL (Técnicos) ---
    case 'personal':
        AuthMiddleware::verify();
        (new PersonalController())->index();
        break;

    // --- COMPRAS ---
    case 'compras':
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            AuthMiddleware::verify(['Compras', 'Bodega', 'Admin']);
        else
            AuthMiddleware::verify(['Compras', 'Admin']);

        $userId = AuthMiddleware::verify();
        $controller = new OrdenCompraController();

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (isset($_GET['id']))
                $controller->show();
            else
                $controller->index();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->store($userId);
        }
        break;

    case 'compras/recepcionar':
        $userId = AuthMiddleware::verify(['Bodega', 'Compras', 'Admin']);
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            (new OrdenCompraController())->recepcionar($userId);
        break;

    case 'compras/pdf':
        (new OrdenCompraController())->downloadPdf();
        break;

    case 'compras/upload':
        AuthMiddleware::verify(['Compras', 'Admin']);
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            (new OrdenCompraController())->uploadFile();
        break;

    case 'compras/pendientes':
        AuthMiddleware::verify(['Compras', 'Admin']);
        (new OrdenCompraController())->pendientes();
        break;

    // --- BODEGA ---
    case 'bodega/entregar': // Salida de materiales (OT)
        $userId = AuthMiddleware::verify(['Bodega', 'Admin']);
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            (new BodegaController())->entregar($userId);
        break;

    case 'bodega/pendientes': // Lista OTs para retiro
        AuthMiddleware::verify(['Bodega', 'Admin']);
        (new BodegaController())->pendientes();
        break;

    case 'bodega/por-organizar': // Stock flotante (Entrada Compras)
        AuthMiddleware::verify(['Bodega', 'Admin']);
        (new BodegaController())->porOrganizar();
        break;

    case 'bodega/organizar': // Asignar ubicación física
        AuthMiddleware::verify(['Bodega', 'Admin']);
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            (new BodegaController())->organizar();
        break;

    // --- USUARIOS ---
    case 'usuarios':
    case 'usuarios/roles':
    case 'usuarios/toggle':
        AuthMiddleware::verify(['Admin']);
        $c = new UsuariosController();
        if ($path === 'usuarios') {
            if ($_SERVER['REQUEST_METHOD'] === 'GET')
                $c->index();
            elseif ($_SERVER['REQUEST_METHOD'] === 'POST')
                $c->store();
            elseif ($_SERVER['REQUEST_METHOD'] === 'PUT')
                $c->update();
        } elseif ($path === 'usuarios/roles') {
            $c->roles();
        } elseif ($path === 'usuarios/toggle') {
            $c->toggle();
        }
        break;

    // --- DASHBOARD ---
    case 'dashboard':
    case 'dashboard/logs':
        AuthMiddleware::verify(['Admin', 'Compras', 'Mantencion', 'Bodega']);
        $c = new DashboardController();
        if ($path === 'dashboard')
            $c->index();
        else
            $c->logs();
        break;

    // --- EXPORTAR EXCEL ---
    case 'exportar':
        $m = $_GET['modulo'] ?? '';

        // Permisos granulares por módulo
        if ($m === 'todo' || $m === 'usuarios')
            AuthMiddleware::verify(['Admin']);
        elseif ($m === 'mantencion' || $m === 'activos' || $m === 'detalle_ot')
            AuthMiddleware::verify(['Admin', 'Mantencion']);
        elseif ($m === 'compras' || $m === 'proveedores')
            AuthMiddleware::verify(['Admin', 'Compras']);
        else
            AuthMiddleware::verify();

        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/ExportController.php';
        (new ExportController())->exportar($m);
        break;

    case 'notifications':
        AuthMiddleware::verify();
        (new NotificationController())->index();
        break;

    default:
        jsonResponse(404, ["error" => "Ruta no encontrada: $path"]);
        break;
}