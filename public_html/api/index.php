<?php
require_once __DIR__ . '/../../insuorders_private/src/core/init.php';

use App\Controllers\AuthController;
use App\Controllers\ProveedorController;
use App\Controllers\InsumoController;

// ============================================================================
// 1. DETECCIÓN DE RUTA INTELIGENTE (Soporta Rutas Anidadas)
// ============================================================================

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$scriptName = $_SERVER['SCRIPT_NAME']; 
$baseDir = dirname($scriptName); 

$baseDir = str_replace('\\', '/', $baseDir);

if (strpos($requestUri, $baseDir) === 0) {
    $path = substr($requestUri, strlen($baseDir));
} else {
    $path = $requestUri;
}
$path = str_replace('/index.php', '', $path);
$path = trim($path, '/');

if ($path === '') $path = 'home';

// ============================================================================
// 2. ENRUTAMIENTO
// ============================================================================

switch ($path) {
    // --- AUTENTICACIÓN ---
    case 'login':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/AuthController.php';
        $controller = new AuthController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $controller->login();
        else jsonResponse(405, ["error" => "Método no permitido"]);
        break;

    case 'test':
        echo json_encode(["message" => "API Online", "ruta_detectada" => $path]);
        break;

    // --- PROVEEDORES ---
    case 'proveedores':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/ProveedorController.php';
        $controller = new \App\Controllers\ProveedorController();
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method === 'GET') $controller->index();
        elseif ($method === 'POST') $controller->store();
        elseif ($method === 'PUT') $controller->update();
        elseif ($method === 'DELETE') $controller->delete();
        break;

    case 'proveedores/auxiliares':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/ProveedorController.php';
        $controller = new \App\Controllers\ProveedorController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET') $controller->auxiliares();
        break;

    // --- INVENTARIO  ---
    case 'inventario':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/InsumoController.php';
        $controller = new \App\Controllers\InsumoController();
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET') $controller->index();
        elseif ($method === 'POST') $controller->store();
        elseif ($method === 'DELETE') $controller->delete();
        break;

    case 'inventario/auxiliares':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/InsumoController.php';
        $controller = new \App\Controllers\InsumoController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET') $controller->auxiliares();
        break;

    case 'inventario/ajuste':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/InsumoController.php';
        $controller = new \App\Controllers\InsumoController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $controller->ajustar();
        else jsonResponse(405, ["error" => "Método no permitido"]);
        break;
    
    // --- PERSONAL  ---
    case 'personal':
        require_once __DIR__ . '/../../insuorders_private/src/App/Controllers/PersonalController.php';
        $controller = new \App\Controllers\PersonalController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET') $controller->index();
        break;

    default:
        http_response_code(404);
        echo json_encode([
            "error" => "Ruta no encontrada", 
            "path_recibido" => $path,
            "solucion" => "Verifica que el caso exista en el switch de index.php"
        ]);
        break;
}

function jsonResponse($code, $data) {
    http_response_code($code);
    echo json_encode($data);
}