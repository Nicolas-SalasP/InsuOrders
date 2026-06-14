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
        $evento = $this->repo->findById($id);
        if ($evento && !empty($evento['solicitud_ot_id'])) {
            $ot = $this->mantencionRepo->getOTHeader($evento['solicitud_ot_id']);
            if ($ot) {
                $evento['ot_ubicacion'] = $ot['ubicacion'];
                $asignados = $this->mantencionRepo->getAsignadosOT($evento['solicitud_ot_id']);
                $evento['ot_asignados'] = array_column($asignados, 'usuario_id');
            }
        }
        return $evento;
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
            if (!$inTransaction)
                $this->db->beginTransaction();

            $otId = null;

            if (($data['tipo_evento'] ?? 'MANTENCION') === 'MANTENCION') {
                $otData = [
                    'usuario_id' => $usuarioId,
                    'activo_id' => $data['activo_id'] ?? null,
                    'sub_activo_id' => $data['sub_activo_id'] ?? null,
                    'titulo' => "PREVENTIVO: " . $data['titulo'],
                    'observacion' => $data['descripcion'] ?? "Mantenimiento preventivo programado",
                    'origen_tipo' => 'Preventiva',
                    'area_negocio' => 'MANTENCION',
                    'centro_costo_ot' => '6400',
                    'solicitante_externo' => 'CRONOGRAMA',
                    'fecha_requerida' => $data['fecha_programada'],
                    'ubicacion' => $data['ubicacion'] ?? null,
                    'asignados' => !empty($data['asignados']) ? array_map('intval', $data['asignados']) : [],
                    'items' => $data['items'] ?? []
                ];

                $otId = $this->mantencionRepo->createOT($otData);
            }

            $data['solicitud_ot_id'] = $otId;
            $id = $this->repo->create($data);

            if (!empty($data['items'])) {
                $this->repo->addInsumos($id, $data['items']);
            }

            if ($generarFuturo && !empty($data['frecuencia']) && !empty($data['unidad_frecuencia'])) {
                $frecuencia = (int) $data['frecuencia'];
                $unidad = strtoupper($data['unidad_frecuencia']);

                $proyCant = !empty($data['proyeccion_cantidad']) ? (int) $data['proyeccion_cantidad'] : 1;
                $proyUnidad = !empty($data['proyeccion_unidad']) ? $data['proyeccion_unidad'] : 'years';

                if ($proyUnidad === 'years' && $proyCant > 5)
                    $proyCant = 5;
                if ($proyUnidad === 'months' && $proyCant > 60)
                    $proyCant = 60;

                try {
                    $fechaInicial = new \DateTime($data['fecha_programada']);
                    $fechaLimite = (clone $fechaInicial)->modify("+{$proyCant} {$proyUnidad}");
                    $fechaIterativa = clone $fechaInicial;

                    // Tope duro de seguridad: evita una explosion de OTs si la combinacion
                    // frecuencia/proyeccion es muy grande o la unidad de proyeccion es invalida.
                    $maxOcurrencias = 260;
                    $generadas = 0;

                    while (true) {
                        switch ($unidad) {
                            case 'DIAS':
                                $fechaIterativa->modify("+$frecuencia days");
                                break;
                            case 'SEMANAS':
                                $fechaIterativa->modify("+$frecuencia weeks");
                                break;
                            case 'MESES':
                                $fechaIterativa->modify("+$frecuencia months");
                                break;
                            case 'ANIOS':
                            case 'AÑOS':
                                $fechaIterativa->modify("+$frecuencia years");
                                break;
                            default:
                                break 2;
                        }

                        if ($fechaIterativa > $fechaLimite) {
                            break;
                        }

                        if (++$generadas > $maxOcurrencias) {
                            error_log("Cronograma: proyeccion truncada en {$maxOcurrencias} ocurrencias (OT base {$id})");
                            break;
                        }

                        $dataFutura = $data;
                        $dataFutura['fecha_programada'] = $fechaIterativa->format('Y-m-d');
                        $this->crear($dataFutura, $usuarioId, false);
                    }

                } catch (Exception $e) {
                    error_log("Error calculando fechas futuras: " . $e->getMessage());
                }
            }

            if (!$inTransaction)
                $this->db->commit();
            return $id;
        } catch (Exception $e) {
            if (!$inTransaction)
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
                throw new Exception("Evento no encontrado");

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
                    'sub_activo_id' => $data['sub_activo_id'] ?? null, // <-- ESTO FALTABA
                    'titulo' => "MANTENIMIENTO (EDITADO): " . $data['titulo'],
                    'observacion' => $data['descripcion'] ?? "Mantenimiento preventivo programado",
                    'origen_tipo' => $headerOT['origen_tipo'] ?? 'Preventiva',
                    'area_negocio' => $headerOT['area_negocio'] ?? 'MANTENCION',
                    'centro_costo_ot' => $headerOT['centro_costo_ot'] ?? '6400',
                    'solicitante_externo' => $headerOT['solicitante_externo'] ?? 'CRONOGRAMA',
                    'fecha_requerida' => $data['fecha_programada'],
                    'ubicacion' => array_key_exists('ubicacion', $data) ? $data['ubicacion'] : ($headerOT['ubicacion'] ?? null),
                    'asignados' => isset($data['asignados']) ? array_map('intval', $data['asignados']) : null,
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

            if (!$evento)
                throw new Exception("Evento no existe");
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

    public function syncByOT($otId, $otData)
    {
        $this->repo->syncByOT($otId, $otData);
    }

    public function obtenerResumen(string $mes): array
    {
        return $this->repo->getResumen($mes);
    }
}