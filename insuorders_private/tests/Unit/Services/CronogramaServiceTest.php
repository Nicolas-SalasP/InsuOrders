<?php
namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\CronogramaService;
use App\Repositories\CronogramaRepository;
use App\Repositories\MantencionRepository;

class CronogramaServiceTest extends TestCase
{
    private CronogramaService $service;
    private $cronRepoMock;
    private $mantRepoMock;

    protected function setUp(): void
    {
        $this->cronRepoMock = $this->createMock(CronogramaRepository::class);
        $this->mantRepoMock = $this->createMock(MantencionRepository::class);

        $pdoMock = $this->createMock(\PDO::class);
        $pdoMock->method('inTransaction')->willReturn(false);
        $pdoMock->method('beginTransaction')->willReturn(true);
        $pdoMock->method('commit')->willReturn(true);
        $pdoMock->method('rollBack')->willReturn(true);

        $this->service = new CronogramaService();
        $this->inject('repo',           $this->cronRepoMock);
        $this->inject('mantencionRepo', $this->mantRepoMock);
        $this->inject('db',             $pdoMock);
    }

    private function inject(string $prop, object $mock): void
    {
        $ref = new \ReflectionProperty(CronogramaService::class, $prop);
        $ref->setAccessible(true);
        $ref->setValue($this->service, $mock);
    }

    public function test_obtener_retorna_null_si_no_existe(): void
    {
        $this->cronRepoMock->method('findById')->willReturn(null);
        $result = $this->service->obtener(999);
        $this->assertNull($result);
    }

    public function test_obtener_enriquece_con_datos_ot_si_tiene_solicitud(): void
    {
        $this->cronRepoMock->method('findById')->willReturn([
            'id'              => 1,
            'titulo'          => 'Mantención Preventiva',
            'tipo_evento'     => 'MANTENCION',
            'solicitud_ot_id' => 10,
        ]);
        $this->mantRepoMock->method('getOTHeader')->willReturn([
            'id'        => 10,
            'ubicacion' => 'Planta 1',
        ]);
        $this->mantRepoMock->method('getAsignadosOT')->willReturn([
            ['usuario_id' => 5],
            ['usuario_id' => 8],
        ]);

        $result = $this->service->obtener(1);

        $this->assertEquals('Planta 1', $result['ot_ubicacion']);
        $this->assertEquals([5, 8], $result['ot_asignados']);
    }

    public function test_obtener_no_llama_ot_si_sin_solicitud_ot_id(): void
    {
        $this->cronRepoMock->method('findById')->willReturn([
            'id'          => 2,
            'tipo_evento' => 'COMPRA',
        ]);
        $this->mantRepoMock->expects($this->never())->method('getOTHeader');
        $result = $this->service->obtener(2);
        $this->assertArrayNotHasKey('ot_ubicacion', $result);
    }

    public function test_no_puede_editar_evento_de_fecha_pasada(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/fechas pasadas/i');
        $this->cronRepoMock->method('findById')->willReturn([
            'id'               => 1,
            'fecha_programada' => '2020-01-01',
            'tipo_evento'      => 'MANTENCION',
            'solicitud_ot_id'  => null,
        ]);
        $this->service->eliminar(1);
    }

    public function test_no_puede_editar_evento_con_ot_finalizada(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/Finalizada|Anulada/i');
        $this->cronRepoMock->method('findById')->willReturn([
            'id'               => 1,
            'fecha_programada' => date('Y-m-d', strtotime('+10 days')),
            'tipo_evento'      => 'MANTENCION',
            'solicitud_ot_id'  => 5,
        ]);
        $this->mantRepoMock->method('getOTHeader')->willReturn([
            'id'        => 5,
            'estado_id' => 5,
        ]);
        $this->service->eliminar(1);
    }
}
