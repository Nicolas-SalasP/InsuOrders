<?php
namespace App\Config;

class Config
{
    private static ?string $jwtSecret = null;

    public static function getJwtSecret(): string
    {
        if (self::$jwtSecret !== null) {
            return self::$jwtSecret;
        }

        // 1. Primero intentar variables de entorno (cargadas por phpdotenv)
        $secret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?? null;
        if ($secret !== null) {
            $secret = trim($secret);
        }

        // 2. Fallback: leer .env manualmente si dotenv falló
        if (empty($secret)) {
            $envFile = __DIR__ . '/../../../.env';  // insuorders_private/.env
            if (is_readable($envFile)) {
                $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    $line = trim($line);
                    if ($line === '' || $line[0] === '#') continue;
                    if (strpos($line, 'JWT_SECRET=') === 0) {
                        $secret = trim(substr($line, strlen('JWT_SECRET=')));
                        // Quitar comillas si las tiene
                        $secret = trim($secret, "\"'");
                        break;
                    }
                }
            }
        }

        if (empty($secret)) {
            error_log('[Config] JWT_SECRET no está definido. Revisa insuorders_private/.env');
            throw new \RuntimeException(
                'JWT_SECRET no configurado. Agrega JWT_SECRET en insuorders_private/.env'
            );
        }

        self::$jwtSecret = $secret;
        return self::$jwtSecret;
    }

    const JWT_ALGO = 'HS256';
    const JWT_EXP  = 28800; // 8 horas
}
