<?php
namespace App\Services;

use App\Repositories\CronogramaRepository;
use App\Services\MantencionService;
use App\Database\Database;

class CronogramaService
{
    private $repo;
    private $mantencionService;
    private $db;

    public function __construct()
    {
        $this->repo = new CronogramaRepository();
        $this->mantencionService = new MantencionService();
        $this->db = Database::getConnection();
    }

    public function listar($filtros) { return $this->repo->getAll($filtros); }

    public function obtener($id) { return $this->repo->findById($id); }

    public function crear($data)
    {
        try {
            $this->db->beginTransaction();
            
            $id = $this->repo->create($data);

            $items = !empty($data['items']) ? $data['items'] : ($data['insumos'] ?? []);
            
            if (!empty($items)) {
                $this->repo->addInsumos($id, $items);
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
            
            $this->repo->update($id, $data);
            
            $this->repo->deleteInsumos($id);
            
            $items = !empty($data['items']) ? $data['items'] : ($data['insumos'] ?? []);
            if (!empty($items)) {
                $this->repo->addInsumos($id, $items);
            }
            
            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function eliminar($id) { return $this->repo->delete($id); }

    public function procesarAlertasAutomaticas()
    {
        $pendientes = $this->repo->getPendientesAlerta();
        $generados = 0;

        foreach ($pendientes as $p) {
            try {
                if ($p['tipo_evento'] !== 'MANTENCION') continue;

                $detalle = $this->repo->findById($p['id']);
                $items = $detalle['items'] ?? [];

                if (empty($items) && !empty($p['activo_id'])) {
                    $stmtKit = $this->db->prepare("SELECT insumo_id as id, cantidad_default as cantidad FROM activos_insumos WHERE activo_id = ?");
                    $stmtKit->execute([$p['activo_id']]);
                    $items = $stmtKit->fetchAll(\PDO::FETCH_ASSOC);
                }

                if (!empty($items)) {
                    $otData = [
                        'activo_id' => $p['activo_id'],
                        'observacion' => "Preventiva Auto: " . $p['titulo'],
                        'origen_tipo' => 'Preventiva',
                        'items' => $items,
                        'usuario_id' => 1, 
                        'area_negocio' => 'MANTENCION',
                        'centro_costo_ot' => '6400',
                        'solicitante_externo' => 'SISTEMA'
                    ];

                    $otId = $this->mantencionService->crearOT($otData, 1);

                    $this->repo->updateEstado($p['id'], 'PROCESADO', $otId);
                    $generados++;
                }
            } catch (\Exception $e) { continue; }
        }
        return $generados;
    }
}