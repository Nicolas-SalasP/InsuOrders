import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider } from '../../context/AuthContext'
import AuthContext from '../../context/AuthContext'
import { useContext } from 'react'

vi.mock('../../api/axiosConfig', () => ({
    default: {
        post: vi.fn(),
        interceptors: { response: { use: vi.fn() } },
    },
    parseBlobError: vi.fn(),
}))

import api from '../../api/axiosConfig'

const LogoutConsumer = () => {
    const { auth, logout } = useContext(AuthContext)
    return (
        <div>
            <span data-testid="auth-id">{auth.id || 'none'}</span>
            <button onClick={logout}>Logout</button>
        </div>
    )
}

describe('AuthContext — logout', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
        delete window.location
        window.location = { href: '' }
    })

    afterEach(() => {
        localStorage.clear()
    })

    it('logout limpia el localStorage', async () => {
        localStorage.setItem('insuorders_user', JSON.stringify({ id: 1, rol: 'Admin' }))
        api.post.mockResolvedValueOnce({ data: { success: true } })

        render(<AuthProvider><LogoutConsumer /></AuthProvider>)

        await act(async () => {
            screen.getByText('Logout').click()
        })

        await waitFor(() => {
            expect(localStorage.getItem('insuorders_user')).toBeNull()
        })
    })

    it('logout redirige a /login', async () => {
        api.post.mockResolvedValueOnce({ data: { success: true } })
        render(<AuthProvider><LogoutConsumer /></AuthProvider>)

        await act(async () => {
            screen.getByText('Logout').click()
        })

        await waitFor(() => {
            const expectedLogin = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/login`
            expect(window.location.href).toBe(expectedLogin)
        })
    })

    it('logout llama POST /index.php/logout', async () => {
        api.post.mockResolvedValueOnce({ data: { success: true } })
        render(<AuthProvider><LogoutConsumer /></AuthProvider>)

        await act(async () => {
            screen.getByText('Logout').click()
        })

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/index.php/logout')
        })
    })

    it('logout sigue funcionando aunque el POST falle', async () => {
        api.post.mockRejectedValueOnce(new Error('Network error'))
        render(<AuthProvider><LogoutConsumer /></AuthProvider>)

        await act(async () => {
            screen.getByText('Logout').click()
        })

        await waitFor(() => {
            const expectedLogin = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/login`
            expect(window.location.href).toBe(expectedLogin)
            expect(localStorage.getItem('insuorders_user')).toBeNull()
        })
    })
})

describe('AuthContext — persistencia de sesión', () => {
    beforeEach(() => localStorage.clear())
    afterEach(() => localStorage.clear())

    it('no rompe si localStorage tiene JSON malformado con BOM', async () => {
        localStorage.setItem('insuorders_user', '\uFEFF{"id":1}')
        render(<AuthProvider><div data-testid="ok">Loaded</div></AuthProvider>)
        await waitFor(() => {
            expect(screen.getByTestId('ok')).toBeInTheDocument()
        })
    })

    it('auth persiste con múltiples permisos', async () => {
        const permisos = ['inv_ver', 'bodega_ver', 'mant_ver', 'compras_ver']
        localStorage.setItem('insuorders_user', JSON.stringify({
            id: 3, nombre: 'Multi', rol: 'Gestor', permisos
        }))

        const PermConsumer = () => {
            const { auth } = useContext(AuthContext)
            return <span data-testid="count">{auth.permisos?.length ?? 0}</span>
        }

        render(<AuthProvider><PermConsumer /></AuthProvider>)
        await waitFor(() => {
            expect(screen.getByTestId('count').textContent).toBe('4')
        })
    })
})
