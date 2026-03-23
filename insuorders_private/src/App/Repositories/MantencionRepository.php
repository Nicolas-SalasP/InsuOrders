<?php
namespace App\Repositories;

use App\Database\Database;
use Exception;
use PDO;

class MantencionRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getDb()
    {
        return $this->db;
    }

    public function getAll($filters = [])
    {
        $sql = "SELECT s.*, 
                COALESCE(a.nombre, CONCAT('SERVICIO / ', COALESCE(s.area_negocio, 'General'))) as activo, 
                COALESCE(a.codigo_interno, 'N/A') as activo_codigo, 
                sa.nombre as sub_activo_nombre,
                u.nombre as solicitante_nombre, u.apellido as solicitante_apellido, e.nombre as estado, e.id as estado_id,
                t.nombre as tecnico_nombre, t.apellido as tecnico_apellido,
                tpt.nombre as tipo_permiso_nombre,
                (SELECT GROUP_CONCAT(CONCAT(usr.nombre, ' ', usr.apellido) SEPARATOR ', ') FROM ot_asignaciones oa JOIN usuarios usr ON oa.usuario_id = usr.id WHERE oa.solicitud_id = s.id) as asignados_nombres,
                (SELECT GROUP_CONCAT(oa.usuario_id) FROM ot_asignaciones oa WHERE oa.solicitud_id = s.id) as asignados_ids
                FROM solicitudes_ot s 
                LEFT JOIN activos a ON s.activo_id = a.id 
                LEFT JOIN activos sa ON s.sub_activo_id = sa.id
                JOIN usuarios u ON s.usuario_solicitante_id = u.id 
                JOIN estados_solicitud e ON s.estado_id = e.id 
                LEFT JOIN usuarios t ON s.asignado_a = t.id 
                LEFT JOIN tipos_permiso_trabajo tpt ON s.tipo_permiso_id = tpt.id
                WHERE 1=1";

        $params = [];

        if (!empty($filters['ot'])) {
            $sql .= " AND s.id = :ot";
            $params[':ot'] = $filters['ot'];
        }
        if (!empty($filters['maquina'])) {
            $sql .= " AND (a.nombre LIKE :maq OR a.codigo_interno LIKE :maq)";
            $params[':maq'] = '%' . $filters['maquina'] . '%';
        }
        if (!empty($filters['estado'])) {
            $sql .= " AND e.nombre = :est";
            $params[':est'] = $filters['estado'];
        }
        if (!empty($filters['fecha'])) {
            $sql .= " AND DATE(s.fecha_solicitud) = :fec";
            $params[':fec'] = $filters['fecha'];
        }
        if (!empty($filters['insumo_id'])) {
            $sql .= " AND s.id IN (SELECT solicitud_id FROM detalle_solicitud WHERE insumo_id = :insumo)";
            $params[':insumo'] = $filters['insumo_id'];
        }

        $sql .= " GROUP BY s.id 
                ORDER BY 
                    CASE UPPER(TRIM(s.prioridad)) 
                        WHEN 'CRITICO' THEN 1 
                        WHEN 'CRÍTICO' THEN 1 
                        WHEN 'URGENTE' THEN 2 
                        WHEN 'ALTA' THEN 3 
                        WHEN 'MEDIA' THEN 4 
                        WHEN 'BAJA' THEN 5 
                        ELSE 6 
                    END ASC, 
                    s.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getActivos()
    {
        $sql = "SELECT a.*, 
                COALESCE(cc.nombre, cc_legacy.nombre) as centro_costo_nombre, 
                COALESCE(cc.codigo, cc_legacy.codigo) as centro_costo_codigo, 
                COALESCE(cc.id, cc_legacy.id) as centro_costo_real_id,
                p.nombre as padre_nombre, p.codigo_interno as padre_codigo
                FROM activos a 
                LEFT JOIN centros_costo cc ON a.centro_costo_id = cc.id 
                LEFT JOIN centros_costo cc_legacy ON a.centro_costo_id = cc_legacy.codigo 
                LEFT JOIN activos p ON a.activo_padre_id = p.id
                ORDER BY a.nombre ASC";
        $data = $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        foreach ($data as &$row) {
            if (empty($row['centro_costo_id']) && !empty($row['centro_costo_real_id'])) {
                $row['centro_costo_id'] = $row['centro_costo_real_id'];
            }
        }
        return $data;
    }

    public function getActivoById($id)
    {
        $sql = "SELECT * FROM activos WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createActivo($data)
    {
        $check = $this->db->prepare("SELECT id FROM activos WHERE codigo_interno=:cod");
        $check->execute([':cod' => $data['codigo_interno']]);
        if ($check->fetch())
            throw new Exception("El código '{$data['codigo_interno']}' ya existe.");

        $ccId = $this->resolveCentroCostoId($data['centro_costo'] ?? null);
        $padreId = !empty($data['activo_padre_id']) ? $data['activo_padre_id'] : null;

        $sql = "INSERT INTO activos (codigo_interno, codigo_maquina, nombre, tipo, marca, modelo, anio, numero_serie, ubicacion, descripcion, centro_costo_id, estado_activo, imagen_url, frecuencia_mantencion, unidad_frecuencia, activo_padre_id) 
                VALUES (:cod, :cod_maq, :nom, :tipo, :marca, :mod, :anio, :serie, :ubi, :desc, :cc, :est, :img, :frec, :uni, :padre)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':cod' => $data['codigo_interno'],
            ':cod_maq' => $data['codigo_maquina'] ?? null,
            ':nom' => $data['nombre'],
            ':tipo' => $data['tipo'],
            ':marca' => $data['marca'] ?? null,
            ':mod' => $data['modelo'] ?? null,
            ':anio' => !empty($data['anio']) ? $data['anio'] : null,
            ':serie' => $data['numero_serie'] ?? null,
            ':ubi' => $data['ubicacion'],
            ':desc' => $data['descripcion'] ?? '',
            ':cc' => $ccId,
            ':est' => $data['estado_activo'] ?? 'OPERATIVO',
            ':img' => $data['imagen_url'] ?? null,
            ':frec' => !empty($data['frecuencia_mantencion']) ? $data['frecuencia_mantencion'] : null,
            ':uni' => !empty($data['unidad_frecuencia']) ? $data['unidad_frecuencia'] : null,
            ':padre' => $padreId
        ]);

        $activoId = $this->db->lastInsertId();

        if (!empty($data['galeria']) && is_array($data['galeria'])) {
            $sqlGal = "INSERT INTO activos_imagenes (activo_id, imagen_url, tipo) VALUES (:aid, :url, :tipo)";
            $stmtGal = $this->db->prepare($sqlGal);
            foreach ($data['galeria'] as $img) {
                $stmtGal->execute([':aid' => $activoId, ':url' => $img['url'], ':tipo' => $img['tipo'] ?? 'General']);
            }
        }
        return $activoId;
    }

    public function updateActivo($data)
    {
        $ccId = $this->resolveCentroCostoId($data['centro_costo'] ?? null);
        $padreId = !empty($data['activo_padre_id']) ? $data['activo_padre_id'] : null;
        $imgSql = !empty($data['imagen_url']) ? ", imagen_url = :img" : "";

        $sql = "UPDATE activos SET 
                codigo_interno=:cod, codigo_maquina=:cod_maq, nombre=:nom, tipo=:tipo, marca=:marca, modelo=:mod,
                anio=:anio, numero_serie=:serie, ubicacion=:ubi, descripcion=:desc, centro_costo_id=:cc,
                estado_activo=:est, frecuencia_mantencion=:frec, unidad_frecuencia=:uni, 
                activo_padre_id=:padre $imgSql 
                WHERE id=:id";

        $params = [
            ':cod' => $data['codigo_interno'],
            ':cod_maq' => $data['codigo_maquina'] ?? null,
            ':nom' => $data['nombre'],
            ':tipo' => $data['tipo'],
            ':marca' => $data['marca'] ?? null,
            ':mod' => $data['modelo'] ?? null,
            ':anio' => !empty($data['anio']) ? $data['anio'] : null,
            ':serie' => $data['numero_serie'] ?? null,
            ':ubi' => $data['ubicacion'],
            ':desc' => $data['descripcion'] ?? '',
            ':cc' => $ccId,
            ':est' => $data['estado_activo'] ?? 'OPERATIVO',
            ':frec' => !empty($data['frecuencia_mantencion']) ? $data['frecuencia_mantencion'] : null,
            ':uni' => !empty($data['unidad_frecuencia']) ? $data['unidad_frecuencia'] : null,
            ':padre' => $padreId,
            ':id' => $data['id']
        ];
        if (!empty($data['imagen_url']))
            $params[':img'] = $data['imagen_url'];

        $this->db->prepare($sql)->execute($params);

        if (!empty($data['galeria']) && is_array($data['galeria'])) {
            $sqlGal = "INSERT INTO activos_imagenes (activo_id, imagen_url, tipo) VALUES (:aid, :url, :tipo)";
            $stmtGal = $this->db->prepare($sqlGal);
            foreach ($data['galeria'] as $img) {
                $stmtGal->execute([':aid' => $data['id'], ':url' => $img['url'], ':tipo' => $img['tipo'] ?? 'General']);
            }
        }
        return true;
    }

    public function contarOrdenesAsociadas($activoId)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM solicitudes_ot WHERE activo_id = ?");
        $stmt->execute([$activoId]);
        return $stmt->fetchColumn();
    }

    public function obtenerRutasArchivosActivo($activoId)
    {
        $rutas = [];
        $stmtGal = $this->db->prepare("SELECT imagen_url FROM activos_imagenes WHERE activo_id = ?");
        $stmtGal->execute([$activoId]);
        while ($row = $stmtGal->fetch(PDO::FETCH_ASSOC))
            $rutas[] = $row['imagen_url'];

        $stmtDoc = $this->db->prepare("SELECT url_archivo FROM activos_docs WHERE activo_id = ?");
        $stmtDoc->execute([$activoId]);
        while ($row = $stmtDoc->fetch(PDO::FETCH_ASSOC))
            $rutas[] = $row['url_archivo'];

        $stmtMain = $this->db->prepare("SELECT imagen_url FROM activos WHERE id = ?");
        $stmtMain->execute([$activoId]);
        if ($m = $stmtMain->fetchColumn())
            $rutas[] = $m;

        return $rutas;
    }

    public function eliminarActivoCompleto($activoId)
    {
        try {
            $this->db->beginTransaction();
            $this->db->prepare("DELETE FROM activos_insumos WHERE activo_id = ?")->execute([$activoId]);
            $this->db->prepare("DELETE FROM activos_imagenes WHERE activo_id = ?")->execute([$activoId]);
            $this->db->prepare("DELETE FROM activos_docs WHERE activo_id = ?")->execute([$activoId]);
            $stmtDel = $this->db->prepare("DELETE FROM activos WHERE id = ?");
            $stmtDel->execute([$activoId]);
            $ok = $stmtDel->rowCount() > 0;
            $this->db->commit();
            return $ok;
        } catch (Exception $e) {
            if ($this->db->inTransaction())
                $this->db->rollBack();
            throw $e;
        }
    }

    public function getGaleriaActivo($activoId)
    {
        $stmt = $this->db->prepare("SELECT * FROM activos_imagenes WHERE activo_id = :id ORDER BY created_at DESC");
        $stmt->execute([':id' => $activoId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function obtenerUrlImagenGaleria($id)
    {
        $stmt = $this->db->prepare("SELECT imagen_url FROM activos_imagenes WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetchColumn();
    }
    public function eliminarImagenGaleriaBD($id)
    {
        $this->db->prepare("DELETE FROM activos_imagenes WHERE id = ?")->execute([$id]);
    }
    public function getDocs($activoId)
    {
        $stmt = $this->db->prepare("SELECT * FROM activos_docs WHERE activo_id=:id ORDER BY fecha_subida DESC");
        $stmt->execute([':id' => $activoId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function addDoc($activoId, $nombre, $url)
    {
        $this->db->prepare("INSERT INTO activos_docs (activo_id, nombre_archivo, url_archivo) VALUES (:id, :nom, :url)")
            ->execute([':id' => $activoId, ':nom' => $nombre, ':url' => $url]);
    }
    public function obtenerUrlDoc($id)
    {
        $stmt = $this->db->prepare("SELECT url_archivo FROM activos_docs WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetchColumn();
    }
    public function deleteDoc($docId)
    {
        $this->db->prepare("DELETE FROM activos_docs WHERE id=:id")->execute([':id' => $docId]);
    }

    public function getKitActivo($activoId)
    {
        $sql = "SELECT ai.insumo_id as id, i.nombre as insumo_nombre, i.codigo_sku as insumo_sku, 
                    ai.cantidad_default as cantidad, ai.cantidad_default as cantidad_sugerida,
                    i.stock_actual, i.unidad_medida, i.precio_costo as precio,
                    ai.activo_id, a.nombre as origen_nombre, a.codigo_interno as origen_codigo
                FROM activos_insumos ai 
                JOIN insumos i ON ai.insumo_id = i.id 
                JOIN activos a ON ai.activo_id = a.id
                WHERE ai.activo_id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $activoId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addInsumoToKit($activoId, $insumoId, $cant)
    {
        $check = $this->db->prepare("SELECT id FROM activos_insumos WHERE activo_id=:a AND insumo_id=:i");
        $check->execute([':a' => $activoId, ':i' => $insumoId]);
        $sql = $check->fetch() ? "UPDATE activos_insumos SET cantidad_default = :c WHERE activo_id=:a AND insumo_id=:i"
            : "INSERT INTO activos_insumos (activo_id, insumo_id, cantidad_default) VALUES (:a, :i, :c)";
        $this->db->prepare($sql)->execute([':a' => $activoId, ':i' => $insumoId, ':c' => $cant]);
        $this->recalcularMinimoInsumo($insumoId);
    }
    public function removeInsumoFromKit($activoId, $insumoId)
    {
        $this->db->prepare("DELETE FROM activos_insumos WHERE activo_id=:a AND insumo_id=:i")->execute([':a' => $activoId, ':i' => $insumoId]);
        $this->recalcularMinimoInsumo($insumoId);
    }
    public function updateKitQuantity($activoId, $insumoId, $cantidad)
    {
        $this->db->prepare("UPDATE activos_insumos SET cantidad_default = :c WHERE activo_id = :a AND insumo_id = :i")->execute([':c' => $cantidad, ':a' => $activoId, ':i' => $insumoId]);
        $this->recalcularMinimoInsumo($insumoId);
    }
    private function recalcularMinimoInsumo($insumoId)
    {
        $sql = "SELECT SUM(cantidad_default) FROM activos_insumos WHERE insumo_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $insumoId]);
        $total = $stmt->fetchColumn() ?: 0;
        $this->db->prepare("UPDATE insumos SET stock_minimo = :min WHERE id = :id")->execute([':min' => $total, ':id' => $insumoId]);
    }

    public function getOTHeader($id)
    {
        $sql = "SELECT s.*, s.asignado_a, u.nombre as solicitante_nombre, u.apellido as solicitante_apellido, 
                CASE WHEN s.activo_id IS NOT NULL THEN a.nombre ELSE CONCAT('SERVICIO: ', COALESCE(s.area_negocio, 'General')) END as activo, 
                COALESCE(a.codigo_interno, 'SERV') as activo_codigo, e.nombre as estado,
                sa.nombre as sub_activo_nombre,
                tpt.nombre as tipo_permiso_nombre
                FROM solicitudes_ot s 
                JOIN usuarios u ON s.usuario_solicitante_id = u.id 
                LEFT JOIN activos a ON s.activo_id = a.id 
                LEFT JOIN activos sa ON s.sub_activo_id = sa.id
                JOIN estados_solicitud e ON s.estado_id = e.id 
                LEFT JOIN tipos_permiso_trabajo tpt ON s.tipo_permiso_id = tpt.id
                WHERE s.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getDetallesOT($id)
    {
        $sql = "SELECT d.id as detalle_id, d.insumo_id as id, d.cantidad, d.cantidad_entregada, d.estado_linea, 
                i.nombre, i.codigo_sku, i.stock_actual, i.unidad_medida, oc.id as oc_id, prov.nombre as oc_proveedor,
                (SELECT GROUP_CONCAT(DISTINCT emp.nombre_completo SEPARATOR ', ') FROM movimientos_inventario mi JOIN empleados emp ON mi.empleado_id = emp.id WHERE mi.referencia_id = d.id AND mi.tipo_movimiento_id = 2) as retirado_por
                FROM detalle_solicitud d JOIN insumos i ON d.insumo_id = i.id 
                LEFT JOIN ordenes_compra oc ON d.orden_compra_id = oc.id LEFT JOIN proveedores prov ON oc.proveedor_id = prov.id WHERE d.solicitud_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function getAsignadosOT($otId)
    {
        $sql = "SELECT oa.usuario_id, u.nombre, u.apellido, u.email, oa.completado, oa.tarea_rol FROM ot_asignaciones oa JOIN usuarios u ON oa.usuario_id = u.id WHERE oa.solicitud_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $otId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function syncAsignaciones($otId, $asignadosIds)
    {
        $stmt = $this->db->prepare("SELECT usuario_id FROM ot_asignaciones WHERE solicitud_id = :id");
        $stmt->execute([':id' => $otId]);
        $actuales = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $nuevos = array_diff($asignadosIds, $actuales);
        $borrar = array_diff($actuales, $asignadosIds);

        if (!empty($borrar)) {
            $placeholders = implode(',', array_fill(0, count($borrar), '?'));
            $sqlDelete = "DELETE FROM ot_asignaciones WHERE solicitud_id = ? AND usuario_id IN ($placeholders)";
            $this->db->prepare($sqlDelete)->execute(array_merge([$otId], array_values($borrar)));
        }
        if (!empty($nuevos)) {
            $stmtInsert = $this->db->prepare("INSERT INTO ot_asignaciones (solicitud_id, usuario_id) VALUES (?, ?)");
            foreach ($nuevos as $uid)
                $stmtInsert->execute([$otId, $uid]);
        }
    }

    public function createOT($data)
    {
        $inTransaction = $this->db->inTransaction();
        try {
            if (!$inTransaction)
                $this->db->beginTransaction();

            $sql = "INSERT INTO solicitudes_ot (usuario_solicitante_id, activo_id, sub_activo_id, titulo, descripcion_trabajo, origen_tipo, area_negocio, centro_costo_ot, solicitante_externo, estado_id, fecha_solicitud, fecha_requerida, requiere_permiso, tipo_permiso_id, descripcion_permiso, prioridad, ubicacion) 
                    VALUES (:uid, :aid, :subaid, :tit, :desc, :orig, :area, :cc, :ext, 1, NOW(), :freq, :req_perm, :tipo_perm, :desc_perm, :prio, :ubi)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':uid' => $data['usuario_id'],
                ':aid' => !empty($data['activo_id']) ? $data['activo_id'] : null,
                ':subaid' => !empty($data['sub_activo_id']) ? $data['sub_activo_id'] : null,
                ':tit' => !empty($data['titulo']) ? $data['titulo'] : null,
                ':desc' => $data['observacion'] ?? '',
                ':orig' => $data['origen_tipo'] ?? 'Interna',
                ':area' => $data['area_negocio'] ?? null,
                ':cc' => $data['centro_costo_ot'] ?? null,
                ':ext' => $data['solicitante_externo'] ?? null,
                ':freq' => !empty($data['fecha_requerida']) ? $data['fecha_requerida'] : null,
                ':req_perm' => !empty($data['requiere_permiso']) ? 1 : 0,
                ':tipo_perm' => !empty($data['tipo_permiso_id']) ? $data['tipo_permiso_id'] : null,
                ':desc_perm' => $data['descripcion_permiso'] ?? null,
                ':prio' => $data['prioridad'] ?? 'Media',
                ':ubi' => $data['ubicacion'] ?? null
            ]);
            $otId = $this->db->lastInsertId();

            if (!empty($data['asignados']) && is_array($data['asignados'])) {
                $this->syncAsignaciones($otId, $data['asignados']);
            }

            $insumosFinales = [];
            if (!empty($data['items']) && count($data['items']) > 0) {
                $insumosFinales = $data['items'];
            } elseif (!empty($data['activo_id'])) {
                $stmtKit = $this->db->prepare("SELECT insumo_id, cantidad_default as cantidad FROM activos_insumos WHERE activo_id = ?");
                $stmtKit->execute([$data['activo_id']]);
                $insumosFinales = $stmtKit->fetchAll(PDO::FETCH_ASSOC);
            }

            if (!empty($insumosFinales)) {
                $stmtStock = $this->db->prepare("SELECT stock_actual FROM insumos WHERE id = ?");
                $stmtItem = $this->db->prepare("INSERT INTO detalle_solicitud (solicitud_id, insumo_id, cantidad, estado_linea) VALUES (:sid, :iid, :cant, :estado)");
                foreach ($insumosFinales as $item) {
                    $iid = $item['insumo_id'] ?? $item['id'] ?? null;
                    $cant = $item['cantidad'] ?? 0;
                    if ($iid && $cant > 0) {
                        $stmtStock->execute([$iid]);
                        $stock = $stmtStock->fetchColumn() ?: 0;
                        $estado = ($stock >= $cant) ? 'PENDIENTE' : 'REQUIERE_COMPRA';
                        $stmtItem->execute([':sid' => $otId, ':iid' => $iid, ':cant' => $cant, ':estado' => $estado]);
                    }
                }
            }

            if (!$inTransaction)
                $this->db->commit();
            return $otId;
        } catch (Exception $e) {
            if (!$inTransaction)
                $this->db->rollBack();
            throw $e;
        }
    }

    public function updateOT($id, $data)
    {
        $inTransaction = $this->db->inTransaction();
        try {
            if (!$inTransaction)
                $this->db->beginTransaction();

            $sql = "UPDATE solicitudes_ot SET 
                    activo_id=:aid, sub_activo_id=:subaid, titulo=:tit, descripcion_trabajo=:desc, solicitante_externo=:se, centro_costo_ot=:cc, origen_tipo=:ot,
                    requiere_permiso=:req_perm, tipo_permiso_id=:tipo_perm, descripcion_permiso=:desc_perm,
                    prioridad=:prio, ubicacion=:ubi, fecha_requerida=:freq
                    WHERE id=:id";

            $this->db->prepare($sql)->execute([
                ':aid' => !empty($data['activo_id']) ? $data['activo_id'] : null,
                ':subaid' => !empty($data['sub_activo_id']) ? $data['sub_activo_id'] : null,
                ':tit' => !empty($data['titulo']) ? $data['titulo'] : null,
                ':desc' => $data['observacion'] ?? '',
                ':se' => $data['solicitante_externo'] ?: null,
                ':cc' => $data['centro_costo_ot'] ?: null,
                ':ot' => $data['origen_tipo'] ?? 'Interna',
                ':req_perm' => !empty($data['requiere_permiso']) ? 1 : 0,
                ':tipo_perm' => !empty($data['tipo_permiso_id']) ? $data['tipo_permiso_id'] : null,
                ':desc_perm' => $data['descripcion_permiso'] ?? null,
                ':prio' => $data['prioridad'] ?? 'Media',
                ':ubi' => $data['ubicacion'] ?? null,
                ':freq' => !empty($data['fecha_requerida']) ? $data['fecha_requerida'] : null,
                ':id' => $id
            ]);

            if (isset($data['asignados']) && is_array($data['asignados'])) {
                $this->syncAsignaciones($id, $data['asignados']);
            }

            if (isset($data['items'])) {
                $stmtCurrent = $this->db->prepare("SELECT id, estado_linea FROM detalle_solicitud WHERE solicitud_id = :sid");
                $stmtCurrent->execute([':sid' => $id]);
                $itemsEnBD = $stmtCurrent->fetchAll(PDO::FETCH_ASSOC);

                $estadosPorId = array_column($itemsEnBD, 'estado_linea', 'id');
                $idsRecibidos = [];
                foreach ($data['items'] as $item)
                    if (!empty($item['id_linea']))
                        $idsRecibidos[] = $item['id_linea'];
                foreach ($itemsEnBD as $itemBD) {
                    if (!in_array($itemBD['id'], $idsRecibidos)) {
                        if (in_array($itemBD['estado_linea'], ['PENDIENTE', 'REQUIERE_COMPRA'])) {
                            $this->db->prepare("DELETE FROM detalle_solicitud WHERE id = ?")->execute([$itemBD['id']]);
                        }
                    }
                }

                $stmtUpdate = $this->db->prepare("UPDATE detalle_solicitud SET cantidad = :cant, estado_linea = :st WHERE id = :id_linea");
                $stmtInsert = $this->db->prepare("INSERT INTO detalle_solicitud (solicitud_id, insumo_id, cantidad, estado_linea) VALUES (:sid, :iid, :cant, :estado)");
                $stmtStock = $this->db->prepare("SELECT stock_actual FROM insumos WHERE id = ?");

                foreach ($data['items'] as $item) {
                    $cant = floatval($item['cantidad']);
                    if (!empty($item['id_linea'])) {
                        $idLinea = $item['id_linea'];
                        $estadoActual = $estadosPorId[$idLinea];
                        if (in_array($estadoActual, ['PENDIENTE', 'REQUIERE_COMPRA'])) {
                            $iid = $this->db->query("SELECT insumo_id FROM detalle_solicitud WHERE id = $idLinea")->fetchColumn();
                            $stmtStock->execute([$iid]);
                            $stock = $stmtStock->fetchColumn() ?: 0;
                            $nuevoEst = ($stock >= $cant) ? 'PENDIENTE' : 'REQUIERE_COMPRA';
                            $stmtUpdate->execute([':cant' => $cant, ':st' => $nuevoEst, ':id_linea' => $idLinea]);
                        }
                    } else {
                        $iid = $item['insumo_id'] ?? $item['id'];
                        $stmtStock->execute([$iid]);
                        $stock = $stmtStock->fetchColumn() ?: 0;
                        $est = ($stock >= $cant) ? 'PENDIENTE' : 'REQUIERE_COMPRA';
                        $stmtInsert->execute([':sid' => $id, ':iid' => $iid, ':cant' => $cant, ':estado' => $est]);
                    }
                }
            }

            if (!$inTransaction)
                $this->db->commit();
            return true;
        } catch (Exception $e) {
            if (!$inTransaction)
                $this->db->rollBack();
            throw $e;
        }
    }

    public function finalizarTareaTecnico($otId, $usuarioId, $notas = '')
    {
        $sql = "UPDATE ot_asignaciones SET completado = 1, fecha_completado = NOW(), notas_cierre = :notas WHERE solicitud_id = :otId AND usuario_id = :uid";
        $this->db->prepare($sql)->execute([':notas' => $notas, ':otId' => $otId, ':uid' => $usuarioId]);

        $pendientes = $this->db->query("SELECT COUNT(*) FROM ot_asignaciones WHERE solicitud_id = $otId AND completado = 0")->fetchColumn();

        if ($pendientes == 0) {
            $this->db->prepare("UPDATE solicitudes_ot SET estado_id = (SELECT id FROM estados_solicitud WHERE nombre = 'Completada'), fecha_cierre = NOW() WHERE id = :id")->execute([':id' => $otId]);
            return ['status' => 'closed', 'message' => 'OT Cerrada Completamente.'];
        } else {
            $this->db->prepare("UPDATE solicitudes_ot SET estado_id = (SELECT id FROM estados_solicitud WHERE nombre = 'En Proceso') WHERE id = :id")->execute([':id' => $otId]);
            return ['status' => 'partial', 'message' => 'Tarea registrada. OT sigue abierta.'];
        }
    }

    public function finalizar($id)
    {
        $inTransaction = $this->db->inTransaction();
        try {
            if (!$inTransaction)
                $this->db->beginTransaction();
            $this->db->prepare("UPDATE solicitudes_ot SET estado_id = 5 WHERE id = :id")->execute([':id' => $id]);
            $this->db->prepare("UPDATE insumos i JOIN detalle_solicitud ds ON i.id = ds.insumo_id SET i.stock_actual = i.stock_actual + (ds.cantidad - ds.cantidad_entregada) WHERE ds.solicitud_id = :id AND ds.estado_linea = 'RESERVADO'")->execute([':id' => $id]);
            $this->db->prepare("UPDATE detalle_solicitud SET estado_linea = 'CANCELADO' WHERE solicitud_id = :id AND estado_linea NOT IN ('ENTREGADO', 'FINALIZADO')")->execute([':id' => $id]);
            if (!$inTransaction)
                $this->db->commit();
        } catch (Exception $e) {
            if (!$inTransaction)
                $this->db->rollBack();
            throw $e;
        }
    }

    public function delete($id)
    {
        $inTransaction = $this->db->inTransaction();
        try {
            if (!$inTransaction)
                $this->db->beginTransaction();
            $this->db->prepare("UPDATE solicitudes_ot SET estado_id = 6 WHERE id = :id")->execute([':id' => $id]);
            $this->db->prepare("UPDATE detalle_solicitud SET estado_linea = 'ANULADO' WHERE solicitud_id = :id")->execute([':id' => $id]);
            if (!$inTransaction)
                $this->db->commit();
        } catch (Exception $e) {
            if (!$inTransaction)
                $this->db->rollBack();
            throw $e;
        }
    }

    public function getEntregasOT($otId)
    {
        $sql = "SELECT m.fecha, m.cantidad, i.nombre, i.codigo_sku, e.nombre_completo as receptor FROM movimientos_inventario m JOIN insumos i ON m.insumo_id = i.id LEFT JOIN empleados e ON m.empleado_id = e.id WHERE m.referencia_id IN (SELECT id FROM detalle_solicitud WHERE solicitud_id = :id) AND m.tipo_movimiento_id = 2 ORDER BY m.fecha DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $otId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPendientesEntrega()
    {
        $sql = "SELECT ds.id as detalle_id, ds.cantidad, ds.cantidad_entregada, (ds.cantidad - ds.cantidad_entregada) as cantidad_pendiente, 
                s.fecha_solicitud, i.id as insumo_id, i.nombre as insumo, i.codigo_sku, i.unidad_medida, i.stock_actual, 
                s.id as ot_id, u.nombre as solicitante, u.apellido as solicitante_apellido, 
                
                COALESCE(a.nombre, CONCAT('SERVICIO / ', COALESCE(s.area_negocio, 'General'))) as maquina,

                (SELECT CONCAT(IFNULL(sec.nombre, 'General'), ' - ', ubi.nombre) FROM insumo_stock_ubicacion isu JOIN ubicaciones ubi ON isu.ubicacion_id = ubi.id LEFT JOIN sectores sec ON ubi.sector_id = sec.id WHERE isu.insumo_id = i.id AND isu.cantidad > 0 ORDER BY isu.cantidad DESC LIMIT 1) as ubicacion
                FROM detalle_solicitud ds JOIN solicitudes_ot s ON ds.solicitud_id = s.id JOIN insumos i ON ds.insumo_id = i.id JOIN usuarios u ON s.usuario_solicitante_id = u.id LEFT JOIN activos a ON s.activo_id = a.id 
                WHERE ds.estado_linea IN ('PENDIENTE', 'EN_BODEGA', 'RESERVADO', 'PARCIAL') AND (ds.cantidad - ds.cantidad_entregada) > 0.001 AND s.estado_id IN (1, 2, 4) ORDER BY s.fecha_solicitud ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function entregarMaterial($detalleId, $usuarioId, $cantidadEntregar, $receptorId)
    {
        $inTransaction = $this->db->inTransaction();
        try {
            if (!$inTransaction)
                $this->db->beginTransaction();

            $stmt = $this->db->prepare("SELECT * FROM detalle_solicitud WHERE id = :id FOR UPDATE");
            $stmt->execute([':id' => $detalleId]);
            $linea = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$linea)
                throw new Exception("Línea no encontrada");

            $pendiente = floatval($linea['cantidad']) - floatval($linea['cantidad_entregada']);
            if ($cantidadEntregar > ($pendiente + 0.001))
                throw new Exception("Exceso de entrega.");

            $stmtStock = $this->db->prepare("SELECT ubicacion_id, cantidad FROM insumo_stock_ubicacion WHERE insumo_id = :id AND cantidad > 0 ORDER BY cantidad DESC");
            $stmtStock->execute([':id' => $linea['insumo_id']]);
            $ubicaciones = $stmtStock->fetchAll(PDO::FETCH_ASSOC);

            $cantidadRestante = $cantidadEntregar;
            if (empty($ubicaciones))
                throw new Exception("No hay stock físico disponible.");

            foreach ($ubicaciones as $ubi) {
                if ($cantidadRestante <= 0)
                    break;
                $descuento = min($cantidadRestante, $ubi['cantidad']);
                $this->db->prepare("UPDATE insumo_stock_ubicacion SET cantidad = cantidad - :c WHERE insumo_id = :i AND ubicacion_id = :u")->execute([':c' => $descuento, ':i' => $linea['insumo_id'], ':u' => $ubi['ubicacion_id']]);
                $this->db->prepare("INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, referencia_id, empleado_id, ubicacion_id, fecha) VALUES (:iid, 2, :cant, :uid, 'Entrega OT', :ref, :emp, :ubi, NOW())")->execute([':iid' => $linea['insumo_id'], ':cant' => $descuento, ':uid' => $usuarioId, ':ref' => $detalleId, ':emp' => $receptorId, ':ubi' => $ubi['ubicacion_id']]);
                $cantidadRestante -= $descuento;
            }

            if ($cantidadRestante > 0)
                throw new Exception("Stock insuficiente.");

            $nuevaEntregada = floatval($linea['cantidad_entregada']) + $cantidadEntregar;
            $nuevoEstado = ($nuevaEntregada >= floatval($linea['cantidad'])) ? 'ENTREGADO' : 'PARCIAL';
            $this->db->prepare("UPDATE detalle_solicitud SET cantidad_entregada = :cant, estado_linea = :st WHERE id = :id")->execute([':cant' => $nuevaEntregada, ':st' => $nuevoEstado, ':id' => $detalleId]);
            $this->db->prepare("UPDATE solicitudes_ot SET estado_id = 2 WHERE id = :id AND estado_id = 1")->execute([':id' => $linea['solicitud_id']]);

            if (!$inTransaction)
                $this->db->commit();
            return true;
        } catch (Exception $e) {
            if (!$inTransaction)
                $this->db->rollBack();
            throw $e;
        }
    }

    public function devolverMaterial($detalleId, $cantidadDevolver, $bodegueroId, $ubicacionDestinoId = 1)
    {
        $stmt = $this->db->prepare("SELECT * FROM detalle_solicitud WHERE id = :id");
        $stmt->execute([':id' => $detalleId]);
        $linea = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$linea)
            throw new Exception("Línea no encontrada");

        if ($cantidadDevolver > $linea['cantidad_entregada'])
            throw new Exception("No puedes devolver más de lo entregado.");

        $nuevaEntregada = floatval($linea['cantidad_entregada']) - floatval($cantidadDevolver);
        $nuevoEstado = ($nuevaEntregada <= 0) ? 'PENDIENTE' : (($nuevaEntregada < floatval($linea['cantidad'])) ? 'PENDIENTE' : 'ENTREGADO');

        $this->db->prepare("UPDATE detalle_solicitud SET cantidad_entregada = :cant, estado_linea = :st WHERE id = :id")->execute([':cant' => $nuevaEntregada, ':st' => $nuevoEstado, ':id' => $detalleId]);
        $this->db->prepare("UPDATE solicitudes_ot SET estado_id = 1 WHERE id = :id AND estado_id = 2")->execute([':id' => $linea['solicitud_id']]);

        $this->db->prepare("INSERT INTO insumo_stock_ubicacion (insumo_id, ubicacion_id, cantidad) VALUES (:iid, :uid, :cant) ON DUPLICATE KEY UPDATE cantidad = cantidad + :cant_upd")->execute([':iid' => $linea['insumo_id'], ':uid' => $ubicacionDestinoId, ':cant' => $cantidadDevolver, ':cant_upd' => $cantidadDevolver]);
        $this->db->prepare("INSERT INTO movimientos_inventario (insumo_id, tipo_movimiento_id, cantidad, usuario_id, observacion, referencia_id, ubicacion_id, fecha) VALUES (:iid, 1, :cant, :uid, 'Devolución de OT', :ref, :ubi, NOW())")->execute([':iid' => $linea['insumo_id'], ':cant' => $cantidadDevolver, ':uid' => $bodegueroId, ':ref' => $detalleId, ':ubi' => $ubicacionDestinoId]);

        return $linea['insumo_id'];
    }

    public function savePlantillaActivo($id, $jsonStr)
    {
        $this->db->prepare("UPDATE activos SET plantilla_json = :json WHERE id = :id")->execute([':json' => $jsonStr, ':id' => $id]);
    }

    private function resolveCentroCostoId($input)
    {
        if (empty($input))
            return null;
        $stmt = $this->db->prepare("SELECT id FROM centros_costo WHERE id=:val");
        $stmt->execute([':val' => $input]);
        if ($stmt->fetch())
            return $input;
        $stmt = $this->db->prepare("SELECT id FROM centros_costo WHERE codigo=:val");
        $stmt->execute([':val' => $input]);
        return $stmt->fetchColumn() ?: null;
    }
    public function getCentrosCosto()
    {
        return $this->db->query("SELECT * FROM centros_costo ORDER BY codigo ASC")->fetchAll(PDO::FETCH_ASSOC);
    }
    public function getSolicitudById($id)
    {
        $sql = "SELECT s.*, 
                    u.email as solicitante_email, u.nombre as solicitante_nombre,
                    a.nombre as activo_nombre, a.codigo_interno
                FROM solicitudes_ot s
                LEFT JOIN usuarios u ON s.usuario_solicitante_id = u.id
                LEFT JOIN activos a ON s.activo_id = a.id
                WHERE s.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getTiposPermiso()
    {
        $sql = "SELECT * FROM tipos_permiso_trabajo WHERE activo = 1 ORDER BY nombre ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
}