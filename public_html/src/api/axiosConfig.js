import axios from 'axios';

// import.meta.env.BASE_URL es la 'base' definida en vite.config.js ('/insuorders/').
// En desarrollo es '/', en produccion es '/insuorders/'.
// Asi la API queda en /insuorders/api sin hardcodear nada.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, ''); // quita el slash final
const baseURL = `${BASE}/api`;

// Helper para construir URLs de archivos subidos (imagenes, videos, evidencias).
// Usar en lugar de `/api${url}` -> apiUrl(url)
export const apiUrl = (path) => {
    if (!path) return '';
    const clean = path.startsWith('/') ? path : `/${path}`;
    return `${baseURL}${clean}`;
};

export const parseBlobError = async (error) => {
    const data = error?.response?.data
    if (data && typeof data.text === 'function' && data.type === 'application/json') {
        try {
            const text = await data.text()
            const json = JSON.parse(text)
            return json.error || json.message || 'Error desconocido.'
        } catch { }
    }
    if (error?.response?.data?.error) return error.response.data.error
    if (error?.response?.data?.message) return error.response.data.message
    return null
}

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const url = error.config.url || '';
            const isLoginRequest = url.includes('login');
            const isAuthMeRequest = url.includes('auth/me');

            if (!isLoginRequest && !isAuthMeRequest) {
                console.warn("Sesión expirada. Redirigiendo al login...");
                localStorage.removeItem("insuorders_user");
                window.location.href = `${BASE}/login`;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
