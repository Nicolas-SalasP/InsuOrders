import { useEffect, useState, useRef } from 'react';
import api from '../api/axiosConfig';
import NuevaOrdenModal from '../components/NuevaOrdenModal';
import DetalleOrdenModal from '../components/DetalleOrdenModal';
import SubirArchivoModal from '../components/SubirArchivoModal';
import RecepcionCompraModal from '../components/RecepcionCompraModal';
import MessageModal from '../components/MessageModal';
import ConfirmModal from '../components/ConfirmModal';
import { usePermission } from '../hooks/usePermission';

const Compras = () => {
    const { can } = usePermission();
    
    if (!can('compras_ver')) {
        return (
            <div className="container h-100 d-flex align-items-center justify-content-center">
                <div className="text-center p-5 shadow-sm rounded bg-white">
                    <i className="bi bi-shield-lock text-danger display-1"></i>
                    <h3 className="mt-3 fw-bold">Acceso Restringido</h3>
                    <p className="text-muted">No tienes permiso para gestionar compras.</p>
                </div>
            </div>
        );
    }

    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modales
    const [showModal, setShowModal] = useState(false);
    const [verModal, setVerModal] = useState({ show: false, id: null });
    const [uploadModal, setUploadModal] = useState({ show: false, id: null, url: null });
    const [recepcionModal, setRecepcionModal] = useState({ show: false, id: null });
    const [confirmModal, setConfirmModal] = useState({ show: false, id: null });
    const [confirmOmitir, setConfirmOmitir] = useState({ show: false, ids: null, nombre: '' });
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });

    // UI
    const [actionMenu, setActionMenu] = useState({ show: false, top: 0, left: 0, id: null, url: null, estado: null });
    const [expandirPendientes, setExpandirPendientes] = useState(false); // Nuevo estado para colapsar/expandir

    // Filtros
    const [filtroProveedor, setFiltroProveedor] = useState('');
    const [filtroDestino, setFiltroDestino] = useState('');
    const [filtroEstado, setFiltroEstado] = useState([]);
    const [showEstadoDropdown, setShowEstadoDropdown] = useState(false);
    const estadoRef = useRef(null);
    const [filtroFecha, setFiltroFecha] = useState('');
    const [filtroInsumo, setFiltroInsumo] = useState('');
    const [busquedaInsumo, setBusquedaInsumo] = useState('');
    const [listaInsumos, setListaInsumos] = useState([]);
    const [sugerencias, setSugerencias] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const wrapperRef = useRef(null);

    // Datos
    const [itemsPrecargados, setItemsPrecargados] = useState([]);
    const [pendientes, setPendientes] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);

    useEffect(() => {
        cargarOrdenes();
        cargarPendientes();
        cargarFiltrosInsumos();
    }, []);

    useEffect(() => {
        if (filtroInsumo) cargarOrdenes();
    }, [filtroInsumo]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setMostrarSugerencias(false);
            if (actionMenu.show && !event.target.closest('.action-menu-trigger') && !event.target.closest('.floating-action-menu')) closeActionMenu();
            if (estadoRef.current && !estadoRef.current.contains(event.target)) setShowEstadoDropdown(false);
        };
        const handleScroll = () => { if (actionMenu.show) closeActionMenu(); };
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [actionMenu.show, showEstadoDropdown]);

    useEffect(() => {
        if (busquedaInsumo === '') {
            setSugerencias([]);
            if (!filtroInsumo) setMostrarSugerencias(false);
        } else {
            const matches = listaInsumos.filter(item => {
                const term = busquedaInsumo.toLowerCase();
                return item.nombre.toLowerCase().includes(term) || item.codigo_sku.toLowerCase().includes(term);
            });
            setSugerencias(matches);
        }
    }, [busquedaInsumo, listaInsumos]);

    const cargarFiltrosInsumos = async () => {
        try {
            const res = await api.get('/index.php/compras/filtros');
            if (res.data.success) setListaInsumos(res.data.data);
        } catch (e) { }
    };

    const cargarOrdenes = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filtroInsumo) params.append('insumo_id', filtroInsumo);
            const res = await api.get(`/index.php/compras?${params.toString()}`);
            if (res.data.success) setOrdenes(res.data.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const cargarPendientes = async () => {
        try {
            const res = await api.get('/index.php/compras/pendientes');
            if (res.data.success) setPendientes(res.data.data);
        } catch (e) {
            if (e.response?.status === 403) console.warn("Sin permiso pendientes");
        }
    };

    const handleOmitirClick = (item) => {
        setConfirmOmitir({ show: true, ids: item.ids_detalle_solicitud, nombre: item.nombre });
    };

    const procesarOmitir = async () => {
        setConfirmOmitir({ ...confirmOmitir, show: false });
        // No activamos loading general para no bloquear toda la UI, solo refrescamos tabla
        try {
            const res = await api.post('/index.php/compras/omitir', { ids: confirmOmitir.ids });
            if (res.data.success) {
                setMsg({ show: true, title: 'Listo', text: 'Insumo quitado de pendientes.', type: 'success' });
                cargarPendientes();
            }
        } catch (error) {
            setMsg({ show: true, title: 'Error', text: error.response?.data?.message || 'Error al omitir.', type: 'error' });
        }
    };

    const toggleSeleccion = (id) => {
        setSeleccionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const generarOrdenDesdePendientes = () => {
        const itemsAProcesar = seleccionados.length > 0 ? pendientes.filter(p => seleccionados.includes(p.id)) : pendientes;
        const items = itemsAProcesar.map(p => ({
            id: p.id, nombre: p.nombre, sku: p.codigo_sku, unidad: p.unidad_medida,
            cantidad: parseFloat(p.cantidad_total), precio: parseFloat(p.precio) || 0,
            tipo: 'existente', origen_ids: p.ids_detalle_solicitud, ot_ids: p.lista_ots
        }));
        setItemsPrecargados(items);
        setShowModal(true);
    };

    const handleNewOrder = () => { setItemsPrecargados([]); setShowModal(true); };

    const handleActionMenuClick = (e, oc) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setActionMenu({ show: true, top: rect.bottom + window.scrollY + 2, left: rect.right - 180, id: oc.id, url: oc.url_archivo, estado: oc.estado });
    };

    const closeActionMenu = () => { setActionMenu({ ...actionMenu, show: false }); };

    const solicitarAnulacion = () => { closeActionMenu(); if (actionMenu.id) setConfirmModal({ show: true, id: actionMenu.id }); };

    const confirmarAnulacion = async () => {
        setConfirmModal({ show: false, id: null });
        try {
            const res = await api.post('/index.php/compras/cancelar', { id: confirmModal.id });
            if (res.data.success) {
                setMsg({ show: true, title: 'Anulada', text: 'Orden anulada correctamente.', type: 'success' });
                cargarOrdenes();
            } else { setMsg({ show: true, title: 'Error', text: res.data.message, type: 'error' }); }
        } catch (error) { setMsg({ show: true, title: 'Error', text: error.response?.data?.message, type: 'error' }); }
    };

    const handleAdjuntar = () => { setUploadModal({ show: true, id: actionMenu.id, url: actionMenu.url }); closeActionMenu(); };
    
    const handleRegenerarPdf = async (id) => {
        closeActionMenu(); setLoading(true);
        try {
            const res = await api.get(`/index.php/compras/regenerar-pdf?id=${id}`);
            if (res.data.success) { setMsg({ show: true, title: "Éxito", text: "PDF regenerado.", type: "success" }); cargarOrdenes(); }
            else { setMsg({ show: true, title: "Error", text: res.data.message, type: "error" }); }
        } catch (e) { setMsg({ show: true, title: "Error", text: "Error al regenerar PDF.", type: "error" }); }
        finally { setLoading(false); }
    };

    const handleDescargarPdf = async () => {
        closeActionMenu(); const id = actionMenu.id;
        try {
            const res = await api.get(`/index.php/compras/pdf?id=${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a'); link.href = url; link.setAttribute('download', `OC_${id}.pdf`);
            document.body.appendChild(link); link.click();
            setTimeout(() => { document.body.removeChild(link); window.URL.revokeObjectURL(url); }, 100);
        } catch (e) { setMsg({ show: true, title: "Error", text: "Error al descargar PDF.", type: "error" }); }
    };

    const handleDescargarExcel = async () => {
        closeActionMenu(); const id = actionMenu.id;
        try {
            const res = await api.get(`/index.php/exportar?modulo=detalle_oc&id=${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a'); link.href = url; link.setAttribute('download', `Detalle_OC_${id}.xlsx`);
            document.body.appendChild(link); link.click();
            setTimeout(() => { document.body.removeChild(link); window.URL.revokeObjectURL(url); }, 100);
        } catch (e) { setMsg({ show: true, title: "Error", text: "Error al descargar Excel.", type: "error" }); }
    };

    const handleExportar = async () => {
        try {
            const res = await api.get('/index.php/exportar?modulo=compras', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a'); link.href = url; link.setAttribute('download', `Reporte_Compras_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link); link.click();
            setTimeout(() => { document.body.removeChild(link); window.URL.revokeObjectURL(url); }, 100);
        } catch (e) { setMsg({ show: true, title: "Error", text: "Error al exportar.", type: "error" }); }
    };

    const toggleEstado = (estado) => {
        setFiltroEstado(prev => prev.includes(estado) ? prev.filter(e => e !== estado) : [...prev, estado]);
    };

    const limpiarFiltros = () => {
        setFiltroProveedor(''); setFiltroDestino(''); setFiltroEstado([]); setFiltroFecha(''); setFiltroInsumo(''); setBusquedaInsumo(''); setMostrarSugerencias(false); cargarOrdenes();
    };

    const seleccionarInsumo = (item) => { setFiltroInsumo(item.id); setBusquedaInsumo(item.nombre); setMostrarSugerencias(false); };

    const ordenesFiltradas = ordenes.filter(oc => {
        const matchProv = oc.proveedor.toLowerCase().includes(filtroProveedor.toLowerCase());
        const matchEst = filtroEstado.length === 0 || filtroEstado.includes(oc.estado);
        const matchDest = filtroDestino === '' || (oc.destino && oc.destino.toLowerCase().includes(filtroDestino.toLowerCase()));
        const fechaOC = oc.fecha_creacion.split(' ')[0];
        const matchFecha = filtroFecha ? fechaOC === filtroFecha : true;
        return matchProv && matchDest && matchEst && matchFecha;
    });

    const getBadgeColor = (estado) => {
        switch (estado) {
            case 'Emitida': return 'bg-primary';
            case 'Recepcion Parcial': return 'bg-warning text-dark';
            case 'Recepcion Total': return 'bg-success';
            case 'Anulada': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />
            <NuevaOrdenModal show={showModal} onClose={() => setShowModal(false)} onSave={() => { cargarOrdenes(); cargarPendientes(); }} itemsIniciales={itemsPrecargados} />
            <DetalleOrdenModal show={verModal.show} onHide={() => setVerModal({ show: false, id: null })} ordenId={verModal.id} onDownloadPdf={() => { setVerModal({ show: false }); handleDescargarPdf(); }} onExportExcel={() => { setVerModal({ show: false }); handleDescargarExcel(); }} />
            <SubirArchivoModal show={uploadModal.show} onClose={() => setUploadModal({ show: false, id: null, url: null })} ordenId={uploadModal.id} currentUrl={uploadModal.url} onSave={cargarOrdenes} />
            <RecepcionCompraModal show={recepcionModal.show} onClose={() => setRecepcionModal({ show: false, id: null })} ordenId={recepcionModal.id} onSave={() => { cargarOrdenes(); cargarPendientes(); }} />

            {confirmModal.show && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title fw-bold">Confirmar Anulación</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setConfirmModal({ show: false, id: null })}></button>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <p className="mb-1">¿Estás seguro de anular esta orden?</p>
                                <p className="text-muted small">Esta acción liberará los compromisos de compra.</p>
                            </div>
                            <div className="modal-footer justify-content-center bg-light">
                                <button type="button" className="btn btn-secondary px-4" onClick={() => setConfirmModal({ show: false, id: null })}>Cancelar</button>
                                <button type="button" className="btn btn-danger px-4 fw-bold" onClick={confirmarAnulacion}>Sí, Anular</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal 
                show={confirmOmitir.show} 
                onClose={() => setConfirmOmitir({ ...confirmOmitir, show: false })} 
                onConfirm={procesarOmitir} 
                title="¿Quitar de Pendientes?" 
                message={`¿Quitar "${confirmOmitir.nombre}" de la lista?\n\nEsto NO elimina la Orden de Trabajo original.`} 
                confirmText="Sí, Quitar" 
                cancelText="Cancelar" 
                type="danger" 
            />

            {actionMenu.show && (
                <div className="floating-action-menu shadow rounded bg-white border" style={{ position: 'absolute', top: actionMenu.top, left: actionMenu.left, zIndex: 9999, minWidth: '180px', padding: '0.5rem 0' }}>
                    {actionMenu.estado !== 'Anulada' && can('compras_adjuntar') && (
                        <button className="dropdown-item py-2 px-3 d-flex align-items-center" onClick={handleAdjuntar}><i className={`bi ${actionMenu.url ? "bi-paperclip text-success" : "bi-upload"} me-2`}></i>{actionMenu.url ? "Ver Archivo" : "Adjuntar"}</button>
                    )}
                    {can('compras_pdf') && <button className="dropdown-item py-2 px-3 d-flex align-items-center" onClick={handleDescargarPdf}><i className="bi bi-file-earmark-pdf text-danger me-2"></i> PDF</button>}
                    {can('compras_regenerar_pdf') && <button className="dropdown-item py-2 px-3 d-flex align-items-center text-primary" onClick={() => handleRegenerarPdf(actionMenu.id)}><i className="bi bi-arrow-clockwise me-2"></i> Regenerar PDF</button>}
                    {can('compras_exportar_detalle') && <button className="dropdown-item py-2 px-3 d-flex align-items-center" onClick={handleDescargarExcel}><i className="bi bi-file-earmark-excel text-success me-2"></i> Excel Detalle</button>}
                    {actionMenu.estado === 'Emitida' && can('compras_anular') && (
                        <>
                            <div className="dropdown-divider my-1"></div>
                            <button className="dropdown-item py-2 px-3 d-flex align-items-center text-danger fw-bold" onClick={solicitarAnulacion}><i className="bi bi-trash me-2"></i> Anular</button>
                        </>
                    )}
                </div>
            )}

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 flex-shrink-0">
                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary d-none d-sm-block"><i className="bi bi-cart3 fs-3"></i></div>
                        <h4 className="mb-0 fw-bold text-dark">Gestión de Compras</h4>
                    </div>
                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                        {can('compras_exportar') && <button className="btn btn-outline-success shadow-sm py-2 px-3" onClick={handleExportar} disabled={loading}><i className="bi bi-file-earmark-excel me-2"></i>Exportar</button>}
                        {can('compras_crear') && <button className="btn btn-primary shadow-sm py-2 px-3" onClick={handleNewOrder}><i className="bi bi-plus-lg me-2"></i>Nueva Orden</button>}
                    </div>
                </div>

                <div className="bg-light p-3 border-bottom">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-2"><div className="input-group"><span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span><input type="text" className="form-control border-start-0 ps-0" placeholder="Proveedor..." value={filtroProveedor} onChange={(e) => setFiltroProveedor(e.target.value)} /></div></div>
                        <div className="col-md-2"><div className="input-group"><span className="input-group-text bg-white border-end-0"><i className="bi bi-geo-alt"></i></span><input type="text" className="form-control border-start-0 ps-0" placeholder="Destino..." value={filtroDestino} onChange={(e) => setFiltroDestino(e.target.value)} /></div></div>
                        <div className="col-md-3 position-relative" ref={wrapperRef}>
                            <div className="input-group">
                                <span className={`input-group-text border-end-0 ${filtroInsumo ? 'bg-primary text-white' : 'bg-white text-primary'}`}><i className="bi bi-box-seam"></i></span>
                                <input type="text" className="form-control border-start-0 ps-0" placeholder="Insumo..." value={busquedaInsumo} onChange={(e) => { setBusquedaInsumo(e.target.value); setMostrarSugerencias(true); if (e.target.value === '') setFiltroInsumo(''); }} onFocus={() => setMostrarSugerencias(true)} />
                                {filtroInsumo && <button className="btn btn-outline-secondary border-start-0" type="button" onClick={() => { setFiltroInsumo(''); setBusquedaInsumo(''); setMostrarSugerencias(false); cargarOrdenes(); }}><i className="bi bi-x"></i></button>}
                            </div>
                            {mostrarSugerencias && busquedaInsumo && (
                                <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1050, maxHeight: '250px', overflowY: 'auto' }}>
                                    {sugerencias.length > 0 ? sugerencias.map(item => (<li key={item.id} className="list-group-item list-group-item-action cursor-pointer" onClick={() => seleccionarInsumo(item)}><div className="fw-bold small">{item.nombre}</div><small className="text-muted">{item.codigo_sku}</small></li>)) : <li className="list-group-item text-muted small">Sin resultados.</li>}
                                </ul>
                            )}
                        </div>
                        <div className="col-md-2 position-relative" ref={estadoRef}>
                            <button className="form-select text-start" onClick={() => setShowEstadoDropdown(!showEstadoDropdown)}>{filtroEstado.length === 0 ? "Estado" : `${filtroEstado.length} selec.`}</button>
                            {showEstadoDropdown && (
                                <div className="card position-absolute w-100 shadow-sm mt-1 p-2" style={{ zIndex: 1050 }}>
                                    {['Emitida', 'Recepcion Parcial', 'Recepcion Total', 'Anulada'].map(estado => (
                                        <div key={estado} className="form-check mb-1"><input className="form-check-input" type="checkbox" id={`check-${estado}`} checked={filtroEstado.includes(estado)} onChange={() => toggleEstado(estado)} /><label className="form-check-label small" htmlFor={`check-${estado}`}>{estado}</label></div>
                                    ))}
                                    <div className="border-top pt-2 mt-2 text-center"><button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={() => { setFiltroEstado([]); setShowEstadoDropdown(false); }}>Borrar</button></div>
                                </div>
                            )}
                        </div>
                        <div className="col-md-2"><input type="date" className="form-control" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} /></div>
                        <div className="col-md-1 text-end">{(filtroProveedor || filtroDestino || filtroEstado.length > 0 || filtroFecha || filtroInsumo) && <button className="btn btn-outline-secondary btn-sm w-100" onClick={limpiarFiltros}><i className="bi bi-x-lg"></i></button>}</div>
                    </div>
                </div>

                <div className="card-body p-0 flex-grow-1 overflow-auto position-relative bg-light">
                    
                    {/* --- SECCIÓN DE ALERTAS MEJORADA (ACORDEÓN) --- */}
                    {pendientes.length > 0 && can('compras_crear_insumos') && (
                        <div className="mx-3 mt-3 mb-2">
                            <div className="card border-warning shadow-sm">
                                <div className="card-header bg-warning bg-opacity-10 border-warning py-2 d-flex align-items-center justify-content-between" onClick={() => setExpandirPendientes(!expandirPendientes)} style={{cursor: 'pointer'}}>
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-exclamation-triangle-fill text-warning me-2 fs-5"></i>
                                        <div>
                                            <h6 className="fw-bold mb-0 text-dark" style={{fontSize: '0.95rem'}}>Solicitudes de Mantención Pendientes</h6>
                                            <div className="small text-muted lh-1">Hay <strong>{pendientes.length} insumos</strong> con déficit de stock.</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        {expandirPendientes && (
                                            <button 
                                                className="btn btn-sm btn-warning text-dark fw-bold border-dark px-3" 
                                                onClick={(e) => { e.stopPropagation(); generarOrdenDesdePendientes(); }}
                                                disabled={seleccionados.length === 0 && pendientes.length === 0}
                                            >
                                                {seleccionados.length > 0 ? `Procesar (${seleccionados.length})` : "Procesar Todos"}
                                            </button>
                                        )}
                                        <i className={`bi bi-chevron-${expandirPendientes ? 'up' : 'down'} text-dark ms-2`}></i>
                                    </div>
                                </div>
                                
                                {expandirPendientes && (
                                    <div className="card-body p-0">
                                        <div className="table-responsive" style={{maxHeight: '300px'}}>
                                            <table className="table table-sm table-hover align-middle mb-0 small table-striped">
                                                <thead className="table-light sticky-top">
                                                    <tr>
                                                        <th className="ps-3 text-center" style={{width: '40px'}}>
                                                            <input type="checkbox" className="form-check-input" checked={pendientes.length > 0 && seleccionados.length === pendientes.length} onChange={(e) => setSeleccionados(e.target.checked ? pendientes.map(p => p.id) : [])} />
                                                        </th>
                                                        <th>SKU</th>
                                                        <th>Insumo</th>
                                                        <th className="text-center">Déficit</th>
                                                        <th className="text-center">Stock</th>
                                                        <th className="text-end pe-3">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendientes.map(p => (
                                                        <tr key={p.id}>
                                                            <td className="ps-3 text-center">
                                                                <input type="checkbox" className="form-check-input" checked={seleccionados.includes(p.id)} onChange={() => toggleSeleccion(p.id)} />
                                                            </td>
                                                            <td className="font-monospace text-muted">{p.codigo_sku}</td>
                                                            <td className="fw-bold text-primary">
                                                                {p.nombre}
                                                                <div className="text-muted fw-normal fst-italic" style={{fontSize: '0.7rem'}}>Requerido en OTs: {p.lista_ots}</div>
                                                            </td>
                                                            <td className="text-center text-danger fw-bold">-{p.cantidad_total} {p.unidad_medida}</td>
                                                            <td className="text-center text-muted">{p.stock_actual}</td>
                                                            <td className="text-end pe-3">
                                                                <button className="btn btn-xs btn-outline-danger border-0" title="Omitir (No comprar)" onClick={() => handleOmitirClick(p)}>
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {loading ? <div className="text-center p-5"><div className="spinner-border text-primary"></div><p className="mt-2 text-muted">Cargando...</p></div> : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 bg-white" style={{ minWidth: '900px' }}>
                                <thead className="bg-light sticky-top text-uppercase text-muted small">
                                    <tr>
                                        <th className="ps-4">N° Orden</th>
                                        <th>Proveedor</th>
                                        <th>Fecha</th>
                                        <th>Destino</th>
                                        <th>Monto Total</th>
                                        <th>Estado</th>
                                        <th className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ordenesFiltradas.length > 0 ? ordenesFiltradas.map(oc => (
                                        <tr key={oc.id}>
                                            <td className="ps-4 fw-bold text-primary">#{oc.id}</td>
                                            <td><div className="fw-medium text-dark">{oc.proveedor}</div><small className="text-muted">{oc.proveedor_rut}</small></td>
                                            <td>{new Date(oc.fecha_creacion).toLocaleDateString()}</td>
                                            <td>{oc.destino ? <span className="badge bg-light text-dark border fw-normal">{oc.destino}</span> : <span className="text-muted small">-</span>}</td>
                                            <td className="fw-bold text-dark">${parseInt(oc.monto_total).toLocaleString()} {oc.moneda !== 'CLP' ? oc.moneda : ''}</td>
                                            <td><span className={`badge ${getBadgeColor(oc.estado)}`}>{oc.estado}</span></td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    {can('compras_detalle') && <button className="btn btn-sm btn-outline-primary" onClick={() => setVerModal({ show: true, id: oc.id })} title="Ver"><i className="bi bi-eye"></i></button>}
                                                    {oc.estado !== 'Anulada' && oc.estado !== 'Recepcion Total' && can('compras_recepcionar') && <button className="btn btn-sm btn-warning text-dark" onClick={() => setRecepcionModal({ show: true, id: oc.id })} title="Recepcionar"><i className="bi bi-truck"></i></button>}
                                                    <button className={`btn btn-sm btn-light border-0 action-menu-trigger ${actionMenu.id === oc.id && actionMenu.show ? 'active bg-light border' : ''}`} type="button" onClick={(e) => handleActionMenuClick(e, oc)}><i className="bi bi-three-dots-vertical"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="7" className="text-center py-5 text-muted">No se encontraron órdenes con esos filtros</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Compras;