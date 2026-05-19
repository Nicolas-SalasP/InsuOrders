<?php
namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\ProveedorService;
use App\Repositories\ProveedorRepository;

class ProveedorServiceTest extends TestCase
{
    private ProveedorService $service;
    private $repoMock;

    protected function setUp(): void
    {
        $this->repoMock = $this->createMock(ProveedorRepository::class);
        $this->service  = new ProveedorService();
        $ref = new \ReflectionProperty(ProveedorService::class, 'repo');
        $ref->setAccessible(true);
        $ref->setValue($this->service, $this->repoMock);
    }

    public function test_crear_sin_archivo_llama_solo_create(): void
    {
        $this->repoMock->expects($this->once())->method('create')->willReturn(5);
        $this->repoMock->expects($this->never())->method('guardarDocumento');

        $id = $this->service->crear(['nombre' => 'Proveedor Test', 'rut' => '12345678-9']);
        $this->assertEquals(5, $id);
    }

    public function test_crear_con_archivo_con_error_no_llama_procesarArchivo(): void
    {
        $this->repoMock->expects($this->once())->method('create')->willReturn(5);
        $this->repoMock->expects($this->never())->method('guardarDocumento');

        $archivoConError = ['error' => UPLOAD_ERR_NO_FILE, 'name' => 'doc.pdf', 'tmp_name' => ''];
        $this->service->crear(['nombre' => 'Test'], $archivoConError);
    }

    public function test_actualizar_sin_archivo_llama_solo_update(): void
    {
        $this->repoMock->expects($this->once())->method('update')->with(3, $this->anything())->willReturn(true);
        $this->repoMock->expects($this->never())->method('guardarDocumento');

        $this->service->actualizar(3, ['nombre' => 'Proveedor Actualizado']);
    }

    public function test_eliminar_llama_delete(): void
    {
        $this->repoMock->expects($this->once())->method('delete')->with(7)->willReturn(true);
        $result = $this->service->eliminar(7);
        $this->assertTrue($result);
    }

    public function test_listarTodos_delega_al_repositorio(): void
    {
        $lista = [['id' => 1, 'nombre' => 'Proveedor A'], ['id' => 2, 'nombre' => 'Proveedor B']];
        $this->repoMock->method('getAll')->willReturn($lista);
        $result = $this->service->listarTodos();
        $this->assertCount(2, $result);
    }
}
