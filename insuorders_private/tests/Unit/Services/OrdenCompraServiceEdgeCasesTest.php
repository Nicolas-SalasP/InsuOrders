<?php
namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\OrdenCompraService;
use App\Repositories\OrdenCompraRepository;
use App\Repositories\InsumoRepository;
use App\Repositories\ProveedorRepository;

class OrdenCompraServiceEdgeCasesTest extends TestCase
{
    private OrdenCompraService $service;
    private $ocRepoMock;
    private $insumoRepoMock;

    protected function setUp(): void
    {
        $this->ocRepoMock    = $this->createMock(OrdenCompraRepository::class);
        $this->insumoRepoMock = $this->createMock(InsumoRepository::class);

        $inTransaction = false;
        $dbMock = $this->createMock(\PDO::class);
        $dbMock->method('inTransaction')->willReturnCallback(function () use (&$inTransaction) { return $inTransaction; });
        $dbMock->method('beginTransaction')->willReturnCallback(function () use (&$inTransaction) { $inTransaction = true; return true; });
        $dbMock->method('commit')->willReturnCallback(function () use (&$inTransaction) { $inTransaction = false; return true; });
        $dbMock->method('rollBack')->willReturnCallback(function () use (&$inTransaction) { $inTransaction = false; return true; });

        $this->service = new OrdenCompraService();
        $this->inject('repo',       $this->ocRepoMock);
        $this->inject('insumoRepo', $this->insumoRepoMock);
        $this->inject('db',         $dbMock);
    }

    private function inject(string $prop, object $mock): void
    {
        $ref = new \ReflectionProperty(OrdenCompraService::class, $prop);
        $ref->setAccessible(true);
        $ref->setValue($this->service, $mock);
    }

    private function ordenBase(array $extra = []): array
    {
        return array_merge([
            'proveedor_id' => 1,
            'items' => [['id' => 1, 'cantidad' => 1, 'precio' => 500]],
        ], $extra);
    }

    public function test_crearOrden_items_vacio_es_falsy(): void
    {
        $this->expectException(\Exception::class);
        $this->service->crearOrden(['proveedor_id' => 1, 'items' => []], 1);
    }

    public function test_crearOrden_precio_cero_genera_total_solo_iva(): void
    {
        $this->ocRepoMock->method('create')->willReturnCallback(function ($data) {
            $this->assertEqualsWithDelta(0.0, $data['neto'], 0.01);
            $this->assertEqualsWithDelta(0.0, $data['total'], 0.01);
            return 1;
        });
        $this->ocRepoMock->method('addDetalle')->willReturn(true);

        $this->service->crearOrden([
            'proveedor_id' => 1,
            'items' => [['id' => 1, 'cantidad' => 5, 'precio' => 0]],
        ], 1);
    }

    public function test_crearOrden_tipo_cambio_custom_se_pasa_al_repo(): void
    {
        $this->ocRepoMock->method('create')->willReturnCallback(function ($data) {
            $this->assertEquals(850.5, $data['tipo_cambio']);
            return 1;
        });
        $this->ocRepoMock->method('addDetalle')->willReturn(true);

        $this->service->crearOrden($this->ordenBase(['tipo_cambio' => 850.5]), 1);
    }

    public function test_crearOrden_moneda_USD_se_preserva(): void
    {
        $this->ocRepoMock->method('create')->willReturnCallback(function ($data) {
            $this->assertEquals('USD', $data['moneda']);
            return 1;
        });
        $this->ocRepoMock->method('addDetalle')->willReturn(true);

        $this->service->crearOrden($this->ordenBase(['moneda' => 'USD']), 1);
    }

    public function test_crearOrden_numero_cotizacion_se_preserva(): void
    {
        $this->ocRepoMock->method('create')->willReturnCallback(function ($data) {
            $this->assertEquals('COT-2024-001', $data['numero_cotizacion']);
            return 1;
        });
        $this->ocRepoMock->method('addDetalle')->willReturn(true);

        $this->service->crearOrden($this->ordenBase(['numero_cotizacion' => 'COT-2024-001']), 1);
    }

    public function test_crearOrden_sin_destino_pasa_null(): void
    {
        $this->ocRepoMock->method('create')->willReturnCallback(function ($data) {
            $this->assertNull($data['destino']);
            return 1;
        });
        $this->ocRepoMock->method('addDetalle')->willReturn(true);

        $this->service->crearOrden($this->ordenBase(), 1);
    }

    public function test_cancelarOrden_lanza_si_no_existe(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/no encontrada/i');
        $this->ocRepoMock->method('getById')->willReturn(null);
        $this->service->cancelarOrden(999);
    }

    public function test_cancelarOrden_lanza_si_estado_es_3_o_mayor(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/recepciones|finalizada/i');
        $this->ocRepoMock->method('getById')->willReturn([
            'cabecera' => ['estado_id' => 3], 'detalles' => []
        ]);
        $this->service->cancelarOrden(1);
    }

    public function test_cancelarOrden_estado_1_llama_cancelar(): void
    {
        $this->ocRepoMock->method('getById')->willReturn([
            'cabecera' => ['estado_id' => 1], 'detalles' => []
        ]);
        $this->ocRepoMock->expects($this->once())->method('cancelar')->with(1);
        $this->service->cancelarOrden(1);
    }

    public function test_cancelarOrden_estado_2_tambien_permitido(): void
    {
        $this->ocRepoMock->method('getById')->willReturn([
            'cabecera' => ['estado_id' => 2], 'detalles' => []
        ]);
        $this->ocRepoMock->expects($this->once())->method('cancelar')->with(5);
        $this->service->cancelarOrden(5);
    }

    public function test_cerrarOrdenParcial_lanza_si_no_existe(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/no encontrada/i');
        $this->ocRepoMock->method('getById')->willReturn(null);
        $this->service->cerrarOrdenParcial(999);
    }

    public function test_cerrarOrdenParcial_lanza_si_estado_inmutable(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/inmutable|Cerrada|Anulada/i');
        $this->ocRepoMock->method('getById')->willReturn([
            'cabecera' => ['estado_id' => 4]
        ]);
        $this->service->cerrarOrdenParcial(1);
    }

    public function test_cerrarOrdenParcial_estados_4_5_6_son_inmutables(): void
    {
        foreach ([4, 5, 6] as $estado) {
            $this->ocRepoMock->method('getById')->willReturn([
                'cabecera' => ['estado_id' => $estado]
            ]);
            try {
                $this->service->cerrarOrdenParcial(1);
                $this->fail("Estado $estado debería ser inmutable");
            } catch (\Exception $e) {
                $this->assertNotEmpty($e->getMessage());
            }
        }
    }

    public function test_omitirPendientes_lanza_si_string_vacio(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/seleccionaron/i');
        $this->service->omitirPendientes('');
    }

    public function test_omitirPendientes_ignora_valores_no_numericos(): void
    {
        $this->ocRepoMock->method('obtenerDatosParaNotificar')->willReturn([]);
        $this->ocRepoMock->expects($this->never())->method('archivarSolicitudesPendientes');

        $result = $this->service->omitirPendientes('abc,def,xyz');
        $this->assertFalse($result);
    }
}
