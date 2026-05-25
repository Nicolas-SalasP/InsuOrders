<?php
namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\InsumoService;
use App\Repositories\InsumoRepository;

class InsumoServiceTest extends TestCase
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

    public function test_crearInsumo_lanza_excepcion_si_sku_es_muy_corto(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/SKU/i');
        $this->service->crearInsumo(['codigo_sku' => 'AB', 'nombre' => 'Tornillo']);
    }

    public function test_crearInsumo_lanza_excepcion_si_nombre_esta_vacio(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/nombre/i');
        $this->service->crearInsumo(['codigo_sku' => 'SKU001', 'nombre' => '']);
    }

    public function test_crearInsumo_lanza_excepcion_si_precio_es_negativo(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/precio/i');
        $this->service->crearInsumo([
            'codigo_sku'   => 'SKU001',
            'nombre'       => 'Tornillo M6',
            'precio_costo' => -500,
        ]);
    }

    public function test_crearInsumo_normaliza_nombre_a_titulo(): void
    {
        $this->repoMock->expects($this->once())
            ->method('create')
            ->with($this->callback(fn($d) => $d['nombre'] === 'Tornillo M6'))
            ->willReturn(1);
        $this->service->crearInsumo([
            'codigo_sku'   => 'SKU001',
            'nombre'       => 'TORNILLO M6',
            'precio_costo' => 0,
        ]);
    }

    public function test_crearInsumo_normaliza_sku_a_mayusculas(): void
    {
        $this->repoMock->expects($this->once())
            ->method('create')
            ->with($this->callback(fn($d) => $d['codigo_sku'] === 'SKU001'))
            ->willReturn(1);
        $this->service->crearInsumo([
            'codigo_sku'   => 'sku001',
            'nombre'       => 'Tornillo M6',
            'precio_costo' => 0,
        ]);
    }

    public function test_crearInsumo_agrega_moneda_CLP_por_defecto(): void
    {
        $this->repoMock->expects($this->once())
            ->method('create')
            ->with($this->callback(fn($d) => $d['moneda'] === 'CLP'))
            ->willReturn(1);
        $this->service->crearInsumo([
            'codigo_sku'   => 'SKU001',
            'nombre'       => 'Tornillo',
            'precio_costo' => 100,
        ]);
    }

    public function test_crearInsumo_exitoso_retorna_id(): void
    {
        $this->repoMock->method('create')->willReturn(42);
        $id = $this->service->crearInsumo([
            'codigo_sku'   => 'SKU999',
            'nombre'       => 'Válvula de Gas',
            'precio_costo' => 8500,
        ]);
        $this->assertEquals(42, $id);
    }

    public function test_actualizarInsumo_lanza_excepcion_sin_id(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/ID/i');
        $this->service->actualizarInsumo(null, ['nombre' => 'Test']);
    }

    public function test_actualizarInsumo_lanza_excepcion_si_sku_es_muy_corto(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/SKU/i');
        $this->service->actualizarInsumo(1, ['codigo_sku' => 'AB']);
    }

    public function test_actualizarInsumo_decodifica_stock_distribucion_json(): void
    {
        $this->repoMock->expects($this->once())
            ->method('update')
            ->with(1, $this->callback(fn($d) =>
                is_array($d['stock_distribucion']) &&
                $d['stock_distribucion'][0]['ubicacion_id'] === 2
            ), null)
            ->willReturn(true);
        $this->service->actualizarInsumo(1, [
            'stock_distribucion' => json_encode([['ubicacion_id' => 2, 'cantidad' => 10]])
        ]);
    }

    public function test_gestionarStock_lanza_excepcion_si_cantidad_es_cero(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/cantidad/i');
        $this->service->gestionarStock(
            ['cantidad' => 0, 'insumo_id' => 1, 'tipo_movimiento_id' => 1, 'observacion' => ''],
            1
        );
    }

    public function test_gestionarStock_llama_repositorio_correctamente(): void
    {
        $this->repoMock->expects($this->once())
            ->method('ajustarStock')
            ->with(5, 10, 1, 99, 'Entrada', null, null)
            ->willReturn(true);
        $this->service->gestionarStock([
            'insumo_id'          => 5,
            'cantidad'           => 10,
            'tipo_movimiento_id' => 1,
            'observacion'        => 'Entrada',
        ], 99);
    }

    public function test_registrarSalida_lanza_si_falta_insumo_id(): void
    {
        $this->expectException(\Exception::class);
        $this->service->registrarSalida(['cantidad' => 1, 'ubicacion_envio_id' => 1], 1);
    }

    public function test_registrarSalida_lanza_si_cantidad_es_cero(): void
    {
        $this->expectException(\Exception::class);
        $this->service->registrarSalida(['insumo_id' => 1, 'cantidad' => 0, 'ubicacion_envio_id' => 1], 1);
    }

    public function test_registrarSalida_lanza_si_falta_ubicacion_destino(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/ubicaci/i');
        $this->service->registrarSalida(['insumo_id' => 1, 'cantidad' => 5], 1);
    }

    public function test_registrarSalida_inyecta_usuario_id(): void
    {
        $this->repoMock->expects($this->once())
            ->method('registrarSalidaManual')
            ->with($this->callback(fn($d) => $d['usuario_id'] === 7))
            ->willReturn([1]);
        $this->service->registrarSalida([
            'insumo_id'          => 1,
            'cantidad'           => 3,
            'ubicacion_envio_id' => 2,
        ], 7);
    }

    public function test_eliminarInsumo_llama_al_repositorio(): void
    {
        $this->repoMock->expects($this->once())->method('delete')->with(5)->willReturn(true);
        $result = $this->service->eliminarInsumo(5);
        $this->assertTrue($result);
    }

    public function test_obtenerDatosComprobante_acepta_string_de_ids(): void
    {
        $this->repoMock->expects($this->once())
            ->method('getDatosComprobante')
            ->with([1, 2, 3])
            ->willReturn([]);
        $this->service->obtenerDatosComprobante('1,2,3');
    }

    public function test_obtenerDatosComprobante_lanza_si_ids_vacios(): void
    {
        $this->expectException(\Exception::class);
        $this->service->obtenerDatosComprobante('');
    }

    public function test_obtenerDatosComprobante_filtra_ids_invalidos(): void
    {
        $this->repoMock->expects($this->once())
            ->method('getDatosComprobante')
            ->with([1, 3])
            ->willReturn([]);
        $this->service->obtenerDatosComprobante('1,abc,3,0');
    }
}
