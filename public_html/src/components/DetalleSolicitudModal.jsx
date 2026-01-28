import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import ConfirmModal from './ConfirmModal';

const DetalleSolicitudModal = ({ show, onClose, solicitudId, onSave }) => {
    const [detalle, setDetalle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false); // Estado para el botón de PDF
    
    // Estados para la firma
    const [showFirmar, setShowFirmar] = useState(false);
    const [notaCierre, setNotaCierre] = useState('');
    const [loadingFirma, setLoadingFirma] = useState(false);

    // ID del usuario logueado
    const currentUserId = parseInt(localStorage.getItem('user_id') || 0);

    useEffect(() => {
        if (show && solicitudId) {
            cargarDetalle();
        } else {
            setDetalle(null);
            setNotaCierre('');
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
            
            // Recargamos el detalle para ver el cambio reflejado (el "check" verde)
            await cargarDetalle(); 
            
            // Avisamos al padre para que actualice la tabla general
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

    // Verificar si YO estoy asignado y pendiente
    const soyAsignadoPendiente = () => {
        if (!detalle || !detalle.asignaciones) return false;
        const miAsignacion = detalle.asignaciones.find(a => parseInt(a.usuario_id) === currentUserId);
        return miAsignacion && parseInt(miAsignacion.completado) === 0;
    };

    if (!show) return null;

    return (
        <>
            {/* MODAL DE CONFIRMACIÓN DE FIRMA */}
            <ConfirmModal 
                show={showFirmar}
                onClose={() => setShowFirmar(false)}
                onConfirm={handleFirmar}
                title="Finalizar mi Tarea"
                message="¿Confirmas que has terminado tu parte del trabajo? Esto registrará tu firma en la OT."
                confirmText="Sí, Firmar y Terminar"
                type="success"
            />

            {/* MODAL DE DETALLE PRINCIPAL */}
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
                                                                <div className="text-muted" style={{fontSize:'0.7rem'}}>
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
                                        
                                        {/* Botón de Firma Personal */}
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

                                    {/* --- 2. DATOS GENERALES --- */}
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="card h-100 border-0 shadow-sm">
                                                <div className="card-body">
                                                    <small className="text-muted text-uppercase fw-bold">Máquina</small>
                                                    <div className="fs-5 text-dark fw-bold">{detalle.activo}</div>
                                                    <div className="text-secondary small">{detalle.activo_codigo}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card h-100 border-0 shadow-sm">
                                                <div className="card-body">
                                                    <small className="text-muted text-uppercase fw-bold">Solicitante</small>
                                                    <div className="fs-5 text-dark">{detalle.solicitante_nombre} {detalle.solicitante_apellido}</div>
                                                    <div className="text-secondary small">{new Date(detalle.fecha_solicitud).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card mb-3 border-0 shadow-sm">
                                        <div className="card-body">
                                            <small className="text-muted text-uppercase fw-bold">Descripción del Problema</small>
                                            <p className="mb-0 mt-1 p-2 bg-white border rounded">{detalle.descripcion_trabajo}</p>
                                        </div>
                                    </div>

                                    {/* --- 3. INSUMOS --- */}
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white fw-bold">Insumos Solicitados</div>
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
                                                    {detalle.items.length > 0 ? detalle.items.map((item, i) => (
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
                                                    )) : <tr><td colSpan="3" className="text-center text-muted">Sin insumos.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="text-center py-5 text-muted">No se pudo cargar la información.</div>
                            )}
                        </div>
                        
                        {/* PIE DE PÁGINA CON BOTÓN DE IMPRIMIR */}
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