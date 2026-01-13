import { useEffect, useState, useContext } from 'react';
import api from '../api/axiosConfig';
import AuthContext from '../context/AuthContext';
import NuevaCotizacionModal from '../components/NuevaCotizacionModal';
import ConfirmModal from '../components/ConfirmModal';

const Cotizaciones = () => {
    const { auth } = useContext(AuthContext);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [confirmacion, setConfirmacion] = useState({
        show: false,
        id: null,
        accion: null,
        title: '',
        message: '',
        type: 'primary'
    });

    const [users, setUsers] = useState([]);
    const [estados, setEstados] = useState([]);
    const [filtros, setFiltros] = useState({
        id: '',
        estado_id: '',
        start: '',
        end: '',
        usuario: ''
    });

    const can = (permiso) => {
        if (auth.rol === 'Admin' || auth.rol === 1) return true;
        return auth.permisos && auth.permisos.includes(permiso);
    };

    useEffect(() => {
        cargarDatos();
        api.get('/index.php/usuarios').then(res => { if (res.data.success) setUsers(res.data.data); });
        api.get('/index.php/cotizaciones/estados-lista').then(res => { if (res.data.success) setEstados(res.data.data); });
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filtros.id) params.append('id', filtros.id);
        if (filtros.estado_id) params.append('estado', filtros.estado_id);
        if (filtros.start) params.append('start', filtros.start);
        if (filtros.end) params.append('end', filtros.end);
        if (filtros.usuario) params.append('usuario', filtros.usuario);

        try {
            const res = await api.get(`/index.php/cotizaciones?${params.toString()}`);
            if (res.data.success) setData(res.data.data);
        } catch (error) { console.error("Error cargando cotizaciones", error); }
        finally { setLoading(false); }
    };

    const solicitarCambioEstado = (id, accion) => {
        const esAprobar = accion === 'APROBAR';
        setConfirmacion({
            show: true,
            id: id,
            accion: accion,
            title: esAprobar ? 'Aprobar Cotización' : 'Rechazar Cotización',
            message: `¿Estás seguro de que deseas ${esAprobar ? 'aprobar' : 'rechazar'} la cotización #${id}? Esta acción no se puede deshacer.`,
            type: esAprobar ? 'primary' : 'danger'
        });
    };

    const ejecutarAccion = async () => {
        const { id, accion } = confirmacion;
        try {
            await api.post('/index.php/cotizaciones/estado', { id, accion });
            cargarDatos();
        } catch (error) {
            console.error("Error al actualizar estado:", error);
        } finally {
            setConfirmacion({ ...confirmacion, show: false });
        }
    };

    const descargarPdf = async (id) => {
        setDownloading(true);
        try {
            const response = await api.get(`/index.php/cotizaciones/pdf?id=${id}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Cotizacion_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error al descargar PDF", error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            <NuevaCotizacionModal show={showModal} onClose={() => setShowModal(false)} onSave={cargarDatos} />
            <ConfirmModal
                show={confirmacion.show}
                onClose={() => setConfirmacion({ ...confirmacion, show: false })}
                onConfirm={ejecutarAccion}
                title={confirmacion.title}
                message={confirmacion.message}
                type={confirmacion.type}
                confirmText="Sí, continuar"
                cancelText="Cancelar"
            />

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h3 className="fw-bold text-dark mb-0"><i className="bi bi-calculator me-2"></i>Gestión de Cotizaciones</h3>
                    <p className="text-muted small mb-0">Administra y aprueba las cotizaciones de compra</p>
                </div>
                {can('cot_crear') && (
                    <button className="btn btn-primary shadow-sm fw-bold px-4" onClick={() => setShowModal(true)}>
                        <i className="bi bi-plus-lg me-2"></i>Nueva Cotización
                    </button>
                )}
            </div>

            {/* FILTROS */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-white rounded">
                    <h6 className="text-muted small fw-bold text-uppercase mb-3">Filtros de Búsqueda</h6>
                    <div className="row g-2">
                        <div className="col-6 col-md-2">
                            <input type="text" className="form-control form-control-sm" placeholder="ID Cotización" value={filtros.id} onChange={e => setFiltros({ ...filtros, id: e.target.value })} />
                        </div>
                        <div className="col-6 col-md-2">
                            <select className="form-select form-select-sm" value={filtros.estado_id} onChange={e => setFiltros({ ...filtros, estado_id: e.target.value })}>
                                <option value="">Todos los Estados</option>
                                {estados.map(est => <option key={est.id} value={est.id}>{est.nombre}</option>)}
                            </select>
                        </div>
                        <div className="col-6 col-md-2"><input type="date" className="form-control form-control-sm" value={filtros.start} onChange={e => setFiltros({ ...filtros, start: e.target.value })} /></div>
                        <div className="col-6 col-md-2"><input type="date" className="form-control form-control-sm" value={filtros.end} onChange={e => setFiltros({ ...filtros, end: e.target.value })} /></div>
                        <div className="col-12 col-md-2">
                            <select className="form-select form-select-sm" value={filtros.usuario} onChange={e => setFiltros({ ...filtros, usuario: e.target.value })}>
                                <option value="">Creado por...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>)}
                            </select>
                        </div>
                        <div className="col-12 col-md-2"><button className="btn btn-secondary btn-sm w-100 fw-bold" onClick={cargarDatos}><i className="bi bi-search me-2"></i>Buscar</button></div>
                    </div>
                </div>
            </div>

            {/* TABLA */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr className="text-uppercase small text-muted">
                                    <th className="ps-4">Folio</th>
                                    <th>Fecha</th>
                                    <th>Solicitante</th>
                                    <th className="text-center">Ítems</th>
                                    <th className="text-center">Estado</th>
                                    <th className="text-end pe-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? <tr><td colSpan="6" className="text-center py-5">Cargando...</td></tr> :
                                    data.length === 0 ? <tr><td colSpan="6" className="text-center py-5">Sin registros.</td></tr> :
                                        data.map(cot => (
                                            <tr key={cot.id}>
                                                <td className="ps-4 fw-bold text-dark">#{cot.id}</td>
                                                <td>{new Date(cot.fecha_creacion).toLocaleDateString()}</td>
                                                <td><div className="fw-bold text-dark small">{cot.creador_nombre} {cot.creador_apellido}</div></td>
                                                <td className="text-center"><span className="badge bg-light text-dark border">{cot.items_count}</span></td>
                                                <td className="text-center">
                                                    <span className={`badge px-3 py-2 rounded-pill ${cot.estado_nombre === 'Aprobada' ? 'bg-success' :
                                                            cot.estado_nombre === 'Rechazada' ? 'bg-danger' : 'bg-warning text-dark'
                                                        }`}>{cot.estado_nombre}</span>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <div className="btn-group">
                                                        <button className="btn btn-sm btn-outline-secondary" title="Descargar PDF" onClick={() => descargarPdf(cot.id)} disabled={downloading}>
                                                            {downloading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-file-earmark-pdf"></i>}
                                                        </button>

                                                        {parseInt(cot.estado_id) === 1 && (
                                                            <>
                                                                {can('cot_aprobar') && (
                                                                    <button className="btn btn-sm btn-outline-success" title="Aprobar" onClick={() => solicitarCambioEstado(cot.id, 'APROBAR')}>
                                                                        <i className="bi bi-check-lg"></i>
                                                                    </button>
                                                                )}
                                                                {can('cot_anular') && (
                                                                    <button className="btn btn-sm btn-outline-danger" title="Rechazar" onClick={() => solicitarCambioEstado(cot.id, 'RECHAZAR')}>
                                                                        <i className="bi bi-x-lg"></i>
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Cotizaciones;