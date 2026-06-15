<?php
namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\CotizacionService;
use App\Repositories\CotizacionRepository;

class CotizacionServiceEdgeCasesTest extends TestCase
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

    public function test_crearCotizacion_precio_cero_cuenta_en_total(): void
    {
        $this->repoMock->expects($this->once())
            ->method('create')
            ->with($this->anything(), 1, $this->equalTo(0.0))
            ->willReturn(1);
        $this->service->crearCotizacion([
            'items' => [['nombre_item' => 'Item gratuito', 'cantidad' => 5, 'precio' => 0]],
        ], 1);
    }

    public function test_crearCotizacion_un_solo_item_valido(): void
    {
        $this->repoMock->method('create')->willReturn(1);
        $id = $this->service->crearCotizacion([
            'items' => [['nombre_item' => 'Tornillo M8', 'cantidad' => 100, 'precio' => 50]],
        ], 1);
        $this->assertEquals(1, $id);
    }

    public function test_gestionarEstado_cotizacion_estado_2_ya_no_es_pendiente(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/Pendiente/i');
        $this->repoMock->method('getById')->willReturn(['id' => 1, 'estado_id' => 2]);
        $this->service->gestionarEstado(1, 'RECHAZAR');
    }

    public function test_gestionarEstado_cotizacion_estado_3_ya_no_es_pendiente(): void
    {
        $this->expectException(\Exception::class);
        $this->repoMock->method('getById')->willReturn(['id' => 1, 'estado_id' => 3]);
        $this->service->gestionarEstado(1, 'APROBAR');
    }

    public function test_crearCotizacion_multiple_items_pasa_total_cero(): void
    {
        $this->repoMock->expects($this->once())
            ->method('create')
            ->with($this->anything(), 1, $this->equalTo(0))
            ->willReturn(5);

        $this->service->crearCotizacion([
            'items' => [
                ['nombre_item' => 'A', 'cantidad' => 10, 'precio' => 100],
                ['nombre_item' => 'B', 'cantidad' => 1,  'precio' => 100],
            ],
        ], 1);
    }

    public function test_obtenerListaEstados_delega_al_repositorio(): void
    {
        $estados = [['id' => 1, 'nombre' => 'Pendiente'], ['id' => 2, 'nombre' => 'Aprobada']];
        $this->repoMock->method('getEstados')->willReturn($estados);
        $result = $this->service->obtenerListaEstados();
        $this->assertCount(2, $result);
    }
}
