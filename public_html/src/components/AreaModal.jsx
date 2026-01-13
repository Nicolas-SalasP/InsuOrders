import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AreaModal = ({ show, onClose, area, onSave }) => {
    const [form, setForm] = useState({ codigo: '', nombre: '' });

    useEffect(() => {
        if (show) setForm(area || { codigo: '', nombre: '' });
    }, [show, area]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/index.php/mantenedores/area', form);
            onSave();
            onClose();
        } catch (error) { alert("Error al guardar área"); }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title">{area ? 'Editar Área' : 'Nueva Área'}</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            <div className="mb-3">
                                <label className="form-label small text-muted">CÓDIGO</label>
                                <input type="text" className="form-control" required value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small text-muted">NOMBRE</label>
                                <input type="text" className="form-control" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default AreaModal;