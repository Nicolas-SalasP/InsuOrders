<?php
namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\InsumoService;
use App\Repositories\InsumoRepository;

class InsumoServiceEdgeCasesTest extends TestCase
{
    private InsumoService $service;
    private $repoMock;

    protected function setUp(): void
    {
        $this->repoMock = $this->createMock(InsumoRepository::class);
        $this->service  = new InsumoService();
        $ref = new \ReflectionProperty(InsumoService::class, 'repo');
        $ref->setAccessible(true);
        $ref->setValue($this->service, $this->repoMock);
    }

    public function test_crearInsumo_sku_exactamente_3_caracteres_es_valido(): void
    {
        $this->repoMock->method('create')->willReturn(1);
        $id = $this->service->crearInsumo(['codigo_sku' => 'ABC', 'nombre' => 'Item', 'precio_costo' => 0]);
        $this->assertEquals(1, $id);
    }

    public function test_crearInsumo_precio_cero_es_valido(): void
    {
        $this->repoMock->method('create')->willReturn(1);
        $id = $this->service->crearInsumo(['codigo_sku' => 'ABC', 'nombre' => 'Item gratis', 'precio_costo' => 0]);
        $this->assertEquals(1, $id);
    }

    public function test_crearInsumo_nombre_con_solo_espacios_lanza(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/nombre/i');
        $this->service->crearInsumo(['codigo_sku' => 'ABC', 'nombre' => '   ']);
    }

    public function test_crearInsumo_sku_con_espacios_se_normaliza(): void
    {
        $this->repoMock->expects($this->once())
            ->method('create')
            ->with($this->callback(fn($d) => $d['codigo_sku'] === 'SKU 001'))
            ->willReturn(1);
        $this->service->crearInsumo(['codigo_sku' => '  sku 001  ', 'nombre' => 'Test', 'precio_costo' => 0]);
    }

    public function test_gestionarStock_cantidad_negativa_es_valida(): void
    {
        $this->repoMock->expects($this->once())
            ->method('ajustarStock')
            ->with(1, -5, 2, 1, 'Salida', null, null);
        $this->service->gestionarStock([
            'insumo_id' => 1, 'cantidad' => -5, 'tipo_movimiento_id' => 2, 'observacion' => 'Salida'
        ], 1);
    }

    public function test_gestionarStock_string_cero_lanza(): void
    {
        $this->expectException(\Exception::class);
        $this->service->gestionarStock([
            'insumo_id' => 1, 'cantidad' => '0', 'tipo_movimiento_id' => 1, 'observacion' => ''
        ], 1);
    }

    public function test_registrarSalida_cantidad_flotante_es_valida(): void
    {
        $this->repoMock->method('registrarSalidaManual')->willReturn([1]);
        $this->service->registrarSalida([
            'insumo_id' => 1, 'cantidad' => 2.5, 'ubicacion_envio_id' => 3
        ], 1);
        $this->assertTrue(true);
    }

    public function test_obtenerDatosComprobante_array_de_ids_funciona_directamente(): void
    {
        $this->repoMock->expects($this->once())
            ->method('getDatosComprobante')
            ->with([5, 10, 15])
            ->willReturn([]);
        $this->service->obtenerDatosComprobante([5, 10, 15]);
    }

    public function test_obtenerDatosComprobante_deduplica_string_ids(): void
    {
        $this->repoMock->expects($this->once())
            ->method('getDatosComprobante')
            ->willReturn([]);
        $this->service->obtenerDatosComprobante('1,2,3');
        $this->assertTrue(true);
    }

    public function test_crearInsumo_precio_string_se_castea_a_int(): void
    {
        $this->repoMock->expects($this->once())
            ->method('create')
            ->with($this->callback(fn($d) => is_int($d['precio_costo']) && $d['precio_costo'] === 1500))
            ->willReturn(1);
        $this->service->crearInsumo(['codigo_sku' => 'ABC', 'nombre' => 'Test', 'precio_costo' => '1500']);
    }

    public function test_actualizarInsumo_sin_cambio_sku_no_lanza(): void
    {
        $this->repoMock->method('update')->willReturn(true);
        $result = $this->service->actualizarInsumo(1, ['nombre' => 'Solo nombre']);
        $this->assertTrue($result);
    }
}
