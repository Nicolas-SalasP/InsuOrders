import { useState, useEffect } from 'react';
import { Modal, Button, Form, ProgressBar, Alert, Table } from 'react-bootstrap';
import api from '../api/axiosConfig';

// DEFINICIÓN DE INSTRUCCIONES FUERA DEL COMPONENTE (Para evitar recreación constante)
const INSTRUCCIONES = {
    proveedores: [
        "RUT debe incluir puntos y guion (Ej: 12.345.678-9).",
        "Delimitador requerido: Punto y coma (;).",
        "Columnas: RUT, Nombre, Contacto, Teléfono, Email, Dirección, Rubro."
    ],
    insumos: [
        "SKU: Deje vacío o 'AUTO' para generar correlativo.",
        "Precios y Stock: Solo números (sin $ ni puntos de miles).",
        "Categoría: Si no existe, se creará automáticamente."
    ],
    activos: [
        "Código Interno debe ser único por activo.",
        "Centro de Costo: Debe existir previamente en el sistema (por código).",
        "Estado: 'OPERATIVO' o 'BAJA'."
    ],
    kits: [
        "Carga masiva de repuestos vinculados a máquinas.",
        "Requiere Código Interno del Activo y SKU del Insumo.",
        "Si la relación ya existe, se actualizará la cantidad."
    ]
};

