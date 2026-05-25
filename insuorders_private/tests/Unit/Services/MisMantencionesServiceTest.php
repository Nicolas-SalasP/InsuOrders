<?php
namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\MisMantencionesService;
use App\Repositories\MisMantencionesRepository;

class MisMantencionesServiceTest extends TestCase
{
    private MisMantencionesService $service;
    private $repoMock;

    protected function setUp(): void
    {
        $this->repoMock = $this->createMock(MisMantencionesRepository::class);
        $this->service  = new MisMantencionesService();
        $ref = new \ReflectionProperty(MisMantencionesService::class, 'repository');
        $ref->setAccessible(true);
        $ref->setValue($this->service, $this->repoMock);
    }

    public function test_guardarAvance_lanza_si_ot_id_vacio(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/ID de OT/i');
        $this->service->guardarAvance('', []);
    }

    public function test_guardarAvance_lanza_si_ot_id_cero(): void
    {
        $this->expectException(\Exception::class);
        $this->service->guardarAvance(0, []);
    }

    public function test_guardarAvance_llama_repositorio(): void
    {
        $this->repoMock->expects($this->once())
            ->method('guardarChecklist')
            ->with(5, ['resp1' => 'si'])
            ->willReturn(true);
        $this->service->guardarAvance(5, ['resp1' => 'si']);
    }

    public function test_registrarInicioTrabajo_lanza_si_id_vacio(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/no válido/i');
        $this->service->registrarInicioTrabajo('');
    }

    public function test_registrarInicioTrabajo_lanza_si_id_null(): void
    {
        $this->expectException(\Exception::class);
        $this->service->registrarInicioTrabajo(null);
    }

    public function test_registrarInicioTrabajo_llama_repositorio(): void
    {
        $this->repoMock->expects($this->once())
            ->method('iniciarTrabajoEnOrden')
            ->with(7)
            ->willReturn(true);
        $this->service->registrarInicioTrabajo(7);
    }

    public function test_actualizarEstadoOT_lanza_si_falta_ot_id(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/obligatorios/i');
        $this->service->actualizarEstadoOT(null, 2);
    }

    public function test_actualizarEstadoOT_lanza_si_falta_estado_id(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/obligatorios/i');
        $this->service->actualizarEstadoOT(1, null);
    }

    public function test_actualizarEstadoOT_lanza_si_ambos_vacios(): void
    {
        $this->expectException(\Exception::class);
        $this->service->actualizarEstadoOT(0, 0);
    }

    public function test_actualizarEstadoOT_llama_repositorio(): void
    {
        $this->repoMock->expects($this->once())
            ->method('actualizarEstadoOT')
            ->with(3, 5)
            ->willReturn(true);
        $this->service->actualizarEstadoOT(3, 5);
    }

    public function test_getDatosReporte_combina_header_y_detalles(): void
    {
        $this->repoMock->method('getOTHeader')->willReturn(['id' => 1, 'titulo' => 'OT Test']);
        $this->repoMock->method('getDetallesOT')->willReturn([['insumo' => 'Tornillo']]);

        $result = $this->service->getDatosReporte(1);

        $this->assertArrayHasKey('header', $result);
        $this->assertArrayHasKey('detalles', $result);
        $this->assertEquals('OT Test', $result['header']['titulo']);
    }

    public function test_getDetalleCompletoOt_combina_insumos_y_respuestas(): void
    {
        $this->repoMock->method('getInsumosPorOt')->willReturn([['insumo_id' => 5]]);
        $this->repoMock->method('getRespuestasPorOt')->willReturn([['pregunta' => 'OK']]);

        $result = $this->service->getDetalleCompletoOt(1, 99);

        $this->assertArrayHasKey('insumos', $result);
        $this->assertArrayHasKey('respuestas', $result);
        $this->assertCount(1, $result['insumos']);
    }
}
