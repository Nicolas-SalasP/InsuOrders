import { useState } from 'react';
import api from '../api/axiosConfig';

const ModalEntrada = ({ show, onClose, insumo, onSave }) => {
    const [cantidad, setCantidad] = useState('');
    const [observacion, setObservacion] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/index.php/inventario/ajuste', {
                insumo_id: insumo.id,
                cantidad: cantidad,
                tipo_movimiento_id: 3, // 3 = Ingreso
                observacion: observacion || 'Reposición manual'
            });
            onSave();
            onClose();
            setCantidad(''); setObservacion('');
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Desconocido"));
        } finally {
            setLoading(false);
        }
    };

    if (!show || !insumo) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg border-0">
                    
                    {/* Cabecera Verde (Entrada) */}
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title fw-bold">
                            <i className="bi bi-box-arrow-in-down me-2"></i>Reponer Stock
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            
                            {/* Tarjeta de Resumen del Producto */}
                            <div className="text-center mb-4 p-3 bg-light rounded border-start border-4 border-success">
                                <h5 className="fw-bold mb-1 text-dark">{insumo.nombre}</h5>
                                <div className="d-flex justify-content-center gap-2 mt-2">
                                    <span className="badge bg-white text-dark border">SKU: {insumo.codigo_sku}</span>
                                    <span className="badge bg-success bg-opacity-75">
                                        Actual: {insumo.stock_actual} {insumo.unidad_medida}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="row g-3">
                                {/* Campo Cantidad Grande */}
                                <div className="col-12">
                                    <label className="form-label fw-bold text-success small text-uppercase">Cantidad a Ingresar</label>
                                    <div className="input-group input-group-lg">
                                        <span className="input-group-text bg-white text-success border-success">
                                            <i className="bi bi-plus-lg"></i>
                                        </span>
                                        <input 
                                            type="number" 
                                            className="form-control fw-bold text-center border-success" 
                                            placeholder="0" 
                                            required 
                                            min="0.01" 
                                            step="0.01" 
                                            autoFocus
                                            value={cantidad} 
                                            onChange={e => setCantidad(e.target.value)} 
                                        />
                                    </div>
                                </div>
                                
                                {/* Campo Nota Grande (Textarea) */}
                                <div className="col-12">
                                    <label className="form-label small text-uppercase text-muted">Nota / Observación</label>
                                    <textarea 
                                        className="form-control" 
                                        rows="3" 
                                        placeholder="Ej: Compra #123, Devolución de taller..."
                                        value={observacion} 
                                        onChange={e => setObservacion(e.target.value)} 
                                        style={{ resize: 'none' }}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer bg-light border-top-0">
                            <button type="submit" className="btn btn-success w-100 py-2 shadow-sm" disabled={loading}>
                                {loading ? (
                                    <span><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</span>
                                ) : (
                                    <span className="fw-bold">
                                        <i className="bi bi-check-lg me-2"></i>CONFIRMAR INGRESO
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalEntrada;