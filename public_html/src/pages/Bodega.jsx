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
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });
    const [entregaModal, setEntregaModal] = useState({ show: false, item: null });
    const [organizarModal, setOrganizarModal] = useState({ show: false, item: null });
    const [masivaModal, setMasivaModal] = useState({ show: false });
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

    useEffect(() => {
        setBusqueda('');
    }, [vista]);

    const cargarDatos = (isSilent = false) => {
        if (vista === 'salidas') cargarPendientes(isSilent);
        else cargarPorOrganizar(isSilent);
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
                        acc[id] = {
                            ot_id: id,
                            solicitante: item.solicitante + ' ' + (item.solicitante_apellido || ''),
                            maquina: item.maquina || 'General',
                            fecha: item.fecha_solicitud,
                            items: []
                        };
                    }
                    acc[id].items.push(item);
                    return acc;
                }, {});
                setPendientesAgrupados(grupos);
            }
        } catch (e) { 
            console.error(e); 
        } finally { 
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const cargarPorOrganizar = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setIsRefreshing(true);

        try {
            const res = await api.get('/bodega/por-organizar');
            if (res.data.success) {
                setPorOrganizar(Array.isArray(res.data.data) ? res.data.data : []);
            }
        } catch (e) { 
            console.error(e); 
        } finally { 
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const itemsPorOrganizarFiltrados = porOrganizar.filter(item => {
        if (!busqueda) return true;
        const termino = busqueda.toLowerCase();
        return (
            item.nombre.toLowerCase().includes(termino) || 
            item.codigo_sku.toLowerCase().includes(termino)
        );
    });

    const handleCheckItem = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const getSelectedObjects = () => {
        const allItems = Object.values(pendientesAgrupados).flatMap(g => g.items);
        return allItems.filter(item => selectedIds.includes(item.detalle_id));
    };

    // --- PROCESOS ---

    const procesarEntrega = async (detalleId, cantidad, receptorId) => {
        try {
            await api.post('/bodega/entregar', {
                detalle_id: detalleId,
                cantidad_entregar: cantidad,
                receptor_id: receptorId
            });
            setEntregaModal({ show: false, item: null });
            setMsg({ show: true, title: "Entregado", text: "Entrega registrada exitosamente.", type: "success" });
            cargarPendientes(true);
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.error || "Error desconocido", type: "error" });
        }
    };

    const procesarEntregaMasiva = async (itemsPayload, receptorId) => {
        try {
            await api.post('/bodega/entregar-masivo', {
                items: itemsPayload,
                receptor_id: receptorId
            });
            setMasivaModal({ show: false });
            setSelectedIds([]); 
            setMsg({ show: true, title: "Entrega Masiva", text: "Se han entregado los materiales seleccionados.", type: "success" });
            cargarPendientes(true);
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.error || "Error al procesar entrega masiva", type: "error" });
        }
    };

    if (!hasPermission('bodega_ver')) {
        return <div className="alert alert-danger m-4 shadow-sm">No tienes permisos para acceder al módulo de Bodega.</div>;
    }

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />

            <ModalEntregaBodega 
                show={entregaModal.show} 
                item={entregaModal.item} 
                onClose={() => setEntregaModal({ show: false, item: null })} 
                onConfirm={procesarEntrega} 
            />
            
            <ModalEntregaMasivaBodega 
                show={masivaModal.show} 
                selectedItems={getSelectedObjects()} 
                onClose={() => setMasivaModal({ show: false })} 
                onConfirm={procesarEntregaMasiva} 
            />

            {organizarModal.show && (
                <ModalOrganizarBodega 
                    show={organizarModal.show} 
                    insumo={organizarModal.item} 
                    onClose={() => setOrganizarModal({ show: false, item: null })} 
                    onSave={() => cargarPorOrganizar(true)} 
                />
            )}
            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-shrink-0">
                    <div className="d-flex align-items-center gap-2">
                        <h4 className="mb-0 fw-bold text-dark me-3">
                            <i className="bi bi-inboxes me-2"></i>Gestión de Bodega
                        </h4>
                        
                        {isRefreshing && (
                            <span className="badge bg-light text-secondary border animate__animated animate__fadeIn">
                                <span className="spinner-border spinner-border-sm me-1" style={{width:'0.7rem', height:'0.7rem'}}></span>
                                Actualizando...
                            </span>
                        )}

                        {vista === 'salidas' && selectedIds.length > 0 && hasPermission('bodega_despachar') && (
                            <button 
                                className="btn btn-success btn-sm shadow-sm animate__animated animate__fadeIn"
                                onClick={() => setMasivaModal({ show: true })}
                            >
                                <i className="bi bi-check2-all me-1"></i> 
                                Entregar Seleccionados ({selectedIds.length})
                            </button>
                        )}
                    </div>

                    <div className="btn-group">
                        <button 
                            className={`btn ${vista === 'salidas' ? 'btn-dark' : 'btn-outline-dark'}`} 
                            onClick={() => setVista('salidas')}
                        >
                            Despacho (Salidas)
                        </button>
                        <button 
                            className={`btn ${vista === 'entradas' ? 'btn-dark' : 'btn-outline-dark'}`} 
                            onClick={() => setVista('entradas')}
                        >
                            Organizar (Entradas)
                        </button>
                    </div>
                </div>
                {vista === 'entradas' && (
                    <div className="bg-light px-3 pt-3 pb-2 border-bottom">
                        <div className="row">
                            <div className="col-md-4">
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0 text-muted">
                                        <i className="bi bi-search"></i>
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control border-start-0 ps-0" 
                                        placeholder="Filtrar por SKU o Nombre..." 
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)} 
                                    />
                                    {busqueda && (
                                        <button className="btn btn-outline-secondary border-start-0 bg-white" onClick={() => setBusqueda('')}>
                                            <i className="bi bi-x"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-8 text-end align-self-center">
                                <small className="text-muted">
                                    Mostrando {itemsPorOrganizarFiltrados.length} de {porOrganizar.length} ítems
                                </small>
                            </div>
                        </div>
                    </div>
                )}

                <div className="card-body p-3 flex-grow-1 overflow-auto bg-light position-relative">
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center h-100">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div> 
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
                                                                        <input 
                                                                            type="checkbox" 
                                                                            className="form-check-input"
                                                                            checked={selectedIds.includes(p.detalle_id)}
                                                                            onChange={() => handleCheckItem(p.detalle_id)}
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td className="ps-2 fw-bold">{p.insumo}</td>
                                                                <td className="text-muted small">{p.codigo_sku}</td>
                                                                <td className="small text-muted">
                                                                    <i className="bi bi-geo-alt me-1"></i>
                                                                    {p.ubicacion || 'General'}
                                                                </td>

                                                                <td className="text-center text-muted small">{parseFloat(p.stock_actual)}</td>
                                                                <td className="text-center fw-bold text-danger fs-5">
                                                                    {parseFloat(p.cantidad_pendiente)} 
                                                                    <small className="text-muted fs-6 ms-1">{p.unidad_medida}</small>
                                                                </td>
                                                                <td className="text-end pe-4">
                                                                    {hasPermission('bodega_despachar') && (
                                                                        <button 
                                                                            className="btn btn-outline-success btn-sm px-3" 
                                                                            onClick={() => setEntregaModal({ show: true, item: p })}
                                                                            title="Entrega Individual"
                                                                        >
                                                                            <i className="bi bi-box-seam"></i>
                                                                        </button>
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
                        ) : (
                            // VISTA: ENTRADAS
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
                                                            <button 
                                                                className="btn btn-primary btn-sm fw-bold px-3" 
                                                                onClick={() => setOrganizarModal({ show: true, item: p })}
                                                            >
                                                                <i className="bi bi-arrow-down-square me-2"></i>Ubicación
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-muted">
                                                    {busqueda ? 'No se encontraron resultados con ese filtro.' : 'No hay ítems pendientes de organizar.'}
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