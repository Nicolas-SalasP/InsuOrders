import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import AuthContext from '../context/AuthContext';
import MessageModal from '../components/MessageModal';
import ConfirmModal from '../components/ConfirmModal';

const MisInsumos = () => {
    const { auth } = useContext(AuthContext);
    const [data, setData] = useState({ pendientes: [], inventario: [] });
    const [loading, setLoading] = useState(true);
    const [consumo, setConsumo] = useState({}); 
    const [busqueda, setBusqueda] = useState('');
    
    // --- ESTADO NUEVO: SELECCIÓN MÚLTIPLE ---
    const [seleccionados, setSeleccionados] = useState([]);
    
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });
    const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '' });

    const cargarDatos = () => {
        setLoading(true);
        api.get('/operario/mis-insumos')
            .then(res => {
                if (res.data.success && res.data.data) {
                    setData({
                        pendientes: Array.isArray(res.data.data.pendientes) ? res.data.data.pendientes : [],
                        inventario: Array.isArray(res.data.data.inventario) ? res.data.data.inventario : []
                    });
                    setSeleccionados([]); // Limpiamos selección al recargar
                } else {
                    setData({ pendientes: [], inventario: [] });
                }
            })
            .catch(err => {
                console.error("Error cargando insumos:", err);
                setMsg({ show: true, title: "Error", text: "No se pudieron cargar tus insumos.", type: "error" });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { cargarDatos(); }, []);

    // --- FUNCIONES SELECCIÓN MASIVA ---
    const toggleSeleccion = (id) => {
        setSeleccionados(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        if (seleccionados.length === data.pendientes.length) {
            setSeleccionados([]);
        } else {
            setSeleccionados(data.pendientes.map(p => p.id));
        }
    };

    const agruparPorSku = (items) => {
        const agrupados = {};
        
        items.forEach(item => {
            const key = item.insumo_id; 
            
            if (!agrupados[key]) {
                agrupados[key] = {
                    ...item,
                    saldo_total: 0,
                    entregas: [] 
                };
            }
            
            agrupados[key].saldo_total += parseFloat(item.saldo_actual);
            agrupados[key].entregas.push(item);
            
            if (item.observacion && item.observacion.toLowerCase().includes('rechazad')) {
                let motivoLimpio = item.observacion.split('Motivo:');
                agrupados[key].observacion_rechazo = motivoLimpio.length > 1 ? motivoLimpio[1].trim() : item.observacion;
            }
        });

        return Object.values(agrupados);
    };

    // --- ACEPTAR / RECHAZAR (SOPORTA ÚNICO O MASIVO) ---
    const iniciarRespuesta = (entregaIdOrArray, accion) => {
        const isArray = Array.isArray(entregaIdOrArray);
        const cantidad = isArray ? entregaIdOrArray.length : 1;
        const texto = accion === 'ACEPTAR' ? 'recibir' : 'rechazar';
        
        setConfirm({
            show: true,
            title: `Confirmar ${texto}`,
            message: `¿Estás seguro de que deseas ${texto} ${cantidad > 1 ? `los ${cantidad} repuestos seleccionados` : 'esta entrega'}?`,
            action: () => procesarRespuesta(entregaIdOrArray, accion)
        });
    };

    const procesarRespuesta = async (entregaIdOrArray, accion) => {
        try {
            // Evaluamos si el frontend mandó array (entregas_ids) o un solo item (entrega_id)
            const payload = Array.isArray(entregaIdOrArray) 
                ? { entregas_ids: entregaIdOrArray, accion }
                : { entrega_id: entregaIdOrArray, accion };

            await api.post('/operario/responder', payload);
            setMsg({ show: true, title: "Éxito", text: "Respuesta registrada correctamente.", type: "success" });
            cargarDatos();
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.error || "Error al procesar.", type: "error" });
        } finally {
            setConfirm({ ...confirm, show: false });
        }
    };

    // --- DEVOLVER STOCK ---
    const iniciarDevolucion = (itemAgrupado) => { 
        const cantInput = parseInt(consumo[itemAgrupado.insumo_id], 10);
        
        if (!cantInput || cantInput <= 0 || isNaN(cantInput)) {
            setMsg({ show: true, title: "Cantidad Inválida", text: "Ingresa una cantidad entera válida mayor a 0.", type: "warning" });
            return;
        }

        if (cantInput > parseInt(itemAgrupado.saldo_total, 10)) {
            setMsg({ show: true, title: "Exceso de stock", text: `No puedes devolver más de lo que tienes (Máximo: ${parseInt(itemAgrupado.saldo_total, 10)}).`, type: "warning" });
            return;
        }
        setConfirm({
            show: true,
            title: `Confirmar Devolución`,
            message: `¿Vas a devolver ${cantInput} ${itemAgrupado.unidad_medida}(s) de ${itemAgrupado.insumo} a la bodega?`,
            action: () => procesarStock('/operario/devolver', { 
                insumo_id: itemAgrupado.insumo_id, 
                cantidad: cantInput 
            }, itemAgrupado.insumo_id)
        });
    };

    const procesarStock = async (url, payload, insumoId) => {
        try {
            await api.post(url, payload);
            
            setConsumo(prev => {
                const newState = { ...prev };
                delete newState[insumoId];
                return newState;
            });

            setMsg({ show: true, title: "Éxito", text: "Devolución registrada.", type: "success" });
            cargarDatos();
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.error || "Error al procesar.", type: "error" });
        } finally {
            setConfirm({ ...confirm, show: false });
        }
    };

    const inventarioAgrupado = data.inventario.reduce((acc, item) => {
        const key = item.ot_id ? `OT #${item.ot_id}` : 'Material General / EPP';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid py-4 h-100 overflow-auto bg-light">
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />
            <ConfirmModal show={confirm.show} onClose={() => setConfirm({ ...confirm, show: false })} onConfirm={confirm.action} title={confirm.title} message={confirm.message} />

            <div className="row align-items-center mb-4 g-3">
                <div className="col-12 col-md-6">
                    <h3 className="fw-bold text-dark mb-0"><i className="bi bi-tools me-2 text-primary"></i>Mis Insumos</h3>
                    <small className="text-muted">Gestiona tu stock personal y devoluciones</small>
                </div>
                <div className="col-12 col-md-6 d-flex gap-2">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                        <input 
                            type="text" 
                            className="form-control border-start-0 ps-0" 
                            placeholder="Buscar por Nombre o SKU..." 
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={cargarDatos} title="Actualizar Datos">
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                </div>
            </div>

            {/* SECCIÓN PENDIENTES CON ACCIÓN MASIVA */}
            {data.pendientes.length > 0 && (
                <div className="mb-5 animate__animated animate__fadeIn">
                    <div className="alert alert-warning border-warning shadow-sm mb-3">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                            <div>
                                <span className="fw-bold d-block"><i className="bi bi-bell-fill me-2"></i> Tienes entregas de bodega por confirmar ({data.pendientes.length})</span>
                                <div className="form-check mt-1">
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        id="selectAll"
                                        checked={seleccionados.length === data.pendientes.length && data.pendientes.length > 0} 
                                        onChange={toggleAll} 
                                        style={{cursor: 'pointer'}}
                                    />
                                    <label className="form-check-label fw-bold text-dark user-select-none" htmlFor="selectAll" style={{cursor: 'pointer'}}>
                                        Seleccionar Todos
                                    </label>
                                </div>
                            </div>
                            
                            {/* BOTONES MASIVOS APARECEN AL SELECCIONAR */}
                            {seleccionados.length > 0 && (
                                <div className="d-flex gap-2 bg-white p-2 rounded shadow-sm border">
                                    <button className="btn btn-success btn-sm fw-bold" onClick={() => iniciarRespuesta(seleccionados, 'ACEPTAR')}>
                                        <i className="bi bi-check-all me-1"></i> Aceptar Selec. ({seleccionados.length})
                                    </button>
                                    <button className="btn btn-outline-danger btn-sm bg-white" onClick={() => iniciarRespuesta(seleccionados, 'RECHAZAR')}>
                                        <i className="bi bi-x-lg me-1"></i> Rechazar Selec.
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="row g-3">
                        {data.pendientes.map(p => {
                            const isSelected = seleccionados.includes(p.id);
                            return (
                                <div key={p.id} className="col-12 col-md-6 col-lg-4">
                                    <div 
                                        className={`card border-start border-4 shadow-sm h-100 ${isSelected ? 'border-primary bg-primary bg-opacity-10' : 'border-warning bg-white'}`}
                                        onClick={() => toggleSeleccion(p.id)}
                                        style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
                                    >
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="form-check" onClick={e => e.stopPropagation()}>
                                                    <input 
                                                        className="form-check-input fs-5 mt-0" 
                                                        type="checkbox" 
                                                        checked={isSelected} 
                                                        onChange={() => toggleSeleccion(p.id)} 
                                                        style={{cursor: 'pointer'}}
                                                    />
                                                </div>
                                                <div className="text-end">
                                                    <span className="badge bg-warning text-dark mb-1">Por Confirmar</span>
                                                    <div className="small text-muted" style={{fontSize:'0.7rem'}}>{new Date(p.fecha_entrega).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            
                                            <h6 className="fw-bold mb-1 text-truncate" title={p.insumo}>{p.insumo}</h6>
                                            <div className="text-muted small mb-3"><i className="bi bi-person-fill me-1"></i>De: {p.bodeguero_nombre}</div>
                                            
                                            <div className={`d-flex justify-content-between align-items-center p-2 rounded mb-3 border ${isSelected ? 'bg-white' : 'bg-light'}`}>
                                                <span className="small fw-bold text-uppercase">Recibido:</span>
                                                <span className="fs-5 fw-bold text-dark">{parseInt(p.cantidad_entregada, 10)} {p.unidad_medida}</span>
                                            </div>

                                            {/* Evitar que dar clic en los botones individuales active el check de la tarjeta */}
                                            <div className="d-flex gap-2" onClick={e => e.stopPropagation()}>
                                                <button className="btn btn-success flex-grow-1 fw-bold btn-sm" onClick={() => iniciarRespuesta([p.id], 'ACEPTAR')}>
                                                    <i className="bi bi-check-lg me-1"></i> Aceptar
                                                </button>
                                                <button className="btn btn-outline-danger bg-white flex-grow-1 btn-sm" onClick={() => iniciarRespuesta([p.id], 'RECHAZAR')}>
                                                    <i className="bi bi-x-lg me-1"></i> Rechazar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {Object.keys(inventarioAgrupado).length === 0 ? (
                <div className="text-center py-5 text-muted opacity-50">
                    <i className="bi bi-box-seam display-1"></i>
                    <h4 className="mt-3">Sin Materiales</h4>
                    <p>No tienes insumos en tu poder actualmente.</p>
                </div>
            ) : (
                Object.entries(inventarioAgrupado).map(([titulo, items]) => {
                    const itemsUnicos = agruparPorSku(items);
                    const itemsFiltrados = itemsUnicos.filter(i => 
                        i.insumo.toLowerCase().includes(busqueda.toLowerCase()) || 
                        i.codigo_sku.toLowerCase().includes(busqueda.toLowerCase())
                    );

                    if (itemsFiltrados.length === 0) return null;

                    return (
                        <div key={titulo} className="mb-4 animate__animated animate__fadeIn">
                            <h6 className="text-uppercase fw-bold text-primary border-bottom pb-2 mb-3 d-flex align-items-center">
                                <i className="bi bi-folder2-open me-2"></i> {titulo}
                            </h6>
                            
                            <div className="row g-3">
                                {itemsFiltrados.map(i => (
                                    <div key={i.insumo_id} className="col-12 col-sm-6 col-lg-3">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body d-flex flex-column">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <span className="badge bg-light text-secondary border font-monospace">
                                                        {i.codigo_sku}
                                                    </span>
                                                    <span className="badge bg-success bg-opacity-10 text-success border border-success fw-bold fs-6">
                                                        {parseInt(i.saldo_total, 10)} {i.unidad_medida}
                                                    </span>
                                                </div>

                                                <h6 className="fw-bold mb-1 text-dark" style={{ 
                                                    display: '-webkit-box', 
                                                    WebkitLineClamp: 2, 
                                                    WebkitBoxOrient: 'vertical', 
                                                    overflow: 'hidden',
                                                    height: '2.5rem', 
                                                    lineHeight: '1.25rem'
                                                }} title={i.insumo}>
                                                    {i.insumo}
                                                </h6>
                                                
                                                <div className="flex-grow-1">
                                                    {i.observacion_rechazo && (
                                                        <div className="alert alert-danger p-2 small mt-2 mb-2 d-flex flex-column" style={{fontSize: '0.75rem'}}>
                                                            <div className="fw-bold mb-1 text-danger">
                                                                <i className="bi bi-exclamation-triangle-fill me-1"></i> Bodega rechazó tu devolución:
                                                            </div>
                                                            <span className="fst-italic text-dark">"{i.observacion_rechazo}"</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-auto pt-3 border-top">
                                                    <div className="input-group mb-2 input-group-sm">
                                                        <input 
                                                            type="number" 
                                                            className="form-control text-center fw-bold" 
                                                            placeholder="0"
                                                            min="1" 
                                                            step="1" 
                                                            max={parseInt(i.saldo_total, 10)}
                                                            value={consumo[i.insumo_id] || ''}
                                                            onKeyDown={(e) => {
                                                                if (e.key === '.' || e.key === ',') {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            onChange={e => {
                                                                const val = e.target.value.replace(/\D/g, '');
                                                                setConsumo({...consumo, [i.insumo_id]: val});
                                                            }}
                                                        />
                                                        <span className="input-group-text bg-white small text-muted">{i.unidad_medida}</span>
                                                    </div>
                                                    
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger w-100 fw-bold" 
                                                        onClick={() => iniciarDevolucion(i)}
                                                        disabled={!consumo[i.insumo_id]}
                                                    >
                                                        <i className="bi bi-arrow-return-left me-1"></i> Devolver a Bodega
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default MisInsumos;