import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';

const ModalSalida = ({ show, onClose, onSave, insumo }) => {
    const [cantidad, setCantidad] = useState('');
    const [personal, setPersonal] = useState([]);
    const [personalId, setPersonalId] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [mostrarLista, setMostrarLista] = useState(false);
    const [nombreSeleccionado, setNombreSeleccionado] = useState('');
    const [ubicaciones, setUbicaciones] = useState([]);
    const [ubicacionId, setUbicacionId] = useState('');
    const [observacion, setObservacion] = useState('');
    const wrapperRef = useRef(null);
    const [saving, setSaving] = useState(false);
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        if (show) {
            setCantidad('');
            setPersonalId('');
            setNombreSeleccionado('');
            setObservacion('');
            setBusqueda('');
            setUbicacionId(''); 
            setSaving(false);

            Promise.all([
                api.get('/index.php/personal'),
                api.get('/index.php/mantenedores/ubicaciones-envio?type=activas')
            ])
            .then(([resPersonal, resUbicaciones]) => {
                if (resPersonal.data.success) setPersonal(resPersonal.data.data);
                if (resUbicaciones.data.success) setUbicaciones(resUbicaciones.data.data);
            })
            .catch(e => console.error("Error cargando datos:", e));
        }
    }, [show]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setMostrarLista(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const personalFiltrado = personal.filter(p => 
        (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) || 
        (p.rut || '').toLowerCase().includes(busqueda.toLowerCase())
    );

    const handleSeleccionarPersonal = (p) => {
        setPersonalId(p.id);
        setNombreSeleccionado(p.nombre);
        setMostrarLista(false);
        setBusqueda('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cantidad || cantidad <= 0) return setMsgModal({ show: true, title: "Error", message: "Ingrese una cantidad válida", type: "warning" });
        if (parseFloat(cantidad) > parseFloat(insumo.stock_actual)) return setMsgModal({ show: true, title: "Error", message: "No hay suficiente stock", type: "warning" });
        if (!personalId) return setMsgModal({ show: true, title: "Error", message: "Debe seleccionar quién retira", type: "warning" });
        if (!ubicacionId) return setMsgModal({ show: true, title: "Error", message: "Debe seleccionar la ubicación de destino (Planta, Obra, etc.)", type: "warning" });

        setSaving(true);
        try {
            await api.post('/index.php/inventario/ajuste', {
                insumo_id: insumo.id,
                cantidad: cantidad,
                tipo_movimiento_id: 2,
                empleado_id: personalId,
                ubicacion_envio_id: ubicacionId,
                observacion: observacion || 'Salida Manual'
            });
            onSave();
            onClose();
        } catch (error) {
            setMsgModal({ show: true, title: "Error", message: error.response?.data?.message || "Error al registrar salida", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (!show || !insumo) return null;

    return (
        <>
            <MessageModal show={msgModal.show} onClose={() => setMsgModal({...msgModal, show: false})} title={msgModal.title} message={msgModal.message} type={msgModal.type} />
            
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content shadow border-0">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title fw-bold"><i className="bi bi-box-arrow-right me-2"></i>Registrar Salida / Consumo</h5>
                            <button className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body p-4">
                                
                                {/* Info Insumo */}
                                <div className="alert alert-light border d-flex align-items-center mb-4">
                                    <div className="bg-white p-2 rounded shadow-sm me-3 border">
                                        <i className="bi bi-box-seam fs-3 text-danger"></i>
                                    </div>
                                    <div>
                                        <div className="fw-bold text-dark">{insumo.nombre}</div>
                                        <div className="small text-muted">
                                            SKU: <span className="fw-bold text-dark">{insumo.codigo_sku}</span> | 
                                            Stock Actual: <span className="badge bg-success ms-1">{insumo.stock_actual}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Campo Cantidad */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-secondary small text-uppercase">Cantidad a Retirar</label>
                                    <input 
                                        type="number" 
                                        className="form-control form-control-lg fw-bold text-center text-primary" 
                                        min="1" 
                                        step="1" 
                                        value={cantidad} 
                                        onChange={e => setCantidad(e.target.value)} 
                                        required 
                                        autoFocus
                                    />
                                </div>

                                {/* Campo Personal (Autocomplete) */}
                                <div className="mb-3 position-relative" ref={wrapperRef}>
                                    <label className="form-label fw-bold text-secondary small text-uppercase">Retirado Por</label>
                                    {nombreSeleccionado ? (
                                        <div className="input-group">
                                            <span className="input-group-text bg-success text-white border-success"><i className="bi bi-person-check-fill"></i></span>
                                            <input type="text" className="form-control fw-bold border-success text-success" value={nombreSeleccionado} readOnly />
                                            <button className="btn btn-outline-danger" type="button" onClick={() => { setPersonalId(''); setNombreSeleccionado(''); setMostrarLista(true); }}>
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    placeholder="Buscar empleado por nombre o RUT..." 
                                                    value={busqueda} 
                                                    onChange={e => { setBusqueda(e.target.value); setMostrarLista(true); }} 
                                                    onFocus={() => setMostrarLista(true)} 
                                                />
                                            </div>
                                            {mostrarLista && (
                                                <ul className="list-group position-absolute w-100 shadow mt-1 bg-white border" style={{ zIndex: 1060, maxHeight: '200px', overflowY: 'auto' }}>
                                                    {personalFiltrado.length > 0 ? (
                                                        personalFiltrado.map(p => (
                                                            <li key={p.id} className="list-group-item list-group-item-action cursor-pointer" onClick={() => handleSeleccionarPersonal(p)}>
                                                                <div className="fw-bold text-dark">{p.nombre}</div>
                                                                <small className="text-muted">{p.rut}</small>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="list-group-item text-muted small text-center">No se encontraron empleados</li>
                                                    )}
                                                </ul>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* NUEVO CAMPO: Ubicación de Destino */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-secondary small text-uppercase">Destino / Ubicación <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light"><i className="bi bi-geo-alt-fill text-secondary"></i></span>
                                        <select 
                                            className="form-select fw-500" 
                                            value={ubicacionId} 
                                            onChange={e => setUbicacionId(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Seleccione Destino --</option>
                                            {ubicaciones.map(u => (
                                                <option key={u.id} value={u.id}>{u.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {ubicaciones.length === 0 && <div className="form-text text-warning small"><i className="bi bi-exclamation-triangle"></i> No hay ubicaciones configuradas. Avise al administrador.</div>}
                                </div>

                                {/* Campo Observación */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-secondary small text-uppercase">Observación (Opcional)</label>
                                    <textarea 
                                        className="form-control" 
                                        rows="2" 
                                        value={observacion} 
                                        onChange={e => setObservacion(e.target.value)}
                                        placeholder="Ej: Para trabajo urgente en máquina X..."
                                    ></textarea>
                                </div>

                            </div>
                            
                            <div className="modal-footer border-top-0 pt-0 pb-4 px-4">
                                <button type="button" className="btn btn-light text-muted fw-bold" onClick={onClose}>Cancelar</button>
                                <button type="submit" className="btn btn-danger px-4 fw-bold shadow-sm" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Registrando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg me-2"></i>Confirmar Salida
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModalSalida;