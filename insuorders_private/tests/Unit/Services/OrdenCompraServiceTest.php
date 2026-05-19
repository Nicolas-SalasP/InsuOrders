<?php
namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\OrdenCompraService;
use App\Repositories\OrdenCompraRepository;
use App\Repositories\InsumoRepository;
use App\Repositories\ProveedorRepository;

class OrdenCompraServiceTest extends TestCase
{
    private OrdenCompraService $service;
    private $ocRepoMock;
    private $insumoRepoMock;
    private $proveedorRepoMock;
    private $dbMock;

    protected function setUp(): void
    {
        $this->ocRepoMock        = $this->createMock(OrdenCompraRepository::class);
        $this->insumoRepoMock    = $this->createMock(InsumoRepository::class);
        $this->proveedorRepoMock = $this->createMock(ProveedorRepository::class);

        $inTransaction = false;
        $this->dbMock  = $this->createMock(\PDO::class);
        $this->dbMock->method('inTransaction')
            ->willReturnCallback(function () use (&$inTransaction) {
                return $inTransaction;
            });
        $this->dbMock->method('beginTransaction')
            ->willReturnCallback(function () use (&$inTransaction) {
                $inTransaction = true;
                return true;
            });
        $this->dbMock->method('commit')
            ->willReturnCallback(function () use (&$inTransaction) {
                $inTransaction = false;
                return true;
            });
        $this->dbMock->method('rollBack')
            ->willReturnCallback(function () use (&$inTransaction) {
                $inTransaction = false;
                return true;
            });

        $this->service = new OrdenCompraService();
        $this->inject('repo',          $this->ocRepoMock);
        $this->inject('insumoRepo',    $this->insumoRepoMock);
        $this->inject('proveedorRepo', $this->proveedorRepoMock);
        $this->inject('db',            $this->dbMock);
    }

    private function inject(string $prop, object $mock): void
    {
        $ref = new \ReflectionProperty(OrdenCompraService::class, $prop);
        $ref->setAccessible(true);
        $ref->setValue($this->service, $mock);
    }

    public function test_crearOrden_lanza_si_no_hay_items(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/items/i');
        $this->service->crearOrden(['proveedor_id' => 1, 'items' => []], 1);
    }

    public function test_crearOrden_lanza_si_no_hay_proveedor(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/proveedor/i');
        $this->service->crearOrden([
            'items' => [['id' => 1, 'cantidad' => 1, 'precio' => 100]],
        ], 1);
    }

    public function test_crearOrden_calcula_iva_19_por_defecto(): void
    {
        $this->ocRepoMock->method('create')->willReturnCallback(function ($data) {
            $this->assertEqualsWithDelta(1900.0, $data['impuesto'], 0.01);
            $this->assertEqualsWithDelta(11900.0, $data['total'], 0.01);
            return 1;
        });
        $this->ocRepoMock->method('addDetalle')->willReturn(true);
        $this->service->crearOrden([
            'proveedor_id' => 1,
            'items'        => [['id' => 1, 'cantidad' => 1, 'precio' => 10000]],
        ], 1);
    }

    public function test_crearOrden_usa_iva_personalizado(): void
    {
        $this->ocRepoMock->method('create')->willReturnCallback(function ($data) {
            $this->assertEqualsWithDelta(0.0, $data['impuesto'], 0.01);
            $this->assertEqualsWithDelta(10000.0, $data['total'], 0.01);
            return 1;
        });
        $this->ocRepoMock->method('addDetalle')->willReturn(true);
        $this->service->crearOrden([
            'proveedor_id'        => 1,
            'impuesto_porcentaje' => 0,
            'items'               => [['id' => 1, 'cantidad' => 1, 'precio' => 10000]],
        ], 1);
    }

    public function test_crearOrden_suma_multiples_items(): void
    {
        $this->ocRepoMock->method('create')->willReturnCallback(function ($data) {
            $this->assertEqualsWithDelta(7000.0, $data['neto'], 0.01);
            return 1;
        });
        $this->ocRepoMock->method('addDetalle')->willReturn(true);
        $this->service->crearOrden([
            'proveedor_id' => 1,
            'items'        => [
                ['id' => 1, 'cantidad' => 3, 'precio' => 1000],
                ['id' => 2, 'cantidad' => 2, 'precio' => 2000],
            ],
        ], 1);
    }

    public function test_crearOrden_crea_insumo_si_no_tiene_id(): void
    {
        $this->insumoRepoMock->expects($this->once())->method('create')->willReturn(99);
        $this->ocRepoMock->method('create')->willReturn(1);
        $this->ocRepoMock->method('addDetalle')->willReturnCallback(function ($item) {
            $this->assertEquals(99, $item['insumo_id']);
        });
        $this->service->crearOrden([
            'proveedor_id' => 1,
            'items'        => [['nombre' => 'Nuevo Repuesto', 'cantidad' => 1, 'precio' => 500, 'unidad' => 'UN']],
        ], 1);
    }

    public function test_crearOrden_usa_moneda_CLP_por_defecto(): void
    {
        $this->ocRepoMock->method('create')->willReturnCallback(function ($data) {
            $this->assertEquals('CLP', $data['moneda']);
            return 1;
        });
        $this->ocRepoMock->method('addDetalle')->willReturn(true);
        $this->service->crearOrden([
            'proveedor_id' => 1,
            'items'        => [['id' => 1, 'cantidad' => 1, 'precio' => 100]],
        ], 1);
    }

    public function test_crearOrden_retorna_id_generado(): void
    {
        $this->ocRepoMock->method('create')->willReturn(55);
        $this->ocRepoMock->method('addDetalle')->willReturn(true);
        $id = $this->service->crearOrden([
            'proveedor_id' => 1,
            'items'        => [['id' => 1, 'cantidad' => 1, 'precio' => 100]],
        ], 1);
        $this->assertEquals(55, $id);
    }

    public function test_crearOrden_hace_rollback_si_falla(): void
    {
        $this->ocRepoMock->method('create')->willThrowException(new \Exception('DB error'));
        $this->dbMock->expects($this->once())->method('rollBack');
        $this->expectException(\Exception::class);
        $this->service->crearOrden([
            'proveedor_id' => 1,
            'items'        => [['id' => 1, 'cantidad' => 1, 'precio' => 100]],
        ], 1);
    }
}
