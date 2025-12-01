import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';

const ModalEntregaBodega = ({ show, onClose, item, onConfirm }) => {
    const [empleados, setEmpleados] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [seleccionado, setSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState('');
    const [mostrarLista, setMostrarLista] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (show) {
            api.get('/index.php/personal').then(res => {
                if (res.data.success) setEmpleados(res.data.data);
            });
            // Pre-llenar con la cantidad pendiente
            if(item) setCantidad(item.cantidad);
            setBusqueda('');
            setSeleccionado(null);
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

    const handleSelect = (emp) => {
        setSeleccionado(emp);
        setBusqueda(emp.nombre_completo);
        setMostrarLista(false);
    };

    const handleSubmit = () => {
        if (!seleccionado) return alert("Debes seleccionar quién retira.");
        if (cantidad <= 0 || cantidad > parseFloat(item.cantidad)) return alert("Cantidad inválida.");
        
        setLoading(true);
        // Llamamos a la función padre que conecta con la API
        onConfirm(item.detalle_id, cantidad, seleccionado.id)
            .finally(() => setLoading(false));
    };

    const filtrados = empleados.filter(e => 
        e.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) || 
        e.rut.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (!show || !item) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow border-0">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title fw-bold"><i className="bi bi-box-seam me-2"></i>Entregar Material</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="alert alert-light border text-center mb-4">
                            <h5 className="fw-bold mb-1">{item.insumo}</h5>
                            <small className="text-muted">{item.codigo_sku}</small>
                            <div className="mt-2 badge bg-warning text-dark">Pendiente: {item.cantidad} {item.unidad_medida}</div>
                        </div>

                        {/* Selección de Técnico */}
                        <div className="mb-3" ref={wrapperRef}>
                            <label className="form-label fw-bold small text-muted">¿QUIÉN RETIRA?</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white"><i className="bi bi-person-badge"></i></span>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Buscar por nombre o RUT..."
                                    value={busqueda}
                                    onChange={e => { setBusqueda(e.target.value); setMostrarLista(true); setSeleccionado(null); }}
                                    onFocus={() => setMostrarLista(true)}
                                />
                            </div>
                            {mostrarLista && !seleccionado && busqueda && (
                                <ul className="list-group position-absolute w-100 shadow mt-1" style={{zIndex:10, maxHeight:'150px', overflowY:'auto'}}>
                                    {filtrados.map(emp => (
                                        <li key={emp.id} className="list-group-item list-group-item-action cursor-pointer" onClick={() => handleSelect(emp)}>
                                            <div className="fw-bold">{emp.nombre_completo}</div>
                                            <small className="text-muted">{emp.rut} - {emp.area_negocio}</small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Cantidad a Entregar */}
                        <div className="mb-3">
                            <label className="form-label fw-bold small text-muted">CANTIDAD A ENTREGAR</label>
                            <input 
                                type="number" 
                                className="form-control form-control-lg text-center fw-bold" 
                                min="0.1"
                                max={item.cantidad}
                                step="0.1"
                                value={cantidad}
                                onChange={e => setCantidad(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="modal-footer justify-content-center">
                        <button className="btn btn-success w-100 py-2 fw-bold" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Procesando...' : 'CONFIRMAR ENTREGA'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalEntregaBodega;