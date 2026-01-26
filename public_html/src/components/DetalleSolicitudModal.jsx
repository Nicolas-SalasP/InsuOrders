import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

const DetalleSolicitudModal = ({ show, onClose, solicitudId }) => {
    const [loading, setLoading] = useState(false);
    const [solicitud, setSolicitud] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show && solicitudId) {
            cargarDetalle();
        } else {
            setSolicitud(null);
            setDetalles([]);
            setError('');
        }
    }, [show, solicitudId]);

    const cargarDetalle = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/index.php/mantencion/detalle?id=${solicitudId}`);
            
            if (res.data.success && res.data.data) {
                // CORRECCIÓN: El backend envía todo mezclado en 'data', y los ítems en 'data.items'
                setSolicitud(res.data.data); 
                setDetalles(res.data.data.items || []); 
            } else {
                setError(res.data.message || 'No se pudo cargar el detalle.');
            }
        } catch (e) {
            console.error(e);
            setError('Error de conexión al cargar el detalle.');
        } finally {
            setLoading(false);
        }
    };

    const getBadgeColor = (estado) => {
        switch (estado) {
            case 'Pendiente': return 'bg-warning text-dark';
            case 'En Proceso': return 'bg-primary';
            case 'Terminada': return 'bg-success';
            case 'Anulada': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content border-0 shadow-lg">
                    
                    {/* Header */}
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title fw-bold">
                            <i className="bi bi-file-text me-2"></i>Detalle de Solicitud OT #{solicitudId}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body p-4">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-2 text-muted">Cargando información...</p>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger d-flex align-items-center">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {error}
                            </div>
                        ) : solicitud ? (
                            <>
                                {/* Información Principal */}
                                <div className="card border-0 bg-light mb-4">
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <small className="text-uppercase text-muted fw-bold" style={{fontSize:'0.7rem'}}>Estado Actual</small>
                                                <div className="mt-1"><span className={`badge ${getBadgeColor(solicitud.estado)} px-3 py-2`}>{solicitud.estado}</span></div>
                                            </div>
                                            <div className="col-md-4">
                                                <small className="text-uppercase text-muted fw-bold" style={{fontSize:'0.7rem'}}>Fecha Solicitud</small>
                                                <div className="fw-bold text-dark">{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</div>
                                            </div>
                                            <div className="col-md-4">
                                                <small className="text-uppercase text-muted fw-bold" style={{fontSize:'0.7rem'}}>Prioridad</small>
                                                <div className={`fw-bold ${solicitud.prioridad === 'Alta' ? 'text-danger' : 'text-dark'}`}>
                                                    {solicitud.prioridad || 'Normal'}
                                                </div>
                                            </div>

                                            <div className="col-12 border-top my-2"></div>

                                            <div className="col-md-6">
                                                <small className="text-uppercase text-muted fw-bold" style={{fontSize:'0.7rem'}}>Solicitante</small>
                                                <div className="d-flex align-items-center mt-1">
                                                    <div className="bg-white rounded-circle p-2 border me-2"><i className="bi bi-person text-secondary"></i></div>
                                                    <div>
                                                        <div className="fw-bold text-dark lh-1">{solicitud.solicitante_nombre} {solicitud.solicitante_apellido}</div>
                                                        <small className="text-muted">Usuario ID: {solicitud.usuario_solicitante_id}</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <small className="text-uppercase text-muted fw-bold" style={{fontSize:'0.7rem'}}>Máquina / Activo</small>
                                                <div className="d-flex align-items-center mt-1">
                                                    <div className="bg-white rounded-circle p-2 border me-2"><i className="bi bi-hdd-rack text-primary"></i></div>
                                                    <div>
                                                        <div className="fw-bold text-dark lh-1">{solicitud.activo || 'General'}</div>
                                                        <small className="text-muted font-monospace">{solicitud.activo_codigo}</small>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-12 mt-3">
                                                <small className="text-uppercase text-muted fw-bold" style={{fontSize:'0.7rem'}}>Descripción del Trabajo</small>
                                                <div className="bg-white p-3 rounded border mt-1">
                                                    {solicitud.descripcion_trabajo || <span className="text-muted fst-italic">Sin descripción detallada.</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabla de Insumos */}
                                <h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">
                                    <i className="bi bi-box-seam me-2"></i>Insumos Solicitados
                                </h6>
                                
                                {detalles.length > 0 ? (
                                    <div className="table-responsive rounded border">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-light small text-uppercase text-muted">
                                                <tr>
                                                    <th className="ps-3">Insumo</th>
                                                    <th className="text-center">Cant. Solicitada</th>
                                                    <th className="text-center">Estado Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detalles.map((d, idx) => (
                                                    <tr key={idx}>
                                                        <td className="ps-3">
                                                            <div className="fw-bold text-dark">{d.nombre}</div>
                                                            <small className="text-muted font-monospace">{d.codigo_sku}</small>
                                                        </td>
                                                        <td className="text-center fw-bold">
                                                            {parseFloat(d.cantidad)} <small className="text-muted fw-normal">{d.unidad_medida}</small>
                                                        </td>
                                                        <td className="text-center">
                                                            {/* Lógica visual simple para el estado del item */}
                                                            {d.estado_linea === 'PENDIENTE' 
                                                                ? <span className="badge bg-warning text-dark rounded-pill">Pendiente</span>
                                                                : <span className="badge bg-success rounded-pill">{d.estado_linea}</span>
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-light rounded border border-dashed">
                                        <p className="mb-0 text-muted small">Esta orden no tiene insumos asociados.</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center text-muted py-5">No se encontraron datos.</div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer bg-light">
                        <button type="button" className="btn btn-secondary px-4" onClick={onClose}>Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleSolicitudModal;