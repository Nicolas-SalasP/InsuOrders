import { useEffect, useState, useContext } from 'react';
import api from '../api/axiosConfig';
import AuthContext from '../context/AuthContext'; // Importar Contexto
import MessageModal from '../components/MessageModal';
import ModalEntregaBodega from '../components/ModalEntregaBodega';
import ModalOrganizarBodega from '../components/ModalOrganizarBodega';

const Bodega = () => {
    const { auth } = useContext(AuthContext); // Obtener auth
    const [vista, setVista] = useState('salidas');
    const [pendientesAgrupados, setPendientesAgrupados] = useState({});
    const [porOrganizar, setPorOrganizar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });
    
    const [entregaModal, setEntregaModal] = useState({ show: false, item: null });
    const [organizarModal, setOrganizarModal] = useState({ show: false, item: null });

    // Helper de permisos
    const hasPermission = (permiso) => {
        if (auth.rol === 'Admin') return true;
        return auth.permisos && auth.permisos.includes(permiso);
    };

    useEffect(() => {
        if (hasPermission('bodega_ver')) {
            cargarDatos();
            const interval = setInterval(cargarDatos, 15000);
            return () => clearInterval(interval);
        } else {
            setLoading(false); // Detener loading si no tiene permiso
        }
    }, [vista]);

    const cargarDatos = () => {
        if (vista === 'salidas') cargarPendientes();
        else cargarPorOrganizar();
    };

    const cargarPendientes = async () => {
        try {
            const res = await api.get('/index.php/bodega/pendientes');
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
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const cargarPorOrganizar = async () => {
        setLoading(true);
        try {
            const res = await api.get('/index.php/bodega/por-organizar');
            if (res.data.success) setPorOrganizar(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const procesarEntrega = async (detalleId, cantidad, receptorId) => {
        try {
            await api.post('/index.php/bodega/entregar', {
                detalle_id: detalleId, 
                cantidad_entregar: cantidad, 
                receptor_id: receptorId
            });
            setEntregaModal({ show: false, item: null });
            setMsg({ show: true, title: "Entregado", text: "Entrega registrada exitosamente.", type: "success" });
            cargarPendientes();
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.message || "Error desconocido", type: "error" });
        }
    };

    // Verificación de acceso al módulo
    if (!hasPermission('bodega_ver')) {
        return <div className="alert alert-danger m-4 shadow-sm">No tienes permisos para acceder al módulo de Bodega.</div>;
    }

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />

            {/* Solo renderizamos los modales si se activan y (redundante pero seguro) si tienen permiso */}
            <ModalEntregaBodega 
                show={entregaModal.show} 
                item={entregaModal.item} 
                onClose={() => setEntregaModal({ show: false, item: null })} 
                onConfirm={procesarEntrega} 
            />
            
            {organizarModal.show && (
                <ModalOrganizarBodega 
                    show={organizarModal.show} 
                    insumo={organizarModal.item} 
                    onClose={() => setOrganizarModal({ show: false, item: null })} 
                    onSave={cargarPorOrganizar} 
                />
            )}

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-shrink-0">
                    <h4 className="mb-0 fw-bold text-dark"><i className="bi bi-inboxes me-2"></i>Gestión de Bodega</h4>
                    <div className="btn-group">
                        <button className={`btn ${vista === 'salidas' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setVista('salidas')}>Despacho (Salidas)</button>
                        <button className={`btn ${vista === 'entradas' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setVista('entradas')}>Organizar (Entradas)</button>
                    </div>
                </div>

                <div className="card-body p-3 flex-grow-1 overflow-auto bg-light">
                    {loading ? <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div> : (
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
                                                <table className="table table-hover mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th className="ps-4">Insumo</th>
                                                            <th>SKU</th>
                                                            <th className="text-center">Stock Bodega</th>
                                                            <th className="text-center text-danger">Pendiente Entrega</th>
                                                            <th className="text-end pe-4">Acción</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {grupo.items.map(p => (
                                                            <tr key={p.detalle_id}>
                                                                <td className="ps-4 fw-bold">{p.insumo}</td>
                                                                <td className="text-muted small">{p.codigo_sku}</td>
                                                                <td className="text-center text-muted small">{parseFloat(p.stock_actual)}</td>
                                                                <td className="text-center fw-bold text-danger fs-5">
                                                                    {parseFloat(p.cantidad_pendiente)} <small className="text-muted fs-6">{p.unidad_medida}</small>
                                                                </td>
                                                                <td className="text-end pe-4">
                                                                    {/* Botón protegido por permiso bodega_despachar */}
                                                                    {hasPermission('bodega_despachar') && (
                                                                        <button className="btn btn-success btn-sm px-3" onClick={() => setEntregaModal({ show: true, item: p })}>
                                                                            <i className="bi bi-box-seam me-1"></i>Entregar
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
                            <div className="card border-0">
                                {/* Tabla Entradas */}
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
                                                <td><div className="fw-bold">{p.nombre}</div></td>
                                                <td className="text-center">{parseFloat(p.stock_actual)}</td>
                                                <td className="text-center fw-bold text-danger">{parseFloat(p.por_organizar)}</td>
                                                <td className="text-end pe-4">
                                                    {/* Botón protegido por permiso bodega_organizar */}
                                                    {hasPermission('bodega_organizar') && (
                                                        <button className="btn btn-primary btn-sm fw-bold px-3" onClick={() => setOrganizarModal({ show: true, item: p })}>
                                                            <i className="bi bi-arrow-down-square me-2"></i>Ubicación
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
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