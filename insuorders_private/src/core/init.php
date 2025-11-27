<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Autoloader Mágico: Busca las clases en la carpeta privada
spl_autoload_register(function ($class_name) {
    $baseDir = __DIR__ . '/../'; 
    $file = $baseDir . str_replace('\\', '/', str_replace('App\\', 'App/', $class_name)) . '.php';
    $file = __DIR__ . '/../' . str_replace('\\', '/', $class_name) . '.php';
    
    if (file_exists($file)) {
        require_once $file;
    }
});