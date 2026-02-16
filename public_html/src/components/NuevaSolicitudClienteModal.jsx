import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const NuevaSolicitudClienteModal = ({ show, onClose, onSave }) => {
    const [activos, setActivos] = useState([]);
    const [tipoTrabajo, setTipoTrabajo] = useState('general');
    
    // Nuevo estado para controlar la pantalla de éxito
    const [successId, setSuccessId] = useState(null); 

    const [form, setForm] = useState({
        descripcion: '',
        activo_id: '',
        prioridad: 'MEDIA',
        imagen: null
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            cargarActivos();
            // Resetear todo al abrir
            setTipoTrabajo('general'); 
            setForm({ descripcion: '', activo_id: '', prioridad: 'MEDIA', imagen: null });
            setSuccessId(null); 
        }
    }, [show]);

    const cargarActivos = async () => {
        try {
            const res = await api.get('/index.php/cliente/activos');
            if (res.data.success) setActivos(res.data.data);
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('descripcion', form.descripcion);
        formData.append('prioridad', form.prioridad);
        
        if (tipoTrabajo === 'activo' && form.activo_id) {
            formData.append('activo_id', form.activo_id);
        }

        if (form.imagen) formData.append('imagen', form.imagen);

        try {
            const res = await api.post('/index.php/cliente/solicitudes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data.success) {
                onSave(); // Recargamos la lista de fondo
                setSuccessId(res.data.id); // ¡Mostramos la pantalla de éxito!
            }
        } catch (error) {
            alert("Error: " + (error.response?.data?.error || "Error al crear solicitud"));
        } finally {
            setLoading(false);
        }
    };

    const handleCloseFinal = () => {
        setSuccessId(null);
        onClose();
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg">
                    
                    {/* --- VISTA DE ÉXITO (Cuando ya se creó) --- */}
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
                                Tu requerimiento ha sido ingresado al sistema correctamente. <br/>
                                Hemos enviado un comprobante a tu correo.
                            </p>

                            <button className="btn btn-success btn-lg w-100 shadow-sm" onClick={handleCloseFinal}>
                                Entendido, gracias
                            </button>
                        </div>
                    ) : (
                        
                        /* --- VISTA DE FORMULARIO (Normal) --- */
                        <>
                            <div className="modal-header bg-primary text-white border-0">
                                <h5 className="modal-title fw-bold"><i className="bi bi-plus-circle me-2"></i>Nueva Solicitud</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    
                                    {/* SELECCIÓN DE TIPO */}
                                    <div className="mb-4 text-center">
                                        <label className="form-label d-block fw-bold mb-2 text-muted text-uppercase small" style={{letterSpacing:'1px'}}>Tipo de Requerimiento</label>
                                        <div className="btn-group w-100" role="group">
                                            <input 
                                                type="radio" 
                                                className="btn-check" 
                                                name="tipoTrabajo" 
                                                id="tipoGeneral" 
                                                autoComplete="off" 
                                                checked={tipoTrabajo === 'general'}
                                                onChange={() => setTipoTrabajo('general')}
                                            />
                                            <label className={`btn py-3 ${tipoTrabajo === 'general' ? 'btn-primary' : 'btn-outline-primary'}`} htmlFor="tipoGeneral">
                                                <i className="bi bi-building fs-5 d-block mb-1"></i>
                                                Infraestructura
                                            </label>

                                            <input 
                                                type="radio" 
                                                className="btn-check" 
                                                name="tipoTrabajo" 
                                                id="tipoActivo" 
                                                autoComplete="off" 
                                                checked={tipoTrabajo === 'activo'}
                                                onChange={() => setTipoTrabajo('activo')}
                                            />
                                            <label className={`btn py-3 ${tipoTrabajo === 'activo' ? 'btn-primary' : 'btn-outline-primary'}`} htmlFor="tipoActivo">
                                                <i className="bi bi-gear-wide-connected fs-5 d-block mb-1"></i>
                                                Maquinaria
                                            </label>
                                        </div>
                                    </div>

                                    {/* SELECTOR DE MÁQUINA */}
                                    {tipoTrabajo === 'activo' && (
                                        <div className="mb-3 p-3 bg-light rounded border border-primary border-opacity-25">
                                            <label className="form-label fw-bold text-primary small text-uppercase">Selecciona la Máquina</label>
                                            <select 
                                                className="form-select border-primary" 
                                                value={form.activo_id} 
                                                required={tipoTrabajo === 'activo'}
                                                onChange={(e) => setForm({...form, activo_id: e.target.value})}
                                            >
                                                <option value="">-- Buscar Equipo --</option>
                                                {activos.map(act => (
                                                    <option key={act.id} value={act.id}>
                                                        {act.nombre} ({act.codigo_maquina})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* AYUDA VISUAL */}
                                    {tipoTrabajo === 'general' && (
                                        <div className="alert alert-light border mb-3 d-flex align-items-center">
                                            <i className="bi bi-info-circle-fill text-info fs-4 me-3"></i>
                                            <div className="small text-muted">
                                                Usa esta opción para: <strong>Pintura, Fontanería, Electricidad, Muebles, Aseo profundo, etc.</strong>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Descripción del Problema</label>
                                        <textarea 
                                            className="form-control" 
                                            rows="4" 
                                            required 
                                            value={form.descripcion} 
                                            onChange={(e) => setForm({...form, descripcion: e.target.value})}
                                            placeholder="Por favor sé lo más específico posible..."
                                        ></textarea>
                                    </div>

                                    <div className="row g-2">
                                        <div className="col-md-8">
                                            <label className="form-label fw-bold">Evidencia (Foto)</label>
                                            <input 
                                                type="file" 
                                                className="form-control" 
                                                accept="image/*"
                                                onChange={(e) => setForm({...form, imagen: e.target.files[0]})} 
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">Prioridad</label>
                                            <select 
                                                className="form-select" 
                                                value={form.prioridad} 
                                                onChange={(e) => setForm({...form, prioridad: e.target.value})}
                                            >
                                                <option value="BAJA">Baja</option>
                                                <option value="MEDIA">Media</option>
                                                <option value="ALTA">Alta</option>
                                                <option value="URGENTE">Urgente</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light">
                                    <button type="button" className="btn btn-link text-decoration-none text-muted" onClick={onClose}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary px-4 shadow-sm" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-send-fill me-2"></i>Crear Solicitud
                                            </>
                                        )}
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