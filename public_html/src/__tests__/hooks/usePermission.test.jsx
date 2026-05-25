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

describe('usePermission — can()', () => {
    it('retorna false si auth está vacío', () => {
        const { result } = renderHook(() => usePermission(), { wrapper: wrapper({}) })
        expect(result.current.can('inv_ver')).toBe(false)
    })

    it('retorna false si auth no tiene id', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ rol: 'Bodeguero', permisos: ['inv_ver'] })
        })
        expect(result.current.can('inv_ver')).toBe(false)
    })

    it('retorna true para Admin sin importar el permiso', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: 1, rol: 'Admin', permisos: [] })
        })
        expect(result.current.can('cualquier_permiso')).toBe(true)
    })

    it('retorna true si el permiso está en el array', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: 5, rol: 'Bodeguero', permisos: ['inv_ver', 'bodega_ver'] })
        })
        expect(result.current.can('inv_ver')).toBe(true)
    })

    it('retorna false si el permiso no está en el array', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: 5, rol: 'Bodeguero', permisos: ['inv_ver'] })
        })
        expect(result.current.can('mant_ver')).toBe(false)
    })

    it('retorna false si permisos es array vacío', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: 5, rol: 'Tecnico', permisos: [] })
        })
        expect(result.current.can('inv_ver')).toBe(false)
    })

    it('retorna false si permisos es null', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: 5, rol: 'Tecnico', permisos: null })
        })
        expect(result.current.can('inv_ver')).toBe(false)
    })

    it('retorna false si permisos no existe en auth', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: 5, rol: 'Tecnico' })
        })
        expect(result.current.can('inv_ver')).toBe(false)
    })

    it('multiple permisos: retorna true si tiene uno', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: 5, rol: 'Tecnico', permisos: ['mant_ver', 'ope_ver'] })
        })
        expect(result.current.can('ope_ver')).toBe(true)
        expect(result.current.can('inv_ver')).toBe(false)
    })

    it('Admin con rol_id 1 también tiene acceso total', () => {
        const { result } = renderHook(() => usePermission(), {
            wrapper: wrapper({ id: 1, rol_id: 1, permisos: [] })
        })
        expect(result.current.can('cualquier_permiso')).toBe(true)
    })
})
