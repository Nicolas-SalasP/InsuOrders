<?php
namespace Tests\Unit\Utils;

use PHPUnit\Framework\TestCase;
use App\Utils\FileUpload;

class FileUploadTest extends TestCase
{
    private string $tmpDir;

    protected function setUp(): void
    {
        $this->tmpDir = sys_get_temp_dir() . '/insuorders_test_' . uniqid();
        mkdir($this->tmpDir, 0755, true);
    }

    protected function tearDown(): void
    {
        foreach (glob($this->tmpDir . '/*') as $f) {
            if (is_file($f)) unlink($f);
        }
        if (is_dir($this->tmpDir)) rmdir($this->tmpDir);
    }

    private function makeFakeFile(string $name, string $content, string $mime): array
    {
        $tmp = tempnam(sys_get_temp_dir(), 'up_');
        file_put_contents($tmp, $content);
        return [
            'name'     => $name,
            'tmp_name' => $tmp,
            'error'    => UPLOAD_ERR_OK,
            'size'     => strlen($content),
            'type'     => $mime,
        ];
    }

    public function test_lanza_si_tipo_desconocido(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessageMatches('/desconocido/i');
        $file = $this->makeFakeFile('test.jpg', 'data', 'image/jpeg');
        FileUpload::guardar($file, $this->tmpDir, 'tipo_invalido');
    }

    public function test_lanza_si_error_de_upload(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessageMatches('/subida/i');
        FileUpload::guardar([
            'name' => 'x.jpg', 'tmp_name' => '', 'error' => UPLOAD_ERR_NO_FILE, 'size' => 0
        ], $this->tmpDir, 'imagen');
    }

    public function test_rechaza_extension_php_en_tipo_imagen(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessageMatches('/no permitido/i');
        $phpContent = '<' . '?php echo 1;' . '?' . '>';
        $file = $this->makeFakeFile('shell.php', $phpContent, 'application/x-php');
        FileUpload::guardar($file, $this->tmpDir, 'imagen');
    }

    public function test_rechaza_extension_phar_en_evidencia(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $file = $this->makeFakeFile('backdoor.phar', 'data', 'application/octet-stream');
        FileUpload::guardar($file, $this->tmpDir, 'evidencia');
    }

    public function test_rechaza_extension_exe_en_documento(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $file = $this->makeFakeFile('virus.exe', 'MZ', 'application/octet-stream');
        FileUpload::guardar($file, $this->tmpDir, 'documento');
    }

    public function test_rechaza_archivo_con_extension_jpg_pero_contenido_php(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessageMatches('/contenido no permitido/i');
        $phpTag  = '<' . '?php ';
        $phpBody = 'echo "test";';
        $closeTag = ' ?' . '>';
        $file = $this->makeFakeFile('foto.jpg', $phpTag . $phpBody . $closeTag, 'image/jpeg');
        FileUpload::guardar($file, $this->tmpDir, 'imagen');
    }

    public function test_genera_nombre_con_prefijo_y_extension_correcta(): void
    {
        $pngContent = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        );
        $file = $this->makeFakeFile('imagen.png', $pngContent, 'image/png');
        $name = FileUpload::guardar($file, $this->tmpDir, 'imagen', 'test');
        $this->assertStringStartsWith('test_', $name);
        $this->assertStringEndsWith('.png', $name);
        $this->assertFileExists($this->tmpDir . '/' . $name);
    }

    public function test_no_usa_nombre_original_del_archivo(): void
    {
        $pngContent = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        );
        $file = $this->makeFakeFile('../../etc/passwd.png', $pngContent, 'image/png');
        $name = FileUpload::guardar($file, $this->tmpDir, 'imagen');
        $this->assertStringNotContainsString('passwd', $name);
        $this->assertStringNotContainsString('..', $name);
        $this->assertStringNotContainsString('/', $name);
    }

    public function test_crea_directorio_destino_si_no_existe(): void
    {
        $pngContent = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        );
        $file = $this->makeFakeFile('img.png', $pngContent, 'image/png');
        $subDir = $this->tmpDir . '/subdir_' . uniqid();
        $this->assertDirectoryDoesNotExist($subDir);
        FileUpload::guardar($file, $subDir, 'imagen');
        $this->assertDirectoryExists($subDir);
        foreach (glob($subDir . '/*') as $f) unlink($f);
        rmdir($subDir);
    }
}
