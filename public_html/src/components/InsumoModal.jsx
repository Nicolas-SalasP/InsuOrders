import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const InsumoModal = ({ show, onClose, onSave }) => {
    const initialState = {
        codigo_sku: '', nombre: '', descripcion: '', 
        categoria_id: '', ubicacion_id: '', 
        stock_actual: 0, stock_minimo: 5, 
        precio_costo: 0, moneda: 'CLP', unidad_medida: 'UN'
    };

    const [formData, setFormData] = useState(initialState);
    
    // Agregamos 'sectores' a las listas disponibles
    const [listas, setListas] = useState({ categorias: [], sectores: [], ubicaciones: [] });
    
    // Estado para manejar el filtrado en cascada
    const [sectorSeleccionado, setSectorSeleccionado] = useState('');
    const [ubicacionesFiltradas, setUbicacionesFiltradas] = useState([]);

    useEffect(() => {
        if (show) {
            // Cargar auxiliares (Categorías, Sectores, Ubicaciones)
            api.get('/index.php/inventario/auxiliares').then(res => {
                if (res.data.success) {
                    setListas(res.data.data);
                }
            });
            setFormData(initialState);
            setSectorSeleccionado('');
            setUbicacionesFiltradas([]);
        }
    }, [show]);

    // Efecto para filtrar ubicaciones cuando cambia el sector
    useEffect(() => {
        if (sectorSeleccionado) {
            const filtradas = listas.ubicaciones.filter(u => u.sector_id == sectorSeleccionado);
            setUbicacionesFiltradas(filtradas);
        } else {
            setUbicacionesFiltradas([]);
        }
    }, [sectorSeleccionado, listas.ubicaciones]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/index.php/inventario', formData);
            if (res.data.success) {
                onSave();
                onClose();
            }
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Error desconocido"));
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title fw-bold">✨ Nuevo Producto / Insumo</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            
                            {/* Sección 1: Identificación */}
                            <h6 className="text-primary border-bottom pb-2 mb-3 fw-bold">Identificación</h6>
                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-uppercase">Código SKU</label>
                                    <input type="text" name="codigo_sku" className="form-control font-monospace" 
                                        placeholder="Ej: ELEC-001" required
                                        value={formData.codigo_sku} onChange={handleChange} />
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label small fw-bold text-uppercase">Nombre del Artículo</label>
                                    <input type="text" name="nombre" className="form-control" required
                                        placeholder="Ej: Cable THHN 12AWG Rojo"
                                        value={formData.nombre} onChange={handleChange} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small text-muted">Descripción (Opcional)</label>
                                    <textarea name="descripcion" className="form-control form-control-sm" rows="2"
                                        value={formData.descripcion} onChange={handleChange}></textarea>
                                </div>
                            </div>

                            {/* Sección 2: Clasificación y Ubicación (ACTUALIZADO) */}
                            <h6 className="text-primary border-bottom pb-2 mb-3 fw-bold">Clasificación y Ubicación</h6>
                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Categoría</label>
                                    <select name="categoria_id" className="form-select" required
                                        value={formData.categoria_id} onChange={handleChange}>
                                        <option value="">Seleccione...</option>
                                        {listas.categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>

                                {/* Selector de Sector (Padre) */}
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Sector / Área</label>
                                    <select className="form-select" 
                                        value={sectorSeleccionado} 
                                        onChange={(e) => {
                                            setSectorSeleccionado(e.target.value);
                                            setFormData(prev => ({ ...prev, ubicacion_id: '' })); // Resetear ubicación hija
                                        }}>
                                        <option value="">Seleccione Sector...</option>
                                        {listas.sectores && listas.sectores.map(s => (
                                            <option key={s.id} value={s.id}>{s.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Selector de Ubicación (Hijo) */}
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Ubicación Específica</label>
                                    <select name="ubicacion_id" className="form-select" required
                                        value={formData.ubicacion_id} 
                                        onChange={handleChange}
                                        disabled={!sectorSeleccionado} // Deshabilitar si no hay sector
                                    >
                                        <option value="">Seleccione Ubicación...</option>
                                        {ubicacionesFiltradas.map(u => (
                                            <option key={u.id} value={u.id}>{u.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Sección 3: Valores y Stock */}
                            <h6 className="text-primary border-bottom pb-2 mb-3 fw-bold">Valores y Stock Inicial</h6>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Costo Unitario (Neto)</label>
                                    <div className="input-group">
                                        <select className="form-select bg-light" style={{maxWidth: '90px'}} 
                                            name="moneda" value={formData.moneda} onChange={handleChange}>
                                            <option value="CLP">CLP</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="UF">UF</option>
                                        </select>
                                        <input type="number" name="precio_costo" className="form-control text-end" step="0.01" min="0"
                                            value={formData.precio_costo} onChange={handleChange} placeholder="0" />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold">Unidad Medida</label>
                                    <select name="unidad_medida" className="form-select"
                                        value={formData.unidad_medida} onChange={handleChange}>
                                        <option value="UN">Unidad (UN)</option>
                                        <option value="KG">Kilos (KG)</option>
                                        <option value="MTS">Metros (MTS)</option>
                                        <option value="LTS">Litros (LTS)</option>
                                        <option value="CJ">Caja (CJ)</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-success">Stock Inicial</label>
                                    <input type="number" name="stock_actual" className="form-control" min="0"
                                        value={formData.stock_actual} onChange={handleChange} />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold text-danger">Mínimo</label>
                                    <input type="number" name="stock_minimo" className="form-control" min="0"
                                        value={formData.stock_minimo} onChange={handleChange} />
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer bg-light">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-primary px-4">
                                <i className="bi bi-save me-2"></i>Guardar Producto
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InsumoModal;