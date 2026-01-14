import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const UbicacionModal = ({ show, onClose, ubicacion, sectores, onSave }) => {
    const [form, setForm] = useState({ nombre: '', codigo: '', sector_id: '', descripcion: '' });

    useEffect(() => {
        if (show) setForm(ubicacion || { nombre: '', codigo: '', sector_id: '', descripcion: '' });
    }, [show, ubicacion]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/index.php/mantenedores/ubicacion', form);
            onSave(); onClose();
        } catch (error) { alert("Error al guardar"); }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title">{ubicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Sector</label>
                                <select className="form-select" required value={form.sector_id} onChange={e => setForm({...form, sector_id: e.target.value})}>
                                    <option value="">Seleccione...</option>
                                    {sectores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                </select>
                            </div>
                            <div className="row g-2">
                                <div className="col-8">
                                    <label className="form-label">Nombre</label>
                                    <input type="text" className="form-control" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                                </div>
                                <div className="col-4">
                                    <label className="form-label">Código</label>
                                    <input type="text" className="form-control" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} />
                                </div>
                            </div>
                            <div className="mt-3">
                                <label className="form-label">Descripción</label>
                                <textarea className="form-control" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})}></textarea>
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
export default UbicacionModal;