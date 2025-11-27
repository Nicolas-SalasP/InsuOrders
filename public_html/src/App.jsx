import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';

const Dashboard = () => (
  <div className="container mt-5">
    <h1>🎉 ¡Bienvenido al Sistema!</h1>
    <p>Has iniciado sesión correctamente.</p>
    <p>Aquí irán los módulos de Inventario, Compras y Mantención.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;