<?php
namespace App\Services;

use App\Repositories\MantencionRepository;
use App\Repositories\CronogramaRepository;
use Exception;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

class MantencionService
{
    private $repo;
    private $cronogramaRepo;

    private $uploadBaseDir;
    private $publicUrlBase;

    public function __construct()
    {
        $this->repo = new MantencionRepository();
        $this->cronogramaRepo = new CronogramaRepository();
        $this->uploadBaseDir = __DIR__ . '/../../../../public_html/uploads/activos/';
        $this->publicUrlBase = '/uploads/activos/';
    }

    // =================================================================================
    // 1. GESTIÓN DE OTs
    // =================================================================================

    public function getRepo(): \App\Repositories\MantencionRepository
    {
        return $this->repo;
    }

    public function listarSolicitudes()
    {
        return $this->repo->getAll($_GET);
    }

    public function listarTiposPermiso()
    {
        return $this->repo->getTiposPermiso();
    }

    public function listarTiposTrabajo()
    {
        return $this->repo->getTiposTrabajo();
    }

    public function asignarOT($otId, array $asignados, $ubicacion = null)
    {
        $this->repo->syncAsignaciones($otId, $asignados);
        if ($ubicacion !== null) {
            $this->repo->getDb()->prepare(
                "UPDATE solicitudes_ot SET ubicacion = :ub WHERE id = :id"
            )->execute([':ub' => $ubicacion, ':id' => $otId]);
        }
    }

    public function obtenerDetalleOT($id, $userId = 0)
    {
        $header = $this->repo->getOTHeader($id);
        if (!$header)
            return null;

        $items = $this->repo->getDetallesOT($id, $userId);
        $asignaciones = $this->repo->getAsignadosOT($id);

        return array_merge($header, [
            'items' => $items,
            'asignaciones' => $asignaciones
        ]);
    }

    public function crearOT($data, $usuarioId)
    {
        if (empty($data['items']) && empty($data['activo_id'])) {
            throw new Exception("Debe seleccionar un activo o agregar insumos manuales.");
        }
        if (!empty($data['requiere_permiso']) && empty($data['tipo_permiso_id'])) {
            throw new Exception("Ha indicado que requiere permiso de trabajo, por favor seleccione el tipo de permiso.");
        }
        $otId = $this->repo->createOT($data);

        if (!empty($data['requiere_permiso']) && !empty($data['tipo_permiso_id'])) {
            $this->notificarPrevencion($otId, $data, true);
        }

        $this->notificarCambioOT($otId, 'creacion');

        return $otId;
    }

    public function editarOT($id, $data)
    {
        if (!empty($data['requiere_permiso']) && empty($data['tipo_permiso_id'])) {
            throw new Exception("Ha indicado que requiere permiso de trabajo, por favor seleccione el tipo de permiso.");
        }

        $estadoPrevio = $this->repo->getRequierePermisoActual($id);

        $resultado = $this->repo->updateOT($id, $data);
        if ($this->cronogramaRepo) {
            $this->cronogramaRepo->syncByOT($id, $data);
        }

        $reqNuevo = !empty($data['requiere_permiso']) ? 1 : 0;
        $tipoNuevo = !empty($data['tipo_permiso_id']) ? (int)$data['tipo_permiso_id'] : null;
        $reqPrevio = (int)($estadoPrevio['requiere_permiso'] ?? 0);
        $tipoPrevio = !empty($estadoPrevio['tipo_permiso_id']) ? (int)$estadoPrevio['tipo_permiso_id'] : null;

        $debeNotificar = $reqNuevo === 1 && ($reqPrevio === 0 || $tipoPrevio !== $tipoNuevo);
        if ($debeNotificar) {
            $this->notificarPrevencion($id, $data, $reqPrevio === 0);
        }

        return $resultado;
    }

