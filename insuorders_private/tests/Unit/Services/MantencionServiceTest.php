<?php
namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\MantencionService;
use App\Repositories\MantencionRepository;
use App\Repositories\CronogramaRepository;

class FakeMantencionRepository extends MantencionRepository
{
    public function __construct() {}
    public function getRequierePermisoActual($id) { return null; }
}

class MantencionServiceTest extends TestCase
{
    private MantencionService $service;
    private $repoMock;
    private $cronMock;

    protected function setUp(): void
    {
        $this->repoMock = $this->createMock(MantencionRepository::class);
        $this->cronMock = $this->createMock(CronogramaRepository::class);

        $this->service = new MantencionService();
        $this->inject('repo',          $this->repoMock);
        $this->inject('cronogramaRepo', $this->cronMock);
    }

    private function inject(string $prop, object $mock): void
    {
        $ref = new \ReflectionProperty(MantencionService::class, $prop);
        $ref->setAccessible(true);
        $ref->setValue($this->service, $mock);
    }

    public function test_crearOT_lanza_si_no_hay_items_ni_activo(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/activo|insumo/i');
        $this->service->crearOT([], 1);
    }

    public function test_crearOT_lanza_si_requiere_permiso_sin_tipo(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/tipo de permiso/i');
        $this->service->crearOT([
            'activo_id'        => 5,
            'requiere_permiso' => 1,
            'tipo_permiso_id'  => null,
        ], 1);
    }

    public function test_crearOT_exitosa_retorna_id(): void
    {
        $this->repoMock->expects($this->once())->method('createOT')->willReturn(77);
        $id = $this->service->crearOT(['activo_id' => 5], 1);
        $this->assertEquals(77, $id);
    }

    public function test_crearOT_con_activo_sin_items_no_lanza(): void
    {
        $this->repoMock->method('createOT')->willReturn(1);
        $this->assertIsInt($this->service->crearOT(['activo_id' => 1], 1));
    }

    public function test_crearOT_con_items_sin_activo_no_lanza(): void
    {
        $this->repoMock->method('createOT')->willReturn(2);
        $this->assertIsInt($this->service->crearOT([
            'items' => [['insumo_id' => 1, 'cantidad' => 2]],
        ], 1));
    }

    public function test_editarOT_lanza_si_requiere_permiso_sin_tipo(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/tipo de permiso/i');

        $repoMock = $this->createMock(FakeMantencionRepository::class);
        $repoMock->method('getRequierePermisoActual')->willReturn(null);
        $this->inject('repo', $repoMock);

        $this->service->editarOT(1, [
            'requiere_permiso' => 1,
            'tipo_permiso_id'  => null,
        ]);
    }

    public function test_editarOT_llama_syncByOT_en_cronograma(): void
    {
        $repoMock = $this->createMock(FakeMantencionRepository::class);
        $repoMock->method('getRequierePermisoActual')->willReturn(null);
        $repoMock->method('updateOT')->willReturn(true);
        $this->inject('repo', $repoMock);

        $this->cronMock->expects($this->once())
            ->method('syncByOT')
            ->with(5, $this->anything());

        $this->service->editarOT(5, ['activo_id' => 1]);
    }

    public function test_anularOT_lanza_si_tiene_entregas(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/entregados|materiales/i');

        $this->repoMock->method('getEntregasOT')->willReturn([
            ['id' => 1, 'insumo' => 'Tornillo', 'cantidad' => 5]
        ]);

        $this->service->anularOT(1);
    }

    public function test_anularOT_sin_entregas_llama_delete(): void
    {
        $this->repoMock->method('getEntregasOT')->willReturn([]);
        $this->repoMock->expects($this->once())->method('delete')->with(1);
        $this->service->anularOT(1);
    }

    public function test_obtenerDetalleOT_retorna_null_si_no_existe(): void
    {
        $this->repoMock->method('getOTHeader')->willReturn(null);
        $this->assertNull($this->service->obtenerDetalleOT(999));
    }

    public function test_obtenerDetalleOT_combina_header_items_asignaciones(): void
    {
        $this->repoMock->method('getOTHeader')->willReturn(['id' => 1, 'titulo' => 'OT Test', 'estado_id' => 1]);
        $this->repoMock->method('getDetallesOT')->willReturn([['insumo_id' => 5, 'cantidad' => 3]]);
        $this->repoMock->method('getAsignadosOT')->willReturn([['usuario_id' => 10, 'nombre' => 'Juan']]);

        $result = $this->service->obtenerDetalleOT(1);

        $this->assertArrayHasKey('items', $result);
        $this->assertArrayHasKey('asignaciones', $result);
        $this->assertCount(1, $result['items']);
        $this->assertEquals('OT Test', $result['titulo']);
    }
}
