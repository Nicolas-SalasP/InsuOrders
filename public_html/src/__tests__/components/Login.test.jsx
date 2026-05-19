import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AuthContext from '../../context/AuthContext'
import Login from '../../pages/Login'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, useNavigate: () => mockNavigate }
})

const renderLogin = (loginFn = vi.fn()) =>
    render(
        <AuthContext.Provider value={{ login: loginFn }}>
            <MemoryRouter><Login /></MemoryRouter>
        </AuthContext.Provider>
    )

const submitForm = () => {
    const form = screen.getByRole('button', { name: 'Entrar' }).closest('form')
    fireEvent.submit(form)
}

describe('Login — renderizado', () => {
    it('muestra el campo de usuario', () => {
        renderLogin()
        expect(screen.getByLabelText('Usuario')).toBeInTheDocument()
    })

    it('muestra el campo de contraseña', () => {
        renderLogin()
        expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    })

    it('muestra el botón Entrar', () => {
        renderLogin()
        expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
    })

    it('muestra el título InsuOrders', () => {
        renderLogin()
        expect(screen.getByText('InsuOrders')).toBeInTheDocument()
    })
})

describe('Login — interacción', () => {
    beforeEach(() => {
        mockNavigate.mockClear()
    })

    it('botón se deshabilita mientras verifica', async () => {
        const loginFn = vi.fn(() => new Promise(() => {}))
        renderLogin(loginFn)
        await act(async () => { submitForm() })
        await waitFor(() => {
            expect(screen.getByText('Verificando...')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Verificando...' })).toBeDisabled()
        })
    })

    it('Admin navega a /dashboard', async () => {
        const loginFn = vi.fn().mockResolvedValue({ success: true, role: 'Admin' })
        renderLogin(loginFn)
        await act(async () => { submitForm() })
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
    })

    it('Cliente navega a /portal-cliente', async () => {
        const loginFn = vi.fn().mockResolvedValue({ success: true, role: 'Cliente' })
        renderLogin(loginFn)
        await act(async () => { submitForm() })
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/portal-cliente'))
    })

    it('Bodega navega a /bodega', async () => {
        const loginFn = vi.fn().mockResolvedValue({ success: true, role: 'Bodega' })
        renderLogin(loginFn)
        await act(async () => { submitForm() })
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/bodega'))
    })

    it('Tecnico navega a /mis-mantenciones', async () => {
        const loginFn = vi.fn().mockResolvedValue({ success: true, role: 'Tecnico' })
        renderLogin(loginFn)
        await act(async () => { submitForm() })
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/mis-mantenciones'))
    })

    it('Compras navega a /compras', async () => {
        const loginFn = vi.fn().mockResolvedValue({ success: true, role: 'Compras' })
        renderLogin(loginFn)
        await act(async () => { submitForm() })
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/compras'))
    })

    it('credenciales incorrectas muestra modal de error', async () => {
        const loginFn = vi.fn().mockResolvedValue({ success: false, message: 'Credenciales inválidas' })
        renderLogin(loginFn)
        await act(async () => { submitForm() })
        await waitFor(() => {
            expect(screen.getByText('Error de Ingreso')).toBeInTheDocument()
            expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument()
        })
    })

    it('botón Entrar vuelve a habilitarse tras error', async () => {
        const loginFn = vi.fn().mockResolvedValue({ success: false, message: 'Error' })
        renderLogin(loginFn)
        await act(async () => { submitForm() })
        await waitFor(() => {
            expect(screen.getByText('Entrar')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Entrar' })).not.toBeDisabled()
        })
    })

    it('el modal de error se cierra al hacer click en Entendido', async () => {
        const loginFn = vi.fn().mockResolvedValue({ success: false, message: 'Error' })
        renderLogin(loginFn)
        await act(async () => { submitForm() })
        await waitFor(() => screen.getByText('Error de Ingreso'))
        fireEvent.click(screen.getByText('Entendido'))
        await waitFor(() => {
            expect(screen.queryByText('Error de Ingreso')).not.toBeInTheDocument()
        })
    })

    it('llama login con username y password correctos', async () => {
        const loginFn = vi.fn().mockResolvedValue({ success: true, role: 'Admin' })
        renderLogin(loginFn)
        await userEvent.type(screen.getByLabelText('Usuario'), 'nicolas')
        await userEvent.type(screen.getByLabelText('Contraseña'), 'password123')
        await act(async () => { submitForm() })
        await waitFor(() => {
            expect(loginFn).toHaveBeenCalledWith('nicolas', 'password123')
        })
    })

    it('no navega si login falla', async () => {
        const loginFn = vi.fn().mockResolvedValue({ success: false, message: 'Error' })
        renderLogin(loginFn)
        await act(async () => { submitForm() })
        await waitFor(() => screen.getByText('Error de Ingreso'))
        expect(mockNavigate).not.toHaveBeenCalled()
    })
})
