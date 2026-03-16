import { useEffect, useState, useRef } from 'react';
import api from '../api/axiosConfig';
import { usePermission } from '../hooks/usePermission';
import NuevaSolicitudModal from '../components/NuevaSolicitudModal';
import DetalleSolicitudModal from '../components/DetalleSolicitudModal';
import MessageModal from '../components/MessageModal';
import ConfirmModal from '../components/ConfirmModal';

const blinkStyle = `
@keyframes blink-animation {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
.blink-badge {
  animation: blink-animation 1s infinite;
}
`;

const Mantencion = () => {
    const { can } = usePermission();
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [otEditar, setOtEditar] = useState(null);
    const [detalleModal, setDetalleModal] = useState({ show: false, id: null });

    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });
    const [confirmAnular, setConfirmAnular] = useState({ show: false, id: null });
    const [confirmFinish, setConfirmFinish] = useState({ show: false, id: null });

    const [openMenuId, setOpenMenuId] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 }); 

    const [filtroOT, setFiltroOT] = useState('');
    const [filtroMaquina, setFiltroMaquina] = useState('');
    const [filtroUbicacion, setFiltroUbicacion] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroFecha, setFiltroFecha] = useState('');

    const [filtroInsumo, setFiltroInsumo] = useState('');
    const [busquedaInsumo, setBusquedaInsumo] = useState('');
    const [listaInsumos, setListaInsumos] = useState([]);
    const [sugerencias, setSugerencias] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    
    const [filtroSinTecnico, setFiltroSinTecnico] = useState(false);
    const [ordenOTAsc, setOrdenOTAsc] = useState(false);

    const wrapperRef = useRef(null);
    const todayStr = new Date().toISOString().split('T')[0];

    useEffect(() => {
        cargarListaInsumos();

        const handleGlobalClick = (event) => {
            if (!event.target.closest('.menu-trigger-btn') && !event.target.closest('.dropdown-menu-fixed')) {
                setOpenMenuId(null);
            }
        };
        const handleScroll = () => setOpenMenuId(null); 

        document.addEventListener('mousedown', handleGlobalClick);
        window.addEventListener('scroll', handleScroll, true);

        const styleSheet = document.createElement("style");
        styleSheet.innerText = blinkStyle;
        document.head.appendChild(styleSheet);

        return () => {
            document.removeEventListener('mousedown', handleGlobalClick);
            window.removeEventListener('scroll', handleScroll, true);
            document.head.removeChild(styleSheet);
        };

    }, []);

    useEffect(() => {
        cargarSolicitudes();
    }, [filtroInsumo]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setMostrarSugerencias(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const cargarListaInsumos = async () => {
        try {
            const res = await api.get('/index.php/compras/filtros');
            if (res.data.success) setListaInsumos(res.data.data);
        } catch (e) { console.error(e); }
    };

    const cargarSolicitudes = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filtroInsumo) params.append('insumo_id', filtroInsumo);
            if (filtroOT) params.append('ot', filtroOT);
            if (filtroMaquina) params.append('maquina', filtroMaquina);
            if (filtroEstado) params.append('estado', filtroEstado);
            if (filtroFecha) params.append('fecha', filtroFecha);

            const res = await api.get(`/index.php/mantencion?${params.toString()}`);
            if (res.data.success) {
                setSolicitudes(res.data.data);
            }
        } catch (error) {
            setMsg({ show: true, title: "Error", text: "No se pudieron cargar las solicitudes.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleNew = () => { setOtEditar(null); setShowModal(true); };

    const handleEdit = (ot) => {
        setOpenMenuId(null);
        setOtEditar(ot);
        setShowModal(true);
    };

    const solicitarAnulacion = (id) => {
        setOpenMenuId(null);
        setConfirmAnular({ show: true, id: id });
    };

    const confirmarAnulacion = async () => {
        setConfirmAnular({ ...confirmAnular, show: false });
        try {
            await api.delete(`/index.php/mantencion?id=${confirmAnular.id}`);
            cargarSolicitudes();
            setMsg({ show: true, title: "Anulada", text: "OT Anulada correctamente.", type: "success" });
        } catch (error) {
            setMsg({ show: true, title: "Error", text: "No se pudo anular.", type: "error" });
        }
    };

    const solicitarFinalizar = (id) => {
        setConfirmFinish({ show: true, id: id });
    };

    const ejecutarFinalizar = async () => {
        setConfirmFinish({ show: false, id: null });
        setLoading(true);
        try {
            await api.post('/index.php/mantencion/finalizar', { id: confirmFinish.id });
            setMsg({ show: true, title: "Finalizada", text: "OT Completada.", type: "success" });
            cargarSolicitudes();
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.message || "Error al finalizar.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const toggleMenu = (id, event) => {
        event.stopPropagation(); 
        event.preventDefault(); 

        if (openMenuId === id) {
            setOpenMenuId(null);
        } else {
            const rect = event.currentTarget.getBoundingClientRect();
            const top = rect.bottom + window.scrollY + 2;
            const left = (rect.left + window.scrollX) - 130; 
            setMenuPos({ top, left });
            setOpenMenuId(id);
        }
    };

    const descargarPdfOT = async (id) => {
        try {
            setLoading(true);
            const res = await api.get(`/index.php/mantencion/pdf?id=${id}&type=solicitud`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Solicitud_OT_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            setMsg({ show: true, title: "Error", text: "No se pudo descargar el PDF", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const descargarExcelOT = async (id) => {
        try {
            setLoading(true);
            const res = await api.get(`/index.php/exportar?modulo=detalle_ot&id=${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Detalle_OT_${id}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            setMsg({ show: true, title: "Error", text: "No se pudo descargar el Excel", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleExportar = () => {
        setLoading(true);
        api.get('/index.php/exportar?modulo=mantencion', { responseType: 'blob' })
            .then((res) => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Mantencion_${new Date().toISOString().slice(0, 10)}.xlsx`);
                document.body.appendChild(link);
                link.click();
            })
            .catch(() => setMsg({ show: true, title: "Error", text: "Error al exportar", type: "error" }))
            .finally(() => setLoading(false));
    };

    const seleccionarInsumo = (item) => {
        setFiltroInsumo(item.id);
        setBusquedaInsumo(item.nombre);
        setMostrarSugerencias(false);
    };

    const limpiarFiltros = () => {
        setFiltroOT('');
        setFiltroMaquina('');
        setFiltroUbicacion('');
        setFiltroEstado('');
        setFiltroFecha('');
        setFiltroInsumo('');
        setBusquedaInsumo('');
        setMostrarSugerencias(false);
        setFiltroSinTecnico(false);
        setOrdenOTAsc(false);
        cargarSolicitudes();
    };

    const isCritico = (prio) => {
        if (!prio) return false;
        const p = prio.toString().toUpperCase().trim();
        return p === 'CRITICO' || p === 'CRÍTICO' || p === 'CRITICA' || p === 'CRÍTICA';
    };

    const getPrioridadValor = (prio) => {
        if (!prio) return 6;
        const p = prio.toString().toUpperCase().trim();
        
        if (p === 'CRITICO' || p === 'CRÍTICO' || p === 'CRITICA' || p === 'CRÍTICA') return 1;
        if (p === 'URGENTE') return 2;
        if (p === 'ALTA' || p === 'ALTO') return 3;
        if (p === 'MEDIA' || p === 'MEDIO') return 4;
        if (p === 'BAJA' || p === 'BAJO') return 5;
        
        return 6;
    };

    const getPriorityBadge = (prio) => {
        if (isCritico(prio)) {
            return <span className="badge bg-danger blink-badge border border-white shadow-sm">CRÍTICO 🚨</span>;
        }
        
        const p = prio ? prio.toString().toUpperCase().trim() : '';

        if (p === 'BAJA' || p === 'BAJO') return <span className="badge bg-secondary">Baja</span>;
        if (p === 'MEDIA' || p === 'MEDIO') return <span className="badge bg-info text-dark">Media</span>;
        if (p === 'ALTA' || p === 'ALTO') return <span className="badge bg-warning text-dark">Alta</span>;
        if (p === 'URGENTE') return <span className="badge bg-danger">Urgente</span>;
        
        return <span className="badge bg-light text-dark border">{prio || 'No def.'}</span>;
    };

    const solicitudesFiltradas = solicitudes.filter(s => {
        const matchOT = !filtroOT || s.id.toString().includes(filtroOT);
        const maquinaStr = (s.activo || '') + ' ' + (s.activo_codigo || '');
        const matchMaquina = !filtroMaquina || maquinaStr.toLowerCase().includes(filtroMaquina.toLowerCase());
        const matchUbicacion = !filtroUbicacion || (s.ubicacion && s.ubicacion.toLowerCase().includes(filtroUbicacion.toLowerCase()));
        
        // LÓGICA DE ESTADO INTELIGENTE PARA EL FILTRO:
        // Si el usuario filtra por "Pendiente", NO debe traer las que en realidad son "Programadas".
        let estadoVirtual = s.estado;
        const reqStr = s.fecha_requerida ? s.fecha_requerida.substring(0, 10) : null;
        if (reqStr && reqStr > todayStr && (s.estado_id === 1 || s.estado_id === 4)) {
            estadoVirtual = 'Programada';
        }
        
        const matchEstado = !filtroEstado || estadoVirtual === filtroEstado || s.estado === filtroEstado;
        
        const fechaOT = s.fecha_solicitud ? s.fecha_solicitud.split(' ')[0] : '';
        const matchFecha = !filtroFecha || fechaOT === filtroFecha;
        const matchSinTecnico = !filtroSinTecnico || !s.asignados_nombres;

        return matchOT && matchMaquina && matchUbicacion && matchEstado && matchFecha && matchSinTecnico;
    }).sort((a, b) => {
        if (ordenOTAsc) {
            return parseInt(a.id) - parseInt(b.id); 
        }
        const prioA = getPrioridadValor(a.prioridad);
        const prioB = getPrioridadValor(b.prioridad);
        
        if (prioA !== prioB) {
            return prioA - prioB;
        }
        
        return parseInt(b.id) - parseInt(a.id);
    });

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />

            <ConfirmModal
                show={confirmAnular.show}
                onClose={() => setConfirmAnular({ show: false, id: null })}
                onConfirm={confirmarAnulacion}
                title="Anular OT"
                message="¿Estás seguro de anular esta solicitud? Esta acción es irreversible."
                confirmText="Sí, Anular"
                type="danger"
            />

            <ConfirmModal
                show={confirmFinish.show}
                onClose={() => setConfirmFinish({ show: false, id: null })}
                onConfirm={ejecutarFinalizar}
                title="Finalizar Trabajo"
                message={`¿Confirmas que el trabajo está terminado?\n\nCualquier insumo que no haya sido entregado se marcará como CANCELADO en Bodega.`}
                confirmText="Sí, Finalizar OT"
                type="success"
            />

            <NuevaSolicitudModal show={showModal} onClose={() => setShowModal(false)} onSave={cargarSolicitudes} otEditar={otEditar} />

            <DetalleSolicitudModal
                show={detalleModal.show}
                onClose={() => setDetalleModal({ show: false, id: null })}
                solicitudId={detalleModal.id}
                onSave={cargarSolicitudes}
            />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 flex-shrink-0">
                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary d-none d-sm-block">
                            <i className="bi bi-wrench-adjustable fs-3"></i>
                        </div>
                        <h4 className="mb-0 fw-bold text-dark">Mantención</h4>
                    </div>
                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                        {can('mant_excel') && (
                            <button className="btn btn-outline-success shadow-sm d-flex align-items-center" onClick={handleExportar} disabled={loading}>
                                <i className="bi bi-file-earmark-excel fs-5 me-2"></i>Exportar
                            </button>
                        )}
                        {can('mant_crear') && (
                            <button className="btn btn-warning shadow-sm d-flex align-items-center fw-bold" onClick={handleNew}>
                                <i className="bi bi-plus-lg fs-5 me-2"></i>Crear OT
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-3 bg-light border-bottom">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-2">
                            <input type="text" className="form-control" placeholder="# OT" value={filtroOT} onChange={e => setFiltroOT(e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <input type="text" className="form-control" placeholder="Máquina/Activo..." value={filtroMaquina} onChange={e => setFiltroMaquina(e.target.value)} />
                        </div>
                        
                        <div className="col-md-2">
                            <input type="text" className="form-control" placeholder="Ubicación (ej: HOR)..." value={filtroUbicacion} onChange={e => setFiltroUbicacion(e.target.value)} />
                        </div>

                        <div className="col-md-2 position-relative" ref={wrapperRef}>
                            <div className="input-group">
                                <span className={`input-group-text border-end-0 ${filtroInsumo ? 'bg-primary text-white' : 'bg-white text-primary'}`}>
                                    <i className="bi bi-box-seam"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Insumo..."
                                    value={busquedaInsumo}
                                    onChange={(e) => {
                                        setBusquedaInsumo(e.target.value);
                                        setMostrarSugerencias(true);
                                        if (e.target.value === '') setFiltroInsumo('');
                                    }}
                                    onFocus={() => setMostrarSugerencias(true)}
                                />
                                {filtroInsumo && (
                                    <button className="btn btn-outline-secondary border-start-0" type="button" onClick={() => { setFiltroInsumo(''); setBusquedaInsumo(''); setMostrarSugerencias(false); cargarSolicitudes(); }}>
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}
                            </div>
                            {mostrarSugerencias && busquedaInsumo && (
                                <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1050, maxHeight: '250px', overflowY: 'auto' }}>
                                    {sugerencias.length > 0 ? sugerencias.map(item => (
                                        <li key={item.id} className="list-group-item list-group-item-action cursor-pointer" onClick={() => seleccionarInsumo(item)} style={{ cursor: 'pointer' }}>
                                            <div className="fw-bold text-dark small">{item.nombre}</div>
                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>SKU: {item.codigo_sku}</small>
                                        </li>
                                    )) : <li className="list-group-item text-muted small">No se encontraron insumos.</li>}
                                </ul>
                            )}
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                                <option value="">Estado: Todos</option>
                                <option value="Pendiente">Pendiente (Hoy)</option>
                                <option value="Programada">Programadas (Futuro)</option>
                                <option value="En Proceso">En Proceso</option>
                                <option value="Completada">Completada</option>
                                <option value="Anulada">Anulada</option>
                            </select>
                        </div>
                        <div className="col-md-2 text-end">
                            {(filtroOT || filtroMaquina || filtroUbicacion || filtroEstado || filtroFecha || filtroInsumo || filtroSinTecnico || ordenOTAsc) && (
                                <button className="btn btn-outline-secondary w-100" onClick={limpiarFiltros}>
                                    <i className="bi bi-x-lg me-1"></i> Limpiar
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-12 d-flex flex-wrap gap-2">
                            <button 
                                className={`btn btn-sm shadow-sm ${filtroSinTecnico ? 'btn-danger text-white border-danger' : 'btn-outline-secondary bg-white'}`}
                                onClick={() => setFiltroSinTecnico(!filtroSinTecnico)}
                            >
                                <i className="bi bi-person-x-fill me-2"></i>
                                {filtroSinTecnico ? 'Mostrando: Sin Técnico Asignado' : 'Filtrar: Sin Técnico'}
                            </button>
                            
                            <button 
                                className={`btn btn-sm shadow-sm ${ordenOTAsc ? 'btn-primary text-white border-primary' : 'btn-outline-secondary bg-white'}`}
                                onClick={() => setOrdenOTAsc(!ordenOTAsc)}
                            >
                                <i className={`bi ${ordenOTAsc ? 'bi-sort-numeric-down' : 'bi-sort-down-alt'} me-2`}></i> 
                                {ordenOTAsc ? 'Orden: N° OT (Menor a Mayor)' : 'Orden: Prioridad y Recientes'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-grow-1 overflow-auto">
                    {loading ? (
                        <div className="d-flex flex-column justify-content-center align-items-center h-100">
                            <div className="spinner-border text-primary mb-2" role="status"></div>
                            <span className="text-muted">Cargando solicitudes...</span>
                        </div>
                    ) : (
                        <table className="table table-hover align-middle mb-0" style={{ minWidth: '1000px' }}>
                            <thead className="bg-light sticky-top" style={{ zIndex: 1 }}>
                                <tr>
                                    <th className="ps-4">OT #</th>
                                    <th>Máquina / Activo</th>
                                    <th>Descripción</th>
                                    <th>Solicitante</th>
                                    <th className="py-3 px-3">Fecha Prog / Creación</th>
                                    <th>Prioridad</th>
                                    <th>Estado</th>
                                    <th className="text-end pe-4" style={{ minWidth: '200px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudesFiltradas.length > 0 ? solicitudesFiltradas.map(s => {
                                    const critico = isCritico(s.prioridad);

                                    // LÓGICA VISUAL: ESTADO PROGRAMADA O PENDIENTE NORMAL
                                    const reqStr = s.fecha_requerida ? s.fecha_requerida.substring(0, 10) : null;
                                    const isFutura = reqStr && reqStr > todayStr;
                                    
                                    let estadoTexto = s.estado;
                                    let badgeClass = 'bg-warning text-dark';
                                    
                                    if (isFutura && (parseInt(s.estado_id) === 1 || parseInt(s.estado_id) === 4)) {
                                        estadoTexto = 'PROGRAMADA';
                                        badgeClass = 'bg-primary text-white shadow-sm';
                                    } else {
                                        if (s.estado === 'En Proceso') badgeClass = 'bg-info text-dark';
                                        else if (s.estado === 'Completada') badgeClass = 'bg-success text-white';
                                        else if (s.estado === 'Anulada' || s.estado === 'Cancelada') badgeClass = 'bg-danger text-white';
                                    }

                                    const rowStyle = critico ? {
                                        '--bs-table-bg': '#ffe6e6',
                                        '--bs-table-accent-bg': '#ffe6e6',
                                        backgroundColor: '#ffe6e6',
                                        borderLeft: '5px solid #dc3545'
                                    } : {};

                                    return (
                                        <tr
                                            key={s.id}
                                            style={rowStyle}
                                            className={`${s.estado === 'Anulada' ? 'bg-light text-muted' : ''} ${critico ? 'text-danger fw-bold' : ''}`}
                                        >
                                            <td className="ps-4 fw-bold">#{s.id}</td>
                                            <td>
                                                <div className="fw-bold text-dark">{s.activo || 'General'}</div>
                                                {s.activo_codigo && <small className="text-muted d-block">{s.activo_codigo}</small>}
                                                {s.sub_activo_nombre && (
                                                    <small className="text-primary fw-bold d-block"><i className="bi bi-arrow-return-right me-1"></i>{s.sub_activo_nombre}</small>
                                                )}
                                                {s.ubicacion && <span className="badge bg-light text-secondary border mt-1"><i className="bi bi-geo-alt me-1"></i>{s.ubicacion}</span>}
                                            </td>
                                            <td>
                                                <div className="fw-bold text-dark">{s.titulo || ''}</div>
                                                <small className="text-muted text-truncate d-block" style={{ maxWidth: '200px' }}>{s.descripcion_trabajo || '-'}</small>
                                            </td>
                                            <td>
                                                <div className="text-dark">{s.solicitante_nombre} {s.solicitante_apellido}</div>
                                                <div className="small mt-1 text-truncate" style={{maxWidth: '150px'}}>
                                                    {s.asignados_nombres ? (
                                                        <span className="text-primary"><i className="bi bi-tools me-1"></i>{s.asignados_nombres}</span>
                                                    ) : (
                                                        <span className="text-danger fw-medium"><i className="bi bi-exclamation-circle me-1"></i>Sin Asignar</span>
                                                    )}
                                                </div>
                                            </td>
                                            
                                            {/* LÓGICA VISUAL DE FECHA PROGRAMADA vs FECHA CREACIÓN */}
                                            <td className="small px-3">
                                                {isFutura ? (
                                                    <span className="badge bg-primary text-white shadow-sm fw-bold px-2 py-1">
                                                        <i className="bi bi-calendar-event me-1"></i>
                                                        {new Date(s.fecha_requerida + 'T00:00:00').toLocaleDateString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted fw-medium">
                                                        <i className="bi bi-clock-history me-1"></i>
                                                        {new Date(s.fecha_solicitud).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </td>

                                            <td>{getPriorityBadge(s.prioridad)}</td>
                                            <td><span className={`badge ${badgeClass}`}>{estadoTexto}</span></td>

                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end align-items-center gap-2">

                                                    {s.estado !== 'Completada' && s.estado !== 'Anulada' && (
                                                        <>
                                                            {can('mant_finalizar') && (
                                                                <button
                                                                    className="btn btn-sm btn-success fw-bold px-2 py-1"
                                                                    onClick={() => solicitarFinalizar(s.id)}
                                                                    title="Finalizar Trabajo"
                                                                >
                                                                    <i className="bi bi-check2-circle"></i>
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                    <button
                                                        className={`btn btn-sm btn-light border menu-trigger-btn ${openMenuId === s.id ? 'active' : ''}`}
                                                        type="button"
                                                        onClick={(e) => toggleMenu(s.id, e)}
                                                    >
                                                        <i className="bi bi-three-dots-vertical"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan="8" className="text-center py-5 text-muted">No se encontraron solicitudes con los filtros actuales.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MENÚ FLOTANTE */}
            {openMenuId && (
                <div
                    className="dropdown-menu shadow show border-0 dropdown-menu-fixed"
                    style={{
                        position: 'fixed', 
                        top: menuPos.top,
                        left: menuPos.left,
                        zIndex: 9999, 
                        minWidth: '160px'
                    }}
                >
                    {(() => {
                        const s = solicitudes.find(sol => sol.id === openMenuId);
                        if (!s) return null;

                        return (
                            <>
                                <button className="dropdown-item py-2" onClick={() => { setOpenMenuId(null); setDetalleModal({ show: true, id: s.id }); }}>
                                    <i className="bi bi-eye text-info me-2"></i>Ver Detalle
                                </button>

                                {can('mant_editar') && s.estado !== 'Completada' && s.estado !== 'Anulada' && (
                                    <button className="dropdown-item py-2" onClick={() => handleEdit(s)}>
                                        <i className="bi bi-pencil-square text-primary me-2"></i>Editar OT
                                    </button>
                                )}

                                {can('mant_pdf') && (
                                    <button className="dropdown-item py-2" onClick={() => { setOpenMenuId(null); descargarPdfOT(s.id); }}>
                                        <i className="bi bi-file-earmark-pdf text-danger me-2"></i>Exportar PDF
                                    </button>
                                )}

                                {can('mant_excel') && (
                                    <button className="dropdown-item py-2" onClick={() => { setOpenMenuId(null); descargarExcelOT(s.id); }}>
                                        <i className="bi bi-file-earmark-excel text-success me-2"></i>Exportar Excel
                                    </button>
                                )}

                                {can('mant_anular') && s.estado !== 'Completada' && s.estado !== 'Anulada' && (
                                    <>
                                        <hr className="dropdown-divider" />
                                        <button className="dropdown-item py-2 text-danger" onClick={() => solicitarAnulacion(s.id)}>
                                            <i className="bi bi-trash me-2"></i>Anular OT
                                        </button>
                                    </>
                                )}
                            </>
                        );
                    })()}
                </div>
            )}

        </div>
    );
};

export default Mantencion;