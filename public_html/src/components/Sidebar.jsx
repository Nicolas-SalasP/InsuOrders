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

    const can = (permisoRequerido) => {
        if (auth.rol === 'Admin' || auth.rol === 1) return true;
        return auth.permisos && auth.permisos.includes(permisoRequerido);
    };

    useEffect(() => {
        const checkData = async () => {
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
    }, [auth.token]);

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

        if (can('ver_compras') && notificaciones.compras.mensajes.length > 0) {
            notificaciones.compras.mensajes.forEach((msg, idx) => {
                hasItems = true;
                items.push(<Item key={`comp-${idx}`} icon="bi-cart-plus" color="danger" title={msg.titulo} text={msg.texto} to={msg.ruta} />);
            });
        }

        if (can('ver_bodega') && notificaciones.bodega.mensajes.length > 0) {
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

        if (!hasItems) {
            return <div className="text-center py-3 small text-muted">Sin novedades</div>;
        }

        return items;
    };

    const totalUsuario = () => {
        let t = 0;
        if (can('ver_compras')) t += notificaciones.compras.count;
        if (can('ver_bodega')) t += notificaciones.bodega.count;
        if (can('mant_ver')) t += notificaciones.mantencion.count;
        return t;
    };

    const countVisible = totalUsuario();

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark h-100" style={{ width: '260px' }}>

            <div className="d-flex align-items-center justify-content-between mb-3 mb-md-0 me-md-auto">
                <a href="/" className="d-flex align-items-center text-white text-decoration-none">
                    <i className="bi bi-box-seam fs-4 me-2"></i>
                    <span className="fs-4 fw-bold">InsuOrders</span>
                </a>
                <button className="btn btn-sm btn-outline-light d-md-none border-0" onClick={onClose}>
                    <i className="bi bi-x-lg fs-5"></i>
                </button>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3 px-2 py-2 bg-secondary bg-opacity-25 rounded position-relative mt-3 mt-md-0" ref={dropdownRef}>
                <div style={{ overflow: 'hidden' }}>
                    <div className="fw-bold text-truncate" title={auth.nombre} style={{ maxWidth: '140px' }}>{auth.nombre}</div>
                    <span className="badge bg-primary" style={{ fontSize: '0.7rem' }}>{auth.rol}</span>
                </div>

                <div className="position-relative cursor-pointer" onClick={() => setShowNotifDetails(!showNotifDetails)}>
                    <i className={`bi bi-bell-fill fs-5 ${countVisible > 0 ? 'text-warning' : 'text-secondary'}`}></i>

                    {countVisible > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark">
                            {countVisible}
                        </span>
                    )}

                    {showNotifDetails && (
                        <div className="position-absolute bg-white text-dark rounded shadow-lg"
                            style={{
                                top: '35px',
                                left: '10px',
                                width: '280px',
                                zIndex: 1050,
                                border: '1px solid #ccc',
                                maxHeight: '400px',
                                overflowY: 'auto'
                            }}>
                            <div className="bg-light p-2 border-bottom fw-bold small text-uppercase d-flex justify-content-between">
                                <span>Notificaciones</span>
                                {countVisible > 0 && <span className="badge bg-danger rounded-pill">{countVisible}</span>}
                            </div>
                            <div>
                                {renderNotificationsList()}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-auto custom-scrollbar">
                <ul className="nav nav-pills flex-column mb-auto gap-1">

                    <li className="nav-item">
                        <NavLink to="/dashboard" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                            <i className="bi bi-speedometer2 me-2"></i> Dashboard
                        </NavLink>
                    </li>

                    {can('ver_bodega') && (
                        <li>
                            <NavLink to="/bodega" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''} d-flex justify-content-between`}>
                                <span><i className="bi bi-inboxes me-2"></i> Bodega</span>
                                {notificaciones.bodega.count > 0 && <span className="badge bg-danger rounded-pill">{notificaciones.bodega.count}</span>}
                            </NavLink>
                        </li>
                    )}

                    {can('inv_ver') && (
                        <li>
                            <NavLink to="/inventario" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-boxes me-2"></i> Inventario
                            </NavLink>
                        </li>
                    )}

                    {can('ver_compras') && (
                        <li>
                            <NavLink to="/compras" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''} d-flex justify-content-between`}>
                                <span><i className="bi bi-cart3 me-2"></i> Compras</span>
                                {notificaciones.compras.count > 0 && <span className="badge bg-danger rounded-pill">{notificaciones.compras.count}</span>}
                            </NavLink>
                        </li>
                    )}

                    {can('ver_proveedores') && (
                        <li>
                            <NavLink to="/proveedores" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-people me-2"></i> Proveedores
                            </NavLink>
                        </li>
                    )}

                    {can('mant_ver') && (
                        <li>
                            <NavLink to="/mantencion" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-wrench me-2"></i> Mantención
                            </NavLink>
                        </li>
                    )}

                    {can('mant_ver') && (
                        <li>
                            <NavLink to="/cronograma" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-calendar-check me-2"></i> Cronograma
                            </NavLink>
                        </li>
                    )}

                    {can('mant_ver') && (
                        <li>
                            <NavLink to="/activos" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-hdd-rack me-2"></i> Activos
                            </NavLink>
                        </li>
                    )}

                    {(auth.rol === 4 || auth.rol === 1 || auth.rol === 'Admin' || auth.rol === 'Técnico Mantención') && (
                        <li className="nav-item">
                            <NavLink to="/mis-insumos" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-tools me-2"></i> Mis Insumos
                            </NavLink>
                        </li>
                    )}

                    {(can('ver_usuarios') || can('ver_config')) && (
                        <li className="mt-3 pt-3 border-top border-secondary">
                            <div className="ps-3 mb-2 text-uppercase text-white-50 fw-bold" style={{ fontSize: '0.75rem' }}>
                                Administración
                            </div>
                        </li>
                    )}

                    {can('ver_config') && (
                        <li>
                            <NavLink to="/mantenedores" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-sliders me-2"></i> Configuración
                            </NavLink>
                        </li>
                    )}

                    {can('ver_usuarios') && (
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