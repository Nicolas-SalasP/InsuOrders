<?php
namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\BodegaService;
use App\Repositories\BodegaRepository;
use App\Repositories\MantencionRepository;
use App\Repositories\OperarioRepository;

class BodegaServiceTest extends TestCase
{
    private BodegaService $service;
    private $bodegaMock;
    private $mantencionMock;
    private $operarioMock;

    protected function setUp(): void
    {
        $this->bodegaMock    = $this->createMock(BodegaRepository::class);
        $this->mantencionMock = $this->createMock(MantencionRepository::class);
        $this->operarioMock  = $this->createMock(OperarioRepository::class);

        $this->service = new BodegaService();
        $this->inject('repo',           $this->bodegaMock);
        $this->inject('mantencionRepo', $this->mantencionMock);
        $this->inject('operarioRepo',   $this->operarioMock);
    }

    private function inject(string $prop, object $mock): void
    {
        $ref = new \ReflectionProperty(BodegaService::class, $prop);
        $ref->setAccessible(true);
        $ref->setValue($this->service, $mock);
    }

    public function test_entregarMaterial_lanza_si_cantidad_es_cero(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/cantidad/i');
        $this->service->entregarMaterial(['cantidad' => 0], 1);
    }

    public function test_entregarMaterial_lanza_si_cantidad_negativa(): void
    {
        $this->expectException(\Exception::class);
        $this->service->entregarMaterial(['cantidad_entregar' => -5], 1);
    }

    public function test_entregarMaterial_lanza_si_faltan_datos(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/datos/i');
        $this->service->entregarMaterial(['cantidad' => 5, 'insumo_id' => 1], 1);
    }

    public function test_entregarMaterial_directo_a_empleado_llama_asignarInsumo(): void
    {
        $this->operarioMock->expects($this->once())
            ->method('asignarInsumo')
            ->with($this->callback(fn($d) =>
                $d['insumo_id'] === 3 &&
                $d['cantidad'] === 2.0 &&
                $d['bodeguero_id'] === 99
            ));
        $this->service->entregarMaterial([
            'insumo_id'   => 3,
            'cantidad'    => 2,
            'empleado_id' => 7,
        ], 99);
    }

    public function test_organizar_lanza_si_cantidad_es_cero(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/cantidad/i');
        $this->service->organizar(1, 2, 0);
    }

    public function test_organizar_lanza_si_misma_ubicacion(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/destino/i');
        $this->service->organizar(1, 1, 10);
    }

    public function test_rechazarDevolucion_lanza_si_motivo_vacio(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/motivo/i');
        $this->service->rechazarDevolucion(1, 99, '');
    }

    public function test_rechazarDevolucion_con_motivo_llama_repositorio(): void
    {
        $this->bodegaMock->expects($this->once())
            ->method('rechazarDevolucion')
            ->with(1, 99, 'Mal estado');
        $this->service->rechazarDevolucion(1, 99, 'Mal estado');
    }

    public function test_entregarMasivo_falla_si_todos_los_items_fallan(): void
    {
        $this->mantencionMock->method('entregarMaterial')
            ->willThrowException(new \Exception('Stock insuficiente'));
        try {
            $this->service->entregarMasivo(
                [['detalle_id' => 1, 'cantidad' => 999]],
                5,
                99
            );
            $this->fail('Se esperaba una excepción');
        } catch (\Exception $e) {
            $this->assertNotEmpty($e->getMessage());
        }
    }
}
