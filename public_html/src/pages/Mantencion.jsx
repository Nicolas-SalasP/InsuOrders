import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import NuevaSolicitudModal from '../components/NuevaSolicitudModal';
import MessageModal from '../components/MessageModal';
import ConfirmModal from '../components/ConfirmModal'; // Nuevo

const Mantencion = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados UI
    const [showModal, setShowModal] = useState(false);
    const [otEditar, setOtEditar] = useState(null);

    // Modales Auxiliares
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });
    const [confirm, setConfirm] = useState({ show: false, id: null });

    useEffect(() => { cargarData(); }, []);

    const cargarData = async () => {
        try {
            const res = await api.get('/index.php/mantencion');
            if (res.data.success) setSolicitudes(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleNew = () => { setOtEditar(null); setShowModal(true); };

    const handleEdit = (ot) => {
        // Bloquear edición si ya no está pendiente
        if (ot.estado !== 'Pendiente') {
            return setMsg({ show: true, title: "No editable", text: `No puedes editar una OT en estado '${ot.estado}'.`, type: "warning" });
        }
        setOtEditar(ot); setShowModal(true);
    };

    const solicitarAnulacion = (id) => {
        setConfirm({ show: true, id: id });
    };

    const confirmarAnulacion = async () => {
        setConfirm({ ...confirm, show: false });
        try {
            await api.delete(`/index.php/mantencion?id=${confirm.id}`);
            cargarData();
            setMsg({ show: true, title: "Anulada", text: "La Orden de Trabajo ha sido anulada.", type: "success" });
        } catch (error) {
            setMsg({ show: true, title: "Error", text: "No se pudo anular la solicitud.", type: "error" });
        }
    };

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            {/* Modales Auxiliares */}
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />

            <ConfirmModal
                show={confirm.show}
                onClose={() => setConfirm({ ...confirm, show: false })}
                onConfirm={confirmarAnulacion}
                title="Anular Solicitud"
                message="¿Estás seguro de anular esta OT? Esta acción liberará los recursos y no se puede deshacer."
                confirmText="Sí, Anular"
                type="danger"
            />

            <NuevaSolicitudModal show={showModal} onClose={() => setShowModal(false)} onSave={cargarData} otEditar={otEditar} />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 fw-bold text-dark"><i className="bi bi-wrench-adjustable me-2"></i>Mantención</h4>
                    <button className="btn btn-warning fw-bold shadow-sm" onClick={handleNew}>
                        <i className="bi bi-plus-lg me-2"></i>Crear OT
                    </button>
                </div>

                <div className="card-body p-0 flex-grow-1 overflow-auto">
                    {loading ? <div className="p-5 text-center">Cargando...</div> : (
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light sticky-top">
                                <tr>
                                    <th className="ps-4">OT #</th>
                                    <th>Máquina</th>
                                    <th>Descripción</th>
                                    <th>Solicitante</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th className="text-end pe-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudes.map(s => (
                                    <tr key={s.id} className={s.estado === 'Anulada' ? 'bg-light text-muted' : ''}>
                                        <td className="ps-4 fw-bold">#{s.id}</td>
                                        <td>
                                            <div className="fw-bold text-dark">{s.activo || 'General'}</div>
                                            <small className="text-muted">{s.activo_codigo}</small>
                                        </td>
                                        <td><small className="text-truncate d-block" style={{ maxWidth: '200px' }}>{s.descripcion_trabajo || '-'}</small></td>
                                        <td>{s.solicitante_nombre} {s.solicitante_apellido}</td>
                                        <td>{new Date(s.fecha_solicitud).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${s.estado === 'Pendiente' ? 'bg-warning text-dark' : s.estado === 'Anulada' ? 'bg-secondary' : 'bg-success'}`}>
                                                {s.estado}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            {/* Solo permitir editar/borrar si no está anulada */}
                                            {s.estado !== 'Anulada' && (
                                                <>
                                                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(s)} title="Editar">
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => solicitarAnulacion(s.id)} title="Anular">
                                                        <i className="bi bi-x-circle"></i>
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {solicitudes.length === 0 && <tr><td colSpan="7" className="text-center py-5 text-muted">No hay solicitudes</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Mantencion;