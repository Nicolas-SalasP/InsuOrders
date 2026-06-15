<?php
namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\BodegaService;
use App\Repositories\BodegaRepository;
use App\Repositories\MantencionRepository;
use App\Repositories\OperarioRepository;

class BodegaServiceEdgeCasesTest extends TestCase
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

    public function test_entregarMaterial_cantidad_flotante_es_valida(): void
    {
        $this->operarioMock->method('existeEmpleadoActivo')->willReturn(true);
        $this->operarioMock->expects($this->once())
            ->method('asignarInsumo')
            ->with($this->callback(fn($d) => $d['cantidad'] === 2.5));

        $this->service->entregarMaterial([
            'insumo_id'   => 1,
            'cantidad'    => 2.5,
            'empleado_id' => 3,
        ], 1);
    }

    public function test_entregarMaterial_cantidad_entregar_tiene_prioridad(): void
    {
        $this->operarioMock->method('existeEmpleadoActivo')->willReturn(true);
        $this->operarioMock->expects($this->once())
            ->method('asignarInsumo')
            ->with($this->callback(fn($d) => $d['cantidad'] === 7.0));

        $this->service->entregarMaterial([
            'insumo_id'        => 1,
            'cantidad'         => 3,
            'cantidad_entregar' => 7,
            'empleado_id'      => 3,
        ], 1);
    }

    public function test_organizar_cantidad_flotante_pasa_validacion(): void
    {
        $this->expectException(\Exception::class);
        $this->service->organizar(1, 1, 0.5);
    }

    public function test_organizar_cantidad_negativa_lanza(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/cantidad/i');
        $this->service->organizar(1, 2, -10);
    }

    public function test_rechazarDevolucion_motivo_con_solo_espacios_lanza(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/motivo/i');
        $this->service->rechazarDevolucion(1, 99, '   ');
    }

    public function test_aprobarDevolucion_llama_repositorio(): void
    {
        $this->bodegaMock->expects($this->once())
            ->method('aprobarDevolucion')
            ->with(3, 99);
        $this->service->aprobarDevolucion(3, 99);
    }
}