    private function sendMail(string $to, string $subject, string $body, array $cc = [], bool $highPriority = false): void
    {
        $host = $_ENV['MAIL_SMTP_HOST'] ?? '';
        $user = $_ENV['MAIL_SMTP_USER'] ?? '';
        $pass = $_ENV['MAIL_SMTP_PASS'] ?? '';
        $port = (int)($_ENV['MAIL_SMTP_PORT'] ?? 465);
        $secure = strtolower($_ENV['MAIL_SMTP_SECURE'] ?? 'ssl');
        $from = $_ENV['MAIL_FROM'] ?? 'no-reply@insuban.cl';
        $appName = $_ENV['APP_NAME'] ?? 'InsuOrders';

        if (!$host || !$user || !$pass) {
            error_log("[Mail] SMTP no configurado. Correo no enviado a $to.");
            return;
        }

        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = $host;
        $mail->SMTPAuth   = true;
        $mail->Username   = $user;
        $mail->Password   = $pass;
        $mail->SMTPSecure = $secure === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = $port;
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom($from, $appName);
        $mail->addAddress($to);
        foreach ($cc as $ccAddr) {
            $mail->addCC($ccAddr);
        }

        if ($highPriority) {
            $mail->Priority = 1;
            $mail->addCustomHeader('X-MSMail-Priority', 'High');
            $mail->addCustomHeader('Importance', 'High');
        }

        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->isHTML(false);
        $mail->send();
    }

    public function notificarCambioOT(int $otId, string $evento)
    {
        try {
            $solicitante = $this->repo->getSolicitanteEmail($otId);
            if (empty($solicitante['email'])) return;

            $header = $this->repo->getOTHeader($otId);
            if (!$header) return;

            $appName  = $_ENV['APP_NAME'] ?? 'InsuOrders';
            $ccRaw    = $_ENV['OT_NOTIF_CC'] ?? 'mantenimiento@insuban.cl,ncerdan@insuban.cl,furdaneta@insuban.cl,jmanquel@insuban.cl,ctapia@insuban.cl';
            $ccEmails = array_filter(array_map('trim', explode(',', $ccRaw)));

            $titulo   = $header['titulo'] ?? ('OT #' . $otId);
            $activo   = $header['activo'] ?? 'General';
            $ubicacion = $header['ubicacion'] ?? '';
            $prioridad = $header['prioridad'] ?? 'MEDIA';
            $estado   = $header['estado'] ?? '-';
            $nombreSolicitante = trim(($solicitante['nombre'] ?? '') . ' ' . ($solicitante['apellido'] ?? '')) ?: 'Solicitante';

            $eventos = [
                'creacion'     => ['asunto' => "[$appName] OT #$otId Creada - $titulo",           'accion' => 'creada'],
                'avance'       => ['asunto' => "[$appName] OT #$otId - Avance Registrado",        'accion' => 'avanzada con nuevo progreso'],
                'finalizacion' => ['asunto' => "[$appName] OT #$otId COMPLETADA - $titulo",       'accion' => 'cerrada y completada'],
            ];
            $info   = $eventos[$evento] ?? ['asunto' => "[$appName] OT #$otId - Actualización", 'accion' => 'actualizada'];
            $subject = $info['asunto'];
            $accion  = $info['accion'];

            $message  = "Estimado/a $nombreSolicitante,\n\n";
            $message .= "Le informamos que la OT #$otId ha sido $accion.\n\n";
            $message .= "FOLIO OT:  #$otId\n";
            $message .= "TÍTULO:    $titulo\n";
            $message .= "ACTIVO:    $activo\n";
            if ($ubicacion) $message .= "UBICACIÓN: $ubicacion\n";
            $message .= "PRIORIDAD: $prioridad\n";
            $message .= "ESTADO:    $estado\n";
            $message .= "\nSistema $appName.";

            $subjectSafe = str_replace(["\r", "\n"], ' ', $subject);
            $this->sendMail($solicitante['email'], $subjectSafe, $message, $ccEmails);
        } catch (\Throwable $e) {
            error_log("notificarCambioOT [$evento] OT#$otId: " . $e->getMessage());
        }
    }

