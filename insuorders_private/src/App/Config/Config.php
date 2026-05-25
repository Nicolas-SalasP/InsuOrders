<?php
namespace App\Config;

class Config
{
    private static ?string $jwtSecret = null;
    private static ?string $testEnvFile = 'DISABLED';

    public static function getJwtSecret(): string
    {
        if (self::$jwtSecret !== null) {
            return self::$jwtSecret;
        }

        $secret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?? null;
        if ($secret !== null) {
            $secret = trim($secret);
        }

        if (empty($secret) && self::$testEnvFile !== 'DISABLED') {
            $envFile = self::$testEnvFile ?? __DIR__ . '/../../../.env';
            if (is_readable($envFile)) {
                $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    $line = trim($line);
                    if ($line === '' || $line[0] === '#') continue;
                    if (strpos($line, 'JWT_SECRET=') === 0) {
                        $secret = trim(substr($line, strlen('JWT_SECRET=')));
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

    public static function resetForTesting(): void
    {
        self::$jwtSecret = null;
        self::$testEnvFile = 'DISABLED';
    }

    const JWT_ALGO = 'HS256';
    const JWT_EXP  = 28800;
}
