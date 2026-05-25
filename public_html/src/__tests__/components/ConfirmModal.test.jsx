import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmModal from '../../components/ConfirmModal'

describe('ConfirmModal', () => {
    it('no renderiza nada si show es false', () => {
        const { container } = render(
            <ConfirmModal show={false} onClose={vi.fn()} onConfirm={vi.fn()} title="T" message="M" />
        )
        expect(container.firstChild).toBeNull()
    })

    it('muestra título y mensaje cuando show es true', () => {
        render(
            <ConfirmModal show={true} onClose={vi.fn()} onConfirm={vi.fn()}
                title="¿Eliminar?" message="Esta acción no se puede deshacer" />
        )
        expect(screen.getByText('¿Eliminar?')).toBeInTheDocument()
        expect(screen.getByText('Esta acción no se puede deshacer')).toBeInTheDocument()
    })

    it('llama onConfirm al confirmar', () => {
        const onConfirm = vi.fn()
        render(
            <ConfirmModal show={true} onClose={vi.fn()} onConfirm={onConfirm}
                title="T" message="M" confirmText="Sí, eliminar" />
        )
        fireEvent.click(screen.getByText('Sí, eliminar'))
        expect(onConfirm).toHaveBeenCalledOnce()
    })

    it('llama onClose al cancelar', () => {
        const onClose = vi.fn()
        render(
            <ConfirmModal show={true} onClose={onClose} onConfirm={vi.fn()}
                title="T" message="M" cancelText="No, volver" />
        )
        fireEvent.click(screen.getByText('No, volver'))
        expect(onClose).toHaveBeenCalledOnce()
    })

    it('llama onClose al hacer click en X', () => {
        const onClose = vi.fn()
        render(
            <ConfirmModal show={true} onClose={onClose} onConfirm={vi.fn()} title="T" message="M" />
        )
        fireEvent.click(document.querySelector('.btn-close'))
        expect(onClose).toHaveBeenCalledOnce()
    })

    it('usa texto por defecto Confirmar y Cancelar', () => {
        render(
            <ConfirmModal show={true} onClose={vi.fn()} onConfirm={vi.fn()} title="T" message="M" />
        )
        expect(screen.getByText('Confirmar')).toBeInTheDocument()
        expect(screen.getByText('Cancelar')).toBeInTheDocument()
    })

    it('tipo danger aplica bg-danger en header', () => {
        const { container } = render(
            <ConfirmModal show={true} onClose={vi.fn()} onConfirm={vi.fn()}
                title="T" message="M" type="danger" />
        )
        expect(container.querySelector('.bg-danger')).toBeInTheDocument()
    })

    it('tipo warning aplica bg-warning en header', () => {
        const { container } = render(
            <ConfirmModal show={true} onClose={vi.fn()} onConfirm={vi.fn()}
                title="T" message="M" type="warning" />
        )
        expect(container.querySelector('.bg-warning')).toBeInTheDocument()
    })

    it('onConfirm no se llama al cancelar', () => {
        const onConfirm = vi.fn()
        render(
            <ConfirmModal show={true} onClose={vi.fn()} onConfirm={onConfirm}
                title="T" message="M" />
        )
        fireEvent.click(screen.getByText('Cancelar'))
        expect(onConfirm).not.toHaveBeenCalled()
    })

    it('onClose no se llama al confirmar', () => {
        const onClose = vi.fn()
        render(
            <ConfirmModal show={true} onClose={onClose} onConfirm={vi.fn()}
                title="T" message="M" />
        )
        fireEvent.click(screen.getByText('Confirmar'))
        expect(onClose).not.toHaveBeenCalled()
    })
})
