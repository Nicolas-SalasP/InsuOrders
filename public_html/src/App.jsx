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
import Cronograma from './pages/Cronograma';
import AdminMantenedores from './pages/AdminMantenedores';

const PrivateRoute = () => {
    const { auth, loading } = useContext(AuthContext);
    if (loading) return <div className="p-5 text-center">Cargando...</div>;
    return auth.token ? <Outlet /> : <Navigate to="/login" />;
};

const RoleGuard = ({ children, deniedRoles = [] }) => {
    const { auth } = useContext(AuthContext);

    if (deniedRoles.includes(auth.rol)) {
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
                    {/* Ruta pública */}
                    <Route path="/login" element={<Login />} />

                    {/* Rutas Privadas */}
                    <Route element={<PrivateRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/" element={<RoleGuard deniedRoles={['Compras', 'Mantencion']}><Navigate to="/dashboard" /></RoleGuard>} />

                            {/* Dashboard Principal */}
                            <Route path="/dashboard" element={
                                <RoleGuard deniedRoles={['Compras', 'Mantencion']}>
                                    <Dashboard />
                                </RoleGuard>
                            } />

                            {/* Módulos Comunes */}
                            <Route path="/compras" element={<Compras />} />
                            <Route path="/proveedores" element={<Proveedores />} />

                            {/* Inventario (Bodega y Admin) */}
                            <Route path="/inventario" element={
                                <RoleGuard deniedRoles={['Mantencion']}>
                                    <Inventario />
                                </RoleGuard>
                            } />

                            {/* Bodega (Exclusivo Bodega y Admin) */}
                            <Route path="/bodega" element={
                                <RoleGuard deniedRoles={['Compras', 'Mantencion']}>
                                    <Bodega />
                                </RoleGuard>
                            } />

                            {/* Mantención (Exclusivo Mantención y Admin) */}
                            <Route path="/mantencion" element={
                                <RoleGuard deniedRoles={['Compras', 'Bodega']}>
                                    <Mantencion />
                                </RoleGuard>
                            } />

                            <Route path="/cronograma" element={
                                <RoleGuard deniedRoles={['Compras', 'Bodega']}>
                                    <Cronograma />
                                </RoleGuard>
                            } />

                            <Route path="/activos" element={
                                <RoleGuard deniedRoles={['Compras', 'Bodega']}>
                                    <Activos />
                                </RoleGuard>
                            } />

                            {/* Admin Mantenedores (Solo Admin) */}
                            <Route path="/mantenedores" element={
                                <RoleGuard deniedRoles={['Compras', 'Bodega', 'Mantencion']}>
                                    <AdminMantenedores />
                                </RoleGuard>
                            } />

                            {/* Usuarios (Solo Admin) */}
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