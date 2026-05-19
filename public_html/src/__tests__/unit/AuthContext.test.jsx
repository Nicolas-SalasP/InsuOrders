import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider } from '../../context/AuthContext'
import AuthContext from '../../context/AuthContext'
import { useContext } from 'react'

vi.mock('../../api/axiosConfig', () => ({
    default: {
        post: vi.fn(),
        interceptors: {
            response: { use: vi.fn() },
        },
    },
    parseBlobError: vi.fn(),
}))

import api from '../../api/axiosConfig'

const AuthConsumer = () => {
    const { auth, loading } = useContext(AuthContext)
    return (
        <div>
            <span data-testid="loading">{String(loading)}</span>
            <span data-testid="auth-id">{auth.id || 'none'}</span>
            <span data-testid="auth-rol">{auth.rol || 'none'}</span>
        </div>
    )
}

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    afterEach(() => {
        localStorage.clear()
    })

    it('inicia con loading true y auth vacío', async () => {
        render(<AuthProvider><AuthConsumer /></AuthProvider>)
        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('false')
            expect(screen.getByTestId('auth-id').textContent).toBe('none')
        })
    })

    it('restaura auth desde localStorage al montar', async () => {
        localStorage.setItem('insuorders_user', JSON.stringify({
            id: 7, nombre: 'Juan', rol: 'Tecnico', permisos: ['mant_ver']
        }))
        render(<AuthProvider><AuthConsumer /></AuthProvider>)
        await waitFor(() => {
            expect(screen.getByTestId('auth-id').textContent).toBe('7')
            expect(screen.getByTestId('auth-rol').textContent).toBe('Tecnico')
        })
    })

    it('ignora localStorage corrupto sin romper la app', async () => {
        localStorage.setItem('insuorders_user', 'esto no es json{{{')
        render(<AuthProvider><AuthConsumer /></AuthProvider>)
        await waitFor(() => {
            expect(screen.getByTestId('auth-id').textContent).toBe('none')
            expect(localStorage.getItem('insuorders_user')).toBeNull()
        })
    })

    it('login exitoso guarda datos en localStorage sin token', async () => {
        api.post.mockResolvedValueOnce({
            data: {
                success: true,
                user: { id: 3, nombre: 'María', rol: 'Admin', permisos: [] }
            }
        })

        const LoginConsumer = () => {
            const { login, auth } = useContext(AuthContext)
            return (
                <div>
                    <button onClick={() => login('maria', '1234')}>Login</button>
                    <span data-testid="auth-id">{auth.id || 'none'}</span>
                </div>
            )
        }

        render(<AuthProvider><LoginConsumer /></AuthProvider>)
        await act(async () => {
            screen.getByText('Login').click()
        })

        await waitFor(() => {
            expect(screen.getByTestId('auth-id').textContent).toBe('3')
        })

        const stored = JSON.parse(localStorage.getItem('insuorders_user'))
        expect(stored.id).toBe(3)
        expect(stored.token).toBeUndefined()
    })

    it('login fallido retorna success: false', async () => {
        api.post.mockRejectedValueOnce({
            response: { status: 401, data: { message: 'Credenciales inválidas' } }
        })

        let result
        const LoginConsumer = () => {
            const { login } = useContext(AuthContext)
            return (
                <button onClick={async () => { result = await login('x', 'y') }}>Login</button>
            )
        }

        render(<AuthProvider><LoginConsumer /></AuthProvider>)
        await act(async () => { screen.getByText('Login').click() })

        expect(result.success).toBe(false)
        expect(result.message).toBe('Credenciales inválidas')
    })

    it('login retorna role del usuario en éxito', async () => {
        api.post.mockResolvedValueOnce({
            data: {
                success: true,
                user: { id: 1, nombre: 'Admin', rol: 'Admin', permisos: [] }
            }
        })

        let result
        const LoginConsumer = () => {
            const { login } = useContext(AuthContext)
            return (
                <button onClick={async () => { result = await login('admin', 'pass') }}>Login</button>
            )
        }

        render(<AuthProvider><LoginConsumer /></AuthProvider>)
        await act(async () => { screen.getByText('Login').click() })
        expect(result.role).toBe('Admin')
    })

    it('error de red retorna mensaje genérico', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        api.post.mockRejectedValueOnce(new Error('Network Error'))

        let result
        const LoginConsumer = () => {
            const { login } = useContext(AuthContext)
            return (
                <button onClick={async () => { result = await login('x', 'y') }}>Login</button>
            )
        }

        render(<AuthProvider><LoginConsumer /></AuthProvider>)
        await act(async () => { screen.getByText('Login').click() })
        expect(result.success).toBe(false)
        expect(result.message).toBe('Error al conectar con el servidor')
        consoleSpy.mockRestore()
    })
})
