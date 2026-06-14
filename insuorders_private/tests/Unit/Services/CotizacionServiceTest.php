<?php
namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\CotizacionService;
use App\Repositories\CotizacionRepository;

class CotizacionServiceTest extends TestCase
{
    private CotizacionService $service;
    private $repoMock;

    protected function setUp(): void
    {
        $this->repoMock = $this->createMock(CotizacionRepository::class);
        $this->service  = new CotizacionService();
        $ref = new \ReflectionProperty(CotizacionService::class, 'repo');
        $ref->setAccessible(true);
        $ref->setValue($this->service, $this->repoMock);
    }

    public function test_obtenerCotizacion_lanza_si_no_existe(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/no encontrada/i');
        $this->repoMock->method('getById')->willReturn(null);
        $this->service->obtenerCotizacion(999);
    }

    public function test_obtenerCotizacion_retorna_datos_si_existe(): void
    {
        $this->repoMock->method('getById')->willReturn(['id' => 1, 'estado_id' => 1]);
        $result = $this->service->obtenerCotizacion(1);
        $this->assertEquals(1, $result['id']);
    }

    public function test_crearCotizacion_lanza_si_no_hay_items(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/ítem/i');
        $this->service->crearCotizacion(['items' => []], 1);
    }

    public function test_crearCotizacion_lanza_si_items_no_es_array(): void
    {
        $this->expectException(\Exception::class);
        $this->service->crearCotizacion(['items' => null], 1);
    }

    public function test_crearCotizacion_lanza_si_item_sin_nombre(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/nombre/i');
        $this->service->crearCotizacion([
            'items' => [['nombre_item' => '', 'cantidad' => 1, 'precio' => 100]],
        ], 1);
    }

    public function test_crearCotizacion_lanza_si_cantidad_cero(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/cantidad/i');
        $this->service->crearCotizacion([
            'items' => [['nombre_item' => 'Tornillo', 'cantidad' => 0, 'precio' => 100]],
        ], 1);
    }

    public function test_crearCotizacion_lanza_si_cantidad_negativa(): void
    {
        $this->expectException(\Exception::class);
        $this->service->crearCotizacion([
            'items' => [['nombre_item' => 'Tornillo', 'cantidad' => -1, 'precio' => 100]],
        ], 1);
    }

    public function test_crearCotizacion_pasa_total_cero(): void
    {
        $this->repoMock->expects($this->once())
            ->method('create')
            ->with(
                $this->anything(),
                1,
                $this->equalTo(0)
            )
            ->willReturn(10);

        $this->service->crearCotizacion([
            'items' => [
                ['nombre_item' => 'Tornillo M6', 'cantidad' => 10, 'precio' => 200],
                ['nombre_item' => 'Válvula',     'cantidad' => 3,  'precio' => 500],
            ],
        ], 1);
    }

    public function test_crearCotizacion_retorna_id(): void
    {
        $this->repoMock->method('create')->willReturn(42);
        $id = $this->service->crearCotizacion([
            'items' => [['nombre_item' => 'Item A', 'cantidad' => 1, 'precio' => 1000]],
        ], 1);
        $this->assertEquals(42, $id);
    }

    public function test_gestionarEstado_lanza_si_cotizacion_no_pendiente(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/Pendiente/i');
        $this->repoMock->method('getById')->willReturn(['id' => 1, 'estado_id' => 2]);
        $this->service->gestionarEstado(1, 'APROBAR');
    }

    public function test_gestionarEstado_aprobar_setea_estado_2(): void
    {
        $this->repoMock->method('getById')->willReturn(['id' => 1, 'estado_id' => 1]);
        $this->repoMock->expects($this->once())
            ->method('updateStatus')
            ->with(1, 2);
        $this->service->gestionarEstado(1, 'APROBAR');
    }

    public function test_gestionarEstado_rechazar_setea_estado_3(): void
    {
        $this->repoMock->method('getById')->willReturn(['id' => 1, 'estado_id' => 1]);
        $this->repoMock->expects($this->once())
            ->method('updateStatus')
            ->with(1, 3);
        $this->service->gestionarEstado(1, 'RECHAZAR');
    }

    public function test_gestionarEstado_lanza_con_accion_invalida(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/válida/i');
        $this->repoMock->method('getById')->willReturn(['id' => 1, 'estado_id' => 1]);
        $this->service->gestionarEstado(1, 'ELIMINAR');
    }
}
