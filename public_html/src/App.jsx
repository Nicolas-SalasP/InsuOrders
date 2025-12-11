import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Proveedores from './pages/Proveedores';
import Layout from './components/Layout';
import Inventario from './pages/Inventario';
import Compras from './pages/Compras';
import Mantencion from './pages/Mantencion';
import Activos from './pages/Activos';
import Bodega from './pages/Bodega';
import Usuarios from './pages/Usuarios';

const PrivateRoute = () => {
    const { auth, loading } = useContext(AuthContext);
    if (loading) return <div className="p-5 text-center">Cargando...</div>;
    return auth.token ? <Outlet /> : <Navigate to="/login" />;
};

// Componente para proteger rutas según Rol
const RoleGuard = ({ children, deniedRoles = [] }) => {
    const { auth } = useContext(AuthContext);

    if (deniedRoles.includes(auth.rol)) {
        // Redirigir a una página segura según el rol
        if (auth.rol === 'Compras') return <Navigate to="/compras" replace />;
        if (auth.rol === 'Bodega') return <Navigate to="/bodega" replace />;
        if (auth.rol === 'Mantencion') return <Navigate to="/mantencion" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<PrivateRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/" element={<RoleGuard deniedRoles={['Compras', 'Mantencion']}><Navigate to="/dashboard" /></RoleGuard>} />
                            <Route path="/dashboard" element={
                                <RoleGuard deniedRoles={['Compras', 'Mantencion']}>
                                    <Dashboard />
                                </RoleGuard>
                            } />
                            <Route path="/compras" element={<Compras />} />
                            <Route path="/proveedores" element={<Proveedores />} />
                            <Route path="/inventario" element={
                                <RoleGuard deniedRoles={['Mantencion']}>
                                    <Inventario />
                                </RoleGuard>
                            } />
                            <Route path="/bodega" element={
                                <RoleGuard deniedRoles={['Compras', 'Mantencion']}>
                                    <Bodega />
                                </RoleGuard>
                            } />
                            <Route path="/mantencion" element={
                                <RoleGuard deniedRoles={['Compras', 'Bodega']}>
                                    <Mantencion />
                                </RoleGuard>
                            } />
                            <Route path="/activos" element={
                                <RoleGuard deniedRoles={['Compras', 'Bodega']}>
                                    <Activos />
                                </RoleGuard>
                            } />
                            <Route path="/usuarios" element={
                                <RoleGuard deniedRoles={['Compras', 'Bodega', 'Mantencion']}>
                                    <Usuarios />
                                </RoleGuard>
                            } />

                        </Route>
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;