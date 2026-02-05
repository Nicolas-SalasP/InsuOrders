import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const ProveedorModal = ({ show, onClose, onSave, proveedorEditar, readOnly = false }) => {
    const [formData, setFormData] = useState({
        rut: '',
        nombre: '',
        nombre_fantasia: '',
        giro: '',
        direccion: '',
        telefono: '',
        email: '',
        web: '',
        contacto_vendedor: '',
        pais_id: '',
        region_id: '',
        comuna_id: '',
        tipo_venta_id: ''
    });

    const [listas, setListas] = useState({
        paises: [],
        regiones: [],
        comunas: [],
        tipos_venta: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            cargarAuxiliares();
        }
    }, [show]);

    useEffect(() => {
        if (proveedorEditar) {
            setFormData({
                rut: proveedorEditar.rut || '',
                nombre: proveedorEditar.razon_social || proveedorEditar.nombre || '',
                nombre_fantasia: proveedorEditar.nombre_fantasia || '',
                giro: proveedorEditar.rubro || proveedorEditar.giro || '',
                direccion: proveedorEditar.direccion || '',
                telefono: proveedorEditar.telefono_contacto || proveedorEditar.telefono || '',
                email: proveedorEditar.email_contacto || proveedorEditar.email || '',
                web: proveedorEditar.sitio_web || proveedorEditar.web || '',
                contacto_vendedor: proveedorEditar.contacto_vendedor || '',
                pais_id: proveedorEditar.pais_id || '',
                region_id: proveedorEditar.region_id || '',
                comuna_id: proveedorEditar.comuna_id || '',
                tipo_venta_id: proveedorEditar.tipo_venta_id || ''
            });
        } else {
            setFormData({
                rut: '', nombre: '', nombre_fantasia: '', giro: '', direccion: '',
                telefono: '', email: '', web: '', contacto_vendedor: '',
                pais_id: '', region_id: '', comuna_id: '', tipo_venta_id: ''
            });
        }
        setError('');
    }, [proveedorEditar, show]);

    const cargarAuxiliares = async () => {
        try {
            const res = await api.get('/index.php/proveedores/auxiliares');
            if (res.data.success) {
                setListas(res.data.data);
            }
        } catch (e) {
            console.error("Error cargando listas", e);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'pais_id' ? { region_id: '', comuna_id: '' } : {}),
            ...(name === 'region_id' ? { comuna_id: '' } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (readOnly) return;

        setLoading(true);
        setError('');

        try {
            const payload = { ...formData };
            payload.razon_social = formData.nombre; 
            
            let res;
            if (proveedorEditar) {
                res = await api.put(`/index.php/proveedores?id=${proveedorEditar.id}`, payload);
            } else {
                res = await api.post('/index.php/proveedores', payload);
            }

            if (res.data.success) {
                onSave();
                onClose();
            } else {
                setError(res.data.message || 'Error al guardar');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const regionesFiltradas = listas.regiones.filter(r => !formData.pais_id || r.pais_id == formData.pais_id);
    const comunasFiltradas = listas.comunas.filter(c => !formData.region_id || c.region_id == formData.region_id);

    if (!show) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content border-0 shadow-lg">
                    
                    <div className={`modal-header ${readOnly ? 'bg-info text-white' : proveedorEditar ? 'bg-primary text-white' : 'bg-success text-white'}`}>
                        <h5 className="modal-title fw-bold">
                            {readOnly 
                                ? <><i className="bi bi-eye-fill me-2"></i>Detalle del Proveedor</>
                                : proveedorEditar 
                                    ? <><i className="bi bi-pencil-square me-2"></i>Editar Proveedor</>
                                    : <><i className="bi bi-plus-circle me-2"></i>Nuevo Proveedor</>
                            }
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={loading}></button>
                    </div>

                    <div className="modal-body p-4">
                        {error && <div className="alert alert-danger py-2"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}

                        <form id="formProveedor" onSubmit={handleSubmit}>
                            <h6 className="text-primary fw-bold mb-3 text-uppercase border-bottom pb-2">Identificación</h6>
                            
                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">RUT <span className="text-danger">*</span></label>
                                    <input 
                                        type="text" className="form-control" name="rut" 
                                        value={formData.rut} onChange={handleChange} required 
                                        placeholder="12.345.678-9"
                                        disabled={readOnly}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label small fw-bold">Razón Social <span className="text-danger">*</span></label>
                                    <input 
                                        type="text" className="form-control" name="nombre" 
                                        value={formData.nombre} onChange={handleChange} required 
                                        disabled={readOnly}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Nombre Fantasía</label>
                                    <input 
                                        type="text" className="form-control" name="nombre_fantasia" 
                                        value={formData.nombre_fantasia} onChange={handleChange} 
                                        disabled={readOnly}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Giro / Rubro</label>
                                    <input 
                                        type="text" className="form-control" name="giro" 
                                        value={formData.giro} onChange={handleChange} 
                                        disabled={readOnly}
                                    />
                                </div>
                            </div>

                            <h6 className="text-primary fw-bold mb-3 text-uppercase border-bottom pb-2">Ubicación y Facturación</h6>
                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">País</label>
                                    <select className="form-select" name="pais_id" value={formData.pais_id} onChange={handleChange} disabled={readOnly}>
                                        <option value="">Seleccione...</option>
                                        {listas.paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Región</label>
                                    <select className="form-select" name="region_id" value={formData.region_id} onChange={handleChange} disabled={readOnly || !formData.pais_id}>
                                        <option value="">Seleccione...</option>
                                        {regionesFiltradas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Comuna</label>
                                    <select className="form-select" name="comuna_id" value={formData.comuna_id} onChange={handleChange} disabled={readOnly || !formData.region_id}>
                                        <option value="">Seleccione...</option>
                                        {comunasFiltradas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold">Dirección</label>
                                    <input type="text" className="form-control" name="direccion" value={formData.direccion} onChange={handleChange} disabled={readOnly} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Condición de Venta</label>
                                    <select className="form-select" name="tipo_venta_id" value={formData.tipo_venta_id} onChange={handleChange} disabled={readOnly}>
                                        <option value="">Seleccione...</option>
                                        {listas.tipos_venta.map(t => <option key={t.id} value={t.id}>{t.descripcion}</option>)}
                                    </select>
                                </div>
                            </div>

                            <h6 className="text-primary fw-bold mb-3 text-uppercase border-bottom pb-2">Contacto</h6>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Nombre Contacto</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light"><i className="bi bi-person"></i></span>
                                        <input type="text" className="form-control" name="contacto_vendedor" value={formData.contacto_vendedor} onChange={handleChange} disabled={readOnly} />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Teléfono</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light"><i className="bi bi-telephone"></i></span>
                                        <input type="text" className="form-control" name="telefono" value={formData.telefono} onChange={handleChange} disabled={readOnly} />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Email</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light"><i className="bi bi-envelope"></i></span>
                                        <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} disabled={readOnly} />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Sitio Web</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light"><i className="bi bi-globe"></i></span>
                                        <input type="text" className="form-control" name="web" value={formData.web} onChange={handleChange} placeholder="www.ejemplo.com" disabled={readOnly} />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="modal-footer bg-light">
                        <button type="button" className="btn btn-secondary px-4" onClick={onClose} disabled={loading}>
                            {readOnly ? 'Cerrar' : 'Cancelar'}
                        </button>
                        {!readOnly && (
                            <button type="submit" form="formProveedor" className="btn btn-primary px-4 fw-bold" disabled={loading}>
                                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="bi bi-save me-2"></i>Guardar</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProveedorModal;