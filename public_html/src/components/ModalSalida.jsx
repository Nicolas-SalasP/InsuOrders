import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';

const ModalSalida = ({ show, onClose, onSave, insumo }) => {
    const [cantidad, setCantidad] = useState('');
    const [personal, setPersonal] = useState([]);
    const [personalId, setPersonalId] = useState('');
    const [observacion, setObservacion] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [mostrarLista, setMostrarLista] = useState(false);
    const wrapperRef = useRef(null);
    const [nombreSeleccionado, setNombreSeleccionado] = useState('');
    const [saving, setSaving] = useState(false);
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        if (show) {
            setCantidad(''); setPersonalId(''); setNombreSeleccionado(''); setObservacion(''); setBusqueda(''); setSaving(false);
            api.get('/index.php/personal').then(res => { if(res.data.success) setPersonal(res.data.data); }).catch(e => console.error(e));
        }
    }, [show]);

    useEffect(() => {
        const handleClickOutside = (event) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setMostrarLista(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const personalFiltrado = personal.filter(p => (p.nombre||'').toLowerCase().includes(busqueda.toLowerCase()) || (p.rut||'').toLowerCase().includes(busqueda.toLowerCase()));

    const handleSeleccionarPersonal = (p) => { setPersonalId(p.id); setNombreSeleccionado(p.nombre); setMostrarLista(false); setBusqueda(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cantidad || cantidad <= 0) return setMsgModal({ show: true, title: "Error", message: "Ingrese una cantidad válida", type: "warning" });
        if (parseFloat(cantidad) > parseFloat(insumo.stock_actual)) return setMsgModal({ show: true, title: "Error", message: "No hay suficiente stock", type: "warning" });
        if (!personalId) return setMsgModal({ show: true, title: "Error", message: "Debe seleccionar quién retira", type: "warning" });

        setSaving(true);
        try {
            await api.post('/index.php/inventario/ajuste', {
                insumo_id: insumo.id, cantidad: cantidad, tipo_movimiento_id: 2, empleado_id: personalId, observacion: observacion || 'Salida Manual'
            });
            onSave(); onClose();
        } catch (error) {
            setMsgModal({ show: true, title: "Error", message: error.response?.data?.message || "Error al registrar salida", type: "error" });
        } finally { setSaving(false); }
    };

    if (!show || !insumo) return null;

    return (
        <>
            <MessageModal show={msgModal.show} onClose={() => setMsgModal({...msgModal, show: false})} title={msgModal.title} message={msgModal.message} type={msgModal.type} />
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title">📉 Registrar Salida / Consumo</h5>
                            <button className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="alert alert-light border d-flex align-items-center mb-3">
                                    <i className="bi bi-box-seam fs-3 me-3 text-secondary"></i>
                                    <div><div className="fw-bold">{insumo.nombre}</div><div className="small text-muted">SKU: {insumo.codigo_sku} | Stock Actual: {insumo.stock_actual}</div></div>
                                </div>
                                <div className="mb-3"><label className="form-label fw-bold">Cantidad a Retirar</label><input type="number" className="form-control form-control-lg text-center fw-bold" min="1" step="1" value={cantidad} onChange={e => setCantidad(e.target.value)} required /></div>
                                <div className="mb-3 position-relative" ref={wrapperRef}>
                                    <label className="form-label fw-bold">Retirado Por</label>
                                    {nombreSeleccionado ? (
                                        <div className="input-group"><span className="input-group-text bg-white text-success"><i className="bi bi-check-circle-fill"></i></span><input type="text" className="form-control bg-white text-dark fw-bold" value={nombreSeleccionado} readOnly /><button className="btn btn-outline-secondary" type="button" onClick={() => { setPersonalId(''); setNombreSeleccionado(''); setMostrarLista(true); }}><i className="bi bi-x-lg"></i></button></div>
                                    ) : (
                                        <>
                                            <div className="input-group"><span className="input-group-text bg-white"><i className="bi bi-search"></i></span><input type="text" className="form-control" placeholder="Buscar empleado..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setMostrarLista(true); }} onFocus={() => setMostrarLista(true)} /></div>
                                            {mostrarLista && <ul className="list-group position-absolute w-100 shadow mt-1 bg-white" style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}>{personalFiltrado.map(p => <li key={p.id} className="list-group-item list-group-item-action cursor-pointer" onClick={() => handleSeleccionarPersonal(p)}><div className="fw-bold">{p.nombre}</div><small className="text-muted">{p.rut}</small></li>)}</ul>}
                                        </>
                                    )}
                                </div>
                                <div className="mb-3"><label className="form-label fw-bold">Observación</label><textarea className="form-control" rows="2" value={observacion} onChange={e => setObservacion(e.target.value)}></textarea></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-danger px-4" disabled={saving}>{saving ? 'Registrando...' : 'Confirmar Salida'}</button></div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModalSalida;