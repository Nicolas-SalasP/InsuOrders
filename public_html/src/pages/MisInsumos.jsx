import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MessageModal from '../components/MessageModal';
import ConfirmModal from '../components/ConfirmModal';

const MisInsumos = () => {
    const [data, setData] = useState({ pendientes: [], inventario: [] });
    const [loading, setLoading] = useState(true);
    const [consumo, setConsumo] = useState({});
    
    // Estados para modales
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });
    const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '' });

    const cargarDatos = () => {
        setLoading(true);
        api.get('/operario/mis-insumos')
            .then(res => {
                if (res.data.success && res.data.data) {
                    setData({
                        pendientes: res.data.data.pendientes || [],
                        inventario: res.data.data.inventario || []
                    });
                } else {
                    setData({ pendientes: [], inventario: [] });
                }
            })
            .catch(err => {
                console.error("Error cargando insumos:", err);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { cargarDatos(); }, []);

    // --- ACCIONES ---
    const iniciarRespuesta = (entregaId, accion) => {
        const texto = accion === 'ACEPTAR' ? 'recibir' : 'rechazar';
        setConfirm({
            show: true,
            title: `Confirmar ${texto}`,
            message: `¿Estás seguro de que deseas ${texto} esta entrega?`,
            action: () => procesarRespuesta(entregaId, accion)
        });
    };

    const iniciarAccionStock = (entregaId, tipo) => { // tipo: 'consumir' o 'devolver'
        const cant = parseFloat(consumo[entregaId]);
        if (!cant || cant <= 0) {
            setMsg({ show: true, title: "Cantidad Inválida", text: "Ingresa una cantidad válida mayor a 0.", type: "warning" });
            return;
        }
        
        const accionTexto = tipo === 'consumir' ? 'utilizar' : 'devolver a bodega';
        const url = tipo === 'consumir' ? '/operario/consumir' : '/operario/devolver';

        setConfirm({
            show: true,
            title: `Confirmar ${tipo === 'consumir' ? 'Consumo' : 'Devolución'}`,
            message: `¿Confirmas que vas a ${accionTexto} ${cant} unidades?`,
            action: () => procesarStock(url, entregaId, cant)
        });
    };

    const procesarRespuesta = async (entregaId, accion) => {
        try {
            await api.post('/operario/responder', { entrega_id: entregaId, accion });
            setMsg({ show: true, title: "Éxito", text: "Respuesta registrada.", type: "success" });
            cargarDatos();
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.message || "Error.", type: "error" });
        } finally {
            setConfirm({ ...confirm, show: false });
        }
    };

    const procesarStock = async (url, entregaId, cantidad) => {
        try {
            await api.post(url, { entrega_id: entregaId, cantidad });
            setMsg({ show: true, title: "Éxito", text: "Operación realizada correctamente.", type: "success" });
            setConsumo({ ...consumo, [entregaId]: '' });
            cargarDatos();
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.message || "Error.", type: "error" });
        } finally {
            setConfirm({ ...confirm, show: false });
        }
    };

    // --- AGRUPACIÓN ---
    const inventarioAgrupado = data.inventario.reduce((acc, item) => {
        const key = item.ot_id ? `OT #${item.ot_id} - ${item.maquina}` : 'Entregas Generales / Sin OT';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid py-4">
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />
            <ConfirmModal show={confirm.show} onClose={() => setConfirm({ ...confirm, show: false })} onConfirm={confirm.action} title={confirm.title} message={confirm.message} />

            <h3 className="mb-4 fw-bold text-dark"><i className="bi bi-tools me-2"></i>Panel de Insumos</h3>

            {/* PENDIENTES */}
            {data.pendientes.length > 0 && (
                <div className="card border-warning mb-4 shadow-sm">
                    <div className="card-header bg-warning text-dark fw-bold">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i> Por confirmar
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table mb-0 align-middle">
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
                                            <td><div className="fw-bold">{p.insumo}</div><small className="text-muted">Bodeguero: {p.bodeguero_nombre}</small></td>
                                            <td className="text-center fw-bold">{parseFloat(p.cantidad_entregada)} <small>{p.unidad_medida}</small></td>
                                            <td className="text-end pe-3">
                                                <button className="btn btn-sm btn-success me-2" onClick={() => iniciarRespuesta(p.id, 'ACEPTAR')}><i className="bi bi-check-lg"></i></button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => iniciarRespuesta(p.id, 'RECHAZAR')}><i className="bi bi-x-lg"></i></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* INVENTARIO AGRUPADO POR OT */}
            {Object.keys(inventarioAgrupado).length === 0 ? (
                <div className="card border-0 shadow-sm p-5 text-center text-muted">No tienes materiales asignados.</div>
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
                                            <th className="text-center">En Poder</th>
                                            <th style={{width: '300px'}} className="pe-3 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(i => (
                                            <tr key={i.id}>
                                                <td className="ps-3">
                                                    <div className="fw-bold text-dark">{i.insumo}</div>
                                                    <small className="text-muted">{i.codigo_sku}</small>
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
                                                            className="form-control" 
                                                            placeholder="Cant."
                                                            min="0.1" step="0.1" max={i.saldo_actual}
                                                            value={consumo[i.id] || ''}
                                                            onChange={e => setConsumo({...consumo, [i.id]: e.target.value})}
                                                        />
                                                        <button className="btn btn-primary" title="Reportar Uso" onClick={() => iniciarAccionStock(i.id, 'consumir')}>
                                                            <i className="bi bi-check2-circle"></i> Usar
                                                        </button>
                                                        <button className="btn btn-outline-secondary" title="Devolver a Bodega" onClick={() => iniciarAccionStock(i.id, 'devolver')}>
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