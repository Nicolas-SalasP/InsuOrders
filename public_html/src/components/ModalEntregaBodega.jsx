import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';

const ModalEntregaBodega = ({ show, onClose, onConfirm, item }) => {
    const [cantidad, setCantidad] = useState('');
    const [personal, setPersonal] = useState([]);
    const [personalId, setPersonalId] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [mostrarLista, setMostrarLista] = useState(false);
    const [nombreSeleccionado, setNombreSeleccionado] = useState('');
    const wrapperRef = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && item) {
            setCantidad(item.cantidad_pendiente || '');
            setPersonalId('');
            setNombreSeleccionado('');
            setBusqueda('');
            setLoading(false);
            
            api.get('/index.php/personal')
                .then(res => {
                    if (res.data.success) setPersonal(res.data.data);
                })
                .catch(e => console.error(e));
        }
    }, [show, item]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setMostrarLista(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!cantidad || cantidad <= 0) return alert("Ingrese cantidad válida");
        if (parseFloat(cantidad) > parseFloat(item.cantidad_pendiente)) return alert("Excede lo pendiente");
        if (!personalId) return alert("Indique quién retira");

        setLoading(true);
        
        // Llamar a la función del padre
        if(onConfirm) {
            onConfirm(item.detalle_id, cantidad, personalId);
        }
    };

    if (!show || !item) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-warning text-dark">
                        <h5 className="modal-title fw-bold">📦 Entregar Material</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            
                            <div className="alert alert-light border mb-3">
                                <div className="fw-bold">{item.insumo}</div>
                                <div className="small text-muted">{item.codigo_sku}</div>
                                <div className="d-flex justify-content-between mt-2">
                                    <span className="badge bg-secondary">Pendiente: {parseFloat(item.cantidad_pendiente)}</span>
                                    <span className="badge bg-dark">Stock Bodega: {parseFloat(item.stock_actual)}</span>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Cantidad a Entregar</label>
                                <input type="number" className="form-control form-control-lg text-center fw-bold" 
                                    min="0.01" step="0.01" 
                                    value={cantidad} onChange={e => setCantidad(e.target.value)} autoFocus />
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
                                            <input type="text" className="form-control" placeholder="Buscar empleado..."
                                                value={busqueda} 
                                                onChange={e => { setBusqueda(e.target.value); setMostrarLista(true); }}
                                                onFocus={() => setMostrarLista(true)} 
                                            />
                                        </div>
                                        
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

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-warning fw-bold px-4" disabled={loading}>
                                {loading ? 'Procesando...' : 'Confirmar Entrega'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalEntregaBodega;