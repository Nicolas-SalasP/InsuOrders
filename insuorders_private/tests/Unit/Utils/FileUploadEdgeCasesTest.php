<?php
namespace Tests\Unit\Utils;

use PHPUnit\Framework\TestCase;
use App\Utils\FileUpload;

class FileUploadEdgeCasesTest extends TestCase
{
    private string $tmpDir;

    protected function setUp(): void
    {
        $this->tmpDir = sys_get_temp_dir() . '/insuorders_edge_' . uniqid();
        mkdir($this->tmpDir, 0755, true);
    }

    protected function tearDown(): void
    {
        foreach (glob($this->tmpDir . '/**/*') ?: [] as $f) {
            if (is_file($f)) unlink($f);
        }
        foreach (glob($this->tmpDir . '/*') ?: [] as $f) {
            if (is_dir($f)) rmdir($f);
            elseif (is_file($f)) unlink($f);
        }
        if (is_dir($this->tmpDir)) rmdir($this->tmpDir);
    }

    private function makePng(): array
    {
        $content = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        );
        $tmp = tempnam(sys_get_temp_dir(), 'up_');
        file_put_contents($tmp, $content);
        return ['name' => 'test.png', 'tmp_name' => $tmp, 'error' => UPLOAD_ERR_OK, 'size' => strlen($content), 'type' => 'image/png'];
    }

    private function makePdf(): array
    {
        $content = '%PDF-1.4 test content';
        $tmp = tempnam(sys_get_temp_dir(), 'up_');
        file_put_contents($tmp, $content);
        return ['name' => 'doc.pdf', 'tmp_name' => $tmp, 'error' => UPLOAD_ERR_OK, 'size' => strlen($content), 'type' => 'application/pdf'];
    }

    public function test_nombre_seguro_tiene_longitud_de_hash_mas_extension(): void
    {
        $file = $this->makePng();
        $name = FileUpload::guardar($file, $this->tmpDir, 'imagen');
        $this->assertMatchesRegularExpression('/^[a-f0-9]{32}\.png$/', $name);
    }

    public function test_nombre_con_prefijo_incluye_guion_bajo(): void
    {
        $file = $this->makePng();
        $name = FileUpload::guardar($file, $this->tmpDir, 'imagen', 'cierre');
        $this->assertStringStartsWith('cierre_', $name);
        $this->assertMatchesRegularExpression('/^cierre_[a-f0-9]{32}\.png$/', $name);
    }

    public function test_dos_subidas_generan_nombres_distintos(): void
    {
        $file1 = $this->makePng();
        $file2 = $this->makePng();
        $name1 = FileUpload::guardar($file1, $this->tmpDir, 'imagen');
        $name2 = FileUpload::guardar($file2, $this->tmpDir, 'imagen');
        $this->assertNotEquals($name1, $name2);
    }

    public function test_rechaza_extension_html_en_documento(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $tmp = tempnam(sys_get_temp_dir(), 'up_');
        file_put_contents($tmp, '<html><body>XSS</body></html>');
        FileUpload::guardar(
            ['name' => 'page.html', 'tmp_name' => $tmp, 'error' => UPLOAD_ERR_OK, 'size' => 30, 'type' => 'text/html'],
            $this->tmpDir, 'documento'
        );
    }

    public function test_rechaza_extension_svg_en_imagen(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $tmp = tempnam(sys_get_temp_dir(), 'up_');
        file_put_contents($tmp, '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
        FileUpload::guardar(
            ['name' => 'imagen.svg', 'tmp_name' => $tmp, 'error' => UPLOAD_ERR_OK, 'size' => 40, 'type' => 'image/svg+xml'],
            $this->tmpDir, 'imagen'
        );
    }

    public function test_acepta_jpeg_en_evidencia(): void
    {
        $file = $this->makePng();
        $file['name'] = 'foto.png';
        $name = FileUpload::guardar($file, $this->tmpDir, 'evidencia');
        $this->assertStringEndsWith('.png', $name);
    }

    public function test_acepta_pdf_en_documento(): void
    {
        $file = $this->makePdf();
        $name = FileUpload::guardar($file, $this->tmpDir, 'documento');
        $this->assertStringEndsWith('.pdf', $name);
    }

    public function test_upload_err_partial_lanza(): void
    {
        $this->expectException(\RuntimeException::class);
        FileUpload::guardar(
            ['name' => 'x.jpg', 'tmp_name' => '', 'error' => UPLOAD_ERR_PARTIAL, 'size' => 0],
            $this->tmpDir, 'imagen'
        );
    }

    public function test_upload_err_size_lanza(): void
    {
        $this->expectException(\RuntimeException::class);
        FileUpload::guardar(
            ['name' => 'x.jpg', 'tmp_name' => '', 'error' => UPLOAD_ERR_INI_SIZE, 'size' => 0],
            $this->tmpDir, 'imagen'
        );
    }
}
