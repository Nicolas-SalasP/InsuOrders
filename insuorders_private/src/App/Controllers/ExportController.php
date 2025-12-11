<?php
namespace App\Controllers;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

// Repositorios
use App\Repositories\InsumoRepository;
use App\Repositories\ProveedorRepository;
use App\Repositories\MantencionRepository;
use App\Repositories\OrdenCompraRepository;
use App\Repositories\UsuariosRepository;

class ExportController
{
    public function exportar($modulo)
    {
        // Limpiar cualquier salida previa (espacios, warnings) para no corromper el Excel
        if (ob_get_length())
            ob_end_clean();

        $spreadsheet = new Spreadsheet();

        // Eliminar hoja por defecto para empezar limpio
        $spreadsheet->removeSheetByIndex(0);

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
                case 'todo':
                    // MASTER: Generar todas las pestañas
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

            // Activar la primera pestaña
            $spreadsheet->setActiveSheetIndex(0);

            // Headers para la descarga
            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment;filename="' . $filename . '"');
            header('Cache-Control: max-age=0');

            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
            exit;

        } catch (\Exception $e) {
            if (!headers_sent()) {
                header('Content-Type: application/json');
                http_response_code(500);
            }
            echo json_encode(["error" => "Error generando Excel: " . $e->getMessage()]);
            exit;
        }
    }

    // --- HELPER HOJAS ---
    private function getSheet(Spreadsheet $s, $index)
    {
        if ($index < $s->getSheetCount()) {
            return $s->getSheet($index);
        }
        return $s->createSheet();
    }

    // --- GENERADORES ---

    private function sheetInventario(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Inventario');

        $data = (new InsumoRepository())->getAll();

        $this->fillSheet(
            $sheet,
            ['ID', 'SKU', 'Nombre', 'Categoría', 'Ubicación Completa', 'Stock Actual', 'Mínimo', 'Unidad', 'Costo Promedio'],
            $data,
            fn($d) => [
                $d['id'],
                // Limpieza de SKU (Quitar NEW-)
                str_replace('NEW-', '', $d['codigo_sku']),
                $d['nombre'],
                $d['categoria_nombre'],
                    // AQUÍ ESTÁ EL CAMBIO: Concatenamos manualmente ya que tu repositorio devuelve los campos separados
                ($d['sector_nombre'] ?? 'General') . ' - ' . ($d['ubicacion_nombre'] ?? 'Sin Ubicación'),
                $d['stock_actual'],
                $d['stock_minimo'],
                $d['unidad_medida'],
                $d['precio_costo']
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
            ['ID', 'RUT', 'Razón Social', 'Email', 'Teléfono', 'Contacto', 'Condición', 'Comuna'],
            $data,
            fn($d) => [$d['id'], $d['rut'], $d['nombre'], $d['email'], $d['telefono'], $d['contacto_vendedor'], $d['tipo_venta_nombre'], $d['comuna_nombre']]
        );
    }

    private function sheetCompras(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Compras');
        $data = (new OrdenCompraRepository())->getAll();
        $this->fillSheet(
            $sheet,
            ['ID OC', 'Fecha', 'Proveedor', 'RUT', 'Estado', 'Total', 'Creador'],
            $data,
            fn($d) => [$d['id'], $d['fecha_creacion'], $d['proveedor'], $d['proveedor_rut'], $d['estado'], $d['monto_total'], $d['creador']]
        );
    }

    private function sheetOTs(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Solicitudes OT');
        $data = (new MantencionRepository())->getSolicitudes();
        $this->fillSheet(
            $sheet,
            ['ID OT', 'Fecha', 'Solicitante', 'Máquina', 'Descripción', 'Estado'],
            $data,
            fn($d) => [$d['id'], $d['fecha_solicitud'], $d['solicitante_nombre'] . ' ' . $d['solicitante_apellido'], $d['activo'] ?? 'General', $d['descripcion_trabajo'], $d['estado']]
        );
    }

    private function sheetActivos(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Activos');
        $data = (new MantencionRepository())->getActivos();
        $this->fillSheet(
            $sheet,
            ['ID', 'Código', 'Nombre', 'Tipo', 'Ubicación'],
            $data,
            fn($d) => [$d['id'], $d['codigo_interno'], $d['nombre'], $d['tipo'], $d['ubicacion']]
        );
    }

    private function sheetBodega(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Bodega Pendientes');
        $data = (new MantencionRepository())->getPendientesEntrega();
        $this->fillSheet(
            $sheet,
            ['OT Origen', 'Fecha Sol.', 'Insumo', 'SKU', 'Pendiente', 'Unidad', 'Solicitante', 'Máquina'],
            $data,
            fn($d) => [$d['ot_id'], $d['fecha_solicitud'], $d['insumo'], str_replace('NEW-', '', $d['codigo_sku']), $d['cantidad'], $d['unidad_medida'], $d['solicitante'], $d['maquina']]
        );
    }

    private function sheetUsuarios(Spreadsheet $s, $idx)
    {
        $sheet = $this->getSheet($s, $idx);
        $sheet->setTitle('Usuarios');
        $data = (new UsuariosRepository())->getAll();
        $this->fillSheet(
            $sheet,
            ['ID', 'Usuario', 'Nombre', 'Apellido', 'Email', 'Rol', 'Estado'],
            $data,
            fn($d) => [$d['id'], $d['username'], $d['nombre'], $d['apellido'], $d['email'], $d['rol'], $d['activo'] ? 'Activo' : 'Bloqueado']
        );
    }

    // --- ESTILOS VISUALES ---
    private function fillSheet($sheet, $headers, $data, $mapFunc)
    {
        $col = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($col . '1', $h);
            $col++;
        }

        // Estilo Encabezado
        $lastCol = chr(ord('A') + count($headers) - 1);
        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['argb' => Color::COLOR_WHITE], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1F4E78']], // Azul oscuro
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
        ]);
        $sheet->getRowDimension('1')->setRowHeight(22);

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

        // Autoajuste Columnas
        $col = 'A';
        foreach ($headers as $h) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
            $col++;
        }

        // Bordes
        if ($row > 2) {
            $sheet->getStyle("A1:{$lastCol}" . ($row - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        }
    }

    private function sheetDetalleOT(Spreadsheet $s, $id)
    {
        $repo = new MantencionRepository();
        $header = $repo->getOTHeader($id);
        $detalles = $repo->getDetallesOT($id);

        $sheet = $s->getSheet(0);
        $sheet->setTitle("OT #$id");

        // Cabecera estilo Ficha
        $sheet->setCellValue('A1', 'REPORTE DE ORDEN DE TRABAJO #' . $id);
        $sheet->mergeCells('A1:E1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        $sheet->setCellValue('A3', 'Solicitante:');
        $sheet->setCellValue('B3', $header['solicitante_nombre'] . ' ' . $header['solicitante_apellido']);
        $sheet->setCellValue('A4', 'Máquina:');
        $sheet->setCellValue('B4', $header['activo'] ?? 'General');
        $sheet->setCellValue('A5', 'Fecha:');
        $sheet->setCellValue('B5', $header['fecha_solicitud']);
        $sheet->setCellValue('A6', 'Estado:');
        $sheet->setCellValue('B6', $header['estado']);
        $sheet->setCellValue('A7', 'Descripción:');
        $sheet->setCellValue('B7', $header['descripcion_trabajo']);

        // Tabla Items
        $row = 9;
        $headers = ['SKU', 'Insumo', 'Solicitado', 'Entregado', 'Estado'];
        $col = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($col . $row, $h);
            $sheet->getColumnDimension($col)->setAutoSize(true);
            $col++;
        }
        // Estilo Header Tabla
        $sheet->getStyle('A9:E9')->getFont()->setBold(true)->setColor(new Color(Color::COLOR_WHITE));
        $sheet->getStyle('A9:E9')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FF1F4E78');

        $row++;
        foreach ($detalles as $d) {
            $sheet->setCellValue('A' . $row, $d['codigo_sku']);
            $sheet->setCellValue('B' . $row, $d['nombre']);
            $sheet->setCellValue('C' . $row, $d['cantidad']);
            $sheet->setCellValue('D' . $row, $d['cantidad_entregada']);
            $sheet->setCellValue('E' . $row, $d['estado_linea']);
            $row++;
        }

        $sheet->getStyle('A9:E' . ($row - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
    }
}