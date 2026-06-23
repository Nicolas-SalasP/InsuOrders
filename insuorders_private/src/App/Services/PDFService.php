<?php
namespace App\Services;

use FPDF;

class PDFService extends FPDF
{
    private $orden = [];
    private $tipoDocumento = 'OC'; // OC | OT | ENTREGA | COTIZACION
    private $colores = [
        'primary' => [51, 102, 153],
        'secondary' => [100, 100, 100],
        'table_header' => [230, 230, 230],
        'total_bg' => [240, 240, 240]
    ];
    private $empresa = [
        'nombre' => 'Procesadora Insuban Spa.',
        'rut' => '78.730.890-2',
        'giro' => 'ELABORACION Y CONSERVACION DE CARNE Y PRODUCTOS CARNICOS',
        'dir' => 'Antillanca Norte 391, Pudahuel',
        'web' => 'www.insuban.cl',
        'mail' => 'operaciones@insuban.cl'
    ];

    public function setOrdenData($orden)
    {
        $this->orden = $orden;
        $this->SetTitle('OC #' . $orden['id'] . ' - ' . $this->txt($orden['proveedor']), true);
    }

    private function txt($str)
    {
        return mb_convert_encoding((string)($str ?? ''), 'ISO-8859-1', 'UTF-8');
    }

    private function fmt($valor)
    {
        $moneda = $this->orden['moneda'] ?? 'CLP';
        if ($moneda === 'CLP') {
            return '$' . number_format((float) $valor, 0, '', '.');
        }
        return number_format((float) $valor, 2, '.', ',');
    }

