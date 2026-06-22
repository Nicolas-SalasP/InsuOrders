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
    const [listaInsumos, setListaInsumos] = useState([]);
    const [busquedaInsumo, setBusquedaInsumo] = useState('');
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

    const [filtros, setFiltros] = useState({
        id: '',
        estado_id: '',
        start: '',
        end: '',
        usuario: ''
    });
    const [previewModal, setPreviewModal] = useState({ show: false, data: null, loading: false });
    const [paginaActual, setPaginaActual] = useState(1);
    const ITEMS_POR_PAGINA = 50;

    const can = (permiso) => {
        if (auth.rol === 'Admin' || auth.rol === 1) return true;
        return auth.permisos && auth.permisos.includes(permiso);
    };

    useEffect(() => {
        cargarDatos();
        api.get('/index.php/usuarios').then(res => { if (res.data.success) setUsers(res.data.data); });
        api.get('/index.php/cotizaciones/estados-lista').then(res => { if (res.data.success) setEstados(res.data.data); });
        api.get('/index.php/insumos/lista').then(res => { if (res.data.success) setListaInsumos(res.data.data); });
    }, []);

    useEffect(() => { setPaginaActual(1); }, [data]);

    const cargarDatos = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filtros.id) params.append('id', filtros.id);
        if (filtros.estado_id) params.append('estado', filtros.estado_id);
        if (filtros.start) params.append('start', filtros.start);
        if (filtros.end) params.append('end', filtros.end);
        if (filtros.usuario) params.append('usuario', filtros.usuario);
        if (busquedaInsumo) params.append('insumo', busquedaInsumo);

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

    const verDetalle = async (id) => {
        setPreviewModal({ show: true, data: null, loading: true });
        try {
            const res = await api.get(`/index.php/cotizaciones/detalle?id=${id}`);
            if (res.data.success) {
                setPreviewModal({ show: true, data: res.data.data, loading: false });
            }
        } catch (e) {
            setPreviewModal({ show: false, data: null, loading: false });
        }
    };

    const cerrarPreview = () => setPreviewModal({ show: false, data: null, loading: false });

    return (
        <div className="container-fluid p-3 p-md-4 bg-light min-vh-100">
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

            {previewModal.show && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} onClick={cerrarPreview}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-calculator me-2"></i>
                                    {previewModal.data ? `Cotización #${previewModal.data.id}` : 'Cargando...'}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={cerrarPreview}></button>
                            </div>
                            <div className="modal-body p-3 p-md-4">
                                {previewModal.loading ? (
                                    <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                                ) : previewModal.data ? (() => {
                                    const cot = previewModal.data;
                                    // La cotizacion es una lista de insumos a solicitar (sin precios): no se muestra total estimado.
                                    const badgeClass = cot.estado_nombre === 'Aprobada' ? 'bg-success' : cot.estado_nombre === 'Rechazada' ? 'bg-danger' : 'bg-warning text-dark';
                                    return (
                                        <>
                                            <div className="row g-3 mb-4">
                                                <div className="col-6 col-md-3">
                                                    <small className="text-muted text-uppercase fw-bold d-block">Fecha</small>
                                                    <span className="fw-bold">{new Date(cot.fecha_creacion).toLocaleDateString()}</span>
                                                </div>
                                                <div className="col-6 col-md-4">
                                                    <small className="text-muted text-uppercase fw-bold d-block">Solicitante</small>
                                                    <span className="fw-bold">{cot.creador_nombre} {cot.creador_apellido}</span>
                                                </div>
                                                <div className="col-6 col-md-2">
                                                    <small className="text-muted text-uppercase fw-bold d-block">Estado</small>
                                                    <span className={`badge px-3 py-2 rounded-pill ${badgeClass}`}>{cot.estado_nombre}</span>
                                                </div>
                                            </div>
                                            {cot.observacion && (
                                                <div className="alert alert-light border mb-3 py-2">
                                                    <small className="text-muted fw-bold text-uppercase d-block mb-1">Observación</small>
                                                    {cot.observacion}
                                                </div>
                                            )}
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle border rounded">
                                                    <thead className="table-light">
                                                        <tr className="text-uppercase small text-muted">
                                                            <th className="ps-3 d-none d-md-table-cell">#</th>
                                                            <th>Insumo / Ítem</th>
                                                            <th className="d-none d-md-table-cell">SKU</th>
                                                            <th className="text-center pe-3">Cantidad</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {cot.items && cot.items.length > 0 ? cot.items.map((item, idx) => (
                                                            <tr key={item.id}>
                                                                <td className="ps-3 text-muted small d-none d-md-table-cell">{idx + 1}</td>
                                                                <td className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{item.nombre_item}</td>
                                                                <td className="d-none d-md-table-cell"><span className="badge bg-light text-muted border font-monospace">{item.codigo_sku || '—'}</span></td>
                                                                <td className="text-center fw-bold pe-3" style={{ fontSize: '0.85rem' }}>{parseFloat(item.cantidad)} {item.unidad_medida || 'UN'}</td>
                                                            </tr>
                                                        )) : (
                                                            <tr><td colSpan="4" className="text-center text-muted py-4">Sin ítems.</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    );
                                })() : null}
                            </div>
                            <div className="modal-footer bg-light border-top-0">
                                <button type="button" className="btn btn-secondary px-4" onClick={cerrarPreview}>Cerrar</button>
                                {previewModal.data && (
                                    <button type="button" className="btn btn-outline-danger px-4" onClick={() => { cerrarPreview(); descargarPdf(previewModal.data.id); }} disabled={downloading}>
                                        <i className="bi bi-file-earmark-pdf me-2"></i>Descargar PDF
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
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

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body bg-white rounded p-3 p-md-4">
                    <h6 className="text-muted small fw-bold text-uppercase mb-3">Filtros de Búsqueda</h6>
                    <div className="row g-2 align-items-end">
                        <div className="col-6 col-md-2">
                            <label className="form-label small fw-bold text-muted mb-1">ID Cotización</label>
                            <input type="text" className="form-control form-control-sm" placeholder="ID Cotización" value={filtros.id} onChange={e => setFiltros({ ...filtros, id: e.target.value })} />
                        </div>
                        <div className="col-6 col-md-2">
                            <label className="form-label small fw-bold text-muted mb-1">Estado</label>
                            <select className="form-select form-select-sm" value={filtros.estado_id} onChange={e => setFiltros({ ...filtros, estado_id: e.target.value })}>
                                <option value="">Todos los Estados</option>
                                {estados.map(est => <option key={est.id} value={est.id}>{est.nombre}</option>)}
                            </select>
                        </div>
                        <div className="col-6 col-md-1">
                            <label className="form-label small fw-bold text-muted mb-1">Desde</label>
                            <input type="date" className="form-control form-control-sm" value={filtros.start} onChange={e => setFiltros({ ...filtros, start: e.target.value })} />
                        </div>
                        <div className="col-6 col-md-1">
                            <label className="form-label small fw-bold text-muted mb-1">Hasta</label>
                            <input type="date" className="form-control form-control-sm" value={filtros.end} onChange={e => setFiltros({ ...filtros, end: e.target.value })} />
                        </div>
                        <div className="col-6 col-md-2">
                            <label className="form-label small fw-bold text-muted mb-1">Solicitante</label>
                            <select className="form-select form-select-sm" value={filtros.usuario} onChange={e => setFiltros({ ...filtros, usuario: e.target.value })}>
                                <option value="">Creado por...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>)}
                            </select>
                        </div>
                        <div className="col-6 col-md-2 position-relative">
                            <label className="form-label small fw-bold text-muted mb-1">Insumo</label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Buscar Insumo..."
                                value={busquedaInsumo}
                                onChange={(e) => {
                                    setBusquedaInsumo(e.target.value);
                                    setMostrarSugerencias(true);
                                }}
                            />
                            {mostrarSugerencias && busquedaInsumo && (
                                <ul className="list-group position-absolute w-100 shadow-sm mt-1" style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}>
                                    {listaInsumos.filter(i => i.nombre.toLowerCase().includes(busquedaInsumo.toLowerCase())).map(i => (
                                        <li key={i.id} className="list-group-item list-group-item-action small" onClick={() => { setBusquedaInsumo(i.nombre); setMostrarSugerencias(false); }}>
                                            {i.nombre}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="col-12 col-md-2">
                            <button className="btn btn-secondary btn-sm w-100 fw-bold" onClick={cargarDatos}><i className="bi bi-search me-2"></i>Buscar</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr className="text-uppercase small text-muted">
                                    <th className="ps-4">Folio</th>
                                    <th className="d-none d-md-table-cell">Fecha</th>
                                    <th>Solicitante</th>
                                    <th className="text-center d-none d-md-table-cell">Ítems</th>
                                    <th className="text-center">Estado</th>
                                    <th className="text-end pe-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? <tr><td colSpan="6" className="text-center py-5">Cargando...</td></tr> :
                                    data.length === 0 ? <tr><td colSpan="6" className="text-center py-5">Sin registros.</td></tr> :
                                        data.slice((paginaActual - 1) * ITEMS_POR_PAGINA, paginaActual * ITEMS_POR_PAGINA).map(cot => (
                                            <tr key={cot.id}>
                                                <td className="ps-4 fw-bold text-dark" style={{ fontSize: '0.85rem' }}>#{cot.id}</td>
                                                <td className="d-none d-md-table-cell" style={{ fontSize: '0.85rem' }}>{new Date(cot.fecha_creacion).toLocaleDateString()}</td>
                                                <td><div className="fw-bold text-dark small">{cot.creador_nombre} {cot.creador_apellido}</div></td>
                                                <td className="text-center d-none d-md-table-cell"><span className="badge bg-light text-dark border">{cot.items_count}</span></td>
                                                <td className="text-center">
                                                    <span className={`badge px-2 px-md-3 py-2 rounded-pill ${cot.estado_nombre === 'Aprobada' ? 'bg-success' :
                                                        cot.estado_nombre === 'Rechazada' ? 'bg-danger' : 'bg-warning text-dark'
                                                    }`} style={{ fontSize: '0.75rem' }}>{cot.estado_nombre}</span>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <div className="btn-group flex-wrap">
                                                        <button className="btn btn-sm btn-outline-primary" title="Vista Previa" onClick={() => verDetalle(cot.id)}>
                                                            <i className="bi bi-eye"></i>
                                                        </button>
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
                {Math.ceil(data.length / ITEMS_POR_PAGINA) > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-2 py-3 border-top bg-white flex-shrink-0">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1}>
                            <i className="bi bi-chevron-left"></i>
                        </button>
                        <span className="small text-muted">Página {paginaActual} de {Math.ceil(data.length / ITEMS_POR_PAGINA)} <span className="ms-2 text-secondary">({data.length} cotizaciones)</span></span>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setPaginaActual(p => Math.min(Math.ceil(data.length / ITEMS_POR_PAGINA), p + 1))} disabled={paginaActual === Math.ceil(data.length / ITEMS_POR_PAGINA)}>
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cotizaciones;
