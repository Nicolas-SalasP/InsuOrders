import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const CentroModal = ({ show, onClose, centro, areas, onSave }) => {
    const [form, setForm] = useState({ codigo: '', nombre: '', alias: '', area_negocio_id: '' });

    useEffect(() => {
        if (show) setForm(centro || { codigo: '', nombre: '', alias: '', area_negocio_id: '' });
    }, [show, centro]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/index.php/mantenedores/centro', form);
            onSave();
            onClose();
        } catch (error) { alert("Error al guardar centro"); }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title">{centro ? 'Editar Centro' : 'Nuevo Centro'}</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            <div className="row g-2 mb-3">
                                <div className="col-4">
                                    <label className="form-label small text-muted">CÓDIGO</label>
                                    <input type="text" className="form-control" required value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} />
                                </div>
                                <div className="col-8">
                                    <label className="form-label small text-muted">NOMBRE</label>
                                    <input type="text" className="form-control" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small text-muted">ALIAS (Opcional)</label>
                                <input type="text" className="form-control" value={form.alias} onChange={e => setForm({...form, alias: e.target.value})} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small text-muted">ÁREA DE NEGOCIO</label>
                                <select className="form-select" value={form.area_negocio_id} onChange={e => setForm({...form, area_negocio_id: e.target.value})}>
                                    <option value="">Sin asignar</option>
                                    {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                                </select>
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
export default CentroModal;