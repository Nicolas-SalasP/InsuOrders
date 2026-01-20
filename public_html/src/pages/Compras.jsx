import { useEffect, useState, useRef } from 'react';
import api from '../api/axiosConfig';
import NuevaOrdenModal from '../components/NuevaOrdenModal';
import DetalleOrdenModal from '../components/DetalleOrdenModal';
import SubirArchivoModal from '../components/SubirArchivoModal';
import RecepcionCompraModal from '../components/RecepcionCompraModal';
import MessageModal from '../components/MessageModal';

const Compras = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modales Principales
    const [showModal, setShowModal] = useState(false); 
    const [verModal, setVerModal] = useState({ show: false, id: null }); 
    const [uploadModal, setUploadModal] = useState({ show: false, id: null, url: null }); 
    const [recepcionModal, setRecepcionModal] = useState({ show: false, id: null }); 
    
    // Feedback y Confirmación
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ show: false, id: null });

    // Estado para el Menú Flotante
    const [actionMenu, setActionMenu] = useState({ show: false, top: 0, left: 0, id: null, url: null, estado: null });

    // --- FILTROS ---
    const [filtroProveedor, setFiltroProveedor] = useState('');
    const [filtroEstado, setFiltroEstado] = useState([]); 
    const [showEstadoDropdown, setShowEstadoDropdown] = useState(false); 
    const estadoRef = useRef(null); 
    const [filtroFecha, setFiltroFecha] = useState('');
    
    // Autocompletado Insumos
    const [filtroInsumo, setFiltroInsumo] = useState(''); 
    const [busquedaInsumo, setBusquedaInsumo] = useState(''); 
    const [listaInsumos, setListaInsumos] = useState([]); 
    const [sugerencias, setSugerencias] = useState([]); 
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const wrapperRef = useRef(null); 

    const [itemsPrecargados, setItemsPrecargados] = useState([]);
    const [pendientes, setPendientes] = useState([]);

    // --- EFECTO 1: Carga Inicial ---
    useEffect(() => {
        cargarOrdenes();
        cargarPendientes();
        cargarFiltrosInsumos();
    }, []);

    // --- EFECTO 2: Recarga por filtro de Insumo ---
    useEffect(() => {
        if (filtroInsumo) cargarOrdenes();
    }, [filtroInsumo]);

    // --- EFECTO 3: Manejo de UI (Clics externos y Scroll) ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setMostrarSugerencias(false);
            }
            if (actionMenu.show && !event.target.closest('.action-menu-trigger') && !event.target.closest('.floating-action-menu')) {
                closeActionMenu();
            }
            if (estadoRef.current && !estadoRef.current.contains(event.target)) {
                setShowEstadoDropdown(false);
            }
        };

        const handleScroll = () => { 
            if (actionMenu.show) closeActionMenu(); 
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true); 
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [actionMenu.show, showEstadoDropdown]);

    // --- LÓGICA DE SUGERENCIAS ---
    useEffect(() => {
        if (busquedaInsumo === '') {
            setSugerencias([]);
            if (!filtroInsumo) setMostrarSugerencias(false); 
        } else {
            const matches = listaInsumos.filter(item => {
                const term = busquedaInsumo.toLowerCase();
                return item.nombre.toLowerCase().includes(term) || 
                       item.codigo_sku.toLowerCase().includes(term);
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
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const cargarPendientes = async () => {
        try {
            const res = await api.get('/index.php/compras/pendientes');
            if (res.data.success) setPendientes(res.data.data);
        } catch (e) { }
    };

    const generarOrdenDesdePendientes = () => {
        const items = pendientes.map(p => ({
            id: p.id, nombre: p.nombre, sku: p.codigo_sku, unidad: p.unidad_medida,
            cantidad: parseFloat(p.cantidad_total), precio: parseFloat(p.precio) || 0,
            tipo: 'existente', origen_ids: p.ids_detalle_solicitud
        }));
        setItemsPrecargados(items);
        setShowModal(true);
    };
    
    const handleNewOrder = () => { setItemsPrecargados([]); setShowModal(true); };

    // --- MENÚ FLOTANTE ---
    const handleActionMenuClick = (e, oc) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setActionMenu({
            show: true,
            top: rect.bottom + window.scrollY + 2,
            left: rect.right - 180, 
            id: oc.id,
            url: oc.url_archivo,
            estado: oc.estado
        });
    };

    const closeActionMenu = () => {
        setActionMenu({ ...actionMenu, show: false });
    };

    // --- ANULACIÓN ---
    const solicitarAnulacion = () => {
        closeActionMenu();
        if (actionMenu.id) setConfirmModal({ show: true, id: actionMenu.id });
    };

    const confirmarAnulacion = async () => {
        setConfirmModal({ show: false, id: null });
        try {
            const res = await api.post('/index.php/compras/cancelar', { id: confirmModal.id });
            if (res.data.success) {
                setMsg({ show: true, title: 'Orden Anulada', text: 'La orden ha sido cancelada correctamente.', type: 'success' });
                cargarOrdenes(); 
            } else {
                setMsg({ show: true, title: 'Error', text: res.data.message || 'No se pudo anular la orden.', type: 'error' });
            }
        } catch (error) {
            setMsg({ show: true, title: 'Error', text: error.response?.data?.message || 'Error de conexión.', type: 'error' });
        }
    };

    // --- ACCIONES DEL MENÚ ---
    const handleAdjuntar = () => {
        setUploadModal({ show: true, id: actionMenu.id, url: actionMenu.url });
        closeActionMenu();
    };

    // --- REGENERAR PDF (NUEVO) ---
    const handleRegenerarPdf = async (id) => {
        closeActionMenu();
        // Usamos setLoading(true) solo si queremos bloquear la pantalla, 
        // o mejor usamos un estado local 'regenerando' para no recargar toda la tabla.
        // Aquí usaré setLoading global para simplicidad, pero puedes optimizarlo.
        setLoading(true); 
        try {
            const res = await api.get(`/index.php/compras/regenerar-pdf?id=${id}`); // Cambiado a GET si definiste la ruta así en index.php, o POST
            if (res.data.success) {
                setMsg({ show: true, title: "Éxito", text: "PDF regenerado correctamente.", type: "success" });
                cargarOrdenes(); // Recargamos para que el botón de descarga apunte al nuevo archivo
            } else {
                setMsg({ show: true, title: "Error", text: res.data.message, type: "error" });
            }
        } catch (e) {
            setMsg({ show: true, title: "Error", text: "No se pudo regenerar el PDF.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleDescargarPdf = async () => {
        closeActionMenu();
        const id = actionMenu.id;
        try {
            const res = await api.get(`/index.php/compras/pdf?id=${id}`, { responseType: 'blob' });
            if (res.data.type !== 'application/pdf') {
                throw new Error("El archivo recibido no es un PDF válido.");
            }
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `OC_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (e) { 
            console.error(e);
            setMsg({ show: true, title: "Error", text: "No se pudo generar el PDF. Intente 'Regenerar PDF'.", type: "error" });
        }
    };

    const handleDescargarExcel = async () => {
        closeActionMenu();
        const id = actionMenu.id;
        try {
            const res = await api.get(`/index.php/exportar?modulo=detalle_oc&id=${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Detalle_OC_${id}.xlsx`);
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (e) { 
            setMsg({ show: true, title: "Error", text: "Error al generar Excel del detalle", type: "error" });
        }
    };

    const handleExportar = async () => {
        try {
            const res = await api.get('/index.php/exportar?modulo=compras', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_Compras_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (e) { 
            setMsg({ show: true, title: "Error", text: "Error al exportar listado", type: "error" });
        }
    };

    // --- FILTRADO MÚLTIPLE DE ESTADOS ---
    const toggleEstado = (estado) => {
        setFiltroEstado(prev => {
            if (prev.includes(estado)) return prev.filter(e => e !== estado);
            return [...prev, estado];
        });
    };

    const limpiarFiltros = () => {
        setFiltroProveedor('');
        setFiltroEstado([]); 
        setFiltroFecha('');
        setFiltroInsumo('');
        setBusquedaInsumo('');
        setMostrarSugerencias(false);
        cargarOrdenes();
    };

    const seleccionarInsumo = (item) => {
        setFiltroInsumo(item.id); 
        setBusquedaInsumo(item.nombre); 
        setMostrarSugerencias(false); 
    };

    const ordenesFiltradas = ordenes.filter(oc => {
        const matchProveedor = oc.proveedor.toLowerCase().includes(filtroProveedor.toLowerCase());
        const matchEstado = filtroEstado.length === 0 || filtroEstado.includes(oc.estado);
        const fechaOC = oc.fecha_creacion.split(' ')[0];
        const matchFecha = filtroFecha ? fechaOC === filtroFecha : true;
        return matchProveedor && matchEstado && matchFecha;
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
            <DetalleOrdenModal 
                show={verModal.show} 
                onHide={() => setVerModal({ show: false, id: null })} 
                ordenId={verModal.id} 
                onDownloadPdf={() => { setVerModal({ show: false }); handleDescargarPdf(); }} 
                onExportExcel={() => { setVerModal({ show: false }); handleDescargarExcel(); }}
            />
            <SubirArchivoModal 
                show={uploadModal.show} 
                onClose={() => setUploadModal({ show: false, id: null, url: null })} 
                ordenId={uploadModal.id} 
                currentUrl={uploadModal.url} 
                onSave={cargarOrdenes} 
            />
            <RecepcionCompraModal show={recepcionModal.show} onClose={() => setRecepcionModal({ show: false, id: null })} ordenId={recepcionModal.id} onSave={() => { cargarOrdenes(); cargarPendientes(); }} />

            {/* --- MODAL DE CONFIRMACIÓN DE ANULACIÓN --- */}
            {confirmModal.show && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i>Confirmar Anulación</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setConfirmModal({ show: false, id: null })}></button>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <p className="mb-1 fs-5">¿Estás seguro de que deseas anular esta orden?</p>
                                <p className="text-muted small">Esta acción es irreversible y liberará los compromisos de compra.</p>
                            </div>
                            <div className="modal-footer justify-content-center bg-light">
                                <button type="button" className="btn btn-secondary px-4" onClick={() => setConfirmModal({ show: false, id: null })}>Cancelar</button>
                                <button type="button" className="btn btn-danger px-4 fw-bold" onClick={confirmarAnulacion}>Sí, Anular Orden</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MENÚ FLOTANTE (FIXED) --- */}
            {actionMenu.show && (
                <div 
                    className="floating-action-menu shadow rounded bg-white border"
                    style={{ position: 'absolute', top: actionMenu.top, left: actionMenu.left, zIndex: 9999, minWidth: '180px', padding: '0.5rem 0' }}
                >
                    {actionMenu.estado !== 'Anulada' && (
                        <>
                            <button className="dropdown-item py-2 px-3 d-flex align-items-center" onClick={handleAdjuntar}>
                                <i className={`bi ${actionMenu.url ? "bi-paperclip text-success" : "bi-upload"} me-2`}></i>
                                {actionMenu.url ? "Ver/Cambiar Archivo" : "Adjuntar Archivo"}
                            </button>
                            <div className="dropdown-divider my-1"></div>
                        </>
                    )}
                    <button className="dropdown-item py-2 px-3 d-flex align-items-center" onClick={handleDescargarPdf}>
                        <i className="bi bi-file-earmark-pdf text-danger me-2"></i> Descargar PDF
                    </button>
                    
                    {/* BOTÓN REGENERAR PDF */}
                    <button className="dropdown-item py-2 px-3 d-flex align-items-center text-primary" onClick={() => handleRegenerarPdf(actionMenu.id)}>
                        <i className="bi bi-arrow-clockwise me-2"></i> Regenerar PDF
                    </button>

                    <button className="dropdown-item py-2 px-3 d-flex align-items-center" onClick={handleDescargarExcel}>
                        <i className="bi bi-file-earmark-excel text-success me-2"></i> Descargar Excel
                    </button>
                    
                    {actionMenu.estado === 'Emitida' && (
                        <>
                            <div className="dropdown-divider my-1"></div>
                            <button className="dropdown-item py-2 px-3 d-flex align-items-center text-danger fw-bold" onClick={solicitarAnulacion}>
                                <i className="bi bi-trash me-2"></i> Anular Orden
                            </button>
                        </>
                    )}
                </div>
            )}

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 flex-shrink-0">
                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary d-none d-sm-block">
                             <i className="bi bi-cart3 fs-3"></i>
                        </div>
                        <h4 className="mb-0 fw-bold text-dark">Gestión de Compras</h4>
                    </div>
                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                        <button className="btn btn-outline-success shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-center py-2 px-3" onClick={handleExportar} disabled={loading}>
                            <i className="bi bi-file-earmark-excel fs-5 mb-1 mb-md-0 me-md-2"></i>
                            <span className="small fw-bold">Exportar</span>
                        </button>
                        <button className="btn btn-primary shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-center py-2 px-3" onClick={handleNewOrder}>
                            <i className="bi bi-plus-lg fs-5 mb-1 mb-md-0 me-md-2"></i>
                            <span className="small fw-bold">Nueva Orden</span>
                        </button>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="bg-light p-3 border-bottom">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-3">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                                <input type="text" className="form-control border-start-0 ps-0" placeholder="Buscar proveedor..." value={filtroProveedor} onChange={(e) => setFiltroProveedor(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-3 position-relative" ref={wrapperRef}>
                            <div className="input-group">
                                <span className={`input-group-text border-end-0 ${filtroInsumo ? 'bg-primary text-white' : 'bg-white text-primary'}`}>
                                    <i className="bi bi-box-seam"></i>
                                </span>
                                <input type="text" className="form-control border-start-0 ps-0" placeholder="Filtrar por insumo..." value={busquedaInsumo}
                                    onChange={(e) => { setBusquedaInsumo(e.target.value); setMostrarSugerencias(true); if(e.target.value === '') setFiltroInsumo(''); }}
                                    onFocus={() => setMostrarSugerencias(true)} />
                                {filtroInsumo && (
                                    <button className="btn btn-outline-secondary border-start-0" type="button" onClick={() => { setFiltroInsumo(''); setBusquedaInsumo(''); setMostrarSugerencias(false); cargarOrdenes(); }}>
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}
                            </div>
                            {mostrarSugerencias && busquedaInsumo && (
                                <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1050, maxHeight: '250px', overflowY: 'auto' }}>
                                    {sugerencias.length > 0 ? sugerencias.map(item => (
                                        <li key={item.id} className="list-group-item list-group-item-action cursor-pointer" onClick={() => seleccionarInsumo(item)} style={{ cursor: 'pointer' }}>
                                            <div className="fw-bold text-dark small">{item.nombre}</div>
                                            <small className="text-muted" style={{fontSize: '0.75rem'}}>SKU: {item.codigo_sku}</small>
                                        </li>
                                    )) : <li className="list-group-item text-muted small">No se encontraron insumos.</li>}
                                </ul>
                            )}
                        </div>
                        
                        {/* --- SELECTOR DE ESTADOS MÚLTIPLES --- */}
                        <div className="col-md-2 position-relative" ref={estadoRef}>
                            <button 
                                className="form-select text-start" 
                                onClick={() => setShowEstadoDropdown(!showEstadoDropdown)}
                            >
                                {filtroEstado.length === 0 ? "Todos los Estados" : `${filtroEstado.length} seleccionado(s)`}
                            </button>
                            {showEstadoDropdown && (
                                <div className="card position-absolute w-100 shadow-sm mt-1 p-2" style={{ zIndex: 1050 }}>
                                    {['Emitida', 'Recepcion Parcial', 'Recepcion Total', 'Anulada'].map(estado => (
                                        <div key={estado} className="form-check mb-1">
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                id={`check-${estado}`}
                                                checked={filtroEstado.includes(estado)}
                                                onChange={() => toggleEstado(estado)}
                                            />
                                            <label className="form-check-label small" htmlFor={`check-${estado}`}>
                                                {estado}
                                            </label>
                                        </div>
                                    ))}
                                    <div className="border-top pt-2 mt-2 text-center">
                                        <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={() => { setFiltroEstado([]); setShowEstadoDropdown(false); }}>Borrar</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="col-md-2"><input type="date" className="form-control" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} /></div>
                        <div className="col-md-2 text-end">
                            {(filtroProveedor || filtroEstado.length > 0 || filtroFecha || filtroInsumo) && (
                                <button className="btn btn-outline-secondary btn-sm w-100" onClick={limpiarFiltros}><i className="bi bi-x-lg me-1"></i>Limpiar Filtros</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* TABLA DE RESULTADOS */}
                <div className="card-body p-0 flex-grow-1 overflow-auto position-relative">
                    {pendientes.length > 0 && (
                        <div className="alert alert-warning border-warning d-flex align-items-center justify-content-between m-3 shadow-sm fade show" role="alert">
                            <div className="d-flex align-items-center">
                                <div className="bg-warning text-white rounded-circle p-2 me-3 d-flex justify-content-center align-items-center" style={{ width: 40, height: 40 }}><i className="bi bi-bell-fill"></i></div>
                                <div><h6 className="fw-bold mb-0 text-dark">Solicitudes de Mantención Pendientes</h6><span className="small text-muted">Hay <strong>{pendientes.length} insumos</strong> marcados como 'Falta Stock'.</span></div>
                            </div>
                            <button className="btn btn-sm btn-warning fw-bold text-dark border-dark" onClick={generarOrdenDesdePendientes}>Generar OC con estos ítems <i className="bi bi-arrow-right ms-1"></i></button>
                        </div>
                    )}

                    {loading ? <div className="text-center p-5">Cargando órdenes...</div> : (
                        <table className="table table-hover align-middle mb-0" style={{ minWidth: '900px' }}>
                            <thead className="bg-light sticky-top">
                                <tr>
                                    <th className="ps-4">N° Orden</th>
                                    <th>Proveedor</th>
                                    <th>Fecha</th>
                                    <th>Monto Total</th>
                                    <th>Estado</th>
                                    <th className="text-end pe-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordenesFiltradas.length > 0 ? ordenesFiltradas.map(oc => (
                                    <tr key={oc.id}>
                                        <td className="ps-4 fw-bold text-primary">#{oc.id}</td>
                                        <td>
                                            <div className="fw-medium">{oc.proveedor}</div>
                                            <small className="text-muted">{oc.proveedor_rut}</small>
                                        </td>
                                        <td>{new Date(oc.fecha_creacion).toLocaleDateString()}</td>
                                        <td className="fw-bold text-dark">
                                            ${parseInt(oc.monto_total).toLocaleString()} {oc.moneda !== 'CLP' ? oc.moneda : ''}
                                        </td>
                                        <td><span className={`badge ${getBadgeColor(oc.estado)}`}>{oc.estado}</span></td>
                                        
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end align-items-center gap-2">
                                                <button 
                                                    className="btn btn-sm btn-outline-primary" 
                                                    onClick={() => setVerModal({ show: true, id: oc.id })} 
                                                    title="Ver Detalle"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>

                                                {oc.estado !== 'Anulada' && oc.estado !== 'Recepcion Total' && (
                                                    <button 
                                                        className="btn btn-sm btn-warning text-dark" 
                                                        onClick={() => setRecepcionModal({ show: true, id: oc.id })} 
                                                        title="Recepcionar"
                                                    >
                                                        <i className="bi bi-truck"></i>
                                                    </button>
                                                )}

                                                <button 
                                                    className={`btn btn-sm btn-light border-0 action-menu-trigger ${actionMenu.id === oc.id && actionMenu.show ? 'active bg-light border' : ''}`}
                                                    type="button" 
                                                    onClick={(e) => handleActionMenuClick(e, oc)}
                                                >
                                                    <i className="bi bi-three-dots-vertical fs-5"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="6" className="text-center py-5 text-muted">No se encontraron órdenes con esos filtros</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Compras;