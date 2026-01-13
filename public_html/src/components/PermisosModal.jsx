import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';

const PermisosModal = ({ show, onClose, usuarioId }) => {
    const [permisos, setPermisos] = useState([]);
    const [asignados, setAsignados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        if (show && usuarioId) cargarDatos();
    }, [show, usuarioId]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const resPermisos = await api.get('/index.php/permisos');
            const resAsignados = await api.get(`/index.php/usuarios/permisos?id=${usuarioId}`);
            if (resPermisos.data.success) setPermisos(resPermisos.data.data);
            if (resAsignados.data.success) {
                const ids = resAsignados.data.data.map(item => item.id || item);
                setAsignados(ids);
            }
        } catch (error) { console.error("Error cargando permisos", error); } finally { setLoading(false); }
    };

    const handleToggle = (permisoId) => {
        if (asignados.includes(permisoId)) setAsignados(asignados.filter(id => id !== permisoId));
        else setAsignados([...asignados, permisoId]);
    };

    const handleSave = async () => {
        setGuardando(true);
        try {
            await api.post('/index.php/usuarios/permisos/update', { usuario_id: usuarioId, permisos: asignados });
            onClose();
        } catch (error) {
            setMsgModal({ show: true, title: "Error", message: "Error al guardar permisos", type: "error" });
        } finally { setGuardando(false); }
    };

    const permisosPorModulo = permisos.reduce((acc, curr) => {
        const modulo = curr.modulo || 'General';
        if (!acc[modulo]) acc[modulo] = [];
        acc[modulo].push(curr);
        return acc;
    }, {});

    if (!show) return null;

    return (
        <>
            <MessageModal show={msgModal.show} onClose={() => setMsgModal({ ...msgModal, show: false })} title={msgModal.title} message={msgModal.message} type={msgModal.type} />
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header bg-warning text-dark"><h5 className="modal-title fw-bold"><i className="bi bi-shield-lock-fill me-2"></i>Gestión de Permisos</h5><button type="button" className="btn-close" onClick={onClose}></button></div>
                        <div className="modal-body p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            {loading ? <div className="text-center py-5"><div className="spinner-border text-primary"></div></div> : (
                                <div className="row">
                                    {Object.keys(permisosPorModulo).map(modulo => (
                                        <div key={modulo} className="col-md-6 mb-4">
                                            <h6 className="text-primary fw-bold text-uppercase border-bottom pb-2 mb-3">{modulo}</h6>
                                            <div className="d-flex flex-column gap-2">
                                                {permisosPorModulo[modulo].map(p => (
                                                    <div key={p.id} className="form-check form-switch">
                                                        <input className="form-check-input" type="checkbox" id={`perm-${p.id}`} checked={asignados.includes(p.id)} onChange={() => handleToggle(p.id)} style={{ cursor: 'pointer' }} />
                                                        <label className="form-check-label" htmlFor={`perm-${p.id}`} style={{ cursor: 'pointer' }}>{p.descripcion || p.nombre} <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>({p.codigo})</small></label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer bg-light"><button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button><button type="button" className="btn btn-primary px-4" onClick={handleSave} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar Cambios'}</button></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PermisosModal;