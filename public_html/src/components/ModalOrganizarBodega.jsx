import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const ModalOrganizarBodega = ({ show, onClose, insumo, onSave }) => {
    const [sectores, setSectores] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [sectorId, setSectorId] = useState('');
    const [ubicacionId, setUbicacionId] = useState('');
    const [cantidad, setCantidad] = useState('');
    
    const [ubicacionesFiltradas, setUbicacionesFiltradas] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            api.get('/index.php/inventario/auxiliares').then(res => {
                if (res.data.success) {
                    setSectores(res.data.data.sectores);
                    setUbicaciones(res.data.data.ubicaciones);
                }
            });
            
            if (insumo) {
                setCantidad(insumo.por_organizar); 
            }
            
            setSectorId('');
            setUbicacionId('');
        }
    }, [show, insumo]);

    useEffect(() => {
        if (sectorId) {
            setUbicacionesFiltradas(ubicaciones.filter(u => u.sector_id == sectorId));
        } else {
            setUbicacionesFiltradas([]);
        }
    }, [sectorId, ubicaciones]);

    const handleSubmit = async () => {
        if (!ubicacionId || !cantidad || parseFloat(cantidad) <= 0) {
            return alert("Selecciona ubicación y cantidad válida.");
        }
        if (parseFloat(cantidad) > parseFloat(insumo.por_organizar)) {
            return alert("No puedes organizar más de lo que hay en recepción.");
        }

        setLoading(true);
        try {
            await api.post('/index.php/bodega/organizar', {
                insumo_id: insumo.id,
                ubicacion_id: ubicacionId,
                cantidad: cantidad
            });
            onSave();
            onClose();
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Error al guardar"));
        } finally {
            setLoading(false);
        }
    };

    if (!show || !insumo) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog">
                <div className="modal-content shadow border-0">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title fw-bold">📍 Organizar en Estantería</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="alert alert-warning d-flex align-items-center mb-4">
                            <i className="bi bi-box-seam fs-3 me-3"></i>
                            <div>
                                <h6 className="mb-0 fw-bold">{insumo.nombre}</h6>
                                <small>Pendiente de ubicar: <strong>{insumo.por_organizar} {insumo.unidad_medida}</strong></small>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold small text-muted">1. Sector / Pasillo</label>
                            <select className="form-select" value={sectorId} onChange={e => setSectorId(e.target.value)}>
                                <option value="">Seleccione Sector...</option>
                                {sectores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold small text-muted">2. Ubicación Exacta</label>
                            <select className="form-select" value={ubicacionId} onChange={e => setUbicacionId(e.target.value)} disabled={!sectorId}>
                                <option value="">Seleccione Ubicación...</option>
                                {ubicacionesFiltradas.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold small text-muted">3. Cantidad a Guardar</label>
                            <input type="number" className="form-control form-control-lg text-center fw-bold" 
                                value={cantidad} onChange={e => setCantidad(e.target.value)} min="0.1" />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button className="btn btn-primary px-4 fw-bold" onClick={handleSubmit} disabled={loading}>
                            <i className="bi bi-save me-2"></i>Confirmar Ubicación
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalOrganizarBodega;