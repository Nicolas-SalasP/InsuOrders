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
use App\Controllers\OperarioController;

// Configuración de CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Router Básico
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

// ============================================================
// LIMPIEZA DE PREFIJOS (api/...)
// ============================================================
if (strpos($path, 'api/') === 0) {
    $path = substr($path, 4);
}
// También limpiamos si viene con carpetas previas (parche de seguridad)
if (strpos($path, 'insuorders/public_html/api/') !== false) {
    $parts = explode('api/', $path);
    $path = end($parts);
}

// ============================================================
// SERVICIO DE ARCHIVOS ESTÁTICOS
// ============================================================
if (preg_match('/uploads\/(.+)$/', $path, $matches)) {
    $relativePath = 'uploads/' . $matches[1];
    $fullPathOnDisk = __DIR__ . '/' . $relativePath;

    if (file_exists($fullPathOnDisk) && is_file($fullPathOnDisk)) {
        $mime = mime_content_type($fullPathOnDisk);
        header("Content-Type: $mime");
        header("Content-Disposition: inline; filename=\"" . basename($fullPathOnDisk) . "\"");
        readfile($fullPathOnDisk);
        exit;
    }
}

if ($path === '')
    $path = 'test';

function jsonResponse($code, $data)
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// ============================================================
// RUTAS DE LA API
// ============================================================
switch ($path) {

    // --- AUTH ---
    case 'login':
        $c = new AuthController();
        if ($method === 'POST')
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

    // --- CRONOGRAMA ---
    case 'cronograma':
        AuthMiddleware::hasPermission('cron_ver');

        $c = new CronogramaController();
        if ($method === 'GET') {
            if (isset($_GET['id']))
                $c->show();
            else
                $c->index();
        } elseif ($method === 'POST') {
            $c->store();
        } elseif ($method === 'PUT') {
            $c->update();
        } elseif ($method === 'DELETE') {
            global $id;
            if (empty($id) && isset($_GET['id']))
                $id = $_GET['id'];
            $c->delete($id);
        }
        break;

    // --- MANTENCIÓN ---
    case 'mantencion':
        $c = new MantencionController();
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
        if ($method === 'POST')
            (new MantencionController())->finalizar();
        break;

    case 'mantencion/pdf':
        AuthMiddleware::hasPermission('mant_pdf');
        (new MantencionController())->downloadPdf();
        break;

    case 'mantencion/activos':
        AuthMiddleware::hasPermission('activos_ver');
        (new MantencionController())->activos();
        break;

    case 'mantencion/crear-activo':
        AuthMiddleware::hasPermission('mant_crear');
        if ($method === 'POST')
            (new MantencionController())->storeActivo();
        break;

    case 'mantencion/editar-activo':
        AuthMiddleware::hasPermission('mant_crear');
        if ($method === 'POST')
            (new MantencionController())->editarActivo();
        break;

    case 'mantencion/centros-costo':
        AuthMiddleware::verify(['Admin', 'Jefe Mantención']);
        (new MantencionController())->centrosCosto();
        break;

    case 'mantencion/kit':
        AuthMiddleware::hasPermission('mant_crear');
        $c = new MantencionController();
        if ($method === 'GET')
            $c->getKit();
        elseif ($method === 'POST')
            $c->saveKit();
        elseif ($method === 'PUT')
            $c->updateKitQty();
        elseif ($method === 'DELETE')
            $c->removeKitItem();
        break;

    case 'mantencion/docs':
        AuthMiddleware::hasPermission('mant_editar');
        $c = new MantencionController();
        if ($method === 'GET')
            $c->listDocs();
        elseif ($method === 'POST')
            $c->uploadDoc();
        elseif ($method === 'DELETE')
            $c->deleteDoc();
        break;

    // --- INVENTARIO ---
    case 'insumos':
    case 'inventario':
        $c = new InsumoController();
        if ($method === 'GET') {
            AuthMiddleware::hasPermission('inv_ver');
            $c->index();
        } elseif ($method === 'POST') {
            $isPut = (isset($_POST['_method']) && strtoupper($_POST['_method']) === 'PUT');
            if ($isPut || !empty($_POST['id'])) {
                AuthMiddleware::hasPermission('inv_editar');
                $c->update();
            } else {
                AuthMiddleware::hasPermission('inv_crear');
                $c->store();
            }
        } elseif ($method === 'DELETE') {
            AuthMiddleware::hasPermission('inv_eliminar');
            $c->delete();
        }
        break;

    case 'insumos/auxiliares':
    case 'inventario/auxiliares':
        AuthMiddleware::hasPermission('inv_ver');
        (new InsumoController())->auxiliares();
        break;

    case 'inventario/ajuste':
        $uid = AuthMiddleware::hasPermission('ajustar_stock');
        if ($method === 'POST')
            (new InsumoController())->ajustar($uid);
        break;

    // --- COMPRAS ---
    case 'compras':
        $uid = AuthMiddleware::verify(['Encargado Compras', 'Admin', 'Bodega']);
        $c = new OrdenCompraController();
        if ($method === 'GET')
            $c->index();
        elseif ($method === 'POST')
            $c->store($uid);
        break;

    case 'compras/filtros':
        AuthMiddleware::verify(['Encargado Compras', 'Admin', 'Bodega']);
        (new OrdenCompraController())->filtros();
        break;

    case 'compras/pendientes':
        AuthMiddleware::verify(['Encargado Compras', 'Admin', 'Bodega']);
        (new OrdenCompraController())->pendientes();
        break;

    case 'compras/detalle':
        AuthMiddleware::verify(['Encargado Compras', 'Admin', 'Bodega']);
        (new OrdenCompraController())->show();
        break;

    case 'compras/pdf':
        AuthMiddleware::verify(['Encargado Compras', 'Admin', 'Bodega']);
        (new OrdenCompraController())->downloadPdf();
        break;

    case 'compras/upload':
        AuthMiddleware::verify(['Encargado Compras', 'Admin', 'Bodega']);
        (new OrdenCompraController())->uploadFile();
        break;

    case 'compras/recepcionar':
        $uid = AuthMiddleware::verify(['Encargado Compras', 'Admin', 'Bodega']);
        (new OrdenCompraController())->recepcionar($uid);
        break;
    case 'compras/cancelar':
        AuthMiddleware::verify(['Encargado Compras', 'Admin', 'Bodega']);
        (new OrdenCompraController())->cancelarOrden();
        break;

    // --- PROVEEDORES ---
    case 'proveedores':
        $c = new ProveedorController();
        if ($method === 'GET')
            $c->index();
        elseif ($method === 'POST')
            $c->store();
        elseif ($method === 'PUT')
            $c->update();
        elseif ($method === 'DELETE')
            $c->delete();
        break;

    case 'proveedores/auxiliares':
        (new ProveedorController())->auxiliares();
        break;

    // --- USUARIOS ---
    case 'usuarios':
        AuthMiddleware::hasPermission('ver_usuarios');
        $c = new UsuariosController();
        if ($method === 'GET')
            $c->index();
        elseif ($method === 'POST')
            $c->store();
        elseif ($method === 'PUT')
            $c->update();
        break;

    case 'usuarios/roles':
        AuthMiddleware::hasPermission('ver_usuarios');
        (new UsuariosController())->roles();
        break;

    case 'usuarios/toggle':
        AuthMiddleware::hasPermission('ver_usuarios');
        (new UsuariosController())->toggle();
        break;

    case 'permisos':
        AuthMiddleware::hasPermission('ver_usuarios');
        (new UsuariosController())->listarPermisos();
        break;

    case 'usuarios/permisos':
        AuthMiddleware::hasPermission('ver_usuarios');
        (new UsuariosController())->obtenerPermisosUsuario();
        break;

    case 'usuarios/permisos/update':
        AuthMiddleware::hasPermission('ver_usuarios');
        (new UsuariosController())->actualizarPermisos();
        break;

    // --- BODEGA ---
    case 'bodega/entregar':
        $uid = AuthMiddleware::hasPermission('bodega_despachar');
        (new BodegaController())->entregar($uid);
        break;

    case 'bodega/pendientes':
        AuthMiddleware::hasPermission('bodega_despachar');
        (new BodegaController())->pendientes();
        break;

    case 'bodega/por-organizar':
        AuthMiddleware::hasPermission('bodega_organizar');
        (new BodegaController())->porOrganizar();
        break;

    case 'bodega/organizar':
        AuthMiddleware::hasPermission('bodega_organizar');
        (new BodegaController())->organizar();
        break;

    // --- OPERARIO / ENTREGAS PERSONALES  ---
    case 'operario/asignar':
        if ($method === 'POST')
            (new OperarioController())->asignar();
        break;

    case 'operario/mis-insumos':
        if ($method === 'GET')
            (new OperarioController())->getMisInsumos();
        break;

    case 'operario/responder':
        if ($method === 'POST')
            (new OperarioController())->responder();
        break;

    case 'operario/consumir':
        if ($method === 'POST')
            (new OperarioController())->consumir();
        break;

    case 'operario/dashboard':
        if ($method === 'GET')
            (new OperarioController())->dashboard();
        break;
    case 'operario/devolver':
        if ($method === 'POST')
            (new OperarioController())->devolver();
        break;

    // --- DASHBOARD ---
    case 'dashboard':
        AuthMiddleware::verify();
        (new DashboardController())->index();
        break;

    case 'dashboard/logs':
        AuthMiddleware::verify();
        (new DashboardController())->logs();
        break;

    case 'dashboard/analytics':
        AuthMiddleware::verify();
        (new DashboardController())->analytics();
        break;

    // --- OTROS ---
    case 'notifications':
        AuthMiddleware::verify();
        (new NotificationController())->index();
        break;

    case 'exportar':
        AuthMiddleware::verify();
        (new ExportController())->exportar($_GET['modulo'] ?? '');
        break;

    case 'importar':
    case 'importar/plantilla':
        $uid = AuthMiddleware::hasPermission('inv_importar');
        if ($method === 'POST')
            (new ImportController())->importar($uid);
        break;

    // --- MANTENEDORES (CONFIG) ---
    case 'mantenedores/empleados':
        AuthMiddleware::hasPermission('ver_config');
        (new MantenedoresController())->getEmpleados();
        break;

    case 'mantenedores/empleado':
        AuthMiddleware::hasPermission('ver_config');
        $c = new MantenedoresController();
        if ($method === 'POST')
            $c->saveEmpleado();
        else
            $c->deleteEmpleado();
        break;

    case 'mantenedores/centros':
        AuthMiddleware::hasPermission('ver_config');
        (new MantenedoresController())->getCentros();
        break;

    case 'mantenedores/centro':
        AuthMiddleware::hasPermission('ver_config');
        $c = new MantenedoresController();
        if ($method === 'POST')
            $c->saveCentro();
        else
            $c->deleteCentro();
        break;

    case 'mantenedores/areas':
        AuthMiddleware::hasPermission('ver_config');
        (new MantenedoresController())->getAreas();
        break;

    case 'mantenedores/area':
        AuthMiddleware::hasPermission('ver_config');
        $c = new MantenedoresController();
        if ($method === 'POST')
            $c->saveArea();
        else
            $c->deleteArea();
        break;

    // --- PERSONAL ---
    case 'personal':
        AuthMiddleware::verify();
        (new PersonalController())->index();
        break;

    default:
        jsonResponse(404, ["error" => "Ruta no encontrada: $path"]);
        break;
}