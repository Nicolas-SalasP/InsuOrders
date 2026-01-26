import { useEffect, useState, useRef } from 'react';
import api from '../api/axiosConfig';
import { usePermission } from '../hooks/usePermission';
import NuevaSolicitudModal from '../components/NuevaSolicitudModal';
import DetalleSolicitudModal from '../components/DetalleSolicitudModal';
import MessageModal from '../components/MessageModal';
import ConfirmModal from '../components/ConfirmModal';

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

    const [filtroOT, setFiltroOT] = useState('');
    const [filtroMaquina, setFiltroMaquina] = useState('');
    const [filtroEstado, setFiltroEstado] = useState(''); 
    const [filtroFecha, setFiltroFecha] = useState('');

    const [filtroInsumo, setFiltroInsumo] = useState('');
    const [busquedaInsumo, setBusquedaInsumo] = useState('');
    const [listaInsumos, setListaInsumos] = useState([]);
    const [sugerencias, setSugerencias] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        cargarListaInsumos();
        
        const handleClickOutsideMenu = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideMenu);
        return () => document.removeEventListener('mousedown', handleClickOutsideMenu);

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

    const toggleMenu = (id) => {
        if (openMenuId === id) {
            setOpenMenuId(null);
        } else {
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

    const solicitudesFiltradas = solicitudes.filter(s => {
        const matchOT = !filtroOT || s.id.toString().includes(filtroOT);
        const maquinaStr = (s.activo || '') + ' ' + (s.activo_codigo || '');
        const matchMaquina = !filtroMaquina || maquinaStr.toLowerCase().includes(filtroMaquina.toLowerCase());
        const matchEstado = !filtroEstado || s.estado === filtroEstado;
        const fechaOT = s.fecha_solicitud ? s.fecha_solicitud.split(' ')[0] : '';
        const matchFecha = !filtroFecha || fechaOT === filtroFecha;

        return matchOT && matchMaquina && matchEstado && matchFecha;
    });

    const seleccionarInsumo = (item) => {
        setFiltroInsumo(item.id);
        setBusquedaInsumo(item.nombre);
        setMostrarSugerencias(false);
    };

    const limpiarFiltros = () => {
        setFiltroOT('');
        setFiltroMaquina('');
        setFiltroEstado('');
        setFiltroFecha('');
        setFiltroInsumo('');
        setBusquedaInsumo('');
        setMostrarSugerencias(false);
        cargarSolicitudes();
    };

    const getBadge = (estado) => {
        if (estado === 'Pendiente') return 'bg-warning text-dark';
        if (estado === 'En Proceso') return 'bg-primary';
        if (estado === 'Completada') return 'bg-success';
        if (estado === 'Anulada' || estado === 'Cancelada') return 'bg-danger';
        return 'bg-secondary';
    };

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

                        <div className="col-md-3">
                            <input type="text" className="form-control" placeholder="Buscar Máquina..." value={filtroMaquina} onChange={e => setFiltroMaquina(e.target.value)} />
                        </div>

                        <div className="col-md-3 position-relative" ref={wrapperRef}>
                            <div className="input-group">
                                <span className={`input-group-text border-end-0 ${filtroInsumo ? 'bg-primary text-white' : 'bg-white text-primary'}`}>
                                    <i className="bi bi-box-seam"></i>
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control border-start-0 ps-0" 
                                    placeholder="Filtrar por insumo..." 
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
                                <option value="Pendiente">Pendiente</option>
                                <option value="En Proceso">En Proceso</option>
                                <option value="Completada">Completada</option>
                                <option value="Anulada">Anulada</option>
                            </select>
                        </div>

                        <div className="col-md-2 text-end">
                            {(filtroOT || filtroMaquina || filtroEstado || filtroFecha || filtroInsumo) && (
                                <button className="btn btn-outline-secondary w-100" onClick={limpiarFiltros}>
                                    <i className="bi bi-x-lg me-1"></i> Limpiar
                                </button>
                            )}
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
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th className="text-end pe-4" style={{minWidth: '200px'}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudesFiltradas.length > 0 ? solicitudesFiltradas.map(s => (
                                    <tr key={s.id} className={s.estado === 'Anulada' ? 'bg-light text-muted' : ''}>
                                        <td className="ps-4 fw-bold">#{s.id}</td>
                                        <td>
                                            <div className="fw-bold text-dark">{s.activo || 'General'}</div>
                                            {s.activo_codigo && <small className="text-muted">{s.activo_codigo}</small>}
                                        </td>
                                        <td><small className="text-truncate d-block" style={{ maxWidth: '200px' }}>{s.descripcion_trabajo || '-'}</small></td>
                                        <td>{s.solicitante_nombre} {s.solicitante_apellido}</td>
                                        <td>{new Date(s.fecha_solicitud).toLocaleDateString()}</td>
                                        <td><span className={`badge ${getBadge(s.estado)}`}>{s.estado}</span></td>
                                        
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

                                                <div className="dropdown dropdown-container position-relative">
                                                    <button 
                                                        className={`btn btn-sm btn-light border ${openMenuId === s.id ? 'show' : ''}`}
                                                        type="button" 
                                                        onClick={() => toggleMenu(s.id)}
                                                    >
                                                        <i className="bi bi-three-dots-vertical"></i>
                                                    </button>
                                                    
                                                    {openMenuId === s.id && (
                                                        <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 show" 
                                                            style={{ position: 'absolute', right: 0, top: '100%', zIndex: 1050, display: 'block' }}>
                                                            
                                                            <li>
                                                                <button className="dropdown-item" onClick={() => { setOpenMenuId(null); setDetalleModal({ show: true, id: s.id }); }}>
                                                                    <i className="bi bi-eye text-info me-2"></i>Ver Detalle
                                                                </button>
                                                            </li>

                                                            {can('mant_editar') && s.estado !== 'Completada' && s.estado !== 'Anulada' && (
                                                                <li>
                                                                    <button className="dropdown-item" onClick={() => handleEdit(s)}>
                                                                        <i className="bi bi-pencil-square text-primary me-2"></i>Editar OT
                                                                    </button>
                                                                </li>
                                                            )}

                                                            {can('mant_pdf') && (
                                                                <li>
                                                                    <button className="dropdown-item" onClick={() => { setOpenMenuId(null); descargarPdfOT(s.id); }}>
                                                                        <i className="bi bi-file-earmark-pdf text-danger me-2"></i>Exportar PDF
                                                                    </button>
                                                                </li>
                                                            )}
                                                            
                                                            {can('mant_excel') && (
                                                                <li>
                                                                    <button className="dropdown-item" onClick={() => { setOpenMenuId(null); descargarExcelOT(s.id); }}>
                                                                        <i className="bi bi-file-earmark-excel text-success me-2"></i>Exportar Excel
                                                                    </button>
                                                                </li>
                                                            )}

                                                            {can('mant_anular') && s.estado !== 'Completada' && s.estado !== 'Anulada' && (
                                                                <li>
                                                                    <hr className="dropdown-divider"/>
                                                                    <button className="dropdown-item text-danger" onClick={() => solicitarAnulacion(s.id)}>
                                                                        <i className="bi bi-trash me-2"></i>Anular OT
                                                                    </button>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="7" className="text-center py-5 text-muted">No se encontraron solicitudes con los filtros actuales.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Mantencion;