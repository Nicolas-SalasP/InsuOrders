import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import MessageModal from '../components/MessageModal';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [input, setInput] = useState({ username: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado del Modal
    const [modalInfo, setModalInfo] = useState({
        show: false,
        title: '',
        message: '',
        type: 'info'
    });

    const closeModal = () => {
        setModalInfo({ ...modalInfo, show: false });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await login(input.username, input.password);

            if (result.success) {
                const userRole = result.role;

                if (userRole === 'Cliente') {
                    navigate('/portal-cliente');
                } else if (userRole === 'Compras' || userRole === 'Encargado Compras') {
                    navigate('/compras');
                } else if (userRole === 'Bodega' || userRole === 'Bodegero') {
                    navigate('/bodega');
                } else if (userRole === 'Mantencion' || userRole === 'Jefe Mantención') {
                    navigate('/mantencion');
                } else if (userRole === 'Técnico Mantención' || userRole === 'Tecnico') {
                    navigate('/mis-mantenciones');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setModalInfo({
                    show: true,
                    title: 'Error de Ingreso',
                    message: result.message || 'Credenciales incorrectas',
                    type: 'error'
                });
                setIsSubmitting(false);
            }

        } catch (error) {
            console.error("Error en login:", error);
            let errorMsg = 'No se pudo conectar con el servidor.';
            if (error.response && error.response.data && error.response.data.message) {
                errorMsg = error.response.data.message;
            }

            setModalInfo({
                show: true,
                title: 'Acceso Denegado',
                message: errorMsg,
                type: 'error'
            });
            setIsSubmitting(false);
        }
    };

    return (
        // CAMBIO 1: Agregué 'w-100' para que ocupe todo el ancho y no se pegue a la izquierda.
        // CAMBIO 2: Puse un fondo degradado (gradient) que se ve más moderno que el gris plano.
        <div
            className="d-flex justify-content-center align-items-center min-vh-100 w-100"
            style={{
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // Degradado suave tipo "Nube"
                margin: 0,
                padding: 0
            }}
        >

            <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '400px', borderRadius: '15px', backgroundColor: '#ffffff' }}>
                <div className="card-body p-4 p-md-5">

                    <div className="text-center mb-4">
                        <div className="display-1 text-primary mb-2">🏭</div>
                        <h2 className="fw-bold text-dark">InsuOrders</h2>
                        <p className="text-muted">Acceso al Sistema</p>
                    </div>

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

            <MessageModal
                show={modalInfo.show}
                onClose={closeModal}
                title={modalInfo.title}
                message={modalInfo.message}
                type={modalInfo.type}
            />
        </div>
    );
};

export default Login;