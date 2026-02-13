import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MessageModal from '../components/MessageModal';
import { usePermission } from '../hooks/usePermission';

// Importamos los modales
import EmpleadoModal from '../components/EmpleadoModal';
import CentroModal from '../components/CentroModal';
import AreaModal from '../components/AreaModal';
import SectorModal from '../components/SectorModal';
import UbicacionModal from '../components/UbicacionModal';
import UbicacionEnvioModal from '../components/UbicacionEnvioModal';
import CategoriaModal from '../components/CategoriaModal';

const AdminMantenedores = () => {
    const { can } = usePermission();
    const [activeTab, setActiveTab] = useState('empleados');
    const [loading, setLoading] = useState(false);
    
    // Datos de las listas
    const [empleados, setEmpleados] = useState([]);
    const [centros, setCentros] = useState([]);
    const [areas, setAreas] = useState([]);
    const [sectores, setSectores] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [ubicacionesEnvio, setUbicacionesEnvio] = useState([]);
    const [categorias, setCategorias] = useState([]); 
    const [usuarios, setUsuarios] = useState([]);

    // Control de Modales
    const [modales, setModales] = useState({
        empleado: { show: false, data: null },
        centro: { show: false, data: null },
        area: { show: false, data: null },
        sector: { show: false, data: null },
        ubicacion: { show: false, data: null },
        ubicacionEnvio: { show: false, data: null },
        categoria: { show: false, data: null }
    });

    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });

    useEffect(() => { cargarDatos(); }, [activeTab]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
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
            else if (activeTab === 'lugares_envio') {
                const res = await api.get('/index.php/mantenedores/ubicaciones-envio');
                if (res.data.success) setUbicacionesEnvio(res.data.data);
            }
            else if (activeTab === 'categorias') {
                const res = await api.get('/index.php/categorias');
                if (res.data.success) setCategorias(res.data.data);
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
        
        // Ajuste para ruta de categorías que está en la raíz del router
        const urlBase = endpoint === 'categorias' ? '/index.php/' : '/index.php/mantenedores/';
        
        try {
            await api.delete(`${urlBase}${endpoint}?id=${id}`);
            cargarDatos();
            setMsg({ show: true, title: "Éxito", text: "Registro eliminado/actualizado.", type: "success" });
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.message || "No se pudo eliminar.", type: "error" });
        }
    };

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

            {/* MODALES */}
            <EmpleadoModal show={modales.empleado.show} onClose={() => cerrarModal('empleado')} onSave={cargarDatos} empleado={modales.empleado.data} centros={centros} usuarios={usuarios} />
            <CentroModal show={modales.centro.show} onClose={() => cerrarModal('centro')} onSave={cargarDatos} centro={modales.centro.data} areas={areas} />
            <AreaModal show={modales.area.show} onClose={() => cerrarModal('area')} onSave={cargarDatos} area={modales.area.data} />
            <SectorModal show={modales.sector.show} onClose={() => cerrarModal('sector')} onSave={cargarDatos} sector={modales.sector.data} />
            <UbicacionModal show={modales.ubicacion.show} onClose={() => cerrarModal('ubicacion')} onSave={cargarDatos} ubicacion={modales.ubicacion.data} sectores={sectores} />
            <UbicacionEnvioModal show={modales.ubicacionEnvio.show} onClose={() => cerrarModal('ubicacionEnvio')} onSave={cargarDatos} data={modales.ubicacionEnvio.data} />
            <CategoriaModal show={modales.categoria.show} onClose={() => cerrarModal('categoria')} onSave={cargarDatos} data={modales.categoria.data} />

            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-0"><i className="bi bi-sliders me-2 text-primary"></i>Configuración</h3>
                    <p className="text-muted small mb-0">Gestión de tablas maestras del sistema</p>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white pt-3 px-3 pb-0 border-bottom">
                    <ul className="nav nav-tabs card-header-tabs border-0">
                        {[
                            {id: 'empleados', label: 'Empleados', show: true},
                            {id: 'centros', label: 'Centros Costo', show: true},
                            {id: 'areas', label: 'Áreas', show: true},
                            {id: 'sectores', label: 'Sectores (Bodegas)', show: true},
                            {id: 'ubicaciones', label: 'Estanterías', show: true},
                            {id: 'lugares_envio', label: 'Lugares de Envío', show: true},
                            {id: 'categorias', label: 'Categorías', show: can('ver_categorias')}
                        ].filter(t => t.show).map(tab => (
                            <li className="nav-item" key={tab.id}>
                                <button 
                                    className={`nav-link fw-bold px-4 py-2 ${activeTab === tab.id ? 'active border-bottom-0 text-primary' : 'text-muted border-0'}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{ borderTop: activeTab === tab.id ? '3px solid #0d6efd' : 'none' }}
                                >
                                    {tab.label}
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
                                </div>
                            )}

                            {/* --- UBICACIONES (Estanterías) --- */}
                            {activeTab === 'ubicaciones' && (
                                <div className="animate__animated animate__fadeIn">
                                    <TableHeader title="Ubicaciones Físicas (Estanterías)" btnAction={() => abrirModal('ubicacion')} btnLabel="Nueva Estantería" />
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
                                </div>
                            )}

                            {/* --- CENTROS --- */}
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
                                </div>
                            )}

                            {/* --- AREAS --- */}
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
                                </div>
                            )}

                            {/* --- LUGARES DE ENVÍO --- */}
                            {activeTab === 'lugares_envio' && (
                                <div className="animate__animated animate__fadeIn">
                                    <TableHeader title="Lugares de Envío (Destinos)" btnAction={() => abrirModal('ubicacionEnvio')} btnLabel="Nuevo Lugar" />
                                    <div className="table-responsive rounded border">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-light text-secondary small text-uppercase">
                                                <tr>
                                                    <th className="ps-4">Nombre</th>
                                                    <th>Descripción</th>
                                                    <th className="text-center">Estado</th>
                                                    <th className="text-end pe-4">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ubicacionesEnvio.map(u => (
                                                    <tr key={u.id} className={u.activo == 0 ? 'bg-light text-muted' : ''}>
                                                        <td className="ps-4 fw-bold text-dark">{u.nombre}</td>
                                                        <td className="small">{u.descripcion || '-'}</td>
                                                        <td className="text-center">
                                                            {u.activo == 1 
                                                                ? <span className="badge bg-success bg-opacity-10 text-success rounded-pill">Activo</span> 
                                                                : <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill">Inactivo</span>}
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            <button className="btn btn-sm btn-light text-primary border me-1" onClick={() => abrirModal('ubicacionEnvio', u)} title="Editar"><i className="bi bi-pencil-square"></i></button>
                                                            {u.activo == 1 && (
                                                                <button className="btn btn-sm btn-light text-danger border" onClick={() => handleDelete('ubicaciones-envio', u.id)} title="Desactivar"><i className="bi bi-trash"></i></button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {ubicacionesEnvio.length === 0 && (
                                                    <tr><td colSpan="4" className="text-center py-4 text-muted">No hay lugares de envío registrados</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* --- CATEGORÍAS --- */}
                            {activeTab === 'categorias' && (
                                <div className="animate__animated animate__fadeIn">
                                    <TableHeader 
                                        title="Categorías de Insumos" 
                                        btnAction={() => can('crear_categorias') && abrirModal('categoria')} 
                                        btnLabel="Nueva Categoría" 
                                    />
                                    <div className="table-responsive rounded border">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-light text-secondary small text-uppercase">
                                                <tr>
                                                    <th className="ps-4" style={{width: '100px'}}>ID</th>
                                                    <th>Nombre</th>
                                                    <th className="text-end pe-4">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {categorias.map(cat => (
                                                    <tr key={cat.id}>
                                                        <td className="ps-4">
                                                            {/* Diseño tipo "Código" de estantería */}
                                                            <span className="badge bg-light text-dark border font-monospace">
                                                                #{cat.id}
                                                            </span>
                                                        </td>
                                                        <td className="fw-bold text-primary">
                                                            {/* Diseño tipo "Nombre" de estantería */}
                                                            {cat.nombre}
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            {can('editar_categorias') && (
                                                                <button className="btn btn-sm btn-light text-primary border me-1" onClick={() => abrirModal('categoria', cat)} title="Editar">
                                                                    <i className="bi bi-pencil-square"></i>
                                                                </button>
                                                            )}
                                                            {can('eliminar_categorias') && (
                                                                <button className="btn btn-sm btn-light text-danger border" onClick={() => handleDelete('categorias', cat.id)} title="Eliminar">
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {categorias.length === 0 && (
                                                    <tr><td colSpan="3" className="text-center py-4 text-muted">No hay categorías registradas.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
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