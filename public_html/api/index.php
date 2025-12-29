<?php
require_once __DIR__ . '/../../insuorders_private/src/core/init.php';

use App\Controllers\AuthController;
use App\Controllers\ProveedorController;
use App\Controllers\InsumoController;
use App\Controllers\OrdenCompraController;
use App\Controllers\MantencionController;
use App\Controllers\NotificationController;
use App\Controllers\BodegaController;
use App\Controllers\DashboardController;
use App\Controllers\UsuariosController;
use App\Controllers\ExportController;
use App\Middleware\AuthMiddleware;
use App\Controllers\CronogramaController;
use App\Controllers\MantenedoresController;
use App\Controllers\ImportController;
use App\Controllers\PersonalController;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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

switch ($path) {
    case 'login':
        $c = new AuthController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            $c->login();
        else
            jsonResponse(405, ["error" => "Método no permitido"]);
        break;

    case 'auth/me':
        (new AuthController())->me();
        break;

    case 'test':
        echo json_encode(["message" => "API Online", "ruta" => $path]);
        break;

    // --- MANTENCIÓN ---
    case 'mantencion':
        $c = new MantencionController();
        $method = $_SERVER['REQUEST_METHOD'];
        if ($method === 'GET') {
            AuthMiddleware::hasPermission('mant_ver');
            if (isset($_GET['detalle']))
                $c->detalles();
            else
                $c->index();
        } elseif ($method === 'POST') {
            $uid = AuthMiddleware::hasPermission('mant_crear');
            $c->store($uid);
        } elseif ($method === 'PUT') {
            AuthMiddleware::hasPermission('mant_editar');
            $c->update();
        } elseif ($method === 'DELETE') {
            AuthMiddleware::hasPermission('mant_anular');
            $c->delete();
        }
        break;

    case 'mantencion/finalizar':
        AuthMiddleware::hasPermission('mant_finalizar');
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            (new MantencionController())->finalizar();
        break;

    case 'mantencion/pdf':
        AuthMiddleware::hasPermission('mant_pdf');
        (new MantencionController())->downloadPdf();
        break;

    case 'mantencion/activos':
        AuthMiddleware::hasPermission('ver_activos');
        (new MantencionController())->activos();
        break;

    case 'mantencion/crear-activo':
        AuthMiddleware::hasPermission('mant_crear');
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            (new MantencionController())->storeActivo();
        break;

    case 'mantencion/editar-activo':
        AuthMiddleware::hasPermission('mant_crear');
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            (new MantencionController())->editarActivo();
        break;

    case 'mantencion/centros-costo':
        AuthMiddleware::verify(['Admin', 'Mantencion']);
        (new MantencionController())->centrosCosto();
        break;

    case 'mantencion/kit':
        AuthMiddleware::hasPermission('mant_crear');
        $c = new MantencionController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $c->getKit();
        elseif ($_SERVER['REQUEST_METHOD'] === 'POST')
            $c->saveKit();
        elseif ($_SERVER['REQUEST_METHOD'] === 'PUT')
            $c->updateKitQty();
        elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE')
            $c->removeKitItem();
        break;

    case 'mantencion/docs':
        AuthMiddleware::hasPermission('mant_editar');
        $c = new MantencionController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET')
            $c->listDocs();
        elseif ($_SERVER['REQUEST_METHOD'] === 'POST')
            $c->uploadDoc();
        elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE')
            $c->deleteDoc();
        break;

    // --- CRONOGRAMA ---
    case 'cronograma':
        AuthMiddleware::hasPermission('ver_cronograma');
        $c = new CronogramaController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (isset($_GET['id']))
                $c->show();
            else
                $c->index();
        } else {
            AuthMiddleware::hasPermission('mant_editar');
            if ($_SERVER['REQUEST_METHOD'] === 'POST')
                $c->store();
            elseif ($_SERVER['REQUEST_METHOD'] === 'PUT')
                $c->update();
            elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE')
                $c->delete();
        }
        break;

    // --- PERSONAL ---
    case 'personal':
        AuthMiddleware::verify();
        (new PersonalController())->index();
        break;

    // --- INVENTARIO ---
    case 'inventario':
        $c = new InsumoController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            AuthMiddleware::hasPermission('inv_ver');
            $c->index();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $isPut = (isset($_POST['_method']) && strtoupper($_POST['_method']) === 'PUT');
            if ($isPut || !empty($_POST['id'])) {
                AuthMiddleware::hasPermission('inv_editar');
                $c->update();
            } else {
                AuthMiddleware::hasPermission('inv_crear');
                $c->store();
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            AuthMiddleware::hasPermission('inv_eliminar');
            $c->delete();
        }
        break;

    case 'inventario/auxiliares':
        AuthMiddleware::hasPermission('inv_ver');
        (new InsumoController())->auxiliares();
        break;

    case 'inventario/ajuste':
        $uid = AuthMiddleware::hasPermission('ajustar_stock');
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            (new InsumoController())->ajustar($uid);
        break;

    // --- USUARIOS ---
    case 'usuarios':
    case 'usuarios/roles':
    case 'usuarios/toggle':
    case 'permisos':
    case 'usuarios/permisos':
    case 'usuarios/permisos/update':
        AuthMiddleware::hasPermission('ver_usuarios');
        $c = new UsuariosController();
        if ($path === 'usuarios') {
            if ($_SERVER['REQUEST_METHOD'] === 'GET')
                $c->index();
            elseif ($_SERVER['REQUEST_METHOD'] === 'POST')
                $c->store();
            elseif ($_SERVER['REQUEST_METHOD'] === 'PUT')
                $c->update();
        } elseif ($path === 'usuarios/roles')
            $c->roles();
        elseif ($path === 'usuarios/toggle')
            $c->toggle();
        elseif ($path === 'permisos')
            $c->listarPermisos();
        elseif ($path === 'usuarios/permisos')
            $c->obtenerPermisosUsuario();
        elseif ($path === 'usuarios/permisos/update')
            $c->actualizarPermisos();
        break;

    // --- EXPORTAR ---
    case 'exportar':
        $m = $_GET['modulo'] ?? '';
        if ($m === 'mantencion' || $m === 'detalle_ot')
            AuthMiddleware::hasPermission('mant_excel');
        elseif ($m === 'inventario')
            AuthMiddleware::hasPermission('inv_exportar');
        elseif ($m === 'usuarios')
            AuthMiddleware::hasPermission('ver_usuarios');
        else
            AuthMiddleware::verify();

        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/ExportController.php';
        (new ExportController())->exportar($m);
        break;

    // ----------------------------------------------------
    // --- BLOQUE CORREGIDO Y ORGANIZADO: COMPRAS ---
    // ----------------------------------------------------
    case 'compras':
    case 'compras/filtros':
    case 'compras/pendientes':
    case 'compras/detalle':
    case 'compras/pdf':
    case 'compras/upload':
    case 'compras/recepcionar':
        // Verificamos permisos generales para módulo Compras
        // Ajusta los roles según tu lógica ('Admin', 'Compras', 'Bodega', etc.)
        $uid = AuthMiddleware::verify(['Compras', 'Admin', 'Bodega']); 
        
        $c = new OrdenCompraController();
        $method = $_SERVER['REQUEST_METHOD'];

        if ($path === 'compras') {
            if ($method === 'GET') $c->index();
            elseif ($method === 'POST') $c->store($uid);
        }
        elseif ($path === 'compras/filtros') {
            if ($method === 'GET') $c->filtros();
        }
        elseif ($path === 'compras/pendientes') {
            if ($method === 'GET') $c->pendientes();
        }
        elseif ($path === 'compras/detalle') {
            if ($method === 'GET') $c->show();
        }
        elseif ($path === 'compras/pdf') {
            if ($method === 'GET') $c->downloadPdf();
        }
        elseif ($path === 'compras/upload') {
            if ($method === 'POST') $c->uploadFile();
        }
        elseif ($path === 'compras/recepcionar') {
            if ($method === 'POST') $c->recepcionar($uid);
        }
        break;

    // --- PROVEEDORES ---
    case 'proveedores':
    case 'proveedores/auxiliares':
        AuthMiddleware::verify(['Compras', 'Admin', 'Bodega']);
        $c = new ProveedorController();
        if ($path === 'proveedores')
            $c->index();
        elseif ($path === 'proveedores/auxiliares')
            // Asumiendo que existe el método auxiliares, si no, usa index o adáptalo
            if (method_exists($c, 'auxiliares')) $c->auxiliares(); else $c->index();
        break;

    // --- BODEGA ---
    case 'bodega/entregar':
    case 'bodega/pendientes':
    case 'bodega/por-organizar':
    case 'bodega/organizar':
        AuthMiddleware::hasPermission('ver_bodega');
        $c = new BodegaController();
        $uid = AuthMiddleware::verify();
        
        if ($path === 'bodega/entregar') $c->entregar($uid);
        elseif ($path === 'bodega/pendientes') $c->pendientes();
        elseif ($path === 'bodega/por-organizar') $c->porOrganizar();
        elseif ($path === 'bodega/organizar') $c->organizar();
        break;

    // --- DASHBOARD & NOTIFICACIONES ---
    case 'dashboard':
    case 'dashboard/logs':
    case 'dashboard/analytics':
        AuthMiddleware::verify();
        $c = new DashboardController();
        if ($path === 'dashboard') $c->index();
        elseif ($path === 'dashboard/logs') $c->logs();
        elseif ($path === 'dashboard/analytics') $c->analytics();
        break;

    case 'notifications':
        AuthMiddleware::verify();
        (new NotificationController())->index();
        break;

    // --- MANTENEDORES (Configuración) ---
    case 'mantenedores/empleados':
    case 'mantenedores/empleado':
    case 'mantenedores/centros':
    case 'mantenedores/centro':
    case 'mantenedores/areas':
    case 'mantenedores/area':
        AuthMiddleware::hasPermission('ver_config');
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/MantenedoresController.php';
        $c = new MantenedoresController();
        $method = $_SERVER['REQUEST_METHOD'];

        if (strpos($path, 'empleados') !== false) $c->getEmpleados();
        elseif (strpos($path, 'empleado') !== false) {
            if ($method === 'POST') $c->saveEmpleado(); else $c->deleteEmpleado();
        }
        elseif (strpos($path, 'centros') !== false) $c->getCentros();
        elseif (strpos($path, 'centro') !== false) {
            if ($method === 'POST') $c->saveCentro(); else $c->deleteCentro();
        }
        elseif (strpos($path, 'areas') !== false) $c->getAreas();
        elseif (strpos($path, 'area') !== false) {
            if ($method === 'POST') $c->saveArea(); else $c->deleteArea();
        }
        break;

    // --- IMPORTAR ---
    case 'importar':
    case 'importar/plantilla':
        $uid = AuthMiddleware::hasPermission('inv_importar');
        if ($_SERVER['REQUEST_METHOD'] === 'POST')
            (new ImportController())->importar($uid);
        break;

    default:
        jsonResponse(404, ["error" => "Ruta no encontrada: $path"]);
        break;
}
?>