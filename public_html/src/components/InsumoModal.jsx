import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal'; 

const BASE_URL_IMAGENES = '/api';

const InsumoModal = ({ show, onClose, onSave, insumo }) => {
    const initialState = {
        codigo_sku: '', nombre: '', descripcion: '',
        categoria_id: '', ubicacion_id: '',
        stock_actual: 0, stock_minimo: 5,
        precio_costo: 0, moneda: 'CLP', unidad_medida: 'UN'
    };

    const [formData, setFormData] = useState(initialState);
    const [imagenFile, setImagenFile] = useState(null);
    const [imagenPreview, setImagenPreview] = useState(null);
    const [listas, setListas] = useState({ categorias: [], sectores: [], ubicaciones: [] });
    const [sectorSeleccionado, setSectorSeleccionado] = useState('');
    const [ubicacionesFiltradas, setUbicacionesFiltradas] = useState([]);
    const [saving, setSaving] = useState(false);
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        if (show) {
            setSaving(false);
            
            // 1. Cargar Listas Auxiliares (Categorías, Sectores, Ubicaciones)
            api.get('/index.php/inventario/auxiliares')
                .then(res => {
                    if (res.data.success) {
                        setListas(res.data.data);
                        
                        if (insumo) {
                            // --- MODO EDICIÓN ---
                            setFormData({
                                ...insumo,
                                stock_actual: parseInt(insumo.stock_actual) || 0,
                                stock_minimo: parseInt(insumo.stock_minimo) || 0,
                                precio_costo: parseInt(insumo.precio_costo) || 0,
                                categoria_id: insumo.categoria_id || '',
                                ubicacion_id: insumo.ubicacion_id || ''
                            });
                            
                            // Cargar imagen existente
                            if (insumo.imagen_url) {
                                const url = insumo.imagen_url.startsWith('http') ? insumo.imagen_url : `${BASE_URL_IMAGENES}${insumo.imagen_url}`;
                                setImagenPreview(url);
                            } else {
                                setImagenPreview(null);
                            }

                            // Preseleccionar Sector según la ubicación guardada
                            if (insumo.ubicacion_id && res.data.data.ubicaciones) {
                                const ubi = res.data.data.ubicaciones.find(u => u.id == insumo.ubicacion_id);
                                if (ubi) setSectorSeleccionado(ubi.sector_id);
                            }
                        } else {
                            // --- MODO CREAR ---
                            // 1. Resetear formulario
                            setFormData({ ...initialState, codigo_sku: 'Cargando...' }); // Feedback visual
                            setSectorSeleccionado('');
                            setImagenFile(null);
                            setImagenPreview(null);

                            // 2. Obtener el SIGUIENTE SKU REAL desde el servidor
                            api.get('/index.php/insumos/next-sku')
                                .then(resSku => {
                                    if (resSku.data.success) {
                                        setFormData(prev => ({ ...prev, codigo_sku: resSku.data.sku }));
                                    }
                                })
                                .catch(err => {
                                    console.error("Error obteniendo SKU:", err);
                                    setFormData(prev => ({ ...prev, codigo_sku: '' })); // Permitir escribir si falla
                                });
                        }
                    }
                })
                .catch(e => console.error(e));
        }
    }, [show, insumo]);

    // Filtrar Ubicaciones dinámicamente según el Sector seleccionado
    useEffect(() => {
        if (sectorSeleccionado && listas.ubicaciones.length > 0) {
            setUbicacionesFiltradas(listas.ubicaciones.filter(u => u.sector_id == sectorSeleccionado));
        } else {
            setUbicacionesFiltradas([]);
        }
    }, [sectorSeleccionado, listas.ubicaciones]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagenFile(file);
            setImagenPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const dataToSend = new FormData();
            
            // Añadir campos al FormData
            Object.keys(formData).forEach(key => { 
                if (key !== 'id') dataToSend.append(key, formData[key] ?? ''); 
            });
            
            if (imagenFile) dataToSend.append('imagen', imagenFile);

            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            
            if (insumo) {
                // UPDATE
                dataToSend.append('id', insumo.id);
                dataToSend.append('_method', 'PUT'); 
                await api.post('/index.php/inventario', dataToSend, config);
            } else {
                // CREATE
                await api.post('/index.php/inventario', dataToSend, config);
            }
            
            onSave();
            onClose();
        } catch (error) {
            setMsgModal({ show: true, title: "Error", message: error.response?.data?.message || error.message, type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    return (
        <>
            <MessageModal show={msgModal.show} onClose={() => setMsgModal({...msgModal, show: false})} title={msgModal.title} message={msgModal.message} type={msgModal.type} />
            
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto', zIndex: 1050 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg">
                        
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title fw-bold">
                                {insumo ? <><i className="bi bi-pencil-square me-2"></i>Editar Insumo</> : <><i className="bi bi-plus-circle me-2"></i>Nuevo Insumo</>}
                            </h5>
                            <button className="btn-close btn-close-white" onClick={onClose} disabled={saving}></button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body p-4">
                                <div className="row g-3 mb-4">
                                    
                                    {/* SKU (Solo Lectura - Cargado desde Backend) */}
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-secondary">SKU (Automático)</label>
                                        <input 
                                            type="text" 
                                            name="codigo_sku" 
                                            className="form-control font-monospace bg-light text-primary fw-bold" 
                                            readOnly 
                                            value={formData.codigo_sku} 
                                            placeholder="Generando..."
                                        />
                                    </div>
                                    
                                    {/* Nombre */}
                                    <div className="col-md-8">
                                        <label className="form-label small fw-bold text-secondary">Nombre <span className="text-danger">*</span></label>
                                        <input type="text" name="nombre" className="form-control" required value={formData.nombre} onChange={handleChange} autoFocus />
                                    </div>
                                    
                                    {/* Descripción */}
                                    <div className="col-md-8">
                                        <label className="form-label small text-muted">Descripción</label>
                                        <textarea name="descripcion" className="form-control" rows="3" value={formData.descripcion} onChange={handleChange}></textarea>
                                    </div>
                                    
                                    {/* Imagen */}
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-secondary">Imagen</label>
                                        <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
                                        {imagenPreview && (
                                            <div className="mt-2 text-center border rounded p-1 bg-light">
                                                <img src={imagenPreview} style={{ maxHeight: '80px', objectFit: 'contain' }} alt="Preview" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sección Ubicación */}
                                <h6 className="text-primary border-bottom pb-2 mb-3 fw-bold small text-uppercase">Ubicación y Categoría</h6>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold">Categoría <span className="text-danger">*</span></label>
                                        <select name="categoria_id" className="form-select" required value={formData.categoria_id} onChange={handleChange}>
                                            <option value="">Seleccione...</option>
                                            {listas.categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold">Sector (Bodega)</label>
                                        <select className="form-select" value={sectorSeleccionado} onChange={(e) => { setSectorSeleccionado(e.target.value); setFormData({ ...formData, ubicacion_id: '' }); }}>
                                            <option value="">Seleccione...</option>
                                            {listas.sectores && listas.sectores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold">Estantería / Ubicación</label>
                                        <select name="ubicacion_id" className="form-select" value={formData.ubicacion_id} onChange={handleChange} disabled={!sectorSeleccionado}>
                                            <option value="">Seleccione...</option>
                                            {ubicacionesFiltradas.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Sección Valores */}
                                <h6 className="text-primary border-bottom pb-2 mb-3 fw-bold small text-uppercase">Inventario y Costos</h6>
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold">Costo Unit.</label>
                                        <div className="input-group">
                                            <span className="input-group-text">$</span>
                                            <input type="number" name="precio_costo" className="form-control" step="1" min="0" value={parseInt(formData.precio_costo) || 0} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold">Unidad Medida</label>
                                        <select name="unidad_medida" className="form-select" value={formData.unidad_medida} onChange={handleChange}>
                                            <option value="UN">UN (Unidad)</option>
                                            <option value="KG">KG (Kilos)</option>
                                            <option value="MTS">MTS (Metros)</option>
                                            <option value="LTS">LTS (Litros)</option>
                                            <option value="CAJA">Caja</option>
                                            <option value="PAR">Par</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold text-success">Stock Inicial</label>
                                        <input type="number" name="stock_actual" className="form-control fw-bold" step="1" min="0" value={parseInt(formData.stock_actual) || 0} onChange={handleChange} disabled={!!insumo} /> 
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold text-danger">Stock Mínimo</label>
                                        <input type="number" name="stock_minimo" className="form-control" step="1" min="0" value={parseInt(formData.stock_minimo) || 0} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="modal-footer bg-light border-0">
                                <button type="button" className="btn btn-secondary text-white" onClick={onClose} disabled={saving}>Cancelar</button>
                                <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm" disabled={saving}>
                                    {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="bi bi-save me-2"></i>Guardar Insumo</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InsumoModal;