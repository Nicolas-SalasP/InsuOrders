<?php
namespace App\Services;

use App\Repositories\CronogramaRepository;
use App\Repositories\MantencionRepository;
use App\Database\Database;
use Exception;

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

    private function validarEdicion($evento)
    {
        $hoy = date('Y-m-d');
        if ($evento['fecha_programada'] < $hoy) {
            throw new Exception("No es posible editar ni eliminar eventos de fechas pasadas.");
        }

        if (!empty($evento['solicitud_ot_id'])) {
            $ot = $this->mantencionRepo->getOTHeader($evento['solicitud_ot_id']);
            if ($ot && in_array($ot['estado_id'], [5, 6])) {
                throw new Exception("La OT asociada ya se encuentra Finalizada o Anulada. Solo lectura.");
            }
        }
    }

    public function crear($data, $usuarioId, $generarFuturo = true)
    {
        try {
            $inTransaction = $this->db->inTransaction();
            if (!$inTransaction) $this->db->beginTransaction();

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

            if ($generarFuturo && !empty($data['activo_id']) && $data['tipo_evento'] === 'MANTENCION') {
                $activo = $this->mantencionRepo->getActivoById($data['activo_id']);
                
                if ($activo && !empty($activo['frecuencia_mantencion']) && $activo['frecuencia_mantencion'] > 0) {
                    $frecuencia = (int)$activo['frecuencia_mantencion'];
                    $unidad = strtoupper($activo['unidad_frecuencia']);
                    
                    try {
                        $fechaInicial = new \DateTime($data['fecha_programada']);
                        $fechaLimite = (clone $fechaInicial)->modify('+1 year');
                        $fechaIterativa = clone $fechaInicial;

                        while (true) {
                            switch ($unidad) {
                                case 'DIAS': $fechaIterativa->modify("+$frecuencia days"); break;
                                case 'SEMANAS': $fechaIterativa->modify("+$frecuencia weeks"); break;
                                case 'MESES': $fechaIterativa->modify("+$frecuencia months"); break;
                                case 'ANIOS': $fechaIterativa->modify("+$frecuencia years"); break;
                                default: break 2;
                            }

                            if ($fechaIterativa > $fechaLimite) {
                                break;
                            }

                            $dataFutura = $data;
                            $dataFutura['fecha_programada'] = $fechaIterativa->format('Y-m-d');
                            $this->crear($dataFutura, $usuarioId, false);
                        }

                    } catch (Exception $e) {
                    }
                }
            }

            if (!$inTransaction) $this->db->commit();
            return $id;
        } catch (Exception $e) {
            if (!$inTransaction) $this->db->rollBack();
            throw $e;
        }
    }

    public function actualizar($id, $data)
    {
        try {
            $this->db->beginTransaction();

            $eventoActual = $this->repo->findById($id);
            if (!$eventoActual) throw new Exception("Evento no encontrado");

            $this->validarEdicion($eventoActual);

            $this->repo->update($id, $data);
            $this->repo->deleteInsumos($id);
            if (!empty($data['items'])) {
                $this->repo->addInsumos($id, $data['items']);
            }

            if (!empty($eventoActual['solicitud_ot_id'])) {
                $otId = $eventoActual['solicitud_ot_id'];
                
                $headerOT = $this->mantencionRepo->getOTHeader($otId);
                $itemsOT = $this->mantencionRepo->getDetallesOT($otId);

                $itemsFinales = [];
                $insumosEnCronograma = [];

                $mapaItemsOT = [];
                foreach ($itemsOT as $it) {
                    $mapaItemsOT[$it['id']] = $it;
                }

                if (!empty($data['items'])) {
                    foreach ($data['items'] as $itemCron) {
                        $insumoId = $itemCron['insumo_id'] ?? $itemCron['id'] ?? null;
                        if ($insumoId) {
                            $insumosEnCronograma[] = $insumoId;
                            
                            $linea = [
                                'insumo_id' => $insumoId,
                                'cantidad' => $itemCron['cantidad']
                            ];

                            if (isset($mapaItemsOT[$insumoId])) {
                                $linea['id_linea'] = $mapaItemsOT[$insumoId]['detalle_id'];
                            }
                            
                            $itemsFinales[] = $linea;
                        }
                    }
                }

                foreach ($itemsOT as $it) {
                    if (!in_array($it['id'], $insumosEnCronograma)) {
                        $itemsFinales[] = [
                            'id_linea' => $it['detalle_id'],
                            'cantidad' => $it['cantidad']
                        ];
                    }
                }

                $otUpdateData = [
                    'activo_id' => $data['activo_id'],
                    'observacion' => "MANTENCION PROGRAMADA (EDITADO): " . $data['titulo'],
                    'origen_tipo' => $headerOT['origen_tipo'] ?? 'Preventiva',
                    'area_negocio' => $headerOT['area_negocio'] ?? 'MANTENCION',
                    'centro_costo_ot' => $headerOT['centro_costo_ot'] ?? '6400',
                    'solicitante_externo' => $headerOT['solicitante_externo'] ?? 'CRONOGRAMA',
                    'items' => $itemsFinales
                ];
                
                $this->mantencionRepo->updateOT($otId, $otUpdateData);
            }

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function eliminar($id)
    {
        try {
            $this->db->beginTransaction();
            $evento = $this->repo->findById($id);

            if (!$evento) throw new Exception("Evento no existe");
            $this->validarEdicion($evento);

            if (!empty($evento['solicitud_ot_id'])) {
                $this->mantencionRepo->delete($evento['solicitud_ot_id']);
            }

            $this->repo->delete($id);
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}