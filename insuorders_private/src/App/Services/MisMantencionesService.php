<?php
namespace App\Services;

use App\Repositories\MisMantencionesRepository;
use Exception;

class MisMantencionesService
{
    private $repository;

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

    // --- NUEVOS ---

    public function guardarCierre($otId, $firma, $comentarios)
    {
        return $this->repository->guardarCierre($otId, $firma, $comentarios);
    }

    public function guardarUrlPdf($otId, $url)
    {
        return $this->repository->guardarUrlPdf($otId, $url);
    }
    
    // Getters para el PDF
    public function getDatosReporte($otId)
    {
        return [
            'header' => $this->repository->getOTHeader($otId),
            'detalles' => $this->repository->getDetallesOT($otId)
        ];
    }

    public function getDetalleCompletoOt($otId)
    {
        return [
            'insumos' => $this->repository->getInsumosPorOt($otId),
            'respuestas' => $this->repository->getRespuestasPorOt($otId)
        ];
    }
}