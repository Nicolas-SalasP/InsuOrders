import axios from 'axios';

const api = axios.create({
    baseURL: '/api', 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const storedUser = localStorage.getItem("insuorders_user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch (e) {
                console.error("Error al leer token local", e);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Sesión expirada o no autorizada. Redirigiendo al login...");
            
            localStorage.removeItem("insuorders_user");
            
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;