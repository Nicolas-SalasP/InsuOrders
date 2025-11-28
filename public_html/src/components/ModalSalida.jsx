import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';

const ModalSalida = ({ show, onClose, insumo, onSave }) => {
    const [cantidad, setCantidad] = useState('');
    const [observacion, setObservacion] = useState('');
    const [loading, setLoading] = useState(false);

    // Lógica de Empleados (Buscador)
    const [empleados, setEmpleados] = useState([]);
    const [busquedaEmp, setBusquedaEmp] = useState('');
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [mostrarLista, setMostrarLista] = useState(false);
    
    // Referencia para cerrar la lista al hacer clic fuera
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (show) {
            // Cargar lista de empleados
            api.get('/index.php/personal').then(res => {
                if (res.data.success) setEmpleados(res.data.data);
            });
            // Resetear formulario
            setCantidad('');
            setObservacion('');
            setEmpleadoSeleccionado(null);
            setBusquedaEmp('');
        }
    }, [show]);

    // Detectar clic fuera del buscador para cerrar lista
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setMostrarLista(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Filtrado
    const empleadosFiltrados = empleados.filter(e => 
        e.nombre_completo.toLowerCase().includes(busquedaEmp.toLowerCase()) ||
        e.rut.toLowerCase().includes(busquedaEmp.toLowerCase())
    );

    const seleccionarEmpleado = (emp) => {
        setEmpleadoSeleccionado(emp);
        setBusquedaEmp(emp.nombre_completo);
        setMostrarLista(false);
    };

    const limpiarSeleccion = () => {
        setEmpleadoSeleccionado(null);
        setBusquedaEmp('');
        setMostrarLista(true); // Mostrar lista de nuevo para buscar
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!empleadoSeleccionado) {
            alert("⚠️ Debes indicar quién retira el material.");
            return;
        }

        setLoading(true);
        try {
            await api.post('/index.php/inventario/ajuste', {
                insumo_id: insumo.id,
                cantidad: cantidad,
                tipo_movimiento_id: 4, // 4 = Salida
                observacion: observacion,
                empleado_id: empleadoSeleccionado.id
            });
            onSave();
            onClose();
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Desconocido"));
        } finally {
            setLoading(false);
        }
    };

    if (!show || !insumo) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg border-0">
                    
                    {/* Cabecera Roja (Salida) */}
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title fw-bold">📤 Salida de Material</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            
                            {/* Info Producto */}
                            <div className="text-center mb-4 p-3 bg-light rounded border-start border-4 border-danger">
                                <h5 className="fw-bold mb-1 text-dark">{insumo.nombre}</h5>
                                <small className="text-muted d-block">SKU: {insumo.codigo_sku}</small>
                                <span className="badge bg-white text-dark border mt-2">
                                    Stock: {insumo.stock_actual} {insumo.unidad_medida}
                                </span>
                            </div>

                            {/* BUSCADOR DE PERSONAL */}
                            <div className="mb-4" ref={wrapperRef}>
                                <label className="form-label fw-bold text-danger small text-uppercase">Solicitante (Quién retira)</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white text-muted"><i className="bi bi-person-search"></i></span>
                                    
                                    <input 
                                        type="text" 
                                        className={`form-control ${empleadoSeleccionado ? 'is-valid border-success' : ''}`}
                                        placeholder="Buscar por RUT o Nombre..."
                                        value={busquedaEmp}
                                        onChange={(e) => {
                                            setBusquedaEmp(e.target.value);
                                            setMostrarLista(true);
                                            if(empleadoSeleccionado) setEmpleadoSeleccionado(null);
                                        }}
                                        onFocus={() => setMostrarLista(true)}
                                        readOnly={!!empleadoSeleccionado} 
                                    />
                                    
                                    {/* Botón X para borrar */}
                                    {empleadoSeleccionado ? (
                                        <button className="btn btn-outline-secondary border-start-0" type="button" onClick={limpiarSeleccion}>
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    ) : (
                                        <button className="btn btn-outline-secondary border-start-0" type="button" disabled>
                                            <i className="bi bi-chevron-down"></i>
                                        </button>
                                    )}
                                </div>

                                {/* Lista Desplegable */}
                                {mostrarLista && !empleadoSeleccionado && busquedaEmp.length > 0 && (
                                    <ul className="list-group position-absolute w-100 shadow mt-1 border-0" 
                                        style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}>
                                        {empleadosFiltrados.map(emp => (
                                            <button key={emp.id} type="button"
                                                className="list-group-item list-group-item-action text-start px-3 py-2"
                                                onClick={() => seleccionarEmpleado(emp)}>
                                                <div className="fw-bold text-dark">{emp.nombre_completo}</div>
                                                <div className="small text-muted">{emp.rut} - {emp.cargo || 'Sin Cargo'}</div>
                                            </button>
                                        ))}
                                        {empleadosFiltrados.length === 0 && (
                                            <li className="list-group-item text-center text-muted small py-2">No encontrado</li>
                                        )}
                                    </ul>
                                )}

                                {/* Datos Informativos (Solo Lectura) */}
                                {empleadoSeleccionado && (
                                    <div className="mt-2 p-2 bg-light rounded border d-flex justify-content-between align-items-center small">
                                        <div>
                                            <span className="text-muted d-block" style={{fontSize:'0.7rem'}}>CENTRO DE COSTO</span>
                                            <strong className="text-dark">{empleadoSeleccionado.cc_codigo}</strong>
                                        </div>
                                        <div className="text-end">
                                            <span className="text-muted d-block" style={{fontSize:'0.7rem'}}>ÁREA</span>
                                            <strong className="text-primary">{empleadoSeleccionado.area_negocio}</strong>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="row g-3">
                                <div className="col-5">
                                    <label className="form-label fw-bold small text-uppercase">Cantidad</label>
                                    <input type="number" className="form-control text-center fw-bold fs-5" 
                                        placeholder="0" required min="0.01" step="0.01"
                                        value={cantidad} onChange={e => setCantidad(e.target.value)} />
                                </div>
                                <div className="col-7">
                                    <label className="form-label small text-uppercase">Observación</label>
                                    <input type="text" className="form-control" 
                                        placeholder="OT #, Nota..."
                                        value={observacion} onChange={e => setObservacion(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer bg-light border-top-0">
                            <button type="submit" className="btn btn-danger w-100 py-2 fw-bold" disabled={loading}>
                                {loading ? 'Procesando...' : 'CONFIRMAR SALIDA'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalSalida;