import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const TipoTrabajoModal = ({ show, onClose, onSave, data }) => {
    const [formData, setFormData] = useState({ id: '', nombre: '', descripcion: '', activo: 1 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            if (data) {
                setFormData({ ...data });
            } else {
                setFormData({ id: '', nombre: '', descripcion: '', activo: 1 });
            }
            setError('');
        }
    }, [show, data]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre.trim()) {
            setError('El nombre del tipo de trabajo es obligatorio.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            if (formData.id) {
                await api.put('/index.php/mantenedores/tipos-trabajo', formData);
            } else {
                await api.post('/index.php/mantenedores/tipos-trabajo', formData);
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar el tipo de trabajo.');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">{formData.id ? 'Editar Tipo de Trabajo' : 'Nuevo Tipo de Trabajo'}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={loading}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4 bg-light">
                            {error && <div className="alert alert-danger py-2">{error}</div>}

                            <div className="mb-3">
                                <label className="form-label fw-bold text-secondary">Nombre *</label>
                                <input
                                    type="text"
                                    className="form-control shadow-sm"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej: Eléctrico, Mecánico, Soldadura..."
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold text-secondary">Descripción (Opcional)</label>
                                <textarea
                                    className="form-control shadow-sm"
                                    rows="3"
                                    value={formData.descripcion || ''}
                                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                    placeholder="Breve descripción de este tipo de trabajo..."
                                ></textarea>
                            </div>

                            {formData.id && (
                                <div className="form-check form-switch mt-4">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="activoSwitchTrabajo"
                                        checked={formData.activo == 1}
                                        onChange={e => setFormData({ ...formData, activo: e.target.checked ? 1 : 0 })}
                                    />
                                    <label className="form-check-label fw-bold" htmlFor="activoSwitchTrabajo">
                                        Activo (Visible al crear OT)
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer bg-white">
                            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose} disabled={loading}>Cancelar</button>
                            <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TipoTrabajoModal;
