<?php
namespace App\Controllers;

use App\Repositories\InsumoRepository;
use App\Repositories\ProveedorRepository;
use App\Repositories\MantencionRepository;
use App\Database\Database;

class ImportController
{
    public function __construct()
    {
    }

    public function plantilla()
    {
        while (ob_get_level())
            ob_end_clean();
        $t = strtolower($_GET['tipo'] ?? $_GET['modulo'] ?? 'insumos');
        $csv = "\xEF\xBB\xBF";

        if ($t === 'insumos') {
            $csv .= "SKU (Opcional: AUTO o vacio);Nombre;Descripcion;Categoria;Stock;Minimo;Unidad;Costo;Moneda\r\n";
            $csv .= "AUTO;\"Tornillo 3mm\";Para madera;Ferreteria;1000;100;UN;50;CLP\r\n";
        } elseif ($t === 'proveedores') {
            $csv .= "RUT;Nombre;Contacto;Telefono;Email;Direccion;Rubro\r\n";
            $csv .= "76123456-7;Ferreteria Industrial Ltda;Juan Perez;912345678;ventas@proveedor.cl;Av Siempreviva 123;Materiales\r\n";
        } elseif ($t === 'activos') {
            $csv .= "Codigo Interno;Codigo Maquina;Nombre;Marca;Modelo;Anio;Serie;Tipo;Ubicacion;Descripcion;Codigo Centro Costo;Frecuencia Mantencion;Unidad (DIAS/SEMANAS/MESES/ANIOS);Estado (OPERATIVO/BAJA)\r\n";
            $csv .= "GEN-001;G-500;Generador Diesel;Caterpillar;C500;2023;XYZ123;Generador;Planta 1;Generador de respaldo;CC-100;6;MESES;OPERATIVO\r\n";
        } elseif ($t === 'kits') {
            $csv .= "Codigo Interno Activo;SKU Insumo;Cantidad\r\n";
            $csv .= "GEN-001;99000123;2\r\n";
        }

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=plantilla_' . $t . '.csv');
        echo $csv;
        exit;
    }

    public function importar($usuarioId)
    {
        ini_set('memory_limit', '512M');
        set_time_limit(600);

        $db = Database::getConnection();
        $tipo = $_POST['modulo'] ?? $_POST['tipo'] ?? null;

        if (!isset($_FILES['archivo']) || !$tipo) {
            echo json_encode(["success" => false, "message" => "Faltan datos."]);
            exit;
        }

        $tmp = $_FILES['archivo']['tmp_name'];
        $h = fopen($tmp, "r");
        if (fread($h, 3) != "\xEF\xBB\xBF")
            rewind($h);
        fclose($h);

        switch ($tipo) {
            case 'insumos':
                $this->importarInsumos($db, $tmp);
                break;
            case 'proveedores':
                $this->importarProveedores($db, $tmp);
                break;
            case 'activos':
                $this->importarActivos($db, $tmp);
                break;
            case 'kits':
                $this->importarKits($db, $tmp);
                break;
            default:
                echo json_encode(["success" => false, "message" => "Tipo inválido"]);
                exit;
        }
    }

    // --- FUNCIONES DE IMPORTACIÓN ---

    private function importarInsumos($db, $ruta)
    {
        $insumoRepo = new InsumoRepository();
        $sep = $this->detectarSeparador($ruta);
        $h = fopen($ruta, "r");

        $ok = 0;
        $err = 0;
        $dup = 0;
        $detalles = [];
        $f = 0;

        while (($row = fgetcsv($h, 0, $sep)) !== FALSE) {
            $f++;
            if ($f === 1)
                continue;
            $row = array_pad($row, 20, '');
            $d = array_map([$this, 'limpiarDato'], $row);
            if (empty($d[1]))
                continue;

            try {
                $catId = $this->getCatId($db, $d[3]);
                $insumoRepo->create([
                    'codigo_sku' => (strtoupper($d[0]) === 'AUTO' || empty($d[0])) ? null : $d[0],
                    'nombre' => $d[1],
                    'descripcion' => $d[2],
                    'categoria_id' => $catId,
                    'stock_actual' => $this->num($d[4]),
                    'stock_minimo' => $this->num($d[5]),
                    'unidad_medida' => $d[6] ?: 'UN',
                    'precio_costo' => $this->num($d[7]),
                    'moneda' => $d[8] ?: 'CLP',
                    'ubicacion_id' => 1
                ]);
                $ok++;
            } catch (\Exception $e) {
                if ($e->getCode() == 23000 || strpos($e->getMessage(), 'Duplicate entry') !== false) {
                    $dup++;
                    $detalles[] = ['fila' => $f, 'item' => $d[1], 'tipo' => 'duplicado', 'msg' => 'SKU ya existe (Omitido)'];
                } else {
                    $err++;
                    $detalles[] = ['fila' => $f, 'item' => $d[1], 'tipo' => 'error', 'msg' => $e->getMessage()];
                }
            }
        }
        fclose($h);
        $this->responder($ok, $err, $dup, $detalles);
    }

