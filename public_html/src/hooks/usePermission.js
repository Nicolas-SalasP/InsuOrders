import { useContext } from 'react';
import AuthContext from '../context/AuthContext'; // CORREGIDO: Sin llaves {}

export const usePermission = () => {
    const { auth } = useContext(AuthContext);

    const can = (permissionCode) => {
        // Si no hay datos de autenticación o token, denegar
        if (!auth || !auth.token) return false;

        // Si es Admin (Rol ID 1 o string 'Admin'), tiene permiso total
        if (auth.rol === 'Admin' || auth.rol_id === 1) return true;

        // Verificar si el array de permisos existe y contiene el código
        if (auth.permisos && Array.isArray(auth.permisos)) {
            return auth.permisos.includes(permissionCode);
        }

        return false;
    };

    return { can };
};