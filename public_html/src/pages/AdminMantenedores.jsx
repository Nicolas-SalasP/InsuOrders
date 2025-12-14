import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MessageModal from '../components/MessageModal';

const AdminMantenedores = () => {
    const [activeTab, setActiveTab] = useState('empleados');
    
    // Data Listas
    const [empleados, setEmpleados] = useState([]);
    const [centros, setCentros] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal & Form
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'empleado', 'centro', 'area'
    const [formData, setFormData] = useState({});
    
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });

    useEffect(() => {
        cargarTodo();
    }, []);

    const cargarTodo = async () => {
        setLoading(true);
        try {
            // Cargamos todo de una vez para tener las relaciones listas (ej: áreas para crear centros)
            const [resEmp, resCC, resAreas] = await Promise.all([
                api.get('/index.php/mantenedores/empleados'),
                api.get('/index.php/mantenedores/centros'),
                api.get('/index.php/mantenedores/areas')
            ]);
            if(resEmp.data.success) setEmpleados(resEmp.data.data);
            if(resCC.data.success) setCentros(resCC.data.data);
            if(resAreas.data.success) setAreas(resAreas.data.data);
        } catch (error) {
            console.error("Error cargando mantenedores", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (type, item = null) => {
        setModalType(type);
        if (item) {
            setFormData({ ...item }); 
        } else {
            // Resetear form según tipo
            if (type === 'empleado') setFormData({ rut: '', nombre_completo: '', centro_costo_id: '', activo: 1 });
            if (type === 'centro') setFormData({ codigo: '', nombre: '', alias: '', area_negocio_id: '' });
            if (type === 'area') setFormData({ codigo: '', nombre: '' });
        }
        setShowModal(true);
    };

    const handleDelete = async (type, id) => {
        if(!window.confirm("¿Seguro de eliminar/desactivar este registro?")) return;
        try {
            await api.delete(`/index.php/mantenedores/${type}?id=${id}`);
            cargarTodo();
            setMsg({ show: true, title: "Procesado", text: "Registro actualizado correctamente.", type: "success" });
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.error || "Error al eliminar", type: "error" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/index.php/mantenedores/${modalType}`, formData);
            setShowModal(false);
            cargarTodo();
            setMsg({ show: true, title: "Guardado", text: "Datos guardados correctamente.", type: "success" });
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.error || "Error al guardar.", type: "error" });
        }
    };

    // --- TABLA EMPLEADOS ---
    const renderEmpleados = () => (
        <div className="table-responsive">
            <button className="btn btn-primary mb-3 btn-sm fw-bold" onClick={() => handleOpenModal('empleado')}>
                <i className="bi bi-person-plus-fill me-2"></i>Nuevo Empleado
            </button>
            <table className="table table-hover align-middle border bg-white">
                <thead className="table-light">
                    <tr>
                        <th>RUT</th>
                        <th>Nombre Completo</th>
                        <th>Centro Costo</th>
                        <th>Estado</th>
                        <th className="text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map(e => (
                        <tr key={e.id}>
                            <td className="font-monospace">{e.rut}</td>
                            <td className="fw-bold">{e.nombre_completo}</td>
                            <td>
                                {e.cc_codigo ? 
                                    <span className="badge bg-light text-dark border">{e.cc_codigo} - {e.cc_nombre}</span> 
                                    : <span className="text-muted small">Sin asignar</span>
                                }
                            </td>
                            <td>
                                {parseInt(e.activo) === 1 ? 
                                    <span className="badge bg-success">Activo</span> : 
                                    <span className="badge bg-secondary">Inactivo</span>
                                }
                            </td>
                            <td className="text-end">
                                <button className="btn btn-sm btn-link text-primary" onClick={() => handleOpenModal('empleado', e)}><i className="bi bi-pencil"></i></button>
                                <button className="btn btn-sm btn-link text-danger" onClick={() => handleDelete('empleado', e.id)} title="Desactivar"><i className="bi bi-person-x-fill"></i></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // --- TABLA CENTROS DE COSTO ---
    const renderCentros = () => (
        <div className="table-responsive">
            <button className="btn btn-primary mb-3 btn-sm fw-bold" onClick={() => handleOpenModal('centro')}>
                <i className="bi bi-plus-lg me-2"></i>Nuevo Centro de Costo
            </button>
            <table className="table table-hover align-middle border bg-white">
                <thead className="table-light">
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Alias</th>
                        <th>Área Negocio</th>
                        <th className="text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {centros.map(c => (
                        <tr key={c.id}>
                            <td className="fw-bold font-monospace">{c.codigo}</td>
                            <td>{c.nombre}</td>
                            <td>{c.alias || '-'}</td>
                            <td>
                                {c.area_nombre ? 
                                    <span className="badge bg-info text-dark bg-opacity-10 border border-info">{c.area_nombre}</span> 
                                    : '-'}
                            </td>
                            <td className="text-end">
                                <button className="btn btn-sm btn-link text-primary" onClick={() => handleOpenModal('centro', c)}><i className="bi bi-pencil"></i></button>
                                <button className="btn btn-sm btn-link text-danger" onClick={() => handleDelete('centro', c.id)}><i className="bi bi-trash"></i></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // --- TABLA ÁREAS DE NEGOCIO ---
    const renderAreas = () => (
        <div className="table-responsive">
            <button className="btn btn-primary mb-3 btn-sm fw-bold" onClick={() => handleOpenModal('area')}>
                <i className="bi bi-plus-lg me-2"></i>Nueva Área de Negocio
            </button>
            <table className="table table-hover align-middle border bg-white">
                <thead className="table-light">
                    <tr>
                        <th style={{width: '150px'}}>Código</th>
                        <th>Nombre Área</th>
                        <th className="text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {areas.map(a => (
                        <tr key={a.id}>
                            <td className="fw-bold font-monospace">{a.codigo}</td>
                            <td>{a.nombre}</td>
                            <td className="text-end">
                                <button className="btn btn-sm btn-link text-primary" onClick={() => handleOpenModal('area', a)}><i className="bi bi-pencil"></i></button>
                                <button className="btn btn-sm btn-link text-danger" onClick={() => handleDelete('area', a.id)}><i className="bi bi-trash"></i></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="container-fluid p-4">
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark"><i className="bi bi-sliders me-2"></i>Configuración & Mantenedores</h3>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white p-0">
                    <ul className="nav nav-tabs card-header-tabs m-0">
                        <li className="nav-item">
                            <button className={`nav-link border-0 py-3 px-4 fw-bold ${activeTab === 'empleados' ? 'active text-primary border-bottom border-primary border-3' : 'text-secondary'}`} 
                                onClick={() => setActiveTab('empleados')}>
                                <i className="bi bi-people-fill me-2"></i>Empleados
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link border-0 py-3 px-4 fw-bold ${activeTab === 'centros' ? 'active text-primary border-bottom border-primary border-3' : 'text-secondary'}`} 
                                onClick={() => setActiveTab('centros')}>
                                <i className="bi bi-building me-2"></i>Centros de Costo
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link border-0 py-3 px-4 fw-bold ${activeTab === 'areas' ? 'active text-primary border-bottom border-primary border-3' : 'text-secondary'}`} 
                                onClick={() => setActiveTab('areas')}>
                                <i className="bi bi-briefcase-fill me-2"></i>Áreas de Negocio
                            </button>
                        </li>
                    </ul>
                </div>
                <div className="card-body p-4 bg-light">
                    {loading ? <div className="text-center py-5">Cargando datos...</div> : (
                        <>
                            {activeTab === 'empleados' && renderEmpleados()}
                            {activeTab === 'centros' && renderCentros()}
                            {activeTab === 'areas' && renderAreas()}
                        </>
                    )}
                </div>
            </div>

            {/* MODAL UNIFICADO */}
            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">
                                    {formData.id ? 'Editar' : 'Crear'} {modalType === 'empleado' ? 'Empleado' : modalType === 'centro' ? 'Centro de Costo' : 'Área'}
                                </h5>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    
                                    {/* --- FORMULARIO EMPLEADO --- */}
                                    {modalType === 'empleado' && (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">RUT</label>
                                                <input type="text" className="form-control" required 
                                                    value={formData.rut} onChange={e => setFormData({...formData, rut: e.target.value})} 
                                                    placeholder="Ej: 12.345.678-9"/>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Nombre Completo</label>
                                                <input type="text" className="form-control" required 
                                                    value={formData.nombre_completo} onChange={e => setFormData({...formData, nombre_completo: e.target.value})} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Centro de Costo</label>
                                                <select className="form-select" required
                                                    value={formData.centro_costo_id || ''} onChange={e => setFormData({...formData, centro_costo_id: e.target.value})}>
                                                    <option value="">-- Seleccione --</option>
                                                    {centros.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                                                </select>
                                            </div>
                                            <div className="form-check form-switch mt-3 p-3 border rounded bg-light">
                                                <input className="form-check-input" type="checkbox" id="checkActivo" 
                                                    checked={parseInt(formData.activo) === 1} 
                                                    onChange={e => setFormData({...formData, activo: e.target.checked ? 1 : 0})} 
                                                />
                                                <label className="form-check-label fw-bold" htmlFor="checkActivo">Empleado Activo</label>
                                            </div>
                                        </>
                                    )}

                                    {/* --- FORMULARIO CENTRO DE COSTO --- */}
                                    {modalType === 'centro' && (
                                        <>
                                            <div className="row g-2 mb-3">
                                                <div className="col-6">
                                                    <label className="form-label fw-bold">Código</label>
                                                    <input type="text" className="form-control" required 
                                                        value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} />
                                                </div>
                                                <div className="col-6">
                                                    <label className="form-label fw-bold">Alias (Opcional)</label>
                                                    <input type="text" className="form-control" 
                                                        value={formData.alias} onChange={e => setFormData({...formData, alias: e.target.value})} />
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Nombre</label>
                                                <input type="text" className="form-control" required 
                                                    value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Área de Negocio</label>
                                                <select className="form-select" 
                                                    value={formData.area_negocio_id || ''} onChange={e => setFormData({...formData, area_negocio_id: e.target.value})}>
                                                    <option value="">-- Sin asignar --</option>
                                                    {areas.map(a => <option key={a.id} value={a.id}>{a.codigo} - {a.nombre}</option>)}
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {/* --- FORMULARIO ÁREA DE NEGOCIO --- */}
                                    {modalType === 'area' && (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Código</label>
                                                <input type="text" className="form-control" required 
                                                    value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Nombre Área</label>
                                                <input type="text" className="form-control" required 
                                                    value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                                            </div>
                                        </>
                                    )}

                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary px-4 fw-bold">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMantenedores;