import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import MessageModal from '../components/MessageModal';
import ModalEntregaBodega from '../components/ModalEntregaBodega'; // <--- IMPORTAR

const Bodega = () => {
    const [pendientes, setPendientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ show: false, title:'', text:'', type:'info' });
    
    // Estado para el Modal de Entrega
    const [entregaModal, setEntregaModal] = useState({ show: false, item: null });

    useEffect(() => { cargarPendientes(); }, []);

    const cargarPendientes = async () => {
        try {
            const res = await api.get('/index.php/bodega/pendientes');
            if (res.data.success) setPendientes(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    // Esta función la llamará el Modal al confirmar
    const procesarEntrega = async (detalleId, cantidad, receptorId) => {
        try {
            await api.post('/index.php/bodega/entregar', { 
                detalle_id: detalleId,
                cantidad: cantidad,
                receptor_id: receptorId 
            });
            setEntregaModal({ show: false, item: null });
            setMsg({ show: true, title: "Entregado", text: "Entrega registrada exitosamente.", type: "success" });
            cargarPendientes();
        } catch (error) {
            alert(error.response?.data?.message || "Error al entregar");
        }
    };

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            <MessageModal show={msg.show} onClose={()=>setMsg({...msg, show:false})} title={msg.title} message={msg.text} type={msg.type} />
            
            {/* Modal Entrega */}
            <ModalEntregaBodega 
                show={entregaModal.show} 
                item={entregaModal.item} 
                onClose={() => setEntregaModal({ show: false, item: null })} 
                onConfirm={procesarEntrega}
            />

            <div className="card shadow-sm border-0 flex-grow-1">
                <div className="card-header bg-white py-3">
                    <h4 className="mb-0 fw-bold text-dark"><i className="bi bi-inboxes me-2"></i>Despacho de Bodega</h4>
                    <small className="text-muted">Confirma la entrega física de materiales solicitados por OT</small>
                </div>
                
                <div className="card-body p-0 overflow-auto">
                    {loading ? <div className="p-5 text-center">Cargando entregas...</div> : (
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light sticky-top">
                                <tr>
                                    <th className="ps-4">OT Origen</th>
                                    <th>Insumo</th>
                                    <th>Solicitante / Máquina</th>
                                    <th className="text-center">Pendiente</th>
                                    <th className="text-end pe-4">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendientes.map(p => (
                                    <tr key={p.detalle_id}>
                                        <td className="ps-4">
                                            <span className="badge bg-warning text-dark">OT #{p.ot_id}</span>
                                            <div className="small text-muted mt-1">{new Date(p.fecha_solicitud).toLocaleDateString()}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold">{p.insumo}</div>
                                            <small className="text-muted">{p.codigo_sku}</small>
                                        </td>
                                        <td>
                                            <div className="fw-medium">{p.solicitante} {p.solicitante_apellido}</div>
                                            <small className="text-muted"><i className="bi bi-gear-fill me-1"></i>{p.maquina}</small>
                                        </td>
                                        <td className="text-center fw-bold fs-5 text-primary">
                                            {parseFloat(p.cantidad)} <small className="fs-6 text-muted fw-normal">{p.unidad_medida}</small>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-success btn-sm fw-bold px-3" 
                                                onClick={() => setEntregaModal({ show: true, item: p })}>
                                                <i className="bi bi-box-arrow-right me-2"></i>Entregar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {pendientes.length === 0 && (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted">✅ No hay entregas pendientes</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Bodega;