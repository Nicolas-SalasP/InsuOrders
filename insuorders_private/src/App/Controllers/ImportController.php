<?php
namespace App\Controllers;

use App\Repositories\InsumoRepository;
use App\Repositories\ProveedorRepository;
use App\Repositories\MantencionRepository;
use App\Database\Database;
use PDO;

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

    // ====================================================================================
    // 1. HELPERS Y UTILIDADES
    // ====================================================================================

    private function logDebug($msg)
    {
        error_log("[IMPORT] " . $msg);
    }

    private function detectarSeparador($ruta)
    {
        $h = fopen($ruta, "r");
        if (!$h)
            return ';';
        $linea = fgets($h);
        fclose($h);
        if (!$linea)
            return ';';

        $puntosComa = substr_count($linea, ';');
        $comas = substr_count($linea, ',');
        $tabs = substr_count($linea, "\t");

        if ($tabs > $puntosComa && $tabs > $comas)
            return "\t";
        if ($comas > $puntosComa)
            return ',';
        return ';';
    }

    private function limpiarDato($d)
    {
        if ($d === null)
            return '';
        return trim(mb_convert_encoding($d, 'UTF-8', mb_detect_encoding($d, 'UTF-8, ISO-8859-1, Windows-1252', true)));
    }

    private function obtenerUltimoSkuSecuencial()
    {
        $sql = "SELECT MAX(CAST(codigo_sku AS UNSIGNED)) 
                FROM insumos 
                WHERE codigo_sku LIKE '99000007199%' 
                AND codigo_sku REGEXP '^[0-9]+$'";

        $stmt = $this->db->query($sql);
        $ultimo = $stmt->fetchColumn();

        if (!$ultimo) {
            return 990000071990000 - 1;
        }

        return (int) $ultimo;
    }

    // ====================================================================================
    // 2. BÚSQUEDAS EN BASE DE DATOS
    // ====================================================================================

    private function getIdPorNombre($tbl, $nom, $def = null)
    {
        $nom = $this->limpiarDato($nom);
        if (empty($nom))
            return $def;

        $s = $this->db->prepare("SELECT id FROM $tbl WHERE nombre = :n LIMIT 1");
        $s->execute([':n' => $nom]);
        if ($id = $s->fetchColumn())
            return $id;

        $s = $this->db->prepare("SELECT id FROM $tbl WHERE nombre LIKE :n LIMIT 1");
        $s->execute([':n' => "%$nom%"]);
        return $s->fetchColumn() ?: $def;
    }

    private function getTipoVentaId($n)
    {
        $n = $this->limpiarDato($n);
        if (empty($n))
            return 1;
        $s = $this->db->prepare("SELECT id FROM tipos_venta WHERE descripcion LIKE :n LIMIT 1");
        $s->execute([':n' => "%$n%"]);
        return $s->fetchColumn() ?: 1;
    }

    private function getCategoriaId($n)
    {
        $n = $this->limpiarDato($n);
        if (empty($n))
            return 1;

        $id = $this->getIdPorNombre('categorias_insumo', $n);
        if ($id)
            return $id;

        $this->db->prepare("INSERT INTO categorias_insumo (nombre, descripcion) VALUES (:n, 'Importado')")->execute([':n' => $n]);
        return $this->db->lastInsertId();
    }

    private function getCentroCostoId($c)
    {
        $c = trim($c);
        if (empty($c))
            return null;
        $s = $this->db->prepare("SELECT id FROM centros_costo WHERE codigo = :c LIMIT 1");
        $s->execute([':c' => $c]);
        return $s->fetchColumn() ?: null;
    }

    // ====================================================================================
    // 3. PROCESO DE IMPORTACIÓN
    // ====================================================================================

    public function importar($usuarioId)
    {
        ini_set('memory_limit', '256M');
        set_time_limit(300);
        ini_set('display_errors', 0);
        ini_set('log_errors', 1);

        $res = ["success" => false, "message" => "", "detalles" => []];

        try {
            $tipo = $_POST['tipo'] ?? $_POST['modulo'] ?? null;

            if (!isset($_FILES['archivo']) || !$tipo)
                throw new \Exception("Faltan datos.");
            if ($_FILES['archivo']['error'] !== 0)
                throw new \Exception("Error archivo: " . $_FILES['archivo']['error']);

            $tmp = $_FILES['archivo']['tmp_name'];
            $sep = $this->detectarSeparador($tmp);

            if (($h = fopen($tmp, "r")) === FALSE)
                throw new \Exception("No se lee archivo.");
            if (fread($h, 3) != "\xEF\xBB\xBF")
                rewind($h);
            $secuenciaSkuActual = 0;
            if ($tipo === 'insumos') {
                $secuenciaSkuActual = $this->obtenerUltimoSkuSecuencial();
            }

            $f = 0;
            $ok = 0;
            $err = 0;
            $errList = [];

            while (($row = fgetcsv($h, 0, $sep)) !== FALSE) {
                $f++;
                if ($f === 1)
                    continue;
                $d = array_map([$this, 'limpiarDato'], $row);
                if (empty($d[0]) && count($d) < 2)
                    continue;

                try {
                    $this->db->beginTransaction();

                    switch ($tipo) {
                        case 'insumos':
                            if (!isset($d[1]))
                                throw new \Exception("Falta Nombre.");

                            $skuInput = isset($d[0]) ? strtoupper(trim($d[0])) : '';

                            if ($skuInput === '' || $skuInput === 'AUTO') {
                                $secuenciaSkuActual++;
                                $skuFinal = (string) $secuenciaSkuActual;
                            } else {
                                $skuFinal = $skuInput;
                            }

                            $this->insumoRepo->create([
                                'codigo_sku' => $skuFinal,
                                'nombre' => $d[1],
                                'descripcion' => $d[2] ?? '',
                                'categoria_id' => $this->getCategoriaId($d[3] ?? 'General'),
                                'stock_actual' => floatval(str_replace(',', '.', $d[4] ?? 0)),
                                'stock_minimo' => floatval(str_replace(',', '.', $d[5] ?? 0)),
                                'unidad_medida' => strtoupper($d[6] ?? 'UN'),
                                'precio_costo' => floatval(str_replace(',', '.', $d[7] ?? 0)),
                                'moneda' => !empty($d[8]) ? strtoupper($d[8]) : 'CLP',
                                'ubicacion_id' => null
                            ]);
                            break;

                        case 'proveedores':
                            if (count($d) < 2)
                                throw new \Exception("Fila incompleta.");
                            if ($this->proveedorRepo->existeRut($d[1]))
                                throw new \Exception("RUT {$d[1]} existe.");

                            $cid = $this->getIdPorNombre('comunas', $d[9] ?? '');
                            if (!empty($d[9]) && !$cid)
                                throw new \Exception("Comuna '{$d[9]}' no existe.");

                            $this->proveedorRepo->create([
                                'nombre' => $d[0],
                                'rut' => $d[1],
                                'contacto_vendedor' => $d[2] ?? '',
                                'telefono' => $d[3] ?? '',
                                'email' => $d[4] ?? '',
                                'direccion' => $d[5] ?? '',
                                'tipo_venta_id' => $this->getTipoVentaId($d[6] ?? ''),
                                'pais_id' => $this->getIdPorNombre('paises', $d[7] ?? 'Chile', 1),
                                'region_id' => $this->getIdPorNombre('regiones', $d[8] ?? ''),
                                'comuna_id' => $cid
                            ]);
                            break;

                        case 'activos':
                            if (!isset($d[1]))
                                throw new \Exception("Falta Nombre.");
                            $this->mantencionRepo->createActivo([
                                'codigo_interno' => $d[0] ?? null,
                                'nombre' => $d[1],
                                'tipo' => $d[2] ?? 'General',
                                'ubicacion' => $d[3] ?? '',
                                'descripcion' => $d[4] ?? '',
                                'centro_costo' => (!empty($d[5]) ? $this->getCentroCostoId($d[5]) : null)
                            ]);
                            break;
                    }
                    $this->db->commit();
                    $ok++;
                } catch (\Exception $e) {
                    if ($this->db->inTransaction())
                        $this->db->rollBack();
                    $err++;
                    $errList[] = "Fila $f: " . $e->getMessage();
                }
            }
            fclose($h);

            $res["success"] = true;
            $res["message"] = "Proceso: $ok OK, $err Errores.";
            $res["detalles"] = ["importados" => $ok, "errores_count" => $err, "lista_errores" => array_slice($errList, 0, 50)];

            try {
                $sql = "INSERT INTO sistema_logs (usuario_id, accion, tabla_afectada, descripcion, fecha) VALUES (:u, :a, 'Import', :d, NOW())";
                $this->db->prepare($sql)->execute([':u' => $usuarioId, ':a' => "Carga $tipo", ':d' => "OK:$ok, ERR:$err"]);
            } catch (\Exception $e) {
            }

        } catch (\Throwable $e) {
            http_response_code(500);
            $res["message"] = "Error Crítico: " . $e->getMessage();
            $this->logDebug("CRASH: " . $e->getMessage());
        }

        header('Content-Type: application/json');
        echo json_encode($res);
        exit;
    }

    public function plantilla()
    {
        $t = $_GET['tipo'] ?? '';
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="plantilla_' . $t . '.csv"');

        $o = fopen('php://output', 'w');
        fprintf($o, chr(0xEF) . chr(0xBB) . chr(0xBF));
        $sep = ';';

        if ($t === 'insumos') {
            fputcsv($o, ['SKU (Opcional: AUTO o dejelo vacio)', 'Nombre', 'Descripcion', 'Categoria', 'Stock', 'Minimo', 'Unidad', 'Costo', 'Moneda'], $sep);
            fputcsv($o, ['AUTO', 'Tornillo 2"', 'Para madera', 'Ferreteria', '1000', '100', 'UN', '50', 'CLP'], $sep);
            // Ejemplo con tu secuencia real
            fputcsv($o, ['990000071990005', 'Tuerca Hex', 'Acero', 'Ferreteria', '500', '20', 'UN', '10', 'CLP'], $sep);
        } elseif ($t === 'proveedores') {
            fputcsv($o, ['Nombre Empresa', 'RUT', 'Contacto', 'Telefono', 'Email', 'Direccion', 'Condicion Venta', 'Pais', 'Region', 'Comuna'], $sep);
            fputcsv($o, ['Ferreteria Ej', '76.111.222-3', 'Juan P.', '999888777', 'contacto@ej.cl', 'Calle 123', 'Credito', 'Chile', 'Metropolitana', 'Santiago'], $sep);
        } elseif ($t === 'activos') {
            fputcsv($o, ['Codigo Interno', 'Nombre Activo', 'Tipo', 'Ubicacion', 'Descripcion', 'Centro Costo'], $sep);
            fputcsv($o, ['MAQ-01', 'Torno CNC', 'Maquinaria', 'Taller 1', 'Operativo', '6021'], $sep);
        }

        fclose($o);
        exit;
    }
}