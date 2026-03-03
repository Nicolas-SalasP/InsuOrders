import { NavLink } from 'react-router-dom';
import { useContext, useEffect, useState, useRef } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api/axiosConfig';

const Sidebar = ({ onClose }) => {
    const { logout, auth } = useContext(AuthContext);

    const [notificaciones, setNotificaciones] = useState({
        compras: { count: 0, mensajes: [] },
        bodega: { count: 0, mensajes: [] },
        mantencion: { count: 0, mensajes: [] },
        total: 0
    });

    const [showNotifDetails, setShowNotifDetails] = useState(false);
    const dropdownRef = useRef(null);

    // --- LÓGICA DE ROLES CORREGIDA ---
    const isAdmin = auth.rol === 'Admin' || auth.rol_id === 1;
    const hasPermisoCliente = auth.permisos && auth.permisos.includes('acceso_cliente');
    
    // Verificamos si el usuario tiene ALGÚN permiso interno (además del de cliente)
    const hasInternalPerms = auth.permisos && auth.permisos.some(p => p !== 'acceso_cliente');

    // Es Cliente "Puro" SOLO si no es admin y NO tiene permisos internos
    const isClientePuro = hasPermisoCliente && !isAdmin && !hasInternalPerms;

    const can = (permisoRequerido) => {
        if (isAdmin) return true;
        if (!auth.permisos) return false;
        return auth.permisos.includes(permisoRequerido);
    };

    const canViewDashboard = () => {
        if (isClientePuro) return false;
        if (isAdmin) return true;
        if (can('dash_resumen')) return true;
        if (can('dash_compras')) return true;
        if (can('dash_mantencion')) return true;
        if (can('dash_bodega')) return true;
        if (can('dash_personal')) return true;
        return false;
    };

    // --- EFECTOS ---
    useEffect(() => {
        const checkData = async () => {
            if (isClientePuro) return; 
            try {
                const res = await api.get('/index.php/notifications');
                if (res.data.success) {
                    setNotificaciones(res.data.data);
                }
            } catch (e) { }
        };

        if (auth.token) {
            checkData();
            const interval = setInterval(checkData, 15000);
            return () => clearInterval(interval);
        }
    }, [auth.token, isClientePuro]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifDetails(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleNavClick = () => {
        if (onClose) onClose();
    };

    const renderNotificationsList = () => {
        if (isClientePuro) return null;
        let items = [];
        let hasItems = false;

        const Item = ({ icon, color, title, text, to }) => (
            <NavLink to={to} onClick={() => setShowNotifDetails(false)} className="dropdown-item p-2 border-bottom d-flex align-items-start text-wrap" style={{ whiteSpace: 'normal' }}>
                <div className={`p-2 me-2 rounded bg-${color} bg-opacity-10 text-${color}`}>
                    <i className={`bi ${icon}`}></i>
                </div>
                <div>
                    <strong className="d-block small text-dark">{title}</strong>
                    <span className="small text-muted">{text}</span>
                </div>
            </NavLink>
        );
        
        if (can('compras_ver') && notificaciones.compras.mensajes.length > 0) {
            notificaciones.compras.mensajes.forEach((msg, idx) => {
                hasItems = true;
                items.push(<Item key={`comp-${idx}`} icon="bi-cart-plus" color="danger" title={msg.titulo} text={msg.texto} to={msg.ruta} />);
            });
        }
        if (can('bodega_ver') && notificaciones.bodega.mensajes.length > 0) {
            notificaciones.bodega.mensajes.forEach((msg, idx) => {
                hasItems = true;
                items.push(<Item key={`bod-${idx}`} icon="bi-box-seam" color="warning" title={msg.titulo} text={msg.texto} to={msg.ruta} />);
            });
        }
        if (can('mant_ver') && notificaciones.mantencion.mensajes.length > 0) {
            notificaciones.mantencion.mensajes.forEach((msg, idx) => {
                hasItems = true;
                items.push(<Item key={`mant-${idx}`} icon="bi-tools" color="primary" title={msg.titulo} text={msg.texto} to={msg.ruta} />);
            });
        }
        if (!hasItems) return <div className="text-center py-3 small text-muted">Sin novedades</div>;
        return items;
    };

    const countVisible = isClientePuro ? 0 :
        (can('compras_ver') ? notificaciones.compras.count : 0) +
        (can('bodega_ver') ? notificaciones.bodega.count : 0) +
        (can('mant_ver') ? notificaciones.mantencion.count : 0);

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark h-100 shadow" style={{ width: '260px' }}>
            {/* Header / Logo */}
            <div className="d-flex align-items-center justify-content-between mb-3 mb-md-0 me-md-auto">
                <a href="/" className="d-flex align-items-center text-white text-decoration-none">
                    <i className="bi bi-box-seam fs-4 me-2 text-primary"></i>
                    <span className="fs-4 fw-bold">InsuOrders</span>
                </a>
                <button className="btn btn-sm btn-outline-light d-md-none border-0" onClick={onClose}>
                    <i className="bi bi-x-lg fs-5"></i>
                </button>
            </div>

            {/* Perfil y Notificaciones */}
            <div className="d-flex align-items-center justify-content-between mb-3 px-3 py-2 bg-secondary bg-opacity-25 rounded position-relative mt-3 mt-md-3" ref={dropdownRef}>
                <div style={{ overflow: 'hidden' }}>
                    <div className="fw-bold text-truncate" title={auth.nombre} style={{ maxWidth: '140px' }}>{auth.nombre}</div>
                    <span className="badge bg-primary" style={{ fontSize: '0.7rem' }}>{auth.rol}</span>
                </div>

                {!isClientePuro && (
                    <div className="position-relative cursor-pointer" onClick={() => setShowNotifDetails(!showNotifDetails)}>
                        <i className={`bi bi-bell-fill fs-5 ${countVisible > 0 ? 'text-warning' : 'text-secondary'}`}></i>
                        {countVisible > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark">
                                {countVisible}
                            </span>
                        )}
                        {showNotifDetails && (
                            <div className="position-absolute bg-white text-dark rounded shadow-lg" style={{ top: '35px', left: '10px', width: '280px', zIndex: 1050, maxHeight: '400px', overflowY: 'auto' }}>
                                <div className="bg-light p-2 border-bottom fw-bold small text-uppercase d-flex justify-content-between">
                                    <span>Notificaciones</span>
                                    {countVisible > 0 && <span className="badge bg-danger rounded-pill">{countVisible}</span>}
                                </div>
                                <div>{renderNotificationsList()}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MENÚ DE NAVEGACIÓN */}
            <div className="overflow-auto hide-scrollbar flex-grow-1" style={{ minHeight: 0 }}>
                <ul className="nav nav-pills flex-column mb-auto gap-1">

                    {/* === SECCIÓN CLIENTES === */}
                    {(hasPermisoCliente || isAdmin) && (
                        <>
                            <li className="nav-item mt-2">
                                <div className="ps-3 mb-1 text-uppercase text-white-50 fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                                    Clientes
                                </div>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/portal-cliente" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active bg-gradient' : ''}`}>
                                    <i className="bi bi-person-workspace me-2"></i> Mis Solicitudes
                                </NavLink>
                            </li>
                            {isAdmin && <hr className="border-secondary my-3 opacity-50" />}
                        </>
                    )}

                    {/* === SECCIÓN GESTIÓN INTERNA (Staff/Admin) === */}
                    {(hasInternalPerms || isAdmin) && (
                        <>
                            {isAdmin && (
                                <li className="nav-item">
                                    <div className="ps-3 mb-1 text-uppercase text-white-50 fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                                        Gestión
                                    </div>
                                </li>
                            )}

                            {can('activos_ver') && (
                                <li>
                                    <NavLink to="/activos" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active bg-gradient' : ''}`}>
                                        <i className="bi bi-hdd-rack me-2"></i> Activos
                                    </NavLink>
                                </li>
                            )}

                            {can('bodega_ver') && (
                                <li>
                                    <NavLink to="/bodega" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active bg-gradient' : ''} d-flex justify-content-between`}>
                                        <span><i className="bi bi-inboxes me-2"></i> Bodega</span>
                                        {notificaciones.bodega.count > 0 && <span className="badge bg-danger rounded-pill">{notificaciones.bodega.count}</span>}
                                    </NavLink>
                                </li>
                            )}

                            {canViewDashboard() && (
                                <li className="nav-item">
                                    <NavLink to="/dashboard" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active bg-gradient' : ''}`}>
                                        <i className="bi bi-speedometer2 me-2"></i> Dashboard
                                    </NavLink>
                                </li>
                            )}

                            {can('inv_ver') && (
                                <li>
                                    <NavLink to="/inventario" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active bg-gradient' : ''}`}>
                                        <i className="bi bi-boxes me-2"></i> Inventario
                                    </NavLink>
                                </li>
                            )}

                            {can('compras_ver') && (
                                <li>
                                    <NavLink to="/compras" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active bg-gradient' : ''} d-flex justify-content-between`}>
                                        <span><i className="bi bi-cart3 me-2"></i> Compras</span>
                                        {notificaciones.compras.count > 0 && <span className="badge bg-danger rounded-pill">{notificaciones.compras.count}</span>}
                                    </NavLink>
                                </li>
                            )}
                            {can('cot_ver') && (
                                <li>
                                    <NavLink to="/cotizaciones" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active bg-gradient' : ''}`}>
                                        <i className="bi bi-file-earmark-text me-2"></i> Cotizaciones
                                    </NavLink>
                                </li>
                            )}

                            {can('prov_ver') && (
                                <li>
                                    <NavLink to="/proveedores" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active bg-gradient' : ''}`}>
                                        <i className="bi bi-people me-2"></i> Proveedores
                                    </NavLink>
                                </li>
                            )}

                            {can('mant_ver') && (
                                <li>
                                    <NavLink to="/mantencion" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active bg-gradient' : ''}`}>
                                        <i className="bi bi-wrench me-2"></i> Mantención
                                    </NavLink>
                                </li>
                            )}

                            {can('cron_ver') && (
                                <li>
                                    <NavLink to="/cronograma" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active bg-gradient' : ''}`}>
                                        <i className="bi bi-calendar-check me-2"></i> Cronograma
                                    </NavLink>
                                </li>
                            )}

                            {can('ope_ver') && (
                                <>
                                    <li className="nav-item">
                                        <NavLink to="/mis-insumos" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active bg-gradient' : ''}`}>
                                            <i className="bi bi-tools me-2"></i> Mis Insumos
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink to="/mis-mantenciones" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active bg-gradient' : ''}`}>
                                            <i className="bi bi-clipboard-check me-2"></i> Mis Mantenciones
                                        </NavLink>
                                    </li>
                                </>
                            )}

                            {(can('ver_usuarios') || can('ver_config')) && (
                                <li className="mt-3 pt-3 border-top border-secondary opacity-75">
                                    <div className="ps-3 mb-2 text-uppercase text-white-50 fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                                        Administración
                                    </div>
                                </li>
                            )}

                            {can('ver_config') && (
                                <li>
                                    <NavLink to="/mantenedores" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active bg-gradient' : ''}`}>
                                        <i className="bi bi-sliders me-2"></i> Configuración
                                    </NavLink>
                                </li>
                            )}

                            {can('ver_usuarios') && (
                                <li>
                                    <NavLink to="/usuarios" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active bg-gradient' : ''}`}>
                                        <i className="bi bi-person-fill-gear me-2"></i> Usuarios
                                    </NavLink>
                                </li>
                            )}
                        </>
                    )}
                </ul>
            </div>

            <hr className="mt-auto border-secondary" />
            <button onClick={logout} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 hover-shadow">
                <i className="bi bi-box-arrow-left"></i> Cerrar Sesión
            </button>
        </div>
    );
};

export default Sidebar;