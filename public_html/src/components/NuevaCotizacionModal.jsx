import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal'; // Asegúrate de importar esto

const NuevaCotizacionModal = ({ show, onClose, onSave }) => {
    const [insumos, setInsumos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [items, setItems] = useState([]);
    const [observacion, setObservacion] = useState('');
    const [loading, setLoading] = useState(false);

    // Estado del Mensaje Modal (Reemplazo de alert)
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });

    // Formulario temporal (Sin precio)
    const [linea, setLinea] = useState({ insumo_id: null, nombre: '', cantidad: 1 });

    useEffect(() => {
        if (show) {
            api.get('/index.php/inventario').then(res => {
                if (res.data.success) setInsumos(res.data.data);
            }).catch(err => console.error(err));
            
            // Reset
            setItems([]);
            setObservacion('');
            setBusqueda('');
            setLinea({ insumo_id: null, nombre: '', cantidad: 1 });
        }
    }, [show]);

    const showMessage = (title, message, type = 'error') => {
        setMsgModal({ show: true, title, message, type });
    };

    const agregarLinea = () => {
        const nombreFinal = linea.nombre || busqueda;
        
        // Validación con Modal
        if (!nombreFinal || nombreFinal.trim() === '') {
            return showMessage("Campo Vacío", "Por favor ingresa un nombre o selecciona un producto.", "warning");
        }
        if (linea.cantidad <= 0) {
            return showMessage("Cantidad Inválida", "La cantidad debe ser mayor a 0.", "warning");
        }

        setItems([...items, { ...linea, nombre_item: nombreFinal }]);
        
        // Reset inputs
        setLinea({ insumo_id: null, nombre: '', cantidad: 1 });
        setBusqueda('');
    };

    const seleccionarInsumo = (insumo) => {
        setLinea({ ...linea, insumo_id: insumo.id, nombre: insumo.nombre });
        setBusqueda(insumo.nombre);
    };

    const eliminarLinea = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            return showMessage("Lista Vacía", "Debes agregar al menos un ítem a la cotización.", "warning");
        }
        
        setLoading(true);
        try {
            await api.post('/index.php/cotizaciones', { items, observacion });
            
            // Mensaje de éxito antes de cerrar
            setMsgModal({ show: true, title: "Éxito", message: "Cotización creada correctamente.", type: "success" });
            
            // Esperar un momento para que el usuario lea el mensaje
            setTimeout(() => {
                setMsgModal({ ...msgModal, show: false });
                onSave();
                onClose();
            }, 1500);

        } catch (error) {
            showMessage("Error", error.response?.data?.message || "Error al guardar.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <>
            <MessageModal 
                show={msgModal.show} 
                onClose={() => setMsgModal({ ...msgModal, show: false })}
                title={msgModal.title}
                message={msgModal.message}
                type={msgModal.type}
            />

            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto', zIndex: 1050 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content shadow border-0">
                        <div className="modal-header bg-dark text-white">
                            <h5 className="modal-title fw-bold"><i className="bi bi-file-earmark-plus me-2"></i>Nueva Cotización</h5>
                            <button className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        
                        <div className="modal-body bg-white p-4">
                            {/* SECCIÓN DE AGREGAR ÍTEMS */}
                            <div className="card border mb-4 bg-light">
                                <div className="card-body">
                                    <label className="form-label fw-bold text-muted small">AGREGAR ÍTEM / PRODUCTO</label>
                                    <div className="row g-2 align-items-end">
                                        {/* COLUMNA AMPLIA PARA PRODUCTO (md-8) */}
                                        <div className="col-12 col-md-8 position-relative">
                                            <label className="small text-muted">Descripción del Producto</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="Buscar en inventario o escribir nuevo..." 
                                                value={busqueda} 
                                                onChange={e => { 
                                                    setBusqueda(e.target.value); 
                                                    setLinea({...linea, nombre: e.target.value, insumo_id: null}); 
                                                }}
                                                onKeyDown={(e) => { if (e.key === 'Enter') agregarLinea(); }}
                                            />
                                            {/* Autocompletado */}
                                            {busqueda && !linea.insumo_id && insumos.length > 0 && (
                                                <div className="list-group position-absolute w-100 shadow mt-1" style={{zIndex: 1000, maxHeight: '200px', overflowY: 'auto'}}>
                                                    {insumos.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase())).slice(0,6).map(i => (
                                                        <button key={i.id} className="list-group-item list-group-item-action py-2" onClick={() => seleccionarInsumo(i)}>
                                                            <div className="d-flex justify-content-between">
                                                                <span className="fw-bold small">{i.nombre}</span>
                                                                <span className="badge bg-light text-dark border">{i.codigo_sku}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* COLUMNA CANTIDAD (md-2) */}
                                        <div className="col-6 col-md-2">
                                            <label className="small text-muted">Cantidad</label>
                                            <input type="number" className="form-control text-center" min="1" step="0.01"
                                                value={linea.cantidad} 
                                                onChange={e => setLinea({...linea, cantidad: parseFloat(e.target.value) || 0})}
                                                onKeyDown={(e) => { if (e.key === 'Enter') agregarLinea(); }}
                                            />
                                        </div>

                                        {/* BOTÓN AGREGAR (md-2) */}
                                        <div className="col-6 col-md-2">
                                            <button className="btn btn-success w-100 fw-bold" onClick={agregarLinea}>
                                                <i className="bi bi-plus-lg"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* LISTADO DE ÍTEMS */}
                            <div className="table-responsive border rounded mb-3">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light text-muted small text-uppercase">
                                        <tr>
                                            <th className="ps-3">Descripción</th>
                                            <th className="text-center" style={{width: '100px'}}>Cant.</th>
                                            <th className="text-center" style={{width: '60px'}}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((it, idx) => (
                                            <tr key={idx}>
                                                <td className="ps-3">
                                                    <div className="fw-bold text-dark">{it.nombre_item}</div>
                                                    {it.insumo_id && <span className="badge bg-info bg-opacity-10 text-info border border-info" style={{fontSize:'0.65rem'}}>Inventario</span>}
                                                </td>
                                                <td className="text-center fw-bold">{it.cantidad}</td>
                                                <td className="text-center">
                                                    <button className="btn btn-sm text-danger" onClick={() => eliminarLinea(idx)}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {items.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="text-center py-5 text-muted small">
                                                    <i className="bi bi-basket display-6 d-block mb-2 text-secondary opacity-50"></i>
                                                    No hay ítems agregados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div>
                                <label className="form-label small fw-bold text-muted">OBSERVACIONES</label>
                                <textarea 
                                    className="form-control" 
                                    rows="2" 
                                    placeholder="Instrucciones adicionales para el cliente..." 
                                    value={observacion} 
                                    onChange={e => setObservacion(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <div className="modal-footer border-top-0 pt-0 pb-4 px-4">
                            <button className="btn btn-outline-secondary px-4" onClick={onClose}>Cancelar</button>
                            <button className="btn btn-primary px-4 fw-bold shadow-sm" onClick={handleSubmit} disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-save me-2"></i>}
                                Generar Cotización
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NuevaCotizacionModal;