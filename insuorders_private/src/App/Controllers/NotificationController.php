<?php
namespace App\Controllers;

use App\Database\Database;

class NotificationController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function index()
    {
        $data = [
            'total' => 0,
            'compras' => ['count' => 0, 'mensajes' => []],
            'bodega' => ['count' => 0, 'mensajes' => []],
            'mantencion' => ['count' => 0, 'mensajes' => []]
        ];

        try {
            // --- 1. COMPRAS ---
            // Solicitudes desde Mantención
            $stmtSol = $this->db->query("SELECT COUNT(DISTINCT insumo_id) FROM detalle_solicitud WHERE estado_linea = 'REQUIERE_COMPRA'");
            $solicitudes = $stmtSol->fetchColumn();
            
            if ($solicitudes > 0) {
                $data['compras']['count'] += $solicitudes;
                $data['compras']['mensajes'][] = [
                    'titulo' => 'Solicitud de Material',
                    'texto' => "Hay {$solicitudes} insumo(s) solicitados por taller.",
                    'ruta' => '/compras' // <--- CORREGIDO: Redirige al módulo principal
                ];
            }

            // --- 2. BODEGA ---
            // A. Entregas pendientes
            $stmtEntregas = $this->db->query("SELECT COUNT(*) FROM detalle_solicitud WHERE estado_linea = 'PENDIENTE'");
            $entregas = $stmtEntregas->fetchColumn();
            
            if ($entregas > 0) {
                $data['bodega']['count'] += $entregas;
                $data['bodega']['mensajes'][] = [
                    'titulo' => 'Despacho Pendiente',
                    'texto' => "{$entregas} repuesto(s) por entregar.",
                    'ruta' => '/bodega' // <--- CORREGIDO
                ];
            }

            // B. Recepción de OCs
            $stmtOC = $this->db->query("SELECT COUNT(*) FROM ordenes_compra WHERE estado_id = 2"); // 2 = Solicitada
            $recepciones = $stmtOC->fetchColumn();
            
            if ($recepciones > 0) {
                $data['bodega']['count'] += $recepciones;
                $data['bodega']['mensajes'][] = [
                    'titulo' => 'Recepción',
                    'texto' => "{$recepciones} orden(es) llegando.",
                    'ruta' => '/compras' // <--- Las OCs se ven en Compras generalmente, o '/bodega' si tienes vista de recepción
                ];
            }

            // --- 3. MANTENCIÓN ---
            // OTs Nuevas
            $stmtOT = $this->db->query("SELECT COUNT(*) FROM solicitudes_ot WHERE estado_id = 1");
            $otNuevas = $stmtOT->fetchColumn();
            
            if ($otNuevas > 0) {
                $data['mantencion']['count'] += $otNuevas;
                $data['mantencion']['mensajes'][] = [
                    'titulo' => 'Nueva OT',
                    'texto' => "{$otNuevas} OT(s) requieren asignación.",
                    'ruta' => '/mantencion' // <--- CORREGIDO
                ];
            }

            // TOTALIZAR
            $data['total'] = $data['compras']['count'] + $data['bodega']['count'] + $data['mantencion']['count'];

            echo json_encode(["success" => true, "data" => $data]);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}