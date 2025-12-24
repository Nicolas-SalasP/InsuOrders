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

    const handleExportar = () => {
        api.get('/index.php/exportar?modulo=usuarios', { responseType: 'blob' })
            .then((res) => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Usuarios_${new Date().toISOString().slice(0,10)}.xlsx`);
                document.body.appendChild(link);
                link.click();
            })
            .catch(() => alert("Error al exportar"));
    };

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            
            <UsuarioModal show={showModal} onClose={()=>setShowModal(false)} onSave={cargarUsuarios} usuarioEditar={usuarioEditar} />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                
                {/* --- ENCABEZADO MEJORADO RESPONSIVO --- */}
                <div className="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 flex-shrink-0">
                    
                    {/* Título con Icono Destacado */}
                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary d-none d-sm-block">
                             <i className="bi bi-people-gear fs-3"></i>
                        </div>
                        <h4 className="mb-0 fw-bold text-dark">Gestión de Usuarios</h4>
                    </div>
                    
                    {/* Botones Adaptables: Cuadrados en móvil, Normales en PC */}
                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                        
                        {/* Botón Exportar */}
                        <button 
                            className="btn btn-outline-success shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-center py-2 px-3"
                            onClick={handleExportar} 
                            title="Exportar a Excel"
                        >
                            <i className="bi bi-file-earmark-excel fs-5 mb-1 mb-md-0 me-md-2"></i>
                            <span className="small fw-bold">Exportar</span>
                        </button>
                        
                        {/* Botón Nuevo Usuario (Destacado Azul) */}
                        <button 
                            className="btn btn-primary shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-center py-2 px-3"
                            onClick={handleNew}
                        >
                            <i className="bi bi-person-plus-fill fs-5 mb-1 mb-md-0 me-md-2"></i>
                            <span className="small fw-bold">Nuevo Usuario</span>
                        </button>
                    </div>
                </div>

                <div className="card-body p-0 flex-grow-1 overflow-auto">
                    <table className="table table-hover align-middle mb-0" style={{ minWidth: '800px' }}>
                        <thead className="bg-light sticky-top">
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
                                    <td className="ps-4 fw-bold text-primary">{u.username}</td>
                                    <td>{u.nombre} {u.apellido}</td>
                                    <td>{u.email}</td>
                                    <td><span className="badge bg-secondary fw-normal border">{u.rol}</span></td>
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