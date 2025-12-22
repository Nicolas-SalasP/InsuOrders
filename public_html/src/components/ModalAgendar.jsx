import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal'; // IMPORTADO
import ConfirmModal from './ConfirmModal'; // IMPORTADO

const ModalAgendar = ({ show, onClose, fechaSeleccionada, eventId, onSave }) => {
    // Estados de Datos
    const [activos, setActivos] = useState([]);
    const [insumos, setInsumos] = useState([]);
    
    // Estados de UI
    const [busqueda, setBusqueda] = useState('');
    const [loadingData, setLoadingData] = useState(false);
    
    // Estados para Modales (Alerts reemplazados)
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', type: 'primary', action: null });

    // Formulario
    const [formData, setFormData] = useState({
        titulo: '', descripcion: '', activo_id: '', 
        fecha_programada: '', icono: 'bi-tools', color: '#0d6efd',
        solicitud_ot_id: null
    });
    
    const [itemsSeleccionados, setItemsSeleccionados] = useState([]);

    // 1. Cargar Datos
    useEffect(() => {
        if (show) {
            const cargarCatalogos = async () => {
                try {
                    const [resActivos, resInsumos] = await Promise.all([
                        api.get('/index.php/mantencion/activos'),
                        api.get('/index.php/inventario')
                    ]);
                    if (resActivos.data.success) setActivos(resActivos.data.data);
                    
                    const inventarioData = resInsumos.data.success ? resInsumos.data.data : [];
                    setInsumos(inventarioData);

                    if (eventId) cargarDetalleEvento(eventId, inventarioData);
                    else resetearFormulario();

                } catch (e) { 
                    console.error("Error cargando catálogos", e); 
                }
            };
            cargarCatalogos();
            setBusqueda('');
        }
    }, [show, eventId, fechaSeleccionada]);

    const resetearFormulario = () => {
        setFormData({
            titulo: '', descripcion: '', activo_id: '',
            fecha_programada: fechaSeleccionada || '', 
            icono: 'bi-tools', color: '#0d6efd', solicitud_ot_id: null
        });
        setItemsSeleccionados([]);
    };

    const cargarDetalleEvento = async (id, catalogoInsumos) => {
        setLoadingData(true);
        try {
            const res = await api.get(`/index.php/cronograma?id=${id}`);
            if (res.data.success) {
                const ev = res.data.data;
                setFormData({
                    id: ev.id,
                    titulo: ev.titulo,
                    descripcion: ev.descripcion || '',
                    activo_id: ev.activo_id,
                    fecha_programada: ev.fecha_programada,
                    icono: ev.icono || 'bi-tools',
                    color: ev.color || '#0d6efd',
                    solicitud_ot_id: ev.solicitud_ot_id
                });

                const items = (ev.items || []).map(i => {
                    const infoStock = catalogoInsumos.find(inv => inv.id == i.id);
                    return {
                        id: i.id,
                        nombre: i.nombre,
                        codigo_sku: i.codigo_sku,
                        cantidad: parseFloat(i.cantidad),
                        stock_actual: infoStock ? parseFloat(infoStock.stock_actual) : 0,
                        unidad: infoStock ? infoStock.unidad_medida : 'UN'
                    };
                });
                setItemsSeleccionados(items);
            }
        } catch (error) { 
            setMsgModal({ show: true, title: "Error", message: "No se pudo cargar el evento.", type: "error" });
            onClose(); 
        } finally { setLoadingData(false); }
    };

    const handleActivoChange = async (e) => {
        const id = e.target.value;
        setFormData({ ...formData, activo_id: id });
        
        if (id && itemsSeleccionados.length === 0) {
            try {
                const res = await api.get(`/index.php/mantencion/kit?id=${id}`);
                const kit = res.data.data || [];
                
                if (kit.length > 0) {
                    const itemsConStock = kit.map(k => {
                        const infoStock = insumos.find(inv => inv.id == k.id);
                        return {
                            id: k.id, 
                            nombre: k.nombre, 
                            codigo_sku: k.codigo_sku, 
                            cantidad: parseFloat(k.cantidad),
                            stock_actual: infoStock ? parseFloat(infoStock.stock_actual) : 0,
                            unidad: infoStock ? infoStock.unidad_medida : 'UN'
                        };
                    });
                    setItemsSeleccionados(itemsConStock);
                }
            } catch (e) { console.error(e); }
        }
    };

    const agregarInsumo = (insumo) => {
        if (itemsSeleccionados.find(i => i.id === insumo.id)) {
            setMsgModal({ show: true, title: "Duplicado", message: "Este insumo ya está en la lista.", type: "warning" });
            return;
        }
        
        setItemsSeleccionados([...itemsSeleccionados, {
            id: insumo.id,
            nombre: insumo.nombre,
            codigo_sku: insumo.codigo_sku,
            cantidad: 1,
            stock_actual: parseFloat(insumo.stock_actual),
            unidad: insumo.unidad_medida
        }]);
        setBusqueda('');
    };

    const actualizarCantidad = (id, valor) => {
        const cantidad = parseFloat(valor) || 0;
        if (cantidad < 0) return;
        setItemsSeleccionados(itemsSeleccionados.map(i => i.id === id ? { ...i, cantidad } : i));
    };

    const eliminarItem = (id) => {
        setItemsSeleccionados(itemsSeleccionados.filter(i => i.id !== id));
    };

    // --- LÓGICA DE GUARDADO ---
    
    // Función final que llama a la API
    const procesarGuardado = async () => {
        const payload = { ...formData, items: itemsSeleccionados };
        try {
            if (eventId) await api.put('/index.php/cronograma', payload);
            else await api.post('/index.php/cronograma', payload);
            
            // Éxito silencioso o con notificación breve si prefieres
            onSave(); 
            onClose();
        } catch (error) { 
            setMsgModal({ show: true, title: "Error", message: error.response?.data?.error || error.message, type: "error" });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validación Básica
        if (!formData.activo_id) {
            setMsgModal({ show: true, title: "Faltan datos", message: "Debes seleccionar una máquina/activo.", type: "warning" });
            return;
        }
        
        // Validación de Stock (Alerta)
        const faltantes = itemsSeleccionados.filter(i => i.cantidad > i.stock_actual);
        if (faltantes.length > 0) {
            // Abrir Modal de Confirmación
            setConfirmModal({
                show: true,
                title: "Stock Insuficiente",
                message: `Hay ${faltantes.length} insumos sin stock suficiente. Se generará una solicitud de compra automática cuando corresponda. ¿Deseas continuar?`,
                type: "warning",
                confirmText: "Sí, Agendar",
                action: procesarGuardado // Pasamos la función a ejecutar si confirma
            });
            return;
        }

        // Si todo está bien, guardar directo
        procesarGuardado();
    };

    // --- LÓGICA DE ELIMINACIÓN ---
    
    const procesarEliminacion = async () => {
        try {
            await api.delete(`/index.php/cronograma?id=${eventId}`);
            onSave(); onClose();
        } catch (error) { 
            setMsgModal({ show: true, title: "Error", message: "No se pudo eliminar el evento.", type: "error" });
        }
    };

    const handleSolicitarEliminacion = () => {
        setConfirmModal({
            show: true,
            title: "Eliminar Evento",
            message: "¿Estás seguro de que deseas eliminar este evento del cronograma?",
            type: "danger",
            confirmText: "Eliminar",
            action: procesarEliminacion
        });
    };

    // Ejecutar acción confirmada
    const handleConfirmAction = () => {
        if (confirmModal.action) confirmModal.action();
        setConfirmModal({ ...confirmModal, show: false, action: null });
    };

    if (!show) return null;

    return (
        <>
            {/* Modales de Sistema */}
            <MessageModal 
                show={msgModal.show} 
                onClose={() => setMsgModal({ ...msgModal, show: false })} 
                title={msgModal.title} 
                message={msgModal.message} 
                type={msgModal.type} 
            />
            
            <ConfirmModal 
                show={confirmModal.show} 
                onClose={() => setConfirmModal({ ...confirmModal, show: false })}
                onConfirm={handleConfirmAction}
                title={confirmModal.title} 
                message={confirmModal.message} 
                confirmText={confirmModal.confirmText}
                type={confirmModal.type} 
            />

            {/* Modal Principal */}
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', overflowY: 'auto' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content shadow border-0">
                        <div className="modal-header text-white" style={{ backgroundColor: formData.color, transition: '0.3s' }}>
                            <h5 className="modal-title fw-bold">
                                <i className={`bi ${formData.icono} me-2`}></i>
                                {eventId ? 'Detalle / Edición' : 'Agendar Mantención'}
                            </h5>
                            <button className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>

                        {formData.solicitud_ot_id && (
                            <div className="alert alert-success rounded-0 mb-0 py-2 text-center fw-bold border-0 border-bottom border-success">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                Este evento ya generó la Orden de Trabajo #{formData.solicitud_ot_id}
                            </div>
                        )}

                        {loadingData ? <div className="p-5 text-center">Cargando...</div> : (
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    {/* ... Formulario Datos ... */}
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">FECHA PROGRAMADA</label>
                                            <input type="date" className="form-control fw-bold" required 
                                                value={formData.fecha_programada} onChange={e => setFormData({ ...formData, fecha_programada: e.target.value })} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-primary">MÁQUINA / ACTIVO</label>
                                            <select className="form-select border-primary fw-bold" required value={formData.activo_id} onChange={handleActivoChange}>
                                                <option value="">Seleccione...</option>
                                                {activos.map(a => <option key={a.id} value={a.id}>{a.codigo_interno} - {a.nombre}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-8">
                                            <label className="form-label small fw-bold text-muted">TÍTULO TAREA</label>
                                            <input type="text" className="form-control" required placeholder="Ej: Mantención 500 Horas"
                                                value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label small fw-bold text-muted">ICONO</label>
                                            <select className="form-select font-monospace" value={formData.icono} onChange={e => setFormData({...formData, icono: e.target.value})}>
                                                <option value="bi-tools">🔧</option><option value="bi-droplet-fill">🛢️</option>
                                                <option value="bi-gear-fill">⚙️</option><option value="bi-lightning-fill">⚡</option>
                                                <option value="bi-truck">🚚</option><option value="bi-cone-striped">🚧</option>
                                            </select>
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label small fw-bold text-muted">COLOR</label>
                                            <input type="color" className="form-control form-control-color w-100" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                                        </div>
                                        <div className="col-12">
                                            <textarea className="form-control" rows="2" placeholder="Detalles adicionales..." value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})}></textarea>
                                        </div>
                                    </div>

                                    <hr className="text-muted opacity-25" />

                                    <h6 className="fw-bold text-secondary mb-2">Insumos y Disponibilidad</h6>

                                    {/* Buscador */}
                                    <div className="position-relative mb-3">
                                        <input type="text" className="form-control" placeholder="🔍 Buscar insumo..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                                        {busqueda && (
                                            <div className="list-group position-absolute w-100 shadow mt-1 bg-white border" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                                {insumos.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase())).slice(0, 8).map(i => (
                                                    <button key={i.id} type="button" className="list-group-item list-group-item-action d-flex justify-content-between" onClick={() => agregarInsumo(i)}>
                                                        <span>{i.nombre}</span>
                                                        <span className={`badge ${parseFloat(i.stock_actual) > 0 ? 'bg-success' : 'bg-danger'}`}>Stock: {parseFloat(i.stock_actual)}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Tabla Insumos */}
                                    <div className="table-responsive border rounded bg-white shadow-sm" style={{ maxHeight: '250px' }}>
                                        <table className="table table-sm table-hover mb-0 align-middle">
                                            <thead className="table-light sticky-top">
                                                <tr>
                                                    <th className="ps-3 py-2">Insumo</th>
                                                    <th className="text-center">Stock</th>
                                                    <th className="text-center" style={{ width: '90px' }}>Necesario</th>
                                                    <th className="text-center">Estado</th>
                                                    <th className="text-end pe-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemsSeleccionados.map(item => {
                                                    const tieneStock = item.stock_actual >= item.cantidad;
                                                    const deficit = item.cantidad - item.stock_actual;
                                                    return (
                                                        <tr key={item.id}>
                                                            <td className="ps-3">
                                                                <div className="fw-bold text-dark">{item.nombre}</div>
                                                                <div className="small text-muted font-monospace">{item.codigo_sku}</div>
                                                            </td>
                                                            <td className="text-center fw-bold text-secondary">
                                                                {item.stock_actual} <small className="fw-normal">{item.unidad}</small>
                                                            </td>
                                                            <td className="text-center">
                                                                <input type="number" className="form-control form-control-sm text-center fw-bold" min="0.1" step="0.1"
                                                                    value={item.cantidad} 
                                                                    onChange={e => actualizarCantidad(item.id, e.target.value)} 
                                                                />
                                                            </td>
                                                            <td className="text-center">
                                                                {tieneStock ? (
                                                                    <span className="badge bg-success bg-opacity-75">OK</span>
                                                                ) : (
                                                                    <span className="badge bg-danger" title={`Faltan ${deficit.toFixed(1)}`}>
                                                                        Falta {deficit.toFixed(1)}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="text-end pe-3">
                                                                <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={() => eliminarItem(item.id)}>
                                                                    <i className="bi bi-x-circle-fill fs-5"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {itemsSeleccionados.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted fst-italic">Sin insumos planificados.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                <div className="modal-footer bg-light justify-content-between">
                                    <div>
                                        {eventId && (
                                            <button type="button" className="btn btn-outline-danger border-0" onClick={handleSolicitarEliminacion}>
                                                <i className="bi bi-trash me-2"></i>Eliminar
                                            </button>
                                        )}
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                                        <button type="submit" className="btn btn-primary px-4 fw-bold">{eventId ? 'Guardar Cambios' : 'Agendar'}</button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModalAgendar;