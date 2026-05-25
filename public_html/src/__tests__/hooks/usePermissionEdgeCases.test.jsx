import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermission } from '../../hooks/usePermission'
import AuthContext from '../../context/AuthContext'
import React from 'react'

const wrapper = (authValue) => ({ children }) => (
    <AuthContext.Provider value={{ auth: authValue }}>
        {children}
    </AuthContext.Provider>
)

describe('usePermission — edge cases', () => {
    it('id como string "0" es truthy y permite acceso con permiso', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: '0', rol: 'Tecnico', permisos: ['inv_ver'] })
        })
        expect(result.current.can('inv_ver')).toBe(true)
    })

    it('id como número 0 es falsy y bloquea el acceso', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: 0, rol: 'Tecnico', permisos: ['inv_ver'] })
        })
        expect(result.current.can('inv_ver')).toBe(false)
    })

    it('permiso vacío string retorna false para no-Admin', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: 5, rol: 'Tecnico', permisos: ['inv_ver'] })
        })
        expect(result.current.can('')).toBe(false)
    })

    it('Admin con id 0 es bloqueado porque 0 es falsy', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: 0, rol: 'Admin', permisos: [] })
        })
        expect(result.current.can('cualquier_permiso')).toBe(false)
    })

    it('permisos como string en lugar de array retorna false', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: 5, rol: 'Tecnico', permisos: 'inv_ver' })
        })
        expect(result.current.can('inv_ver')).toBe(false)
    })

    it('can() es consistente en llamadas múltiples', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: 5, rol: 'Bodeguero', permisos: ['inv_ver', 'bodega_ver'] })
        })
        expect(result.current.can('inv_ver')).toBe(true)
        expect(result.current.can('inv_ver')).toBe(true)
        expect(result.current.can('mant_ver')).toBe(false)
        expect(result.current.can('mant_ver')).toBe(false)
    })

    it('permiso con caracteres especiales no falla', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: 5, rol: 'Tecnico', permisos: ['inv_ver'] })
        })
        expect(result.current.can('perm/especial:123')).toBe(false)
    })

    it('rol null no rompe la función can()', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: 5, rol: null, permisos: ['inv_ver'] })
        })
        expect(result.current.can('inv_ver')).toBe(true)
    })
})
