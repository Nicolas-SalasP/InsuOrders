<?php
namespace App\Services;

use FPDF;

class PDFService extends FPDF {
    private $orden = [];
    
    // Configuración de Colores Corporativos
    private $colores = [
        'primary'   => [51, 102, 153],
        'secondary' => [100, 100, 100],
        'table_header' => [230, 230, 230],
        'total_bg'  => [240, 240, 240] 
    ];

    // Datos de la Empresa
    private $empresa = [
        'nombre' => 'Procesadora Insuban Spa.',
        'rut'    => '78.730.890-2',
        'giro'   => 'ELABORACION Y CONSERVACION DE CARNE Y PRODUCTOS CARNICOS',
        'dir'    => 'Antillanca Norte 391, Pudahuel',
        'web'    => 'www.insuban.cl',
        'mail'   => 'contacto@insuban.cl'
    ];

    public function setOrdenData($orden) {
        $this->orden = $orden;
        $this->SetTitle('OC #' . $orden['id'] . ' - ' . $this->txt($orden['proveedor']), true);
    }

    private function txt($str) {
        return iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $str ?? '');
    }

    private function fmt($valor) {
        $moneda = $this->orden['moneda'] ?? 'CLP';
        if ($moneda === 'CLP') {
            return '$' . number_format((float)$valor, 0, '', '.');
        }
        return number_format((float)$valor, 2, '.', ',');
    }

    // --- CABECERA DE PÁGINA ---
    function Header() {
        if (empty($this->orden)) return;

        // 1. Franja Decorativa Superior
        $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->Rect(0, 0, 210, 5, 'F');

        // 2. Logo
        $logoPath = __DIR__ . '/../../../../public_html/assets/img/LogoInsuban_SinFondo.png';
        $yStart = 15;
        if (file_exists($logoPath)) {
            $this->Image($logoPath, 10, 8, 75); 
            $yStart = 30;
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
        if (strlen($provDir) > 90) $provDir = substr($provDir, 0, 87) . '...';
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
    function Footer() {
        $this->SetY(-15);
        $this->SetFont('Arial', 'I', 8);
        $this->SetTextColor(128);
        $this->Cell(0, 10, $this->txt('Página ') . $this->PageNo() . ' / {nb} - Generado por Sistema InsuOrders', 0, 0, 'C');
    }

    // --- CUERPO DEL PDF ---
    public function generarPDF($detalles) {
        $this->AliasNbPages();
        $this->AddPage();
        
        // 1. Cabecera Tabla
        $this->SetFont('Arial', 'B', 8);
        $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->SetTextColor(255);
        
        $w = [110, 15, 15, 25, 25]; 
        $header = ['DESCRIPCION DETALLADA', 'CANT', 'UNID', 'PRECIO UNIT.', 'TOTAL'];
        
        foreach ($header as $i => $h) {
            $align = ($i >= 3) ? 'R' : 'C'; if($i==0) $align='L';
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
            if (strlen($desc) > 85) $desc = substr($desc, 0, 82) . '...';

            // Salto de Página
            if ($this->GetY() > 230) {
                $this->AddPage();
                $this->SetFont('Arial', 'B', 8);
                $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
                $this->SetTextColor(255);
                foreach ($header as $i => $h) {
                    $align = ($i >= 3) ? 'R' : 'C'; if($i==0) $align='L';
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
            
            $fill = !$fill;
            $this->Ln();
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
        $this->MultiCell(90, 3, 
            "1. Sirvase citar el Nro de Orden en Facturas y Guias.\n".
            "2. Horario Recepcion: Lun a Vie 07:00 a 17:00 hrs.\n".
            "3. La facturacion debe ser a nombre de Procesadora Insuban Spa.", 
            0, 'L');

        return $this->Output('S');
    }

    // --- NUEVO MÉTODO PARA GENERAR EL PDF DE LA OT ---
    public function generarPdfOT($ot, $detalles) {
        $this->AliasNbPages();
        $this->AddPage();

        // 1. Cabecera
        $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->Rect(0, 0, 210, 5, 'F');

        $this->SetY(15);
        $this->SetFont('Arial', 'B', 16);
        $this->SetTextColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->Cell(0, 10, 'SOLICITUD DE MATERIALES (OT)', 0, 1, 'C');

        $this->SetFont('Arial', 'B', 12);
        $this->SetTextColor(50);
        $this->Cell(0, 8, 'FOLIO #' . $ot['id'], 0, 1, 'C');
        $this->Ln(5);

        // 2. Información General
        $this->SetFont('Arial', 'B', 10);
        $this->SetFillColor($this->colores['table_header'][0], $this->colores['table_header'][1], $this->colores['table_header'][2]);
        $this->Cell(0, 6, '  DATOS DE LA SOLICITUD', 0, 1, 'L', true);
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

        $this->Ln(6);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(30, 5, 'DESCRIPCION:', 0, 0);
        $this->SetFont('Arial', '', 9);
        $this->MultiCell(0, 5, $this->txt($ot['descripcion_trabajo'] ?? 'Sin observaciones'), 0, 'L');
        $this->Ln(5);

        // 3. Detalle de Insumos
        $this->SetFont('Arial', 'B', 9);
        $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->SetTextColor(255);

        // Anchos de columnas
        $w = [25, 80, 25, 25, 35]; 
        $h = ['SKU', 'DESCRIPCION', 'SOLIC.', 'ENTREG.', 'ESTADO'];

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
                if (strlen($desc) > 45) $desc = substr($desc, 0, 42) . '...';

                // Usamos floatval para limpiar ceros innecesarios (10.00 -> 10)
                $cantSolicitada = floatval($row['cantidad']);
                $cantEntregada = isset($row['cantidad_entregada']) ? floatval($row['cantidad_entregada']) : 0;

                $this->Cell($w[0], 7, $row['codigo_sku'], 0, 0, 'C', $fill);
                $this->Cell($w[1], 7, $desc, 0, 0, 'L', $fill);
                $this->Cell($w[2], 7, $cantSolicitada . ' ' . $this->txt($row['unidad_medida']), 0, 0, 'C', $fill);
                $this->Cell($w[3], 7, $cantEntregada, 0, 0, 'C', $fill);
                $this->Cell($w[4], 7, $row['estado_linea'], 0, 1, 'C', $fill);

                $fill = !$fill;
            }
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
}