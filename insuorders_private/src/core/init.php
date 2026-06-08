<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use Dotenv\Dotenv;

// Cargar variables de entorno
$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->safeLoad();

// Configuración de errores según entorno
$debug = $_ENV['APP_DEBUG'] ?? 'false';
if ($debug === 'true') {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
}

// M7 fix: el CORS se gestiona en el front-controller público (public_html/api/index.php)
// con una whitelist de orígenes + Access-Control-Allow-Credentials. Aquí NO se emiten
// cabeceras CORS para evitar (a) el fallback inseguro a "*" y (b) cabeceras
// Access-Control-Allow-Origin duplicadas, que el navegador rechaza.
