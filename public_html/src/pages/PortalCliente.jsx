import { useEffect, useState, useContext } from 'react';
import api from '../api/axiosConfig';
import NuevaSolicitudClienteModal from '../components/NuevaSolicitudClienteModal';
import AuthContext from '../context/AuthContext';

const PortalCliente = () => {
    const { auth } = useContext(AuthContext);
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [vistaPropiedad, setVistaPropiedad] = useState('TODAS');
    
    const [enlargedImage, setEnlargedImage] = useState(null);

    useEffect(() => {
        cargarSolicitudes();
    }, []);

    const cargarSolicitudes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/index.php/cliente/solicitudes');
            if (res.data.success) {
                setSolicitudes(res.data.data);
            }
        } catch (error) {
            console.error("Error cargando solicitudes", error);
        } finally {
            setLoading(false);
        }
    };

    const solicitudesFiltradas = solicitudes.filter(sol => {
        if (vistaPropiedad === 'MIAS' && sol.usuario_solicitante_id !== auth.id) return false;
        if (filtroEstado === 'TODOS') return true;
        
        const estado = sol.estado ? sol.estado.toUpperCase() : '';
        if (filtroEstado === 'PENDIENTE') return estado === 'PENDIENTE';
        if (filtroEstado === 'PROCESO') return ['EN PROCESO', 'APROBADA', 'ASIGNADA'].includes(estado);
        if (filtroEstado === 'FINALIZADO') return ['FINALIZADA', 'TERMINADA', 'COMPLETADA'].includes(estado);
        if (filtroEstado === 'CANCELADO') return ['ANULADA', 'RECHAZADA', 'CANCELADA'].includes(estado);

        return true;
    });

    const getBadgeColor = (estado) => {
        if (!estado) return 'bg-secondary';
        const st = estado.toUpperCase();
        if (st === 'PENDIENTE') return 'bg-warning text-dark';
        if (['EN PROCESO', 'APROBADA', 'ASIGNADA'].includes(st)) return 'bg-primary';
        if (['FINALIZADA', 'TERMINADA', 'COMPLETADA'].includes(st)) return 'bg-success';
        if (['ANULADA', 'RECHAZADA', 'CANCELADA'].includes(st)) return 'bg-danger';
        return 'bg-secondary text-white';
    };

    const renderEvidencia = (evidenciaStr) => {
        if (!evidenciaStr) return null;

        let archivos = [];
        try {
            archivos = JSON.parse(evidenciaStr);
            if (!Array.isArray(archivos)) archivos = [evidenciaStr];
        } catch (e) {
            archivos = [evidenciaStr];
        }

        return (
            <div className="d-flex gap-2 mt-3 pb-2 overflow-auto custom-scrollbar" style={{ whiteSpace: 'nowrap' }}>
                {archivos.map((url, idx) => {
                    const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
                    return isVideo ? (
                        <div key={idx} className="position-relative flex-shrink-0" style={{ width: '100px', height: '80px' }}>
                            <video src={`/api/${url}`} className="w-100 h-100 rounded border shadow-sm bg-dark object-fit-cover"></video>
                            <div className="position-absolute top-50 start-50 translate-middle text-white text-opacity-75">
                                <i className="bi bi-play-circle-fill fs-3"></i>
                            </div>
                        </div>
                    ) : (
                        <img 
                            key={idx} 
                            src={`/api/${url}`} 
                            alt={`Evidencia ${idx+1}`} 
                            className="rounded border shadow-sm cursor-pointer flex-shrink-0 image-hover" 
                            style={{ width: '100px', height: '80px', objectFit: 'cover' }} 
                            onClick={() => setEnlargedImage(`/api/${url}`)} 
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            
            {enlargedImage && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
                    style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }} 
                    onClick={() => setEnlargedImage(null)}
                >
                    <div className="position-relative text-center p-3" style={{ maxWidth: '100%', maxHeight: '100%' }}>
                        <button 
                            className="btn btn-light position-absolute top-0 end-0 m-4 rounded-circle shadow-sm d-flex justify-content-center align-items-center" 
                            style={{ zIndex: 1061, width: '45px', height: '45px', transform: 'translate(25%, -25%)' }}
                            onClick={() => setEnlargedImage(null)}
                        >
                            <i className="bi bi-x-lg text-dark fw-bold fs-5"></i>
                        </button>
                        <img 
                            src={enlargedImage} 
                            alt="Ampliación" 
                            className="img-fluid rounded shadow-lg" 
                            style={{ maxHeight: '90vh', maxWidth: '100%', objectFit: 'contain' }}
                            onClick={(e) => e.stopPropagation()} 
                        />
                    </div>
                </div>
            )}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm">
                <div>
                    <h2 className="fw-bold text-dark m-0">
                        <i className="bi bi-journal-bookmark-fill me-2 text-primary"></i>
                        Portal de Solicitudes
                    </h2>
                    <p className="text-muted small mb-0 mt-1">Revisa el estado de los requerimientos o crea uno nuevo.</p>
                </div>
                <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
                    
                    <div className="d-flex bg-light p-1 rounded-pill border">
                        <button 
                            className={`btn rounded-pill px-4 fw-medium ${vistaPropiedad === 'TODAS' ? 'btn-white bg-white shadow-sm border text-dark' : 'btn-light text-muted border-0'}`}
                            onClick={() => setVistaPropiedad('TODAS')}
                        >
                            Ver Todas
                        </button>
                        <button 
                            className={`btn rounded-pill px-4 fw-medium ${vistaPropiedad === 'MIAS' ? 'btn-white bg-white shadow-sm border text-primary' : 'btn-light text-muted border-0'}`}
                            onClick={() => setVistaPropiedad('MIAS')}
                        >
                            Mis Solicitudes
                        </button>
                    </div>

                    <button className="btn btn-primary shadow-sm px-4 py-2 rounded-pill fw-bold" onClick={() => setShowModal(true)}>
                        <i className="bi bi-plus-lg me-2"></i>NUEVA SOLICITUD
                    </button>
                </div>
            </div>

            <div className="mb-4 d-flex gap-2 flex-wrap justify-content-center justify-content-md-start">
                <button 
                    className={`btn rounded-pill px-4 fw-medium ${filtroEstado === 'TODOS' ? 'btn-dark shadow' : 'btn-outline-secondary border-0 bg-white shadow-sm'}`}
                    onClick={() => setFiltroEstado('TODOS')}
                >
                    Cualquier Estado
                </button>
                <button 
                    className={`btn rounded-pill px-4 fw-medium ${filtroEstado === 'PENDIENTE' ? 'btn-warning text-dark shadow' : 'btn-outline-secondary border-0 bg-white shadow-sm'}`}
                    onClick={() => setFiltroEstado('PENDIENTE')}
                >
                    Pendientes
                </button>
                <button 
                    className={`btn rounded-pill px-4 fw-medium ${filtroEstado === 'PROCESO' ? 'btn-primary shadow' : 'btn-outline-secondary border-0 bg-white shadow-sm'}`}
                    onClick={() => setFiltroEstado('PROCESO')}
                >
                    En Proceso
                </button>
                <button 
                    className={`btn rounded-pill px-4 fw-medium ${filtroEstado === 'FINALIZADO' ? 'btn-success shadow' : 'btn-outline-secondary border-0 bg-white shadow-sm'}`}
                    onClick={() => setFiltroEstado('FINALIZADO')}
                >
                    Terminadas
                </button>
                <button 
                    className={`btn rounded-pill px-4 fw-medium ${filtroEstado === 'CANCELADO' ? 'btn-danger shadow' : 'btn-outline-secondary border-0 bg-white shadow-sm'}`}
                    onClick={() => setFiltroEstado('CANCELADO')}
                >
                    Canceladas
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                    <p className="mt-3 text-muted fw-medium">Cargando solicitudes...</p>
                </div>
            ) : (
                <div className="row g-4">
                    {solicitudesFiltradas.length > 0 ? solicitudesFiltradas.map(sol => (
                        <div key={sol.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
                            <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden card-hover transition-all">
                                <div className="card-header bg-white border-bottom-0 d-flex justify-content-between align-items-start pt-3 px-4 pb-0">
                                    <div className="d-flex flex-column gap-2">
                                        <span className={`badge ${getBadgeColor(sol.estado)} px-3 py-2 rounded-pill shadow-sm align-self-start`}>
                                            {sol.estado}
                                        </span>
                                        {sol.prioridad === 'CRITICO' && (
                                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger rounded-pill align-self-start">
                                                <i className="bi bi-exclamation-triangle-fill me-1"></i>URGENTE
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-muted fw-bold font-monospace bg-light px-2 py-1 rounded">
                                        #{sol.id}
                                    </span>
                                </div>
                                <div className="card-body px-4 d-flex flex-column">
                                    <h5 className="fw-bold text-dark mb-1 lh-sm">{sol.titulo}</h5>
                                    <div className="text-muted small mt-1 mb-2">
                                        <i className="bi bi-person-circle me-1"></i>
                                        Solicitado por: <span className="fw-bold">{sol.solicitante}</span>
                                    </div>

                                    <div className="d-flex align-items-center text-muted small mb-3 mt-2">
                                        {sol.tipo === 'OT (Orden de Trabajo)' ? (
                                            <><i className="bi bi-gear-wide-connected text-primary me-2 fs-6"></i> <span className="fw-medium">{sol.activo_nombre}</span></>
                                        ) : (
                                            <><i className="bi bi-tools text-primary me-2 fs-6"></i> <span className="fw-medium">Servicio General</span></>
                                        )}
                                    </div>
                                    
                                    {sol.ubicacion && (
                                        <div className="d-flex align-items-center text-secondary small mb-3 bg-light p-2 rounded-3 border border-secondary border-opacity-10">
                                            <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                                            <span className="text-truncate">{sol.ubicacion}</span>
                                        </div>
                                    )}

                                    <div className="card-text text-secondary mb-3 mt-auto" style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {sol.descripcion}
                                    </div>
                                    {renderEvidencia(sol.imagen_url)}

                                </div>
                                <div className="card-footer bg-light border-top-0 text-muted small d-flex justify-content-between align-items-center py-3 px-4">
                                    <div className="d-flex align-items-center" title="Fecha de Solicitud">
                                        <i className="bi bi-calendar-event me-2 fs-6"></i>
                                        {new Date(sol.fecha_solicitud).toLocaleDateString()}
                                    </div>
                                    <div className="d-flex align-items-center text-truncate" title={`Asignado a: ${sol.tecnico_asignado}`}>
                                        <i className="bi bi-person-badge me-2 fs-6"></i>
                                        <span className="text-truncate fw-medium" style={{maxWidth: '120px'}}>{sol.tecnico_asignado || 'Sin Asignar'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-12">
                            <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-dashed p-5">
                                <i className="bi bi-clipboard-x text-muted opacity-25" style={{ fontSize: '5rem' }}></i>
                                <h4 className="mt-4 text-dark fw-bold">No se encontraron solicitudes</h4>
                                <p className="text-muted">Intenta cambiar los filtros o crea una nueva solicitud.</p>
                                <button className="btn btn-outline-primary mt-2 rounded-pill px-4" onClick={() => { setFiltroEstado('TODOS'); setVistaPropiedad('TODAS'); }}>
                                    Ver absolutamente todas
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <NuevaSolicitudClienteModal 
                show={showModal} 
                onClose={() => setShowModal(false)} 
                onSave={cargarSolicitudes} 
            />
        </div>
    );
};

const styles = document.createElement('style');
styles.innerHTML = `
    .card-hover:hover { transform: translateY(-5px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
    .transition-all { transition: all 0.3s ease; }
    .image-hover:hover { opacity: 0.8; }
    .custom-scrollbar::-webkit-scrollbar { height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
`;
document.head.appendChild(styles);

export default PortalCliente;