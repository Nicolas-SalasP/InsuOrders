import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import AuthContext from '../context/AuthContext';
import MessageModal from '../components/MessageModal';
import ConfirmModal from '../components/ConfirmModal'; // Asegúrate de crear este archivo abajo

const MisInsumos = () => {
    const { auth } = useContext(AuthContext);
    const [data, setData] = useState({ pendientes: [], inventario: [] });
    const [loading, setLoading] = useState(true);
    const [consumo, setConsumo] = useState({}); // Almacena los inputs de cantidad por ID
    
    // Modales
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });
    const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '' });

    const cargarDatos = () => {
        setLoading(true);
        // Asegúrate de que este endpoint exista en tu backend (OperarioController)
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

    // --- ACCIONES DE STOCK (Consumir / Devolver) ---
    const iniciarAccionStock = (insumoItem, tipo) => { // tipo: 'consumir' o 'devolver'
        const cantInput = parseFloat(consumo[insumoItem.id]);
        
        if (!cantInput || cantInput <= 0) {
            setMsg({ show: true, title: "Cantidad Inválida", text: "Ingresa una cantidad mayor a 0.", type: "warning" });
            return;
        }

        if (cantInput > parseFloat(insumoItem.saldo_actual)) {
            setMsg({ show: true, title: "Exceso", text: `No tienes suficiente stock (Max: ${insumoItem.saldo_actual})`, type: "warning" });
            return;
        }
        
        const accionTexto = tipo === 'consumir' ? 'utilizar/gastar' : 'devolver a bodega';
        // Ajusta las URLs según tu backend
        const url = tipo === 'consumir' ? '/operario/consumir' : '/operario/devolver';

        setConfirm({
            show: true,
            title: `Confirmar ${tipo === 'consumir' ? 'Consumo' : 'Devolución'}`,
            message: `¿Confirmas que vas a ${accionTexto} ${cantInput} ${insumoItem.unidad_medida} de ${insumoItem.insumo}?`,
            action: () => procesarStock(url, insumoItem.id, cantInput)
        });
    };

    const procesarStock = async (url, entregaId, cantidad) => {
        try {
            await api.post(url, { entrega_id: entregaId, cantidad });
            
            // Limpiamos el input específico
            setConsumo(prev => {
                const newState = { ...prev };
                delete newState[entregaId];
                return newState;
            });

            setMsg({ show: true, title: "Éxito", text: "Operación realizada correctamente.", type: "success" });
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
        <div className="container-fluid py-4 h-100 overflow-auto">
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />
            <ConfirmModal show={confirm.show} onClose={() => setConfirm({ ...confirm, show: false })} onConfirm={confirm.action} title={confirm.title} message={confirm.message} />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark mb-0"><i className="bi bi-tools me-2"></i>Mi Pañol / Insumos</h3>
                <button className="btn btn-sm btn-outline-primary" onClick={cargarDatos}><i className="bi bi-arrow-clockwise me-1"></i>Actualizar</button>
            </div>

            {/* SECCIÓN 1: PENDIENTES DE ACEPTAR */}
            {data.pendientes.length > 0 && (
                <div className="card border-warning mb-4 shadow-sm">
                    <div className="card-header bg-warning text-dark fw-bold d-flex justify-content-between">
                        <span><i className="bi bi-exclamation-triangle-fill me-2"></i> Entregas por confirmar recepción</span>
                        <span className="badge bg-dark rounded-pill">{data.pendientes.length}</span>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table mb-0 align-middle table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-3">Fecha</th>
                                        <th>Insumo</th>
                                        <th className="text-center">Cant.</th>
                                        <th className="text-end pe-3">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.pendientes.map(p => (
                                        <tr key={p.id}>
                                            <td className="ps-3 small">{new Date(p.fecha_entrega).toLocaleDateString()}</td>
                                            <td>
                                                <div className="fw-bold">{p.insumo}</div>
                                                <small className="text-muted">Bodeguero: {p.bodeguero_nombre}</small>
                                            </td>
                                            <td className="text-center fw-bold">{parseFloat(p.cantidad_entregada)} <small>{p.unidad_medida}</small></td>
                                            <td className="text-end pe-3">
                                                <button className="btn btn-sm btn-success me-2" onClick={() => iniciarRespuesta(p.id, 'ACEPTAR')} title="Confirmar Recepción">
                                                    <i className="bi bi-check-lg"></i> Recibir
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => iniciarRespuesta(p.id, 'RECHAZAR')} title="Rechazar Entrega">
                                                    <i className="bi bi-x-lg"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SECCIÓN 2: MI INVENTARIO ACTUAL */}
            {Object.keys(inventarioAgrupado).length === 0 ? (
                <div className="card border-0 shadow-sm p-5 text-center bg-light rounded">
                    <div className="text-muted mb-3"><i className="bi bi-box-seam display-4"></i></div>
                    <h5 className="text-muted">No tienes materiales en tu poder actualmente.</h5>
                </div>
            ) : (
                Object.entries(inventarioAgrupado).map(([titulo, items]) => (
                    <div key={titulo} className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white fw-bold py-3 border-bottom d-flex align-items-center">
                            <i className="bi bi-folder2-open me-2 text-primary"></i> {titulo}
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-3">Insumo</th>
                                            <th className="text-center">Saldo Actual</th>
                                            <th style={{width: '280px'}} className="pe-3 text-center">Gestionar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(i => (
                                            <tr key={i.id}>
                                                <td className="ps-3">
                                                    <div className="fw-bold text-dark">{i.insumo}</div>
                                                    <small className="text-muted font-monospace">{i.codigo_sku}</small>
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge bg-light text-dark border fs-6 px-3 py-2">
                                                        {parseFloat(i.saldo_actual)} {i.unidad_medida}
                                                    </span>
                                                </td>
                                                <td className="pe-3">
                                                    <div className="input-group input-group-sm">
                                                        <input 
                                                            type="number" 
                                                            className="form-control text-center fw-bold" 
                                                            placeholder="0"
                                                            min="0.1" 
                                                            step="0.1" 
                                                            max={i.saldo_actual}
                                                            value={consumo[i.id] || ''}
                                                            onChange={e => setConsumo({...consumo, [i.id]: e.target.value})}
                                                        />
                                                        <button 
                                                            className="btn btn-primary" 
                                                            title="Reportar Uso / Gasto" 
                                                            onClick={() => iniciarAccionStock(i, 'consumir')}
                                                            disabled={!consumo[i.id]}
                                                        >
                                                            Usar
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline-danger" 
                                                            title="Devolver a Bodega" 
                                                            onClick={() => iniciarAccionStock(i, 'devolver')}
                                                            disabled={!consumo[i.id]}
                                                        >
                                                            <i className="bi bi-arrow-return-left"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default MisInsumos;