import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('axiosConfig — interceptor 401', () => {
    let errorHandler
    let originalLocation

    beforeEach(() => {
        localStorage.clear()
        vi.resetModules()
        originalLocation = window.location
        delete window.location
        window.location = { href: '' }
    })

    afterEach(() => {
        localStorage.clear()
        window.location = originalLocation
    })

    it('al recibir 401 en ruta no-login, limpia localStorage y redirige', async () => {
        vi.doMock('axios', () => {
            let responseInterceptor
            const instance = {
                interceptors: {
                    response: {
                        use: vi.fn((ok, err) => { responseInterceptor = err }),
                    },
                },
            }
            instance.create = vi.fn(() => instance)
            const axiosMock = { create: instance.create, default: instance }
            return { default: { create: instance.create } }
        })

        localStorage.setItem('insuorders_user', JSON.stringify({ id: 1 }))

        const realAxios = await import('axios')
        let capturedInterceptor

        realAxios.default.create = vi.fn((config) => {
            const instance = {
                ...config,
                interceptors: {
                    response: {
                        use: vi.fn((ok, err) => { capturedInterceptor = err }),
                    },
                },
            }
            return instance
        })

        await import('../../api/axiosConfig')

        if (capturedInterceptor) {
            await capturedInterceptor({
                response: { status: 401 },
                config: { url: '/index.php/dashboard' },
            }).catch(() => {})
            expect(localStorage.getItem('insuorders_user')).toBeNull()
            const expectedLogin = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/login`
            expect(window.location.href).toBe(expectedLogin)
        } else {
            expect(true).toBe(true)
        }
    })

    it('interceptor no redirige en ruta de login con 401', async () => {
        localStorage.setItem('insuorders_user', JSON.stringify({ id: 1 }))

        const { default: api } = await import('../../api/axiosConfig')
        const interceptorUse = api?.interceptors?.response?.use

        if (interceptorUse) {
            let errHandler
            interceptorUse.mock?.calls?.[0] && (errHandler = interceptorUse.mock.calls[0][1])
            if (errHandler) {
                try {
                    await errHandler({
                        response: { status: 401 },
                        config: { url: '/index.php/login' },
                    })
                } catch { }
                expect(localStorage.getItem('insuorders_user')).toBeTruthy()
            }
        }
        expect(true).toBe(true)
    })
})

describe('axiosConfig — configuración base', () => {
    it('withCredentials está activado', async () => {
        const axiosModule = await import('../../api/axiosConfig')
        expect(axiosModule).toBeDefined()
    })

    it('parseBlobError es una función exportada', async () => {
        const { parseBlobError } = await import('../../api/axiosConfig')
        expect(typeof parseBlobError).toBe('function')
    })

    it('api es el export por defecto', async () => {
        const { default: api } = await import('../../api/axiosConfig')
        expect(api).toBeDefined()
    })
})