const ModalCargaMasiva = ({ show, onClose, onSave, tipo, titulo = "Importación Masiva" }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState('');
    const [infoTexto, setInfoTexto] = useState([]);

    // Efecto para reiniciar el modal y cargar instrucciones cada vez que se abre
    useEffect(() => {
        if (show && tipo) {
            setFile(null);
            setResultado(null);
            setError('');
            setUploading(false);
            
            // Cargar instrucciones según el 'tipo' recibido
            const textos = INSTRUCCIONES[tipo] || ["Cargue un archivo CSV válido."];
            setInfoTexto(textos);
        }
    }, [show, tipo]);

    const handleClose = () => {
        onClose();
    };

    const handleDownloadTemplate = async () => {
        try {
            setUploading(true);
            // CORRECCIÓN: Usamos 'tipo' en la URL
            const response = await api.get(`/index.php/importar/plantilla?tipo=${tipo}`, { responseType: 'blob' });
            
            // Crear link de descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `plantilla_${tipo}.csv`);
            document.body.appendChild(link);
            link.click();
            
            // Limpieza
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error descargando plantilla", error);
            setError("No se pudo descargar la plantilla del servidor.");
        } finally {
            setUploading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return setError('Seleccione un archivo CSV.');
        
        setUploading(true);
        setError('');
        setResultado(null);

        const formData = new FormData();
        formData.append('archivo', file);
        // CORRECCIÓN: Enviamos 'tipo' al backend
        formData.append('tipo', tipo);

        try {
            const res = await api.post('/index.php/importar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000 
            });

            if (res.data.success) {
                setResultado(res.data);
                if (onSave) onSave();
            } else {
                setError(res.data.message || 'Error desconocido al procesar el archivo.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error de conexión o archivo inválido.');
        } finally {
            setUploading(false);
        }
    };

    if (!show) return null;

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" size={resultado ? "lg" : "md"} centered>
            <Modal.Header className="bg-primary text-white border-0">
                <Modal.Title className="d-flex align-items-center fw-bold h5 mb-0">
                    <i className="bi bi-file-earmark-spreadsheet-fill me-2"></i>
                    {titulo} <span className="ms-2 badge bg-white text-primary small opacity-75">{tipo?.toUpperCase()}</span>
                </Modal.Title>
                <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
            </Modal.Header>
            
            <Modal.Body className="bg-light p-4">
                {!resultado ? (
                    /* --- VISTA 1: FORMULARIO DE CARGA --- */
                    <>
                        {error && <Alert variant="danger" className="d-flex align-items-center py-2 small shadow-sm border-0 mb-3"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</Alert>}

                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body bg-white p-3 rounded">
                                <h6 className="card-subtitle mb-2 text-primary fw-bold small text-uppercase border-bottom pb-2">
                                    <i className="bi bi-info-circle-fill me-1"></i> Instrucciones
                                </h6>
                                <ul className="mb-0 ps-3 small text-muted">
                                    {infoTexto.map((txt, i) => <li key={i} className="mb-1">{txt}</li>)}
                                    <li>El archivo debe ser formato <strong>.CSV</strong> (UTF-8).</li>
                                </ul>
                            </div>
                        </div>

                        <div className="d-grid mb-4">
                            <button type="button" className="btn btn-outline-primary btn-sm fw-bold border-2" onClick={handleDownloadTemplate} disabled={uploading}>
                                <i className="bi bi-cloud-download me-2"></i>Descargar Plantilla Base
                            </button>
                        </div>

                        <form onSubmit={handleUpload}>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-uppercase text-muted">Subir Archivo</label>
                                <div className="input-group shadow-sm">
                                    <input type="file" className="form-control" accept=".csv" onChange={e => setFile(e.target.files[0])} required disabled={uploading} />
                                    <span className="input-group-text bg-white text-success border-start-0"><i className="bi bi-filetype-csv fs-5"></i></span>
                                </div>
                            </div>

                            {uploading && (
                                <div className="text-center mb-3">
                                    <ProgressBar animated now={100} label="Procesando datos..." variant="info" striped className="mb-1" style={{height: '20px'}} />
                                    <small className="text-muted fst-italic" style={{fontSize: '0.75rem'}}>Esto puede tomar unos momentos, no cierre la ventana.</small>
                                </div>
                            )}

                            <div className="d-grid">
                                <button type="submit" className="btn btn-success fw-bold py-2 shadow-sm" disabled={uploading || !file}>
                                    {uploading ? 'Analizando...' : 'Iniciar Importación'}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    /* --- VISTA 2: RESULTADOS --- */
                    <div className="animate__animated animate__fadeIn">
                        
                        {/* Resumen en Tarjetas */}
                        <div className="row g-2 mb-4 text-center">
                            <div className="col-4">
                                <div className="p-3 border rounded bg-success bg-opacity-10 h-100">
                                    <h2 className="fw-bold text-success mb-0">{resultado.resumen.ok}</h2>
                                    <small className="text-uppercase fw-bold text-success" style={{fontSize: '0.7rem'}}>Procesados OK</small>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="p-3 border rounded bg-warning bg-opacity-10 h-100">
                                    <h2 className="fw-bold text-warning mb-0">{resultado.resumen.duplicados}</h2>
                                    <small className="text-uppercase fw-bold text-warning" style={{fontSize: '0.7rem'}}>Duplicados</small>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="p-3 border rounded bg-danger bg-opacity-10 h-100">
                                    <h2 className="fw-bold text-danger mb-0">{resultado.resumen.error}</h2>
                                    <small className="text-uppercase fw-bold text-danger" style={{fontSize: '0.7rem'}}>Errores</small>
                                </div>
                            </div>
                        </div>

                        {/* Tabla de Detalles */}
                        <div className="bg-white rounded shadow-sm border overflow-hidden">
                            <div className="px-3 py-2 bg-light border-bottom d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold text-primary mb-0 small text-uppercase">Detalle de Incidencias</h6>
                                <span className="badge bg-secondary">{resultado.detalles?.length || 0} Registros</span>
                            </div>
                            
                            {resultado.detalles && resultado.detalles.length > 0 ? (
                                <div className="table-responsive" style={{ maxHeight: '300px' }}>
                                    <Table striped hover size="sm" className="mb-0 align-middle small">
                                        <thead className="bg-white" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                            <tr className="text-muted text-uppercase">
                                                <th className="text-center" style={{width: '50px'}}>Fila</th>
                                                <th>Dato / Item</th>
                                                <th className="text-center" style={{width: '90px'}}>Estado</th>
                                                <th>Mensaje</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {resultado.detalles.map((det, idx) => (
                                                <tr key={idx}>
                                                    <td className="text-center fw-bold text-muted border-end">{det.fila}</td>
                                                    <td className="fw-bold text-dark text-truncate" style={{maxWidth: '150px'}} title={det.item}>
                                                        {det.item}
                                                    </td>
                                                    <td className="text-center">
                                                        {det.tipo === 'duplicado' ? (
                                                            <span className="badge bg-warning text-dark border border-warning">Duplicado</span>
                                                        ) : (
                                                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">Error</span>
                                                        )}
                                                    </td>
                                                    <td className="text-danger fst-italic">{det.msg}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-check-circle-fill text-success fs-1 mb-2 d-block"></i>
                                    <h6 className="fw-bold text-success">¡Importación Limpia!</h6>
                                    <p className="text-muted small mb-0">Todos los registros se procesaron correctamente.</p>
                                </div>
                            )}
                        </div>

                        <div className="d-grid mt-4">
                            <button className="btn btn-primary fw-bold shadow-sm" onClick={handleClose}>
                                <i className="bi bi-check-lg me-2"></i>Finalizar y Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ModalCargaMasiva;