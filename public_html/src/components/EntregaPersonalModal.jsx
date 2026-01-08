import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig'; // Ajusta la ruta según tu estructura

const EntregaPersonalModal = ({ show, onClose, onSave }) => {
    const [tecnicos, setTecnicos] = useState([]);
    const [insumos, setInsumos] = useState([]);
    
    // Formulario
    const [tecnicoId, setTecnicoId] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [insumoSeleccionado, setInsumoSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            // Cargar lista de técnicos (Usuarios con rol 4)
            // Nota: Debes tener un endpoint que devuelva empleados o filtrar usuarios
            api.get('/mantenedores/empleados').then(res => {
                if(res.data.success) {
                    // Filtramos solo los que son técnicos (Asumiendo que el backend devuelve rol_id)
                    const tech = res.data.data.filter(u => u.rol_id === 4); 
                    setTecnicos(tech);
                }
            });
            
            // Cargar inventario para buscar
            api.get('/inventario').then(res => {
                if(res.data.success) setInsumos(res.data.data);
            });

            // Resetear
            setTecnicoId('');
            setBusqueda('');
            setInsumoSeleccionado(null);
            setCantidad('');
            setError('');
        }
    }, [show]);

    const insumosFiltrados = busqueda 
        ? insumos.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase()) || i.codigo_sku?.includes(busqueda))
        : [];

    const handleAsignar = async () => {
        if (!tecnicoId || !insumoSeleccionado || !cantidad) {
            setError("Debes seleccionar técnico, insumo y cantidad.");
            return;
        }
        
        setLoading(true);
        try {
            await api.post('/operario/asignar', {
                operario_id: tecnicoId,
                insumo_id: insumoSeleccionado.id,
                cantidad: parseFloat(cantidad)
            });
            onSave(); // Refrescar tabla padre
            onClose(); // Cerrar modal
            alert("Entrega registrada exitosamente");
        } catch (err) {
            setError(err.response?.data?.message || "Error al asignar");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content shadow">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title">📦 Entrega a Técnico</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}

                        <div className="mb-3">
                            <label className="form-label fw-bold">1. Seleccionar Técnico</label>
                            <select className="form-select" value={tecnicoId} onChange={e => setTecnicoId(e.target.value)}>
                                <option value="">-- Elegir Técnico --</option>
                                {tecnicos.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">2. Buscar Insumo</label>
                            {insumoSeleccionado ? (
                                <div className="alert alert-info d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{insumoSeleccionado.nombre}</strong>
                                        <br/><small>{insumoSeleccionado.codigo_sku}</small>
                                    </div>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => setInsumoSeleccionado(null)}>Cambiar</button>
                                </div>
                            ) : (
                                <div className="position-relative">
                                    <input type="text" className="form-control" placeholder="Escribe nombre o SKU..." 
                                        value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                                    
                                    {insumosFiltrados.length > 0 && (
                                        <ul className="list-group position-absolute w-100 shadow mt-1" style={{zIndex: 10, maxHeight: '150px', overflowY: 'auto'}}>
                                            {insumosFiltrados.map(i => (
                                                <li key={i.id} className="list-group-item list-group-item-action cursor-pointer" 
                                                    onClick={() => { setInsumoSeleccionado(i); setBusqueda(''); }}>
                                                    {i.nombre} <span className="text-muted small">({i.stock_actual} en bodega)</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">3. Cantidad a Entregar</label>
                            <input type="number" className="form-control" placeholder="0" 
                                value={cantidad} onChange={e => setCantidad(e.target.value)} />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button className="btn btn-primary" onClick={handleAsignar} disabled={loading}>
                            {loading ? 'Procesando...' : 'Confirmar Entrega'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EntregaPersonalModal;