import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';

const UsuarioModal = ({ show, onClose, onSave, usuarioEditar }) => {
    const initialData = { nombre: '', apellido: '', username: '', email: '', telefono: '', rol_id: '', password: '' };
    const [formData, setFormData] = useState(initialData);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        if (show) {
            api.get('/index.php/usuarios/roles').then(res => { if (res.data.success) setRoles(res.data.data); });
            if (usuarioEditar) setFormData({ ...usuarioEditar, password: '' });
            else setFormData(initialData);
        }
    }, [show, usuarioEditar]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (usuarioEditar) await api.put(`/index.php/usuarios?id=${usuarioEditar.id}`, formData);
            else await api.post('/index.php/usuarios', formData);
            onSave(); onClose();
        } catch (error) {
            setMsgModal({ show: true, title: "Error", message: error.response?.data?.message || "Error al guardar", type: "error" });
        } finally { setLoading(false); }
    };

    if (!show) return null;

    return (
        <>
            <MessageModal show={msgModal.show} onClose={() => setMsgModal({ ...msgModal, show: false })} title={msgModal.title} message={msgModal.message} type={msgModal.type} />
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                    <div className="modal-content shadow">
                        <div className="modal-header bg-dark text-white">
                            <h5 className="modal-title">{usuarioEditar ? 'Editar Usuario' : 'Nuevo Usuario'}</h5>
                            <button className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row g-2 mb-3">
                                    <div className="col-6"><label className="form-label small">Nombre</label><input type="text" className="form-control" required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} /></div>
                                    <div className="col-6"><label className="form-label small">Apellido</label><input type="text" className="form-control" required value={formData.apellido} onChange={e => setFormData({ ...formData, apellido: e.target.value })} /></div>
                                </div>
                                <div className="mb-3"><label className="form-label small">Email</label><input type="email" className="form-control" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                                <div className="row g-2 mb-3">
                                    <div className="col-6"><label className="form-label small">Usuario (Login)</label><input type="text" className="form-control" required disabled={!!usuarioEditar} value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} /></div>
                                    <div className="col-6"><label className="form-label small">Rol / Acceso</label><select className="form-select" required value={formData.rol_id} onChange={e => setFormData({ ...formData, rol_id: e.target.value })}><option value="">Seleccione...</option>{roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}</select></div>
                                </div>
                                <div className="mb-3"><label className="form-label small">{usuarioEditar ? 'Nueva Contraseña (Dejar en blanco para no cambiar)' : 'Contraseña *'}</label><input type="password" className="form-control" required={!usuarioEditar} placeholder={usuarioEditar ? "******" : ""} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} /></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={loading}>Guardar</button></div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UsuarioModal;