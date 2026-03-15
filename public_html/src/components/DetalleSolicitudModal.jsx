import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import ConfirmModal from './ConfirmModal';

const DetalleSolicitudModal = ({ show, onClose, solicitudId, onSave }) => {
    const [detalle, setDetalle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [showFirmar, setShowFirmar] = useState(false);
    const [notaCierre, setNotaCierre] = useState('');
    const [loadingFirma, setLoadingFirma] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState(null);
    const currentUserId = parseInt(localStorage.getItem('user_id') || 0);

    useEffect(() => {
        if (show && solicitudId) {
            cargarDetalle();
        } else {
            setDetalle(null);
            setNotaCierre('');
            setEnlargedImage(null);
        }
    }, [show, solicitudId]);

    const cargarDetalle = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/index.php/mantencion?detalle=true&id=${solicitudId}`);
            if (res.data.success) {
                setDetalle(res.data.data);
            }
        } catch (error) {
            console.error("Error al cargar detalle", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFirmar = async () => {
        setLoadingFirma(true);
        try {
            const res = await api.post('/index.php/mantencion/finalizar', {
                id: solicitudId,
                notas: notaCierre
            });

            setShowFirmar(false);
            setNotaCierre('');

            await cargarDetalle();
            if (onSave) onSave();

            alert(res.data.message || "Avance registrado correctamente");

        } catch (error) {
            alert(error.response?.data?.message || "Error al firmar");
        } finally {
            setLoadingFirma(false);
        }
    };

    const descargarPdf = async () => {
        try {
            setDownloading(true);
            const response = await api.get(`/index.php/mantencion/pdf?id=${solicitudId}&type=solicitud`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `OT_${solicitudId}_Reporte.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error al descargar PDF", error);
            alert("No se pudo generar el documento.");
        } finally {
            setDownloading(false);
        }
    };

    const soyAsignadoPendiente = () => {
        if (!detalle || !detalle.asignaciones) return false;
        const miAsignacion = detalle.asignaciones.find(a => parseInt(a.usuario_id) === currentUserId);
        return miAsignacion && parseInt(miAsignacion.completado) === 0;
    };

    const renderEvidencia = (evidenciaStr) => {
        if (!evidenciaStr) return <span className="text-muted small">Sin evidencia adjunta.</span>;

        let archivos = [];
        try {
            archivos = JSON.parse(evidenciaStr);
            if (!Array.isArray(archivos)) archivos = [evidenciaStr];
        } catch (e) {
            archivos = [evidenciaStr];
        }

        return (
            <div className="d-flex flex-wrap gap-2 mt-2">
                {archivos.map((url, idx) => {
                    const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
                    return isVideo ? (
                        <video key={idx} src={`/api/${url}`} controls className="rounded border shadow-sm bg-dark" style={{ height: '100px', maxWidth: '100%' }}></video>
                    ) : (
                        <img
                            key={idx}
                            src={`/api/${url}`}
                            alt={`Evidencia ${idx + 1}`}
                            className="rounded border shadow-sm cursor-pointer"
                            style={{ height: '100px', width: '100px', objectFit: 'cover' }}
                            onClick={() => setEnlargedImage(`/api/${url}`)}
                        />
                    );
                })}
            </div>
        );
    };

    if (!show) return null;

    return (
        <>
            {enlargedImage && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}
                    onClick={() => setEnlargedImage(null)}
                >
                    <div className="position-relative text-center p-3" style={{ maxWidth: '100%', maxHeight: '100%' }}>
                        <button
                            className="btn btn-light position-absolute top-0 end-0 m-4 rounded-circle shadow-sm d-flex justify-content-center align-items-center"
                            style={{ zIndex: 1061, width: '45px', height: '45px', transform: 'translate(25%, -25%)' }}
                            onClick={() => setEnlargedImage(null)}
                        >
                            <i className="bi bi-x-lg text-dark fw-bold fs-5"></i>
                        </button>

                        <img
                            src={enlargedImage}
                            alt="Ampliación"
                            className="img-fluid rounded shadow-lg"
                            style={{ maxHeight: '90vh', maxWidth: '100%', objectFit: 'contain' }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            <ConfirmModal
                show={showFirmar}
                onClose={() => setShowFirmar(false)}
                onConfirm={handleFirmar}
                title="Finalizar mi Tarea"
                message="¿Confirmas que has terminado tu parte del trabajo? Esto registrará tu firma en la OT."
                confirmText="Sí, Firmar y Terminar"
                type="success"
            />

            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content shadow-lg">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">Detalle OT #{solicitudId}</h5>
                            <button className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>

                        <div className="modal-body bg-light">
                            {loading ? (
                                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                            ) : detalle ? (
                                <div className="container-fluid p-0">

                                    {/* --- ALERTA DE PREVENCIÓN DE RIESGOS (PERMISOS DE TRABAJO) --- */}
                                    {Number(detalle.requiere_permiso) === 1 && (
                                        <div className="alert shadow-sm mb-4" style={{ backgroundColor: '#fff3cd', borderLeft: '6px solid #dc3545', color: '#856404', padding: '1rem' }}>
                                            <div className="d-flex align-items-center">
                                                <div className="me-3">
                                                    <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '2.5rem' }}></i>
                                                </div>
                                                <div>
                                                    <h5 className="alert-heading fw-bold text-danger mb-1">ATENCIÓN: TRABAJO CON RIESGO</h5>
                                                    <p className="mb-1" style={{ fontSize: '0.95rem' }}>
                                                        Esta tarea requiere un Permiso de <strong>{detalle.tipo_permiso_nombre || 'Trabajo Seguro'}</strong>.
                                                    </p>
                                                    <p className="mb-0 fw-bold">
                                                        <i className="bi bi-arrow-right-circle-fill me-1 text-danger"></i>
                                                        Acción requerida: Solicitar y autorizar este permiso con Prevención de Riesgos antes de iniciar.
                                                    </p>
                                                    {detalle.descripcion_permiso && (
                                                        <div className="mt-2 p-2 bg-white rounded text-dark border border-warning" style={{ fontSize: '0.9rem' }}>
                                                            <strong><i className="bi bi-info-circle-fill text-warning me-1"></i> Nota del Supervisor:</strong> {detalle.descripcion_permiso}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* --- 1. AVANCE DEL EQUIPO --- */}
                                    <div className="card mb-3 border-primary shadow-sm">
                                        <div className="card-header bg-primary bg-opacity-10 text-primary fw-bold d-flex justify-content-between align-items-center">
                                            <span><i className="bi bi-people-fill me-2"></i>Avance del Equipo</span>
                                            <span className="badge bg-primary rounded-pill">{detalle.estado}</span>
                                        </div>
                                        <ul className="list-group list-group-flush">
                                            {detalle.asignaciones && detalle.asignaciones.length > 0 ? (
                                                detalle.asignaciones.map((asig, idx) => (
                                                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <div className="fw-bold">{asig.nombre} {asig.apellido}</div>
                                                            <small className="text-muted">{asig.cargo || 'Técnico'}</small>
                                                            {asig.notas_cierre && (
                                                                <div className="text-success fst-italic small mt-1 border-start border-success ps-2">
                                                                    "{asig.notas_cierre}"
                                                                </div>
                                                            )}
                                                        </div>

                                                        {parseInt(asig.completado) === 1 ? (
                                                            <div className="text-end">
                                                                <span className="badge bg-success">
                                                                    <i className="bi bi-check-circle-fill me-1"></i> Listo
                                                                </span>
                                                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                                    {new Date(asig.fecha_completado).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="badge bg-warning text-dark">
                                                                <i className="bi bi-hourglass-split me-1"></i> Pendiente
                                                            </span>
                                                        )}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="list-group-item text-muted text-center py-3">Sin técnicos asignados.</li>
                                            )}
                                        </ul>

                                        {soyAsignadoPendiente() && (
                                            <div className="card-footer bg-white text-end p-3">
                                                <div className="mb-2 text-start">
                                                    <label className="form-label small fw-bold text-secondary">Nota de Término (Opcional):</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Describe brevemente lo realizado..."
                                                        value={notaCierre}
                                                        onChange={(e) => setNotaCierre(e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    className="btn btn-success fw-bold w-100"
                                                    onClick={() => setShowFirmar(true)}
                                                    disabled={loadingFirma}
                                                >
                                                    {loadingFirma ? 'Procesando...' : <><i className="bi bi-pen-fill me-2"></i>Firmar mi Parte</>}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* --- 2. DATOS GENERALES Y EVIDENCIA CLIENTE --- */}
                                    <div className="row mb-3 align-items-stretch">
                                        <div className="col-md-6 mb-3 mb-md-0">
                                            <div className="card h-100 border-0 shadow-sm">
                                                <div className="card-body">
                                                    <small className="text-muted text-uppercase fw-bold">Máquina / Servicio</small>
                                                    <div className="fs-5 text-dark fw-bold">{detalle.activo}</div>
                                                    <div className="text-secondary small mb-3">{detalle.activo_codigo}</div>

                                                    <small className="text-muted text-uppercase fw-bold d-block mt-2">Ubicación / Referencia</small>
                                                    <div className="d-flex align-items-center mt-1 bg-light p-2 rounded border">
                                                        <i className="bi bi-geo-alt-fill text-danger me-2 fs-5"></i>
                                                        <span className="fw-medium">{detalle.ubicacion || 'No especificada'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card h-100 border-0 shadow-sm">
                                                <div className="card-body">
                                                    <small className="text-muted text-uppercase fw-bold d-flex justify-content-between">
                                                        <span>Solicitante</span>
                                                        <span>{new Date(detalle.fecha_solicitud).toLocaleDateString()}</span>
                                                    </small>
                                                    <div className="fs-6 text-dark mb-3"><i className="bi bi-person-circle me-2 text-primary"></i>{detalle.solicitante_nombre} {detalle.solicitante_apellido}</div>

                                                    <small className="text-muted text-uppercase fw-bold d-block mt-2">Evidencia Adjunta (Cliente)</small>
                                                    {renderEvidencia(detalle.imagen_url)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card mb-3 border-0 shadow-sm">
                                        <div className="card-body">
                                            <small className="text-muted text-uppercase fw-bold">Descripción del Problema</small>
                                            <p className="mb-0 mt-1 p-3 bg-white border rounded text-dark">{detalle.descripcion_trabajo}</p>
                                        </div>
                                    </div>

                                    {/* --- EVIDENCIA DEL TÉCNICO AL CERRAR --- */}
                                    {(detalle.comentarios_finales || detalle.evidencia_cierre) && (
                                        <div className="card mb-3 border-success shadow-sm">
                                            <div className="card-header bg-success text-white fw-bold">
                                                <i className="bi bi-check2-all me-2"></i>Reporte Final del Técnico
                                            </div>
                                            <div className="card-body bg-light">
                                                {detalle.comentarios_finales && (
                                                    <div className="mb-3">
                                                        <small className="text-muted text-uppercase fw-bold">Trabajo Realizado / Notas</small>
                                                        <p className="mb-0 mt-1 p-2 bg-white border rounded text-dark">{detalle.comentarios_finales}</p>
                                                    </div>
                                                )}
                                                {detalle.evidencia_cierre && (
                                                    <div>
                                                        <small className="text-muted text-uppercase fw-bold">Evidencia de Cierre</small>
                                                        {renderEvidencia(detalle.evidencia_cierre)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* --- 3. INSUMOS --- */}
                                    <div className="card border-0 shadow-sm mb-3">
                                        <div className="card-header bg-white fw-bold">Insumos Solicitados a Bodega</div>
                                        <div className="table-responsive">
                                            <table className="table mb-0 align-middle">
                                                <thead className="table-light small">
                                                    <tr>
                                                        <th>Insumo</th>
                                                        <th className="text-center">Cant.</th>
                                                        <th className="text-center">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {detalle.items && detalle.items.length > 0 ? detalle.items.map((item, i) => (
                                                        <tr key={i}>
                                                            <td>
                                                                <div className="fw-bold">{item.nombre}</div>
                                                                <small className="text-muted">{item.codigo_sku}</small>
                                                            </td>
                                                            <td className="text-center fw-bold">{parseFloat(item.cantidad)} {item.unidad_medida}</td>
                                                            <td className="text-center">
                                                                <span className={`badge rounded-pill ${item.estado_linea === 'ENTREGADO' ? 'bg-success' : 'bg-secondary'}`}>
                                                                    {item.estado_linea}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )) : <tr><td colSpan="3" className="text-center text-muted py-3">Sin insumos requeridos.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="text-center py-5 text-muted">No se pudo cargar la información.</div>
                            )}
                        </div>

                        <div className="modal-footer bg-white d-flex justify-content-between">
                            <button
                                className="btn btn-outline-danger fw-bold"
                                onClick={descargarPdf}
                                disabled={downloading || !detalle}
                            >
                                {downloading ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span>Generando...</>
                                ) : (
                                    <><i className="bi bi-file-earmark-pdf-fill me-2"></i>Imprimir Reporte</>
                                )}
                            </button>
                            <button className="btn btn-secondary px-4" onClick={onClose}>Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DetalleSolicitudModal;