import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MessageModal from '../components/MessageModal';

// Importamos los modales
import EmpleadoModal from '../components/EmpleadoModal';
import CentroModal from '../components/CentroModal';
import AreaModal from '../components/AreaModal';
import SectorModal from '../components/SectorModal';
import UbicacionModal from '../components/UbicacionModal';

const AdminMantenedores = () => {
    const [activeTab, setActiveTab] = useState('empleados');
    const [loading, setLoading] = useState(false);
    
    // Datos de las listas
    const [empleados, setEmpleados] = useState([]);
    const [centros, setCentros] = useState([]);
    const [areas, setAreas] = useState([]);
    const [sectores, setSectores] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [usuarios, setUsuarios] = useState([]); // Para vincular usuario de sistema

    // Control de Modales
    const [modales, setModales] = useState({
        empleado: { show: false, data: null },
        centro: { show: false, data: null },
        area: { show: false, data: null },
        sector: { show: false, data: null },
        ubicacion: { show: false, data: null }
    });

    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });

    useEffect(() => { cargarDatos(); }, [activeTab]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            // Carga de datos inteligente según la pestaña activa
            if (activeTab === 'empleados') {
                const [resE, resC, resU] = await Promise.all([
                    api.get('/index.php/mantenedores/empleados'),
                    api.get('/index.php/mantenedores/centros'),
                    api.get('/index.php/usuarios')
                ]);
                if (resE.data.success) setEmpleados(resE.data.data);
                if (resC.data.success) setCentros(resC.data.data);
                if (resU.data.success) setUsuarios(resU.data.data);
            } 
            else if (activeTab === 'centros') {
                const [resC, resA] = await Promise.all([
                    api.get('/index.php/mantenedores/centros'),
                    api.get('/index.php/mantenedores/areas')
                ]);
                if (resC.data.success) setCentros(resC.data.data);
                if (resA.data.success) setAreas(resA.data.data);
            }
            else if (activeTab === 'areas') {
                const res = await api.get('/index.php/mantenedores/areas');
                if (res.data.success) setAreas(res.data.data);
            }
            else if (activeTab === 'sectores') {
                const res = await api.get('/index.php/mantenedores/sectores');
                if (res.data.success) setSectores(res.data.data);
            }
            else if (activeTab === 'ubicaciones') {
                const [resU, resS] = await Promise.all([
                    api.get('/index.php/mantenedores/ubicaciones'),
                    api.get('/index.php/mantenedores/sectores')
                ]);
                if (resU.data.success) setUbicaciones(resU.data.data);
                if (resS.data.success) setSectores(resS.data.data);
            }
        } catch (error) {
            console.error("Error cargando datos", error);
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (tipo, data = null) => setModales(prev => ({ ...prev, [tipo]: { show: true, data } }));
    const cerrarModal = (tipo) => setModales(prev => ({ ...prev, [tipo]: { show: false, data: null } }));

    const handleDelete = async (endpoint, id) => {
        if (!window.confirm("¿Seguro de eliminar o desactivar este registro?")) return;
        try {
            await api.delete(`/index.php/mantenedores/${endpoint}?id=${id}`);
            cargarDatos();
            setMsg({ show: true, title: "Éxito", text: "Registro actualizado.", type: "success" });
        } catch (error) {
            setMsg({ show: true, title: "Error", text: "No se pudo eliminar.", type: "error" });
        }
    };

    // Componente Header para las tablas
    const TableHeader = ({ title, btnAction, btnLabel }) => (
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-primary fw-bold mb-0">{title}</h5>
            <button className="btn btn-primary shadow-sm btn-sm px-3 fw-bold" onClick={btnAction}>
                <i className="bi bi-plus-lg me-2"></i>{btnLabel}
            </button>
        </div>
    );

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />

            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-0"><i className="bi bi-sliders me-2 text-primary"></i>Configuración</h3>
                    <p className="text-muted small mb-0">Gestión de tablas maestras del sistema</p>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white pt-3 px-3 pb-0 border-bottom">
                    <ul className="nav nav-tabs card-header-tabs border-0">
                        {['empleados', 'centros', 'areas', 'sectores', 'ubicaciones'].map(tab => (
                            <li className="nav-item" key={tab}>
                                <button 
                                    className={`nav-link fw-bold px-4 py-2 ${activeTab === tab ? 'active border-bottom-0 text-primary' : 'text-muted border-0'}`}
                                    onClick={() => setActiveTab(tab)}
                                    style={{ borderTop: activeTab === tab ? '3px solid #0d6efd' : 'none' }}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card-body p-4 bg-white" style={{ minHeight: '400px' }}>
                    {loading ? (
                        <div className="d-flex flex-column align-items-center justify-content-center py-5 opacity-50">
                            <div className="spinner-border text-primary mb-2" role="status"></div>
                            <span className="small fw-bold text-muted">Cargando datos...</span>
                        </div>
                    ) : (
                        <>
                            {/* --- EMPLEADOS --- */}
                            {activeTab === 'empleados' && (
                                <div className="animate__animated animate__fadeIn">
                                    <TableHeader title="Listado de Personal" btnAction={() => abrirModal('empleado')} btnLabel="Nuevo Empleado" />
                                    <div className="table-responsive rounded border">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-light text-secondary small text-uppercase">
                                                <tr>
                                                    <th className="ps-4">RUT</th>
                                                    <th>Nombre</th>
                                                    <th>Centro Costo</th>
                                                    <th className="text-center">Estado</th>
                                                    <th className="text-end pe-4">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {empleados.map(e => (
                                                    <tr key={e.id} className={e.activo == 0 ? 'bg-light text-muted' : ''}>
                                                        <td className="ps-4 font-monospace fw-bold text-primary">{e.rut}</td>
                                                        <td className="fw-500">
                                                            {e.nombre_completo}
                                                            {e.cargo && <div className="small text-muted fst-italic">{e.cargo}</div>}
                                                        </td>
                                                        <td><span className="badge bg-light text-dark border">{e.cc_codigo}</span> <span className="small">{e.cc_nombre}</span></td>
                                                        <td className="text-center">
                                                            {e.activo == 1 
                                                                ? <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">Activo</span> 
                                                                : <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3">Inactivo</span>}
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            <button className="btn btn-sm btn-light text-primary border me-1" onClick={() => abrirModal('empleado', e)}><i className="bi bi-pencil-square"></i></button>
                                                            {e.activo == 1 && <button className="btn btn-sm btn-light text-danger border" onClick={() => handleDelete('empleados', e.id)}><i className="bi bi-person-x"></i></button>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <EmpleadoModal show={modales.empleado.show} onClose={() => cerrarModal('empleado')} empleado={modales.empleado.data} centros={centros} usuarios={usuarios} onSave={cargarDatos} />
                                </div>
                            )}

                            {/* --- SECTORES --- */}
                            {activeTab === 'sectores' && (
                                <div className="animate__animated animate__fadeIn">
                                    <TableHeader title="Sectores / Bodegas" btnAction={() => abrirModal('sector')} btnLabel="Nuevo Sector" />
                                    <div className="table-responsive rounded border">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-light text-secondary small text-uppercase">
                                                <tr><th className="ps-4">Nombre</th><th>Código</th><th className="text-end pe-4">Acciones</th></tr>
                                            </thead>
                                            <tbody>
                                                {sectores.map(s => (
                                                    <tr key={s.id}>
                                                        <td className="ps-4 fw-bold">{s.nombre}</td>
                                                        <td><span className="badge bg-light text-dark border">{s.codigo || 'N/A'}</span></td>
                                                        <td className="text-end pe-4">
                                                            <button className="btn btn-sm btn-light text-primary border me-1" onClick={() => abrirModal('sector', s)}><i className="bi bi-pencil-square"></i></button>
                                                            <button className="btn btn-sm btn-light text-danger border" onClick={() => handleDelete('sectores', s.id)}><i className="bi bi-trash"></i></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <SectorModal show={modales.sector.show} onClose={() => cerrarModal('sector')} sector={modales.sector.data} onSave={cargarDatos} />
                                </div>
                            )}

                            {/* --- UBICACIONES --- */}
                            {activeTab === 'ubicaciones' && (
                                <div className="animate__animated animate__fadeIn">
                                    <TableHeader title="Ubicaciones Físicas" btnAction={() => abrirModal('ubicacion')} btnLabel="Nueva Ubicación" />
                                    <div className="table-responsive rounded border">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-light text-secondary small text-uppercase">
                                                <tr><th className="ps-4">Nombre</th><th>Código</th><th>Sector</th><th>Descripción</th><th className="text-end pe-4">Acciones</th></tr>
                                            </thead>
                                            <tbody>
                                                {ubicaciones.map(u => (
                                                    <tr key={u.id}>
                                                        <td className="ps-4 fw-bold text-primary">{u.nombre}</td>
                                                        <td><span className="badge bg-light text-dark border">{u.codigo || 'S/C'}</span></td>
                                                        <td><span className="badge bg-warning bg-opacity-10 text-dark border border-warning">{u.sector_nombre}</span></td>
                                                        <td className="small text-muted">{u.descripcion}</td>
                                                        <td className="text-end pe-4">
                                                            <button className="btn btn-sm btn-light text-primary border me-1" onClick={() => abrirModal('ubicacion', u)}><i className="bi bi-pencil-square"></i></button>
                                                            <button className="btn btn-sm btn-light text-danger border" onClick={() => handleDelete('ubicaciones', u.id)}><i className="bi bi-trash"></i></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <UbicacionModal show={modales.ubicacion.show} onClose={() => cerrarModal('ubicacion')} ubicacion={modales.ubicacion.data} sectores={sectores} onSave={cargarDatos} />
                                </div>
                            )}

                            {/* --- CENTROS Y AREAS (Mantenemos la lógica pero con el estilo nuevo) --- */}
                            {activeTab === 'centros' && (
                                <div className="animate__animated animate__fadeIn">
                                    <TableHeader title="Centros de Costo" btnAction={() => abrirModal('centro')} btnLabel="Nuevo Centro" />
                                    <div className="table-responsive rounded border">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-light text-secondary small text-uppercase">
                                                <tr><th className="ps-4">Código</th><th>Nombre</th><th>Alias</th><th>Área</th><th className="text-end pe-4">Acciones</th></tr>
                                            </thead>
                                            <tbody>
                                                {centros.map(c => (
                                                    <tr key={c.id}>
                                                        <td className="ps-4 fw-bold font-monospace text-dark">{c.codigo}</td>
                                                        <td>{c.nombre}</td>
                                                        <td>{c.alias || '-'}</td>
                                                        <td>{c.area_nombre || '-'}</td>
                                                        <td className="text-end pe-4">
                                                            <button className="btn btn-sm btn-light text-primary border me-1" onClick={() => abrirModal('centro', c)}><i className="bi bi-pencil-square"></i></button>
                                                            <button className="btn btn-sm btn-light text-danger border" onClick={() => handleDelete('centros', c.id)}><i className="bi bi-trash"></i></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <CentroModal show={modales.centro.show} onClose={() => cerrarModal('centro')} centro={modales.centro.data} areas={areas} onSave={cargarDatos} />
                                </div>
                            )}

                            {activeTab === 'areas' && (
                                <div className="animate__animated animate__fadeIn">
                                    <TableHeader title="Áreas de Negocio" btnAction={() => abrirModal('area')} btnLabel="Nueva Área" />
                                    <div className="table-responsive rounded border">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-light text-secondary small text-uppercase">
                                                <tr><th className="ps-4">Código</th><th>Nombre</th><th className="text-end pe-4">Acciones</th></tr>
                                            </thead>
                                            <tbody>
                                                {areas.map(a => (
                                                    <tr key={a.id}>
                                                        <td className="ps-4 fw-bold font-monospace">{a.codigo}</td>
                                                        <td>{a.nombre}</td>
                                                        <td className="text-end pe-4">
                                                            <button className="btn btn-sm btn-light text-primary border me-1" onClick={() => abrirModal('area', a)}><i className="bi bi-pencil-square"></i></button>
                                                            <button className="btn btn-sm btn-light text-danger border" onClick={() => handleDelete('areas', a.id)}><i className="bi bi-trash"></i></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <AreaModal show={modales.area.show} onClose={() => cerrarModal('area')} area={modales.area.data} onSave={cargarDatos} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMantenedores;