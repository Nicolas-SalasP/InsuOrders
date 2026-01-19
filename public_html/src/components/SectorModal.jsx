import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const SectorModal = ({ show, onClose, sector, onSave }) => {
    const [form, setForm] = useState({ nombre: '', codigo: '' });

    useEffect(() => {
        if (show) setForm(sector || { nombre: '', codigo: '' });
    }, [show, sector]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/index.php/mantenedores/sectores', form);
            onSave(); onClose();
        } catch (error) { alert("Error al guardar"); }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title">{sector ? 'Editar Sector' : 'Nuevo Sector'}</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Nombre</label>
                                <input type="text" className="form-control" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Código</label>
                                <input type="text" className="form-control" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} />
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
export default SectorModal;