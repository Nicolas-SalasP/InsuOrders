import { useEffect, useState, useRef } from 'react'; // Importamos useRef
import api from '../api/axiosConfig';
import NuevaOrdenModal from '../components/NuevaOrdenModal';
import DetalleOrdenModal from '../components/DetalleOrdenModal';
import SubirArchivoModal from '../components/SubirArchivoModal';
import RecepcionCompraModal from '../components/RecepcionCompraModal';
import MessageModal from '../components/MessageModal';

const Compras = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modales
    const [showModal, setShowModal] = useState(false); 
    const [verModal, setVerModal] = useState({ show: false, id: null }); 
    const [uploadModal, setUploadModal] = useState({ show: false, id: null }); 
    const [recepcionModal, setRecepcionModal] = useState({ show: false, id: null }); 
    
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });

    // Estados de Filtros
    const [filtroProveedor, setFiltroProveedor] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroFecha, setFiltroFecha] = useState('');
    
    // --- LÓGICA AUTOCOMPLETADO INSUMOS ---
    const [filtroInsumo, setFiltroInsumo] = useState(''); // El ID real para la API
    const [busquedaInsumo, setBusquedaInsumo] = useState(''); // Lo que escribe el usuario
    const [listaInsumos, setListaInsumos] = useState([]); // Todos los insumos
    const [sugerencias, setSugerencias] = useState([]); // Insumos filtrados
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const wrapperRef = useRef(null); // Para detectar click fuera

    const [itemsPrecargados, setItemsPrecargados] = useState([]);
    const [pendientes, setPendientes] = useState([]);

    useEffect(() => {
        cargarOrdenes();
        cargarPendientes();
        cargarFiltrosInsumos();
        
        // Evento para cerrar sugerencias al hacer click fuera
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setMostrarSugerencias(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Recargar al cambiar el ID del insumo seleccionado
    useEffect(() => {
        cargarOrdenes();
    }, [filtroInsumo]);

    // Filtrar sugerencias mientras escribe
    useEffect(() => {
        if (busquedaInsumo === '') {
            setSugerencias([]);
            if (!filtroInsumo) setMostrarSugerencias(false); // Si borra todo, ocultar
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
            if (filtroInsumo) params.append('insumo_id', filtroInsumo); // Usamos el ID
            
            // Nota: Los filtros locales (texto, estado) se aplican abajo en 'ordenesFiltradas'
            // Si quieres enviarlos al backend, agrégalos aquí. Por ahora mantengo tu lógica mixta.
            
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

    // ... (Tus funciones auxiliares se mantienen igual) ...
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
    const descargarPdfOC = async (id) => { /* ... tu código ... */ };
    const descargarExcelOC = async (id) => { /* ... tu código ... */ };
    const handleExportar = () => { /* ... tu código ... */ };

    const limpiarFiltros = () => {
        setFiltroProveedor('');
        setFiltroEstado('');
        setFiltroFecha('');
        
        // Limpiar autocompletado
        setFiltroInsumo('');
        setBusquedaInsumo('');
        setMostrarSugerencias(false);
        
        cargarOrdenes();
    };

    // Selección del Autocompletado
    const seleccionarInsumo = (item) => {
        setFiltroInsumo(item.id);       // Guardamos ID para la API
        setBusquedaInsumo(item.nombre); // Mostramos Nombre en el input
        setMostrarSugerencias(false);   // Ocultamos lista
    };

    // Lógica de Filtrado Local
    const ordenesFiltradas = ordenes.filter(oc => {
        const matchProveedor = oc.proveedor.toLowerCase().includes(filtroProveedor.toLowerCase());
        const matchEstado = filtroEstado ? oc.estado === filtroEstado : true;
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

            {/* MODALES */}
            <NuevaOrdenModal show={showModal} onClose={() => setShowModal(false)} onSave={() => { cargarOrdenes(); cargarPendientes(); }} itemsIniciales={itemsPrecargados} />
            <DetalleOrdenModal show={verModal.show} onClose={() => setVerModal({ show: false, id: null })} ordenId={verModal.id} />
            <SubirArchivoModal show={uploadModal.show} onClose={() => setUploadModal({ show: false, id: null })} ordenId={uploadModal.id} onSave={cargarOrdenes} />
            <RecepcionCompraModal show={recepcionModal.show} onClose={() => setRecepcionModal({ show: false, id: null })} ordenId={recepcionModal.id} onSave={() => { cargarOrdenes(); cargarPendientes(); }} />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-shrink-0">
                    <h4 className="mb-0 fw-bold text-dark"><i className="bi bi-cart3 me-2"></i>Gestión de Compras</h4>
                    <div>
                        <button className="btn btn-outline-success me-2" onClick={handleExportar} disabled={loading}><i className="bi bi-file-earmark-excel me-2"></i>Exportar</button>
                        <button className="btn btn-primary" onClick={handleNewOrder}><i className="bi bi-plus-lg me-2"></i>Nueva Orden</button>
                    </div>
                </div>

                {/* BARRA DE FILTROS */}
                <div className="bg-light p-3 border-bottom">
                    <div className="row g-2 align-items-center">
                        
                        {/* 1. Proveedor */}
                        <div className="col-md-3">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                                <input type="text" className="form-control border-start-0" placeholder="Buscar proveedor..." value={filtroProveedor} onChange={(e) => setFiltroProveedor(e.target.value)} />
                            </div>
                        </div>

                        {/* 2. AUTOCOMPLETADO INSUMO (MODIFICADO) */}
                        <div className="col-md-3 position-relative" ref={wrapperRef}>
                            <div className="input-group">
                                <span className={`input-group-text border-end-0 ${filtroInsumo ? 'bg-primary text-white' : 'bg-white text-primary'}`}>
                                    <i className="bi bi-box-seam"></i>
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control border-start-0" 
                                    placeholder="Escribe para filtrar insumo..." 
                                    value={busquedaInsumo}
                                    onChange={(e) => {
                                        setBusquedaInsumo(e.target.value);
                                        setMostrarSugerencias(true);
                                        if(e.target.value === '') setFiltroInsumo(''); // Limpiar ID si borra texto
                                    }}
                                    onFocus={() => setMostrarSugerencias(true)}
                                />
                                {filtroInsumo && (
                                    <button className="btn btn-outline-secondary border-start-0" type="button" onClick={() => {
                                        setFiltroInsumo('');
                                        setBusquedaInsumo('');
                                    }}>
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}
                            </div>

                            {/* Lista Flotante */}
                            {mostrarSugerencias && busquedaInsumo && (
                                <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1050, maxHeight: '250px', overflowY: 'auto' }}>
                                    {sugerencias.length > 0 ? (
                                        sugerencias.map(item => (
                                            <li 
                                                key={item.id} 
                                                className="list-group-item list-group-item-action cursor-pointer"
                                                onClick={() => seleccionarInsumo(item)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="fw-bold text-dark small">{item.nombre}</div>
                                                <small className="text-muted" style={{fontSize: '0.75rem'}}>SKU: {item.codigo_sku}</small>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="list-group-item text-muted small">No se encontraron insumos.</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        {/* 3. Estado */}
                        <div className="col-md-2">
                            <select className="form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                                <option value="">Todos los Estados</option>
                                <option value="Emitida">Emitida</option>
                                <option value="Recepcion Parcial">Recepción Parcial</option>
                                <option value="Recepcion Total">Recepción Total</option>
                                <option value="Anulada">Anulada</option>
                            </select>
                        </div>

                        {/* 4. Fecha */}
                        <div className="col-md-2">
                            <input type="date" className="form-control" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
                        </div>

                        {/* 5. Botón Limpiar */}
                        <div className="col-md-2 text-end">
                            {(filtroProveedor || filtroEstado || filtroFecha || filtroInsumo) && (
                                <button className="btn btn-outline-secondary btn-sm w-100" onClick={limpiarFiltros}><i className="bi bi-x-lg me-1"></i>Limpiar Filtros</button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card-body p-0 flex-grow-1 overflow-auto">
                    {/* ... (Resto de tu renderizado de alertas y tabla igual que antes) ... */}
                    {pendientes.length > 0 && (
                        <div className="alert alert-warning border-warning d-flex align-items-center justify-content-between m-3 shadow-sm fade show" role="alert">
                            <div className="d-flex align-items-center">
                                <div className="bg-warning text-white rounded-circle p-2 me-3 d-flex justify-content-center align-items-center" style={{ width: 40, height: 40 }}><i className="bi bi-bell-fill"></i></div>
                                <div><h6 className="fw-bold mb-0 text-dark">Solicitudes de Mantención Pendientes</h6><span className="small text-muted">Hay <strong>{pendientes.length} insumos</strong> marcados como 'Falta Stock'.</span></div>
                            </div>
                            <button className="btn btn-sm btn-warning fw-bold text-dark border-dark" onClick={generarOrdenDesdePendientes}>Generar OC con estos ítems <i className="bi bi-arrow-right ms-1"></i></button>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center p-5">Cargando órdenes...</div>
                    ) : (
                        <table className="table table-hover align-middle mb-0">
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
                                {ordenesFiltradas.length > 0 ? (
                                    ordenesFiltradas.map(oc => (
                                        <tr key={oc.id}>
                                            <td className="ps-4 fw-bold text-primary">#{oc.id}</td>
                                            <td><div className="fw-medium">{oc.proveedor}</div><small className="text-muted">{oc.proveedor_rut}</small></td>
                                            <td>{new Date(oc.fecha_creacion).toLocaleDateString()}</td>
                                            <td className="fw-bold text-dark">${parseInt(oc.monto_total).toLocaleString()} {oc.moneda !== 'CLP' ? oc.moneda : ''}</td>
                                            <td><span className={`badge ${getBadgeColor(oc.estado)}`}>{oc.estado}</span></td>
                                            <td className="text-end pe-4">
                                                {/* Botones de acción */}
                                                {oc.estado !== 'Anulada' && oc.estado !== 'Recepcion Total' && (
                                                    <button className="btn btn-sm btn-warning me-2 text-dark" title="Recepcionar" onClick={() => setRecepcionModal({ show: true, id: oc.id })}><i className="bi bi-truck"></i></button>
                                                )}
                                                <button onClick={() => descargarPdfOC(oc.id)} className="btn btn-sm btn-outline-danger me-2" title="Descargar PDF"><i className="bi bi-file-earmark-pdf"></i></button>
                                                <button onClick={() => descargarExcelOC(oc.id)} className="btn btn-sm btn-outline-success me-2" title="Descargar Excel"><i className="bi bi-file-earmark-excel"></i></button>
                                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setVerModal({ show: true, id: oc.id })} title="Ver Detalle"><i className="bi bi-eye"></i></button>
                                                {oc.url_archivo ? (
                                                    <a href={`http://localhost/insuorders/public_html${oc.url_archivo}`} target="_blank" className="btn btn-sm btn-success" title="Ver Respaldo"><i className="bi bi-paperclip"></i></a>
                                                ) : (
                                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setUploadModal({ show: true, id: oc.id })} title="Adjuntar PDF"><i className="bi bi-upload"></i></button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">No se encontraron órdenes con esos filtros</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Compras;