import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AuthContext from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'

vi.mock('../../api/axiosConfig', () => ({
    default: {
        get: vi.fn().mockResolvedValue({ data: { success: false } }),
        interceptors: { response: { use: vi.fn() } },
    },
    parseBlobError: vi.fn(),
}))

const renderSidebar = (auth) =>
    render(
        <AuthContext.Provider value={{ auth, logout: vi.fn() }}>
            <MemoryRouter>
                <Sidebar />
            </MemoryRouter>
        </AuthContext.Provider>
    )

const adminAuth = { id: 1, nombre: 'Admin User', rol: 'Admin', permisos: [] }

const tecnicoAuth = {
    id: 5, nombre: 'Juan Técnico', rol: 'Tecnico',
    permisos: ['mant_ver', 'ope_ver']
}

const clienteAuth = {
    id: 9, nombre: 'Cliente SA', rol: 'Cliente',
    permisos: ['acceso_cliente']
}

const bodegueroAuth = {
    id: 7, nombre: 'Pedro Bodega', rol: 'Bodeguero',
    permisos: ['bodega_ver', 'inv_ver']
}

describe('Sidebar — Admin ve todos los menús', () => {
    it('Admin ve el link de Inventario', () => {
        renderSidebar(adminAuth)
        expect(screen.getByText('Inventario')).toBeInTheDocument()
    })

    it('Admin ve el link de Compras', () => {
        renderSidebar(adminAuth)
        expect(screen.getByText('Compras')).toBeInTheDocument()
    })

    it('Admin ve el link de Mantención', () => {
        renderSidebar(adminAuth)
        expect(screen.getByText('Mantención')).toBeInTheDocument()
    })

    it('Admin ve el link de Usuarios', () => {
        renderSidebar(adminAuth)
        expect(screen.getByText('Usuarios')).toBeInTheDocument()
    })
})

describe('Sidebar — Técnico ve solo sus módulos', () => {
    it('Técnico ve Mis Mantenciones', () => {
        renderSidebar(tecnicoAuth)
        expect(screen.getByText('Mis Mantenciones')).toBeInTheDocument()
    })

    it('Técnico no ve Compras', () => {
        renderSidebar(tecnicoAuth)
        expect(screen.queryByText('Compras')).not.toBeInTheDocument()
    })

    it('Técnico no ve Usuarios', () => {
        renderSidebar(tecnicoAuth)
        expect(screen.queryByText('Usuarios')).not.toBeInTheDocument()
    })
})

describe('Sidebar — Cliente puro ve solo portal', () => {
    it('Cliente puro ve Mis Solicitudes', () => {
        renderSidebar(clienteAuth)
        expect(screen.getByText('Mis Solicitudes')).toBeInTheDocument()
    })

    it('Cliente puro no ve Inventario', () => {
        renderSidebar(clienteAuth)
        expect(screen.queryByText('Inventario')).not.toBeInTheDocument()
    })

    it('Cliente puro no ve Compras', () => {
        renderSidebar(clienteAuth)
        expect(screen.queryByText('Compras')).not.toBeInTheDocument()
    })
})

describe('Sidebar — Bodeguero ve sus módulos', () => {
    it('Bodeguero ve Inventario con permiso inv_ver', () => {
        renderSidebar(bodegueroAuth)
        expect(screen.getByText('Inventario')).toBeInTheDocument()
    })

    it('Bodeguero no ve Mantención sin permiso mant_ver', () => {
        renderSidebar(bodegueroAuth)
        expect(screen.queryByText('Mantención')).not.toBeInTheDocument()
    })
})

describe('Sidebar — nombre del usuario', () => {
    it('muestra el nombre del usuario logueado', () => {
        renderSidebar(adminAuth)
        expect(screen.getByText('Admin User')).toBeInTheDocument()
    })
})
