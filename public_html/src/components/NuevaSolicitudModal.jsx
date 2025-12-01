import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';
import ConfirmModal from './ConfirmModal'; // Nuevo

const NuevaSolicitudModal = ({ show, onClose, onSave, otEditar }) => {
    const [activos, setActivos] = useState([]);
    const [insumos, setInsumos] = useState([]);
    
    // Formulario
    const [activoId, setActivoId] = useState('');
    const [observacion, setObservacion] = useState('');
    const [items, setItems] = useState([]);
    
    // UI
    const [busqueda, setBusqueda] = useState('');
    const [mostrarLista, setMostrarLista] = useState(false);
    const wrapperRef = useRef(null);
    const [loading, setLoading] = useState(false);
    
    // Modales Internos
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', action: null });

    // Cargar datos al abrir
    useEffect(() => {
        if (show) cargarDatos();
    }, [show, otEditar]);

    const cargarDatos = async () => {
        try {
            const [resActivos, resInsumos] = await Promise.all([
                api.get('/index.php/mantencion/activos'),
                api.get('/index.php/inventario')
            ]);
            setActivos(resActivos.data.data);
            setInsumos(resInsumos.data.data);

            if (otEditar) {
                setActivoId(otEditar.activo_id);
                setObservacion(otEditar.descripcion_trabajo || '');
                
                const resDetalles = await api.get(`/index.php/mantencion?detalle=true&id=${otEditar.id}`);
                if(resDetalles.data.success) {
                    const itemsMapeados = resDetalles.data.data.map(d => ({
                        id: d.id,
                        nombre: d.nombre,
                        codigo_sku: d.codigo_sku,
                        stock_actual: parseFloat(d.stock_actual),
                        unidad_medida: d.unidad_medida,
                        cantidad: parseFloat(d.cantidad)
                    }));
                    setItems(itemsMapeados);
                }
            } else {
                setActivoId(''); setObservacion(''); setItems([]); setBusqueda('');
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setMostrarLista(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);


    const handleActivoChange = async (e) => {
        const id = e.target.value;
        setActivoId(id);

        if (id && !otEditar) {
            try {
                const res = await api.get(`/index.php/mantencion/kit?id=${id}`);
                if (res.data.success && res.data.data.length > 0) {
                    setConfirmModal({
                        show: true,
                        title: "Kit de Mantención Detectado",
                        message: `Esta máquina tiene un kit con ${res.data.data.length} insumos. ¿Deseas cargarlos automáticamente?`,
                        action: () => {
                            setItems(res.data.data.map(k => ({
                                ...k, 
                                stock_actual: parseFloat(k.stock_actual), 
                                cantidad: parseFloat(k.cantidad)
                            })));
                            setConfirmModal({ show: false });
                        }
                    });
                }
            } catch(e){}
        }
    };

    const agregarItem = (insumo) => {
        if (items.find(i => i.id === insumo.id)) return;
        setItems([...items, { ...insumo, cantidad: 1 }]);
        setBusqueda(''); setMostrarLista(false);
    };

    const actualizarCantidad = (idx, val) => {
        const copia = [...items]; copia[idx].cantidad = parseFloat(val) || 0; setItems(copia);
    };

    const eliminarItem = (idx) => setItems(items.filter((_, i) => i !== idx));

    const preSubmit = () => {
        if (!activoId || items.length === 0) {
            return setMsgModal({show:true, title:"Faltan Datos", message:"Debes seleccionar una máquina y al menos un insumo.", type:"warning"});
        }

        const itemsEnBodega = items.filter(i => parseFloat(i.stock_actual) >= parseFloat(i.cantidad));
        
        if (itemsEnBodega.length > 0) {
            const lista = itemsEnBodega.map(i => `• ${i.nombre} (Stock: ${i.stock_actual})`).join('\n');
            setConfirmModal({
                show: true,
                type: "warning",
                title: "⚠️ Aviso de Stock",
                message: `Atención: Tienes ${itemsEnBodega.length} insumos que SÍ tienen stock en bodega.\n\nSi generas la OT, Compras solo verá los que faltan.\n¿Deseas continuar?`,
                action: procesarEnvio
            });
        } else {
            procesarEnvio();
        }
    };

    const procesarEnvio = async () => {
        setConfirmModal({ show: false });
        setLoading(true);
        try {
            const payload = { activo_id: activoId, observacion, items };
            
            if (otEditar) {
                await api.put(`/index.php/mantencion?id=${otEditar.id}`, payload);
                setMsgModal({ show: true, title: "Actualizado", message: "La OT ha sido modificada correctamente.", type: "success" });
            } else {
                await api.post('/index.php/mantencion', payload);
                setMsgModal({ show: true, title: "Creado", message: "Solicitud de trabajo generada.", type: "success" });
            }
            
            setTimeout(() => {
                onSave();
                onClose();
                setMsgModal({ show: false });
            }, 1500);

        } catch (error) {
            setMsgModal({show:true, title:"Error", message:error.response?.data?.message || "Error al guardar", type:"error"});
        } finally {
            setLoading(false);
        }
    };

    const insumosFiltrados = busqueda ? insumos.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase())) : [];

    if (!show) return null;

    return (
        <>
            {/* Modales Auxiliares */}
            <MessageModal show={msgModal.show} onClose={()=>setMsgModal({...msgModal, show:false})} title={msgModal.title} message={msgModal.message} type={msgModal.type} />
            <ConfirmModal 
                show={confirmModal.show} 
                onClose={()=>setConfirmModal({...confirmModal, show:false})} 
                onConfirm={confirmModal.action}
                title={confirmModal.title} 
                message={confirmModal.message}
                type={confirmModal.type || 'primary'}
                confirmText="Sí, Continuar"
            />

            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header bg-warning text-dark">
                            <h5 className="modal-title fw-bold">
                                {otEditar ? `✏️ Editar OT #${otEditar.id}` : '🛠️ Nueva Orden de Trabajo'}
                            </h5>
                            <button className="btn-close" onClick={onClose}></button>
                        </div>
                        
                        <div className="modal-body bg-light p-4">
                            {/* Sección Máquina */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-body">
                                    <label className="form-label fw-bold small text-muted">MÁQUINA / ACTIVO</label>
                                    <select className="form-select" value={activoId} onChange={handleActivoChange} disabled={!!otEditar}>
                                        <option value="">Seleccione Máquina...</option>
                                        {activos.map(a => (
                                            <option key={a.id} value={a.id}>{a.nombre} - {a.codigo_interno}</option>
                                        ))}
                                    </select>
                                    <div className="mt-3">
                                        <label className="form-label fw-bold small text-muted">DESCRIPCIÓN</label>
                                        <textarea className="form-control" rows="2" value={observacion} onChange={e => setObservacion(e.target.value)}></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Buscador Repuestos */}
                            <div className="mb-3 position-relative" ref={wrapperRef}>
                                <input type="text" className="form-control" placeholder="🔍 Buscar repuesto..." 
                                    value={busqueda} onChange={e => { setBusqueda(e.target.value); setMostrarLista(true); }} onFocus={() => setMostrarLista(true)} />
                                {mostrarLista && busqueda && (
                                    <ul className="list-group position-absolute w-100 shadow mt-1" style={{zIndex:10, maxHeight:'200px', overflowY:'auto'}}>
                                        {insumosFiltrados.map(ins => (
                                            <li key={ins.id} className="list-group-item list-group-item-action cursor-pointer" onClick={() => agregarItem(ins)}>
                                                {ins.nombre} (Stock: {ins.stock_actual})
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Tabla Items */}
                            <div className="table-responsive bg-white border rounded">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr><th>Insumo</th><th style={{width:'100px'}}>Cant.</th><th>Estado Stock</th><th></th></tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr key={item.id}>
                                                <td>{item.nombre} <small className="text-muted d-block">{item.codigo_sku}</small></td>
                                                <td><input type="number" className="form-control form-control-sm text-center" value={item.cantidad} onChange={e => actualizarCantidad(idx, e.target.value)} /></td>
                                                <td>
                                                    {parseFloat(item.stock_actual) >= parseFloat(item.cantidad) ? 
                                                        <span className="badge bg-success bg-opacity-10 text-success border border-success">En Bodega</span> : 
                                                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">Falta Stock</span>}
                                                </td>
                                                <td><button className="btn btn-sm text-danger" onClick={() => eliminarItem(idx)}>x</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="modal-footer bg-white">
                            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button className="btn btn-warning fw-bold px-4 shadow-sm" onClick={preSubmit} disabled={loading}>
                                {loading ? '...' : (otEditar ? 'Actualizar OT' : 'Generar OT')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default NuevaSolicitudModal;