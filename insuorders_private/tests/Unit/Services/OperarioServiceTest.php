<?php
namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\OperarioService;
use App\Repositories\OperarioRepository;

class OperarioServiceTest extends TestCase
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

    public function test_asignarInsumo_lanza_si_faltan_datos_obligatorios(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/obligatorios/i');
        $this->service->asignarInsumo(['insumo_id' => 1], 99);
    }

    public function test_asignarInsumo_inyecta_bodeguero_id(): void
    {
        $this->repoMock->expects($this->once())
            ->method('asignarInsumo')
            ->with($this->callback(fn($d) => $d['bodeguero_id'] === 55));
        $this->service->asignarInsumo([
            'insumo_id'   => 1,
            'empleado_id' => 3,
            'cantidad'    => 2,
        ], 55);
    }

    public function test_responderEntrega_lanza_si_no_hay_entrega_id(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/inv/i');
        $this->service->responderEntrega(['accion' => 'ACEPTAR']);
    }

    public function test_responderEntrega_lanza_si_no_hay_accion(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/Acci/i');
        $this->service->responderEntrega(['entrega_id' => 1]);
    }

    public function test_responderEntrega_rechazar_tipo_mayor_a_1_requiere_justificacion(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/justificaci/i');
        $this->service->responderEntrega([
            'entrega_id'         => 1,
            'accion'             => 'RECHAZAR',
            'tipo_devolucion_id' => 2,
            'observacion'        => '',
        ]);
    }

    public function test_responderEntrega_masivo_usa_gestionarRecepcionMasiva(): void
    {
        $this->repoMock->expects($this->once())
            ->method('gestionarRecepcionMasiva')
            ->with([1, 2], 'ACEPTAR', null, 1);
        $this->service->responderEntrega([
            'entregas_ids' => [1, 2],
            'accion'       => 'ACEPTAR',
        ]);
    }

    public function test_responderEntrega_individual_usa_gestionarRecepcion(): void
    {
        $this->repoMock->expects($this->once())
            ->method('gestionarRecepcion')
            ->with(5, 'ACEPTAR', null, 1);
        $this->service->responderEntrega([
            'entrega_id' => 5,
            'accion'     => 'ACEPTAR',
        ]);
    }

    public function test_reportarConsumo_lanza_si_cantidad_cero(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/cantidad/i');
        $this->service->reportarConsumo(['entrega_id' => 1, 'cantidad' => 0]);
    }

    public function test_reportarConsumo_lanza_si_cantidad_negativa(): void
    {
        $this->expectException(\Exception::class);
        $this->service->reportarConsumo(['entrega_id' => 1, 'cantidad' => -3]);
    }

    public function test_devolverInsumo_lanza_si_cantidad_cero(): void
    {
        $this->expectException(\Exception::class);
        $this->service->devolverInsumo(['insumo_id' => 1, 'cantidad' => 0], 1);
    }

    public function test_devolverInsumo_tipo_mayor_a_1_requiere_comentario(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/justificaci/i');
        $this->service->devolverInsumo([
            'insumo_id'          => 1,
            'cantidad'           => 2,
            'tipo_devolucion_id' => 2,
            'comentario_tecnico' => '',
        ], 1);
    }

    public function test_devolverInsumo_llama_repositorio_correctamente(): void
    {
        $this->repoMock->expects($this->once())
            ->method('devolverInsumo')
            ->with(7, 3, 2.0, 1, null);
        $this->service->devolverInsumo([
            'insumo_id' => 3,
            'cantidad'  => 2,
        ], 7);
    }
}
