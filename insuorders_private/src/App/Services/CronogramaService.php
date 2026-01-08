<?php
namespace App\Services;

use App\Repositories\CronogramaRepository;
use App\Repositories\MantencionRepository;
use App\Database\Database;

class CronogramaService
{
    private $repo;
    private $mantencionRepo;
    private $db;

    public function __construct()
    {
        $this->repo = new CronogramaRepository();
        $this->mantencionRepo = new MantencionRepository(); 
        $this->db = Database::getConnection();
    }

    public function listar($filtros)
    {
        return $this->repo->getAll($filtros);
    }

    public function obtener($id)
    {
        return $this->repo->findById($id);
    }

    public function crear($data, $usuarioId)
    {
        try {
            $this->db->beginTransaction();

            $otData = [
                'usuario_id' => $usuarioId,
                'activo_id' => $data['activo_id'],
                'observacion' => "MANTENCION PROGRAMADA: " . $data['titulo'],
                'origen_tipo' => 'Preventiva',
                'area_negocio' => 'MANTENCION',
                'centro_costo_ot' => '6400',
                'solicitante_externo' => 'CRONOGRAMA',
                'items' => $data['items'] ?? []
            ];

            $otId = $this->mantencionRepo->createOT($otData);

            $data['solicitud_ot_id'] = $otId;
            $id = $this->repo->create($data);

            if (!empty($data['items'])) {
                $this->repo->addInsumos($id, $data['items']);
            }

            $this->db->commit();
            return $id;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function actualizar($id, $data)
    {
        try {
            $this->db->beginTransaction();

            $eventoActual = $this->repo->findById($id);
            if (!$eventoActual)
                throw new \Exception("Evento no encontrado");

            $this->repo->update($id, $data);
            $this->repo->deleteInsumos($id);

            if (!empty($data['items'])) {
                $this->repo->addInsumos($id, $data['items']);
            }

            if (!empty($eventoActual['solicitud_ot_id'])) {
                $otUpdateData = [
                    'activo_id' => $data['activo_id'],
                    'observacion' => "MANTENCION PROGRAMADA (EDITADO): " . $data['titulo'],
                    'origen_tipo' => 'Preventiva',
                    'area_negocio' => 'MANTENCION',
                    'centro_costo_ot' => '6400',
                    'solicitante_externo' => 'CRONOGRAMA',
                    'items' => $data['items'] ?? []
                ];
                $this->mantencionRepo->updateOT($eventoActual['solicitud_ot_id'], $otUpdateData);
            }

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function eliminar($id)
    {
        try {
            $this->db->beginTransaction();
            $evento = $this->repo->findById($id);

            if ($evento && !empty($evento['solicitud_ot_id'])) {
                $this->mantencionRepo->delete($evento['solicitud_ot_id']);
            }

            $this->repo->delete($id);
            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}