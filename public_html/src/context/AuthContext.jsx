import { createContext, useState, useEffect } from "react";
import api from "../api/axiosConfig";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("insuorders_user");
        if (storedUser) {
            setAuth(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/index.php/login', {
                username,
                password
            });

            if (response.data.success) {
                const userData = {
                    id: response.data.user.id,
                    nombre: response.data.user.nombre,
                    rol: response.data.user.rol,
                    token: response.data.token
                };
                setAuth(userData);
                localStorage.setItem("insuorders_user", JSON.stringify(userData));
                return { success: true, role: userData.rol };
            }
        } catch (error) {
            if (!error.response || error.response.status !== 401) {
                console.error("Error de conexión:", error);
            }

            return {
                success: false,
                message: error.response?.data?.message || "Error al conectar con el servidor"
            };
        }
    };

    const logout = () => {
        setAuth({});
        localStorage.removeItem("insuorders_user");
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;