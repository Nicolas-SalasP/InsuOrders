<?php
namespace App\Controllers;
use App\Utils\ErrorHelper;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

use App\Repositories\DashboardRepository;
use App\Repositories\InsumoRepository;
use App\Repositories\ProveedorRepository;
use App\Repositories\MantencionRepository;
use App\Repositories\OrdenCompraRepository;
use App\Repositories\UsuariosRepository;

class ExportController
{
    public function exportar($modulo)
    {
        while (ob_get_level()) {
            ob_end_clean();
        }

        $spreadsheet = new Spreadsheet();
        $filename = "Reporte.xlsx";
        $sheetIndex = 0;

        try {
            switch ($modulo) {
                case 'inventario':
                    $this->sheetInventario($spreadsheet, $sheetIndex);
                    $filename = "Inventario_" . date('Ymd_Hi') . ".xlsx";
                    break;
                case 'proveedores':
                    $this->sheetProveedores($spreadsheet, $sheetIndex);
                    $filename = "Proveedores_" . date('Ymd_Hi') . ".xlsx";
                    break;
                case 'mantencion':
                    $this->sheetOTs($spreadsheet, $sheetIndex++);
                    $this->sheetActivos($spreadsheet, $sheetIndex++);
                    $filename = "Mantencion_Completo_" . date('Ymd_Hi') . ".xlsx";
                    break;
                case 'activos':
                    $this->sheetActivos($spreadsheet, $sheetIndex);
                    $filename = "Activos_" . date('Ymd_Hi') . ".xlsx";
                    break;
                case 'detalle_ot':
                    $id = $_GET['id'] ?? 0;
                    $this->sheetDetalleOT($spreadsheet, $id);
                    $filename = "Detalle_OT_{$id}.xlsx";
                    break;
                case 'detalle_oc':
                    $id = $_GET['id'] ?? 0;
                    $this->sheetDetalleOC($spreadsheet, $id);
                    $filename = "Detalle_OC_{$id}.xlsx";
                    break;
                case 'kit_activo':
                    $id = $_GET['id'] ?? 0;
                    if (!$id) {
                        throw new \Exception("Falta el ID del activo.");
                    }
                    $codigoActivo = $this->sheetKitActivo($spreadsheet, $id);
                    $sufijo = $codigoActivo ? preg_replace('/[^A-Za-z0-9_-]/', '_', $codigoActivo) : $id;
                    $filename = "Kit_Repuestos_{$sufijo}_" . date('Ymd_Hi') . ".xlsx";
                    break;
                case 'bodega':
                    $this->sheetBodega($spreadsheet, $sheetIndex);
                    $filename = "Bodega_Pendientes_" . date('Ymd_Hi') . ".xlsx";
                    break;
                case 'compras':
                    $this->sheetCompras($spreadsheet, $sheetIndex);
                    $filename = "Compras_" . date('Ymd_Hi') . ".xlsx";
                    break;
                case 'compras_pendientes':
                    $this->sheetComprasPendientes($spreadsheet, $sheetIndex);
                    $filename = "Analisis_Pendientes_Compra_" . date('Ymd_Hi') . ".xlsx";
                    break;
                case 'usuarios':
                    $this->sheetUsuarios($spreadsheet, $sheetIndex);
                    $filename = "Usuarios_" . date('Ymd_Hi') . ".xlsx";
                    break;
                case 'dashboard_entregas':
                    $this->sheetDashboardEntregas($spreadsheet, $sheetIndex);
                    $filename = "Reporte_Entregas_" . date('Ymd_Hi') . ".xlsx";
                    break;
                case 'recepciones':
                    $this->sheetRecepciones($spreadsheet, $sheetIndex);
                    $filename = "Recepciones_Historico_" . date('Ymd_Hi') . ".xlsx";
                    break;
                case 'todo':
                    $this->sheetInventario($spreadsheet, $sheetIndex++);
                    $this->sheetOTs($spreadsheet, $sheetIndex++);
                    $this->sheetActivos($spreadsheet, $sheetIndex++);
                    $this->sheetBodega($spreadsheet, $sheetIndex++);
                    $this->sheetCompras($spreadsheet, $sheetIndex++);
                    $this->sheetProveedores($spreadsheet, $sheetIndex++);
                    $this->sheetUsuarios($spreadsheet, $sheetIndex++);
                    $filename = "Master_Insuban_" . date('Ymd_Hi') . ".xlsx";
                    break;
                default:
                    throw new \Exception("Módulo inválido");
            }

            $spreadsheet->setActiveSheetIndex(0);

            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment;filename="' . $filename . '"');
            header('Cache-Control: max-age=0');
            header('Expires: 0');

            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
            exit;

        } catch (\Exception $e) {
            if (!headers_sent()) {
                header('Content-Type: application/json');
                http_response_code(500);
            }
            echo json_encode(["success" => false, "message" => "Error generando Excel: " . ErrorHelper::safeMessage($e)]);
            exit;
        }
    }

