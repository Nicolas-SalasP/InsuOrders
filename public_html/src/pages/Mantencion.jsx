import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import NuevaSolicitudModal from '../components/NuevaSolicitudModal';
import MessageModal from '../components/MessageModal';
import ConfirmModal from '../components/ConfirmModal';

const Mantencion = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [activos, setActivos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados de Filtros
    const [filtroOT, setFiltroOT] = useState('');
    const [filtroMaquina, setFiltroMaquina] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroFecha, setFiltroFecha] = useState('');

    // Estados UI Modales
    const [showModal, setShowModal] = useState(false);
    const [otEditar, setOtEditar] = useState(null);
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });
    const [confirm, setConfirm] = useState({ show: false, id: null });

    useEffect(() => {
        cargarData();
        cargarActivos();
    }, []);

    const cargarData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/index.php/mantencion');
            if (res.data.success) setSolicitudes(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const cargarActivos = async () => {
        try {
            const res = await api.get('/index.php/mantencion/activos');
            if (res.data.success) setActivos(res.data.data);
        } catch (e) { }
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

    // --- FILTRADO ---
    const solicitudesFiltradas = solicitudes.filter(s => {
        const matchOT = !filtroOT || s.id.toString().includes(filtroOT);
        const maquinaStr = (s.activo || '') + ' ' + (s.activo_codigo || '');
        const matchMaquina = !filtroMaquina || maquinaStr.toLowerCase().includes(filtroMaquina.toLowerCase());
        const matchEstado = !filtroEstado || s.estado === filtroEstado;
        const fechaOT = s.fecha_solicitud ? s.fecha_solicitud.split(' ')[0] : '';
        const matchFecha = !filtroFecha || fechaOT === filtroFecha;

        return matchOT && matchMaquina && matchEstado && matchFecha;
    });

    const handleNew = () => { setOtEditar(null); setShowModal(true); };
    const handleEdit = (ot) => { setOtEditar(ot); setShowModal(true); };

    const solicitarAnulacion = (id) => setConfirm({ show: true, id: id });

    const confirmarAnulacion = async () => {
        setConfirm({ ...confirm, show: false });
        try {
            await api.delete(`/index.php/mantencion?id=${confirm.id}`);
            cargarData();
            setMsg({ show: true, title: "Anulada", text: "OT Anulada correctamente.", type: "success" });
        } catch (error) {
            setMsg({ show: true, title: "Error", text: "No se pudo anular.", type: "error" });
        }
    };

    const handleFinalizar = async (id) => {
        if (!window.confirm("¿Finalizar OT? Si no hubo consumo, quedará como CANCELADA.")) return;
        try {
            const res = await api.post('/index.php/mantencion/finalizar', { id });
            setMsg({ show: true, title: "Finalizada", text: res.data.message, type: "success" });
            cargarData();
        } catch (error) {
            setMsg({ show: true, title: "Error", text: "Error al finalizar.", type: "error" });
        }
    };

    const handleExportar = () => {
        window.open('http://localhost/insuorders/public_html/api/index.php/exportar?modulo=mantencion', '_blank');
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
            <ConfirmModal show={confirm.show} onClose={() => setConfirm({ ...confirm, show: false })} onConfirm={confirmarAnulacion} title="Anular OT" message="¿Estás seguro?" confirmText="Sí, Anular" type="danger" />

            <NuevaSolicitudModal show={showModal} onClose={() => setShowModal(false)} onSave={cargarData} otEditar={otEditar} />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 fw-bold text-dark"><i className="bi bi-wrench-adjustable me-2"></i>Mantención</h4>
                    <div>
                        <button className="btn btn-outline-success me-2" onClick={handleExportar}><i className="bi bi-file-excel"></i> Exportar</button>
                        <button className="btn btn-warning fw-bold shadow-sm" onClick={handleNew}><i className="bi bi-plus-lg"></i> Crear OT</button>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="bg-light p-3 border-bottom">
                    <div className="row g-2">
                        <div className="col-md-2">
                            <input type="text" className="form-control" placeholder="# OT" value={filtroOT} onChange={e => setFiltroOT(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <input type="text" className="form-control" placeholder="Buscar Máquina..." value={filtroMaquina} onChange={e => setFiltroMaquina(e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                                <option value="">Estado: Todos</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="En Proceso">En Proceso</option>
                                <option value="Completada">Completada</option>
                                <option value="Anulada">Anulada</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <input type="date" className="form-control" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />
                        </div>
                        <div className="col-md-2 text-end">
                            {(filtroOT || filtroMaquina || filtroEstado || filtroFecha) && (
                                <button className="btn btn-outline-secondary w-100" onClick={() => { setFiltroOT(''); setFiltroMaquina(''); setFiltroEstado(''); setFiltroFecha(''); }}>
                                    <i className="bi bi-x-lg"></i> Limpiar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card-body p-0 flex-grow-1 overflow-auto">
                    {loading ? <div className="p-5 text-center">Cargando...</div> : (
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light sticky-top">
                                <tr>
                                    <th className="ps-4">OT #</th>
                                    <th>Máquina / Activo</th>
                                    <th>Descripción</th>
                                    <th>Solicitante</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th className="text-end pe-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudesFiltradas.map(s => (
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

                                            {/* PDF Seguro */}
                                            <button 
                                                onClick={() => descargarPdfOT(s.id)} 
                                                className="btn btn-sm btn-outline-dark me-1" 
                                                title="Ver PDF"
                                            >
                                                <i className="bi bi-file-earmark-text"></i>
                                            </button>

                                            {/* Excel Seguro */}
                                            <button 
                                                onClick={() => descargarExcelOT(s.id)} 
                                                className="btn btn-sm btn-outline-success me-2" 
                                                title="Descargar Excel"
                                            >
                                                <i className="bi bi-file-earmark-excel"></i>
                                            </button>

                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(s)}><i className="bi bi-eye"></i></button>

                                            {/* Solo mostrar acciones si no está terminada */}
                                            {s.estado !== 'Completada' && s.estado !== 'Anulada' && (
                                                <>
                                                    <button className="btn btn-sm btn-success me-2" onClick={() => handleFinalizar(s.id)} title="Finalizar/Cerrar"><i className="bi bi-check2-circle"></i></button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => solicitarAnulacion(s.id)} title="Anular"><i className="bi bi-x-circle"></i></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {solicitudesFiltradas.length === 0 && <tr><td colSpan="7" className="text-center py-5 text-muted">Sin resultados.</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Mantencion;