    private function notificarPrevencion($otId, $data, $esCreacion = true)
    {
        try {
            $destinatarios = $this->repo->getEmailsPrevencion();
            if (empty($destinatarios)) return;

            $header = $this->repo->getOTHeader($otId);
            if (!$header) return;

            $tipoNombre = $this->repo->getTipoPermisoNombre($data['tipo_permiso_id'] ?? null) ?? 'No especificado';
            $solicitanteNombre = trim(($header['solicitante_nombre'] ?? '') . ' ' . ($header['solicitante_apellido'] ?? '')) ?: 'No identificado';
            $maquina = $header['activo'] ?? 'General';
            $ubicacion = $header['ubicacion'] ?? 'No especificada';
            $prioridad = $header['prioridad'] ?? 'MEDIA';
            $titulo = $header['titulo'] ?? ('OT #' . $otId);
            $descripcionPermiso = $data['descripcion_permiso'] ?? '';
            $descripcionTrabajo = $header['descripcion_trabajo'] ?? '';

            $accion = $esCreacion ? 'NUEVA' : 'ACTUALIZADA';
            $appName = $_ENV['APP_NAME'] ?? 'InsuOrders';

            $subject = "[$appName] Permiso de Trabajo Requerido - OT #$otId ($tipoNombre)";

            $message  = "ATENCIÓN PREVENCIÓN DE RIESGOS\n\n";
            $message .= "Se ha registrado una OT que requiere PERMISO DE TRABAJO SEGURO.\n";
            $message .= "Acción: $accion\n\n";
            $message .= "FOLIO OT: #$otId\n";
            $message .= "TÍTULO: $titulo\n";
            $message .= "TIPO DE PERMISO: $tipoNombre\n";
            $message .= "PRIORIDAD: $prioridad\n";
            $message .= "MÁQUINA / ACTIVO: $maquina\n";
            $message .= "UBICACIÓN: $ubicacion\n";
            $message .= "SOLICITANTE: $solicitanteNombre\n\n";
            $message .= "DESCRIPCIÓN DEL TRABAJO:\n" . ($descripcionTrabajo ?: 'Sin descripción') . "\n\n";
            if (!empty($descripcionPermiso)) {
                $message .= "DETALLE DEL PERMISO:\n" . $descripcionPermiso . "\n\n";
            }
            $message .= "Por favor coordinar la elaboración y respaldo del permiso correspondiente.\n";
            $message .= "Sistema $appName.";

            $subjectSafe = str_replace(["\r", "\n"], ' ', $subject);
            foreach ($destinatarios as $to) {
                $this->sendMail($to, $subjectSafe, $message, [], true);
            }
        } catch (\Throwable $e) {
            error_log("notificarPrevencion error: " . $e->getMessage());
        }
    }

    public function finalizarTarea($otId, $usuarioId, $notas = '', $force = false)
    {
        if ($force) {
            $this->repo->finalizar($otId);
            $this->notificarCambioOT($otId, 'finalizacion');
            return ['status' => 'closed', 'message' => 'OT Cerrada Completamente.'];
        }
        return $this->repo->finalizarTareaTecnico($otId, $usuarioId, $notas);
    }

    public function anularOT($id)
    {
        $entregas = $this->repo->getEntregasOT($id);
        if (!empty($entregas)) {
            throw new \Exception('No se puede anular: la OT tiene materiales entregados.');
        }
        $this->repo->delete($id);
    }

    public function reabrirOT($id)
    {
        $this->repo->reabrirOT($id);
    }

    // =================================================================================
    // 2. GESTIÓN DE ACTIVOS
    // =================================================================================

    public function listarActivos()
    {
        return $this->repo->getActivos();
    }

    public function listarCentrosCosto()
    {
        return $this->repo->getCentrosCosto();
    }

    public function crearActivo($data, $files)
    {
        if (!empty($files['imagen_principal']) && $files['imagen_principal']['error'] === UPLOAD_ERR_OK) {
            $data['imagen_url'] = $this->subirArchivo($files['imagen_principal']);
        }

        $data['galeria'] = $this->procesarGaleriaUpload($files, $data);

        return $this->repo->createActivo($data);
    }

