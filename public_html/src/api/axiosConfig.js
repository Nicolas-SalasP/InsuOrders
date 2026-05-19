import axios from 'axios';
const baseURL = '/api';

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
            const isLoginRequest = error.config.url && error.config.url.includes('login');

            if (!isLoginRequest) {
                console.warn("Sesión expirada. Redirigiendo al login...");
                localStorage.removeItem("insuorders_user");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
