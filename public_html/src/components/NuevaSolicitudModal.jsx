import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';
import ConfirmModal from './ConfirmModal';

const NuevaSolicitudModal = ({ show, onClose, onSave, otEditar }) => {
    const [activos, setActivos] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [centrosCosto, setCentrosCosto] = useState([]);
    const [personal, setPersonal] = useState([]); 

    const [modo, setModo] = useState('maquina'); 

    // Formulario Común
    const [observacion, setObservacion] = useState('');
    const [items, setItems] = useState([]);

    // Campos Específicos
    const [activoId, setActivoId] = useState('');
    const [solicitanteExterno, setSolicitanteExterno] = useState('');
    const [centroCostoOT, setCentroCostoOT] = useState('');

    // UI Search Insumos
    const [busqueda, setBusqueda] = useState('');
    const [mostrarLista, setMostrarLista] = useState(false);
    const wrapperRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', action: null });

    useEffect(() => {
        if (show) cargarDatos();
    }, [show, otEditar]);

    const cargarDatos = async () => {
        try {
            setItems([]);

            const [resActivos, resInsumos, resCC, resPersonal] = await Promise.all([
                api.get('/index.php/mantencion/activos'),
                api.get('/index.php/inventario'),
                api.get('/index.php/mantencion/centros-costo'),
                api.get('/index.php/personal')
            ]);
            
            setActivos(resActivos.data.data);
            setInsumos(resInsumos.data.data);
            if (resCC.data.success) setCentrosCosto(resCC.data.data);
            if (resPersonal.data.success) setPersonal(resPersonal.data.data);

            if (otEditar) {
                if (otEditar.activo_id) {
                    setModo('maquina');
                    setActivoId(otEditar.activo_id);
                } else {
                    setModo('servicio');
                    setActivoId('');
                    setSolicitanteExterno(otEditar.solicitante_externo || '');
                    setCentroCostoOT(otEditar.centro_costo_ot || '');
                }

                setObservacion(otEditar.descripcion_trabajo || '');

                const resDetalles = await api.get(`/index.php/mantencion?detalle=true&id=${otEditar.id}`);
                if (resDetalles.data.success) {
                    const itemsMapeados = resDetalles.data.data.map(d => ({
                        id: d.id,
                        detalle_id: d.detalle_id,
                        nombre: d.nombre,
                        codigo_sku: d.codigo_sku,
                        stock_actual: parseFloat(d.stock_actual),
                        unidad_medida: d.unidad_medida,
                        cantidad: parseFloat(d.cantidad),
                        oc_id: d.oc_id,
                        oc_proveedor: d.oc_proveedor,
                        estado_linea: d.estado_linea,
                        retirado_por: d.retirado_por,
                        fecha_retiro: d.fecha_retiro
                    }));
                    setItems(itemsMapeados);
                }
            } else {
                // Resetear
                setModo('maquina');
                setActivoId(''); 
                setObservacion(''); 
                setBusqueda('');
                setSolicitanteExterno('');
                setCentroCostoOT('');
            }
        } catch (e) {
            console.error(e);
            setMsgModal({ show: true, title: "Error de Carga", message: "No se pudieron cargar los datos.", type: "error" });
        }
    };

    // Click outside para cerrar lista de insumos
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

        if (id && !otEditar && modo === 'maquina') {
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
                                cantidad: parseFloat(k.cantidad),
                                estado_linea: 'NUEVO'
                            })));
                            setConfirmModal({ show: false });
                        }
                    });
                }
            } catch (e) { }
        }
    };

    const agregarItem = (insumo) => {
        if (items.find(i => i.id === insumo.id)) return;
        setItems([...items, { ...insumo, cantidad: 1, estado_linea: 'NUEVO' }]);
        setBusqueda(''); setMostrarLista(false);
    };

    const actualizarCantidad = (idx, val) => {
        const copia = [...items]; copia[idx].cantidad = parseFloat(val) || 0; setItems(copia);
    };

    const eliminarItem = (idx) => setItems(items.filter((_, i) => i !== idx));

    const preSubmit = () => {
        if (modo === 'maquina' && !activoId) {
             return setMsgModal({ show: true, title: "Faltan Datos", message: "Seleccione una máquina.", type: "warning" });
        }
        if (modo === 'servicio' && (!centroCostoOT || !solicitanteExterno)) {
             return setMsgModal({ show: true, title: "Faltan Datos", message: "Complete el Solicitante y el Centro de Costo.", type: "warning" });
        }
        
        if (!otEditar) {
            const itemsEnBodega = items.filter(i => parseFloat(i.stock_actual) >= parseFloat(i.cantidad));
            if (itemsEnBodega.length > 0) {
                setConfirmModal({
                    show: true,
                    type: "warning",
                    title: "⚠️ Aviso de Stock",
                    message: `Tienes ${itemsEnBodega.length} insumos con stock disponible. Estos se reservarán en Bodega automáticamente.\n¿Continuar?`,
                    action: procesarEnvio
                });
            } else {
                procesarEnvio();
            }
        } else {
            procesarEnvio();
        }
    };

    const procesarEnvio = async () => {
        setConfirmModal({ show: false });
        setLoading(true);
        try {
            const payload = {
                id: otEditar ? otEditar.id : null,
                activo_id: modo === 'maquina' ? activoId : null,
                observacion,
                items,
                // Datos Servicio
                solicitante_externo: modo === 'servicio' ? solicitanteExterno : null,
                area_negocio: null, // Ya no usamos área de negocio explícita
                centro_costo_ot: modo === 'servicio' ? centroCostoOT : null,
                origen_tipo: modo === 'maquina' ? 'Interna' : 'Servicio' 
            };

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
            setMsgModal({ show: true, title: "Error", message: error.response?.data?.message || "Error al guardar", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const insumosFiltrados = busqueda ? insumos.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase())) : [];

    if (!show) return null;

    return (
        <>
            <MessageModal show={msgModal.show} onClose={() => setMsgModal({ ...msgModal, show: false })} title={msgModal.title} message={msgModal.message} type={msgModal.type} />
            <ConfirmModal
                show={confirmModal.show}
                onClose={() => setConfirmModal({ ...confirmModal, show: false })}
                onConfirm={confirmModal.action}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type || 'primary'}
                confirmText="Sí, Continuar"
            />

            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
                <div className="modal-dialog modal-xl">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header bg-warning text-dark">
                            <h5 className="modal-title fw-bold">
                                {otEditar ? `✏️ Detalle OT #${otEditar.id}` : '🛠️ Nueva Orden de Trabajo'}
                            </h5>
                            <button className="btn-close" onClick={onClose}></button>
                        </div>

                        <div className="modal-body bg-light p-4">
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-body">
                                    
                                    {!otEditar && (
                                        <div className="d-flex justify-content-center mb-4">
                                            <div className="btn-group" role="group">
                                                <button type="button" 
                                                    className={`btn fw-bold px-4 ${modo === 'maquina' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    onClick={() => { setModo('maquina'); setActivoId(''); setItems([]); }}>
                                                    <i className="bi bi-gear-fill me-2"></i>Maquinaria
                                                </button>
                                                <button type="button" 
                                                    className={`btn fw-bold px-4 ${modo === 'servicio' ? 'btn-success' : 'btn-outline-success'}`}
                                                    onClick={() => { setModo('servicio'); setActivoId(''); setItems([]); }}>
                                                    <i className="bi bi-people-fill me-2"></i>Servicio / Área
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="row g-3">
                                        {/* COLUMNA IZQUIERDA */}
                                        <div className="col-md-6">
                                            {modo === 'maquina' ? (
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold small text-muted">MÁQUINA / ACTIVO</label>
                                                    <select className="form-select border-primary" value={activoId} onChange={handleActivoChange} disabled={!!otEditar}>
                                                        <option value="">Seleccione Máquina...</option>
                                                        {activos.map(a => (
                                                            <option key={a.id} value={a.id}>{a.nombre} - {a.codigo_interno}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="bg-white p-3 rounded border border-success mb-3">
                                                    <h6 className="text-success fw-bold border-bottom pb-2 mb-3"><i className="bi bi-person-badge me-2"></i>Datos del Servicio</h6>
                                                    
                                                    <div className="mb-3">
                                                        <label className="form-label small text-muted">Solicitante</label>
                                                        <select className="form-select" value={solicitanteExterno} onChange={e => setSolicitanteExterno(e.target.value)} disabled={!!otEditar}>
                                                            <option value="">Seleccione Solicitante...</option>
                                                            {personal.map(p => (
                                                                <option key={p.id} value={`${p.nombre} ${p.apellido}`}>
                                                                    {p.nombre} {p.apellido} {p.cargo ? `(${p.cargo})` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="mb-2">
                                                        <label className="form-label small text-muted">Centro de Costo</label>
                                                        <select className="form-select fw-bold" value={centroCostoOT} onChange={e => setCentroCostoOT(e.target.value)} disabled={!!otEditar}>
                                                            <option value="">Seleccione Centro...</option>
                                                            {centrosCosto.map(cc => (
                                                                <option key={cc.id} value={cc.codigo}>
                                                                    {cc.codigo} - {cc.nombre}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* COLUMNA DERECHA: DESCRIPCIÓN */}
                                        <div className="col-md-6">
                                            <div className="h-100 d-flex flex-column">
                                                <label className="form-label fw-bold small text-muted">DESCRIPCIÓN TRABAJO</label>
                                                <textarea className="form-control flex-grow-1" style={{minHeight: '120px'}}
                                                    value={observacion} onChange={e => setObservacion(e.target.value)}
                                                    placeholder="Describa el problema o requerimiento detalladamente..."></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BUSCADOR DE INSUMOS */}
                            {(!otEditar || otEditar.estado === 'Pendiente') && (
                                <div className="mb-3 position-relative" ref={wrapperRef}>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                                        <input type="text" className="form-control" placeholder="Buscar repuesto para agregar..."
                                            value={busqueda} onChange={e => { setBusqueda(e.target.value); setMostrarLista(true); }} onFocus={() => setMostrarLista(true)} />
                                    </div>
                                    {mostrarLista && busqueda && (
                                        <ul className="list-group position-absolute w-100 shadow mt-1" style={{ zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                                            {insumosFiltrados.map(ins => (
                                                <li key={ins.id} className="list-group-item list-group-item-action cursor-pointer d-flex justify-content-between" onClick={() => agregarItem(ins)}>
                                                    <span>{ins.nombre} <small className="text-muted">({ins.codigo_sku})</small></span>
                                                    <span className="badge bg-secondary">Stock: {ins.stock_actual}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {/* TABLA DE INSUMOS */}
                            <div className="table-responsive bg-white border rounded shadow-sm">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Insumo Requerido</th>
                                            <th style={{ width: '100px' }} className="text-center">Cant.</th>
                                            <th>Estado / Trazabilidad</th>
                                            <th style={{ width: '50px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div className="fw-bold text-dark">{item.nombre}</div>
                                                    <small className="text-muted font-monospace">{item.codigo_sku}</small>
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm text-center fw-bold"
                                                        value={item.cantidad}
                                                        onChange={e => actualizarCantidad(idx, e.target.value)}
                                                        disabled={item.estado_linea && item.estado_linea !== 'NUEVO'}
                                                    />
                                                </td>
                                                <td>
                                                    {item.estado_linea === 'ENTREGADO' ? (
                                                        <div className="alert alert-success py-1 px-2 mb-0 d-inline-block small border-success bg-opacity-10">
                                                            <i className="bi bi-check-circle-fill me-1"></i>
                                                            <strong>Entregado a:</strong> {item.retirado_por || 'Sin registro'} <br />
                                                            <span className="text-muted ms-3">{item.fecha_retiro}</span>
                                                        </div>
                                                    ) : item.estado_linea === 'EN_BODEGA' ? (
                                                        <div className="d-flex align-items-center">
                                                            <span className="badge bg-warning text-dark border border-warning me-2">
                                                                <i className="bi bi-box-seam me-1"></i>En Bodega
                                                            </span>
                                                            {item.oc_id && (
                                                                <small className="text-primary ms-2" title={`Llegó de la OC #${item.oc_id}`}>
                                                                    (Viene de Compra)
                                                                </small>
                                                            )}
                                                        </div>
                                                    ) : item.estado_linea === 'COMPRADO' ? (
                                                        <div className="alert alert-info py-1 px-2 mb-0 d-inline-block small border-info bg-opacity-10">
                                                            <i className="bi bi-cart-check-fill me-1"></i>
                                                            <strong>Comprado:</strong> OC #{item.oc_id} <br />
                                                            <span className="text-muted ms-3">Prov: {item.oc_proveedor}</span>
                                                        </div>
                                                    ) : item.estado_linea === 'REQUIERE_COMPRA' ? (
                                                        <span className="badge bg-danger">
                                                            <i className="bi bi-exclamation-circle me-1"></i>Requiere Compra
                                                        </span>
                                                    ) : (
                                                        parseFloat(item.stock_actual) >= parseFloat(item.cantidad) ?
                                                            <span className="badge bg-secondary bg-opacity-25 text-dark border">Stock Disponible</span> :
                                                            <span className="badge bg-danger bg-opacity-25 text-danger border border-danger">Falta Stock</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {(!item.estado_linea || item.estado_linea === 'NUEVO') && (
                                                        <button className="btn btn-sm text-danger" onClick={() => eliminarItem(idx)}><i className="bi bi-trash"></i></button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {items.length === 0 && <tr><td colSpan="4" className="text-center text-muted py-4">No hay insumos agregados</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="modal-footer bg-white">
                            <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                            {(!otEditar || otEditar.estado === 'Pendiente') && (
                                <button className="btn btn-warning fw-bold px-4 shadow-sm" onClick={preSubmit} disabled={loading}>
                                    {loading ? '...' : (otEditar ? 'Actualizar OT' : 'Generar OT')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default NuevaSolicitudModal;