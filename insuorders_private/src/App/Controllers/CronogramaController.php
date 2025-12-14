<?php
namespace App\Controllers;

use App\Database\Database;
use App\Services\MantencionService;

class CronogramaController
{
    private $db;
    private $mantencionService;

    public function __construct()
    {
        $this->db = Database::getConnection();
        $this->mantencionService = new MantencionService();
    }

    public function index()
    {
        // MODIFICADO: Agregamos c.solicitud_ot_id a la consulta
        $sql = "SELECT c.*, a.nombre as activo_nombre, a.codigo_interno 
                FROM cronograma_mantencion c 
                JOIN activos a ON c.activo_id = a.id 
                -- Quitamos el WHERE c.estado = 'PENDIENTE' para ver también las procesadas en el calendario
                ORDER BY c.fecha_programada ASC";
        $data = $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $data]);
    }

    public function show()
    {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false]);
            return;
        }

        $stmt = $this->db->prepare("SELECT * FROM cronograma_mantencion WHERE id = ?");
        $stmt->execute([$id]);
        $evento = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$evento) {
            http_response_code(404);
            echo json_encode(["success" => false]);
            return;
        }

        $stmtItems = $this->db->prepare("SELECT ci.insumo_id as id, i.nombre, i.codigo_sku, ci.cantidad FROM cronograma_insumos ci JOIN insumos i ON ci.insumo_id = i.id WHERE ci.cronograma_id = ?");
        $stmtItems->execute([$id]);
        $evento['items'] = $stmtItems->fetchAll(\PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "data" => $evento]);
    }

    public function store()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['activo_id']) || empty($data['fecha_programada'])) {
            http_response_code(400);
            echo json_encode(["success" => false]);
            return;
        }

        try {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("INSERT INTO cronograma_mantencion (activo_id, titulo, descripcion, fecha_programada, icono, color) VALUES (:aid, :tit, :desc, :fecha, :ico, :col)");
            $stmt->execute([
                ':aid' => $data['activo_id'],
                ':tit' => $data['titulo'] ?? 'Mantención',
                ':desc' => $data['descripcion'] ?? '',
                ':fecha' => $data['fecha_programada'],
                ':ico' => $data['icono'] ?? 'bi-tools',
                ':col' => $data['color'] ?? '#0d6efd'
            ]);
            $id = $this->db->lastInsertId();

            if (!empty($data['items'])) {
                $stmtI = $this->db->prepare("INSERT INTO cronograma_insumos (cronograma_id, insumo_id, cantidad) VALUES (?, ?, ?)");
                foreach ($data['items'] as $it)
                    $stmtI->execute([$id, $it['id'], $it['cantidad']]);
            }
            $this->db->commit();
            echo json_encode(["success" => true]);
        } catch (\Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    public function update()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            return;
        }

        try {
            $this->db->beginTransaction();
            $sql = "UPDATE cronograma_mantencion SET activo_id=:aid, titulo=:tit, descripcion=:desc, fecha_programada=:fecha, icono=:ico, color=:col WHERE id=:id";
            $this->db->prepare($sql)->execute([
                ':aid' => $data['activo_id'],
                ':tit' => $data['titulo'],
                ':desc' => $data['descripcion'] ?? '',
                ':fecha' => $data['fecha_programada'],
                ':ico' => $data['icono'],
                ':col' => $data['color'],
                ':id' => $id
            ]);

            $this->db->prepare("DELETE FROM cronograma_insumos WHERE cronograma_id = ?")->execute([$id]);
            if (!empty($data['items'])) {
                $stmtI = $this->db->prepare("INSERT INTO cronograma_insumos (cronograma_id, insumo_id, cantidad) VALUES (?, ?, ?)");
                foreach ($data['items'] as $it)
                    $stmtI->execute([$id, $it['id'], $it['cantidad']]);
            }
            $this->db->commit();
            echo json_encode(["success" => true]);
        } catch (\Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    public function delete()
    {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            return;
        }
        try {
            // Validar si ya tiene OT generada para avisar o bloquear (Opcional)
            // Aquí permitimos borrar, y el ON DELETE SET NULL en SQL dejará la OT huérfana pero existente (seguro)
            $this->db->prepare("DELETE FROM cronograma_mantencion WHERE id = ?")->execute([$id]);
            echo json_encode(["success" => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    public function verificarAlertas()
    {
        // 1. Buscamos pendientes próximos
        $pendientes = $this->db->query("SELECT * FROM cronograma_mantencion WHERE estado = 'PENDIENTE' AND fecha_programada BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)")->fetchAll(\PDO::FETCH_ASSOC);

        $generados = 0;

        foreach ($pendientes as $p) {
            try {
                // Obtener items (personalizados o kit)
                $stmtCustom = $this->db->prepare("SELECT insumo_id as id, cantidad FROM cronograma_insumos WHERE cronograma_id = ?");
                $stmtCustom->execute([$p['id']]);
                $items = $stmtCustom->fetchAll(\PDO::FETCH_ASSOC);

                if (empty($items)) {
                    $stmtKit = $this->db->prepare("SELECT insumo_id as id, cantidad_default as cantidad FROM activos_insumos WHERE activo_id = ?");
                    $stmtKit->execute([$p['activo_id']]);
                    $items = $stmtKit->fetchAll(\PDO::FETCH_ASSOC);
                }

                if (!empty($items)) {
                    // Crear OT
                    $otId = $this->mantencionService->crearOT([
                        'activo_id' => $p['activo_id'],
                        'observacion' => "Automática desde Cronograma: " . $p['titulo'] . ". " . $p['descripcion'],
                        'origen_tipo' => 'Preventiva',
                        'items' => $items
                    ], 1); // ID 1 = Sistema

                    // Asignar fecha requerida
                    $this->db->prepare("UPDATE solicitudes_ot SET fecha_requerida = ? WHERE id = ?")->execute([$p['fecha_programada'], $otId]);

                    // MODIFICADO: Guardar el ID de la OT en el cronograma
                    $this->db->prepare("UPDATE cronograma_mantencion SET estado = 'PROCESADO', solicitud_ot_id = ? WHERE id = ?")
                        ->execute([$otId, $p['id']]);

                    $generados++;
                }
            } catch (\Exception $e) {
                // Loggear error y continuar
            }
        }
        echo json_encode(["success" => true, "generados" => $generados]);
    }
}