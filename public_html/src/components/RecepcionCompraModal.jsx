import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const RecepcionCompraModal = ({ show, onClose, ordenId, onSave }) => {
    const [detalles, setDetalles] = useState([]);
    const [inputs, setInputs] = useState({}); // { detalle_id: cantidad_a_ingresar }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show && ordenId) {
            cargarDetalles();
            setInputs({});
            setError('');
        }
    }, [show, ordenId]);

    const cargarDetalles = async () => {
        try {
            // Reutilizamos el endpoint de detalle que ya existe
            const res = await api.get(`/index.php/compras?id=${ordenId}`);
            if (res.data.success) {
                setDetalles(res.data.data.detalles);
            }
        } catch (e) {
            setError("Error al cargar detalles de la orden.");
        }
    };

    const handleInputChange = (id, valor) => {
        setInputs(prev => ({ ...prev, [id]: valor }));
    };

    const handleSubmit = async () => {
        // Filtrar solo items con cantidad > 0
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
            onSave(); // Refrescar tabla padre
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Error al procesar la recepción.");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content shadow">
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title"><i className="bi bi-truck me-2"></i>Recepción de Mercadería (OC #{ordenId})</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}
                        
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Insumo</th>
                                        <th className="text-center">Solicitado</th>
                                        <th className="text-center">Ya Recibido</th>
                                        <th className="text-center">Pendiente</th>
                                        <th className="text-center text-success" style={{width: '150px'}}>Llega Ahora</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detalles.map(d => {
                                        const solicitado = parseFloat(d.cantidad_solicitada);
                                        const recibido = parseFloat(d.cantidad_recibida || 0);
                                        const pendiente = solicitado - recibido;
                                        const esTotal = recibido >= solicitado;

                                        return (
                                            <tr key={d.id} className={esTotal ? 'table-success text-muted' : ''}>
                                                <td>
                                                    <div className="fw-bold">{d.insumo}</div>
                                                    <small className="text-muted">{d.codigo_sku}</small>
                                                </td>
                                                <td className="text-center">{solicitado}</td>
                                                <td className="text-center">{recibido}</td>
                                                <td className="text-center fw-bold">{Math.max(0, pendiente)}</td>
                                                <td>
                                                    {!esTotal && (
                                                        <input 
                                                            type="number" 
                                                            className="form-control text-center border-success fw-bold text-success"
                                                            placeholder="0"
                                                            min="0"
                                                            max={pendiente}
                                                            value={inputs[d.id] || ''}
                                                            onChange={e => handleInputChange(d.id, e.target.value)}
                                                        />
                                                    )}
                                                    {esTotal && <div className="text-center text-success small"><i className="bi bi-check-circle-fill"></i> OK</div>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="modal-footer bg-light">
                        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button className="btn btn-success fw-bold" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Procesando...' : 'Confirmar Recepción'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecepcionCompraModal;