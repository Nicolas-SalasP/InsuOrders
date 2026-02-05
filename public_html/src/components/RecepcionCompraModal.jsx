import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const RecepcionCompraModal = ({ show, onClose, ordenId, onSave }) => {
    const [orden, setOrden] = useState(null);
    const [inputs, setInputs] = useState({}); 
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show && ordenId) {
            cargarDatosOrden();
            setInputs({});
            setError('');
        }
    }, [show, ordenId]);

    const cargarDatosOrden = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/index.php/compras/detalle?id=${ordenId}`);
            
            if (res.data.success) {
                setOrden(res.data.data);
            }
        } catch (e) {
            console.error(e);
            setError("Error al cargar detalles de la orden.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (id, valor) => {
        setInputs(prev => ({ ...prev, [id]: valor }));
    };

    const handleSubmit = async () => {
        const itemsAEnviar = Object.keys(inputs)
            .filter(key => parseFloat(inputs[key]) > 0)
            .map(key => ({
                detalle_id: key,
                cantidad: inputs[key]
            }));

        if (itemsAEnviar.length === 0) {
            return setError("Debes ingresar al menos una cantidad para recibir.");
        }

        setLoading(true);
        try {
            await api.post('/index.php/compras/recepcionar', {
                orden_id: ordenId,
                items: itemsAEnviar
            });
            onSave();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Error al procesar la recepción.");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content shadow border-0">
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title fw-bold"><i className="bi bi-truck me-2"></i>Recepción Administrativa (OC #{ordenId})</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body bg-light">
                        {error && <div className="alert alert-danger shadow-sm border-0"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
                        
                        {orden && (
                            <div className="alert alert-white border shadow-sm d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h6 className="mb-0 text-dark">Proveedor: <span className="fw-bold">{orden.cabecera.proveedor}</span></h6>
                                </div>
                                
                                {orden.cabecera.destino && (
                                    <div className="text-end">
                                        <small className="text-uppercase text-muted fw-bold d-block" style={{fontSize: '0.65rem'}}>
                                            Destino / Uso Previsto
                                        </small>
                                        <span className="badge bg-info text-dark border border-info bg-opacity-25">
                                            <i className="bi bi-geo-fill me-1"></i>
                                            {orden.cabecera.destino}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light text-secondary small text-uppercase">
                                            <tr>
                                                <th className="ps-4">Insumo</th>
                                                <th className="text-center">Solicitado</th>
                                                <th className="text-center">Ya Recibido</th>
                                                <th className="text-center">Pendiente</th>
                                                <th className="text-center text-success pe-4" style={{width: '140px'}}>Llega Ahora</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading && !orden && (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-5">
                                                        <div className="spinner-border text-success spinner-border-sm me-2"></div>
                                                        Cargando detalles...
                                                    </td>
                                                </tr>
                                            )}

                                            {orden?.detalles?.map(d => {
                                                const solicitado = parseFloat(d.cantidad_solicitada);
                                                const recibido = parseFloat(d.cantidad_recibida || 0);
                                                const pendiente = solicitado - recibido;
                                                const esTotal = recibido >= solicitado;

                                                return (
                                                    <tr key={d.id} className={esTotal ? 'bg-light text-muted' : ''}>
                                                        <td className="ps-4">
                                                            <div className={`fw-bold ${esTotal ? 'text-muted' : 'text-dark'}`}>{d.insumo}</div>
                                                            <small className="text-muted font-monospace">{d.codigo_sku}</small>
                                                        </td>
                                                        <td className="text-center">{solicitado}</td>
                                                        <td className="text-center">{recibido}</td>
                                                        <td className="text-center fw-bold">{Math.max(0, pendiente)}</td>
                                                        <td className="pe-4">
                                                            {!esTotal ? (
                                                                <input 
                                                                    type="number" 
                                                                    className="form-control text-center border-success fw-bold text-success shadow-sm"
                                                                    placeholder="0"
                                                                    min="0"
                                                                    max={pendiente}
                                                                    value={inputs[d.id] || ''}
                                                                    onChange={e => handleInputChange(d.id, e.target.value)}
                                                                />
                                                            ) : (
                                                                <div className="text-center text-success small fw-bold">
                                                                    <i className="bi bi-check-circle-fill me-1"></i> Completado
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            
                                            {!loading && orden?.detalles?.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="text-center text-muted py-4 fst-italic">No se encontraron items en esta orden.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer bg-white border-top-0 py-3">
                        <button className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>Cancelar</button>
                        <button className="btn btn-success fw-bold rounded-pill px-4 shadow-sm" onClick={handleSubmit} disabled={loading}>
                            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</> : <><i className="bi bi-check-lg me-2"></i>Confirmar Recepción</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecepcionCompraModal;