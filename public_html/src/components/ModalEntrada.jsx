import { useState } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';

const ModalEntrada = ({ show, onClose, insumo, onSave }) => {
    const [cantidad, setCantidad] = useState('');
    const [observacion, setObservacion] = useState('');
    const [loading, setLoading] = useState(false);
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/index.php/inventario/ajuste', {
                insumo_id: insumo.id,
                cantidad: cantidad,
                tipo_movimiento_id: 3,
                observacion: observacion || 'Ajuste positivo manual'
            });
            onSave();
            onClose();
            setCantidad(''); setObservacion('');
        } catch (error) {
            setMsgModal({ show: true, title: "Error", message: error.response?.data?.message || "Error al procesar", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    if (!show || !insumo) return null;

    return (
        <>
            <MessageModal show={msgModal.show} onClose={() => setMsgModal({...msgModal, show: false})} title={msgModal.title} message={msgModal.message} type={msgModal.type} />
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content shadow border-0">
                        <div className="modal-header bg-success text-white">
                            <h5 className="modal-title fw-bold"><i className="bi bi-box-arrow-in-down me-2"></i>Entrada / Ajuste (+)</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body p-4 text-center">
                                <h5 className="fw-bold text-dark">{insumo.nombre}</h5>
                                <div className="badge bg-light text-dark border mb-3">Actual: {insumo.stock_actual} {insumo.unidad_medida}</div>
                                <div className="form-floating mb-3">
                                    <input type="number" className="form-control fs-2 text-center fw-bold text-success" placeholder="0" required min="0.01" step="0.01" autoFocus value={cantidad} onChange={e => setCantidad(e.target.value)} />
                                    <label>Cantidad a Sumar</label>
                                </div>
                                <input type="text" className="form-control" placeholder="Motivo (Opcional)" value={observacion} onChange={e => setObservacion(e.target.value)} />
                            </div>
                            <div className="modal-footer border-0 justify-content-center pb-4">
                                <button type="submit" className="btn btn-success w-100 py-2 fw-bold" disabled={loading}>{loading ? 'Guardando...' : 'CONFIRMAR ENTRADA'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModalEntrada;