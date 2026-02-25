import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const NuevaSolicitudClienteModal = ({ show, onClose, onSave }) => {
    const [activos, setActivos] = useState([]);
    const [tipoTrabajo, setTipoTrabajo] = useState('general');
    const [successId, setSuccessId] = useState(null); 
    const [showUrgentConfirm, setShowUrgentConfirm] = useState(false);

    const [form, setForm] = useState({
        titulo: '',
        descripcion: '',
        activo_id: '',
        prioridad: 'MEDIA',
        imagenes: [],
        ubicacion: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            cargarActivos();
            resetForm();
        }
    }, [show]);

    const resetForm = () => {
        setTipoTrabajo('general'); 
        setForm({ titulo: '', descripcion: '', activo_id: '', prioridad: 'MEDIA', imagenes: [], ubicacion: '' });
        setSuccessId(null);
        setShowUrgentConfirm(false);
    };

    const cargarActivos = async () => {
        try {
            const res = await api.get('/index.php/cliente/activos');
            if (res.data.success) setActivos(res.data.data);
        } catch (e) { console.error(e); }
    };

    const comprimirImagen = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                    }, 'image/jpeg', 0.3);
                };
            };
        });
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        setLoading(true);
        
        const processedFiles = await Promise.all(files.map(async (file) => {
            if (file.type.startsWith('image/')) {
                return await comprimirImagen(file);
            }
            return file;
        }));
        
        setForm(prev => ({ ...prev, imagenes: [...(prev.imagenes || []), ...processedFiles] }));
        setLoading(false);
    };

    const removeFile = (indexToRemove) => {
        setForm(prev => ({
            ...prev,
            imagenes: prev.imagenes.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handlePreSubmit = (e) => {
        e.preventDefault();
        if (form.prioridad === 'CRITICO') {
            setShowUrgentConfirm(true);
        } else {
            enviarDatosAlBackend();
        }
    };

    const enviarDatosAlBackend = async () => {
        setLoading(true);

        const formData = new FormData();
        formData.append('titulo', form.titulo);
        formData.append('descripcion', form.descripcion);
        formData.append('ubicacion', form.ubicacion);
        formData.append('prioridad', form.prioridad);
        
        if (tipoTrabajo === 'activo' && form.activo_id) {
            formData.append('activo_id', form.activo_id);
        }

        if (form.imagenes && form.imagenes.length > 0) {
            form.imagenes.forEach((file, index) => {
                formData.append(`evidencia_${index}`, file);
            });
        }

        try {
            const res = await api.post('/index.php/cliente/solicitudes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data.success) {
                onSave();
                setShowUrgentConfirm(false);
                setSuccessId(res.data.id);
            }
        } catch (error) {
            alert("Error: " + (error.response?.data?.error || "Error al crear solicitud"));
            setShowUrgentConfirm(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseFinal = () => {
        resetForm();
        onClose();
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content shadow-lg border-0">
                    {successId ? (
                        <div className="text-center p-5">
                            <div className="mb-4">
                                <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center" style={{width: '100px', height: '100px'}}>
                                    <i className="bi bi-check-lg text-success" style={{ fontSize: '4rem' }}></i>
                                </div>
                            </div>
                            <h2 className="fw-bold text-success mb-2">¡Solicitud Creada!</h2>
                            <h5 className="text-muted mb-4">Folio Nº <span className="text-dark fw-bold">{successId}</span></h5>
                            
                            <p className="text-muted small mb-4">
                                Tu requerimiento ha sido ingresado correctamente.<br/>
                                {form.prioridad === 'CRITICO' && <strong className="text-danger">El equipo ha sido notificado de la urgencia.</strong>}
                            </p>

                            <button className="btn btn-success btn-lg w-50 shadow-sm" onClick={handleCloseFinal}>
                                Entendido, gracias
                            </button>
                        </div>

                    ) : showUrgentConfirm ? (
                        <div className="text-center p-5 bg-warning bg-opacity-10 rounded">
                            <div className="mb-3">
                                <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '4rem' }}></i>
                            </div>
                            <h2 className="fw-bold text-dark mb-3">¿Confirmas la Urgencia?</h2>
                            
                            <div className="alert alert-warning border-warning text-start d-inline-block p-3 mb-4" style={{maxWidth: '500px'}}>
                                <p className="mb-2 fw-bold"><i className="bi bi-cone-striped me-2"></i>Consecuencias:</p>
                                <ul className="mb-0 small text-dark">
                                    <li>Se enviará una alerta inmediata a los encargados de mantencion y técnicos.</li>
                                    <li>Se detendrán otros trabajos en curso para atender este requerimiento.</li>
                                    <li>El uso injustificado de esta prioridad será auditado.</li>
                                </ul>
                            </div>

                            <p className="mb-4 fw-bold text-muted">
                                ¿Estás seguro de que este incidente requiere atención inmediata?
                            </p>

                            <div className="d-flex justify-content-center gap-3">
                                <button 
                                    className="btn btn-outline-secondary px-4" 
                                    onClick={() => setShowUrgentConfirm(false)}
                                    disabled={loading}
                                >
                                    Cancelar, no es tan urgente
                                </button>
                                <button 
                                    className="btn btn-danger px-4 fw-bold shadow-sm" 
                                    onClick={enviarDatosAlBackend}
                                    disabled={loading}
                                >
                                    {loading ? 'Procesando...' : 'SÍ, ES UNA EMERGENCIA'}
                                </button>
                            </div>
                        </div>

                    ) : (
                        <>
                            <div className="modal-header bg-primary text-white border-0 py-3">
                                <h5 className="modal-title fw-bold fs-4"><i className="bi bi-plus-circle me-2"></i>Nueva Solicitud</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                            </div>
                            <form onSubmit={handlePreSubmit}>
                                <div className="modal-body p-4">
                                    
                                    <div className="mb-4">
                                        <label className="form-label fw-bold text-muted small text-uppercase">¿Qué necesitas? (Título Breve)</label>
                                        <input 
                                            type="text" 
                                            className="form-control form-control-lg fs-4 fw-bold text-primary" 
                                            placeholder="Ej: Fuga de agua en baño"
                                            value={form.titulo}
                                            onChange={(e) => setForm({...form, titulo: e.target.value})}
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    <div className="mb-4 text-center">
                                        <label className="form-label d-block fw-bold mb-2 text-muted text-uppercase small" style={{letterSpacing:'1px'}}>Tipo de Requerimiento</label>
                                        <div className="btn-group w-100" role="group">
                                            <input type="radio" className="btn-check" name="tipoTrabajo" id="tipoGeneral" checked={tipoTrabajo === 'general'} onChange={() => setTipoTrabajo('general')} />
                                            <label className={`btn py-3 ${tipoTrabajo === 'general' ? 'btn-primary' : 'btn-outline-primary'}`} htmlFor="tipoGeneral">
                                                <i className="bi bi-building fs-5 d-block mb-1"></i> Infraestructura
                                            </label>

                                            <input type="radio" className="btn-check" name="tipoTrabajo" id="tipoActivo" checked={tipoTrabajo === 'activo'} onChange={() => setTipoTrabajo('activo')} />
                                            <label className={`btn py-3 ${tipoTrabajo === 'activo' ? 'btn-primary' : 'btn-outline-primary'}`} htmlFor="tipoActivo">
                                                <i className="bi bi-gear-wide-connected fs-5 d-block mb-1"></i> Maquinaria
                                            </label>
                                        </div>
                                    </div>

                                    {tipoTrabajo === 'activo' && (
                                        <div className="mb-3 p-3 bg-light rounded border border-primary border-opacity-25">
                                            <label className="form-label fw-bold text-primary small text-uppercase">Selecciona la Máquina</label>
                                            <select className="form-select border-primary" value={form.activo_id} required={tipoTrabajo === 'activo'} onChange={(e) => setForm({...form, activo_id: e.target.value})}>
                                                <option value="">-- Buscar Equipo --</option>
                                                {activos.map(act => (
                                                    <option key={act.id} value={act.id}>{act.nombre} ({act.codigo_maquina})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {tipoTrabajo === 'general' && (
                                        <div className="alert alert-light border mb-3 d-flex align-items-center">
                                            <i className="bi bi-info-circle-fill text-info fs-4 me-3"></i>
                                            <div className="small text-muted">Usa esta opción para: <strong>Pintura, Fontanería, Electricidad, Muebles, Aseo profundo, etc.</strong></div>
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Ubicación del trabajo</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Ej: Sala de reuniones piso 2, Bodega principal, etc." 
                                            value={form.ubicacion} 
                                            onChange={(e) => setForm({...form, ubicacion: e.target.value})} 
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Detalles Adicionales</label>
                                        <textarea className="form-control" rows="4" required value={form.descripcion} onChange={(e) => setForm({...form, descripcion: e.target.value})} placeholder="Por favor sé lo más específico posible..."></textarea>
                                    </div>

                                    <div className="row g-2">
                                        <div className="col-md-8">
                                            <label className="form-label fw-bold">Evidencia (Fotos o Videos)</label>
                                            <input 
                                                type="file" 
                                                className="form-control" 
                                                accept="image/*,video/*" 
                                                multiple 
                                                capture="environment"
                                                onChange={handleFileChange} 
                                            />
                                            {form.imagenes && form.imagenes.length > 0 && (
                                                <div className="d-flex flex-wrap gap-2 mt-2">
                                                    {form.imagenes.map((file, idx) => (
                                                        <span key={idx} className="badge bg-secondary d-flex align-items-center gap-2 p-2">
                                                            <i className={file.type.startsWith('video') ? "bi bi-film" : "bi bi-image"}></i> 
                                                            {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                                                            <i className="bi bi-x-circle-fill text-danger cursor-pointer fs-6 ms-1" onClick={() => removeFile(idx)}></i>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">Prioridad</label>
                                            <select 
                                                className={`form-select fw-bold ${form.prioridad === 'CRITICO' ? 'bg-danger text-white border-danger' : ''}`}
                                                value={form.prioridad} 
                                                onChange={(e) => setForm({...form, prioridad: e.target.value})}
                                            >
                                                <option value="BAJA" className="bg-white text-dark">Baja</option>
                                                <option value="MEDIA" className="bg-white text-dark">Media</option>
                                                <option value="ALTA" className="bg-white text-dark">Alta</option>
                                                <option value="CRITICO" className="bg-danger text-white fw-bold">🚨 CRÍTICO (URGENTE)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light">
                                    <button type="button" className="btn btn-link text-decoration-none text-muted" onClick={onClose}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary px-4 shadow-sm" disabled={loading}>
                                        {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-send-fill me-2"></i>}
                                        {loading ? 'Subiendo archivos...' : 'Crear Solicitud'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NuevaSolicitudClienteModal;