    private function getSheet(Spreadsheet $s, $index)
    {
        if ($index < $s->getSheetCount()) {
            return $s->getSheet($index);
        }
        return $s->createSheet();
    }

    private function fillSheet(Worksheet $sheet, $headers, $data, $mapFunc)
    {
        $col = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($col . '1', $h);
            $col++;
        }

        $lastCol = chr(ord('A') + count($headers) - 1);
        $headerRange = "A1:{$lastCol}1";

        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['argb' => Color::COLOR_WHITE], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1F4E78']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        ]);

        $row = 2;
        foreach ($data as $item) {
            $vals = $mapFunc($item);
            $c = 'A';
            foreach ($vals as $v) {
                $sheet->setCellValue($c . $row, $v);
                $c++;
            }
            $row++;
        }

        $dataRange = "A2:{$lastCol}" . ($row - 1);
        if ($row > 2) {
            $sheet->getStyle($dataRange)->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFD3D3D3']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER]
            ]);
        }

        $sheet->setAutoFilter($headerRange);
        foreach (range('A', $lastCol) as $columnID) {
            $sheet->getColumnDimension($columnID)->setAutoSize(true);
        }
    }

    private function sheetInventario(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Inventario');
        $data = (new InsumoRepository())->getAll();

        $this->fillSheet(
            $sheet,
            ['ID', 'SKU', 'Nombre', 'Categoría', 'Ubicación', 'Stock', 'Mínimo', 'Unidad', 'Costo', 'Moneda'],
            $data,
            fn($d) => [
                $d['id'],
                str_replace('NEW-', '', $d['codigo_sku']),
                $d['nombre'],
                $d['categoria_nombre'] ?? 'General',
                $d['ubicaciones_multiples'] ?? 'N/A',
                $d['stock_actual'],
                $d['stock_minimo'],
                $d['unidad_medida'],
                $d['precio_costo'],
                $d['moneda'] ?? 'CLP'
            ]
        );
    }

    private function sheetActivos(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Activos');
        $data = (new MantencionRepository())->getActivos();

        $this->fillSheet(
            $sheet,
            ['ID', 'Código Interno', 'Código Máquina', 'Nombre Activo', 'Tipo', 'Marca', 'Modelo', 'Año', 'N° Serie', 'Estado', 'Ubicación', 'Descripción', 'Centro de Costo', 'Frec. Mantención', 'Activo Padre'],
            $data,
            fn($d) => [
                $d['id'],
                $d['codigo_interno'],
                $d['codigo_maquina'] ?? '',
                $d['nombre'],
                $d['tipo'] ?? '',
                $d['marca'] ?? '',
                $d['modelo'] ?? '',
                $d['anio'] ?? '',
                $d['numero_serie'] ?? '',
                $d['estado_activo'] ?? '',
                $d['ubicacion'] ?? '',
                $d['descripcion'] ?? '',
                (!empty($d['centro_costo_nombre']))
                    ? ($d['centro_costo_codigo'] . ' - ' . $d['centro_costo_nombre'])
                    : 'Sin asignar',
                !empty($d['frecuencia_mantencion']) ? ($d['frecuencia_mantencion'] . ' ' . ($d['unidad_frecuencia'] ?? '')) : '',
                $d['padre_nombre'] ?? ''
            ]
        );
    }

    private function sheetKitActivo(Spreadsheet $s, $activoId)
    {
        $sheet = $s->getSheet(0);
        $sheet->setTitle("Kit Repuestos");

        $repo = new MantencionRepository();
        $kit = $repo->getKitActivo($activoId);

        $headerActivo = null;
        $stmtAct = \App\Database\Database::getConnection()->prepare(
            "SELECT a.codigo_interno, a.nombre, a.marca, a.modelo, a.ubicacion 
             FROM activos a WHERE a.id = :id"
        );
        $stmtAct->execute([':id' => $activoId]);
        $headerActivo = $stmtAct->fetch(\PDO::FETCH_ASSOC);

        if (!$headerActivo) {
            throw new \Exception("Activo no encontrado.");
        }

        $sheet->setCellValue('A1', 'KIT DE REPUESTOS SUGERIDOS');
        $sheet->mergeCells('A1:F1');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['argb' => 'FF1F4E78']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        $info = [
            3 => ['Equipo:', $headerActivo['nombre']],
            4 => [mb_convert_encoding('Código Interno:', 'UTF-8'), $headerActivo['codigo_interno']],
            5 => ['Marca / Modelo:', trim(($headerActivo['marca'] ?? '') . ' ' . ($headerActivo['modelo'] ?? '')) ?: '-'],
            6 => [mb_convert_encoding('Ubicación:', 'UTF-8'), $headerActivo['ubicacion'] ?? '-'],
            7 => ['Fecha Reporte:', date('d/m/Y H:i')]
        ];
        foreach ($info as $row => $par) {
            $sheet->setCellValue('A' . $row, $par[0]);
            $sheet->setCellValue('B' . $row, $par[1]);
            $sheet->getStyle('A' . $row)->getFont()->setBold(true);
        }

        $startRow = 9;
        $headers = ['#', 'SKU', 'Insumo', 'Cantidad', 'Unidad', 'Stock Actual'];
        $col = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($col . $startRow, $h);
            $col++;
        }

        $lastCol = chr(ord('A') + count($headers) - 1);
        $headerRange = "A{$startRow}:{$lastCol}{$startRow}";
        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['argb' => Color::COLOR_WHITE], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1F4E78']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        ]);

        $row = $startRow + 1;
        $i = 1;
        foreach ($kit as $item) {
            $sheet->setCellValue('A' . $row, $i++);
            $sheet->setCellValue('B' . $row, $item['insumo_sku'] ?? '');
            $sheet->setCellValue('C' . $row, $item['insumo_nombre'] ?? '');
            $sheet->setCellValue('D' . $row, $item['cantidad'] ?? 0);
            $sheet->setCellValue('E' . $row, $item['unidad_medida'] ?? 'UN');
            $sheet->setCellValue('F' . $row, $item['stock_actual'] ?? 0);
            $row++;
        }

        if ($row > $startRow + 1) {
            $dataRange = "A" . ($startRow + 1) . ":{$lastCol}" . ($row - 1);
            $sheet->getStyle($dataRange)->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFD3D3D3']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER]
            ]);
            $sheet->getStyle("A" . ($startRow + 1) . ":A" . ($row - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("D" . ($startRow + 1) . ":D" . ($row - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("E" . ($startRow + 1) . ":E" . ($row - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("F" . ($startRow + 1) . ":F" . ($row - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        } else {
            $sheet->setCellValue('A' . $row, 'Este activo no tiene kit de repuestos configurado.');
            $sheet->mergeCells('A' . $row . ':' . $lastCol . $row);
            $sheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['italic' => true, 'color' => ['argb' => 'FF808080']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ]);
        }

        foreach (range('A', $lastCol) as $columnID) {
            $sheet->getColumnDimension($columnID)->setAutoSize(true);
        }

        return $headerActivo['codigo_interno'] ?? null;
    }

    private function sheetProveedores(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Proveedores');
        $data = (new ProveedorRepository())->getAll();

        $this->fillSheet(
            $sheet,
            ['ID', 'RUT', 'Razón Social', 'Email', 'Teléfono', 'Contacto', 'Condición Venta', 'Dirección', 'Comuna', 'Región'],
            $data,
            fn($d) => [
                $d['id'],
                $d['rut'],
                $d['nombre'],
                $d['email'],
                $d['telefono'],
                $d['contacto_vendedor'],
                $d['tipo_venta_nombre'] ?? 'Contado',
                $d['direccion'] ?? '',
                $d['comuna_nombre'] ?? '',
                $d['region_nombre'] ?? ''
            ]
        );
    }

    private function sheetOTs(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Solicitudes OT');
        $filters = [];
        if (!empty($_GET['fecha_desde'])) $filters['fecha_desde'] = $_GET['fecha_desde'];
        if (!empty($_GET['fecha_hasta'])) $filters['fecha_hasta'] = $_GET['fecha_hasta'];
        $data = (new MantencionRepository())->getAll($filters);

        $this->fillSheet(
            $sheet,
            ['Nro OT', 'Fecha Solicitud', 'Solicitante', 'Máquina / Activo', 'Cód. Activo', 'Descripción Trabajo', 'Estado', 'Fecha Término', 'Costo Materiales', 'Costo Mano Obra', 'COSTO TOTAL OT', 'Requiere Permiso', 'Tipo Permiso', 'Permiso Retirado (por técnico)'],
            $data,
            fn($d) => [
                $d['id'],
                $d['fecha_solicitud'],
                $d['solicitante_nombre'] . ' ' . $d['solicitante_apellido'],
                $d['activo'] ?? 'General',
                $d['activo_codigo'] ?? '',
                $d['descripcion_trabajo'],
                $d['estado'],
                $d['fecha_termino'] ?? '-',
                $d['costo_total_insumos'] ?? 0,
                $d['costo_mano_obra'] ?? 0,
                $d['costo_total_ot'] ?? 0,
                !empty($d['requiere_permiso']) ? 'SÍ' : 'NO',
                $d['tipo_permiso_nombre'] ?? '',
                $d['permiso_retirado_detalle'] ?? 'N/A'
            ]
        );
    }

    private function sheetCompras(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Compras');
        $filtros = [];
        if (!empty($_GET['fecha_desde'])) $filtros['fecha_inicio'] = $_GET['fecha_desde'];
        if (!empty($_GET['fecha_hasta'])) $filtros['fecha_fin'] = $_GET['fecha_hasta'];
        $data = (new OrdenCompraRepository())->getAll($filtros);

        $this->fillSheet(
            $sheet,
            ['ID OC', 'Fecha', 'Proveedor', 'RUT', 'Estado', 'N° Cotización', 'Destino', 'Moneda', 'Tipo Cambio', 'Neto', 'IVA %', 'IVA $', 'Total', 'Creador'],
            $data,
            fn($d) => [
                $d['id'],
                $d['fecha_creacion'],
                $d['proveedor'] ?? 'N/A',
                $d['proveedor_rut'] ?? 'N/A',
                $d['estado'] ?? 'N/A',
                $d['numero_cotizacion'] ?? '',
                $d['destino'] ?? '',
                $d['moneda'] ?? 'CLP',
                (int) ($d['tipo_cambio'] ?? 1),
                (int) ($d['monto_neto'] ?? 0),
                ($d['impuesto_porcentaje'] ?? 19) . '%',
                (int) ($d['impuesto'] ?? 0),
                (int) ($d['monto_total'] ?? 0),
                $d['creador'] ?? 'Sistema'
            ]
        );
    }

    private function sheetBodega(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Pendientes Bodega');
        $data = (new MantencionRepository())->getPendientesEntrega();

        $this->fillSheet(
            $sheet,
            ['OT Origen', 'Fecha', 'Insumo', 'SKU', 'Cant. Pendiente', 'Unidad', 'Solicitante'],
            $data,
            fn($d) => [
                $d['ot_id'],
                $d['fecha_solicitud'],
                $d['insumo'],
                $d['codigo_sku'],
                $d['cantidad_pendiente'],
                $d['unidad_medida'],
                $d['solicitante']
            ]
        );
    }

    private function sheetUsuarios(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Usuarios');
        $data = (new UsuariosRepository())->getAll();

        $this->fillSheet(
            $sheet,
            ['ID', 'Usuario', 'Nombre Completo', 'Email', 'Rol', 'Estado'],
            $data,
            fn($d) => [
                $d['id'],
                $d['username'],
                $d['nombre'] . ' ' . $d['apellido'],
                $d['email'],
                $d['rol'],
                $d['activo'] ? 'Activo' : 'Inactivo'
            ]
        );
    }

    private function sheetDetalleOT(Spreadsheet $s, $id)
    {
        $sheet = $s->getSheet(0);
        $sheet->setTitle("OT #$id");

        $repo = new MantencionRepository();
        $header = $repo->getOTHeader($id);
        $detalles = $repo->getDetallesOT($id, 0);

        if (!$header)
            throw new \Exception("OT no encontrada");

        $sheet->setCellValue('A1', 'ORDEN DE TRABAJO #' . $id);
        $sheet->mergeCells('A1:G1');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['argb' => 'FF1F4E78']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        $fechaCierre = !empty($header['fecha_cierre']) ? $header['fecha_cierre'] : '-';
        $info = [
            3 => ['Solicitante:', $header['solicitante_nombre'] . ' ' . $header['solicitante_apellido']],
            4 => ['Máquina:', ($header['activo'] ?? 'General') . ' (' . ($header['activo_codigo'] ?? '') . ')'],
            5 => ['Fecha Solicitud:', $header['fecha_solicitud']],
            6 => ['Fecha Culminación:', $fechaCierre],
            7 => ['Estado:', $header['estado']],
            8 => ['Descripción:', $header['descripcion_trabajo']]
        ];

        foreach ($info as $r => $val) {
            $sheet->setCellValue("A$r", $val[0]);
            $sheet->setCellValue("B$r", $val[1]);
            $sheet->getStyle("A$r")->getFont()->setBold(true);
        }

        $row = 10;
        $headers = ['SKU', 'Insumo', 'Solicitado', 'Entregado', 'Estado', 'Costo Unitario ($)', 'Subtotal ($)'];
        $c = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($c . $row, $h);
            $c++;
        }
        $sheet->getStyle("A$row:G$row")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['argb' => Color::COLOR_WHITE]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1F4E78']]
        ]);

        $row++;
        $totalInsumos = 0;
        foreach ($detalles as $d) {
            $costoUnit = (float) ($d['precio_costo'] ?? 0);
            $cantEntregada = (float) ($d['cantidad_entregada'] ?? 0);
            $subtotal = $costoUnit * $cantEntregada;
            $totalInsumos += $subtotal;

            $sheet->setCellValue("A$row", $d['codigo_sku']);
            $sheet->setCellValue("B$row", $d['nombre']);
            $sheet->setCellValue("C$row", $d['cantidad']);
            $sheet->setCellValue("D$row", $cantEntregada);
            $sheet->setCellValue("E$row", $d['estado_linea']);
            $sheet->setCellValue("F$row", $costoUnit);
            $sheet->setCellValue("G$row", $subtotal);
            $row++;
        }

        $row++;
        $sheet->setCellValue("F$row", 'TOTAL INSUMOS:');
        $sheet->setCellValue("G$row", $totalInsumos);
        $row++;
        $sheet->setCellValue("F$row", 'MANO DE OBRA:');
        $sheet->setCellValue("G$row", $header['costo_mano_obra'] ?? 0);
        $row++;
        $totalOT = $totalInsumos + (float) ($header['costo_mano_obra'] ?? 0);
        $sheet->setCellValue("F$row", 'TOTAL OT:');
        $sheet->setCellValue("G$row", $totalOT);

        $sheet->getStyle("F" . ($row - 2) . ":G$row")->getFont()->setBold(true);

        foreach (range('A', 'G') as $col)
            $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    private function sheetDetalleOC(Spreadsheet $s, $id)
    {
        $sheet = $s->getSheet(0);
        $sheet->setTitle("OC #$id");

        $repo = new OrdenCompraRepository();
        $data = $repo->getOrdenCompleta($id);

        if (!$data || !$data['cabecera'])
            throw new \Exception("OC no encontrada");
        $c = $data['cabecera'];

        $sheet->setCellValue('A1', 'ORDEN DE COMPRA #' . $id);
        $sheet->mergeCells('A1:F1');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['argb' => 'FF1F4E78']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        $sheet->setCellValue('A3', 'Proveedor:');
        $sheet->setCellValue('B3', $c['proveedor'] ?? 'N/A');
        $sheet->setCellValue('A4', 'RUT:');
        $sheet->setCellValue('B4', $c['proveedor_rut'] ?? 'N/A');
        $sheet->setCellValue('D3', 'Fecha:');
        $sheet->setCellValue('E3', $c['fecha_creacion']);
        $sheet->setCellValue('D4', 'Estado:');
        $sheet->setCellValue('E4', $c['estado_nombre'] ?? 'N/A');

        $row = 7;
        $headers = ['SKU', 'Insumo', 'Nota / Detalle', 'Cantidad', 'Precio Unit.', 'Total'];
        $col = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($col . $row, $h);
            $col++;
        }
        $sheet->getStyle("A$row:F$row")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['argb' => Color::COLOR_WHITE]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1F4E78']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        $row++;
        foreach ($data['detalles'] as $d) {
            $sheet->setCellValue("A$row", $d['codigo_sku']);
            $sheet->setCellValue("B$row", $d['insumo']);
            $sheet->setCellValue("C$row", $d['nota_linea'] ?? '');
            $sheet->setCellValue("D$row", $d['cantidad_solicitada']);
            $sheet->setCellValue("E$row", $d['precio_unitario']);
            $sheet->setCellValue("F$row", $d['total_linea']);
            $row++;
        }

        $sheet->setCellValue("E$row", 'TOTAL NETO:');
        $sheet->setCellValue("F$row", $c['monto_neto']);
        $row++;
        $sheet->setCellValue("E$row", 'IVA:');
        $sheet->setCellValue("F$row", $c['impuesto'] ?? $c['monto_impuesto'] ?? 0);
        $row++;
        $sheet->setCellValue("E$row", 'TOTAL:');
        $sheet->setCellValue("F$row", $c['monto_total']);
        $sheet->getStyle("E" . ($row - 2) . ":F$row")->getFont()->setBold(true);

        foreach (range('A', 'F') as $col)
            $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    private function sheetDashboardEntregas(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Movimientos Realizados');

        $start = $_GET['start'] ?? date('Y-m-01');
        $end = $_GET['end'] ?? date('Y-m-d 23:59:59');
        $empleadoId = $_GET['empleado_id'] ?? null;

        $data = (new DashboardRepository())->getEntregasParaExcel($start, $end, $empleadoId);

        $this->fillSheet(
            $sheet,
            [
                'Fecha',
                'Hora',
                'Tipo',
                'Responsable',
                'Receptor / Destino',
                'Ubicación Envío',
                'Observación',
                'Producto',
                'SKU',
                'Cantidad',
                'Unidad',
                'OT Ref',
                'Título OT'
            ],
            $data,
            function ($d) {
                $obsRaw = $d['observacion'] ?? '';
                $comentarioLimpio = $obsRaw;

                if (strpos($obsRaw, 'Obs: ') !== false) {
                    $parts = explode('Obs: ', $obsRaw, 2);
                    $comentarioLimpio = trim($parts[1]);
                }

                if ($comentarioLimpio === 'Sin obs') {
                    $comentarioLimpio = '';
                }

                $tipoMov = ($d['tipo_movimiento_id'] == 3) ? 'ENTRADA (+)' : 'SALIDA (-)';

                return [
                    $d['fecha'],
                    $d['hora'],
                    $tipoMov,
                    $d['quien_entrego'],
                    $d['quien_recibio'],
                    $d['ubicacion_destino'],
                    $comentarioLimpio,
                    $d['que_recibio'],
                    $d['codigo_producto'],
                    $d['cuanto'],
                    $d['unidad_medida'],
                    $d['ot_referencia'] ?? '-',
                    $d['ot_titulo'] ?? '-'
                ];
            }
        );
    }

    private function sheetRecepciones(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Historial Recepciones');
        $data = (new OrdenCompraRepository())->getHistorialRecepciones();

        $this->fillSheet(
            $sheet,
            [
                'N° OC',
                'Proveedor',
                'RUT',
                'Fecha Recepción',
                'SKU',
                'Insumo',
                'Cant. Solicitada',
                'Cant. Recibida',
                'Precio Unit.',
                'Total Línea',
                'OT(s) Asociada(s)',
                'Recepcionado Por'
            ],
            $data,
            fn($d) => [
                $d['numero_oc'],
                $d['proveedor'],
                $d['rut_proveedor'],
                $d['fecha_recepcion'],
                $d['codigo_sku'],
                $d['insumo'],
                $d['cantidad_solicitada'],
                $d['cantidad_recibida'],
                $d['precio_unitario'],
                $d['total_linea'],
                $d['ot_titulos'] ?? '-',
                $d['recepcionado_por']
            ]
        );
    }

    private function sheetComprasPendientes(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Análisis de Pendientes');
        $data = (new OrdenCompraRepository())->getPendientesMantencion();

        $this->fillSheet(
            $sheet,
            ['SKU', 'Insumo', 'Stock Actual', 'Déficit (A Comprar)', 'Unidad de Medida', 'OTs Relacionadas', 'Nivel de Urgencia'],
            $data,
            fn($d) => [
                $d['codigo_sku'],
                $d['nombre'],
                $d['stock_actual'],
                $d['cantidad_total'],
                $d['unidad_medida'],
                $d['lista_ots'],
                $d['es_urgente'] == 1 ? '🚨 URGENTE / CRÍTICO' : 'Normal'
            ]
        );
    }
}