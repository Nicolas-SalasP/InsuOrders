import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import ConfirmModal from './ConfirmModal';
import VideoModal from './VideoModal';

const DetalleSolicitudModal = ({ show, onClose, solicitudId, onSave }) => {
    const [detalle, setDetalle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [showFirmar, setShowFirmar] = useState(false);
    const [notaCierre, setNotaCierre] = useState('');
    const [loadingFirma, setLoadingFirma] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState(null);
    const currentUserId = parseInt(localStorage.getItem('user_id') || 0);
    const [videoModalUrl, setVideoModalUrl] = useState(null);

    useEffect(() => {
        if (show && solicitudId) {
            cargarDetalle();
        } else {
            setDetalle(null);
            setNotaCierre('');
            setEnlargedImage(null);
            setVideoModalUrl(null);
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
                        <div
                            key={idx}
                            className="position-relative border rounded shadow-sm bg-dark cursor-pointer overflow-hidden d-flex align-items-center justify-content-center row-hover"
                            style={{ height: '100px', width: '140px', background: '#1a1a1a' }}
                            onClick={() => setVideoModalUrl(`/api/${url}`)}
                            title="Haga clic para reproducir video"
                        >
                            <video src={`/api/${url}`} preload="metadata" className="w-100 h-100 opacity-60" style={{ objectFit: 'cover' }} />
                            <div className="position-absolute top-50 start-50 translate-middle text-white">
                                <i className="bi bi-play-circle-fill fs-3 text-warning shadow-sm"></i>
                            </div>
                        </div>
                    ) : (
                        <img
                            key={idx}
                            src={`/api/${url}`}
                            alt={`Evidencia ${idx + 1}`}
                            className="rounded border shadow-sm cursor-pointer image-hover"
                            style={{ height: '100px', width: '100px', objectFit: 'cover' }}
                            onClick={() => setEnlargedImage(`/api/${url}`)}
                        />
                    );
                })}
            </div>
        );
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value || 0);
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
                            style={{ zIndex: 1066, width: '45px', height: '45px', transform: 'translate(25%, -25%)' }}
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
            <VideoModal
                show={!!videoModalUrl}
                onClose={() => setVideoModalUrl(null)}
                videoUrl={videoModalUrl}
            />

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
                <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
                    <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
                        <div className="modal-header bg-primary text-white py-3">
                            <h5 className="modal-title fw-bold"><i className="bi bi-journal-text me-2"></i>Detalle OT #{solicitudId}</h5>
                            <button className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>

                        <div className="modal-body bg-light p-4">
                            {loading ? (
                                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                            ) : detalle ? (
                                <div className="container-fluid p-0">

                                    {/* --- ALERTA DE PERMISOS DE RIESGO --- */}
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
                                    <div className="card mb-4 border-0 shadow-sm rounded-3 overflow-hidden">
                                        <div className="card-header bg-primary bg-opacity-10 text-primary fw-bold d-flex justify-content-between align-items-center py-3">
                                            <span><i className="bi bi-people-fill me-2"></i>Avance del Equipo</span>
                                            <span className="badge bg-primary px-3 py-2 rounded-pill shadow-sm">{detalle.estado}</span>
                                        </div>
                                        <ul className="list-group list-group-flush">
                                            {detalle.asignaciones && detalle.asignaciones.length > 0 ? (
                                                detalle.asignaciones.map((asig, idx) => (
                                                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center p-3">
                                                        <div>
                                                            <div className="fw-bold text-dark">{asig.nombre} {asig.apellido}</div>
                                                            <small className="text-muted d-block mb-1">{asig.cargo || 'Técnico'}</small>
                                                            {parseInt(asig.completado) === 1 ? (
                                                                asig.notas_cierre ? (
                                                                    <div className="text-muted small fst-italic mt-1 border-start border-success ps-2 bg-light p-1 rounded">
                                                                        "{asig.notas_cierre}"
                                                                    </div>
                                                                ) : (
                                                                    <small className="text-success fst-italic border-start border-success ps-2 mt-1 d-inline-block">Finalizado sin notas</small>
                                                                )
                                                            ) : (
                                                                <small className="text-danger fw-medium d-inline-block mt-1">En ejecución...</small>
                                                            )}
                                                        </div>

                                                        {parseInt(asig.completado) === 1 ? (
                                                            <div className="text-end">
                                                                <span className="badge bg-success shadow-sm px-2 py-1">
                                                                    <i className="bi bi-check-circle-fill me-1"></i> Listo
                                                                </span>
                                                                <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                                                                    {new Date(asig.fecha_completado).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="badge bg-warning text-dark shadow-sm px-2 py-1">
                                                                <i className="bi bi-tools me-1"></i> Pendiente
                                                            </span>
                                                        )}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="list-group-item text-muted text-center py-3">Sin técnicos asignados.</li>
                                            )}
                                        </ul>

                                        {soyAsignadoPendiente() && (
                                            <div className="card-footer bg-white border-top text-end p-3">
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
                                                    className="btn btn-success fw-bold w-100 py-2 shadow-sm"
                                                    onClick={() => setShowFirmar(true)}
                                                    disabled={loadingFirma}
                                                >
                                                    {loadingFirma ? 'Procesando...' : <><i className="bi bi-pen-fill me-2"></i>Firmar mi Parte</>}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* --- 2. DATOS GENERALES Y EVIDENCIA CLIENTE --- */}
                                    <div className="row mb-4 align-items-stretch">
                                        <div className="col-md-6 mb-3 mb-md-0">
                                            <div className="card h-100 border-0 shadow-sm rounded-3">
                                                <div className="card-body p-3">
                                                    <small className="text-muted text-uppercase fw-bold">Máquina Principal</small>
                                                    <div className="fs-5 text-dark fw-bold">{detalle.activo}</div>
                                                    <div className="text-secondary small mb-2">{detalle.activo_codigo}</div>

                                                    {detalle.sub_activo_nombre && (
                                                        <div className="mt-2 p-2 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded shadow-sm mb-3">
                                                            <small className="text-primary text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                                                                <i className="bi bi-diagram-3-fill me-1"></i> Sub-Activo / Componente
                                                            </small>
                                                            <div className="fs-6 text-dark fw-bold mt-1">↳ {detalle.sub_activo_nombre}</div>
                                                        </div>
                                                    )}
                                                    <small className="text-muted text-uppercase fw-bold d-block mt-2">Ubicación / Referencia</small>
                                                    <div className="d-flex align-items-center mt-1 bg-white p-2 rounded border shadow-inner">
                                                        <i className="bi bi-geo-alt-fill text-danger me-2 fs-5"></i>
                                                        <span className="fw-medium">{detalle.ubicacion || 'No especificada'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card h-100 border-0 shadow-sm rounded-3">
                                                <div className="card-body p-3">
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

                                    <div className="card mb-4 border-0 shadow-sm rounded-3">
                                        <div className="card-body p-4">
                                            <small className="text-muted text-uppercase fw-bold">Título de la Solicitud / Falla</small>
                                            <h5 className="fw-bold text-primary mt-1 border-bottom pb-2">{detalle.titulo || `OT #${detalle.id}`}</h5>

                                            <small className="text-muted text-uppercase fw-bold mt-3 d-block">Descripción del Problema</small>
                                            <p className="mb-0 mt-1 p-3 bg-white border rounded text-dark shadow-inner">{detalle.descripcion_trabajo || 'Sin descripción adicional.'}</p>
                                        </div>
                                    </div>

                                    {/* --- EVIDENCIA DEL TÉCNICO AL CERRAR --- */}
                                    {(detalle.comentarios_finales || detalle.evidencia_cierre || detalle.fecha_cierre) && (
                                        <div className="card mb-4 border-0 shadow-sm rounded-3 overflow-hidden border-start border-success border-4">
                                            <div className="card-header bg-success text-white fw-bold d-flex justify-content-between align-items-center py-3">
                                                <span><i className="bi bi-check2-all me-2"></i>Reporte Final del Técnico</span>
                                                {detalle.fecha_cierre && (
                                                    <span className="badge bg-white text-success fw-bold">
                                                        Culminado: {new Date(detalle.fecha_cierre).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="card-body p-3">
                                                {detalle.comentarios_finales && (
                                                    <div className="mb-3">
                                                        <small className="text-muted text-uppercase fw-bold">Trabajo Realizado / Notas</small>
                                                        <p className="mb-0 mt-1 p-2 bg-white border rounded text-dark shadow-inner">{detalle.comentarios_finales}</p>
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

                                    {/* --- 3. INSUMOS Y COSTOS --- */}
                                    <div className="card border-0 shadow-sm rounded-3 overflow-hidden mb-3">
                                        <div className="card-header bg-white border-bottom fw-bold py-3 text-dark">
                                            <i className="bi bi-box-seam me-2 text-primary"></i>Insumos Utilizados
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table mb-0 align-middle">
                                                <thead className="table-light small text-uppercase">
                                                    <tr>
                                                        <th>Insumo</th>
                                                        <th className="text-center">Cant.</th>
                                                        <th className="text-center">Estado</th>
                                                        <th className="text-end">Costo Unit.</th>
                                                        <th className="text-end pe-3">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {detalle.items && detalle.items.length > 0 ? detalle.items.map((item, i) => (
                                                        <tr key={i}>
                                                            <td className="ps-3">
                                                                <div className="fw-bold">{item.nombre}</div>
                                                                <small className="text-muted font-monospace">{item.codigo_sku}</small>
                                                            </td>
                                                            <td className="text-center fw-bold text-primary">{parseFloat(item.cantidad_entregada)} <span className="small text-muted fw-normal fw-bold">{item.unidad_medida}</span></td>
                                                            <td className="text-center">
                                                                <span className={`badge rounded-pill ${item.estado_linea === 'ENTREGADO' ? 'bg-success' : 'bg-secondary'}`}>
                                                                    {item.estado_linea}
                                                                </span>
                                                            </td>
                                                            <td className="text-end text-muted small">{formatCurrency(item.costo_unitario_snapshot)}</td>
                                                            <td className="text-end fw-bold text-dark pe-3">{formatCurrency(item.costo_total_linea)}</td>
                                                        </tr>
                                                    )) : <tr><td colSpan="5" className="text-center text-muted py-4 fst-italic">Sin insumos requeridos.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* --- RESUMEN FINANCIERO --- */}
                                        <div className="card-footer bg-white border-top d-flex justify-content-end p-3">
                                            <div className="text-end">
                                                <div className="small text-muted text-uppercase fw-bold mb-1">Costo Total de Reparación</div>
                                                <div className="fs-3 fw-bold text-success font-monospace">
                                                    {formatCurrency(detalle.costo_total_ot)}
                                                </div>

                                                {(parseFloat(detalle.costo_mano_obra) > 0 || parseFloat(detalle.costo_servicios_externos) > 0) && (
                                                    <div className="small text-muted mt-2 border-top pt-2">
                                                        <div className="d-flex justify-content-between gap-4">
                                                            <span>Materiales:</span>
                                                            <span className="fw-bold">{formatCurrency(detalle.costo_total_insumos)}</span>
                                                        </div>
                                                        {parseFloat(detalle.costo_mano_obra) > 0 && (
                                                            <div className="d-flex justify-content-between gap-4">
                                                                <span>Mano de Obra:</span>
                                                                <span className="fw-bold">{formatCurrency(detalle.costo_mano_obra)}</span>
                                                            </div>
                                                        )}
                                                        {parseFloat(detalle.costo_servicios_externos) > 0 && (
                                                            <div className="d-flex justify-content-between gap-4">
                                                                <span>Serv. Externos:</span>
                                                                <span className="fw-bold">{formatCurrency(detalle.costo_servicios_externos)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="text-center py-5 text-muted">No se pudo cargar la información.</div>
                            )}
                        </div>

                        <div className="modal-footer bg-white d-flex justify-content-between py-3">
                            <button
                                className="btn btn-outline-danger fw-bold d-flex align-items-center shadow-sm"
                                onClick={descargarPdf}
                                disabled={downloading || !detalle}
                            >
                                {downloading ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span>Generando...</>
                                ) : (
                                    <><i className="bi bi-file-earmark-pdf-fill me-2"></i>Imprimir Reporte</>
                                )}
                            </button>
                            <button className="btn btn-secondary px-4 fw-medium rounded-pill shadow-sm" onClick={onClose}>Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DetalleSolicitudModal;