<?php
namespace App\Utils;

/**
 * FileUpload — validación centralizada de archivos subidos.
 *
 * Whitelist de extensiones y tipos MIME permitidos por contexto.
 * Genera nombres de archivo seguros (UUID) para evitar path traversal.
 */
class FileUpload
{
    // Grupos de extensiones y MIME types permitidos
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
                       'text/plain', 'text/csv', 'application/octet-stream'],
        ],
    ];

    /**
     * Valida y mueve un archivo subido.
     *
     * @param array  $file        Elemento de $_FILES
     * @param string $destDir     Ruta absoluta del directorio destino
     * @param string $tipo        'imagen' | 'evidencia' | 'documento'
     * @param string $prefix      Prefijo para el nombre del archivo
     * @return string             Nombre del archivo guardado (sin ruta)
     * @throws \InvalidArgumentException si el archivo no pasa validación
     * @throws \RuntimeException         si no se puede mover
     */
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

        // 1. Error de upload
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new \RuntimeException('Error en la subida del archivo (código: ' . $file['error'] . ').');
        }

        // 2. Validar extensión (contra el nombre original)
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $whitelist['ext'], true)) {
            throw new \InvalidArgumentException(
                "Tipo de archivo no permitido: .$ext. " .
                "Permitidos: " . implode(', ', $whitelist['ext'])
            );
        }

        // 3. Validar MIME real del contenido (no confiar solo en la extensión)
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime  = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime, $whitelist['mime'], true)) {
            throw new \InvalidArgumentException(
                "Tipo de contenido no permitido: $mime"
            );
        }

        // 4. Nombre seguro — UUID + extensión original
        $safeExt  = preg_replace('/[^a-z0-9]/', '', $ext);
        $fileName = ($prefix ? $prefix . '_' : '') . bin2hex(random_bytes(16)) . '.' . $safeExt;

        // 5. Crear directorio si no existe
        if (!is_dir($destDir) && !mkdir($destDir, 0755, true)) {
            throw new \RuntimeException("No se pudo crear el directorio de uploads.");
        }

        // 6. Mover el archivo
        $dest = rtrim($destDir, '/') . '/' . $fileName;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            throw new \RuntimeException("No se pudo guardar el archivo en el servidor.");
        }

        return $fileName;
    }
}
