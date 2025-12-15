<?php
namespace App\Controllers;

use App\Repositories\InsumoRepository;
use App\Repositories\ProveedorRepository;
use App\Repositories\MantencionRepository;
use App\Database\Database;

class ImportController
{
    private $db;
    private $insumoRepo;
    private $proveedorRepo;
    private $mantencionRepo;

    public function __construct()
    {
        $this->db = Database::getConnection();
        $this->insumoRepo = new InsumoRepository();
        $this->proveedorRepo = new ProveedorRepository();
        $this->mantencionRepo = new MantencionRepository();
    }

    private function detectarSeparador($rutaArchivo)
    {
        $handle = fopen($rutaArchivo, "r");
        $primeraLinea = fgets($handle);
        fclose($handle);
        return (strpos($primeraLinea, ';') !== false) ? ';' : ',';
    }

    // --- HELPERS ---

    private function getCategoriaId($nombre)
    {
        $nombre = trim($nombre);
        if (empty($nombre)) return 1;
        $id = $this->db->query("SELECT id FROM categorias_insumo WHERE nombre = '$nombre'")->fetchColumn();
        if ($id) return $id;
        $this->db->query("INSERT INTO categorias_insumo (nombre, descripcion) VALUES ('$nombre', 'Importado')");
        return $this->db->lastInsertId();
    }

    private function getIdPorNombre($tabla, $nombre)
    {
        $nombre = trim($nombre);
        if (empty($nombre)) return null;
        $stmt = $this->db->prepare("SELECT id FROM $tabla WHERE nombre LIKE :nom LIMIT 1");
        $stmt->execute([':nom' => "%$nombre%"]);
        return $stmt->fetchColumn() ?: null;
    }

    private function getTipoVentaId($nombre)
    {
        $nombre = trim($nombre);
        if (empty($nombre)) return 1;
        $stmt = $this->db->prepare("SELECT id FROM tipos_venta WHERE descripcion LIKE :nom LIMIT 1");
        $stmt->execute([':nom' => "%$nombre%"]);
        return $stmt->fetchColumn() ?: 1;
    }

    // HELPER NUEVO: Buscar ID por Código de Centro de Costo
    private function getCentroCostoId($codigo)
    {
        $codigo = trim($codigo);
        if (empty($codigo)) return null;
        $stmt = $this->db->prepare("SELECT id FROM centros_costo WHERE codigo = :cod LIMIT 1");
        $stmt->execute([':cod' => $codigo]);
        return $stmt->fetchColumn() ?: null;
    }

    // --- LÓGICA PRINCIPAL ---

