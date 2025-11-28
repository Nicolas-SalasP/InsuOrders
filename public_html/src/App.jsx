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

const PrivateRoute = () => {
    const { auth, loading } = useContext(AuthContext);
    
    if (loading) return <div className="p-5 text-center">Cargando...</div>;
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
                <Route path="/inventario" element={<Inventario />} />
                <Route path="/compras" element={<Compras />} />
                <Route path="/mantencion" element={<h2>Módulo de Mantención (Próximamente)</h2>} />
                
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;