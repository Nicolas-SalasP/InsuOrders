import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export const usePermission = (permissionCode) => {
    const { auth } = useContext(AuthContext);
    if (!auth || !auth.token) return false;
    if (auth.rol === 'Admin') return true;
    return auth.permisos && auth.permisos.includes(permissionCode);
};