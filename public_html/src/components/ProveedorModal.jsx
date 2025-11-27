import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const ProveedorModal = ({ show, onClose, proveedorEditar, onSave }) => {
    // Estado del formulario
    const [formData, setFormData] = useState({
        rut: '', nombre: '', direccion: '', email: '', telefono: '', 
        contacto_vendedor: '', tipo_venta_id: '', 
        pais_id: '', region_id: '', comuna_id: ''
    });
    const [archivo, setArchivo] = useState(null);

    // Listas maestras
    const [listas, setListas] = useState({ 
        tipos_venta: [], paises: [], regiones: [], comunas: [] 
    });
    
    // Listas filtradas para los selects en cascada
    const [regionesFiltradas, setRegionesFiltradas] = useState([]);
    const [comunasFiltradas, setComunasFiltradas] = useState([]);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // 1. Cargar auxiliares al abrir
    useEffect(() => {
        if (show) {
            api.get('/index.php/proveedores/auxiliares').then(res => {
                if (res.data.success) setListas(res.data.data);
            });
            setErrorMsg('');
            setArchivo(null);
        }
    }, [show]);

    // 2. Rellenar datos si es edición
    useEffect(() => {
        if (proveedorEditar && show) {
            // Nota: Asegúrate que el backend devuelva pais_id y region_id en el getAll()
            // Si no vienen, tendrás que deducirlos o hacer que el backend los envíe.
            // He actualizado el getAll del repo para enviarlos.
            setFormData({
                rut: proveedorEditar.rut,
                nombre: proveedorEditar.nombre,
                direccion: proveedorEditar.direccion || '',
                email: proveedorEditar.email || '',
                telefono: proveedorEditar.telefono || '',
                contacto_vendedor: proveedorEditar.contacto_vendedor || '',
                tipo_venta_id: proveedorEditar.tipo_venta_id || '',
                pais_id: proveedorEditar.pais_id || '',
                region_id: proveedorEditar.region_id || '',
                comuna_id: proveedorEditar.comuna_id || ''
            });
        } else if (!proveedorEditar) {
            setFormData({ rut: '', nombre: '', direccion: '', email: '', telefono: '', contacto_vendedor: '', tipo_venta_id: '', pais_id: '', region_id: '', comuna_id: '' });
        }
    }, [proveedorEditar, show]);

    // 3. Efecto Cascada: País -> Región
    useEffect(() => {
        if (formData.pais_id) {
            const regs = listas.regiones.filter(r => r.pais_id == formData.pais_id);
            setRegionesFiltradas(regs);
        } else {
            setRegionesFiltradas([]);
        }
    }, [formData.pais_id, listas.regiones]);

    // 4. Efecto Cascada: Región -> Comuna
    useEffect(() => {
        if (formData.region_id) {
            const coms = listas.comunas.filter(c => c.region_id == formData.region_id);
            setComunasFiltradas(coms);
        } else {
            setComunasFiltradas([]);
        }
    }, [formData.region_id, listas.comunas]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Resetear hijos al cambiar padres
        if (name === 'pais_id') setFormData(prev => ({...prev, [name]: value, region_id: '', comuna_id: ''}));
        if (name === 'region_id') setFormData(prev => ({...prev, [name]: value, comuna_id: ''}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        // Usamos FormData para enviar archivos y datos
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (archivo) data.append('documento', archivo);

        try {
            let url = '/index.php/proveedores';
            if (proveedorEditar) {
                url += '?id=' + proveedorEditar.id;
                // data.append('_method', 'PUT'); // Si tu backend requiere esto
            }

            const res = await api.post(url, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                onSave();
                onClose();
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.message || "Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
            <div className="modal-dialog modal-xl"> {/* modal-xl para más espacio */}
                <div className="modal-content shadow">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title fw-bold">
                            {proveedorEditar ? '✏️ Editar Proveedor' : '✨ Nuevo Proveedor'}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

                            <h6 className="text-muted border-bottom pb-2 mb-3">Información General</h6>
                            <div className="row g-3 mb-4">
                                <div className="col-md-3">
                                    <label className="form-label fw-bold">RUT *</label>
                                    <input type="text" name="rut" className="form-control" required 
                                        value={formData.rut} onChange={handleChange} 
                                        disabled={!!proveedorEditar} placeholder="12345678-9"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Razón Social *</label>
                                    <input type="text" name="nombre" className="form-control" required 
                                        value={formData.nombre} onChange={handleChange} placeholder="Nombre de la empresa"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Tipo de Venta *</label>
                                    <select name="tipo_venta_id" className="form-select" required
                                        value={formData.tipo_venta_id} onChange={handleChange}>
                                        <option value="">Seleccione...</option>
                                        {listas.tipos_venta.map(t => (
                                            <option key={t.id} value={t.id}>{t.descripcion}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <h6 className="text-muted border-bottom pb-2 mb-3">Ubicación (Cascada)</h6>
                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <label className="form-label">País</label>
                                    <select name="pais_id" className="form-select" required
                                        value={formData.pais_id} onChange={handleChange}>
                                        <option value="">Seleccione País...</option>
                                        {listas.paises.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Región</label>
                                    <select name="region_id" className="form-select" required disabled={!formData.pais_id}
                                        value={formData.region_id} onChange={handleChange}>
                                        <option value="">Seleccione Región...</option>
                                        {regionesFiltradas.map(r => (
                                            <option key={r.id} value={r.id}>{r.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Comuna</label>
                                    <select name="comuna_id" className="form-select" required disabled={!formData.region_id}
                                        value={formData.comuna_id} onChange={handleChange}>
                                        <option value="">Seleccione Comuna...</option>
                                        {comunasFiltradas.map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Dirección Exacta</label>
                                    <input type="text" name="direccion" className="form-control" 
                                        value={formData.direccion} onChange={handleChange} placeholder="Calle, número, oficina..."
                                    />
                                </div>
                            </div>

                            <h6 className="text-muted border-bottom pb-2 mb-3">Contacto y Documentación</h6>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label">Email</label>
                                    <input type="email" name="email" className="form-control" 
                                        value={formData.email} onChange={handleChange} 
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Teléfono</label>
                                    <input type="text" name="telefono" className="form-control" 
                                        value={formData.telefono} onChange={handleChange} 
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Contacto Vendedor</label>
                                    <input type="text" name="contacto_vendedor" className="form-control" 
                                        value={formData.contacto_vendedor} onChange={handleChange} 
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Subir Documento (Opcional)</label>
                                    <input type="file" className="form-control" 
                                        onChange={e => setArchivo(e.target.files[0])} 
                                    />
                                    <div className="form-text">Formatos: PDF, JPG, PNG.</div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer bg-light">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-success px-4" disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : '💾'} 
                                Guardar Proveedor
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProveedorModal;