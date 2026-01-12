import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const BASE_URL_IMAGENES = 'http://localhost/INSUORDERS/public_html';

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

    useEffect(() => {
        if (show) {
            setSaving(false);
            api.get('/index.php/inventario/auxiliares')
                .then(res => {
                    if (res.data.success) {
                        setListas(res.data.data);
                        if (insumo) {
                            setFormData({
                                ...insumo,
                                stock_actual: parseInt(insumo.stock_actual) || 0,
                                stock_minimo: parseInt(insumo.stock_minimo) || 0,
                                precio_costo: parseInt(insumo.precio_costo) || 0,
                                categoria_id: insumo.categoria_id || '',
                                ubicacion_id: insumo.ubicacion_id || ''
                            });

                            // Imagen
                            if (insumo.imagen_url) {
                                const url = insumo.imagen_url.startsWith('http')
                                    ? insumo.imagen_url
                                    : `${BASE_URL_IMAGENES}${insumo.imagen_url}`;
                                setImagenPreview(url);
                            } else {
                                setImagenPreview(null);
                            }

                            // Sector
                            if (insumo.ubicacion_id && res.data.data.ubicaciones) {
                                const ubi = res.data.data.ubicaciones.find(u => u.id == insumo.ubicacion_id);
                                if (ubi) setSectorSeleccionado(ubi.sector_id);
                            }
                        } else {
                            // CREACIÓN
                            setFormData(initialState);
                            setSectorSeleccionado('');
                            setImagenFile(null);
                            setImagenPreview(null);
                        }
                    }
                });
        }
    }, [show, insumo]);

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
            Object.keys(formData).forEach(key => {
                if (key !== 'id') {
                    dataToSend.append(key, formData[key] ?? '');
                }
            });

            if (imagenFile) {
                dataToSend.append('imagen', imagenFile);
            }

            const config = { headers: { 'Content-Type': undefined } };

            if (insumo) {
                dataToSend.append('id', insumo.id);
                dataToSend.append('_method', 'PUT');
                await api.post('/index.php/inventario', dataToSend, config);
            } else {
                await api.post('/index.php/inventario', dataToSend, config);
            }

            onSave();
            onClose();
        } catch (error) {
            console.error("Error:", error);
            const msg = error.response?.data?.message || error.message;
            alert(`Error: ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title fw-bold">{insumo ? '✏️ Editar' : '✨ Nuevo'} Insumo</h5>
                        <button className="btn-close btn-close-white" onClick={onClose} disabled={saving}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">SKU</label>
                                    <input type="text" name="codigo_sku" className="form-control font-monospace" required value={formData.codigo_sku} onChange={handleChange} />
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label small fw-bold">Nombre</label>
                                    <input type="text" name="nombre" className="form-control" required value={formData.nombre} onChange={handleChange} />
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label small text-muted">Descripción</label>
                                    <textarea name="descripcion" className="form-control" rows="3" value={formData.descripcion} onChange={handleChange}></textarea>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Imagen</label>
                                    <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
                                    {imagenPreview && <div className="mt-2 text-center"><img src={imagenPreview} style={{ maxHeight: '80px' }} alt="Preview" /></div>}
                                </div>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Categoría</label>
                                    <select name="categoria_id" className="form-select" required value={formData.categoria_id} onChange={handleChange}>
                                        <option value="">Seleccione...</option>
                                        {listas.categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Sector</label>
                                    <select className="form-select" value={sectorSeleccionado} onChange={(e) => { setSectorSeleccionado(e.target.value); setFormData({ ...formData, ubicacion_id: '' }); }}>
                                        <option value="">Seleccione...</option>
                                        {listas.sectores && listas.sectores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Ubicación</label>
                                    <select name="ubicacion_id" className="form-select" required value={formData.ubicacion_id} onChange={handleChange} disabled={!sectorSeleccionado}>
                                        <option value="">Seleccione...</option>
                                        {ubicacionesFiltradas.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                                    </select>
                                </div>
                            </div>

                            <h6 className="text-primary border-bottom pb-2 mb-3 fw-bold">Valores (Enteros)</h6>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Costo</label>
                                    <input type="number" name="precio_costo" className="form-control" step="1" min="0" value={parseInt(formData.precio_costo) || 0} onChange={handleChange} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold">Unidad</label>
                                    <select name="unidad_medida" className="form-select" value={formData.unidad_medida} onChange={handleChange}>
                                        <option value="UN">UN</option><option value="KG">KG</option><option value="MTS">MTS</option><option value="LTS">LTS</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-success">Stock Actual</label>
                                    <input type="number" name="stock_actual" className="form-control" step="1" min="0" value={parseInt(formData.stock_actual) || 0} onChange={handleChange} />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold text-danger">Mínimo</label>
                                    <input type="number" name="stock_minimo" className="form-control" step="1" min="0" value={parseInt(formData.stock_minimo) || 0} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer bg-light">
                            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
                            <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InsumoModal;