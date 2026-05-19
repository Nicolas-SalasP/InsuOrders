import { describe, it, expect, vi } from 'vitest'
import { parseBlobError } from '../../api/axiosConfig'

describe('parseBlobError', () => {
    it('retorna null si el error no tiene response', async () => {
        const result = await parseBlobError(new Error('Network error'))
        expect(result).toBeNull()
    })

    it('retorna null si error es undefined', async () => {
        const result = await parseBlobError(undefined)
        expect(result).toBeNull()
    })

    it('lee el campo error de respuesta JSON directa', async () => {
        const error = {
            response: { data: { error: 'No tienes el rol necesario para acceder.' } }
        }
        const result = await parseBlobError(error)
        expect(result).toBe('No tienes el rol necesario para acceder.')
    })

    it('lee el campo message si no hay error', async () => {
        const error = {
            response: { data: { message: 'Error interno del servidor.' } }
        }
        const result = await parseBlobError(error)
        expect(result).toBe('Error interno del servidor.')
    })

    it('prefiere error sobre message', async () => {
        const error = {
            response: { data: { error: 'Sin permisos', message: 'Error genérico' } }
        }
        const result = await parseBlobError(error)
        expect(result).toBe('Sin permisos')
    })

    it('retorna null si data no tiene error ni message', async () => {
        const error = { response: { data: { success: false } } }
        const result = await parseBlobError(error)
        expect(result).toBeNull()
    })

    it('lee JSON desde un Blob de tipo application/json', async () => {
        const mockBlob = {
            type: 'application/json',
            text: async () => JSON.stringify({ error: 'Permiso denegado desde blob' })
        }
        const error = { response: { data: mockBlob } }
        const result = await parseBlobError(error)
        expect(result).toBe('Permiso denegado desde blob')
    })

    it('lee message de Blob si no hay error', async () => {
        const mockBlob = {
            type: 'application/json',
            text: async () => JSON.stringify({ message: 'Token expirado' })
        }
        const error = { response: { data: mockBlob } }
        const result = await parseBlobError(error)
        expect(result).toBe('Token expirado')
    })

    it('retorna Error desconocido si Blob JSON no tiene campos conocidos', async () => {
        const mockBlob = {
            type: 'application/json',
            text: async () => JSON.stringify({ code: 500 })
        }
        const error = { response: { data: mockBlob } }
        const result = await parseBlobError(error)
        expect(result).toBe('Error desconocido.')
    })

    it('ignora Blob con tipo distinto de application/json', async () => {
        const mockBlob = {
            type: 'application/octet-stream',
            text: async () => 'binary data'
        }
        const error = { response: { data: mockBlob } }
        const result = await parseBlobError(error)
        expect(result).toBeNull()
    })
})
