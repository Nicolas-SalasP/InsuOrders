import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import MessageModal from '../components/MessageModal';
import ModalEntregaBodega from '../components/ModalEntregaBodega';
import ModalOrganizarBodega from '../components/ModalOrganizarBodega';

const Bodega = () => {
    const [vista, setVista] = useState('salidas');
    const [pendientes, setPendientes] = useState([]);
    const [porOrganizar, setPorOrganizar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ show: false, title:'', text:'', type:'info' });
    const [entregaModal, setEntregaModal] = useState({ show: false, item: null });
    const [organizarModal, setOrganizarModal] = useState({ show: false, item: null });

    useEffect(() => { 
        if (vista === 'salidas') cargarPendientes();
        else cargarPorOrganizar();
    }, [vista]);

    const cargarPendientes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/index.php/bodega/pendientes');
            if (res.data.success) setPendientes(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const cargarPorOrganizar = async () => {
        setLoading(true);
        try {
            const res = await api.get('/index.php/bodega/por-organizar');
            if (res.data.success) setPorOrganizar(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const procesarEntrega = async (detalleId, cantidad, receptorId) => {
        try {
            await api.post('/index.php/bodega/entregar', { 
                detalle_id: detalleId, cantidad, receptor_id: receptorId 
            });
            setEntregaModal({ show: false, item: null });
            setMsg({ show: true, title: "Entregado", text: "Entrega registrada exitosamente.", type: "success" });
            cargarPendientes();
        } catch (error) { alert(error.response?.data?.message); }
    };

    const handleExportar = () => {
        const modulo = vista === 'salidas' ? 'bodega' : 'inventario';
        window.open(`http://localhost/insuorders/public_html/api/index.php/exportar?modulo=${modulo}`, '_blank');
    };

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            <MessageModal show={msg.show} onClose={()=>setMsg({...msg, show:false})} title={msg.title} message={msg.text} type={msg.type} />
            
            {/* Modal Salida (Entregar a Técnico) */}
            <ModalEntregaBodega show={entregaModal.show} item={entregaModal.item} onClose={() => setEntregaModal({ show: false, item: null })} onConfirm={procesarEntrega} />
            
            {/* Modal Entrada (Organizar en Estantería) */}
            <ModalOrganizarBodega show={organizarModal.show} insumo={organizarModal.item} onClose={() => setOrganizarModal({ show: false, item: null })} onSave={cargarPorOrganizar} />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{overflow: 'hidden'}}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-shrink-0">
                    <div>
                        <h4 className="mb-0 fw-bold text-dark"><i className="bi bi-inboxes me-2"></i>Gestión de Bodega</h4>
                    </div>
                    {/* Switch de Vistas */}
                    <div className="btn-group">
                        <button className={`btn ${vista==='salidas' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setVista('salidas')}>
                            <i className="bi bi-box-arrow-right me-2"></i>Despacho (Salidas)
                        </button>
                        <button className={`btn ${vista==='entradas' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setVista('entradas')}>
                            <i className="bi bi-box-arrow-in-down me-2"></i>Organizar (Entradas)
                        </button>
                    </div>
                </div>
                
                <div className="card-body p-0 flex-grow-1 overflow-auto">
                    {loading ? <div className="p-5 text-center">Cargando...</div> : (
                        
                        vista === 'salidas' ? (
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light sticky-top">
                                    <tr>
                                        <th className="ps-4">OT Origen</th>
                                        <th>Insumo</th>
                                        <th>Solicitante</th>
                                        <th className="text-center">Pendiente</th>
                                        <th className="text-end pe-4">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendientes.map(p => (
                                        <tr key={p.detalle_id}>
                                            <td className="ps-4"><span className="badge bg-warning text-dark">OT #{p.ot_id}</span></td>
                                            <td><div className="fw-bold">{p.insumo}</div><small className="text-muted">{p.codigo_sku}</small></td>
                                            <td>{p.solicitante}</td>
                                            <td className="text-center fw-bold fs-5 text-primary">{parseFloat(p.cantidad)}</td>
                                            <td className="text-end pe-4">
                                                <button className="btn btn-success btn-sm fw-bold px-3" onClick={() => setEntregaModal({ show: true, item: p })}>
                                                    Entregar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {pendientes.length === 0 && <tr><td colSpan="5" className="text-center py-5 text-muted">✅ Todo despachado</td></tr>}
                                </tbody>
                            </table>
                        ) : (
                            // --- TABLA ENTRADAS (Organizar) ---
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
                                    {porOrganizar.map(p => (
                                        <tr key={p.id}>
                                            <td className="ps-4 font-monospace">{p.codigo_sku}</td>
                                            <td><div className="fw-bold">{p.nombre}</div><small className="text-muted">{p.categoria_nombre}</small></td>
                                            <td className="text-center">{parseFloat(p.stock_actual)}</td>
                                            <td className="text-center fw-bold fs-5 text-danger bg-danger bg-opacity-10">{parseFloat(p.por_organizar)}</td>
                                            <td className="text-end pe-4">
                                                <button className="btn btn-primary btn-sm fw-bold px-3" onClick={() => setOrganizarModal({ show: true, item: p })}>
                                                    <i className="bi bi-arrow-down-square me-2"></i>Ubicación
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {porOrganizar.length === 0 && <tr><td colSpan="5" className="text-center py-5 text-muted">✅ Todo el inventario está ubicado</td></tr>}
                                </tbody>
                            </table>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Bodega;