    private function importarProveedores($db, $ruta)
    {
        $proveedorRepo = new ProveedorRepository();
        $sep = $this->detectarSeparador($ruta);
        $h = fopen($ruta, "r");

        $ok = 0;
        $err = 0;
        $dup = 0;
        $detalles = [];
        $f = 0;

        while (($row = fgetcsv($h, 0, $sep)) !== FALSE) {
            $f++;
            if ($f === 1)
                continue;
            $d = array_map([$this, 'limpiarDato'], $row);
            if (empty($d[0]))
                continue;

            try {
                $proveedorRepo->create([
                    'rut' => $d[0],
                    'nombre' => $d[1],
                    'contacto_vendedor' => $d[2],
                    'telefono' => $d[3],
                    'email' => $d[4],
                    'direccion' => $d[5],
                    'rubro' => $d[6] ?? ''
                ]);
                $ok++;
            } catch (\Exception $e) {
                if ($e->getCode() == 23000 || strpos($e->getMessage(), 'Duplicate entry') !== false) {
                    $dup++;
                    $detalles[] = ['fila' => $f, 'item' => $d[1], 'tipo' => 'duplicado', 'msg' => 'RUT ya registrado (Omitido)'];
                } else {
                    $err++;
                    $detalles[] = ['fila' => $f, 'item' => $d[1], 'tipo' => 'error', 'msg' => $e->getMessage()];
                }
            }
        }
        fclose($h);
        $this->responder($ok, $err, $dup, $detalles);
    }

