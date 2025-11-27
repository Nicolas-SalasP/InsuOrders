import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [input, setInput] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await login(input.username, input.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card shadow-lg" style={{ width: '400px', borderRadius: '15px' }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-primary">InsuOrders</h2>
                        <p className="text-muted">Gestión de Activos y Compras</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger text-center" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Usuario</label>
                            <input
                                type="text"
                                className="form-control form-control-lg"
                                placeholder="Ej: nsalas"
                                value={input.username}
                                onChange={(e) => setInput({ ...input, username: e.target.value })}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold">Contraseña</label>
                            <input
                                type="password"
                                className="form-control form-control-lg"
                                placeholder="••••••••"
                                value={input.password}
                                onChange={(e) => setInput({ ...input, password: e.target.value })}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary w-100 btn-lg mb-3"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
                        </button>
                    </form>
                    
                    <div className="text-center">
                        <small className="text-muted">¿Olvidaste tu clave? Contacta a TI</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;