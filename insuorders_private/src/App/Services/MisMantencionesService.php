<?php
namespace App\Services;

use App\Repositories\MisMantencionesRepository;
use Exception;

class MisMantencionesService
{
    public $repository;

    public function __construct()
    {
        $this->repository = new MisMantencionesRepository();
    }

    public function listarMisOts($userId)
    {
        if (!$userId) throw new Exception("Usuario no identificado.");
        
        $ots = $this->repository->getOtsAsignadas($userId);
        
        foreach ($ots as &$ot) {
            $respuestas = $this->repository->getRespuestasPorOt($ot['id']);
            $mapa = [];
            foreach ($respuestas as $r) {
                $mapa[$r['item_key']] = [
                    'valor' => $r['valor'],
                    'observacion' => $r['observacion']
                ];
            }
            $ot['respuestas_guardadas'] = $mapa;
        }

        return $ots;
    }

    public function guardarAvance($otId, $respuestas)
    {
        if (empty($otId)) throw new Exception("Falta ID de OT.");
        return $this->repository->guardarChecklist($otId, $respuestas);
    }

    public function ejecutarDescuentos($otId, $userId)
    {
        $insumosRequeridos = $this->repository->getInsumosPorOt($otId, $userId);
        foreach ($insumosRequeridos as $item) {
            $cantidadNecesaria = floatval($item['cantidad']);
            if ($cantidadNecesaria > 0) {
                $this->repository->descontarStockUsuario($userId, $item['insumo_id'], $cantidadNecesaria);
            }
        }
    }

    public function guardarCierre($otId, $firma, $comentarios)
    {
        return $this->repository->guardarCierre($otId, $firma, $comentarios);
    }

    public function guardarUrlPdf($otId, $url)
    {
        return $this->repository->guardarUrlPdf($otId, $url);
    }
    
    public function getDatosReporte($otId)
    {
        return [
            'header' => $this->repository->getOTHeader($otId),
            'detalles' => $this->repository->getDetallesOT($otId)
        ];
    }

    public function getDetalleCompletoOt($otId, $userId)
    {
        return [
            'insumos' => $this->repository->getInsumosPorOt($otId, $userId),
            'respuestas' => $this->repository->getRespuestasPorOt($otId)
        ];
    }
}