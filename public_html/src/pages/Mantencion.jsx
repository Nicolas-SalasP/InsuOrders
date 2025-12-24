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
    
    // Modales de Confirmación
    const [confirmAnular, setConfirmAnular] = useState({ show: false, id: null });
    const [confirmFinish, setConfirmFinish] = useState({ show: false, id: null });

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

    // --- DESCARGAS SEGURAS (PDF INDIVIDUAL) ---
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

    // --- DESCARGAS SEGURAS (EXCEL INDIVIDUAL) ---
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

    // --- LÓGICA ANULACIÓN ---
    const solicitarAnulacion = (id) => setConfirmAnular({ show: true, id: id });

    const confirmarAnulacion = async () => {
        setConfirmAnular({ ...confirmAnular, show: false });
        try {
            await api.delete(`/index.php/mantencion?id=${confirmAnular.id}`);
            cargarData();
            setMsg({ show: true, title: "Anulada", text: "OT Anulada correctamente.", type: "success" });
        } catch (error) {
            setMsg({ show: true, title: "Error", text: "No se pudo anular.", type: "error" });
        }
    };

    // --- LÓGICA FINALIZACIÓN ---
    const solicitarFinalizar = (id) => {
        setConfirmFinish({ show: true, id: id });
    };

    const ejecutarFinalizar = async () => {
        setConfirmFinish({ show: false, id: null });
        setLoading(true);
        try {
            const res = await api.post('/index.php/mantencion/finalizar', { id: confirmFinish.id });
            setMsg({ show: true, title: "Finalizada", text: "OT Completada. Insumos pendientes cancelados.", type: "success" });
            cargarData();
        } catch (error) {
            setMsg({ show: true, title: "Error", text: error.response?.data?.message || "Error al finalizar.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // --- EXPORTAR LISTA COMPLETA (CORREGIDO CON TOKEN) ---
    const handleExportar = () => {
        setLoading(true);
        api.get('/index.php/exportar?modulo=mantencion', { responseType: 'blob' })
            .then((res) => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Mantencion_${new Date().toISOString().slice(0, 10)}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch((error) => {
                console.error(error);
                setMsg({ show: true, title: "Error", text: "Error al exportar o sesión expirada.", type: "error" });
            })
            .finally(() => setLoading(false));
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
            
            {/* MODALES GLOBALES */}
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />
            
            {/* Modal Confirmar Anulación */}
            <ConfirmModal 
                show={confirmAnular.show} 
                onClose={() => setConfirmAnular({ show: false, id: null })} 
                onConfirm={confirmarAnulacion} 
                title="Anular OT" 
                message="¿Estás seguro de anular esta solicitud? Esta acción es irreversible." 
                confirmText="Sí, Anular" 
                type="danger" 
            />

            {/* Modal Confirmar Finalización */}
            <ConfirmModal 
                show={confirmFinish.show} 
                onClose={() => setConfirmFinish({ show: false, id: null })} 
                onConfirm={ejecutarFinalizar} 
                title="Finalizar Trabajo" 
                message={`¿Confirmas que el trabajo está terminado?\n\nCualquier insumo que no haya sido entregado se marcará como CANCELADO en Bodega.`} 
                confirmText="Sí, Finalizar OT" 
                type="success" 
            />

            <NuevaSolicitudModal show={showModal} onClose={() => setShowModal(false)} onSave={cargarData} otEditar={otEditar} />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                
                {/* --- ENCABEZADO MEJORADO RESPONSIVO --- */}
                <div className="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 flex-shrink-0">
                    
                    {/* Título con Icono Destacado */}
                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary d-none d-sm-block">
                             <i className="bi bi-wrench-adjustable fs-3"></i>
                        </div>
                        <h4 className="mb-0 fw-bold text-dark">Mantención</h4>
                    </div>
                    
                    {/* Botones Adaptables: Cuadrados en móvil, Normales en PC */}
                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                        
                        {/* Botón Exportar */}
                        <button 
                            className="btn btn-outline-success shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-center py-2 px-3"
                            onClick={handleExportar} 
                            disabled={loading}
                            title="Exportar Listado"
                        >
                            <i className="bi bi-file-excel fs-5 mb-1 mb-md-0 me-md-2"></i>
                            <span className="small fw-bold">Exportar</span>
                        </button>
                        
                        {/* Botón Crear OT (Destacado Amarillo) */}
                        <button 
                            className="btn btn-warning shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-center py-2 px-3 fw-bold"
                            onClick={handleNew}
                        >
                            <i className="bi bi-plus-lg fs-5 mb-1 mb-md-0 me-md-2"></i>
                            <span className="small">Crear OT</span>
                        </button>
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
                        <table className="table table-hover align-middle mb-0" style={{ minWidth: '900px' }}>
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

                                            {/* PDF */}
                                            <button 
                                                onClick={() => descargarPdfOT(s.id)} 
                                                className="btn btn-sm btn-outline-dark me-1" 
                                                title="Ver PDF"
                                            >
                                                <i className="bi bi-file-earmark-text"></i>
                                            </button>

                                            {/* Excel */}
                                            <button 
                                                onClick={() => descargarExcelOT(s.id)} 
                                                className="btn btn-sm btn-outline-success me-2" 
                                                title="Descargar Excel"
                                            >
                                                <i className="bi bi-file-earmark-excel"></i>
                                            </button>

                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(s)}><i className="bi bi-eye"></i></button>

                                            {/* Acciones de Gestión */}
                                            {s.estado !== 'Completada' && s.estado !== 'Anulada' && (
                                                <>
                                                    <button className="btn btn-sm btn-success me-2" onClick={() => solicitarFinalizar(s.id)} title="Finalizar/Cerrar">
                                                        <i className="bi bi-check2-circle"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => solicitarAnulacion(s.id)} title="Anular">
                                                        <i className="bi bi-x-circle"></i>
                                                    </button>
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