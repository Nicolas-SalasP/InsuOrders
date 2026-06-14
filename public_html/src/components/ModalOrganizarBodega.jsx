import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';

const ModalOrganizarBodega = ({ show, onClose, insumo, onSave }) => {
    const [sectores, setSectores] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [sectorId, setSectorId] = useState('');
    const [ubicacionId, setUbicacionId] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [ubicacionesFiltradas, setUbicacionesFiltradas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        if (show) {
            api.get('/index.php/insumos/auxiliares').then(res => {
                if (res.data.success) { setSectores(res.data.data.sectores || []); setUbicaciones(res.data.data.ubicaciones || []); }
            }).catch(err => console.error(err));
            if (insumo) setCantidad(insumo.por_organizar);
            setSectorId(''); setUbicacionId('');
        }
    }, [show, insumo]);

    useEffect(() => {
        if (sectorId) { setUbicacionesFiltradas(ubicaciones.filter(u => u.sector_id == sectorId)); setUbicacionId(''); }
        else setUbicacionesFiltradas([]);
    }, [sectorId, ubicaciones]);

    const handleSubmit = async () => {
        if (!ubicacionId || !cantidad || parseFloat(cantidad) <= 0) return setMsgModal({ show: true, title: "Error", message: "Selecciona ubicación y cantidad válida.", type: "warning" });
        if (parseFloat(cantidad) > parseFloat(insumo.por_organizar)) return setMsgModal({ show: true, title: "Error", message: "No puedes organizar más de lo que hay en recepción.", type: "warning" });

        setLoading(true);
        try {
            await api.post('/index.php/bodega/organizar', { insumo_id: insumo.id, ubicacion_id: ubicacionId, cantidad: cantidad });
            onSave(); onClose();
        } catch (error) {
            setMsgModal({ show: true, title: "Error", message: error.response?.data?.message || "Error al guardar", type: "error" });
        } finally { setLoading(false); }
    };

    if (!show || !insumo) return null;

    return (
        <>
            <MessageModal show={msgModal.show} onClose={() => setMsgModal({ ...msgModal, show: false })} title={msgModal.title} message={msgModal.message} type={msgModal.type} />
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content shadow border-0">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title fw-bold">📍 Organizar en Estantería</h5>
                            <button className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="alert alert-warning d-flex align-items-center mb-4">
                                <i className="bi bi-box-seam fs-3 me-3"></i>
                                <div><h6 className="mb-0 fw-bold">{insumo.nombre}</h6><small>Pendiente: <strong>{insumo.por_organizar} {insumo.unidad_medida}</strong></small></div>
                            </div>
                            <div className="mb-3"><label className="form-label fw-bold small text-muted">1. Sector / Pasillo</label><select className="form-select" value={sectorId} onChange={e => setSectorId(e.target.value)}><option value="">Seleccione Sector...</option>{sectores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></div>
                            <div className="mb-3"><label className="form-label fw-bold small text-muted">2. Ubicación Exacta</label><select className="form-select" value={ubicacionId} onChange={e => setUbicacionId(e.target.value)} disabled={!sectorId}><option value="">Seleccione Ubicación...</option>{ubicacionesFiltradas.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}</select></div>
                            <div className="mb-3"><label className="form-label fw-bold small text-muted">3. Cantidad a Guardar</label><input type="number" className="form-control form-control-lg text-center fw-bold" value={cantidad} onChange={e => setCantidad(e.target.value)} min="0.1" /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button className="btn btn-primary px-4 fw-bold" onClick={handleSubmit} disabled={loading}><i className="bi bi-save me-2"></i>Confirmar Ubicación</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModalOrganizarBodega;