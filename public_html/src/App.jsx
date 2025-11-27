import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Proveedores from './pages/Proveedores'; // <--- 1. IMPORTANTE: Importar la página nueva
import Layout from './components/Layout';

// Componente para proteger rutas privadas
const PrivateRoute = () => {
    const { auth, loading } = useContext(AuthContext);
    
    if (loading) return <div className="p-5 text-center">Cargando...</div>;
    
    // Si no hay usuario, mandar al login
    return auth.token ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/proveedores" element={<Proveedores />} />
                <Route path="/inventario" element={<h2>Módulo de Inventario (Próximamente)</h2>} />
                <Route path="/compras" element={<h2>Módulo de Compras (Próximamente)</h2>} />
                <Route path="/mantencion" element={<h2>Módulo de Mantención (Próximamente)</h2>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;