    // --- CABECERA DE PÁGINA ---
    function Header()
    {
        if (empty($this->orden) || $this->tipoDocumento !== 'OC')
            return;

        // 1. Franja Decorativa Superior
        $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->Rect(0, 0, 210, 5, 'F');

        // 2. Logo
        $logoPath = __DIR__ . '/../../../../public_html/assets/img/LogoInsuban_SinFondo.png';
        $yStart = 15;
        if (file_exists($logoPath)) {
            $this->Image($logoPath, 10, 8, 55);
            $yStart = 25;
        }

        // 3. Datos Empresa
        $this->SetXY(10, $yStart);
        $this->SetFont('Arial', 'B', 12);
        $this->SetTextColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->Cell(90, 5, $this->txt($this->empresa['nombre']), 0, 1);

        $this->SetFont('Arial', 'B', 8);
        $this->SetTextColor(50);
        $this->Cell(90, 4, 'RUT: ' . $this->empresa['rut'], 0, 1);

        $this->SetFont('Arial', '', 8);
        $this->Cell(90, 4, $this->txt($this->empresa['giro']), 0, 1);
        $this->Cell(90, 4, $this->txt($this->empresa['dir']), 0, 1);

        $emailContacto = !empty($this->orden['creador_email']) ? $this->orden['creador_email'] : $this->empresa['mail'];
        $this->Cell(90, 4, $emailContacto, 0, 1);

        // 4. Datos Orden
        $this->SetY(10);
        $this->SetX(110);

        $this->SetFont('Arial', 'B', 20);
        $this->SetTextColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->Cell(90, 10, 'ORDEN DE COMPRA', 0, 1, 'R');

        $this->SetTextColor(0);
        $this->SetFont('Arial', 'B', 9);

        $xLabel = 140;
        $yDat = 25;

        // N° Orden
        $this->SetXY($xLabel, $yDat);
        $this->Cell(30, 5, $this->txt('N° ORDEN:'), 0, 0, 'R');
        $this->SetFont('Arial', '', 9);
        $this->Cell(30, 5, '#' . ($this->orden['id'] ?? '--'), 0, 1, 'R');

        // Fecha
        $yDat += 5;
        $this->SetXY($xLabel, $yDat);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(30, 5, 'FECHA:', 0, 0, 'R');
        $this->SetFont('Arial', '', 9);
        $fecha = isset($this->orden['fecha_creacion']) ? date('d/m/Y', strtotime($this->orden['fecha_creacion'])) : '-';
        $this->Cell(30, 5, $fecha, 0, 1, 'R');

        // Emitido Por
        $yDat += 5;
        $this->SetXY($xLabel, $yDat);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(30, 5, 'EMITIDO POR:', 0, 0, 'R');
        $this->SetFont('Arial', '', 9);
        $creador = ($this->orden['creador_nombre'] ?? '') . ' ' . substr(($this->orden['creador_apellido'] ?? ''), 0, 1) . '.';
        $this->Cell(30, 5, $this->txt($creador), 0, 1, 'R');

        if (!empty($this->orden['numero_cotizacion'])) {
            $yDat += 5;
            $this->SetXY($xLabel, $yDat);
            $this->SetFont('Arial', 'B', 9);
            $this->Cell(30, 5, 'REF. COTIZ:', 0, 0, 'R');
            $this->SetFont('Arial', '', 9);
            $this->Cell(30, 5, $this->txt($this->orden['numero_cotizacion']), 0, 1, 'R');
        }

        // 5. Datos Proveedor
        $this->SetY(60);
        $this->SetFont('Arial', 'B', 10);
        $this->SetFillColor($this->colores['table_header'][0], $this->colores['table_header'][1], $this->colores['table_header'][2]);
        $this->Cell(0, 6, '  DATOS DEL PROVEEDOR', 0, 1, 'L', true);

        $this->Ln(2);

        // Fila 1: Razón Social y RUT
        $yProv = $this->GetY();
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(28, 5, 'RAZON SOCIAL:', 0, 0);

        $this->SetFont('Arial', '', 9);
        $provNombre = mb_convert_case($this->orden['proveedor'] ?? '', MB_CASE_UPPER, "UTF-8");

        $xCurrent = $this->GetX();
        $this->MultiCell(110, 5, $this->txt($provNombre), 0, 'L');
        $yAfterName = $this->GetY();

        // RUT
        $this->SetXY(150, $yProv);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(10, 5, 'RUT:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $this->Cell(30, 5, $this->txt($this->orden['proveedor_rut'] ?? ''), 0, 1);

        $this->SetY($yAfterName + 1);

        // Fila 2: Dirección y Teléfono
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(28, 5, 'DIRECCION:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $provDir = mb_convert_case($this->orden['proveedor_direccion'] ?? '', MB_CASE_TITLE, "UTF-8");
        if (strlen($provDir) > 90)
            $provDir = substr($provDir, 0, 87) . '...';
        $this->Cell(110, 5, $this->txt($provDir), 0, 1);

        // Fila 3: Contacto y Teléfono
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(28, 5, 'ATENCION:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $provCont = mb_convert_case($this->orden['contacto_vendedor'] ?? '', MB_CASE_TITLE, "UTF-8");
        $this->Cell(60, 5, $this->txt($provCont), 0, 0);

        $this->SetX(150);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(15, 5, 'FONO:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $this->Cell(40, 5, $this->txt($this->orden['proveedor_telefono'] ?? '-'), 0, 1);

        $this->Ln(5);
    }

    // --- PIE DE PÁGINA ---
    function Footer()
    {
        $this->SetY(-15);
        $this->SetFont('Arial', 'I', 8);
        $this->SetTextColor(128);
        $this->Cell(0, 10, $this->txt('Página ') . $this->PageNo() . ' / {nb} - Generado por Sistema InsuOrders', 0, 0, 'C');
    }

    // --- CUERPO DEL PDF ---
    public function generarPDF($detalles)
    {
        $this->AliasNbPages();
        $this->AddPage();

        // 1. Cabecera Tabla
        $this->SetFont('Arial', 'B', 8);
        $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->SetTextColor(255);

        $w = [110, 15, 15, 25, 25];
        $header = ['DESCRIPCION DETALLADA', 'CANT', 'UNID', 'PRECIO UNIT.', 'TOTAL'];

        foreach ($header as $i => $h) {
            $align = ($i >= 3) ? 'R' : 'C';
            if ($i == 0)
                $align = 'L';
            $this->Cell($w[$i], 8, $this->txt($h), 0, 0, $align, true);
        }
        $this->Ln();

        // 2. Filas
        $this->SetFont('Arial', '', 8);
        $this->SetTextColor(0);
        $fill = false;

        foreach ($detalles as $row) {
            $this->SetFillColor(245, 245, 245);

            $desc = $this->txt($row['insumo']);
            if (strlen($desc) > 85)
                $desc = substr($desc, 0, 82) . '...';

            // Salto de Página
            if ($this->GetY() > 230) {
                $this->AddPage();
                $this->SetFont('Arial', 'B', 8);
                $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
                $this->SetTextColor(255);
                foreach ($header as $i => $h) {
                    $align = ($i >= 3) ? 'R' : 'C';
                    if ($i == 0)
                        $align = 'L';
                    $this->Cell($w[$i], 8, $this->txt($h), 0, 0, $align, true);
                }
                $this->Ln();
                $this->SetFont('Arial', '', 8);
                $this->SetTextColor(0);
            }

            $this->Cell($w[0], 7, $desc, 0, 0, 'L', $fill);
            $this->Cell($w[1], 7, floatval($row['cantidad_solicitada']), 0, 0, 'C', $fill);
            $this->Cell($w[2], 7, $this->txt($row['unidad_medida']), 0, 0, 'C', $fill);
            $this->Cell($w[3], 7, $this->fmt($row['precio_unitario']), 0, 0, 'R', $fill);
            $this->Cell($w[4], 7, $this->fmt($row['total_linea']), 0, 1, 'R', $fill);
            if (!empty($row['nota_linea'])) {
                $this->SetFont('Arial', 'I', 7);
                $this->SetTextColor(80, 80, 80);
                $x = $this->GetX();
                $y = $this->GetY();

                // MultiCell maneja saltos de línea automáticos si el texto es muy largo
                $this->MultiCell($w[0], 4, $this->txt("Nota: " . $row['nota_linea']), 0, 'L', $fill);

                // Rellenar visualmente las columnas de la derecha para no romper el diseño zebra
                $altoNota = $this->GetY() - $y;
                $this->SetXY($x + $w[0], $y);
                $this->Cell($w[1] + $w[2] + $w[3] + $w[4], $altoNota, '', 0, 1, 'C', $fill);

                // Restaurar estilos base
                $this->SetFont('Arial', '', 8);
                $this->SetTextColor(0);
            }

            $fill = !$fill;
        }

        $this->SetDrawColor(200);
        $this->Line(10, $this->GetY(), 200, $this->GetY());

        // --- FOOTER DE TOTALES ---
        if ($this->GetY() > 210) {
            $this->AddPage();
        }

        // Posición Fija desde el fondo
        $this->SetY(-55);

        $xStart = 135;
        $wLabel = 30;
        $wVal = 35;

        // Subtotal
        $this->SetX($xStart);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell($wLabel, 6, 'Subtotal Neto:', 0, 0, 'R');
        $this->SetFont('Arial', '', 9);
        $this->Cell($wVal, 6, $this->fmt($this->orden['monto_neto'] ?? 0), 0, 1, 'R');

        // IVA
        $pct = isset($this->orden['impuesto_porcentaje']) ? floatval($this->orden['impuesto_porcentaje']) : 19;
        $this->SetX($xStart);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell($wLabel, 6, "I.V.A ($pct%):", 0, 0, 'R');
        $this->SetFont('Arial', '', 9);
        $this->Cell($wVal, 6, $this->fmt($this->orden['impuesto'] ?? 0), 0, 1, 'R');

        // Total
        $this->SetX($xStart);
        $this->SetFillColor($this->colores['total_bg'][0], $this->colores['total_bg'][1], $this->colores['total_bg'][2]);
        $this->SetFont('Arial', 'B', 11);
        $this->SetTextColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->Cell($wLabel, 10, 'TOTAL:', 0, 0, 'R', true);
        $this->Cell($wVal, 10, $this->fmt($this->orden['monto_total'] ?? 0), 0, 1, 'R', true);
        $this->SetTextColor(0);

        // --- FIRMAS ---
        $this->SetY(-45);
        $yFirma = $this->GetY();

        // Condiciones
        $this->SetXY(10, $yFirma);
        $this->SetFont('Arial', '', 7);
        $this->SetTextColor(100);
        $this->Cell(100, 4, 'CONDICIONES GENERALES:', 0, 1);
        $this->MultiCell(
            90,
            3,
            "1. Sirvase citar el Nro de Orden en Facturas y Guias.\n" .
            "2. Horario Recepcion: Lun a Vie 07:00 a 17:00 hrs.\n" .
            "3. La facturacion debe ser a nombre de Procesadora Insuban Spa.",
            0,
            'L'
        );

        return $this->Output('S');
    }

    public function generarPdfEntrega($ot, $entregas)
    {
        // Configurar datos para que el Header() funcione
        $this->orden = $ot;
        $this->AliasNbPages();
        $this->AddPage();

        // Título Específico
        $this->SetY(35);
        $this->SetFont('Arial', 'B', 14);
        $this->SetTextColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->Cell(0, 10, mb_convert_encoding('VALE DE ENTREGA DE MATERIALES', 'ISO-8859-1'), 0, 1, 'C');
        $this->Ln(5);

        // Datos de la Entrega
        $this->SetFillColor(240);
        $this->SetFont('Arial', 'B', 10);
        $this->SetTextColor(0);
        $this->Cell(0, 7, ' DETALLE DE RECEPCION', 1, 1, 'L', true);

        $this->SetFont('Arial', '', 9);
        $this->Ln(2);

        // Fila 1
        $this->Cell(30, 6, 'OT Asociada:', 0, 0);
        $this->Cell(60, 6, '# ' . $ot['id'], 0, 0);
        $this->Cell(30, 6, 'Fecha:', 0, 0);
        $this->Cell(60, 6, date('d/m/Y H:i'), 0, 1);

        // Fila 2
        $this->Cell(30, 6, 'Solicitante:', 0, 0);
        $this->Cell(60, 6, $this->txt($ot['solicitante_nombre'] . ' ' . $ot['solicitante_apellido']), 0, 0);
        $this->Cell(30, 6, mb_convert_encoding('Máquina:', 'ISO-8859-1'), 0, 0);
        $this->Cell(60, 6, $this->txt($ot['activo'] ?? 'General'), 0, 1);
        $this->Ln(5);

        // Tabla de Items Entregados
        $this->SetFont('Arial', 'B', 9);
        $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->SetTextColor(255);

        $w = [30, 90, 30, 40];
        $h = ['SKU', 'DESCRIPCION', 'CANTIDAD', 'UNIDAD'];

        foreach ($h as $i => $val) {
            $this->Cell($w[$i], 7, $val, 0, 0, 'C', true);
        }
        $this->Ln();

        $this->SetFont('Arial', '', 9);
        $this->SetTextColor(0);
        $fill = false;

        if (empty($entregas)) {
            $this->Cell(190, 10, 'No hay items en esta entrega.', 1, 1, 'C');
        } else {
            foreach ($entregas as $row) {
                $this->SetFillColor(245);

                $desc = $this->txt($row['nombre'] ?? $row['insumo']);
                if (strlen($desc) > 50)
                    $desc = substr($desc, 0, 47) . '...';

                $cant = floatval($row['cantidad_entregada'] ?? $row['cantidad']);

                $this->Cell($w[0], 7, $row['codigo_sku'], 0, 0, 'C', $fill);
                $this->Cell($w[1], 7, $desc, 0, 0, 'L', $fill);
                $this->Cell($w[2], 7, $cant, 0, 0, 'C', $fill);
                $this->Cell($w[3], 7, $this->txt($row['unidad_medida']), 0, 1, 'C', $fill);

                $fill = !$fill;
            }
        }

        $this->Ln(25);
        $this->SetY(-50);
        $this->SetFont('Arial', 'B', 8);
        $this->Line(20, $this->GetY(), 80, $this->GetY());
        $this->Line(130, $this->GetY(), 190, $this->GetY());

        $this->SetXY(20, $this->GetY() + 2);
        $this->Cell(60, 4, 'ENTREGADO POR (BODEGA)', 0, 0, 'C');

        $this->SetXY(130, $this->GetY());
        $this->Cell(60, 4, 'RECIBIDO CONFORME (TECNICO)', 0, 0, 'C');

        return $this->Output('S');
    }

    // ---  MÉTODO PARA GENERAR EL PDF DE LA OT ---
    public function generarPdfOT($ot, $detalles)
    {
        $this->tipoDocumento = 'OT';
        $this->AliasNbPages();
        $this->AddPage();

        $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->Rect(0, 0, 210, 5, 'F');

        $this->SetY(15);
        $this->SetFont('Arial', 'B', 16);
        $this->SetTextColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->Cell(0, 10, 'REPORTE DE MANTENCION (OT)', 0, 1, 'C');

        $this->SetFont('Arial', 'B', 12);
        $this->SetTextColor(50);
        $this->Cell(0, 8, 'FOLIO #' . $ot['id'], 0, 1, 'C');
        $this->Ln(5);

        // 2. Información General
        $this->SetFont('Arial', 'B', 10);
        $this->SetFillColor($this->colores['table_header'][0], $this->colores['table_header'][1], $this->colores['table_header'][2]);
        $this->Cell(0, 6, '  DATOS DE LA ORDEN', 0, 1, 'L', true);
        $this->Ln(2);

        $this->SetFont('Arial', 'B', 9);
        $this->Cell(30, 5, 'SOLICITANTE:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $solicitante = $ot['solicitante_nombre'] . ' ' . $ot['solicitante_apellido'];
        $this->Cell(80, 5, $this->txt($solicitante), 0, 0);

        $this->SetFont('Arial', 'B', 9);
        $this->Cell(20, 5, 'FECHA:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $this->Cell(40, 5, date('d/m/Y H:i', strtotime($ot['fecha_solicitud'])), 0, 1);

        $this->SetFont('Arial', 'B', 9);
        $this->Cell(30, 5, 'MAQUINA:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $maquina = $ot['activo'] ? $ot['activo'] . " (" . $ot['activo_codigo'] . ")" : "TRABAJO GENERAL";
        $this->Cell(80, 5, $this->txt($maquina), 0, 0);

        $this->SetFont('Arial', 'B', 9);
        $this->Cell(20, 5, 'ESTADO:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $this->Cell(40, 5, $this->txt($ot['estado']), 0, 1);

        if (!empty($ot['fecha_cierre'])) {
            $this->SetFont('Arial', 'B', 9);
            $this->Cell(30, 5, 'FECHA CIERRE:', 0, 0);
            $this->SetFont('Arial', '', 9);
            $this->Cell(80, 5, date('d/m/Y H:i', strtotime($ot['fecha_cierre'])), 0, 1);
        }

        $this->Ln(6);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(30, 5, 'DESCRIPCION:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $this->MultiCell(0, 5, $this->txt($ot['descripcion_trabajo'] ?? 'Sin observaciones'), 0, 'L');
        $this->Ln(5);

        // 3. Detalle de Insumos y Costos
        $this->SetFont('Arial', 'B', 9);
        $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->SetTextColor(255);

        // Anchos de columnas ajustados (190 total)
        $w = [25, 60, 25, 25, 25, 30];
        $h = ['SKU', 'DESCRIPCION', 'CANT.', 'ESTADO', 'COSTO UN.', 'SUBTOTAL'];

        foreach ($h as $i => $val) {
            $this->Cell($w[$i], 7, $val, 0, 0, 'C', true);
        }
        $this->Ln();

        $this->SetFont('Arial', '', 8);
        $this->SetTextColor(0);
        $fill = false;

        if (empty($detalles)) {
            $this->Cell(190, 10, 'No hay insumos asociados.', 1, 1, 'C');
        } else {
            foreach ($detalles as $row) {
                $this->SetFillColor(245, 245, 245);

                $desc = $this->txt($row['nombre']);
                if (strlen($desc) > 35)
                    $desc = substr($desc, 0, 32) . '...';

                $cantEntregada = isset($row['cantidad_entregada']) ? floatval($row['cantidad_entregada']) : floatval($row['cantidad']);

                $this->Cell($w[0], 7, $row['codigo_sku'], 0, 0, 'C', $fill);
                $this->Cell($w[1], 7, $desc, 0, 0, 'L', $fill);
                $this->Cell($w[2], 7, $cantEntregada . ' ' . $this->txt($row['unidad_medida']), 0, 0, 'C', $fill);
                $this->Cell($w[3], 7, $row['estado_linea'], 0, 0, 'C', $fill);
                $this->Cell($w[4], 7, $this->fmt($row['costo_unitario_snapshot'] ?? 0), 0, 0, 'R', $fill);
                $this->Cell($w[5], 7, $this->fmt($row['costo_total_linea'] ?? 0), 0, 1, 'R', $fill);

                $fill = !$fill;
            }

            // Total Row
            $this->Ln(5);
            $this->SetFont('Arial', 'B', 10);
            $this->SetFillColor($this->colores['total_bg'][0], $this->colores['total_bg'][1], $this->colores['total_bg'][2]);
            $this->Cell(130, 8, '', 0, 0); // space
            $this->Cell(30, 8, 'TOTAL OT:', 0, 0, 'R', true);
            $this->Cell(30, 8, $this->fmt($ot['costo_total_ot'] ?? 0), 0, 1, 'R', true);
        }

        $this->Ln(20);

        // 4. Firmas
        $this->SetY(-50);
        $this->SetFont('Arial', 'B', 8);

        $this->Cell(60, 5, 'SOLICITADO POR', 0, 0, 'C');
        $this->Cell(70, 5, '', 0, 0);
        $this->Cell(60, 5, 'AUTORIZADO POR', 0, 1, 'C');

        $this->Line(15, $this->GetY() + 15, 75, $this->GetY() + 15);
        $this->Line(145, $this->GetY() + 15, 205, $this->GetY() + 15);

        return $this->Output('S');
    }

    // -----------------------------------------------------------
    // Genera el PDF de una Cotización (Sin precios, para cliente)
    // -----------------------------------------------------------

    public function generarCotizacion($cotizacion)
    {
        $this->tipoDocumento = 'COTIZACION';
        // 1. SUPRIMIR ERRORES DEPRECATED EN TIEMPO DE EJECUCIÓN
        error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE);

        // 2. LIMPIAR BUFFER (CRÍTICO)
        if (ob_get_length())
            ob_end_clean();

        $this->AliasNbPages();
        $this->AddPage();

        // 1. Franja Decorativa Superior
        $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->Rect(0, 0, 210, 5, 'F');

        // 2. Logo
        $logoPath = __DIR__ . '/../../../../public_html/assets/img/LogoInsuban_SinFondo.png';
        $yStart = 15;
        if (file_exists($logoPath)) {
            $this->Image($logoPath, 10, 8, 55);
            $yStart = 25;
        }

        // 3. Datos Empresa (Cabecera Izquierda)
        $this->SetXY(10, $yStart);
        $this->SetFont('Arial', 'B', 12);
        $this->SetTextColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->Cell(90, 5, $this->txt($this->empresa['nombre']), 0, 1);

        $this->SetFont('Arial', 'B', 8);
        $this->SetTextColor(50);
        $this->Cell(90, 4, 'RUT: ' . $this->empresa['rut'], 0, 1);

        $this->SetFont('Arial', '', 8);
        $this->Cell(90, 4, $this->txt($this->empresa['giro']), 0, 1);
        $this->Cell(90, 4, $this->txt($this->empresa['dir']), 0, 1);
        $this->Cell(90, 4, $this->empresa['mail'], 0, 1);

        // 4. Datos Cotización (Cabecera Derecha)
        $this->SetY(10);
        $this->SetX(110);

        $this->SetFont('Arial', 'B', 18);
        $this->SetTextColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->Cell(90, 10, $this->txt('SOLICITUD DE COTIZACIÓN'), 0, 1, 'R');

        $this->SetTextColor(0);
        $this->SetFont('Arial', 'B', 9);

        $xLabel = 140;
        $yDat = 25;

        // Folio
        $this->SetXY($xLabel, $yDat);
        $this->Cell(30, 5, 'FOLIO:', 0, 0, 'R');
        $this->SetFont('Arial', '', 9);
        $this->Cell(30, 5, '#' . str_pad($cotizacion['id'], 6, '0', STR_PAD_LEFT), 0, 1, 'R');

        // Fecha
        $yDat += 5;
        $this->SetXY($xLabel, $yDat);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(30, 5, 'FECHA:', 0, 0, 'R');
        $this->SetFont('Arial', '', 9);
        $this->Cell(30, 5, date('d/m/Y', strtotime($cotizacion['fecha_creacion'])), 0, 1, 'R');

        // Solicitante
        $yDat += 5;
        $this->SetXY($xLabel, $yDat);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(30, 5, 'SOLICITANTE:', 0, 0, 'R');
        $this->SetFont('Arial', '', 9);
        $nombreCreador = ($cotizacion['creador_nombre'] ?? '') . ' ' . ($cotizacion['creador_apellido'] ?? '');
        $this->Cell(30, 5, $this->txt(trim($nombreCreador)), 0, 1, 'R');

        $this->Ln(15);

        // 5. Tabla de Ítems
        // Anchos: # (10), Descripción (150), Cantidad (30)
        $this->SetFont('Arial', 'B', 9);
        $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->SetTextColor(255);

        $this->Cell(10, 8, '#', 0, 0, 'C', true);
        $this->Cell(150, 8, $this->txt('DESCRIPCION DEL PRODUCTO / INSUMO'), 0, 0, 'L', true);
        $this->Cell(30, 8, 'CANTIDAD', 0, 1, 'C', true);

        $this->SetFont('Arial', '', 9);
        $this->SetTextColor(0);
        $i = 1;
        $fill = false;

        foreach ($cotizacion['items'] as $item) {
            $this->SetFillColor(245, 245, 245);

            $nombre = $this->txt($item['nombre_item']);
            if (!empty($item['codigo_sku'])) {
                $nombre .= ' (SKU: ' . $this->txt($item['codigo_sku']) . ')';
            }

            // Calculamos altura dinámica
            $cellWidth = 150;
            $cellHeight = 7;

            if ($this->GetStringWidth($nombre) < $cellWidth) {
                $line = 1;
            } else {
                $line = 2;
            }
            $height = $line * $cellHeight;

            // Salto de página
            if ($this->GetY() + $height > 260) {
                $this->AddPage();
                $this->SetFont('Arial', 'B', 9);
                $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
                $this->SetTextColor(255);
                $this->Cell(10, 8, '#', 0, 0, 'C', true);
                $this->Cell(150, 8, $this->txt('DESCRIPCION DEL PRODUCTO / INSUMO'), 0, 0, 'L', true);
                $this->Cell(30, 8, 'CANTIDAD', 0, 1, 'C', true);
                $this->Ln();
                $this->SetFont('Arial', '', 9);
                $this->SetTextColor(0);
            }

            $this->Cell(10, $height, $i++, 0, 0, 'C', $fill);

            $x = $this->GetX();
            $y = $this->GetY();

            $this->MultiCell($cellWidth, $cellHeight, $nombre, 0, 'L', $fill);

            $this->SetXY($x + $cellWidth, $y);

            $this->Cell(30, $height, number_format($item['cantidad'], 2), 0, 1, 'C', $fill);

            $fill = !$fill;
            // Línea separadora
            $this->SetDrawColor(230);
            $this->Line(10, $this->GetY(), 200, $this->GetY());

            // Salto explícito
            $this->Ln();
        }

        // 6. Observaciones
        if (!empty($cotizacion['observacion'])) {
            $this->Ln(10);
            $this->SetFont('Arial', 'B', 9);
            $this->SetTextColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
            $this->Cell(0, 6, $this->txt('OBSERVACIONES / INSTRUCCIONES:'), 0, 1);

            $this->SetFont('Arial', '', 9);
            $this->SetTextColor(0);
            $this->MultiCell(0, 6, $this->txt($cotizacion['observacion']), 0, 'L');
        }

        $this->Output('D', 'Cotizacion_' . $cotizacion['id'] . '.pdf');
        exit;
    }

    // -----------------------------------------------------------
    // REPORTE FINAL DE MANTENCIÓN (Checklist + Firma + Cierre)
    // -----------------------------------------------------------
    public function generarReporteFinalOT($ot, $checklist, $insumos, $firmaBase64, $comentarios)
    {
        $this->tipoDocumento = 'OT';
        $this->orden = $ot;
        $this->AliasNbPages();
        $this->AddPage();

        $p  = $this->colores['primary'];
        $lw = 190; // ancho util

        // --- CABECERA DOCUMENTO ---
        $this->SetFillColor($p[0], $p[1], $p[2]);
        $this->Rect(0, 0, 210, 5, 'F');

        $logoPath = __DIR__ . '/../../../../public_html/assets/img/LogoInsuban_SinFondo.png';
        if (file_exists($logoPath)) {
            $this->Image($logoPath, 10, 8, 45);
        }

        $this->SetXY(60, 10);
        $this->SetFont('Arial', 'B', 15);
        $this->SetTextColor($p[0], $p[1], $p[2]);
        $this->Cell(130, 8, $this->txt('REPORTE DE MANTENCIÓN FINALIZADA'), 0, 1, 'R');

        $this->SetXY(60, 19);
        $this->SetFont('Arial', '', 9);
        $this->SetTextColor(80);
        $this->Cell(130, 5, $this->txt('Procesadora Insuban Spa. — www.insuban.cl'), 0, 1, 'R');

        $this->SetFillColor($p[0], $p[1], $p[2]);
        $this->Rect(0, 27, 210, 0.5, 'F');
        $this->SetY(32);

        // --- SECCIÓN 1: IDENTIFICACIÓN ---
        $this->_otSeccion($this->txt('1. IDENTIFICACIÓN DEL TRABAJO'));

        $fechaSol    = !empty($ot['fecha_solicitud']) ? date('d/m/Y', strtotime($ot['fecha_solicitud'])) : '—';
        $fechaCierre = !empty($ot['fecha_cierre'])    ? date('d/m/Y H:i', strtotime($ot['fecha_cierre'])) : date('d/m/Y H:i');
        $tecnico     = $this->txt($ot['asignado_nombre'] ?? 'Sin asignar');
        $activo      = $this->txt($ot['activo'] ?? '—');
        $codigo      = $this->txt($ot['activo_codigo'] ?? '—');
        $estado      = $this->txt($ot['estado'] ?? '—');

        $this->_otFila($this->txt('Folio OT:'), '# ' . $ot['id'], $this->txt('Fecha solicitud:'), $fechaSol);
        $this->_otFila($this->txt('Activo / Equipo:'), $activo, $this->txt('Código:'), $codigo);
        $this->_otFila($this->txt('Técnico responsable:'), $tecnico, $this->txt('Estado:'), $estado);

        $this->SetFont('Arial', 'B', 8);
        $this->SetTextColor(60);
        $this->Cell(35, 6, $this->txt('Fecha culminación:'), 0, 0);
        $this->SetFont('Arial', 'B', 9);
        $this->SetTextColor(0, 120, 0);
        $this->Cell(155, 6, $fechaCierre, 0, 1);
        $this->SetTextColor(0);
        $this->Ln(3);

        // --- SECCIÓN 2: CHECKLIST ---
        $this->_otSeccion($this->txt('2. PAUTA DE MANTENCIÓN (CHECKLIST)'));

        $wKey = 105; $wVal = 30; $wObs = 55;
        $this->SetFont('Arial', 'B', 8);
        $this->SetFillColor(220, 228, 240);
        $this->SetTextColor(0);
        $this->Cell($wKey, 6, $this->txt('Punto de Revisión / Tarea'), 1, 0, 'L', true);
        $this->Cell($wVal, 6, 'Estado', 1, 0, 'C', true);
        $this->Cell($wObs, 6, $this->txt('Observación'), 1, 1, 'L', true);

        $this->SetFont('Arial', '', 8);
        $fill = false;
        if (!empty($checklist)) {
            foreach ($checklist as $key => $item) {
                if ($this->GetY() > 260) {
                    $this->AddPage();
                    $this->SetFont('Arial', 'B', 8);
                    $this->SetFillColor(220, 228, 240);
                    $this->Cell($wKey, 6, $this->txt('Punto de Revisión / Tarea'), 1, 0, 'L', true);
                    $this->Cell($wVal, 6, 'Estado', 1, 0, 'C', true);
                    $this->Cell($wObs, 6, $this->txt('Observación'), 1, 1, 'L', true);
                    $this->SetFont('Arial', '', 8);
                    $fill = false;
                }

                $valor = strtoupper(trim($item['valor'] ?? ''));
                $obs   = $this->txt(mb_substr($item['observacion'] ?? '', 0, 45));
                $keyTxt = $this->txt(mb_substr($key, 0, 60));

                if ($valor === 'SI' || $valor === 'BUENO')
                    $colorVal = [0, 140, 0];
                elseif ($valor === 'NO' || $valor === 'MALO')
                    $colorVal = [200, 0, 0];
                else
                    $colorVal = [80, 80, 80];

                $this->SetFillColor(247, 249, 252);
                $this->SetTextColor(0);
                $this->Cell($wKey, 6, $keyTxt, 1, 0, 'L', $fill);
                $this->SetTextColor($colorVal[0], $colorVal[1], $colorVal[2]);
                $this->SetFont('Arial', 'B', 8);
                $this->Cell($wVal, 6, $this->txt($valor), 1, 0, 'C', $fill);
                $this->SetFont('Arial', '', 8);
                $this->SetTextColor(0);
                $this->Cell($wObs, 6, $obs, 1, 1, 'L', $fill);
                $fill = !$fill;
            }
        } else {
            $this->SetTextColor(100);
            $this->Cell($lw, 6, $this->txt('No se aplicó checklist digital.'), 1, 1, 'C');
            $this->SetTextColor(0);
        }
        $this->Ln(4);

        // --- SECCIÓN 3: INSUMOS ---
        if ($this->GetY() > 220) $this->AddPage();

        $this->_otSeccion($this->txt('3. REPUESTOS E INSUMOS UTILIZADOS'));

        $wSku = 28; $wNom = 78; $wCant = 22; $wEst = 28; $wPU = 17; $wTot = 17;
        $this->SetFont('Arial', 'B', 8);
        $this->SetFillColor(220, 228, 240);
        $this->Cell($wSku, 6, 'SKU',                           1, 0, 'C', true);
        $this->Cell($wNom, 6, $this->txt('Descripción'),       1, 0, 'L', true);
        $this->Cell($wCant,6, 'Cant.',                         1, 0, 'C', true);
        $this->Cell($wEst, 6, 'Estado',                        1, 0, 'C', true);
        $this->Cell($wPU,  6, 'P.Unit',                        1, 0, 'R', true);
        $this->Cell($wTot, 6, 'Total',                         1, 1, 'R', true);

        $this->SetFont('Arial', '', 8);
        $fill = false;
        if (!empty($insumos)) {
            foreach ($insumos as $ins) {
                $this->SetFillColor(247, 249, 252);
                $this->Cell($wSku, 6, $this->txt($ins['codigo_sku'] ?? ''),                              1, 0, 'C', $fill);
                $this->Cell($wNom, 6, $this->txt(mb_substr($ins['nombre'] ?? '', 0, 42)),                1, 0, 'L', $fill);
                $this->Cell($wCant,6, ($ins['cantidad_entregada'] ?? '') . ' ' . $this->txt($ins['unidad_medida'] ?? ''), 1, 0, 'C', $fill);
                $this->Cell($wEst, 6, $this->txt($ins['estado_linea'] ?? ''),                            1, 0, 'C', $fill);
                $this->Cell($wPU,  6, $this->fmt($ins['costo_unitario_snapshot'] ?? 0),                  1, 0, 'R', $fill);
                $this->Cell($wTot, 6, $this->fmt($ins['costo_total_linea'] ?? 0),                        1, 1, 'R', $fill);
                $fill = !$fill;
            }
            $this->SetFont('Arial', 'B', 9);
            $this->SetFillColor(235, 240, 248);
            $wLeft = $wSku + $wNom + $wCant + $wEst + $wPU;
            $this->Cell($wLeft, 7, $this->txt('COSTO TOTAL INSUMOS:'), 0, 0, 'R');
            $this->Cell($wTot,  7, $this->fmt($ot['costo_total_ot'] ?? 0), 1, 1, 'R', true);
        } else {
            $this->SetTextColor(100);
            $this->Cell($lw, 6, $this->txt('No se utilizaron repuestos adicionales.'), 1, 1, 'C');
            $this->SetTextColor(0);
        }
        $this->Ln(4);

        // --- SECCIÓN 4: OBSERVACIONES ---
        if ($this->GetY() > 220) $this->AddPage();

        $this->_otSeccion($this->txt('4. OBSERVACIONES FINALES'));
        $this->SetFont('Arial', '', 9);
        $this->SetTextColor(0);
        $this->MultiCell($lw, 6, $this->txt($comentarios ?: 'Sin comentarios adicionales.'), 1, 'L');

        // --- FIRMAS ---
        $this->SetY(-58);
        $this->SetFillColor($p[0], $p[1], $p[2]);
        $this->Rect(0, $this->GetY() - 1, 210, 0.4, 'F');

        $yFirma = $this->GetY() + 5;
        $xTec   = 15;
        $xSup   = 120;
        $wFirma = 75;

        if ($firmaBase64) {
            $imgFile = $this->saveBase64Image($firmaBase64);
            if ($imgFile) {
                $this->Image($imgFile, $xTec + 5, $yFirma - 22, 45, 0);
                unlink($imgFile);
            }
        }

        $yLinea = $yFirma + 10;
        $this->Line($xTec, $yLinea, $xTec + $wFirma, $yLinea);
        $this->Line($xSup, $yLinea, $xSup + $wFirma, $yLinea);

        $this->SetFont('Arial', 'B', 7);
        $this->SetTextColor(60);
        $this->SetXY($xTec, $yLinea + 2);
        $this->Cell($wFirma, 4, $this->txt('FIRMA TÉCNICO RESPONSABLE'), 0, 0, 'C');
        $this->SetXY($xSup, $yLinea + 2);
        $this->Cell($wFirma, 4, $this->txt('V°B° SUPERVISOR / JEFE PLANTA'), 0, 0, 'C');

        $this->SetFont('Arial', '', 7);
        $this->SetXY($xTec, $yLinea + 7);
        $this->Cell($wFirma, 4, $this->txt($ot['asignado_nombre'] ?? ''), 0, 0, 'C');

        // Número de página
        $this->SetXY(0, $yLinea + 12);
        $this->SetFont('Arial', 'I', 7);
        $this->SetTextColor(150);
        $this->Cell(0, 4, $this->txt('Página ') . $this->PageNo() . ' / {nb}  —  ' . $this->txt('Procesadora Insuban Spa.'), 0, 0, 'C');

        $fileName = 'OT_FINAL_' . $ot['id'] . '_' . time() . '.pdf';
        $path = __DIR__ . '/../../../../public_html/uploads/pdfs/';

        if (!is_dir($path))
            mkdir($path, 0777, true);

        $this->Output('F', $path . $fileName);

        return '/uploads/pdfs/' . $fileName;
    }

    private function _otSeccion($titulo)
    {
        $p = $this->colores['primary'];
        $this->SetFont('Arial', 'B', 9);
        $this->SetFillColor($p[0], $p[1], $p[2]);
        $this->SetTextColor(255);
        $this->Cell(190, 7, '  ' . $titulo, 0, 1, 'L', true);
        $this->SetTextColor(0);
        $this->Ln(1);
    }

    private function _otFila($label1, $val1, $label2, $val2)
    {
        $this->SetFont('Arial', 'B', 8);
        $this->SetTextColor(60);
        $this->Cell(35, 6, $label1, 0, 0);
        $this->SetFont('Arial', '', 8);
        $this->SetTextColor(0);
        $this->Cell(58, 6, $val1, 0, 0);
        $this->SetFont('Arial', 'B', 8);
        $this->SetTextColor(60);
        $this->Cell(35, 6, $label2, 0, 0);
        $this->SetFont('Arial', '', 8);
        $this->SetTextColor(0);
        $this->Cell(62, 6, $val2, 0, 1);
    }

    // Auxiliar para convertir base64 a archivo temporal
    private function saveBase64Image($base64String)
    {
        $split = explode(',', $base64String);
        if (count($split) < 2)
            return null;

        $data = base64_decode($split[1]);
        $tmpFile = sys_get_temp_dir() . '/firma_' . uniqid() . '.png';
        file_put_contents($tmpFile, $data);
        return $tmpFile;
    }

    // -----------------------------------------------------------
    // VALE DE SALIDA DE BODEGA 
    // -----------------------------------------------------------
    public function generarComprobanteEntrega($datos)
    {
        $this->tipoDocumento = 'ENTREGA';
        if (ob_get_length())
            ob_end_clean();

        // Seteamos datos mínimos para que el Header() automático no de error
        // Usamos el ID del primer movimiento como N° de Registro
        $head = $datos[0];
        $this->orden = [
            'id' => $head['id'],
            'proveedor' => ''
        ];

        $this->AliasNbPages();
        $this->AddPage();

        // --- TRUCO PROFESIONAL: Limpiar el Header de OC ---
        // Dibujamos un rectángulo blanco sobre los textos fijos de "Orden de Compra"
        // que pone el Header() automático, para poder poner nuestros títulos.
        $this->SetFillColor(255, 255, 255);
        $this->Rect(110, 8, 90, 45, 'F'); // Tapamos el título y datos de OC
        $this->Rect(10, 60, 190, 35, 'F'); // Tapamos el recuadro de "Datos del Proveedor"

        // 1. Nuevo Título de Documento
        $this->SetXY(110, 10);
        $this->SetFont('Arial', 'B', 18);
        $this->SetTextColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->Cell(90, 10, $this->txt('VALE DE ENTREGA'), 0, 1, 'R');

        $this->SetTextColor(0);
        $this->SetXY(110, 22);
        $this->SetFont('Arial', 'B', 10);
        $this->Cell(55, 5, $this->txt('N° REGISTRO DE SALIDA:'), 0, 0, 'R');
        $this->SetFont('Arial', '', 11);
        $this->Cell(35, 5, '#' . $head['id'], 0, 1, 'R');

        // 2. Información de Recepción (Bajamos la posición para que se vea limpio)
        $this->SetY(45);
        $fecha = date('d/m/Y H:i', strtotime($head['fecha']));
        $referencia = $head['ot_id'] ? "Orden de Trabajo #" . $head['ot_id'] : "Salida Manual";

        $this->SetFillColor(240, 240, 240);
        $this->SetFont('Arial', 'B', 10);
        $this->SetTextColor(0);
        $this->Cell(0, 7, $this->txt('  DETALLES DE LA ENTREGA'), 0, 1, 'L', true);
        $this->Ln(2);

        // Bloque de datos
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(30, 6, 'Fecha:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $this->Cell(70, 6, $fecha, 0, 0);

        $this->SetFont('Arial', 'B', 9);
        $this->Cell(30, 6, 'Referencia:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $this->Cell(60, 6, $this->txt($referencia), 0, 1);

        $this->SetFont('Arial', 'B', 9);
        $this->Cell(30, 6, 'Entrega:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $this->Cell(70, 6, $this->txt($head['bodeguero_nombre'] . ' ' . $head['bodeguero_apellido']), 0, 0);

        $this->SetFont('Arial', 'B', 9);
        $this->Cell(30, 6, 'Destino:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $this->Cell(60, 6, $this->txt($head['ubicacion_destino'] ?? 'Planta General'), 0, 1);

        $this->SetFont('Arial', 'B', 9);
        $this->Cell(30, 6, 'Receptor:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $this->Cell(70, 6, $this->txt($head['receptor_nombre']), 0, 0);

        $this->SetFont('Arial', 'B', 9);
        $this->Cell(30, 6, 'RUT Receptor:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $this->Cell(60, 6, $this->txt($head['receptor_rut']), 0, 1);

        $this->Ln(8);

        // 3. Tabla de Materiales
        $this->SetFont('Arial', 'B', 9);
        $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->SetTextColor(255);

        $this->Cell(35, 8, 'SKU', 0, 0, 'C', true);
        $this->Cell(95, 8, 'DESCRIPCION DEL MATERIAL', 0, 0, 'L', true);
        $this->Cell(30, 8, 'CANTIDAD', 0, 0, 'C', true);
        $this->Cell(30, 8, 'UNIDAD', 0, 1, 'C', true);

        $this->SetFont('Arial', '', 9);
        $this->SetTextColor(0);
        $fill = false;

        foreach ($datos as $row) {
            $this->SetFillColor(245, 245, 245);
            $this->Cell(35, 7, $row['codigo_sku'], 'B', 0, 'C', $fill);
            $this->Cell(95, 7, $this->txt(substr($row['insumo'], 0, 50)), 'B', 0, 'L', $fill);
            $this->Cell(30, 7, floatval($row['cantidad']), 'B', 0, 'C', $fill);
            $this->Cell(30, 7, $this->txt($row['unidad_medida']), 'B', 1, 'C', $fill);
            $fill = !$fill;
        }

        if (!empty($head['observacion']) && $head['observacion'] !== 'Salida Manual') {
            $this->Ln(5);
            $this->SetFont('Arial', 'B', 9);
            $this->Cell(0, 5, 'Observaciones:', 0, 1);
            $this->SetFont('Arial', '', 9);
            $this->MultiCell(0, 5, $this->txt($head['observacion']), 0, 'L');
        }

        // 4. Firmas al final de la página
        $this->SetY(-55);
        $yFirma = $this->GetY();

        $this->SetDrawColor(100, 100, 100);
        $this->Line(25, $yFirma, 85, $yFirma);
        $this->Line(125, $yFirma, 185, $yFirma);

        $this->SetFont('Arial', 'B', 8);
        $this->SetXY(25, $yFirma + 2);
        $this->Cell(60, 4, 'FIRMA RESPONSABLE BODEGA', 0, 0, 'C');

        $this->SetXY(125, $yFirma + 2);
        $this->Cell(60, 4, 'FIRMA RECEPTOR CONFORME', 0, 0, 'C');

        return $this->Output('S');
    }
}