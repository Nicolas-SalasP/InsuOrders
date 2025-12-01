import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

const Dashboard = () => {
    const [stats, setStats] = useState({
        ot_pendientes: 0,
        stock_critico: 0,
        bodega_pendientes: 0,
        compras_pendientes: 0
    });
    
    const [logs, setLogs] = useState([]);
    const [filtroArea, setFiltroArea] = useState('general');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDashboard();
    }, []);

    // Recargar logs cuando cambia el filtro
    useEffect(() => {
        cargarLogs();
    }, [filtroArea]);

    const cargarDashboard = async () => {
        try {
            const res = await api.get('/index.php/dashboard');
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error("Error cargando estadísticas", error);
        }
    };

    const cargarLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/index.php/dashboard/logs?area=${filtroArea}`);
            if (res.data.success) {
                setLogs(res.data.data);
            }
        } catch (error) {
            console.error("Error cargando logs", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper para colores de área
    const getAreaBadge = (area) => {
        switch (area) {
            case 'Mantención': return 'bg-warning text-dark';
            case 'Compras': return 'bg-primary';
            case 'Bodega': return 'bg-success';
            case 'Sistema': return 'bg-secondary';
            default: return 'bg-info text-dark';
        }
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0 fw-bold text-dark">Panel de Control</h2>
                <button className="btn btn-outline-primary btn-sm" onClick={() => { cargarDashboard(); cargarLogs(); }}>
                    <i className="bi bi-arrow-clockwise me-2"></i>Actualizar
                </button>
            </div>
            
            {/* --- TARJETAS KPI (DATOS REALES) --- */}
            <div className="row g-4 mb-5">
                {/* 1. Mantención */}
                <div className="col-md-3">
                    <div className="card text-white bg-primary h-100 shadow-sm border-0">
                        <div className="card-body d-flex flex-column justify-content-between">
                            <div>
                                <h6 className="card-title text-white-50 text-uppercase small fw-bold">OTs Pendientes</h6>
                                <p className="card-text display-5 fw-bold mb-0">{stats.ot_pendientes}</p>
                            </div>
                            <div className="mt-3 small border-top border-white border-opacity-25 pt-2">
                                <i className="bi bi-wrench-adjustable me-1"></i> Solicitudes en curso
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Bodega */}
                <div className="col-md-3">
                    <div className="card text-white bg-success h-100 shadow-sm border-0">
                        <div className="card-body d-flex flex-column justify-content-between">
                            <div>
                                <h6 className="card-title text-white-50 text-uppercase small fw-bold">Entregas Bodega</h6>
                                <p className="card-text display-5 fw-bold mb-0">{stats.bodega_pendientes}</p>
                            </div>
                            <div className="mt-3 small border-top border-white border-opacity-25 pt-2">
                                <i className="bi bi-box-seam me-1"></i> Ítems listos para retiro
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Stock Crítico */}
                <div className="col-md-3">
                    <div className="card text-dark bg-warning h-100 shadow-sm border-0">
                        <div className="card-body d-flex flex-column justify-content-between">
                            <div>
                                <h6 className="card-title text-dark-50 text-uppercase small fw-bold">Stock Bajo / Crítico</h6>
                                <p className="card-text display-5 fw-bold mb-0">{stats.stock_critico}</p>
                            </div>
                            <div className="mt-3 small border-top border-dark border-opacity-10 pt-2 text-dark">
                                <i className="bi bi-exclamation-triangle-fill me-1"></i> Reponer inventario
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Compras */}
                <div className="col-md-3">
                    <div className="card text-white bg-danger h-100 shadow-sm border-0">
                        <div className="card-body d-flex flex-column justify-content-between">
                            <div>
                                <h6 className="card-title text-white-50 text-uppercase small fw-bold">Compras en Curso</h6>
                                <p className="card-text display-5 fw-bold mb-0">{stats.compras_pendientes}</p>
                            </div>
                            <div className="mt-3 small border-top border-white border-opacity-25 pt-2">
                                <i className="bi bi-cart3 me-1"></i> OCs Emitidas o Parciales
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN DE LOGS / ACTIVIDAD --- */}
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-activity me-2"></i>Bitácora de Actividad</h5>
                    
                    {/* Filtros de Área */}
                    <div className="btn-group">
                        {['general', 'mantencion', 'compras', 'bodega', 'sistema'].map(area => (
                            <button 
                                key={area}
                                className={`btn btn-sm ${filtroArea === area ? 'btn-dark' : 'btn-outline-secondary'}`}
                                onClick={() => setFiltroArea(area)}
                            >
                                {area.charAt(0).toUpperCase() + area.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="card-body p-0">
                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light sticky-top">
                                <tr>
                                    <th className="ps-4" style={{width: '180px'}}>Fecha / Hora</th>
                                    <th style={{width: '150px'}}>Usuario</th>
                                    <th style={{width: '120px'}}>Área</th>
                                    <th>Descripción del Evento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" className="text-center py-5">Cargando actividad...</td></tr>
                                ) : logs.length > 0 ? (
                                    logs.map((log, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-4 text-muted small font-monospace">
                                                {new Date(log.fecha).toLocaleDateString()} {new Date(log.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </td>
                                            <td>
                                                <div className="fw-bold text-dark">{log.usuario || 'Sistema'}</div>
                                            </td>
                                            <td>
                                                <span className={`badge ${getAreaBadge(log.area)}`}>{log.area}</span>
                                            </td>
                                            <td>
                                                <div className="text-dark">{log.descripcion}</div>
                                                <small className="text-muted fst-italic" style={{fontSize: '0.75rem'}}>{log.accion}</small>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="text-center py-5 text-muted">No hay actividad registrada en este periodo.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;