import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ChecklistRenderer from '../../components/ChecklistRenderer'

const plantillaBase = {
    titulo: 'Checklist Preventivo Motor',
    codigo_doc: 'CHK-001',
    secciones: [
        {
            key: 'sec_1',
            titulo: 'Inspección Visual',
            tipo: 'checklist_si_no',
            items: [
                { key: 'item_1', label: 'Revisar correas' },
                { key: 'item_2', label: 'Verificar aceite' },
            ]
        }
    ]
}

const plantillaEstado = {
    titulo: 'Checklist Estado',
    codigo_doc: 'CHK-002',
    secciones: [
        {
            key: 'sec_estado',
            titulo: 'Estado de Componentes',
            tipo: 'estado_observacion',
            items: [{ key: 'comp_1', label: 'Rodamiento Principal' }]
        }
    ]
}

const plantillaRepuestos = {
    titulo: 'Checklist Repuestos',
    codigo_doc: 'CHK-003',
    secciones: [
        {
            key: 'sec_rep',
            titulo: 'Repuestos Requeridos',
            tipo: 'repuestos_validacion',
            items: [{ key: 'rep_1', label: 'Filtro de aceite', sku: 'FIL-001', cant: 2 }]
        }
    ]
}

describe('ChecklistRenderer — sin plantilla', () => {
    it('muestra mensaje si plantilla es null', () => {
        render(<ChecklistRenderer plantilla={null} respuestasIniciales={{}} onChange={vi.fn()} />)
        expect(screen.getByText(/No hay planilla/i)).toBeInTheDocument()
    })

    it('muestra mensaje si plantilla no tiene secciones', () => {
        render(<ChecklistRenderer plantilla={{}} respuestasIniciales={{}} onChange={vi.fn()} />)
        expect(screen.getByText(/No hay planilla/i)).toBeInTheDocument()
    })
})

describe('ChecklistRenderer — renderizado', () => {
    it('muestra el título de la plantilla', () => {
        render(<ChecklistRenderer plantilla={plantillaBase} respuestasIniciales={{}} onChange={vi.fn()} />)
        expect(screen.getByText('Checklist Preventivo Motor')).toBeInTheDocument()
    })

    it('muestra el código de documento', () => {
        render(<ChecklistRenderer plantilla={plantillaBase} respuestasIniciales={{}} onChange={vi.fn()} />)
        expect(screen.getByText('CHK-001')).toBeInTheDocument()
    })

    it('muestra el título de cada sección', () => {
        render(<ChecklistRenderer plantilla={plantillaBase} respuestasIniciales={{}} onChange={vi.fn()} />)
        expect(screen.getByText('Inspección Visual')).toBeInTheDocument()
    })

    it('muestra el label de cada ítem', () => {
        render(<ChecklistRenderer plantilla={plantillaBase} respuestasIniciales={{}} onChange={vi.fn()} />)
        expect(screen.getByText('Revisar correas')).toBeInTheDocument()
        expect(screen.getByText('Verificar aceite')).toBeInTheDocument()
    })

    it('renderiza botones Si/No para tipo checklist_si_no', () => {
        render(<ChecklistRenderer plantilla={plantillaBase} respuestasIniciales={{}} onChange={vi.fn()} />)
        const botonesNo = screen.getAllByText('No')
        const botonesSi = screen.getAllByText('Si')
        expect(botonesSi.length).toBe(2)
        expect(botonesNo.length).toBe(2)
    })

    it('renderiza select para tipo estado_observacion', () => {
        render(<ChecklistRenderer plantilla={plantillaEstado} respuestasIniciales={{}} onChange={vi.fn()} />)
        expect(screen.getByText('-- Estado --')).toBeInTheDocument()
    })

    it('renderiza input numérico para tipo repuestos_validacion', () => {
        render(<ChecklistRenderer plantilla={plantillaRepuestos} respuestasIniciales={{}} onChange={vi.fn()} />)
        const input = screen.getByPlaceholderText('2')
        expect(input).toBeInTheDocument()
        expect(input).toHaveAttribute('type', 'number')
    })

    it('muestra el SKU del repuesto', () => {
        render(<ChecklistRenderer plantilla={plantillaRepuestos} respuestasIniciales={{}} onChange={vi.fn()} />)
        expect(screen.getByText('FIL-001')).toBeInTheDocument()
    })
})

describe('ChecklistRenderer — interacción', () => {
    it('llama onChange al hacer click en Si', () => {
        const onChange = vi.fn()
        render(<ChecklistRenderer plantilla={plantillaBase} respuestasIniciales={{}} onChange={onChange} />)
        fireEvent.click(screen.getAllByText('Si')[0])
        expect(onChange).toHaveBeenCalledOnce()
        const llamada = onChange.mock.calls[0][0]
        expect(llamada.some(r => r.valor === 'si')).toBe(true)
    })

    it('llama onChange al hacer click en No', () => {
        const onChange = vi.fn()
        render(<ChecklistRenderer plantilla={plantillaBase} respuestasIniciales={{}} onChange={onChange} />)
        fireEvent.click(screen.getAllByText('No')[0])
        expect(onChange).toHaveBeenCalledOnce()
        const llamada = onChange.mock.calls[0][0]
        expect(llamada.some(r => r.valor === 'no')).toBe(true)
    })

    it('llama onChange al cambiar observación', () => {
        const onChange = vi.fn()
        render(<ChecklistRenderer plantilla={plantillaBase} respuestasIniciales={{}} onChange={onChange} />)
        const inputs = screen.getAllByPlaceholderText('Observaciones...')
        fireEvent.change(inputs[0], { target: { value: 'Requiere cambio' } })
        expect(onChange).toHaveBeenCalledOnce()
    })

    it('en readOnly no llama onChange al hacer click', () => {
        const onChange = vi.fn()
        render(<ChecklistRenderer plantilla={plantillaBase} respuestasIniciales={{}} onChange={onChange} readOnly={true} />)
        fireEvent.click(screen.getAllByText('Si')[0])
        expect(onChange).not.toHaveBeenCalled()
    })

    it('en readOnly los botones están deshabilitados', () => {
        render(<ChecklistRenderer plantilla={plantillaBase} respuestasIniciales={{}} onChange={vi.fn()} readOnly={true} />)
        screen.getAllByText('Si').forEach(btn => expect(btn).toBeDisabled())
        screen.getAllByText('No').forEach(btn => expect(btn).toBeDisabled())
    })

    it('pre-carga respuestas iniciales', () => {
        const respuestasIniciales = {
            item_1: { seccion: 'sec_1', key: 'item_1', valor: 'si' }
        }
        render(<ChecklistRenderer plantilla={plantillaBase} respuestasIniciales={respuestasIniciales} onChange={vi.fn()} />)
        const botonesSi = screen.getAllByText('Si')
        expect(botonesSi[0]).toHaveClass('btn-success')
    })
})
