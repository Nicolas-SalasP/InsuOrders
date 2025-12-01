import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';

const ModalSalida = ({ show, onClose, insumo, onSave }) => {
    const [cantidad, setCantidad] = useState('');
    const [observacion, setObservacion] = useState('');
    const [loading, setLoading] = useState(false);

    // Buscador Personal
    const [empleados, setEmpleados] = useState([]);
    const [busquedaEmp, setBusquedaEmp] = useState('');
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [mostrarLista, setMostrarLista] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (show) {
            api.get('/index.php/personal').then(res => {
                if (res.data.success) setEmpleados(res.data.data);
            });
            setCantidad(''); setObservacion(''); 
            setEmpleadoSeleccionado(null); setBusquedaEmp('');
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

    const empleadosFiltrados = empleados.filter(e => 
        e.nombre_completo.toLowerCase().includes(busquedaEmp.toLowerCase()) ||
        e.rut.toLowerCase().includes(busquedaEmp.toLowerCase())
    );

    const seleccionarEmpleado = (emp) => {
        setEmpleadoSeleccionado(emp);
        setBusquedaEmp(emp.nombre_completo);
        setMostrarLista(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!empleadoSeleccionado) return alert("⚠️ Debes indicar quién retira.");

        setLoading(true);
        try {
            await api.post('/index.php/inventario/ajuste', {
                insumo_id: insumo.id,
                cantidad: cantidad,
                tipo_movimiento_id: 4, // 4 = Salida
                observacion: observacion,
                empleado_id: empleadoSeleccionado.id
            });
            onSave(); onClose();
        } catch (error) {
            alert("Error: " + error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    if (!show || !insumo) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow border-0">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title fw-bold">
                            <i className="bi bi-box-arrow-up me-2"></i>Salida / Ajuste (-)
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            <div className="text-center mb-4">
                                <h5 className="fw-bold text-dark">{insumo.nombre}</h5>
                                <span className="badge bg-light text-dark border">Actual: {insumo.stock_actual}</span>
                            </div>

                            {/* Buscador Personal */}
                            <div className="mb-3" ref={wrapperRef}>
                                <label className="form-label fw-bold text-danger small">RESPONSABLE (QUIÉN RETIRA)</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><i className="bi bi-person"></i></span>
                                    <input type="text" className="form-control" placeholder="Buscar por nombre o RUT..."
                                        value={busquedaEmp}
                                        onChange={e => { setBusquedaEmp(e.target.value); setMostrarLista(true); setEmpleadoSeleccionado(null); }}
                                        onFocus={() => setMostrarLista(true)}
                                    />
                                </div>
                                {mostrarLista && !empleadoSeleccionado && busquedaEmp && (
                                    <ul className="list-group position-absolute w-100 shadow mt-1" style={{zIndex:10, maxHeight:'150px', overflowY:'auto'}}>
                                        {empleadosFiltrados.map(emp => (
                                            <li key={emp.id} className="list-group-item list-group-item-action cursor-pointer" onClick={() => seleccionarEmpleado(emp)}>
                                                <div className="fw-bold">{emp.nombre_completo}</div>
                                                <small className="text-muted">{emp.rut}</small>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {empleadoSeleccionado && (
                                    <div className="mt-2 small text-muted ps-2 border-start border-3 border-danger">
                                        CC: {empleadoSeleccionado.cc_codigo} | Área: {empleadoSeleccionado.area_negocio}
                                    </div>
                                )}
                            </div>

                            <div className="row g-2">
                                <div className="col-6">
                                    <label className="form-label fw-bold small">CANTIDAD</label>
                                    <input type="number" className="form-control fw-bold text-center fs-5" placeholder="0" required min="0.01" step="0.01"
                                        value={cantidad} onChange={e => setCantidad(e.target.value)} />
                                </div>
                                <div className="col-6">
                                    <label className="form-label small">NOTA</label>
                                    <input type="text" className="form-control" placeholder="Opcional"
                                        value={observacion} onChange={e => setObservacion(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-0 justify-content-center pb-4">
                            <button type="submit" className="btn btn-danger w-100 py-2 fw-bold" disabled={loading}>
                                {loading ? '...' : 'CONFIRMAR SALIDA'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalSalida;