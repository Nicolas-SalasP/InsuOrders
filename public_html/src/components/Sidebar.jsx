import { NavLink } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api/axiosConfig';

const Sidebar = ({ onClose }) => {
    const { logout, auth } = useContext(AuthContext);
    const [notificaciones, setNotificaciones] = useState({ compras: 0, bodega: 0, total: 0 });
    const [showNotifDetails, setShowNotifDetails] = useState(false);

    // --- LÓGICA ESTRICTA ---
    // 1. Si es 'Admin', entra a todo (Superusuario).
    // 2. Si NO es Admin, DEBE tener el permiso específico en su lista.
    // YA NO validamos por nombre de rol (ej: 'Bodega' o 'Compras').
    const can = (permisoRequerido) => {
        // ID 1 o nombre 'Admin' es el Dios del sistema
        if (auth.rol === 'Admin' || auth.rol === 1) return true;

        // Para los mortales, buscamos en la lista de permisos
        return auth.permisos && auth.permisos.includes(permisoRequerido);
    };

    useEffect(() => {
        const checkData = async () => {
            try {
                // Cargar notificaciones
                const res = await api.get('/index.php/notifications');
                if (res.data.success) setNotificaciones(res.data.data);
            } catch (e) { }
        };

        if (auth.token) {
            checkData();
            const interval = setInterval(checkData, 15000); // Cada 15s para no saturar
            return () => clearInterval(interval);
        }
    }, [auth.token]);

    const handleNavClick = () => {
        if (onClose) onClose();
    };

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark h-100" style={{ width: '260px' }}>

            {/* LOGO */}
            <div className="d-flex align-items-center justify-content-between mb-3 mb-md-0 me-md-auto">
                <a href="/" className="d-flex align-items-center text-white text-decoration-none">
                    <i className="bi bi-box-seam fs-4 me-2"></i>
                    <span className="fs-4 fw-bold">InsuOrders</span>
                </a>
                <button className="btn btn-sm btn-outline-light d-md-none border-0" onClick={onClose}>
                    <i className="bi bi-x-lg fs-5"></i>
                </button>
            </div>

            {/* PERFIL */}
            <div className="d-flex align-items-center justify-content-between mb-3 px-2 py-2 bg-secondary bg-opacity-25 rounded position-relative mt-3 mt-md-0">
                <div style={{ overflow: 'hidden' }}>
                    <div className="fw-bold text-truncate" title={auth.nombre} style={{ maxWidth: '140px' }}>{auth.nombre}</div>
                    <span className="badge bg-primary" style={{ fontSize: '0.7rem' }}>{auth.rol}</span>
                </div>

                {/* CAMPANA NOTIFICACIONES */}
                <div className="position-relative cursor-pointer" onClick={() => setShowNotifDetails(!showNotifDetails)}>
                    <i className="bi bi-bell-fill fs-5 text-warning"></i>
                    {notificaciones.total > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark">
                            {notificaciones.total}
                        </span>
                    )}
                </div>
            </div>

            {/* MENÚ DE NAVEGACIÓN */}
            <div className="overflow-auto custom-scrollbar">
                <ul className="nav nav-pills flex-column mb-auto gap-1">

                    {/* DASHBOARD: Visible para todos (o puedes crear un permiso 'ver_dashboard') */}
                    <li className="nav-item">
                        <NavLink to="/dashboard" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                            <i className="bi bi-speedometer2 me-2"></i> Dashboard
                        </NavLink>
                    </li>

                    {/* --- AQUÍ APLICAMOS LA LÓGICA ESTRICTA 'can()' --- */}

                    {/* BODEGA */}
                    {can('ver_bodega') && (
                        <li>
                            <NavLink to="/bodega" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''} d-flex justify-content-between`}>
                                <span><i className="bi bi-inboxes me-2"></i> Bodega</span>
                                {notificaciones.bodega > 0 && <span className="badge bg-danger rounded-pill">{notificaciones.bodega}</span>}
                            </NavLink>
                        </li>
                    )}

                    {/* INVENTARIO (usa 'inv_ver' según tu DB) */}
                    {can('inv_ver') && (
                        <li>
                            <NavLink to="/inventario" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-boxes me-2"></i> Inventario
                            </NavLink>
                        </li>
                    )}

                    {/* COMPRAS */}
                    {can('ver_compras') && (
                        <li>
                            <NavLink to="/compras" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''} d-flex justify-content-between`}>
                                <span><i className="bi bi-cart3 me-2"></i> Compras</span>
                                {notificaciones.compras > 0 && <span className="badge bg-danger rounded-pill">{notificaciones.compras}</span>}
                            </NavLink>
                        </li>
                    )}

                    {/* PROVEEDORES */}
                    {can('ver_proveedores') && (
                        <li>
                            <NavLink to="/proveedores" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-people me-2"></i> Proveedores
                            </NavLink>
                        </li>
                    )}

                    {/* MANTENCION */}
                    {can('ver_mantencion') && (
                        <li>
                            <NavLink to="/mantencion" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-wrench me-2"></i> Mantención
                            </NavLink>
                        </li>
                    )}

                    {/* CRONOGRAMA */}
                    {can('ver_cronograma') && (
                        <li>
                            <NavLink to="/cronograma" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-calendar-check me-2"></i> Cronograma
                            </NavLink>
                        </li>
                    )}

                    {/* ACTIVOS */}
                    {can('ver_activos') && (
                        <li>
                            <NavLink to="/activos" onClick={handleNavClick} className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                                <i className="bi bi-hdd-rack me-2"></i> Activos
                            </NavLink>
                        </li>
                    )}

                    {/* ADMINISTRACIÓN (Usuarios, Config, etc.) */}
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