import { NavLink } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api/axiosConfig';

// Recibimos 'onClose' como prop para poder cerrar el menú en móvil
const Sidebar = ({ onClose }) => {
    const { logout, auth } = useContext(AuthContext);
    const [notificaciones, setNotificaciones] = useState({ compras: 0, bodega: 0, total: 0 });
    const [showNotifDetails, setShowNotifDetails] = useState(false);

    // --- DEFINICIÓN DE PERMISOS ---
    const permisos = {
        dashboard: ['Admin'],
        bodega: ['Admin', 'Bodega'],
        inventario: ['Admin', 'Bodega', 'Compras'],
        compras: ['Admin', 'Compras'],
        mantencion: ['Admin', 'Mantencion'],
        cronograma: ['Admin', 'Mantencion'],
        activos: ['Admin', 'Mantencion'],
        proveedores: ['Admin', 'Compras'],
        mantenedores: ['Admin'],
        usuarios: ['Admin']
    };

    const puedeVer = (modulo) => permisos[modulo]?.includes(auth.rol);

    useEffect(() => {
        const checkNotificaciones = async () => {
            try {
                const res = await api.get('/index.php/notifications');
                if (res.data.success) setNotificaciones(res.data.data);
            } catch (e) { }
        };
        checkNotificaciones();
        const interval = setInterval(checkNotificaciones, 10000);
        return () => clearInterval(interval);
    }, []);

    // Función auxiliar para cerrar menú al navegar (solo en móvil)
    const handleNavClick = () => {
        if (onClose) onClose();
    };

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark h-100" style={{ width: '260px' }}>
            
            {/* HEADER DEL SIDEBAR */}
            <div className="d-flex align-items-center justify-content-between mb-3 mb-md-0 me-md-auto">
                <a href="/" className="d-flex align-items-center text-white text-decoration-none">
                    <i className="bi bi-box-seam fs-4 me-2"></i>
                    <span className="fs-4 fw-bold">InsuOrders</span>
                </a>
                {/* Botón cerrar solo visible en móvil */}
                <button 
                    className="btn btn-sm btn-outline-light d-md-none border-0" 
                    onClick={onClose}
                >
                    <i className="bi bi-x-lg fs-5"></i>
                </button>
            </div>

            {/* Perfil y Notificaciones */}
            <div className="d-flex align-items-center justify-content-between mb-3 px-2 py-2 bg-secondary bg-opacity-25 rounded position-relative mt-3 mt-md-0">
                <div style={{ overflow: 'hidden' }}>
                    <div className="fw-bold text-truncate" title={auth.nombre} style={{ maxWidth: '140px' }}>{auth.nombre}</div>
                    <span className="badge bg-primary" style={{ fontSize: '0.7rem' }}>{auth.rol}</span>
                </div>

                <div className="position-relative cursor-pointer"
                    role="button"
                    onClick={() => setShowNotifDetails(!showNotifDetails)}
                    title="Ver notificaciones">
                    <i className="bi bi-bell-fill fs-5 text-warning"></i>
                    {notificaciones.total > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark">
                            {notificaciones.total}
                        </span>
                    )}
                </div>

                {showNotifDetails && (
                    <div className="position-absolute bg-white text-dark shadow rounded p-2"
                        style={{ top: '100%', right: 0, width: '220px', zIndex: 1050, fontSize: '0.85rem' }}>
                        <h6 className="border-bottom pb-1 mb-2 fw-bold text-secondary">Pendientes</h6>
                        {notificaciones.total === 0 ? (
                            <div className="text-muted text-center py-2">Sin novedades ✅</div>
                        ) : (
                            <ul className="list-unstyled mb-0">
                                {notificaciones.compras > 0 && puedeVer('compras') && (
                                    <li className="mb-2 d-flex justify-content-between align-items-center">
                                        <span>🛒 Faltan Compras</span>
                                        <span className="badge bg-danger rounded-pill">{notificaciones.compras}</span>
                                    </li>
                                )}
                                {notificaciones.bodega > 0 && puedeVer('bodega') && (
                                    <li className="mb-1 d-flex justify-content-between align-items-center">
                                        <span>📦 Entregas Bodega</span>
                                        <span className="badge bg-warning text-dark rounded-pill">{notificaciones.bodega}</span>
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {/* Navegación */}
            <div className="overflow-auto custom-scrollbar">
                <ul className="nav nav-pills flex-column mb-auto gap-1">

                    {puedeVer('dashboard') && (
                        <li className="nav-item">
                            <NavLink to="/dashboard" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-speedometer2 me-2"></i> Dashboard
                            </NavLink>
                        </li>
                    )}

                    {puedeVer('bodega') && (
                        <li>
                            <NavLink to="/bodega" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''} d-flex justify-content-between`}>
                                <span><i className="bi bi-inboxes me-2"></i> Bodega</span>
                                {notificaciones.bodega > 0 && <span className="badge bg-danger rounded-pill">{notificaciones.bodega}</span>}
                            </NavLink>
                        </li>
                    )}

                    {puedeVer('inventario') && (
                        <li>
                            <NavLink to="/inventario" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-boxes me-2"></i> Inventario
                            </NavLink>
                        </li>
                    )}

                    {puedeVer('compras') && (
                        <li>
                            <NavLink to="/compras" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''} d-flex justify-content-between`}>
                                <span><i className="bi bi-cart3 me-2"></i> Compras</span>
                                {notificaciones.compras > 0 && <span className="badge bg-danger rounded-pill">{notificaciones.compras}</span>}
                            </NavLink>
                        </li>
                    )}

                    {puedeVer('proveedores') && (
                        <li>
                            <NavLink to="/proveedores" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-people me-2"></i> Proveedores
                            </NavLink>
                        </li>
                    )}

                    {puedeVer('mantencion') && (
                        <li>
                            <NavLink to="/mantencion" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-wrench me-2"></i> Mantención
                            </NavLink>
                        </li>
                    )}

                    {puedeVer('cronograma') && (
                        <li>
                            <NavLink to="/cronograma" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-calendar-check me-2"></i> Cronograma
                            </NavLink>
                        </li>
                    )}

                    {puedeVer('activos') && (
                        <li>
                            <NavLink to="/activos" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-hdd-rack me-2"></i> Activos
                            </NavLink>
                        </li>
                    )}

                    {/* SECCIÓN ADMINISTRACIÓN */}
                    {(puedeVer('usuarios') || puedeVer('mantenedores')) && (
                        <li className="mt-3 pt-3 border-top border-secondary">
                             <div className="ps-3 mb-2 text-uppercase text-white-50 fw-bold" style={{fontSize: '0.75rem'}}>
                                Administración
                             </div>
                        </li>
                    )}

                    {puedeVer('mantenedores') && (
                        <li>
                            <NavLink to="/mantenedores" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-sliders me-2"></i> Configuración
                            </NavLink>
                        </li>
                    )}

                    {puedeVer('usuarios') && (
                        <li>
                            <NavLink to="/usuarios" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-person-fill-gear me-2"></i> Usuarios
                            </NavLink>
                        </li>
                    )}
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