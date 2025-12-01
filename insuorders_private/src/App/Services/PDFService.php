<?php
namespace App\Services;

class PDFService extends \FPDF {
    private $orden;

    public function setOrdenData($orden) {
        $this->orden = $orden;
    }

    private function txt($str) {
        return iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $str);
    }

    private function fmt($valor) {
        if ($this->orden['moneda'] === 'CLP') {
            return '$' . number_format($valor, 0, '', '.');
        }
        return number_format($valor, 2, '.', ',');
    }

    function Header() {
        // 1. LOGO (Esquina Superior Izquierda)
        $logoPath = __DIR__ . '/../../../../public_html/assets/img/LogoNegroSinFondo.png';
        if (file_exists($logoPath)) {
            $this->Image($logoPath, 10, 10, 35);
        } else {
            $this->SetFont('Arial', 'B', 16);
            $this->SetXY(10, 15);
            $this->Cell(40, 10, 'INSUBAN', 0, 0);
        }

        // 2. DATOS EMPRESA (Centro-Izquierda)
        // Ajustamos X para que no se monte sobre el logo
        $this->SetXY(50, 12);
        $this->SetFont('Arial', 'B', 10);
        $this->Cell(0, 4, $this->txt('PROCESADORA INSUBAN SPA'), 0, 1);
        
        $this->SetFont('Arial', '', 8);
        $this->SetX(50);
        $this->Cell(0, 4, $this->txt('RUT: 76.XXX.XXX-X'), 0, 1);
        $this->SetX(50);
        $this->Cell(0, 4, $this->txt('Casa Matriz #123, Santiago'), 0, 1);
        $this->SetX(50);
        $this->Cell(0, 4, $this->txt('Giro: Procesamiento de Alimentos'), 0, 1);

        // 3. DATOS ORDEN (Derecha)
        // Usamos coordenadas fijas para que esto NUNCA se corra
        $xRight = 130;
        $this->SetXY($xRight, 10);
        
        $this->SetFont('Arial', 'B', 14);
        $this->Cell(70, 8, 'ORDEN DE COMPRA', 1, 1, 'C'); // Recuadro título
        
        $this->SetXY($xRight, 18);
        $this->SetFont('Arial', 'B', 12);
        $this->SetTextColor(150, 0, 0); // Rojo oscuro clásico
        $this->Cell(70, 8, utf8_decode('N° ') . str_pad($this->orden['id'], 6, '0', STR_PAD_LEFT), 1, 1, 'C');
        $this->SetTextColor(0);

        // Datos de referencia (Fecha, Cotización, Solicitante)
        $this->SetXY($xRight, 28);
        $this->SetFont('Arial', '', 8);
        
        // Fila Fecha
        $this->Cell(20, 4, 'Fecha:', 0, 0, 'L');
        $this->Cell(50, 4, date('d/m/Y', strtotime($this->orden['fecha_creacion'])), 0, 1, 'R');
        
        // Fila Cotización (Nueva)
        $this->SetX($xRight);
        $this->Cell(20, 4, $this->txt('Ref. Cotiz:'), 0, 0, 'L');
        $this->Cell(50, 4, $this->txt($this->orden['numero_cotizacion'] ?: '---'), 0, 1, 'R');

        // Fila Solicitante (Nueva)
        $solicitante = ($this->orden['creador_nombre'] ?? '') . ' ' . ($this->orden['creador_apellido'] ?? '');
        $this->SetX($xRight);
        $this->Cell(20, 4, 'Solicitado por:', 0, 0, 'L');
        $this->Cell(50, 4, $this->txt(substr($solicitante, 0, 25)), 0, 1, 'R'); // Cortar si es muy largo

        // 4. DATOS PROVEEDOR (Barra completa)
        $this->SetXY(10, 50);
        $this->SetFont('Arial', 'B', 9);
        $this->SetFillColor(240, 240, 240); // Gris muy suave solo para separar sección
        $this->Cell(190, 6, $this->txt('  DATOS DEL PROVEEDOR'), 1, 1, 'L', true);
        
        $this->SetFont('Arial', '', 8);
        // Fila 1: Razón Social y RUT
        $this->Cell(25, 6, $this->txt('Razón Social:'), 'L', 0);
        $this->SetFont('Arial', 'B', 8);
        $this->Cell(100, 6, $this->txt($this->orden['proveedor']), 0, 0);
        $this->SetFont('Arial', '', 8);
        $this->Cell(10, 6, 'RUT:', 0, 0);
        $this->Cell(55, 6, $this->orden['proveedor_rut'], 'R', 1);
        
        // Fila 2: Dirección y Teléfono
        $this->Cell(25, 6, $this->txt('Dirección:'), 'L', 0);
        $this->Cell(100, 6, $this->txt($this->orden['proveedor_direccion'] ?: '---'), 0, 0);
        $this->Cell(10, 6, 'Fono:', 0, 0);
        $this->Cell(55, 6, $this->orden['proveedor_telefono'] ?: '---', 'R', 1);

        // Fila 3: Contacto y Email (Línea inferior cerrada)
        $this->Cell(25, 6, 'Contacto:', 'LB', 0);
        $this->Cell(100, 6, $this->txt($this->orden['contacto_vendedor'] ?: '---'), 'B', 0);
        $this->Cell(10, 6, 'Email:', 'B', 0);
        $this->Cell(55, 6, $this->txt($this->orden['proveedor_email'] ?: '---'), 'RB', 1);

        $this->Ln(5);

        // 5. ENCABEZADOS TABLA (Estilo Clásico)
        $this->SetFont('Arial', 'B', 8);
        $this->SetFillColor(200, 200, 200); // Gris un poco más oscuro para cabecera tabla
        
        $this->Cell(100, 6, $this->txt('DESCRIPCIÓN / PRODUCTO'), 1, 0, 'L', true);
        $this->Cell(20, 6, 'CANT.', 1, 0, 'C', true);
        $this->Cell(15, 6, 'UNID.', 1, 0, 'C', true);
        $this->Cell(25, 6, 'P. UNITARIO', 1, 0, 'R', true);
        $this->Cell(30, 6, 'TOTAL', 1, 1, 'R', true);
    }

    function Footer() {
        // Solo paginación simple
        $this->SetY(-15);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 10, $this->txt('Página ') . $this->PageNo() . '/{nb}', 0, 0, 'C');
    }

    public function generarPDF($detalles) {
        $this->AliasNbPages();
        $this->AddPage();
        $this->SetFont('Arial', '', 8);

        // Anchos fijos para mantener alineación
        $wDesc = 100;
        $wCant = 20;
        $wUni = 15;
        $wPrecio = 25;
        $wTotal = 30;

        foreach ($detalles as $item) {
            $desc = $item['insumo'] ?? 'Item sin nombre';
            $cant = $item['cantidad_solicitada'];
            $uni  = $item['unidad_medida'] ?? 'UN';
            $precio = $item['precio_unitario'];
            $total = $item['total_linea'];

            // Cantidad entera si corresponde
            $cantFmt = (float)$cant == (int)$cant ? number_format($cant, 0) : number_format($cant, 2);

            // Calcular alto de fila dinámico según descripción
            $nb = $this->NbLines($wDesc, $this->txt($desc));
            $h = 5 * $nb; // 5mm de altura por línea de texto
            
            // Control de salto de página
            if ($this->GetY() + $h > 270) {
                $this->AddPage();
            }

            // Guardar posición inicial
            $x = $this->GetX();
            $y = $this->GetY();

            // Dibujar celda descripción (MultiCell)
            $this->Rect($x, $y, $wDesc, $h); // Borde manual
            $this->MultiCell($wDesc, 5, $this->txt($desc), 0, 'L');
            
            // Volver a la posición X correcta para las siguientes celdas
            $this->SetXY($x + $wDesc, $y);

            // Dibujar resto de celdas con altura unificada ($h)
            $this->Cell($wCant, $h, $cantFmt, 1, 0, 'C');
            $this->Cell($wUni, $h, $uni, 1, 0, 'C');
            $this->Cell($wPrecio, $h, $this->fmt($precio), 1, 0, 'R');
            $this->Cell($wTotal, $h, $this->fmt($total), 1, 1, 'R');
        }

        // --- TOTALES (Bloque compacto abajo a la derecha) ---
        $this->Ln(2); // Pequeño espacio tras la tabla
        
        $xStart = 145; // Alineado con las columnas de precio/total
        $this->SetX($xStart);
        
        // Datos
        $neto = $this->orden['monto_neto'];
        $impuesto = $this->orden['impuesto'];
        $totalFinal = $this->orden['monto_total'];
        $moneda = $this->orden['moneda'];

        // Tabla de Totales
        $this->SetFont('Arial', '', 8);
        
        // Neto
        $this->Cell(20, 5, 'Neto:', 1, 0, 'R');
        $this->Cell(35, 5, $this->fmt($neto), 1, 1, 'R');
        
        // IVA
        $this->SetX($xStart);
        $this->Cell(20, 5, 'IVA (19%):', 1, 0, 'R');
        $this->Cell(35, 5, $this->fmt($impuesto), 1, 1, 'R');
        
        // Total
        $this->SetX($xStart);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(20, 6, 'TOTAL:', 1, 0, 'R');
        $this->Cell(35, 6, $this->fmt($totalFinal) . ' ' . $moneda, 1, 1, 'R');

        // Nota T.Cambio si aplica
        if ($moneda !== 'CLP') {
            $this->SetX($xStart);
            $this->SetFont('Arial', 'I', 7);
            $this->Cell(55, 4, 'T.Cambio: ' . number_format($this->orden['tipo_cambio'], 2), 0, 1, 'R');
        }

        return $this->Output('S');
    }

    // Función auxiliar para calcular altura de MultiCell (Vital para que no se descuadre)
    function NbLines($w, $txt) {
        $cw = &$this->CurrentFont['cw'];
        if ($w == 0) $w = $this->w - $this->rMargin - $this->x;
        $wmax = ($w - 2 * $this->cMargin) * 1000 / $this->FontSize;
        $s = str_replace("\r", '', $txt);
        $nb = strlen($s);
        if ($nb > 0 && $s[$nb - 1] == "\n") $nb--;
        $sep = -1; $i = 0; $j = 0; $l = 0; $nl = 1;
        while ($i < $nb) {
            $c = $s[$i];
            if ($c == "\n") { $i++; $sep = -1; $j = $i; $l = 0; $nl++; continue; }
            if ($c == ' ') $sep = $i;
            $l += $cw[$c];
            if ($l > $wmax) {
                if ($sep == -1) { if ($i == $j) $i++; } else $i = $sep + 1;
                $sep = -1; $j = $i; $l = 0; $nl++;
            } else $i++;
        }
        return $nl;
    }
}