    public function importar($usuarioId)
    {
        if (!isset($_FILES['archivo']) || !isset($_POST['tipo'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos."]);
            return;
        }

        $tipo = $_POST['tipo'];
        $archivoTmp = $_FILES['archivo']['tmp_name'];
        $separador = $this->detectarSeparador($archivoTmp);

        if (($handle = fopen($archivoTmp, "r")) !== FALSE) {
            $fila = 0;
            $exitos = 0;
            $errores = 0;

            $bom = fread($handle, 3);
            if ($bom != "\xEF\xBB\xBF") rewind($handle);

            while (($datos = fgetcsv($handle, 1000, $separador)) !== FALSE) {
                $fila++;
                if ($fila === 1 || empty($datos[0])) continue;

                try {
                    $this->db->beginTransaction();

                    switch ($tipo) {
                        case 'insumos':
                            $catId = $this->getCategoriaId($datos[3]);
                            $this->insumoRepo->create([
                                'codigo_sku' => null,
                                'nombre' => $datos[1],
                                'descripcion' => $datos[2] ?? '',
                                'categoria_id' => $catId,
                                'stock_actual' => floatval(str_replace(',', '.', $datos[4])),
                                'stock_minimo' => floatval(str_replace(',', '.', $datos[5])),
                                'unidad_medida' => strtoupper($datos[6]),
                                'precio_costo' => floatval(str_replace(',', '.', $datos[7])),
                                'moneda' => !empty($datos[8]) ? strtoupper($datos[8]) : 'CLP',
                                'ubicacion_id' => null
                            ]);
                            break;

                        case 'proveedores':
                            $tipoVentaId = $this->getTipoVentaId($datos[6] ?? 'Contado');
                            $paisId = $this->getIdPorNombre('paises', $datos[7] ?? 'Chile');
                            $regionId = $this->getIdPorNombre('regiones', $datos[8] ?? '');
                            $comunaId = $this->getIdPorNombre('comunas', $datos[9] ?? '');

                            $this->proveedorRepo->create([
                                'nombre' => $datos[0],
                                'rut' => $datos[1],
                                'contacto_vendedor' => $datos[2],
                                'telefono' => $datos[3],
                                'email' => $datos[4],
                                'direccion' => $datos[5] ?? '',
                                'tipo_venta_id' => $tipoVentaId,
                                'pais_id' => $paisId,
                                'region_id' => $regionId,
                                'comuna_id' => $comunaId
                            ]);
                            break;

                        case 'activos':
                            // COLUMNAS ESPERADAS: 0:Cod, 1:Nom, 2:Tipo, 3:Ubi, 4:Desc, 5:CodCentroCosto
                            
                            $ccId = null;
                            if (!empty($datos[5])) {
                                $ccId = $this->getCentroCostoId($datos[5]); // Traducimos 6021 -> ID
                            }

                            $this->mantencionRepo->createActivo([
                                'codigo_interno' => $datos[0],
                                'nombre'         => $datos[1],
                                'tipo'           => $datos[2],
                                'ubicacion'      => $datos[3],
                                'descripcion'    => $datos[4] ?? '',
                                'centro_costo'   => $ccId // Enviamos el ID al repo
                            ]);
                            break;
                    }

                    $this->db->commit();
                    $exitos++;

                } catch (\Exception $e) {
                    $this->db->rollBack();
                    $errores++;
                }
            }
            fclose($handle);

            $mensajeFinal = "Proceso finalizado. Importados: $exitos. Errores/Duplicados: $errores. (Separador: '$separador')";
            $this->registrarLog($usuarioId, $tipo, $mensajeFinal);

            echo json_encode(["success" => true, "message" => $mensajeFinal]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al abrir archivo."]);
        }
    }

    public function plantilla()
    {
        $tipo = $_GET['tipo'] ?? '';
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="plantilla_' . $tipo . '.csv"');
        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));
        $sep = ';';

        switch ($tipo) {
            case 'insumos':
                fputcsv($output, ['SKU (Auto)', 'Nombre', 'Descripcion', 'Categoria', 'Stock', 'Minimo', 'Unidad', 'Precio', 'Moneda'], $sep);
                fputcsv($output, ['AUTO', 'Tornillo', 'Desc', 'Ferreteria', '100', '10', 'UN', '500', 'CLP'], $sep);
                break;

            case 'proveedores':
                fputcsv($output, ['Nombre Empresa', 'RUT', 'Contacto', 'Telefono', 'Email', 'Direccion', 'Condicion Venta (Credito/Contado)', 'Pais', 'Region', 'Comuna'], $sep);
                fputcsv($output, ['Ferreteria X', '76.111.111-1', 'Juan Perez', '999999', 'x@x.cl', 'Calle 123', 'Credito', 'Chile', 'Metropolitana', 'Santiago'], $sep);
                break;

            case 'activos':
                // PLANTILLA MEJORADA
                fputcsv($output, [
                    'Codigo Interno (Ej: MAQ-01)', 
                    'Nombre Activo', 
                    'Tipo (Maquinaria, Vehiculo...)', 
                    'Ubicacion Fisica', 
                    'Descripcion / Detalles', 
                    'Codigo Centro Costo (Ej: 6021)'
                ], $sep);
                
                fputcsv($output, [
                    'GEN-X500', 
                    'Generador de Respaldo', 
                    'Infraestructura', 
                    'Patio Trasero', 
                    'Generador diesel 500kva', 
                    '6021'
                ], $sep);
                break;
        }
        fclose($output);
        exit;
    }

    private function registrarLog($uid, $tipo, $msg)
    {
        $this->db->prepare("INSERT INTO sistema_logs (usuario_id, modulo, accion, detalle, ip_address, fecha) VALUES (:u, 'Importacion', :a, :d, :ip, NOW())")
            ->execute([':u' => $uid, ':a' => "Carga Masiva: " . ucfirst($tipo), ':d' => $msg, ':ip' => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0']);
    }
}