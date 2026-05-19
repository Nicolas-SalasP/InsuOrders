<?php
namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\OperarioService;
use App\Repositories\OperarioRepository;

class OperarioServiceEdgeCasesTest extends TestCase
{
    private OperarioService $service;
    private $repoMock;

    protected function setUp(): void
    {
        $this->repoMock = $this->createMock(OperarioRepository::class);
        $this->service  = new OperarioService();
        $ref = new \ReflectionProperty(OperarioService::class, 'repo');
        $ref->setAccessible(true);
        $ref->setValue($this->service, $this->repoMock);
    }

    public function test_asignarInsumo_falta_solo_empleado_id(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/obligatorios/i');
        $this->service->asignarInsumo(['insumo_id' => 1, 'cantidad' => 2], 1);
    }

    public function test_asignarInsumo_falta_solo_cantidad(): void
    {
        $this->expectException(\Exception::class);
        $this->service->asignarInsumo(['insumo_id' => 1, 'empleado_id' => 2], 1);
    }

    public function test_asignarInsumo_falta_solo_insumo_id(): void
    {
        $this->expectException(\Exception::class);
        $this->service->asignarInsumo(['empleado_id' => 2, 'cantidad' => 1], 1);
    }

    public function test_responderEntrega_array_ids_vacio_lanza(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/inv/i');
        $this->service->responderEntrega([
            'entregas_ids' => [],
            'accion'       => 'ACEPTAR',
        ]);
    }

    public function test_responderEntrega_rechazar_tipo_1_sin_observacion_es_valido(): void
    {
        $this->repoMock->expects($this->once())->method('gestionarRecepcion');
        $this->service->responderEntrega([
            'entrega_id'         => 1,
            'accion'             => 'RECHAZAR',
            'tipo_devolucion_id' => 1,
            'observacion'        => '',
        ]);
    }

    public function test_devolverInsumo_tipo_1_sin_comentario_es_valido(): void
    {
        $this->repoMock->expects($this->once())->method('devolverInsumo');
        $this->service->devolverInsumo([
            'insumo_id'          => 1,
            'cantidad'           => 2,
            'tipo_devolucion_id' => 1,
            'comentario_tecnico' => '',
        ], 5);
    }

    public function test_reportarConsumo_cantidad_flotante_es_valida(): void
    {
        $this->repoMock->expects($this->once())->method('reportarUso')->with(1, 1.5);
        $this->service->reportarConsumo(['entrega_id' => 1, 'cantidad' => 1.5]);
    }

    public function test_devolverInsumo_cantidad_flotante_es_valida(): void
    {
        $this->repoMock->expects($this->once())->method('devolverInsumo')->with(1, 3, 0.75, 1, null);
        $this->service->devolverInsumo(['insumo_id' => 3, 'cantidad' => 0.75], 1);
    }
}