    public function editarActivo($data, $files)
    {
        if (empty($data['id'])) {
            throw new Exception("ID de activo no proporcionado.");
        }

        if (!empty($files['imagen_principal']) && $files['imagen_principal']['error'] === UPLOAD_ERR_OK) {
            $data['imagen_url'] = $this->subirArchivo($files['imagen_principal']);
        }

        $nuevasImagenes = $this->procesarGaleriaUpload($files, $data);
        $data['galeria'] = $nuevasImagenes;

        return $this->repo->updateActivo($data);
    }

    public function eliminarActivo($id)
    {
        $tieneHistorial = $this->repo->contarOrdenesAsociadas($id);
        if ($tieneHistorial > 0) {
            throw new Exception("No se puede eliminar: El activo tiene $tieneHistorial Órdenes de Trabajo asociadas.");
        }

        $archivosParaBorrar = $this->repo->obtenerRutasArchivosActivo($id);

        $eliminado = $this->repo->eliminarActivoCompleto($id);

        if (!$eliminado) {
            throw new Exception("El activo no pudo ser eliminado o ya no existe.");
        }

        foreach ($archivosParaBorrar as $ruta) {
            $this->borrarArchivoFisico($ruta);
        }

        return true;
    }

    // =================================================================================
    // 3. GESTIÓN DE GALERÍA E IMÁGENES
    // =================================================================================

    public function obtenerGaleria($id)
    {
        return $this->repo->getGaleriaActivo($id);
    }

    public function eliminarImagenGaleria($imagenId)
    {
        $url = $this->repo->obtenerUrlImagenGaleria($imagenId);

        if ($url) {
            $this->repo->eliminarImagenGaleriaBD($imagenId);
            $this->borrarArchivoFisico($url);
        } else {
            throw new Exception("La imagen no existe o ya fue eliminada.");
        }
    }

    private function procesarGaleriaUpload($files, $postData)
    {
        $galeria = [];
        if (!empty($files['galeria_files']) && is_array($files['galeria_files']['name'])) {
            foreach ($files['galeria_files']['name'] as $key => $name) {
                if ($files['galeria_files']['error'][$key] === UPLOAD_ERR_OK) {
                    $fileArray = [
                        'name' => $files['galeria_files']['name'][$key],
                        'type' => $files['galeria_files']['type'][$key],
                        'tmp_name' => $files['galeria_files']['tmp_name'][$key],
                        'error' => $files['galeria_files']['error'][$key],
                        'size' => $files['galeria_files']['size'][$key],
                    ];

                    $url = $this->subirArchivo($fileArray, 'galeria');
                    if ($url) {
                        $tipo = $postData['galeria_tipos'][$key] ?? 'General';
                        $galeria[] = ['url' => $url, 'tipo' => $tipo];
                    }
                }
            }
        }
        return $galeria;
    }

    // =================================================================================
    // 4. GESTIÓN DE DOCUMENTOS
    // =================================================================================

    public function listarDocumentos($activoId)
    {
        return $this->repo->getDocs($activoId);
    }

    public function subirDocumento($activoId, $file)
    {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("Error en la subida del archivo: Código " . $file['error']);
        }

