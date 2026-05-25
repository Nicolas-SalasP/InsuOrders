import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../../context/AuthContext'

const PrivateRoute = () => {
    const { auth, loading } = useContext(AuthContext)
    if (loading) return <div>Cargando sistema...</div>
    return auth.id
        ? <Outlet />
        : <div data-testid="redirect-login">Redirigido a login</div>
}

const PermissionGuard = ({ children, permiso, redirectTo = '/dashboard' }) => {
    const { auth } = useContext(AuthContext)
    if (auth.rol === 'Admin' || auth.rol === 1) return children
    if (Array.isArray(permiso)) {
        if (permiso.some(p => auth.permisos?.includes(p))) return children
    } else if (permiso && auth.permisos?.includes(permiso)) {
        return children
    }
    return <div data-testid="redirect-no-permiso">Sin permiso</div>
}

const makeWrapper = (authValue, loading = false) => ({ children }) => (
    <AuthContext.Provider value={{ auth: authValue, loading }}>
        <MemoryRouter initialEntries={['/protegida']}>
            {children}
        </MemoryRouter>
    </AuthContext.Provider>
)

describe('PrivateRoute', () => {
    it('muestra loading mientras carga', () => {
        render(
            <AuthContext.Provider value={{ auth: {}, loading: true }}>
                <MemoryRouter><Routes>
                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<div>App</div>} />
                    </Route>
                </Routes></MemoryRouter>
            </AuthContext.Provider>
        )
        expect(screen.getByText('Cargando sistema...')).toBeInTheDocument()
    })

    it('redirige a login si no hay auth.id', () => {
        render(
            <AuthContext.Provider value={{ auth: {}, loading: false }}>
                <MemoryRouter><Routes>
                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<div>Contenido protegido</div>} />
                    </Route>
                </Routes></MemoryRouter>
            </AuthContext.Provider>
        )
        expect(screen.getByTestId('redirect-login')).toBeInTheDocument()
    })

    it('muestra el contenido si hay auth.id', () => {
        render(
            <AuthContext.Provider value={{ auth: { id: 1 }, loading: false }}>
                <MemoryRouter><Routes>
                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<div>Contenido protegido</div>} />
                    </Route>
                </Routes></MemoryRouter>
            </AuthContext.Provider>
        )
        expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
    })
})

describe('PermissionGuard', () => {
    it('Admin ve el contenido sin permisos específicos', () => {
        render(
            <AuthContext.Provider value={{ auth: { id: 1, rol: 'Admin', permisos: [] } }}>
                <MemoryRouter>
                    <PermissionGuard permiso="inv_ver">
                        <div>Inventario</div>
                    </PermissionGuard>
                </MemoryRouter>
            </AuthContext.Provider>
        )
        expect(screen.getByText('Inventario')).toBeInTheDocument()
    })

    it('usuario sin el permiso es redirigido', () => {
        render(
            <AuthContext.Provider value={{ auth: { id: 5, rol: 'Tecnico', permisos: ['mant_ver'] } }}>
                <MemoryRouter>
                    <PermissionGuard permiso="inv_ver">
                        <div>Inventario</div>
                    </PermissionGuard>
                </MemoryRouter>
            </AuthContext.Provider>
        )
        expect(screen.getByTestId('redirect-no-permiso')).toBeInTheDocument()
        expect(screen.queryByText('Inventario')).not.toBeInTheDocument()
    })

    it('usuario con el permiso exacto ve el contenido', () => {
        render(
            <AuthContext.Provider value={{ auth: { id: 5, rol: 'Bodeguero', permisos: ['inv_ver', 'bodega_ver'] } }}>
                <MemoryRouter>
                    <PermissionGuard permiso="inv_ver">
                        <div>Inventario</div>
                    </PermissionGuard>
                </MemoryRouter>
            </AuthContext.Provider>
        )
        expect(screen.getByText('Inventario')).toBeInTheDocument()
    })

    it('permiso como array: pasa si tiene al menos uno', () => {
        render(
            <AuthContext.Provider value={{ auth: { id: 5, rol: 'Tecnico', permisos: ['dash_bodega'] } }}>
                <MemoryRouter>
                    <PermissionGuard permiso={['dash_resumen', 'dash_compras', 'dash_bodega']}>
                        <div>Dashboard</div>
                    </PermissionGuard>
                </MemoryRouter>
            </AuthContext.Provider>
        )
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('permiso como array: rechaza si no tiene ninguno', () => {
        render(
            <AuthContext.Provider value={{ auth: { id: 5, rol: 'Tecnico', permisos: ['mant_ver'] } }}>
                <MemoryRouter>
                    <PermissionGuard permiso={['dash_resumen', 'dash_compras', 'dash_bodega']}>
                        <div>Dashboard</div>
                    </PermissionGuard>
                </MemoryRouter>
            </AuthContext.Provider>
        )
        expect(screen.getByTestId('redirect-no-permiso')).toBeInTheDocument()
    })

    it('usuario sin permisos definidos es rechazado', () => {
        render(
            <AuthContext.Provider value={{ auth: { id: 5, rol: 'Tecnico' } }}>
                <MemoryRouter>
                    <PermissionGuard permiso="inv_ver">
                        <div>Inventario</div>
                    </PermissionGuard>
                </MemoryRouter>
            </AuthContext.Provider>
        )
        expect(screen.getByTestId('redirect-no-permiso')).toBeInTheDocument()
    })
})
