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
    
    // Modales
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

    // --- LÓGICA DE AGRUPACIÓN Y SUMA DE STOCK ---
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
        });

        return Object.values(agrupados);
    };

    // --- ACCIONES (Aceptar/Rechazar entrega de bodega) ---
    const iniciarRespuesta = (entregaId, accion) => {
        const texto = accion === 'ACEPTAR' ? 'recibir' : 'rechazar';
        setConfirm({
            show: true,
            title: `Confirmar ${texto}`,
            message: `¿Estás seguro de que deseas ${texto} esta entrega?`,
            action: () => procesarRespuesta(entregaId, accion)
        });
    };

    const procesarRespuesta = async (entregaId, accion) => {
        try {
            await api.post('/operario/responder', { entrega_id: entregaId, accion });
            setMsg({ show: true, title: "Éxito", text: "Respuesta registrada correctamente.", type: "success" });
            cargarDatos();
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.error || "Error al procesar.", type: "error" });
        } finally {
            setConfirm({ ...confirm, show: false });
        }
    };

    // --- ACCIONES DE STOCK (Devolver) ---
    const iniciarDevolucion = (itemAgrupado) => { 
        const cantInput = parseFloat(consumo[itemAgrupado.insumo_id]);
        
        if (!cantInput || cantInput <= 0) {
            setMsg({ show: true, title: "Cantidad Inválida", text: "Ingresa una cantidad mayor a 0.", type: "warning" });
            return;
        }

        if (cantInput > parseFloat(itemAgrupado.saldo_total)) {
            setMsg({ show: true, title: "Exceso", text: `No tienes suficiente stock (Max: ${itemAgrupado.saldo_total})`, type: "warning" });
            return;
        }
        setConfirm({
            show: true,
            title: `Confirmar Devolución`,
            message: `¿Vas a devolver ${cantInput} ${itemAgrupado.unidad_medida} de ${itemAgrupado.insumo} a bodega?`,
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

    // --- AGRUPACIÓN POR OT ---
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

            {data.pendientes.length > 0 && (
                <div className="mb-5 animate__animated animate__fadeIn">
                    <div className="alert alert-warning border-warning shadow-sm mb-3 d-flex justify-content-between align-items-center">
                        <span className="fw-bold"><i className="bi bi-bell-fill me-2"></i> Tienes entregas de bodega por confirmar</span>
                        <span className="badge bg-dark">{data.pendientes.length}</span>
                    </div>
                    <div className="row g-3">
                        {data.pendientes.map(p => (
                            <div key={p.id} className="col-12 col-md-6 col-lg-4">
                                <div className="card border-warning border-start border-4 shadow-sm h-100">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-2">
                                            <small className="text-muted">{new Date(p.fecha_entrega).toLocaleDateString()}</small>
                                            <span className="badge bg-warning text-dark">Por Confirmar</span>
                                        </div>
                                        <h6 className="fw-bold mb-1 text-truncate">{p.insumo}</h6>
                                        <div className="text-muted small mb-3">Bodeguero: {p.bodeguero_nombre}</div>
                                        
                                        <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-3">
                                            <span className="small fw-bold text-uppercase">Recibido:</span>
                                            <span className="fs-5 fw-bold text-dark">{parseFloat(p.cantidad_entregada)} {p.unidad_medida}</span>
                                        </div>

                                        <div className="d-flex gap-2">
                                            <button className="btn btn-success flex-grow-1 fw-bold btn-sm" onClick={() => iniciarRespuesta(p.id, 'ACEPTAR')}>
                                                <i className="bi bi-check-lg me-1"></i> Aceptar
                                            </button>
                                            <button className="btn btn-outline-danger flex-grow-1 btn-sm" onClick={() => iniciarRespuesta(p.id, 'RECHAZAR')}>
                                                <i className="bi bi-x-lg me-1"></i> Rechazar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                                        {parseFloat(i.saldo_total)} {i.unidad_medida}
                                                    </span>
                                                </div>

                                                <h6 className="fw-bold mb-3 text-dark flex-grow-1" style={{ 
                                                    display: '-webkit-box', 
                                                    WebkitLineClamp: 2, 
                                                    WebkitBoxOrient: 'vertical', 
                                                    overflow: 'hidden',
                                                    height: '2.5rem', 
                                                    lineHeight: '1.25rem'
                                                }} title={i.insumo}>
                                                    {i.insumo}
                                                </h6>

                                                <div className="mt-auto pt-3 border-top">
                                                    <div className="input-group mb-2 input-group-sm">
                                                        <input 
                                                            type="number" 
                                                            className="form-control text-center fw-bold" 
                                                            placeholder="0"
                                                            min="0.1" 
                                                            step="0.1" 
                                                            max={i.saldo_total}
                                                            value={consumo[i.insumo_id] || ''}
                                                            onChange={e => setConsumo({...consumo, [i.insumo_id]: e.target.value})}
                                                        />
                                                        <span className="input-group-text bg-white small text-muted">{i.unidad_medida}</span>
                                                    </div>
                                                    
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger w-100" 
                                                        onClick={() => iniciarDevolucion(i)}
                                                        disabled={!consumo[i.insumo_id]}
                                                    >
                                                        <i className="bi bi-arrow-return-left me-1"></i> Devolver
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