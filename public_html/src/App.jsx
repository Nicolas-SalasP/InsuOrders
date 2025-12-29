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
    if (loading) return <div className="p-5 text-center">Cargando sistema...</div>;
    return auth.token ? <Outlet /> : <Navigate to="/login" />;
};

const PermissionGuard = ({ children, permiso }) => {
    const { auth } = useContext(AuthContext);

    if (auth.rol === 'Admin' || auth.rol === 1) return children;

    if (permiso && auth.permisos && auth.permisos.includes(permiso)) {
        return children;
    }
    return <Navigate to="/dashboard" replace />;
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<PrivateRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            
                            <Route path="/compras" element={
                                <PermissionGuard permiso="ver_compras">
                                    <Compras />
                                </PermissionGuard>
                            } />

                            <Route path="/proveedores" element={
                                <PermissionGuard permiso="ver_proveedores">
                                    <Proveedores />
                                </PermissionGuard>
                            } />

                            <Route path="/inventario" element={
                                <PermissionGuard permiso="inv_ver">
                                    <Inventario />
                                </PermissionGuard>
                            } />

                            <Route path="/bodega" element={
                                <PermissionGuard permiso="ver_bodega">
                                    <Bodega />
                                </PermissionGuard>
                            } />

                            <Route path="/mantencion" element={
                                <PermissionGuard permiso="mant_ver">
                                    <Mantencion />
                                </PermissionGuard>
                            } />

                            <Route path="/cronograma" element={
                                <PermissionGuard permiso="mant_ver">
                                    <Cronograma />
                                </PermissionGuard>
                            } />

                            <Route path="/activos" element={
                                <PermissionGuard permiso="mant_ver">
                                    <Activos />
                                </PermissionGuard>
                            } />

                            <Route path="/mantenedores" element={
                                <PermissionGuard permiso="ver_config">
                                    <AdminMantenedores />
                                </PermissionGuard>
                            } />

                            <Route path="/usuarios" element={
                                <PermissionGuard permiso="ver_usuarios">
                                    <Usuarios />
                                </PermissionGuard>
                            } />

                        </Route>
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;