    private function importarActivos($db, $ruta)
    {
        $sep = $this->detectarSeparador($ruta);
        $h = fopen($ruta, "r");

        $stmt = $db->prepare("INSERT INTO activos 
            (codigo_interno, codigo_maquina, nombre, marca, modelo, anio, numero_serie, tipo, ubicacion, descripcion, centro_costo_id, frecuencia_mantencion, unidad_frecuencia, estado_activo) 
            VALUES (:ci, :cm, :nom, :mar, :mod, :anio, :ser, :tip, :ubi, :desc, :cc, :frec, :unid, :est)
            ON DUPLICATE KEY UPDATE 
                nombre = VALUES(nombre), marca = VALUES(marca), modelo = VALUES(modelo), 
                centro_costo_id = VALUES(centro_costo_id), frecuencia_mantencion = VALUES(frecuencia_mantencion),
                unidad_frecuencia = VALUES(unidad_frecuencia), estado_activo = VALUES(estado_activo)");

        $ok = 0;
        $err = 0;
        $dup = 0;
        $detalles = [];
        $f = 0;

        while (($row = fgetcsv($h, 1000, $sep)) !== FALSE) {
            $f++;
            if ($f === 1)
                continue;
            $d = array_map([$this, 'limpiarDato'], $row);
            if (empty($d[0]) || empty($d[2]))
                continue;

            try {
                $ccId = null;
                if (!empty($d[10])) {
                    $stmtCC = $db->prepare("SELECT id FROM centros_costo WHERE codigo = :c LIMIT 1");
                    $stmtCC->execute([':c' => $d[10]]);
                    $ccId = $stmtCC->fetchColumn() ?: null;
                }

                $stmt->execute([
                    ':ci' => $d[0],
                    ':cm' => $d[1] ?? '',
                    ':nom' => $d[2],
                    ':mar' => $d[3] ?? '',
                    ':mod' => $d[4] ?? '',
                    ':anio' => (int) ($d[5] ?? 0),
                    ':ser' => $d[6] ?? '',
                    ':tip' => $d[7] ?? '',
                    ':ubi' => $d[8] ?? '',
                    ':desc' => $d[9] ?? '',
                    ':cc' => $ccId,
                    ':frec' => (int) ($d[11] ?? 0),
                    ':unid' => strtoupper($d[12] ?? 'MESES'),
                    ':est' => strtoupper($d[13] ?? 'OPERATIVO')
                ]);
                $ok++;
            } catch (\Exception $e) {
                $err++;
                $detalles[] = ['fila' => $f, 'item' => $d[0], 'tipo' => 'error', 'msg' => $e->getMessage()];
            }
        }
        fclose($h);
        $this->responder($ok, $err, 0, $detalles);
    }

    private function importarKits($db, $ruta)
    {
        $sep = $this->detectarSeparador($ruta);
        $h = fopen($ruta, "r");

        $stmtInsert = $db->prepare("INSERT INTO kit_repuestos (activo_id, insumo_id, cantidad) 
                                    VALUES (:aid, :iid, :cant) 
                                    ON DUPLICATE KEY UPDATE cantidad = :cant");

        $cacheActivos = [];
        $cacheInsumos = [];
        $ok = 0;
        $err = 0;
        $detalles = [];
        $f = 0;

        while (($row = fgetcsv($h, 1000, $sep)) !== FALSE) {
            $f++;
            if ($f === 1)
                continue;
            $d = array_map([$this, 'limpiarDato'], $row);
            if (empty($d[0]) || empty($d[1]))
                continue;

            try {
                if (!isset($cacheActivos[$d[0]])) {
                    $stmtA = $db->prepare("SELECT id FROM activos WHERE codigo_interno = :c LIMIT 1");
                    $stmtA->execute([':c' => $d[0]]);
                    $id = $stmtA->fetchColumn();
                    if (!$id)
                        throw new \Exception("Activo no encontrado: $d[0]");
                    $cacheActivos[$d[0]] = $id;
                }

                if (!isset($cacheInsumos[$d[1]])) {
                    $stmtI = $db->prepare("SELECT id FROM insumos WHERE codigo_sku = :s LIMIT 1");
                    $stmtI->execute([':s' => $d[1]]);
                    $id = $stmtI->fetchColumn();
                    if (!$id)
                        throw new \Exception("Insumo no encontrado: $d[1]");
                    $cacheInsumos[$d[1]] = $id;
                }

                $stmtInsert->execute([':aid' => $cacheActivos[$d[0]], ':iid' => $cacheInsumos[$d[1]], ':cant' => $this->num($d[2] ?? 1)]);
                $ok++;
            } catch (\Exception $e) {
                $err++;
                $detalles[] = ['fila' => $f, 'item' => "$d[0] - $d[1]", 'tipo' => 'error', 'msg' => $e->getMessage()];
            }
        }
        fclose($h);
        $this->responder($ok, $err, 0, $detalles);
    }

    private function responder($ok, $err, $dup, $detalles)
    {
        echo json_encode([
            "success" => true,
            "resumen" => ["ok" => $ok, "error" => $err, "duplicados" => $dup],
            "detalles" => $detalles
        ]);
        exit;
    }

    // --- UTILS (Igual que antes) ---
    private function detectarSeparador($ruta)
    {
        $h = fopen($ruta, "r");
        $l = fgets($h);
        fclose($h);
        return (substr_count($l, ';') >= substr_count($l, ',')) ? ';' : ',';
    }
    private function limpiarDato($d)
    {
        return $d === null ? '' : mb_convert_encoding(trim($d), 'UTF-8', 'auto');
    }
    private function num($val)
    {
        return floatval(str_replace(',', '.', str_replace('.', '', $val ?: 0)));
    }
    private function getCatId($db, $n)
    {
        $n = $this->limpiarDato($n);
        if (empty($n))
            return null;
        $s = $db->prepare("SELECT id FROM categorias_insumo WHERE nombre = ? LIMIT 1");
        $s->execute([$n]);
        $id = $s->fetchColumn();
        if (!$id) {
            $db->prepare("INSERT INTO categorias_insumo (nombre) VALUES (?)")->execute([$n]);
            $id = $db->lastInsertId();
        }
        return $id;
    }
}