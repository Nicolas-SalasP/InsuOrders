import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const InsumoModal = ({ show, onClose, onSave }) => {
    // Estado inicial limpio
    const initialState = {
        codigo_sku: '', nombre: '', descripcion: '', 
        categoria_id: '', ubicacion_id: '', 
        stock_actual: 0, stock_minimo: 5, precio_costo: 0, unidad_medida: 'UN'
    };

    const [formData, setFormData] = useState(initialState);
    const [listas, setListas] = useState({ categorias: [], ubicaciones: [] });

    useEffect(() => {
        if (show) {
            // 1. Cargar listas
            api.get('/index.php/inventario/auxiliares').then(res => {
                if (res.data.success) setListas(res.data.data);
            });
            // 2. IMPORTANTE: Reiniciar formulario al abrir
            setFormData(initialState);
        }
    }, [show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/index.php/inventario', formData);
            if (res.data.success) {
                onSave();
                onClose();
            }
        } catch (error) {
            alert("Error: " + error.response?.data?.message);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title">Nuevo Artículo de Inventario</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row g-3">
                                {/* Mismos campos que tenías antes... */}
                                <div className="col-md-4">
                                    <label className="form-label">Código SKU *</label>
                                    <input type="text" className="form-control" required
                                        value={formData.codigo_sku} onChange={e => setFormData({...formData, codigo_sku: e.target.value})} />
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label">Nombre del Artículo *</label>
                                    <input type="text" className="form-control" required
                                        value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                                </div>
                                
                                <div className="col-md-6">
                                    <label className="form-label">Categoría</label>
                                    <select className="form-select" required
                                        value={formData.categoria_id} onChange={e => setFormData({...formData, categoria_id: e.target.value})}>
                                        <option value="">Seleccione...</option>
                                        {listas.categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Ubicación</label>
                                    <select className="form-select" required
                                        value={formData.ubicacion_id} onChange={e => setFormData({...formData, ubicacion_id: e.target.value})}>
                                        <option value="">Seleccione...</option>
                                        {listas.ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.codigo})</option>)}
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Stock Inicial</label>
                                    <input type="number" className="form-control" 
                                        value={formData.stock_actual} onChange={e => setFormData({...formData, stock_actual: e.target.value})} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Stock Mínimo</label>
                                    <input type="number" className="form-control" 
                                        value={formData.stock_minimo} onChange={e => setFormData({...formData, stock_minimo: e.target.value})} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label fw-bold text-primary">Costo Neto</label>
                                    <div className="input-group">
                                        <span className="input-group-text">$</span>
                                        <input type="number" className="form-control" step="0.01"
                                            value={formData.precio_costo} 
                                            onChange={e => setFormData({...formData, precio_costo: e.target.value})} 
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Unidad</label>
                                    <select className="form-select"
                                        value={formData.unidad_medida} onChange={e => setFormData({...formData, unidad_medida: e.target.value})}>
                                        <option value="UN">Unidad</option>
                                        <option value="KG">Kilos</option>
                                        <option value="MTS">Metros</option>
                                        <option value="LTS">Litros</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InsumoModal;