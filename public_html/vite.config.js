import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// La app se sirve desde http://138.117.150.6/insuorders/
// 'base' hace que los assets compilados (JS/CSS) apunten a /insuorders/assets/...
// en vez de /assets/... (que iria a la raiz del servidor).
export default defineConfig({
    base: '/insuorders/',
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost',
                changeOrigin: true,
                rewrite: (path) => '/InsuOrders/public_html' + path
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/__tests__/setup.js'],
        css: false,
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{js,jsx}'],
            exclude: ['src/main.jsx', 'src/**/*.test.*', 'src/__tests__/**'],
        },
    },
})
