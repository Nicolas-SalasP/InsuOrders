import { NavLink } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api/axiosConfig';

const Sidebar = () => {
    const { logout, auth } = useContext(AuthContext);
    const [notificaciones, setNotificaciones] = useState({ compras: 0, bodega: 0, total: 0 });

    // Polling de notificaciones cada 10s
    useEffect(() => {
        const checkNotificaciones = async () => {
            try {
                const res = await api.get('/index.php/notifications');
                if (res.data.success) setNotificaciones(res.data.data);
            } catch (e) {}
        };
        checkNotificaciones();
        const interval = setInterval(checkNotificaciones, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark h-100" style={{ width: '260px' }}>
            <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <i className="bi bi-box-seam fs-4 me-2"></i>
                <span className="fs-4 fw-bold">InsuOrders</span>
            </a>
            
            {/* Área de Perfil con Campanita */}
            <div className="d-flex align-items-center justify-content-between mb-3 px-2 py-2 bg-secondary bg-opacity-25 rounded">
                <div>
                    <div className="fw-bold text-truncate" style={{maxWidth: '140px'}}>{auth.nombre}</div>
                    <span className="badge bg-primary" style={{fontSize:'0.7rem'}}>{auth.rol}</span>
                </div>
                <div className="position-relative me-2" role="button" title="Notificaciones">
                    <i className="bi bi-bell-fill fs-5 text-warning"></i>
                    {notificaciones.total > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark">
                            {notificaciones.total}
                        </span>
                    )}
                </div>
            </div>
            
            <div className="overflow-auto">
                <ul className="nav nav-pills flex-column mb-auto gap-1">
                    <li className="nav-item">
                        <NavLink to="/dashboard" className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                            <i className="bi bi-speedometer2 me-2"></i> Dashboard
                        </NavLink>
                    </li>
                    
                    {/* BODEGA (Nuevo Link) */}
                    <li>
                        <NavLink to="/bodega" className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''} d-flex justify-content-between`}>
                            <span><i className="bi bi-inboxes me-2"></i> Bodega / Entregas</span>
                            {notificaciones.bodega > 0 && <span className="badge bg-danger rounded-pill">{notificaciones.bodega}</span>}
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/inventario" className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                            <i className="bi bi-boxes me-2"></i> Inventario Maestro
                        </NavLink>
                    </li>

                    {/* COMPRAS */}
                    <li>
                        <NavLink to="/compras" className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''} d-flex justify-content-between`}>
                            <span><i className="bi bi-cart3 me-2"></i> Compras</span>
                            {notificaciones.compras > 0 && <span className="badge bg-danger rounded-pill">{notificaciones.compras}</span>}
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/mantencion" className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                            <i className="bi bi-wrench me-2"></i> Mantención
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/activos" className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                            <i className="bi bi-hdd-rack me-2"></i> Activos
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/proveedores" className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                            <i className="bi bi-people me-2"></i> Proveedores
                        </NavLink>
                    </li>
                </ul>
            </div>

            <hr className="mt-auto" />
            <button onClick={logout} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
                <i className="bi bi-box-arrow-left"></i> Cerrar Sesión
            </button>
        </div>
    );
};

export default Sidebar;