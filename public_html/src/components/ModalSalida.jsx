import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';

const ModalSalida = ({ show, onClose, onSave, insumo }) => {
    const [cantidad, setCantidad] = useState('');
    const [personal, setPersonal] = useState([]);
    const [personalId, setPersonalId] = useState('');
    const [observacion, setObservacion] = useState('');
    
    // Estados para el buscador de personal
    const [busqueda, setBusqueda] = useState('');
    const [mostrarLista, setMostrarLista] = useState(false);
    const wrapperRef = useRef(null);
    const [nombreSeleccionado, setNombreSeleccionado] = useState('');

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (show) {
            setCantidad('');
            setPersonalId('');
            setNombreSeleccionado('');
            setObservacion('');
            setBusqueda('');
            setSaving(false);
            
            // Cargar empleados
            api.get('/index.php/personal')
                .then(res => {
                    if(res.data.success) setPersonal(res.data.data);
                })
                .catch(e => console.error(e));
        }
    }, [show]);

    // Cerrar lista al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setMostrarLista(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // --- FILTRO BLINDADO ---
    // Si busqueda está vacío, .includes('') devuelve true para todos, así que muestra la lista completa.
    const personalFiltrado = personal.filter(p => {
        const term = busqueda.toLowerCase();
        const nombre = (p.nombre || '').toLowerCase();
        const rut = (p.rut || '').toLowerCase();
        return nombre.includes(term) || rut.includes(term);
    });

    const handleSeleccionarPersonal = (p) => {
        setPersonalId(p.id);
        setNombreSeleccionado(p.nombre);
        setMostrarLista(false);
        setBusqueda('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!cantidad || cantidad <= 0) return alert("Ingrese una cantidad válida");
        if (parseFloat(cantidad) > parseFloat(insumo.stock_actual)) return alert("No hay suficiente stock");
        if (!personalId) return alert("Debe seleccionar quién retira");

        setSaving(true);
        try {
            await api.post('/index.php/inventario/ajuste', {
                insumo_id: insumo.id,
                cantidad: cantidad,
                tipo_movimiento_id: 2, // 2 = Salida / Consumo
                empleado_id: personalId,
                observacion: observacion || 'Salida Manual'
            });
            onSave();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Error al registrar salida");
        } finally {
            setSaving(false);
        }
    };

    if (!show || !insumo) return null;

    return (
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
                                <div>
                                    <div className="fw-bold">{insumo.nombre}</div>
                                    <div className="small text-muted">SKU: {insumo.codigo_sku} | Stock Actual: {insumo.stock_actual}</div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Cantidad a Retirar</label>
                                <input type="number" className="form-control form-control-lg text-center fw-bold" 
                                    min="1" step="1" 
                                    value={cantidad} onChange={e => setCantidad(e.target.value)} required />
                            </div>

                            <div className="mb-3 position-relative" ref={wrapperRef}>
                                <label className="form-label fw-bold">
                                    <i className="bi bi-person-vcard me-2 fs-5 align-middle"></i>Retirado Por
                                </label>
                                
                                {nombreSeleccionado ? (
                                    <div className="input-group">
                                        <span className="input-group-text bg-white text-success"><i className="bi bi-check-circle-fill"></i></span>
                                        <input type="text" className="form-control bg-white text-dark fw-bold" value={nombreSeleccionado} readOnly />
                                        <button className="btn btn-outline-secondary" type="button" onClick={() => { setPersonalId(''); setNombreSeleccionado(''); setMostrarLista(true); }}>
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                                            <input type="text" className="form-control" placeholder="Buscar empleado (Nombre o RUT)..."
                                                value={busqueda} 
                                                onChange={e => { setBusqueda(e.target.value); setMostrarLista(true); }}
                                                onFocus={() => setMostrarLista(true)} // Al hacer click, muestra todo
                                                onClick={() => setMostrarLista(true)} // Refuerzo para click
                                            />
                                        </div>
                                        
                                        {/* MODIFICADO: Eliminé el check "&& busqueda" para que muestre la lista siempre que esté en foco */}
                                        {mostrarLista && (
                                            <ul className="list-group position-absolute w-100 shadow mt-1 bg-white" style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}>
                                                {personalFiltrado.map(p => (
                                                    <li key={p.id} className="list-group-item list-group-item-action cursor-pointer" 
                                                        onClick={() => handleSeleccionarPersonal(p)}>
                                                        <div className="fw-bold">{p.nombre}</div>
                                                        <small className="text-muted">{p.rut}</small>
                                                    </li>
                                                ))}
                                                {personalFiltrado.length === 0 && (
                                                    <li className="list-group-item text-muted small">No se encontraron resultados</li>
                                                )}
                                            </ul>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Observación (Opcional)</label>
                                <textarea className="form-control" rows="2" value={observacion} onChange={e => setObservacion(e.target.value)}></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-danger px-4" disabled={saving}>
                                {saving ? 'Registrando...' : 'Confirmar Salida'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalSalida;