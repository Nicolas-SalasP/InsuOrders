import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import NuevaSolicitudClienteModal from '../components/NuevaSolicitudClienteModal';

const PortalCliente = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // ESTADO PARA EL FILTRO (Por defecto 'TODOS')
    const [filtro, setFiltro] = useState('TODOS');

    useEffect(() => {
        cargarSolicitudes();
    }, []);

    const cargarSolicitudes = async () => {
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

    // LÓGICA DE FILTRADO
    const solicitudesFiltradas = solicitudes.filter(sol => {
        if (filtro === 'TODOS') return true;
        
        // Normalizamos el estado a mayúsculas para comparar mejor
        const estado = sol.estado ? sol.estado.toUpperCase() : '';

        if (filtro === 'PENDIENTE') return estado === 'PENDIENTE';
        
        // Agrupamos "En Proceso", "Aprobada", "Asignada" como lo mismo para el cliente
        if (filtro === 'PROCESO') return ['EN PROCESO', 'APROBADA', 'ASIGNADA'].includes(estado);
        
        if (filtro === 'FINALIZADO') return ['FINALIZADA', 'TERMINADA', 'COMPLETADA'].includes(estado);
        
        if (filtro === 'CANCELADO') return ['ANULADA', 'RECHAZADA', 'CANCELADA'].includes(estado);

        return true;
    });

    const getBadgeColor = (estado) => {
        if (!estado) return 'bg-secondary';
        const st = estado.toUpperCase();
        if (st === 'PENDIENTE') return 'bg-warning text-dark';
        if (['EN PROCESO', 'APROBADA', 'ASIGNADA'].includes(st)) return 'bg-primary';
        if (['FINALIZADA', 'TERMINADA'].includes(st)) return 'bg-success';
        if (['ANULADA', 'RECHAZADA'].includes(st)) return 'bg-danger';
        return 'bg-secondary';
    };

    return (
        <div className="container-fluid p-4">
            
            {/* ENCABEZADO Y BOTÓN */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <h2 className="fw-bold text-dark m-0">
                    <i className="bi bi-person-workspace me-2 text-primary"></i>
                    Mis Solicitudes
                </h2>
                <button className="btn btn-primary shadow px-4 py-2 rounded-pill" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i>Nueva Solicitud
                </button>
            </div>

            {/* PESTAÑAS DE FILTRO */}
            <div className="mb-4 d-flex gap-2 flex-wrap justify-content-center justify-content-md-start">
                <button 
                    className={`btn rounded-pill px-3 ${filtro === 'TODOS' ? 'btn-dark' : 'btn-outline-secondary border-0 bg-white shadow-sm'}`}
                    onClick={() => setFiltro('TODOS')}
                >
                    Todas
                </button>
                <button 
                    className={`btn rounded-pill px-3 ${filtro === 'PENDIENTE' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary border-0 bg-white shadow-sm'}`}
                    onClick={() => setFiltro('PENDIENTE')}
                >
                    Pendientes
                </button>
                <button 
                    className={`btn rounded-pill px-3 ${filtro === 'PROCESO' ? 'btn-primary' : 'btn-outline-secondary border-0 bg-white shadow-sm'}`}
                    onClick={() => setFiltro('PROCESO')}
                >
                    En Proceso
                </button>
                <button 
                    className={`btn rounded-pill px-3 ${filtro === 'FINALIZADO' ? 'btn-success' : 'btn-outline-secondary border-0 bg-white shadow-sm'}`}
                    onClick={() => setFiltro('FINALIZADO')}
                >
                    Terminadas
                </button>
                <button 
                    className={`btn rounded-pill px-3 ${filtro === 'CANCELADO' ? 'btn-danger' : 'btn-outline-secondary border-0 bg-white shadow-sm'}`}
                    onClick={() => setFiltro('CANCELADO')}
                >
                    Canceladas
                </button>
            </div>

            {/* LISTADO DE TARJETAS */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Cargando tus solicitudes...</p>
                </div>
            ) : (
                <div className="row g-3">
                    {solicitudesFiltradas.length > 0 ? solicitudesFiltradas.map(sol => (
                        <div key={sol.id} className="col-12 col-md-6 col-lg-4">
                            <div className="card h-100 shadow-sm border-0 hover-shadow transition-all">
                                <div className="card-header bg-white border-bottom-0 d-flex justify-content-between align-items-center pt-3 px-3">
                                    <span className="badge bg-light text-dark border">
                                        <i className="bi bi-hash me-1"></i>{sol.id}
                                    </span>
                                    <span className={`badge ${getBadgeColor(sol.estado)} px-3 py-2 rounded-pill`}>
                                        {sol.estado}
                                    </span>
                                </div>
                                <div className="card-body px-3 pt-2">
                                    <div className="mb-2">
                                        <small className="text-uppercase fw-bold text-muted" style={{fontSize: '0.7rem'}}>
                                            {sol.tipo}
                                        </small>
                                    </div>
                                    
                                    {sol.activo_id && (
                                        <div className="mb-3 p-2 bg-light rounded d-flex align-items-center">
                                            <div className="bg-white p-2 rounded me-2 border text-primary">
                                                <i className="bi bi-gear-wide-connected fs-5"></i>
                                            </div>
                                            <div style={{lineHeight: '1.2'}}>
                                                <span className="d-block fw-bold text-dark small">{sol.activo_nombre}</span>
                                                <span className="text-muted" style={{fontSize: '0.75rem'}}>Máquina / Equipo</span>
                                            </div>
                                        </div>
                                    )}

                                    <p className="card-text text-secondary mb-3" style={{ fontSize: '0.95rem' }}>
                                        {sol.descripcion?.length > 100 
                                            ? sol.descripcion.substring(0, 100) + '...' 
                                            : sol.descripcion}
                                    </p>
                                    
                                    {sol.imagen_url && (
                                        <div className="mt-3 mb-2 rounded overflow-hidden border" style={{height: '140px'}}>
                                            <img 
                                                src={`/api/${sol.imagen_url}`} 
                                                alt="Evidencia" 
                                                className="w-100 h-100 object-fit-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="card-footer bg-white border-top-0 text-muted small d-flex justify-content-between pb-3 px-3">
                                    <span>
                                        <i className="bi bi-calendar-event me-1"></i>
                                        {new Date(sol.fecha_solicitud).toLocaleDateString()}
                                    </span>
                                    <span>
                                        <i className="bi bi-person-check me-1"></i>
                                        {sol.tecnico_asignado || 'Sin técnico'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-12">
                            <div className="text-center py-5 bg-light rounded border border-dashed">
                                <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                                <h4 className="mt-3 text-secondary">No hay solicitudes en esta categoría</h4>
                                <p className="text-muted">Intenta cambiar el filtro o crea una nueva solicitud.</p>
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

export default PortalCliente;