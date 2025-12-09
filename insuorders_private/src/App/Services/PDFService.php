<?php
namespace App\Services;

// Asegúrate de que FPDF esté disponible. Si usas composer:
use FPDF;

class PDFService extends FPDF
{
    private $orden = []; // Inicializar vacío para evitar errores
    private $colores = [
        'primary' => [51, 102, 153],
        'header_bg' => [240, 240, 240]
    ];

    public function setOrdenData($orden)
    {
        $this->orden = $orden;
    }

    private function txt($str)
    {
        return iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $str ?? '');
    }

    private function fmt($valor)
    {
        $moneda = $this->orden['moneda'] ?? 'CLP';
        if ($moneda === 'CLP') {
            return '$' . number_format((float) $valor, 0, '', '.');
        }
        return number_format((float) $valor, 2, '.', ',');
    }

    // Cabecera Automática (Se ejecuta al hacer AddPage)
    function Header()
    {
        // Evitar renderizar si no hay datos cargados aún
        if (empty($this->orden))
            return;

        // 1. Franja Azul
        $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->Rect(0, 0, 210, 20, 'F');

        // 2. Logo / Título Empresa
        $this->SetY(5);
        $this->SetX(10);
        $this->SetFont('Arial', 'B', 20);
        $this->SetTextColor(255);
        $this->Cell(50, 10, 'INSUBAN', 0, 0);

        // 3. Título Documento
        $this->SetXY(110, 5);
        $this->SetFont('Arial', 'B', 22);
        $this->Cell(90, 10, 'ORDEN DE COMPRA', 0, 0, 'R');

        // 4. Datos Cabecera (Derecha)
        $this->SetTextColor(50);
        $this->SetY(30);

        $this->SetX(120);
        $this->SetFont('Arial', 'B', 10);
        $this->Cell(35, 6, $this->txt('N° Orden:'), 0, 0, 'R');
        $this->SetFont('Arial', '', 10);
        $this->Cell(45, 6, '#' . ($this->orden['id'] ?? '---'), 0, 1, 'R');

        $this->SetX(120);
        $this->SetFont('Arial', 'B', 10);
        $this->Cell(35, 6, 'Fecha:', 0, 0, 'R');
        $this->SetFont('Arial', '', 10);
        $fecha = isset($this->orden['fecha_creacion']) ? date('d/m/Y', strtotime($this->orden['fecha_creacion'])) : date('d/m/Y');
        $this->Cell(45, 6, $fecha, 0, 1, 'R');

        if (!empty($this->orden['numero_cotizacion'])) {
            $this->SetX(120);
            $this->SetFont('Arial', 'B', 10);
            $this->Cell(35, 6, $this->txt('Ref. Cotización:'), 0, 0, 'R');
            $this->SetFont('Arial', '', 10);
            $this->Cell(45, 6, $this->txt($this->orden['numero_cotizacion']), 0, 1, 'R');
        }

        // 5. Datos Proveedor (Izquierda)
        $this->SetY(40);
        $this->SetFont('Arial', 'B', 11);
        $this->SetFillColor($this->colores['header_bg'][0], $this->colores['header_bg'][1], $this->colores['header_bg'][2]);
        $this->Cell(95, 8, '  DATOS DEL PROVEEDOR', 0, 1, 'L', true);

        $this->SetFont('Arial', 'B', 10);
        $this->Cell(95, 6, $this->txt($this->orden['proveedor'] ?? ''), 0, 1);

        $this->SetFont('Arial', '', 9);
        $this->Cell(20, 5, 'RUT:', 0, 0);
        $this->Cell(75, 5, $this->txt($this->orden['proveedor_rut'] ?? ''), 0, 1);

        $this->Cell(20, 5, $this->txt('Dirección:'), 0, 0);
        $this->Cell(75, 5, $this->txt($this->orden['proveedor_direccion'] ?? 'N/A'), 0, 1);

        $this->Cell(20, 5, $this->txt('Teléfono:'), 0, 0);
        $this->Cell(75, 5, $this->txt($this->orden['proveedor_telefono'] ?? 'N/A'), 0, 1);

        $this->Cell(20, 5, 'Contacto:', 0, 0);
        $this->Cell(75, 5, $this->txt($this->orden['contacto_vendedor'] ?? 'N/A'), 0, 1);

        $this->Ln(10);
    }

    function Footer()
    {
        $this->SetY(-15);
        $this->SetFont('Arial', 'I', 8);
        $this->SetTextColor(128);
        $this->Cell(0, 10, $this->txt('Página ') . $this->PageNo() . ' / {nb}', 0, 0, 'C');
    }

    // MÉTODO PRINCIPAL
    public function generarPDF($detalles)
    {
        $this->AliasNbPages();
        $this->AddPage(); // Esto invoca Header() automáticamente

        // --- TABLA ITEMS ---
        $this->SetFont('Arial', 'B', 9);
        $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->SetTextColor(255);

        // Anchos: SKU(25), Desc(85), Cant(15), Unid(15), Precio(25), Total(25)
        $w = [25, 85, 15, 15, 25, 25];
        $header = ['SKU', 'DESCRIPCION', 'CANT', 'UNID', 'PRECIO', 'TOTAL'];

        foreach ($header as $i => $h) {
            $this->Cell($w[$i], 8, $this->txt($h), 0, 0, 'C', true);
        }
        $this->Ln();

        // Filas
        $this->SetFont('Arial', '', 9);
        $this->SetTextColor(0);
        $fill = false;

        foreach ($detalles as $row) {
            $this->SetFillColor(245, 245, 245);

            // Altura dinámica
            $nb = $this->NbLines($w[1], $this->txt($row['insumo']));
            $h = 7 * max($nb, 1);

            // Salto página inteligente
            if ($this->GetY() + $h > 250)
                $this->AddPage();

            $this->Cell($w[0], $h, $this->txt($row['codigo_sku']), 0, 0, 'C', $fill);

            // Descripción MultiCell
            $x = $this->GetX();
            $y = $this->GetY();
            $this->MultiCell($w[1], 7, $this->txt($row['insumo']), 0, 'L', $fill);
            $this->SetXY($x + $w[1], $y);

            $this->Cell($w[2], $h, floatval($row['cantidad_solicitada']), 0, 0, 'C', $fill);
            $this->Cell($w[3], $h, $this->txt($row['unidad_medida']), 0, 0, 'C', $fill);
            $this->Cell($w[4], $h, $this->fmt($row['precio_unitario']), 0, 0, 'R', $fill);
            $this->Cell($w[5], $h, $this->fmt($row['total_linea']), 0, 1, 'R', $fill);

            $fill = !$fill;
        }
        $this->Ln(5);

        // --- TOTALES (Footer de Cálculos) ---
        // Verificar espacio
        if ($this->GetY() + 40 > 270)
            $this->AddPage();

        $this->SetDrawColor(200);
        $this->Line(10, $this->GetY(), 200, $this->GetY());
        $this->Ln(5);

        $xStart = 130;
        $wLabel = 30;
        $wVal = 40;

        // Neto
        $this->SetX($xStart);
        $this->SetFont('Arial', 'B', 10);
        $this->Cell($wLabel, 6, 'Subtotal:', 0, 0, 'R');
        $this->SetFont('Arial', '', 10);
        $this->Cell($wVal, 6, $this->fmt($this->orden['monto_neto'] ?? 0), 0, 1, 'R');

        // IVA Dinámico
        $pct = isset($this->orden['impuesto_porcentaje']) ? floatval($this->orden['impuesto_porcentaje']) : 19;
        $this->SetX($xStart);
        $this->SetFont('Arial', 'B', 10);
        $this->Cell($wLabel, 6, "I.V.A ($pct%):", 0, 0, 'R');
        $this->SetFont('Arial', '', 10);
        $this->Cell($wVal, 6, $this->fmt($this->orden['impuesto'] ?? 0), 0, 1, 'R');

        // Total
        $this->SetX($xStart);
        $this->SetFillColor($this->colores['primary'][0], $this->colores['primary'][1], $this->colores['primary'][2]);
        $this->SetTextColor(255);
        $this->SetFont('Arial', 'B', 11);
        $this->Cell($wLabel, 10, 'TOTAL:', 0, 0, 'R', true);
        $this->Cell($wVal, 10, $this->fmt($this->orden['monto_total'] ?? 0), 0, 1, 'R', true);
        $this->SetTextColor(0);

        // --- FIRMAS ---
        $this->SetY(-50);
        $this->SetFont('Arial', '', 8);
        $this->Cell(100, 5, 'CONDICIONES:', 0, 1);
        $this->MultiCell(100, 4, "1. Indicar Nro de OC en Factura.\n2. Recepcion Lun-Vie 08:30-17:00.\n3. Insuban Ltda.", 0, 'L');

        $this->SetXY(130, -45);
        $this->Cell(60, 5, 'AUTORIZADO POR', 0, 1, 'C');
        $this->Line(135, $this->GetY() + 15, 185, $this->GetY() + 15);
        $this->SetXY(130, -25);
        $nombreCreador = ($this->orden['creador_nombre'] ?? '') . ' ' . ($this->orden['creador_apellido'] ?? '');
        $this->Cell(60, 5, $this->txt($nombreCreador), 0, 1, 'C');

        return $this->Output('S');
    }

    // Helper MultiCell Height
    function NbLines($w, $txt)
    {
        $cw = &$this->CurrentFont['cw'];
        if ($w == 0)
            $w = $this->w - $this->rMargin - $this->x;
        $wmax = ($w - 2 * $this->cMargin) * 1000 / $this->FontSize;
        $s = str_replace("\r", '', $txt);
        $nb = strlen($s);
        if ($nb > 0 && $s[$nb - 1] == "\n")
            $nb--;
        $sep = -1;
        $i = 0;
        $j = 0;
        $l = 0;
        $nl = 1;
        while ($i < $nb) {
            $c = $s[$i];
            if ($c == "\n") {
                $i++;
                $sep = -1;
                $j = $i;
                $l = 0;
                $nl++;
                continue;
            }
            if ($c == ' ')
                $sep = $i;
            $l += $cw[ord($c)];
            if ($l > $wmax) {
                if ($sep == -1) {
                    if ($i == $j)
                        $i++;
                } else
                    $i = $sep + 1;
                $sep = -1;
                $j = $i;
                $l = 0;
                $nl++;
            } else
                $i++;
        }
        return $nl;
    }
}