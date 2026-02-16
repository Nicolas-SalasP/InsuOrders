<?php
namespace App\Services;

use App\Repositories\ClienteRepository;
use Exception;

class ClienteService
{
    private $repo;

    public function __construct()
    {
        $this->repo = new ClienteRepository();
    }

    public function listarMisSolicitudes($usuarioId)
    {
        $solicitudes = $this->repo->getMisSolicitudes($usuarioId);
        
        foreach ($solicitudes as &$solicitud) {
            $solicitud['tipo'] = $solicitud['activo_id'] ? 'OT (Orden de Trabajo)' : 'OS (Orden de Servicio)';
            $solicitud['activo_nombre'] = $solicitud['activo_nombre'] ?? 'N/A (General)';
            $solicitud['tecnico_asignado'] = $solicitud['tecnico_asignado'] ?? 'Sin Asignar';
            $solicitud['titulo'] = $solicitud['titulo'] ?? 'Solicitud #' . $solicitud['id'];
        }
        
        return $solicitudes;
    }

    public function obtenerActivos()
    {
        return $this->repo->getActivosDisponibles();
    }

    public function nuevaSolicitud($data, $files, $usuarioId)
    {
        if (empty($data['descripcion'])) {
            throw new Exception("La descripción es obligatoria.");
        }
        if (empty($data['titulo'])) {
            throw new Exception("El título breve es obligatorio.");
        }

        $activoId = !empty($data['activo_id']) ? $data['activo_id'] : null;
        $imagenUrl = null;

        if (isset($files['imagen']) && $files['imagen']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../../../../public_html/api/uploads/solicitudes/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

            $ext = pathinfo($files['imagen']['name'], PATHINFO_EXTENSION);
            $fileName = 'SOL_' . $usuarioId . '_' . time() . '.' . $ext;
            
            if (move_uploaded_file($files['imagen']['tmp_name'], $uploadDir . $fileName)) {
                $imagenUrl = 'uploads/solicitudes/' . $fileName;
            }
        }

        $datosInsert = [
            'usuario_id' => $usuarioId,
            'activo_id' => $activoId,
            'titulo' => $data['titulo'],
            'descripcion' => $data['descripcion'],
            'prioridad' => $data['prioridad'] ?? 'MEDIA',
            'imagen_url' => $imagenUrl
        ];

        $idSolicitud = $this->repo->crearSolicitud($datosInsert);

        $this->enviarCorreoCreacion($usuarioId, $idSolicitud, $datosInsert['titulo']);

        return $idSolicitud;
    }

    private function enviarCorreoCreacion($usuarioId, $folio, $titulo)
    {
        $usuario = $this->repo->getEmailUsuario($usuarioId);
        if ($usuario && !empty($usuario['email'])) {
            $to = $usuario['email'];
            $subject = "Solicitud Recibida #$folio - $titulo";
            $message = "Hola " . $usuario['nombre'] . ",\n\n";
            $message .= "Hemos recibido tu solicitud: '$titulo'.\n";
            $message .= "Estado: Pendiente\n\n";
            $message .= "Te notificaremos cuando un técnico sea asignado.";
            $headers = "From: no-reply@insuorders.com\r\n";
            @mail($to, $subject, $message, $headers);
        }
    }
}