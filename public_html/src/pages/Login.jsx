import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

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
            switch (result.role) {
                case 'Compras':
                    navigate('/compras');
                    break;
                case 'Bodega':
                    navigate('/bodega');
                    break;
                case 'Mantencion':
                    navigate('/mantencion');
                    break;
                default:
                    navigate('/dashboard');
            }
        } else {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="vw-100 vh-100 d-flex justify-content-center align-items-center bg-light">
            <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '400px', borderRadius: '15px' }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <div className="display-1 text-primary mb-2">🏭</div>
                        <h2 className="fw-bold text-dark">InsuOrders</h2>
                        <p className="text-muted">Acceso al Sistema</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger text-center py-2" role="alert">
                            <small>{error}</small>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                className="form-control"
                                id="floatingInput"
                                placeholder="Usuario"
                                value={input.username}
                                onChange={(e) => setInput({ ...input, username: e.target.value })}
                                required
                                autoFocus
                            />
                            <label htmlFor="floatingInput">Usuario</label>
                        </div>

                        <div className="form-floating mb-4">
                            <input
                                type="password"
                                className="form-control"
                                id="floatingPassword"
                                placeholder="Contraseña"
                                value={input.password}
                                onChange={(e) => setInput({ ...input, password: e.target.value })}
                                required
                            />
                            <label htmlFor="floatingPassword">Contraseña</label>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary w-100 btn-lg mb-3 shadow-sm"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Verificando...' : 'Entrar'}
                        </button>
                    </form>
                    
                    <div className="text-center mt-4">
                        <small className="text-muted">© 2024 Insuban Ltda.</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;