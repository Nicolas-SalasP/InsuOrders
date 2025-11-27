import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Sidebar = () => {
    const { logout, auth } = useContext(AuthContext);

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: '280px', minHeight: '100vh' }}>
            <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <span className="fs-4">🏭 InsuOrders</span>
            </a>
            <hr />
            <div className="mb-3 px-2">
                <small className="text-muted">Usuario:</small>
                <div className="fw-bold">{auth.nombre || 'Usuario'}</div>
                <div className="badge bg-secondary">{auth.rol || 'Rol'}</div>
            </div>
            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                        📊 Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/inventario" className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                        📦 Inventario
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/compras" className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                        🛒 Compras
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/mantencion" className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                        🔧 Mantención
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/proveedores" className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}>
                        🤝 Proveedores
                    </NavLink>
                </li>
            </ul>
            <hr />
            <button onClick={logout} className="btn btn-outline-danger w-100">
                Cerrar Sesión
            </button>
        </div>
    );
};

export default Sidebar;