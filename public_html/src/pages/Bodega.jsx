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

    const hasPermission = (permiso) => {
        if (auth.rol === 'Admin' || auth.rol === 1) return true;
        return auth.permisos && auth.permisos.includes(permiso);
    };

    useEffect(() => {
        if (hasPermission('bodega_ver')) {
            cargarDatos();
            const interval = setInterval(() => {
                cargarDatos(true);
            }, 120000); 
            return () => clearInterval(interval);
        } else {
            setLoading(false);
        }
    }, [vista]);

    useEffect(() => { setBusqueda(''); }, [vista]);

    const cargarDatos = (isSilent = false) => {
        if (vista === 'salidas') cargarPendientes(isSilent);
        else if (vista === 'entradas') cargarPorOrganizar(isSilent);
        else if (vista === 'devoluciones') cargarDevoluciones(isSilent);
    };

    const cargarPendientes = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setIsRefreshing(true);
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

    const itemsPorOrganizarFiltrados = porOrganizar.filter(item => {
        if (!busqueda) return true;
        const termino = busqueda.toLowerCase();
        return (item.nombre.toLowerCase().includes(termino) || item.codigo_sku.toLowerCase().includes(termino));
    });
    
    const devolucionesFiltradas = devoluciones.filter(item => {
        if (!busqueda) return true;
        const termino = busqueda.toLowerCase();
        return (item.insumo.toLowerCase().includes(termino) || item.tecnico_nombre.toLowerCase().includes(termino));
    });

    const handleCheckItem = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);

    const getSelectedObjects = () => {
        const allItems = Object.values(pendientesAgrupados).flatMap(g => g.items);
        return allItems.filter(item => selectedIds.includes(item.detalle_id));
    };

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
            setLoading(false);
        }
    };

    const procesarRechazo = async () => {
        if (!rechazoModal.motivo.trim()) {
            setMsg({ show: true, title: "Atención", text: "Debe escribir un motivo para el rechazo.", type: "warning" });
            return;
        }
        try {
            setLoading(true);
            await api.post('/bodega/devoluciones/rechazar', { 
                devolucion_id: rechazoModal.devId,
                motivo: rechazoModal.motivo 
            });
            setRechazoModal({ show: false, devId: null, motivo: '' });
            setMsg({ show: true, title: "Rechazada", text: "Devolución rechazada. El stock volvió a la cuenta del técnico.", type: "success" });
            cargarDevoluciones(true);
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.error || "Error al rechazar", type: "error" });
            setLoading(false);
        }
    };

    if (!hasPermission('bodega_ver')) {
        return <div className="alert alert-danger m-4 shadow-sm">No tienes permisos para acceder al módulo de Bodega.</div>;
    }

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />

            <ModalEntregaBodega show={entregaModal.show} item={entregaModal.item} onClose={() => setEntregaModal({ show: false, item: null })} onConfirm={procesarEntrega} />
            <ModalEntregaMasivaBodega show={masivaModal.show} selectedItems={getSelectedObjects()} onClose={() => setMasivaModal({ show: false })} onConfirm={procesarEntregaMasiva} />
            {organizarModal.show && <ModalOrganizarBodega show={organizarModal.show} insumo={organizarModal.item} onClose={() => setOrganizarModal({ show: false, item: null })} onSave={() => cargarPorOrganizar(true)} />}
            
            {/* MODAL PARA MOTIVO DE RECHAZO */}
            {rechazoModal.show && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title fw-bold"><i className="bi bi-x-circle me-2"></i>Rechazar Devolución</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setRechazoModal({ show: false, devId: null, motivo: '' })}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="text-muted">El stock devuelto volverá a ser responsabilidad del técnico y se le notificará el rechazo.</p>
                                <label className="fw-bold mb-2">Motivo del rechazo:</label>
                                <textarea 
                                    className="form-control shadow-sm" 
                                    rows="3" 
                                    placeholder="Ej: Material incompleto, el técnico lo rompió, etc."
                                    value={rechazoModal.motivo}
                                    onChange={(e) => setRechazoModal({ ...rechazoModal, motivo: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="modal-footer bg-light">
                                <button type="button" className="btn btn-secondary" onClick={() => setRechazoModal({ show: false, devId: null, motivo: '' })}>Cancelar</button>
                                <button type="button" className="btn btn-danger fw-bold" onClick={procesarRechazo}>Confirmar Rechazo</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-shrink-0">
                    <div className="d-flex align-items-center gap-2">
                        <h4 className="mb-0 fw-bold text-dark me-3"><i className="bi bi-inboxes me-2"></i>Gestión de Bodega</h4>
                        
                        {isRefreshing && <span className="badge bg-light text-secondary border"><span className="spinner-border spinner-border-sm me-1" style={{width:'0.7rem', height:'0.7rem'}}></span>Actualizando...</span>}

                        {vista === 'salidas' && selectedIds.length > 0 && hasPermission('bodega_despachar') && (
                            <button className="btn btn-success btn-sm shadow-sm" onClick={() => setMasivaModal({ show: true })}>
                                <i className="bi bi-check2-all me-1"></i> Entregar Seleccionados ({selectedIds.length})
                            </button>
                        )}
                    </div>

                    <div className="btn-group shadow-sm">
                        <button className={`btn ${vista === 'salidas' ? 'btn-dark' : 'btn-outline-dark bg-white'}`} onClick={() => setVista('salidas')}>Despacho (Salidas)</button>
                        <button className={`btn ${vista === 'entradas' ? 'btn-dark' : 'btn-outline-dark bg-white'}`} onClick={() => setVista('entradas')}>Organizar (Entradas)</button>
                        <button className={`btn ${vista === 'devoluciones' ? 'btn-dark' : 'btn-outline-dark bg-white'}`} onClick={() => setVista('devoluciones')}>
                            Devoluciones {devoluciones.length > 0 && <span className="badge bg-danger ms-1 px-2 rounded-pill">{devoluciones.length}</span>}
                        </button>
                    </div>
                </div>

                {(vista === 'entradas' || vista === 'devoluciones') && (
                    <div className="bg-light px-3 pt-3 pb-2 border-bottom">
                        <div className="row">
                            <div className="col-md-4">
                                <div className="input-group shadow-sm">
                                    <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-search"></i></span>
                                    <input type="text" className="form-control border-start-0 ps-0" placeholder="Buscar por Insumo o Técnico..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                                    {busqueda && <button className="btn btn-outline-secondary border-start-0 bg-white" onClick={() => setBusqueda('')}><i className="bi bi-x"></i></button>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="card-body p-3 flex-grow-1 overflow-auto bg-light position-relative">
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center h-100"><div className="spinner-border text-primary" role="status"></div></div> 
                    ) : (
                        vista === 'salidas' ? (
                            <div className="row g-3">
                                {Object.keys(pendientesAgrupados).length === 0 && <div className="col-12 text-center py-5 text-muted">✅ Todo despachado</div>}
                                {Object.values(pendientesAgrupados).map(grupo => (
                                    <div key={grupo.ot_id} className="col-12">
                                        <div className="card shadow-sm border-start border-5 border-warning">
                                            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="badge bg-warning text-dark fs-6 me-2">OT #{grupo.ot_id}</span>
                                                    <span className="fw-bold text-uppercase">{grupo.maquina}</span>
                                                    <span className="text-muted ms-2 small">| Solicita: {grupo.solicitante}</span>
                                                </div>
                                                <small className="text-muted">{new Date(grupo.fecha).toLocaleDateString()}</small>
                                            </div>
                                            <div className="card-body p-0">
                                                <table className="table table-hover mb-0 align-middle">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th style={{width: '40px'}} className="text-center">#</th> 
                                                            <th className="ps-2">Insumo</th>
                                                            <th>SKU</th>
                                                            <th>Ubicación</th>
                                                            <th className="text-center">Stock Bodega</th>
                                                            <th className="text-center text-danger">Pendiente</th>
                                                            <th className="text-end pe-4">Acción</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {grupo.items.map(p => (
                                                            <tr key={p.detalle_id} className={selectedIds.includes(p.detalle_id) ? "table-active" : ""}>
                                                                <td className="text-center">
                                                                    {hasPermission('bodega_despachar') && (
                                                                        <input type="checkbox" className="form-check-input" checked={selectedIds.includes(p.detalle_id)} onChange={() => handleCheckItem(p.detalle_id)} />
                                                                    )}
                                                                </td>
                                                                <td className="ps-2 fw-bold">{p.insumo}</td>
                                                                <td className="text-muted small">{p.codigo_sku}</td>
                                                                <td className="small text-muted"><i className="bi bi-geo-alt me-1"></i>{p.ubicacion || 'General'}</td>
                                                                <td className="text-center text-muted small">{parseFloat(p.stock_actual)}</td>
                                                                <td className="text-center fw-bold text-danger fs-5">
                                                                    {parseFloat(p.cantidad_pendiente)} <small className="text-muted fs-6 ms-1">{p.unidad_medida}</small>
                                                                </td>
                                                                <td className="text-end pe-4">
                                                                    {hasPermission('bodega_despachar') && (
                                                                        <button className="btn btn-outline-success btn-sm px-3" onClick={() => setEntregaModal({ show: true, item: p })} title="Entrega Individual"><i className="bi bi-box-seam"></i></button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : vista === 'entradas' ? (
                            <div className="card border-0 shadow-sm">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light sticky-top">
                                        <tr>
                                            <th className="ps-4">SKU</th>
                                            <th>Insumo</th>
                                            <th className="text-center">Stock Total</th>
                                            <th className="text-center text-danger">Por Organizar</th>
                                            <th className="text-end pe-4">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itemsPorOrganizarFiltrados.length > 0 ? (
                                            itemsPorOrganizarFiltrados.map(p => (
                                                <tr key={p.id}>
                                                    <td className="ps-4 font-monospace">{p.codigo_sku}</td>
                                                    <td><div className="fw-bold">{p.nombre}</div></td>
                                                    <td className="text-center">{parseFloat(p.stock_actual)}</td>
                                                    <td className="text-center fw-bold text-danger">{parseFloat(p.por_organizar)}</td>
                                                    <td className="text-end pe-4">
                                                        {hasPermission('bodega_organizar') && (
                                                            <button className="btn btn-primary btn-sm fw-bold px-3" onClick={() => setOrganizarModal({ show: true, item: p })}>
                                                                <i className="bi bi-arrow-down-square me-2"></i>Ubicación
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="5" className="text-center py-5 text-muted">No hay ítems por organizar.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="card border-0 shadow-sm">
                                <table className="table table-hover align-middle mb-0 bg-white">
                                    <thead className="bg-light sticky-top">
                                        <tr>
                                            <th className="ps-4 py-3">Técnico Solicitante</th>
                                            <th>Insumo / SKU</th>
                                            <th className="text-center">Cant. Retorno</th>
                                            <th>Motivo / Comentarios</th>
                                            <th>Fecha Solicitud</th>
                                            <th className="text-end pe-4">Resolución</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {devolucionesFiltradas.length > 0 ? (
                                            devolucionesFiltradas.map(dev => (
                                                <tr key={dev.id}>
                                                    <td className="ps-4">
                                                        <div className="fw-bold text-dark d-flex align-items-center">
                                                            <div className="bg-secondary bg-opacity-10 p-2 rounded-circle me-2 text-secondary d-flex align-items-center justify-content-center" style={{width:'32px', height:'32px'}}>
                                                                <i className="bi bi-person-fill"></i>
                                                            </div>
                                                            {dev.tecnico_nombre} {dev.tecnico_apellido}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold text-dark">{dev.insumo}</div>
                                                        <div className="font-monospace text-muted small mt-1">{dev.codigo_sku}</div>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge bg-light text-dark border fs-6 px-3 py-2 shadow-sm">
                                                            {parseFloat(dev.cantidad)} <span className="text-muted ms-1">{dev.unidad_medida}</span>
                                                        </span>
                                                    </td>
                                                    
                                                    {/* NUEVA COLUMNA ESTILIZADA PARA MOTIVOS */}
                                                    <td>
                                                        <div className="d-flex flex-column align-items-start">
                                                            {dev.tipo_codigo === 'SOBRANTE' && <span className="badge bg-primary bg-opacity-10 text-primary border border-primary mb-1 px-2 py-1"><i className="bi bi-box-seam me-1"></i>Sobrante</span>}
                                                            {dev.tipo_codigo === 'DANO' && <span className="badge bg-danger bg-opacity-10 text-danger border border-danger mb-1 px-2 py-1"><i className="bi bi-exclamation-triangle me-1"></i>Daño / Merma</span>}
                                                            {dev.tipo_codigo === 'NO_RECIBIDO' && <span className="badge bg-warning bg-opacity-25 text-dark border border-warning mb-1 px-2 py-1"><i className="bi bi-truck-flatbed me-1"></i>No Recibido</span>}
                                                            {(!dev.tipo_codigo) && <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary mb-1 px-2 py-1">General</span>}
                                                            
                                                            {dev.comentario_tecnico && (
                                                                <div className="alert alert-secondary p-2 mb-0 mt-1 small fst-italic border-0" style={{ maxWidth: '300px', fontSize: '0.8rem', lineHeight: '1.2' }}>
                                                                    "{dev.comentario_tecnico}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="text-muted small">
                                                        <i className="bi bi-calendar3 me-1"></i>
                                                        {new Date(dev.fecha).toLocaleDateString()}
                                                        <div className="mt-1"><i className="bi bi-clock me-1"></i>{new Date(dev.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                    </td>
                                                    
                                                    <td className="text-end pe-4">
                                                        <div className="btn-group shadow-sm">
                                                            <button 
                                                                className="btn btn-outline-success btn-sm fw-bold px-3 d-flex align-items-center" 
                                                                onClick={() => aprobarDevolucion(dev.id, dev.tipo_codigo)} 
                                                                title="Procesar y Aceptar"
                                                            >
                                                                <i className="bi bi-check2-circle fs-5 me-1"></i> Aceptar
                                                            </button>
                                                            <button 
                                                                className="btn btn-outline-danger btn-sm fw-bold px-3 border-start d-flex align-items-center" 
                                                                onClick={() => setRechazoModal({ show: true, devId: dev.id, motivo: '' })} 
                                                                title="Denegar retorno al técnico"
                                                            >
                                                                <i className="bi bi-x-circle fs-5 me-1"></i> Rechazar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center py-5 text-muted bg-white">
                                                    <i className="bi bi-inboxes display-4 text-secondary opacity-50 mb-3 d-block"></i>
                                                    <h5>No hay solicitudes pendientes</h5>
                                                    <p>Todas las devoluciones y rechazos han sido procesados.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Bodega;