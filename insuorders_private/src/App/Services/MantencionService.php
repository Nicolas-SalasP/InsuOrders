<?php
namespace App\Services;

use App\Repositories\MantencionRepository;
use App\Repositories\CronogramaRepository;
use Exception;

class MantencionService
{
    private $repo;
    private $cronogramaRepo;

    // Configuración de rutas de subida
    private $uploadBaseDir;
    private $publicUrlBase;

    public function __construct()
    {
        $this->repo = new MantencionRepository();
        $this->cronogramaRepo = new CronogramaRepository();

        // Definimos la ruta base física y la URL pública para los archivos
        $this->uploadBaseDir = __DIR__ . '/../../../../public_html/uploads/activos/';
        $this->publicUrlBase = '/uploads/activos/';
    }

    // =================================================================================
    // 1. GESTIÓN DE OTs (LECTURA Y ESCRITURA BÁSICA)
    // =================================================================================

    public function listarSolicitudes()
    {
        return $this->repo->getSolicitudes();
    }

    public function obtenerDetalleOT($id)
    {
        $header = $this->repo->getOTHeader($id);
        if (!$header)
            return null;

        $items = $this->repo->getDetallesOT($id);
        $asignaciones = $this->repo->getAsignadosOT($id);

        return array_merge($header, [
            'items' => $items,
            'asignaciones' => $asignaciones
        ]);
    }

    public function crearOT($data, $usuarioId)
    {
        // Validación de negocio: Una OT debe tener items o ser sobre un activo específico
        if (empty($data['items']) && empty($data['activo_id'])) {
            throw new Exception("Debe seleccionar un activo o agregar insumos manuales.");
        }
        return $this->repo->createOT($data);
    }

    public function editarOT($id, $data)
    {
        // Actualiza la OT y sincroniza el cronograma si aplica
        $resultado = $this->repo->updateOT($id, $data);
        $this->cronogramaRepo->syncByOT($id, $data);
        return $resultado;
    }

    public function finalizarTarea($otId, $usuarioId, $notas = '')
    {
        return $this->repo->finalizarTareaTecnico($otId, $usuarioId, $notas);
    }

    public function anularOT($id)
    {
        // Regla de negocio: No se puede anular si ya se entregaron materiales
        $entregas = $this->repo->getEntregasOT($id);
        if (!empty($entregas)) {
            throw new Exception("No se puede anular una OT que ya tiene materiales entregados. Debe finalizarlas o devolver los materiales.");
        }
        $this->repo->delete($id);
    }

    // =================================================================================
    // 2. GESTIÓN DE ACTIVOS (CRUD COMPLETO CON ARCHIVOS)
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
        // 1. Manejo de Imagen Principal
        if (!empty($files['imagen_principal']) && $files['imagen_principal']['error'] === UPLOAD_ERR_OK) {
            $data['imagen_url'] = $this->subirArchivo($files['imagen_principal']);
        }

        // 2. Manejo de Galería
        $data['galeria'] = $this->procesarGaleriaUpload($files, $data);

        // 3. Persistencia
        return $this->repo->createActivo($data);
    }

    public function editarActivo($data, $files)
    {
        if (empty($data['id'])) {
            throw new Exception("ID de activo no proporcionado.");
        }

        // 1. Manejo de Imagen Principal
        if (!empty($files['imagen_principal']) && $files['imagen_principal']['error'] === UPLOAD_ERR_OK) {
            $data['imagen_url'] = $this->subirArchivo($files['imagen_principal']);
        }

        // 2. Manejo de Galería
        $nuevasImagenes = $this->procesarGaleriaUpload($files, $data);
        $data['galeria'] = $nuevasImagenes;

        return $this->repo->updateActivo($data);
    }

    public function eliminarActivo($id)
    {
        // 1. Validación de Integridad Referencial
        $tieneHistorial = $this->repo->contarOrdenesAsociadas($id);
        if ($tieneHistorial > 0) {
            throw new Exception("No se puede eliminar: El activo tiene $tieneHistorial Órdenes de Trabajo asociadas.");
        }

        // 2. Recolectar archivos para borrar físico
        $archivosParaBorrar = $this->repo->obtenerRutasArchivosActivo($id);

        // 3. Borrado Transaccional DB
        $eliminado = $this->repo->eliminarActivoCompleto($id);

        if (!$eliminado) {
            throw new Exception("El activo no pudo ser eliminado o ya no existe.");
        }

        // 4. Borrado Físico
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

        $nombreOriginal = $file['name'];
        $ext = pathinfo($nombreOriginal, PATHINFO_EXTENSION);
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
    // 5. GESTIÓN DE KITS (MANTENIMIENTO PREVENTIVO)
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
    // 6. DATOS PARA PDF Y OTROS
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

    // =================================================================================
    // 7. GESTIÓN DE BODEGA E INVENTARIO (FUNCIONALIDADES COMPLETAS DEL REPO)
    // =================================================================================

    /**
     * Obtiene la lista de líneas de OT que tienen materiales pendientes de entrega.
     * Útil para el dashboard de bodega.
     */
    public function listarPendientesEntrega()
    {
        return $this->repo->getPendientesEntrega();
    }

    /**
     * Ejecuta la entrega física de material, descontando stock y generando movimientos.
     */
    public function realizarEntregaMaterial($detalleId, $usuarioId, $cantidad, $receptorId)
    {
        if ($cantidad <= 0) {
            throw new Exception("La cantidad a entregar debe ser mayor a 0.");
        }
        return $this->repo->entregarMaterial($detalleId, $usuarioId, $cantidad, $receptorId);
    }

    /**
     * Permite devolver material sobrante de una OT a la bodega.
     */
    public function realizarDevolucionMaterial($detalleId, $cantidad, $bodegueroId)
    {
        if ($cantidad <= 0) {
            throw new Exception("La cantidad a devolver debe ser mayor a 0.");
        }
        return $this->repo->devolverMaterial($detalleId, $cantidad, $bodegueroId);
    }

    /**
     * Cierre Administrativo de la OT.
     * Libera el stock reservado que no se usó y marca la OT como cerrada definitivamente.
     */
    public function cierreAdministrativoOT($id)
    {
        // Se puede agregar validación extra aquí, por ejemplo, que solo administradores lo hagan
        $this->repo->finalizar($id);
    }

    // =================================================================================
    // HELPERS PRIVADOS (FILE SYSTEM)
    // =================================================================================

    private function subirArchivo($file, $subFolder = '')
    {
        $targetDir = $this->uploadBaseDir . $subFolder;
        if (!file_exists($targetDir))
            mkdir($targetDir, 0777, true);

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('ACT_') . '.' . $extension;

        // Construcción correcta de ruta
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