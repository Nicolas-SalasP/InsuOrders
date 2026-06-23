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
        $esServicio = ($data['origen_tipo'] ?? '') === 'Servicio';
        if (!$esServicio && empty($data['items']) && empty($data['activo_id'])) {
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

    private function sendMail(string $to, string $subject, string $htmlBody, array $cc = [], bool $highPriority = false, string $plainBody = ''): void
    {
        $host   = $_ENV['MAIL_SMTP_HOST'] ?? '';
        $user   = $_ENV['MAIL_SMTP_USER'] ?? '';
        $pass   = $_ENV['MAIL_SMTP_PASS'] ?? '';
        $port   = (int)($_ENV['MAIL_SMTP_PORT'] ?? 465);
        $secure = strtolower($_ENV['MAIL_SMTP_SECURE'] ?? 'ssl');
        $from   = $_ENV['MAIL_FROM'] ?? $user;
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
        $mail->isHTML(true);
        $mail->Body    = $htmlBody;
        $mail->AltBody = $plainBody ?: strip_tags(str_replace(['<br>', '<br/>', '<br />', '</tr>', '</p>'], "\n", $htmlBody));

        try {
            $mail->send();
        } catch (\Exception $e) {
            error_log("[Mail] Fallo envío a $to — {$e->getMessage()} (host=$host port=$port secure=$secure)");
            throw $e;
        }
    }

    private function emailWrap(string $headerColor, string $headerIcon, string $headerTitle, string $contentHtml, string $appName): string
    {
        return <<<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.10);">
      <!-- HEADER -->
      <tr><td style="background:{$headerColor};padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:0.5px;">{$headerIcon} {$headerTitle}</td>
            <td align="right" style="color:rgba(255,255,255,0.75);font-size:13px;font-weight:bold;letter-spacing:1px;white-space:nowrap;">{$appName}</td>
          </tr>
        </table>
      </td></tr>
      <!-- BODY -->
      <tr><td style="padding:32px;">
        {$contentHtml}
      </td></tr>
      <!-- FOOTER -->
      <tr><td style="background:#f8f9fa;padding:16px 32px;border-top:1px solid #e9ecef;text-align:center;color:#9ca3af;font-size:12px;">
        Este correo fue generado automáticamente por <strong>{$appName}</strong>. No responder a este mensaje.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
HTML;
    }

    private function prioridadBadge(string $prioridad): string
    {
        $map = [
            'CRITICA'  => ['#dc2626', '#fee2e2', '⚠ CRÍTICO'],
            'CRÍTICA'  => ['#dc2626', '#fee2e2', '⚠ CRÍTICO'],
            'URGENTE'  => ['#dc2626', '#fee2e2', '⚠ URGENTE'],
            'ALTA'     => ['#d97706', '#fef3c7', '↑ ALTA'],
            'MEDIA'    => ['#2563eb', '#dbeafe', '● MEDIA'],
            'BAJA'     => ['#6b7280', '#f3f4f6', '↓ BAJA'],
        ];
        $p = strtoupper(trim($prioridad));
        [$color, $bg, $label] = $map[$p] ?? ['#6b7280', '#f3f4f6', $prioridad];
        return "<span style=\"display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:bold;color:{$color};background:{$bg};\">{$label}</span>";
    }

    private function dataRow(string $label, string $value): string
    {
        $esc = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
        return <<<HTML
<tr>
  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;font-weight:bold;text-transform:uppercase;width:38%;vertical-align:top;">{$label}</td>
  <td style="padding:10px 0 10px 16px;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;vertical-align:top;">{$esc}</td>
</tr>
HTML;
    }

    public function notificarCambioOT(int $otId, string $evento)
    {
        try {
            $solicitante = $this->repo->getSolicitanteEmail($otId);
            if (empty($solicitante['email'])) return;

            $header = $this->repo->getOTHeader($otId);
            if (!$header) return;

            $appName  = $_ENV['APP_NAME'] ?? 'InsuOrders';
            $ccRaw    = $_ENV['OT_NOTIF_CC'] ?? '';
            $ccEmails = $ccRaw ? array_filter(array_map('trim', explode(',', $ccRaw))) : [];

            $titulo   = $header['titulo'] ?? ('OT #' . $otId);
            $activo   = $header['activo'] ?? 'General';
            $ubicacion = $header['ubicacion'] ?? '';
            $prioridad = $header['prioridad'] ?? 'MEDIA';
            $estado   = $header['estado'] ?? '-';
            $nombreSolicitante = trim(($solicitante['nombre'] ?? '') . ' ' . ($solicitante['apellido'] ?? '')) ?: 'Solicitante';

            $eventos = [
                'creacion'     => ['asunto' => "[$appName] OT #$otId Creada — $titulo",              'accion' => 'creada'],
                'avance'       => ['asunto' => "[$appName] OT #$otId — Técnico cerró su parte",      'accion' => 'parcialmente completada (un técnico cerró su parte, quedan asignaciones pendientes)'],
                'finalizacion' => ['asunto' => "[$appName] OT #$otId COMPLETADA — $titulo",          'accion' => 'cerrada y completada por todos los técnicos'],
                'anulacion'    => ['asunto' => "[$appName] OT #$otId ANULADA — $titulo",             'accion' => 'anulada'],
            ];
            $info   = $eventos[$evento] ?? ['asunto' => "[$appName] OT #$otId - Actualización", 'accion' => 'actualizada'];
            $subject = $info['asunto'];
            $accion  = $info['accion'];

            $badgePrioridad = $this->prioridadBadge($prioridad);
            $rows  = $this->dataRow('Folio OT', '#' . $otId);
            $rows .= $this->dataRow('Título', $titulo);
            $rows .= $this->dataRow('Activo', $activo);
            if ($ubicacion) $rows .= $this->dataRow('Ubicación', $ubicacion);
            $rows .= "<tr><td style=\"padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;font-weight:bold;text-transform:uppercase;width:38%;vertical-align:top;\">Prioridad</td><td style=\"padding:10px 0 10px 16px;border-bottom:1px solid #f3f4f6;vertical-align:top;\">$badgePrioridad</td></tr>";
            $rows .= $this->dataRow('Estado', $estado);

            $accionesMap = [
                'creacion'     => ['color' => '#1d4ed8', 'bg' => '#dbeafe', 'icon' => '🔧', 'label' => 'OT Creada'],
                'avance'       => ['color' => '#d97706', 'bg' => '#fef3c7', 'icon' => '🔨', 'label' => 'Técnico Cerró su Parte'],
                'finalizacion' => ['color' => '#16a34a', 'bg' => '#dcfce7', 'icon' => '✅', 'label' => 'OT Completada'],
                'anulacion'    => ['color' => '#6b7280', 'bg' => '#f3f4f6', 'icon' => '🚫', 'label' => 'OT Anulada'],
            ];
            $ev = $accionesMap[$evento] ?? ['color' => '#6b7280', 'bg' => '#f3f4f6', 'icon' => '🔔', 'label' => 'Actualización'];
            $nombreEsc = htmlspecialchars($nombreSolicitante, ENT_QUOTES, 'UTF-8');
            $accionEsc = htmlspecialchars($accion, ENT_QUOTES, 'UTF-8');

            $content = <<<HTML
<p style="margin:0 0 20px;color:#374151;font-size:15px;">Estimado/a <strong>{$nombreEsc}</strong>,</p>
<div style="background:{$ev['bg']};border-left:4px solid {$ev['color']};padding:14px 18px;border-radius:0 6px 6px 0;margin-bottom:24px;">
  <span style="color:{$ev['color']};font-size:15px;font-weight:bold;">{$ev['icon']} La OT #{$otId} ha sido {$accionEsc}.</span>
</div>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
  {$rows}
</table>
HTML;
            $headerColors = [
                'creacion'     => '#1d4ed8',
                'avance'       => '#d97706',
                'finalizacion' => '#16a34a',
                'anulacion'    => '#6b7280',
            ];
            $hColor = $headerColors[$evento] ?? '#1d4ed8';
            $html = $this->emailWrap($hColor, $ev['icon'], $ev['label'] . ' — OT #' . $otId, $content, $appName);

            $subjectSafe = str_replace(["\r", "\n"], ' ', $subject);
            $this->sendMail($solicitante['email'], $subjectSafe, $html, $ccEmails);
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

            $badgePrioridad = $this->prioridadBadge($prioridad);
            $accionEsc      = htmlspecialchars($accion, ENT_QUOTES, 'UTF-8');
            $tipoEsc        = htmlspecialchars($tipoNombre, ENT_QUOTES, 'UTF-8');
            $descripTrabajoEsc  = nl2br(htmlspecialchars($descripcionTrabajo ?: 'Sin descripción', ENT_QUOTES, 'UTF-8'));
            $descripPermisoEsc  = nl2br(htmlspecialchars($descripcionPermiso, ENT_QUOTES, 'UTF-8'));

            $rows  = $this->dataRow('Folio OT', '#' . $otId);
            $rows .= $this->dataRow('Título', $titulo);
            $rows .= $this->dataRow('Tipo de Permiso', $tipoNombre);
            $rows .= "<tr><td style=\"padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;font-weight:bold;text-transform:uppercase;width:38%;vertical-align:top;\">Prioridad</td><td style=\"padding:10px 0 10px 16px;border-bottom:1px solid #f3f4f6;vertical-align:top;\">$badgePrioridad</td></tr>";
            $rows .= $this->dataRow('Máquina / Activo', $maquina);
            $rows .= $this->dataRow('Ubicación', $ubicacion);
            $rows .= $this->dataRow('Solicitante', $solicitanteNombre);

            $descripcionBlock = <<<HTML
<div style="margin-top:20px;">
  <p style="margin:0 0 6px;color:#6b7280;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">Descripción del Trabajo</p>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:14px;color:#374151;font-size:14px;line-height:1.6;">{$descripTrabajoEsc}</div>
</div>
HTML;
            $permisoBlock = '';
            if (!empty($descripcionPermiso)) {
                $permisoBlock = <<<HTML
<div style="margin-top:16px;">
  <p style="margin:0 0 6px;color:#6b7280;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">Detalle del Permiso</p>
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;padding:14px;color:#374151;font-size:14px;line-height:1.6;">{$descripPermisoEsc}</div>
</div>
HTML;
            }

            $content = <<<HTML
<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px 18px;border-radius:0 6px 6px 0;margin-bottom:24px;">
  <p style="margin:0;color:#dc2626;font-size:15px;font-weight:bold;">⚠ Acción requerida — Permiso de Trabajo Seguro ({$accionEsc})</p>
  <p style="margin:6px 0 0;color:#7f1d1d;font-size:13px;">Se ha registrado una OT que requiere coordinación con Prevención de Riesgos.</p>
</div>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
  {$rows}
</table>
{$descripcionBlock}
{$permisoBlock}
<div style="margin-top:24px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:14px 18px;text-align:center;">
  <p style="margin:0;color:#991b1b;font-size:13px;font-weight:bold;">Por favor coordinar la elaboración y respaldo del permiso correspondiente antes de iniciar los trabajos.</p>
</div>
HTML;

            $subjectSafe = str_replace(["\r", "\n"], ' ', $subject);
            $html = $this->emailWrap('#dc2626', '⚠', "Permiso de Trabajo — OT #$otId", $content, $appName);
            foreach ($destinatarios as $to) {
                $this->sendMail($to, $subjectSafe, $html, [], true);
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
        $this->notificarCambioOT($id, 'anulacion');
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