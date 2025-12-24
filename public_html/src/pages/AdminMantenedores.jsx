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
    const [modalType, setModalType] = useState('');
    const [formData, setFormData] = useState({});

    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });

    useEffect(() => {
        cargarTodo();
    }, []);

    const cargarTodo = async () => {
        setLoading(true);
        try {
            const [resEmp, resCC, resAreas] = await Promise.all([
                api.get('/index.php/mantenedores/empleados'),
                api.get('/index.php/mantenedores/centros'),
                api.get('/index.php/mantenedores/areas')
            ]);
            if (resEmp.data.success) setEmpleados(resEmp.data.data);
            if (resCC.data.success) setCentros(resCC.data.data);
            if (resAreas.data.success) setAreas(resAreas.data.data);
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
            if (type === 'empleado') setFormData({ rut: '', nombre_completo: '', centro_costo_id: '', activo: 1 });
            if (type === 'centro') setFormData({ codigo: '', nombre: '', alias: '', area_negocio_id: '' });
            if (type === 'area') setFormData({ codigo: '', nombre: '' });
        }
        setShowModal(true);
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm("¿Seguro de eliminar/desactivar este registro?")) return;
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
        <div className="d-flex flex-column h-100">
            <div className="d-flex justify-content-end mb-3">
                <button
                    className="btn btn-primary shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-center py-2 px-3"
                    onClick={() => handleOpenModal('empleado')}
                >
                    <i className="bi bi-person-plus-fill fs-5 mb-1 mb-md-0 me-md-2"></i>
                    <span className="small fw-bold">Nuevo Empleado</span>
                </button>
            </div>
            <div className="table-responsive border rounded bg-white">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="ps-4">RUT</th>
                            <th>Nombre Completo</th>
                            <th>Centro Costo</th>
                            <th>Estado</th>
                            <th className="text-end pe-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {empleados.map(e => (
                            <tr key={e.id}>
                                <td className="ps-4 font-monospace">{e.rut}</td>
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
                                <td className="text-end pe-4">
                                    <button className="btn btn-sm btn-link text-primary" onClick={() => handleOpenModal('empleado', e)}><i className="bi bi-pencil"></i></button>
                                    <button className="btn btn-sm btn-link text-danger" onClick={() => handleDelete('empleado', e.id)} title="Desactivar"><i className="bi bi-person-x-fill"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // --- TABLA CENTROS DE COSTO ---
    const renderCentros = () => (
        <div className="d-flex flex-column h-100">
            <div className="d-flex justify-content-end mb-3">
                <button
                    className="btn btn-primary shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-center py-2 px-3"
                    onClick={() => handleOpenModal('centro')}
                >
                    <i className="bi bi-plus-lg fs-5 mb-1 mb-md-0 me-md-2"></i>
                    <span className="small fw-bold">Nuevo Centro</span>
                </button>
            </div>
            <div className="table-responsive border rounded bg-white">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="ps-4">Código</th>
                            <th>Nombre</th>
                            <th>Alias</th>
                            <th>Área Negocio</th>
                            <th className="text-end pe-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {centros.map(c => (
                            <tr key={c.id}>
                                <td className="ps-4 fw-bold font-monospace">{c.codigo}</td>
                                <td>{c.nombre}</td>
                                <td>{c.alias || '-'}</td>
                                <td>
                                    {c.area_nombre ?
                                        <span className="badge bg-info text-dark bg-opacity-10 border border-info">{c.area_nombre}</span>
                                        : '-'}
                                </td>
                                <td className="text-end pe-4">
                                    <button className="btn btn-sm btn-link text-primary" onClick={() => handleOpenModal('centro', c)}><i className="bi bi-pencil"></i></button>
                                    <button className="btn btn-sm btn-link text-danger" onClick={() => handleDelete('centro', c.id)}><i className="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // --- TABLA ÁREAS DE NEGOCIO ---
    const renderAreas = () => (
        <div className="d-flex flex-column h-100">
            <div className="d-flex justify-content-end mb-3">
                <button
                    className="btn btn-primary shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-center py-2 px-3"
                    onClick={() => handleOpenModal('area')}
                >
                    <i className="bi bi-plus-lg fs-5 mb-1 mb-md-0 me-md-2"></i>
                    <span className="small fw-bold">Nueva Área</span>
                </button>
            </div>
            <div className="table-responsive border rounded bg-white">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="ps-4" style={{ width: '150px' }}>Código</th>
                            <th>Nombre Área</th>
                            <th className="text-end pe-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {areas.map(a => (
                            <tr key={a.id}>
                                <td className="ps-4 fw-bold font-monospace">{a.codigo}</td>
                                <td>{a.nombre}</td>
                                <td className="text-end pe-4">
                                    <button className="btn btn-sm btn-link text-primary" onClick={() => handleOpenModal('area', a)}><i className="bi bi-pencil"></i></button>
                                    <button className="btn btn-sm btn-link text-danger" onClick={() => handleDelete('area', a.id)}><i className="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="container-fluid p-3 p-md-4 h-100 d-flex flex-column">
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />

            <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary d-none d-sm-block">
                    <i className="bi bi-sliders fs-3"></i>
                </div>
                <div>
                    <h3 className="fw-bold text-dark mb-0">Configuración</h3>
                    <p className="text-muted small mb-0">Gestión de mantenedores del sistema</p>
                </div>
            </div>

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column overflow-hidden">
                <div className="card-header bg-white p-0 flex-shrink-0">
                    <ul className="nav nav-tabs card-header-tabs m-0">
                        <li className="nav-item">
                            <button className={`nav-link border-0 py-3 px-4 fw-bold ${activeTab === 'empleados' ? 'active text-primary border-bottom border-primary border-3' : 'text-secondary'}`}
                                onClick={() => setActiveTab('empleados')}>
                                <i className="bi bi-people-fill me-2"></i><span className="d-none d-sm-inline">Empleados</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link border-0 py-3 px-4 fw-bold ${activeTab === 'centros' ? 'active text-primary border-bottom border-primary border-3' : 'text-secondary'}`}
                                onClick={() => setActiveTab('centros')}>
                                <i className="bi bi-building me-2"></i><span className="d-none d-sm-inline">Centros de Costo</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link border-0 py-3 px-4 fw-bold ${activeTab === 'areas' ? 'active text-primary border-bottom border-primary border-3' : 'text-secondary'}`}
                                onClick={() => setActiveTab('areas')}>
                                <i className="bi bi-briefcase-fill me-2"></i><span className="d-none d-sm-inline">Áreas de Negocio</span>
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="card-body p-4 bg-light overflow-auto">
                    {loading ? <div className="text-center py-5"><div className="spinner-border text-primary"></div></div> : (
                        <>
                            {activeTab === 'empleados' && renderEmpleados()}
                            {activeTab === 'centros' && renderCentros()}
                            {activeTab === 'areas' && renderAreas()}
                        </>
                    )}
                </div>
            </div>
            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title fw-bold">
                                    {formData.id ? <i className="bi bi-pencil-square me-2"></i> : <i className="bi bi-plus-circle me-2"></i>}
                                    {formData.id ? 'Editar' : 'Crear'} {modalType === 'empleado' ? 'Empleado' : modalType === 'centro' ? 'Centro de Costo' : 'Área'}
                                </h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">

                                    {modalType === 'empleado' && (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold text-secondary small text-uppercase">RUT</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-person-vcard"></i></span>
                                                    <input type="text" className="form-control border-start-0 ps-0" required
                                                        value={formData.rut} onChange={e => setFormData({ ...formData, rut: e.target.value })}
                                                        placeholder="Ej: 12.345.678-9" />
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold text-secondary small text-uppercase">Nombre Completo</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-person"></i></span>
                                                    <input type="text" className="form-control border-start-0 ps-0" required
                                                        value={formData.nombre_completo} onChange={e => setFormData({ ...formData, nombre_completo: e.target.value })}
                                                        placeholder="Nombre y Apellido" />
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold text-secondary small text-uppercase">Centro de Costo</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-building"></i></span>
                                                    <select className="form-select border-start-0 ps-0" required
                                                        value={formData.centro_costo_id || ''} onChange={e => setFormData({ ...formData, centro_costo_id: e.target.value })}>
                                                        <option value="">-- Seleccione --</option>
                                                        {centros.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-check form-switch mt-4 p-3 border rounded bg-light d-flex align-items-center">
                                                <input className="form-check-input ms-0 me-3" type="checkbox" id="checkActivo"
                                                    checked={parseInt(formData.activo) === 1}
                                                    onChange={e => setFormData({ ...formData, activo: e.target.checked ? 1 : 0 })}
                                                    style={{ width: '3em', height: '1.5em' }}
                                                />
                                                <label className="form-check-label fw-bold text-dark" htmlFor="checkActivo">
                                                    {parseInt(formData.activo) === 1 ? 'Empleado Activo' : 'Empleado Inactivo'}
                                                </label>
                                            </div>
                                        </>
                                    )}

                                    {modalType === 'centro' && (
                                        <>
                                            <div className="row g-3 mb-3">
                                                <div className="col-6">
                                                    <label className="form-label fw-bold text-secondary small text-uppercase">Código</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-hash"></i></span>
                                                        <input type="text" className="form-control border-start-0 ps-0" required
                                                            value={formData.codigo} onChange={e => setFormData({ ...formData, codigo: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <label className="form-label fw-bold text-secondary small text-uppercase">Alias (Opc.)</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-tag"></i></span>
                                                        <input type="text" className="form-control border-start-0 ps-0"
                                                            value={formData.alias} onChange={e => setFormData({ ...formData, alias: e.target.value })} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold text-secondary small text-uppercase">Nombre</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-card-text"></i></span>
                                                    <input type="text" className="form-control border-start-0 ps-0" required
                                                        value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold text-secondary small text-uppercase">Área de Negocio</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-briefcase"></i></span>
                                                    <select className="form-select border-start-0 ps-0"
                                                        value={formData.area_negocio_id || ''} onChange={e => setFormData({ ...formData, area_negocio_id: e.target.value })}>
                                                        <option value="">-- Sin asignar --</option>
                                                        {areas.map(a => <option key={a.id} value={a.id}>{a.codigo} - {a.nombre}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {modalType === 'area' && (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold text-secondary small text-uppercase">Código</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-hash"></i></span>
                                                    <input type="text" className="form-control border-start-0 ps-0" required
                                                        value={formData.codigo} onChange={e => setFormData({ ...formData, codigo: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold text-secondary small text-uppercase">Nombre Área</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-briefcase"></i></span>
                                                    <input type="text" className="form-control border-start-0 ps-0" required
                                                        value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                </div>
                                <div className="modal-footer bg-light border-top-0">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                                        <i className="bi bi-x-circle me-2"></i>Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary px-4 fw-bold">
                                        <i className="bi bi-save me-2"></i>Guardar
                                    </button>
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