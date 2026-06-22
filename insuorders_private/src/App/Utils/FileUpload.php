<?php
namespace App\Utils;

class FileUpload
{
    private const WHITELISTS = [
        'imagen' => [
            'ext'  => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            'mime' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        ],
        'evidencia' => [
            'ext'  => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov', 'ogg'],
            'mime' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp',
                       'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'],
        ],
        'documento' => [
            'ext'  => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'],
            'mime' => ['application/pdf',
                       'application/msword',
                       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                       'application/vnd.ms-excel',
                       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                       'text/plain', 'text/csv'],
        ],
    ];

    public static function guardar(
        array $file,
        string $destDir,
        string $tipo = 'imagen',
        string $prefix = ''
    ): string {
        if (!isset(self::WHITELISTS[$tipo])) {
            throw new \InvalidArgumentException("Tipo de upload desconocido: $tipo");
        }

        $whitelist = self::WHITELISTS[$tipo];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new \RuntimeException('Error en la subida del archivo (código: ' . $file['error'] . ').');
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $whitelist['ext'], true)) {
            throw new \InvalidArgumentException(
                "Tipo de archivo no permitido: .$ext. " .
                "Permitidos: " . implode(', ', $whitelist['ext'])
            );
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime  = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime, $whitelist['mime'], true)) {
            throw new \InvalidArgumentException(
                "Tipo de contenido no permitido: $mime"
            );
        }

        $safeExt  = preg_replace('/[^a-z0-9]/', '', $ext);
        $fileName = ($prefix ? $prefix . '_' : '') . bin2hex(random_bytes(16)) . '.' . $safeExt;

        if (!is_dir($destDir) && !mkdir($destDir, 0755, true)) {
            throw new \RuntimeException("No se pudo crear el directorio de uploads.");
        }

        $dest      = rtrim($destDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $fileName;
        $isTesting = ($_ENV['APP_ENV'] ?? '') === 'testing';
        $moved     = $isTesting
            ? copy($file['tmp_name'], $dest)
            : move_uploaded_file($file['tmp_name'], $dest);

        if (!$moved) {
            throw new \RuntimeException("No se pudo guardar el archivo en el servidor.");
        }

        return $fileName;
    }
}
