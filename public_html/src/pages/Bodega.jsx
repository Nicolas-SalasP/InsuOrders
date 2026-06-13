import { useEffect, useState, useContext } from 'react';
import api from '../api/axiosConfig';
import AuthContext from '../context/AuthContext';
import MessageModal from '../components/MessageModal';
import ModalEntregaBodega from '../components/ModalEntregaBodega';
import ModalEntregaMasivaBodega from '../components/ModalEntregaMasivaBodega';
import ModalOrganizarBodega from '../components/ModalOrganizarBodega';

const Bodega = () => {
    const { auth } = useContext(AuthContext);
    const [vista, setVista] = useState('salidas');
    const [pendientesAgrupados, setPendientesAgrupados] = useState({});
    const [porOrganizar, setPorOrganizar] = useState([]);
    const [devoluciones, setDevoluciones] = useState([]);

    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });
    const [entregaModal, setEntregaModal] = useState({ show: false, item: null });
    const [organizarModal, setOrganizarModal] = useState({ show: false, item: null });
    const [masivaModal, setMasivaModal] = useState({ show: false });
    const [rechazoModal, setRechazoModal] = useState({ show: false, devId: null, motivo: '' });
    const [selectedIds, setSelectedIds] = useState([]);
    const [gruposColapsados, setGruposColapsados] = useState({});

    const hasPermission = (permiso) => {
        if (auth.rol === 'Admin') return true;
        return auth.permisos && auth.permisos.includes(permiso);
    };

    useEffect(() => {
        if (hasPermission('bodega_ver')) {
            cargarDatos();
            const interval = setInterval(() => cargarDatos(true), 120000);
            return () => clearInterval(interval);
        } else {
            setLoading(false);
        }
    }, [vista]);

    useEffect(() => { setBusqueda(''); setGruposColapsados({}); }, [vista]);

    const cargarDatos = (isSilent = false) => {
        if (vista === 'salidas') cargarPendientes(isSilent);
        else if (vista === 'entradas') cargarPorOrganizar(isSilent);
        else if (vista === 'devoluciones') cargarDevoluciones(isSilent);
    };

    const cargarPendientes = async (isSilent = false) => {
        if (!isSilent) setLoading(true); else setIsRefreshing(true);
        try {
            const res = await api.get('/bodega/pendientes');
            if (res.data.success) {
                const datos = Array.isArray(res.data.data) ? res.data.data : [];
                const grupos = datos.reduce((acc, item) => {
                    const id = item.ot_id;
                    if (!acc[id]) {
                        acc[id] = { ot_id: id, solicitante: item.solicitante + ' ' + (item.solicitante_apellido || ''), maquina: item.maquina || 'General', fecha: item.fecha_solicitud, items: [] };
                    }
                    acc[id].items.push(item);
                    return acc;
                }, {});
                setPendientesAgrupados(grupos);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); setIsRefreshing(false); }
    };

    const cargarPorOrganizar = async (isSilent = false) => {
        if (!isSilent) setLoading(true); else setIsRefreshing(true);
        try {
            const res = await api.get('/bodega/por-organizar');
            if (res.data.success) setPorOrganizar(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); setIsRefreshing(false); }
    };

    const cargarDevoluciones = async (isSilent = false) => {
        if (!isSilent) setLoading(true); else setIsRefreshing(true);
        try {
            const res = await api.get('/bodega/devoluciones');
            if (res.data.success) setDevoluciones(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); setIsRefreshing(false); }
    };

    const toggleGrupo = (otId) => setGruposColapsados(prev => ({ ...prev, [otId]: !prev[otId] }));

    const colapsarTodos = () => {
        const todos = Object.keys(pendientesAgrupados).reduce((acc, id) => ({ ...acc, [id]: true }), {});
        setGruposColapsados(todos);
    };
    const expandirTodos = () => setGruposColapsados({});

    const gruposFiltrados = Object.values(pendientesAgrupados).filter(g => {
        if (!busqueda) return true;
        const t = busqueda.toLowerCase();
        return String(g.ot_id).includes(t) || g.maquina.toLowerCase().includes(t) || g.solicitante.toLowerCase().includes(t) || g.items.some(i => i.insumo.toLowerCase().includes(t) || i.codigo_sku.toLowerCase().includes(t));
    });

    const itemsPorOrganizarFiltrados = porOrganizar.filter(item => {
        if (!busqueda) return true;
        const t = busqueda.toLowerCase();
        return item.nombre.toLowerCase().includes(t) || item.codigo_sku.toLowerCase().includes(t);
    });

    const devolucionesFiltradas = devoluciones.filter(item => {
        if (!busqueda) return true;
        const t = busqueda.toLowerCase();
        return item.insumo.toLowerCase().includes(t) || item.tecnico_nombre.toLowerCase().includes(t);
    });

    const handleCheckItem = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    const getSelectedObjects = () => Object.values(pendientesAgrupados).flatMap(g => g.items).filter(item => selectedIds.includes(item.detalle_id));

    const procesarEntrega = async (detalleId, cantidad, receptorId) => {
        try {
            await api.post('/bodega/entregar', { detalle_id: detalleId, cantidad_entregar: cantidad, receptor_id: receptorId });
            setEntregaModal({ show: false, item: null });
            setMsg({ show: true, title: "Entregado", text: "Entrega registrada exitosamente.", type: "success" });
            cargarPendientes(true);
        } catch (error) { setMsg({ show: true, title: "Error", text: error.response?.data?.error || "Error desconocido", type: "error" }); }
    };

    const procesarEntregaMasiva = async (itemsPayload, receptorId) => {
        try {
            await api.post('/bodega/entregar-masivo', { items: itemsPayload, receptor_id: receptorId });
            setMasivaModal({ show: false });
            setSelectedIds([]);
            setMsg({ show: true, title: "Entrega Masiva", text: "Se han entregado los materiales seleccionados.", type: "success" });
            cargarPendientes(true);
        } catch (error) { setMsg({ show: true, title: "Error", text: error.response?.data?.error || "Error al procesar", type: "error" }); }
    };

    const aprobarDevolucion = async (id, tipoCodigo) => {
        let mensajeExito = "Devolución aprobada. El stock ahora está 'Por Organizar'.";
        if (tipoCodigo === 'NO_RECIBIDO') mensajeExito = "Aprobada. El stock ha sido reintegrado automáticamente al inventario.";
        if (tipoCodigo === 'DANO') mensajeExito = "Aprobada. El producto se ha registrado como baja/merma.";
        try {
            setLoading(true);
            await api.post('/bodega/devoluciones/aprobar', { devolucion_id: id });
            setMsg({ show: true, title: "Procesado", text: mensajeExito, type: "success" });
            cargarDevoluciones(true);
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.error || "Error al aprobar", type: "error" });
        } finally { setLoading(false); }
    };

    const procesarRechazo = async () => {
        if (!rechazoModal.motivo.trim()) { setMsg({ show: true, title: "Atención", text: "Debe escribir un motivo para el rechazo.", type: "warning" }); return; }
        try {
            setLoading(true);
            await api.post('/bodega/devoluciones/rechazar', { devolucion_id: rechazoModal.devId, motivo: rechazoModal.motivo });
            setRechazoModal({ show: false, devId: null, motivo: '' });
            setMsg({ show: true, title: "Rechazada", text: "Devolución rechazada. El stock volvió a la cuenta del técnico.", type: "success" });
            cargarDevoluciones(true);
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.error || "Error al rechazar", type: "error" });
        } finally { setLoading(false); }
    };

    const totalPendienteItems = Object.values(pendientesAgrupados).reduce((acc, g) => acc + g.items.length, 0);

    if (!hasPermission('bodega_ver')) {
        return <div className="alert alert-danger m-4 shadow-sm">No tienes permisos para acceder al módulo de Bodega.</div>;
    }

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column" style={{ backgroundColor: '#f5f6fa' }}>
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />
            <ModalEntregaBodega show={entregaModal.show} item={entregaModal.item} onClose={() => setEntregaModal({ show: false, item: null })} onConfirm={procesarEntrega} />
            <ModalEntregaMasivaBodega show={masivaModal.show} selectedItems={getSelectedObjects()} onClose={() => setMasivaModal({ show: false })} onConfirm={procesarEntregaMasiva} />
            {organizarModal.show && <ModalOrganizarBodega show={organizarModal.show} insumo={organizarModal.item} onClose={() => setOrganizarModal({ show: false, item: null })} onSave={() => cargarPorOrganizar(true)} />}

            {rechazoModal.show && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-danger text-white rounded-top-4">
                                <h5 className="modal-title fw-bold"><i className="bi bi-x-circle me-2"></i>Rechazar Devolución</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setRechazoModal({ show: false, devId: null, motivo: '' })}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="text-muted mb-3">El stock devuelto volverá a ser responsabilidad del técnico y se le notificará el rechazo.</p>
                                <label className="fw-bold mb-2 small text-uppercase text-muted">Motivo del rechazo</label>
                                <textarea className="form-control shadow-sm" rows="3" placeholder="Ej: Material incompleto, el técnico lo rompió, etc." value={rechazoModal.motivo} onChange={(e) => setRechazoModal({ ...rechazoModal, motivo: e.target.value })}></textarea>
                            </div>
                            <div className="modal-footer bg-light rounded-bottom-4">
                                <button type="button" className="btn btn-secondary" onClick={() => setRechazoModal({ show: false, devId: null, motivo: '' })}>Cancelar</button>
                                <button type="button" className="btn btn-danger fw-bold px-4" onClick={procesarRechazo}>Confirmar Rechazo</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="px-4 pt-4 pb-0 flex-shrink-0">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h3 className="fw-bold mb-1" style={{ color: '#1a1d23' }}>
                            <i className="bi bi-inboxes-fill me-2 text-primary"></i>Bodega
                        </h3>
                        <p className="text-muted small mb-0">Gestión de despacho, organización y devoluciones de materiales</p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        {isRefreshing && (
                            <span className="badge bg-light text-secondary border shadow-sm px-3 py-2">
                                <span className="spinner-border spinner-border-sm me-1" style={{ width: '0.65rem', height: '0.65rem' }}></span>
                                Actualizando
                            </span>
                        )}
                        {vista === 'salidas' && selectedIds.length > 0 && hasPermission('bodega_despachar') && (
                            <button className="btn btn-success shadow-sm fw-bold px-3" onClick={() => setMasivaModal({ show: true })}>
                                <i className="bi bi-check2-all me-2"></i>Entregar {selectedIds.length} ítems
                            </button>
                        )}
                    </div>
                </div>

                {/* TABS + SEARCH */}
                <div className="d-flex justify-content-between align-items-end gap-3">
                    {/* Tabs */}
                    <div className="d-flex gap-1 p-1 rounded-3 shadow-sm" style={{ backgroundColor: '#e9ecef' }}>
                        {[
                            { key: 'salidas', icon: 'bi-box-arrow-right', label: 'Despacho', count: totalPendienteItems || null, countClass: 'bg-warning text-dark' },
                            { key: 'entradas', icon: 'bi-box-arrow-in-down', label: 'Por Organizar', count: porOrganizar.length || null, countClass: 'bg-primary' },
                            { key: 'devoluciones', icon: 'bi-arrow-return-left', label: 'Devoluciones', count: devoluciones.length || null, countClass: 'bg-danger' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-2 fw-semibold transition ${vista === tab.key ? 'btn-white shadow-sm text-primary' : 'btn-transparent text-muted'}`}
                                style={{ backgroundColor: vista === tab.key ? '#fff' : 'transparent', border: 'none' }}
                                onClick={() => setVista(tab.key)}
                            >
                                <i className={`bi ${tab.icon}`}></i>
                                {tab.label}
                                {tab.count > 0 && <span className={`badge ${tab.countClass} ms-1 px-2 rounded-pill`} style={{ fontSize: '0.7rem' }}>{tab.count}</span>}
                            </button>
                        ))}
                    </div>

                    {/* Search + collapse controls */}
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <div className="input-group shadow-sm" style={{ width: '260px' }}>
                            <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-search"></i></span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder={vista === 'salidas' ? 'Buscar OT, equipo, insumo…' : 'Buscar…'}
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                style={{ borderRadius: '0 8px 8px 0' }}
                            />
                            {busqueda && <button className="btn btn-outline-secondary border-start-0 bg-white" onClick={() => setBusqueda('')}><i className="bi bi-x"></i></button>}
                        </div>
                        {vista === 'salidas' && Object.keys(pendientesAgrupados).length > 0 && (
                            <div className="btn-group shadow-sm">
                                <button className="btn btn-sm btn-outline-secondary bg-white" onClick={expandirTodos} title="Expandir todos">
                                    <i className="bi bi-chevron-down"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-secondary bg-white" onClick={colapsarTodos} title="Colapsar todos">
                                    <i className="bi bi-chevron-up"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-grow-1 overflow-auto px-4 py-3">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                        <div className="text-center">
                            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}></div>
                            <p className="text-muted small">Cargando datos…</p>
                        </div>
                    </div>
                ) : vista === 'salidas' ? (
                    <div className="d-flex flex-column gap-3">
                        {gruposFiltrados.length === 0 && (
                            <div className="text-center py-5 text-muted">
                                {busqueda ? <><i className="bi bi-search fs-1 d-block mb-3 opacity-25"></i>Sin resultados para "<strong>{busqueda}</strong>"</> : <><i className="bi bi-check-circle-fill fs-1 d-block mb-3 text-success opacity-50"></i><h5>Todo despachado</h5><p className="small">No hay materiales pendientes de entrega.</p></>}
                            </div>
                        )}
                        {gruposFiltrados.map(grupo => {
                            const colapsado = !!gruposColapsados[grupo.ot_id];
                            const itemsSeleccionados = grupo.items.filter(i => selectedIds.includes(i.detalle_id)).length;
                            return (
                                <div key={grupo.ot_id} className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '12px' }}>
                                    {/* GROUP HEADER — clickable to toggle */}
                                    <div
                                        className="d-flex justify-content-between align-items-center px-4 py-3 cursor-pointer"
                                        style={{ backgroundColor: '#fffbf0', borderBottom: colapsado ? 'none' : '1px solid #f0e8c8', cursor: 'pointer' }}
                                        onClick={() => toggleGrupo(grupo.ot_id)}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="badge fs-6 px-3 py-2 fw-bold shadow-sm" style={{ backgroundColor: '#f59e0b', color: '#fff', borderRadius: '8px' }}>
                                                OT #{grupo.ot_id}
                                            </span>
                                            <div>
                                                <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{grupo.maquina}</span>
                                                <span className="text-muted ms-2 small"><i className="bi bi-person me-1"></i>{grupo.solicitante}</span>
                                            </div>
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary border px-2 py-1" style={{ fontSize: '0.75rem' }}>
                                                {grupo.items.length} ítem{grupo.items.length !== 1 ? 's' : ''}
                                            </span>
                                            {itemsSeleccionados > 0 && (
                                                <span className="badge bg-success px-2 py-1" style={{ fontSize: '0.75rem' }}>
                                                    {itemsSeleccionados} seleccionado{itemsSeleccionados !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="text-muted small"><i className="bi bi-calendar3 me-1"></i>{new Date(grupo.fecha).toLocaleDateString()}</span>
                                            <i className={`bi ${colapsado ? 'bi-chevron-down' : 'bi-chevron-up'} text-muted`}></i>
                                        </div>
                                    </div>

                                    {/* GROUP BODY */}
                                    {!colapsado && (
                                        <div className="bg-white">
                                            <table className="table table-hover mb-0 align-middle" style={{ fontSize: '0.9rem' }}>
                                                <thead style={{ backgroundColor: '#fafbfc', borderBottom: '2px solid #f0f0f0' }}>
                                                    <tr className="text-muted small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                                                        <th style={{ width: '40px' }} className="text-center ps-3 py-3 fw-semibold">#</th>
                                                        <th className="py-3 fw-semibold">Insumo</th>
                                                        <th className="py-3 fw-semibold">SKU</th>
                                                        <th className="py-3 fw-semibold">Ubicación</th>
                                                        <th className="text-center py-3 fw-semibold">Stock</th>
                                                        <th className="text-center py-3 fw-semibold text-danger">Pendiente</th>
                                                        <th className="text-end pe-4 py-3 fw-semibold">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {grupo.items.map(p => (
                                                        <tr key={p.detalle_id} style={{ backgroundColor: selectedIds.includes(p.detalle_id) ? '#f0fdf4' : '' }}>
                                                            <td className="text-center ps-3">
                                                                {hasPermission('bodega_despachar') && (
                                                                    <input type="checkbox" className="form-check-input" style={{ cursor: 'pointer' }} checked={selectedIds.includes(p.detalle_id)} onChange={() => handleCheckItem(p.detalle_id)} />
                                                                )}
                                                            </td>
                                                            <td className="fw-semibold text-dark">{p.insumo}</td>
                                                            <td className="font-monospace text-muted small">{p.codigo_sku}</td>
                                                            <td className="small text-muted">
                                                                <span className="badge bg-light text-secondary border px-2 py-1">
                                                                    <i className="bi bi-geo-alt me-1"></i>{p.ubicacion || 'General'}
                                                                </span>
                                                            </td>
                                                            <td className="text-center text-muted small">{parseFloat(p.stock_actual)}</td>
                                                            <td className="text-center">
                                                                <span className="fw-bold text-danger" style={{ fontSize: '1.1rem' }}>
                                                                    {parseFloat(p.cantidad_pendiente)}
                                                                </span>
                                                                <span className="text-muted small ms-1">{p.unidad_medida}</span>
                                                            </td>
                                                            <td className="text-end pe-4">
                                                                {hasPermission('bodega_despachar') && (
                                                                    <button
                                                                        className="btn btn-sm fw-semibold px-3 shadow-sm"
                                                                        style={{ backgroundColor: '#22c55e', color: '#fff', borderRadius: '8px', border: 'none' }}
                                                                        onClick={() => setEntregaModal({ show: true, item: p })}
                                                                        title="Entregar este ítem"
                                                                    >
                                                                        <i className="bi bi-box-seam me-1"></i>Entregar
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : vista === 'entradas' ? (
                    <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '12px' }}>
                        <table className="table table-hover align-middle mb-0 bg-white" style={{ fontSize: '0.9rem' }}>
                            <thead style={{ backgroundColor: '#fafbfc', borderBottom: '2px solid #f0f0f0' }}>
                                <tr className="text-muted small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                                    <th className="ps-4 py-3 fw-semibold">SKU</th>
                                    <th className="py-3 fw-semibold">Insumo</th>
                                    <th className="text-center py-3 fw-semibold">Stock Total</th>
                                    <th className="text-center py-3 fw-semibold text-danger">Por Organizar</th>
                                    <th className="text-end pe-4 py-3 fw-semibold">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemsPorOrganizarFiltrados.length > 0 ? itemsPorOrganizarFiltrados.map(p => (
                                    <tr key={p.id}>
                                        <td className="ps-4 font-monospace text-muted small">{p.codigo_sku}</td>
                                        <td><div className="fw-semibold text-dark">{p.nombre}</div></td>
                                        <td className="text-center text-muted">{parseFloat(p.stock_actual)}</td>
                                        <td className="text-center">
                                            <span className="badge fw-bold px-3 py-2" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px' }}>
                                                {parseFloat(p.por_organizar)}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            {hasPermission('bodega_organizar') && (
                                                <button className="btn btn-sm fw-semibold px-3 shadow-sm" style={{ backgroundColor: '#3b82f6', color: '#fff', borderRadius: '8px', border: 'none' }} onClick={() => setOrganizarModal({ show: true, item: p })}>
                                                    <i className="bi bi-arrow-down-square me-2"></i>Ubicación
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted">
                                        <i className="bi bi-check-circle-fill fs-1 d-block mb-3 text-success opacity-50"></i>
                                        {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay ítems por organizar.'}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '12px' }}>
                        <table className="table table-hover align-middle mb-0 bg-white" style={{ fontSize: '0.9rem' }}>
                            <thead style={{ backgroundColor: '#fafbfc', borderBottom: '2px solid #f0f0f0' }}>
                                <tr className="text-muted small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                                    <th className="ps-4 py-3 fw-semibold">Técnico</th>
                                    <th className="py-3 fw-semibold">Insumo / SKU</th>
                                    <th className="text-center py-3 fw-semibold">Cantidad</th>
                                    <th className="py-3 fw-semibold">Motivo / Comentario</th>
                                    <th className="py-3 fw-semibold">Fecha</th>
                                    <th className="text-end pe-4 py-3 fw-semibold">Resolución</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devolucionesFiltradas.length > 0 ? devolucionesFiltradas.map(dev => (
                                    <tr key={dev.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center text-secondary" style={{ width: '34px', height: '34px', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                                                    <i className="bi bi-person-fill"></i>
                                                </div>
                                                <span className="fw-semibold text-dark">{dev.tecnico_nombre} {dev.tecnico_apellido}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-semibold text-dark">{dev.insumo}</div>
                                            <div className="font-monospace text-muted small">{dev.codigo_sku}</div>
                                        </td>
                                        <td className="text-center">
                                            <span className="badge bg-light text-dark border px-3 py-2 shadow-sm fw-bold" style={{ fontSize: '0.95rem' }}>
                                                {parseFloat(dev.cantidad)} <span className="text-muted fw-normal">{dev.unidad_medida}</span>
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column gap-1">
                                                {dev.tipo_codigo === 'SOBRANTE' && <span className="badge px-2 py-1" style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px' }}><i className="bi bi-box-seam me-1"></i>Sobrante</span>}
                                                {dev.tipo_codigo === 'DANO' && <span className="badge px-2 py-1" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px' }}><i className="bi bi-exclamation-triangle me-1"></i>Daño / Merma</span>}
                                                {dev.tipo_codigo === 'NO_RECIBIDO' && <span className="badge px-2 py-1" style={{ backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', borderRadius: '6px' }}><i className="bi bi-truck-flatbed me-1"></i>No Recibido</span>}
                                                {!dev.tipo_codigo && <span className="badge px-2 py-1" style={{ backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px' }}>General</span>}
                                                {dev.comentario_tecnico && (
                                                    <div className="text-muted small fst-italic mt-1" style={{ maxWidth: '280px', fontSize: '0.8rem' }}>"{dev.comentario_tecnico}"</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-muted small">
                                            <div><i className="bi bi-calendar3 me-1"></i>{new Date(dev.fecha).toLocaleDateString()}</div>
                                            <div className="mt-1"><i className="bi bi-clock me-1"></i>{new Date(dev.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button className="btn btn-sm fw-semibold px-3 shadow-sm" style={{ backgroundColor: '#22c55e', color: '#fff', borderRadius: '8px', border: 'none' }} onClick={() => aprobarDevolucion(dev.id, dev.tipo_codigo)}>
                                                    <i className="bi bi-check2-circle me-1"></i>Aceptar
                                                </button>
                                                <button className="btn btn-sm fw-semibold px-3 shadow-sm" style={{ backgroundColor: '#ef4444', color: '#fff', borderRadius: '8px', border: 'none' }} onClick={() => setRechazoModal({ show: true, devId: dev.id, motivo: '' })}>
                                                    <i className="bi bi-x-circle me-1"></i>Rechazar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">
                                        <i className="bi bi-inboxes-fill fs-1 d-block mb-3 opacity-25"></i>
                                        {busqueda ? `Sin resultados para "${busqueda}"` : <><h5 className="mb-1">Sin devoluciones pendientes</h5><p className="small mb-0">Todas las solicitudes han sido procesadas.</p></>}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bodega;
