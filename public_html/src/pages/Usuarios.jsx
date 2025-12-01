import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import UsuarioModal from '../components/UsuarioModal';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [usuarioEditar, setUsuarioEditar] = useState(null);

    useEffect(() => { cargarUsuarios(); }, []);

    const cargarUsuarios = async () => {
        try {
            const res = await api.get('/index.php/usuarios');
            if(res.data.success) setUsuarios(res.data.data);
        } catch (e) { console.error(e); }
    };

    const handleToggle = async (id, estadoActual) => {
        const accion = estadoActual == 1 ? "Bloquear" : "Activar";
        if (!window.confirm(`¿Seguro que deseas ${accion} este usuario?`)) return;
        
        try {
            await api.post('/index.php/usuarios/toggle', { id });
            cargarUsuarios();
        } catch (e) { alert("Error al cambiar estado"); }
    };

    const handleEdit = (u) => { setUsuarioEditar(u); setShowModal(true); };
    const handleNew = () => { setUsuarioEditar(null); setShowModal(true); };

    return (
        <div className="container-fluid p-0 h-100 d-flex flex-column">
            <UsuarioModal show={showModal} onClose={()=>setShowModal(false)} onSave={cargarUsuarios} usuarioEditar={usuarioEditar} />

            <div className="card shadow-sm border-0 flex-grow-1">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 fw-bold text-dark"><i className="bi bi-people-gear me-2"></i>Gestión de Usuarios</h4>
                    <button className="btn btn-primary" onClick={handleNew}>+ Nuevo Usuario</button>
                </div>
                <div className="card-body p-0 overflow-auto">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">Usuario</th>
                                <th>Nombre Completo</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th className="text-end pe-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id} className={u.activo == 0 ? 'bg-light text-muted' : ''}>
                                    <td className="ps-4 fw-bold">{u.username}</td>
                                    <td>{u.nombre} {u.apellido}</td>
                                    <td>{u.email}</td>
                                    <td><span className="badge bg-secondary">{u.rol}</span></td>
                                    <td>
                                        {u.activo == 1 
                                            ? <span className="badge bg-success">Activo</span> 
                                            : <span className="badge bg-danger">Bloqueado</span>}
                                    </td>
                                    <td className="text-end pe-4">
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(u)} title="Editar">
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button 
                                            className={`btn btn-sm ${u.activo == 1 ? 'btn-outline-danger' : 'btn-outline-success'}`} 
                                            onClick={() => handleToggle(u.id, u.activo)}
                                            title={u.activo == 1 ? "Bloquear Acceso" : "Desbloquear"}
                                        >
                                            <i className={`bi ${u.activo == 1 ? 'bi-lock' : 'bi-unlock'}`}></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Usuarios;