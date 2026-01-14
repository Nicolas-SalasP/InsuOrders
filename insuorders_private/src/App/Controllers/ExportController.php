<?php
namespace App\Controllers;

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
        // Limpiar buffer para evitar archivos corruptos por espacios en blanco o warnings
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
                case 'bodega':
                    $this->sheetBodega($spreadsheet, $sheetIndex);
                    $filename = "Bodega_Pendientes_" . date('Ymd_Hi') . ".xlsx";
                    break;
                case 'compras':
                    $this->sheetCompras($spreadsheet, $sheetIndex);
                    $filename = "Compras_" . date('Ymd_Hi') . ".xlsx";
                    break;
                case 'usuarios':
                    $this->sheetUsuarios($spreadsheet, $sheetIndex);
                    $filename = "Usuarios_" . date('Ymd_Hi') . ".xlsx";
                    break;
                case 'dashboard_entregas':
                    $this->sheetDashboardEntregas($spreadsheet, $sheetIndex);
                    $filename = "Reporte_Entregas_" . date('Ymd_Hi') . ".xlsx";
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
            echo json_encode(["success" => false, "message" => "Error generando Excel: " . $e->getMessage()]);
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
            ['ID', 'Código Interno', 'Nombre Activo', 'Tipo', 'Ubicación', 'Descripción', 'Centro de Costo'],
            $data,
            fn($d) => [
                $d['id'],
                $d['codigo_interno'],
                $d['nombre'],
                $d['tipo'],
                $d['ubicacion'],
                $d['descripcion'] ?? '',
                (!empty($d['centro_costo_nombre']))
                ? ($d['centro_costo_codigo'] . ' - ' . $d['centro_costo_nombre'])
                : 'Sin asignar'
            ]
        );
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
        $data = (new MantencionRepository())->getSolicitudes();

        $this->fillSheet(
            $sheet,
            ['Nro OT', 'Fecha Solicitud', 'Solicitante', 'Máquina / Activo', 'Cód. Activo', 'Descripción Trabajo', 'Estado', 'Fecha Término'],
            $data,
            fn($d) => [
                $d['id'],
                $d['fecha_solicitud'],
                $d['solicitante_nombre'] . ' ' . $d['solicitante_apellido'],
                $d['activo'] ?? 'General',
                $d['activo_codigo'] ?? '',
                $d['descripcion_trabajo'],
                $d['estado'],
                $d['fecha_termino'] ?? '-'
            ]
        );
    }

    private function sheetCompras(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Compras');
        $data = (new OrdenCompraRepository())->getAll();

        $this->fillSheet(
            $sheet,
            ['ID OC', 'Fecha', 'Proveedor', 'RUT', 'Estado', 'Neto', 'IVA', 'Total', 'Creador'],
            $data,
            fn($d) => [
                $d['id'],
                $d['fecha_creacion'],
                $d['proveedor'] ?? 'N/A',
                $d['proveedor_rut'] ?? 'N/A',
                $d['estado'] ?? 'N/A',
                $d['monto_neto'] ?? 0,
                $d['impuesto'] ?? $d['monto_impuesto'] ?? 0,
                $d['monto_total'] ?? 0,
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
        $detalles = $repo->getDetallesOT($id);

        if (!$header)
            throw new \Exception("OT no encontrada");

        $sheet->setCellValue('A1', 'ORDEN DE TRABAJO #' . $id);
        $sheet->mergeCells('A1:E1');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['argb' => 'FF1F4E78']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        $info = [
            3 => ['Solicitante:', $header['solicitante_nombre'] . ' ' . $header['solicitante_apellido']],
            4 => ['Máquina:', ($header['activo'] ?? 'General') . ' (' . ($header['activo_codigo'] ?? '') . ')'],
            5 => ['Fecha:', $header['fecha_solicitud']],
            6 => ['Estado:', $header['estado']],
            7 => ['Descripción:', $header['descripcion_trabajo']]
        ];

        foreach ($info as $r => $val) {
            $sheet->setCellValue("A$r", $val[0]);
            $sheet->setCellValue("B$r", $val[1]);
            $sheet->getStyle("A$r")->getFont()->setBold(true);
        }

        $row = 9;
        $headers = ['SKU', 'Insumo', 'Solicitado', 'Entregado', 'Estado'];
        $c = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($c . $row, $h);
            $c++;
        }
        $sheet->getStyle("A$row:E$row")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['argb' => Color::COLOR_WHITE]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1F4E78']]
        ]);

        $row++;
        foreach ($detalles as $d) {
            $sheet->setCellValue("A$row", $d['codigo_sku']);
            $sheet->setCellValue("B$row", $d['nombre']);
            $sheet->setCellValue("C$row", $d['cantidad']);
            $sheet->setCellValue("D$row", $d['cantidad_entregada']);
            $sheet->setCellValue("E$row", $d['estado_linea']);
            $row++;
        }
        foreach (range('A', 'E') as $col)
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
        $sheet->mergeCells('A1:E1');
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
        $headers = ['SKU', 'Insumo', 'Cantidad', 'Precio Unit.', 'Total'];
        $col = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($col . $row, $h);
            $col++;
        }
        $sheet->getStyle("A$row:E$row")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['argb' => Color::COLOR_WHITE]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1F4E78']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        $row++;
        foreach ($data['detalles'] as $d) {
            $sheet->setCellValue("A$row", $d['codigo_sku']);
            $sheet->setCellValue("B$row", $d['insumo']);
            $sheet->setCellValue("C$row", $d['cantidad_solicitada']);
            $sheet->setCellValue("D$row", $d['precio_unitario']);
            $sheet->setCellValue("E$row", $d['total_linea']);
            $row++;
        }

        $sheet->setCellValue("D$row", 'TOTAL NETO:');
        $sheet->setCellValue("E$row", $c['monto_neto']);
        $row++;
        $sheet->setCellValue("D$row", 'IVA:');
        $sheet->setCellValue("E$row", $c['impuesto'] ?? $c['monto_impuesto'] ?? 0);
        $row++;
        $sheet->setCellValue("D$row", 'TOTAL:');
        $sheet->setCellValue("E$row", $c['monto_total']);
        $sheet->getStyle("D" . ($row - 2) . ":E$row")->getFont()->setBold(true);

        foreach (range('A', 'E') as $col)
            $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    private function sheetDashboardEntregas(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Entregas Realizadas');
        $start = $_GET['start'] ?? date('Y-m-01');
        $end = $_GET['end'] ?? date('Y-m-d 23:59:59');
        $empleadoId = $_GET['empleado_id'] ?? null;
        $data = (new DashboardRepository())->getEntregasParaExcel($start, $end, $empleadoId);
        $this->fillSheet(
            $sheet,
            ['Fecha', 'Hora', 'Entregado Por', 'Recibido Por', 'Producto', 'SKU', 'Cantidad', 'Unidad', 'OT Ref'], 
            $data,
            fn($d) => [
                $d['fecha'],
                $d['hora'],
                $d['quien_entrego'],
                $d['quien_recibio'],
                $d['que_recibio'],
                $d['codigo_producto'],
                $d['cuanto'],
                $d['unidad_medida'],
                $d['ot_referencia'] ?? 'N/A'
            ]
        );
    }
}