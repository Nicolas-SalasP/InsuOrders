<?php
namespace App\Services;

use App\Repositories\MisMantencionesRepository;
use App\Database\Database;
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
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT rol_id FROM usuarios WHERE id = ?");
        $stmt->execute([$userId]);
        $rolId = $stmt->fetchColumn();
        if ($rolId == 1 || $rolId == 3) {
            $ots = $this->repository->getAllOtsWithAsignados();
        } else {
            $ots = $this->repository->getOtsAsignadas($userId);
        }
        
        $ids = array_column($ots, 'id');
        $todasRespuestas = !empty($ids) ? $this->repository->getRespuestasPorOts($ids) : [];

        $mapaGlobal = [];
        foreach ($todasRespuestas as $r) {
            $mapaGlobal[$r['solicitud_ot_id']][$r['item_key']] = [
                'valor' => $r['valor'],
                'observacion' => $r['observacion']
            ];
        }

        foreach ($ots as &$ot) {
            $ot['respuestas_guardadas'] = $mapaGlobal[$ot['id']] ?? [];
        }

        return $ots;
    }

    public function guardarAvance($otId, $respuestas)
    {
        if (empty($otId))
            throw new Exception("Falta ID de OT.");
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

    public function guardarCierre($otId, $firma, $comentarios, $evidenciaStr = null)
    {
        return $this->repository->guardarCierre($otId, $firma, $comentarios, $evidenciaStr);
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

    public function registrarInicioTrabajo($otId)
    {
        if (empty($otId))
            throw new Exception("ID de OT no válido para iniciar trabajo.");
        return $this->repository->iniciarTrabajoEnOrden($otId);
    }

    public function actualizarEstadoOT($otId, $estadoId)
    {
        if (empty($otId) || empty($estadoId)) {
            throw new Exception("ID de OT y Estado son obligatorios.");
        }
        return $this->repository->actualizarEstadoOT($otId, $estadoId);
    }

    public function guardarAvanceParcial($otId, $comentarios, $evidenciaStr)
    {
        return $this->repository->guardarAvanceParcial($otId, $comentarios, $evidenciaStr);
    }
}