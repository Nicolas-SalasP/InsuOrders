import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MessageModal from '../../components/MessageModal'

describe('MessageModal', () => {
    it('no renderiza nada si show es false', () => {
        const { container } = render(
            <MessageModal show={false} onClose={vi.fn()} title="Test" message="Mensaje" />
        )
        expect(container.firstChild).toBeNull()
    })

    it('muestra el título cuando show es true', () => {
        render(<MessageModal show={true} onClose={vi.fn()} title="Error crítico" message="Algo salió mal" />)
        expect(screen.getByText('Error crítico')).toBeInTheDocument()
    })

    it('muestra el mensaje de texto', () => {
        render(<MessageModal show={true} onClose={vi.fn()} title="Info" message="Operación exitosa" />)
        expect(screen.getByText('Operación exitosa')).toBeInTheDocument()
    })

    it('llama onClose al hacer click en Entendido', () => {
        const onClose = vi.fn()
        render(<MessageModal show={true} onClose={onClose} title="Test" message="Msg" />)
        fireEvent.click(screen.getByText('Entendido'))
        expect(onClose).toHaveBeenCalledOnce()
    })

    it('llama onClose al hacer click en el botón X', () => {
        const onClose = vi.fn()
        render(<MessageModal show={true} onClose={onClose} title="Test" message="Msg" />)
        fireEvent.click(screen.getByLabelText('Cerrar'))
        expect(onClose).toHaveBeenCalledOnce()
    })

    it('tipo error aplica clase bg-danger', () => {
        const { container } = render(
            <MessageModal show={true} onClose={vi.fn()} title="Error" message="Msg" type="error" />
        )
        expect(container.querySelector('.bg-danger')).toBeInTheDocument()
    })

    it('tipo success aplica clase bg-success', () => {
        const { container } = render(
            <MessageModal show={true} onClose={vi.fn()} title="Ok" message="Msg" type="success" />
        )
        expect(container.querySelector('.bg-success')).toBeInTheDocument()
    })

    it('tipo info (default) aplica clase bg-primary', () => {
        const { container } = render(
            <MessageModal show={true} onClose={vi.fn()} title="Info" message="Msg" />
        )
        expect(container.querySelector('.bg-primary')).toBeInTheDocument()
    })

    it('botón Entendido tiene clase btn-outline-danger en tipo error', () => {
        render(<MessageModal show={true} onClose={vi.fn()} title="Error" message="Msg" type="error" />)
        expect(screen.getByText('Entendido')).toHaveClass('btn-outline-danger')
    })

    it('botón Entendido tiene clase btn-outline-success en tipo success', () => {
        render(<MessageModal show={true} onClose={vi.fn()} title="Ok" message="Msg" type="success" />)
        expect(screen.getByText('Entendido')).toHaveClass('btn-outline-success')
    })
})
