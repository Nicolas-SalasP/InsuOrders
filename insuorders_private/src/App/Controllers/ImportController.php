<?php
namespace App\Controllers;

use App\Repositories\InsumoRepository;
use App\Repositories\ProveedorRepository;
use App\Repositories\MantencionRepository;
use App\Database\Database;

class ImportController
{
    // Constructor VACÍO: Clave para que la plantilla no cargue la BD innecesariamente
    public function __construct()
    {
    }

    // -------------------------------------------------------------------------
    // 1. PLANTILLA MAESTRA (Aislada de la BD)
    // -------------------------------------------------------------------------
    public function plantilla()
    {
        // Limpieza extrema
        while (ob_get_level())
            ob_end_clean();

        $t = strtolower($_GET['tipo'] ?? $_GET['modulo'] ?? 'insumos');
        $csv = "\xEF\xBB\xBF"; // BOM UTF-8

        // DATOS ESTÁTICOS (Copiados de tus archivos)
        if ($t === 'insumos') {
            $csv .= "SKU (Opcional: AUTO o dejelo vacio);Nombre;Descripcion;Categoria;Stock;Minimo;Unidad;Costo;Moneda\r\n";
            $csv .= "AUTO;\"Tornillo 2\"\"\";Para madera;Ferreteria;1000;100;UN;50;CLP\r\n";
            $csv .= "990000071990005;Tuerca Hex;Acero;Ferreteria;500;20;UN;10;CLP\r\n";
        } elseif ($t === 'proveedores') {
            $csv .= "Nombre Empresa;RUT;Contacto;Telefono;Email;Direccion;Condicion Venta;Pais;Region;Comuna\r\n";
            $csv .= "Ferreteria Ej;76.111.222-3;Juan P.;999888777;contacto@ej.cl;Calle 123;Credito;Chile;Metropolitana;Santiago\r\n";
        } elseif ($t === 'activos') {
            $csv .= "Codigo Interno;Nombre Activo;Tipo;Ubicacion;Descripcion;Centro Costo\r\n";
            $csv .= "MAQ-01;Torno CNC;Maquinaria;Taller 1;Operativo;6021\r\n";
        } else {
            $csv .= "Error;Modulo no reconocido\r\n";
        }

        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="plantilla_' . $t . '.csv"');
        header('Content-Length: ' . strlen($csv));
        header('Pragma: no-cache');
        header('Expires: 0');

        echo $csv;
        exit;
    }

    // -------------------------------------------------------------------------
    // 2. IMPORTACIÓN (Carga la BD solo cuando se necesita)
    // -------------------------------------------------------------------------
    public function importar($usuarioId)
    {
        ini_set('memory_limit', '512M');
        set_time_limit(600);

        // Instanciamos aquí adentro para no afectar la función plantilla
        $db = Database::getConnection();
        $insumoRepo = new InsumoRepository();
        $proveedorRepo = new ProveedorRepository();
        $mantencionRepo = new MantencionRepository();

        $tipo = $_POST['modulo'] ?? $_POST['tipo'] ?? null;

        if (!isset($_FILES['archivo']) || !$tipo) {
            echo json_encode(["success" => false, "message" => "Faltan datos."]);
            exit;
        }

        $tmp = $_FILES['archivo']['tmp_name'];
        $sep = $this->detectarSeparador($tmp);
        $h = fopen($tmp, "r");
        if (fread($h, 3) != "\xEF\xBB\xBF")
            rewind($h);

        $ok = 0;
        $err = 0;
        $listaErrores = [];
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
                if ($tipo === 'insumos') {
                    // SKU, Nombre, Desc, Cat, Stock, Min, Unid, Costo, Moneda
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
                } elseif ($tipo === 'proveedores') {
                    $proveedorRepo->create([
                        'nombre' => $d[0],
                        'rut' => $d[1],
                        'contacto_vendedor' => $d[2],
                        'telefono' => $d[3],
                        'email' => $d[4],
                        'direccion' => $d[5]
                    ]);
                } elseif ($tipo === 'activos') {
                    $mantencionRepo->createActivo([
                        'codigo_interno' => $d[0],
                        'nombre' => $d[1],
                        'tipo' => $d[2] ?: 'General',
                        'ubicacion' => $d[3],
                        'descripcion' => $d[4],
                        'centro_costo' => $d[5]
                    ]);
                }
                $ok++;
            } catch (\Exception $e) {
                $err++;
                $listaErrores[] = ["fila" => $f, "item" => $d[1], "error" => $e->getMessage()];
            }
        }
        fclose($h);
        echo json_encode(["success" => true, "message" => "OK: $ok, Errores: $err", "detalles" => ["lista_errores" => $listaErrores]]);
        exit;
    }

    // --- UTILS PRIVADOS ---
    private function detectarSeparador($ruta)
    {
        $h = fopen($ruta, "r");
        $l = fgets($h);
        fclose($h);
        return (substr_count($l, ';') >= substr_count($l, ',')) ? ';' : ',';
    }

    private function limpiarDato($d)
    {
        if ($d === null)
            return '';
        return mb_convert_encoding(trim($d), 'UTF-8', 'auto');
    }

    private function num($val)
    {
        return floatval(str_replace(',', '.', $val ?: 0));
    }

    private function getCatId($db, $n)
    {
        $n = $this->limpiarDato($n);
        if (empty($n))
            return null;
        $s = $db->prepare("SELECT id FROM categorias_insumo WHERE nombre = ? LIMIT 1");
        $s->execute([$n]);
        return $s->fetchColumn() ?: ($db->prepare("INSERT INTO categorias_insumo (nombre) VALUES (?)")->execute([$n]) ? $db->lastInsertId() : null);
    }
}