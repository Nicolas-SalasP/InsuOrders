<?php
/**
 * InsuOrders — Diagnóstico de configuración (v2 detallado)
 */

echo "<pre>";
echo "<h2>InsuOrders — Diagnóstico v2</h2>";

// 1. Paths
echo "1. RUTAS COMPUTADAS\n";
echo "   __DIR__:               " . __DIR__ . "\n";
$privateDir = realpath(__DIR__ . '/../insuorders_private');
echo "   insuorders_private:    " . ($privateDir ?: '(NO RESUELVE)') . "\n";
$envPath    = $privateDir . DIRECTORY_SEPARATOR . '.env';
echo "   .env path esperado:    " . $envPath . "\n";

// 2. Existencia
echo "\n2. ARCHIVOS\n";
echo "   .env existe:           " . (file_exists($envPath) ? "✓ SÍ" : "✗ NO") . "\n";
echo "   .env legible:          " . (is_readable($envPath) ? "✓ SÍ" : "✗ NO") . "\n";
echo "   .env tamaño:           " . (file_exists($envPath) ? filesize($envPath) . " bytes" : "(N/A)") . "\n";

// 3. Listado del directorio insuorders_private
echo "\n3. CONTENIDO DE insuorders_private/\n";
if ($privateDir && is_dir($privateDir)) {
    $items = scandir($privateDir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        $full = $privateDir . DIRECTORY_SEPARATOR . $item;
        $tipo = is_dir($full) ? '[DIR]' : '[FILE ' . filesize($full) . 'b]';
        echo "   $tipo $item\n";
    }
} else {
    echo "   (directorio no existe o no es accesible)\n";
}

// 4. Contenido del .env (claves visibles, valores enmascarados)
echo "\n4. CONTENIDO DEL .env (valores ocultos)\n";
if (file_exists($envPath) && is_readable($envPath)) {
    $contents = file_get_contents($envPath);
    $hasBom   = substr($contents, 0, 3) === "\xEF\xBB\xBF";
    echo "   BOM UTF-8 detectado:   " . ($hasBom ? "⚠ SÍ (puede causar problemas)" : "✓ NO") . "\n";
    $lines = explode("\n", $contents);
    foreach ($lines as $line) {
        $line = rtrim($line, "\r\n");
        $trimmed = trim($line);
        if ($trimmed === '' || $trimmed[0] === '#') continue;
        if (strpos($line, '=') !== false) {
            $parts = explode('=', $line, 2);
            $k = $parts[0];
            $v = trim($parts[1]);
            $masked = strlen($v) > 8
                ? substr($v, 0, 4) . '...' . substr($v, -4)
                : '(corto)';
            echo "   " . str_pad($k, 20) . " = $masked  (" . strlen($v) . " chars)\n";
        }
    }
} else {
    echo "   (no se puede leer .env)\n";
}

// 5. Cargar bootstrap y revisar entorno
echo "\n5. BOOTSTRAP\n";
$initPath = __DIR__ . '/../insuorders_private/src/core/init.php';
if (file_exists($initPath)) {
    require_once $initPath;
    echo "   init.php:              ✓ cargado\n";
    echo "   \$_ENV['JWT_SECRET']:   " . (isset($_ENV['JWT_SECRET']) && $_ENV['JWT_SECRET'] !== '' ? "✓ (" . strlen($_ENV['JWT_SECRET']) . " chars)" : "✗ NO/VACÍO") . "\n";
    $g = getenv('JWT_SECRET');
    echo "   getenv('JWT_SECRET'):  " . ($g ? "✓ (" . strlen($g) . " chars)" : "✗ NO") . "\n";

    echo "\n6. Config::getJwtSecret() - ";
    try {
        $secret = \App\Config\Config::getJwtSecret();
        echo "✓ OK (" . strlen($secret) . " chars)\n";
    } catch (Throwable $e) {
        echo "✗ ERROR\n   " . $e->getMessage() . "\n";
    }
} else {
    echo "   init.php no encontrado en $initPath\n";
}

echo "\n</pre>";
echo "<p style='color:red'><strong>ELIMINA este archivo cuando termines.</strong></p>";
