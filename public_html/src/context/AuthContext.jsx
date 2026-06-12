import { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/axiosConfig";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});
    const [loading, setLoading] = useState(true);

    const revalidarSesion = useCallback(async () => {
        try {
            const res = await api.get('/index.php/auth/me');
            if (res.data?.success && res.data.user) {
                const userData = {
                    id: res.data.user.id,
                    nombre: res.data.user.nombre,
                    rol: res.data.user.rol,
                    permisos: res.data.user.permisos || []
                };
                setAuth(userData);
                localStorage.setItem("insuorders_user", JSON.stringify(userData));
            }
        } catch {
            // Sesión expirada o revocada: limpiar estado local
            setAuth({});
            localStorage.removeItem("insuorders_user");
        }
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("insuorders_user");
        if (storedUser) {
            try {
                setAuth(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem("insuorders_user");
            }
        }
        // Revalidar permisos frescos del backend al iniciar
        revalidarSesion().finally(() => setLoading(false));
    }, [revalidarSesion]);

    useEffect(() => {
        const onFocus = () => { if (auth.id) revalidarSesion(); };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [auth.id, revalidarSesion]);

    const login = async (username, password) => {
        try {
            const response = await api.post('/index.php/login', { username, password });

            if (response.data.success) {
                // A1 fix: NO guardamos el token en localStorage.
                // El JWT viaja en cookie HttpOnly que JS no puede leer.
                // localStorage solo guarda info para la UI (nombre, rol, permisos).
                const userData = {
                    id: response.data.user.id,
                    nombre: response.data.user.nombre,
                    rol: response.data.user.rol,
                    permisos: response.data.user.permisos || []
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

    const logout = async () => {
        setAuth({});
        localStorage.removeItem("insuorders_user");
        try {
            await api.post('/index.php/logout');
        } catch (e) {
            console.error("Error al hacer logout", e);
        }
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