        $allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'gif', 'webp'];
        $allowedMimes = [
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/png', 'image/jpeg', 'image/gif', 'image/webp',
        ];

        $nombreOriginal = $file['name'];
        $ext = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));

        if (!in_array($ext, $allowedExtensions, true)) {
            throw new Exception("Tipo de archivo no permitido.");
        }

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);
        if (!in_array($mime, $allowedMimes, true)) {
            throw new Exception("Tipo de archivo no permitido.");
        }

        $nuevoNombre = "DOC_{$activoId}_" . uniqid() . "." . $ext;

        $targetDir = $this->uploadBaseDir;
        if (!file_exists($targetDir))
            mkdir($targetDir, 0777, true);
        $targetPath = $targetDir . $nuevoNombre;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $url = $this->publicUrlBase . $nuevoNombre;
            $this->repo->addDoc($activoId, $nombreOriginal, $url);
            return $url;
        } else {
            throw new Exception("No se pudo mover el archivo al directorio de destino.");
        }
    }

    public function eliminarDocumento($docId)
    {
        $url = $this->repo->obtenerUrlDoc($docId);
        if ($url) {
            $this->repo->deleteDoc($docId);
            $this->borrarArchivoFisico($url);
        } else {
            throw new Exception("Documento no encontrado.");
        }
    }

    // =================================================================================
    // 5. GESTIÓN DE KITS
    // =================================================================================

    public function obtenerKitActivo($activoId)
    {
        return $this->repo->getKitActivo($activoId);
    }

    public function agregarItemKit($data)
    {
        if (empty($data['activo_id']) || empty($data['insumo_id']) || empty($data['cantidad'])) {
            throw new Exception("Datos incompletos para el kit.");
        }
        $this->repo->addInsumoToKit($data['activo_id'], $data['insumo_id'], $data['cantidad']);
    }

    public function actualizarCantidadKit($data)
    {
        $this->repo->updateKitQuantity($data['activo_id'], $data['insumo_id'], $data['cantidad']);
    }

    public function removerItemKit($activoId, $insumoId)
    {
        $this->repo->removeInsumoFromKit($activoId, $insumoId);
    }

    // =================================================================================
    // 6. DATOS ADICIONALES Y CIERRE
    // =================================================================================

    public function obtenerHeaderOT($id)
    {
        return $this->repo->getOTHeader($id);
    }
    public function obtenerEntregasOT($id)
    {
        return $this->repo->getEntregasOT($id);
    }
    public function obtenerDetallesOT($id)
    {
        return $this->repo->getDetallesOT($id);
    }

    public function guardarPlantilla($activoId, $plantillaData)
    {
        if (empty($activoId))
            throw new Exception("El ID del activo es obligatorio.");
        if (empty($plantillaData))
            throw new Exception("La plantilla no puede estar vacía.");

        $jsonStr = is_array($plantillaData) ? json_encode($plantillaData, JSON_UNESCAPED_UNICODE) : $plantillaData;
        $this->repo->savePlantillaActivo($activoId, $jsonStr);
    }

    public function listarPendientesEntrega()
    {
        return $this->repo->getPendientesEntrega();
    }

    public function realizarEntregaMaterial($detalleId, $usuarioId, $cantidad, $receptorId)
    {
        if ($cantidad <= 0) {
            throw new Exception("La cantidad a entregar debe ser mayor a 0.");
        }
        return $this->repo->entregarMaterial($detalleId, $usuarioId, $cantidad, $receptorId);
    }

    public function realizarDevolucionMaterial($detalleId, $cantidad, $bodegueroId)
    {
        if ($cantidad <= 0) {
            throw new Exception("La cantidad a devolver debe ser mayor a 0.");
        }
        return $this->repo->devolverMaterial($detalleId, $cantidad, $bodegueroId);
    }

    public function cierreAdministrativoOT($id)
    {
        $this->repo->finalizar($id);
    }

    // =================================================================================
    // HELPERS
    // =================================================================================

    private function subirArchivo($file, $subFolder = '')
    {
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv', 'pdf'];
        $allowedMimes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
            'application/pdf',
        ];

        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $allowedExtensions, true)) {
            throw new \Exception("Tipo de archivo no permitido.");
        }

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);
        if (!in_array($mime, $allowedMimes, true)) {
            throw new \Exception("Tipo de archivo no permitido.");
        }

        $targetDir = $this->uploadBaseDir . $subFolder;
        if (!file_exists($targetDir))
            mkdir($targetDir, 0777, true);

        $filename = uniqid('ACT_') . '.' . $extension;

        $pathRel = $subFolder ? $subFolder . '/' . $filename : $filename;
        $targetPath = $this->uploadBaseDir . $pathRel;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return $this->publicUrlBase . $pathRel;
        }
        return null;
    }

    private function borrarArchivoFisico($webUrl)
    {
        if (empty($webUrl))
            return;

        $relativePath = str_replace($this->publicUrlBase, '', $webUrl);
        $fullPath = $this->uploadBaseDir . $relativePath;
        $fullPath = str_replace(['//', '\\'], '/', $fullPath);

        if (file_exists($fullPath) && is_file($fullPath)) {
            @unlink($fullPath);
        }
    }
}