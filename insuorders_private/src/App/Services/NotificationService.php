<?php
namespace App\Services;

use App\Repositories\NotificationRepository;

class NotificationService
{
    private $repository;

    public function __construct()
    {
        $this->repository = new NotificationRepository();
    }

    public function crearNotificacion($userId, $titulo, $mensaje, $link = null, $tipo = 'info')
    {
        return $this->repository->create($userId, $titulo, $mensaje, $link, $tipo);
    }

    public function leerNotificacion($notifId, $userId) { return $this->repository->markAsRead($notifId, $userId); }
    public function leerTodas($userId) { return $this->repository->markAllRead($userId); }

    // ==========================================
    // ENSAMBLAJE DE LAS NOTIFICACIONES GLOBALES
    // ==========================================
    public function obtenerPanelDeNotificaciones($userId)
    {
        $data = [
            'total' => 0,
            'personal' => ['count' => 0, 'mensajes' => []],
            'compras' => ['count' => 0, 'mensajes' => []],
            'bodega' => ['count' => 0, 'mensajes' => []],
            'mantencion' => ['count' => 0, 'mensajes' => []]
        ];

        $data['personal']['count'] = $this->repository->getUnreadCount($userId);
        $notificacionesBd = $this->repository->getByUser($userId);
        
        foreach ($notificacionesBd as $n) {
            $data['personal']['mensajes'][] = [
                'id' => $n['id'],
                'titulo' => $n['titulo'],
                'texto' => $n['mensaje'],
                'ruta' => $n['link'],
                'tipo' => $n['tipo'],
                'leido' => $n['leido']
            ];
        }

        $faltanteReal = $this->repository->countFaltaStockReal();
        if ($faltanteReal > 0) {
            $data['compras']['count'] += $faltanteReal;
            $data['compras']['mensajes'][] = [
                'titulo' => 'Déficit de Insumos',
                'texto' => "Hay {$faltanteReal} insumo(s) sin stock que requieren compra.",
                'ruta' => '/compras',
                'tipo' => 'warning'
            ];
        }

        $entregas = $this->repository->countEntregasPendientes();
        if ($entregas > 0) {
            $data['bodega']['count'] += $entregas;
            $data['bodega']['mensajes'][] = [
                'titulo' => 'Entregas a Taller',
                'texto' => "Tienes {$entregas} repuesto(s) listos para despachar.",
                'ruta' => '/bodega',
                'tipo' => 'info'
            ];
        }

        $recepciones = $this->repository->countRecepcionesOc();
        if ($recepciones > 0) {
            $data['bodega']['count'] += $recepciones;
            $data['bodega']['mensajes'][] = [
                'titulo' => 'Recepción de Proveedor',
                'texto' => "Hay {$recepciones} Orden(es) de Compra en tránsito.",
                'ruta' => '/compras',
                'tipo' => 'success'
            ];
        }

        $otNuevas = $this->repository->countOtsNuevas();
        if ($otNuevas > 0) {
            $data['mantencion']['count'] += $otNuevas;
            $data['mantencion']['mensajes'][] = [
                'titulo' => 'Órdenes Nuevas',
                'texto' => "{$otNuevas} OT(s) requieren revisión o asignación técnica.",
                'ruta' => '/mantencion',
                'tipo' => 'primary'
            ];
        }

        $data['total'] = $data['personal']['count'] + $data['compras']['count'] + $data['bodega']['count'] + $data['mantencion']['count'];

        return $data;
    }
}