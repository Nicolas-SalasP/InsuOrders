import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';
import ConfirmModal from './ConfirmModal';

const NuevaSolicitudModal = ({ show, onClose, onSave, otEditar }) => {
    // --- ESTADOS DE DATOS MAESTROS ---
    const [activos, setActivos] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [centrosCosto, setCentrosCosto] = useState([]);
    const [personal, setPersonal] = useState([]); // Todos (para solicitante)
    const [tecnicos, setTecnicos] = useState([]); // Solo Técnicos (para asignar)

    // --- ESTADOS DEL FORMULARIO ---
    const [modo, setModo] = useState('maquina');
    const [activoId, setActivoId] = useState('');
    const [solicitanteExterno, setSolicitanteExterno] = useState('');
    const [centroCostoOT, setCentroCostoOT] = useState('');
    const [observacion, setObservacion] = useState('');
    const [items, setItems] = useState([]);
    
    // --- ESTADO MULTI-ASIGNACIÓN ---
    const [asignados, setAsignados] = useState([]); 
    const [showDropdownAsignados, setShowDropdownAsignados] = useState(false);
    const dropdownRef = useRef(null);

    // --- UI / BÚSQUEDA ---
    const [busqueda, setBusqueda] = useState('');
    const [mostrarLista, setMostrarLista] = useState(false);
    const wrapperRef = useRef(null);
    const [loading, setLoading] = useState(false);

    // --- MODALES AUXILIARES ---
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', action: null });

    const esEditable = (estado) => {
        if (!otEditar) return true;
        const estadosBloqueados = ['Anulada', 'Completada', 'Cerrada'];
        return !estadosBloqueados.includes(estado);
    };

    const editable = esEditable(otEditar?.estado);

    useEffect(() => {
        if (show) cargarDatosMaestros();
    }, [show, otEditar]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setMostrarLista(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdownAsignados(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef, dropdownRef]);

    const cargarDatosMaestros = async () => {
        try {
            setItems([]);
            setLoading(true);

            const [resActivos, resInsumos, resCC, resPersonal] = await Promise.all([
                api.get('/index.php/mantencion/activos'),
                api.get('/index.php/inventario'),
                api.get('/index.php/mantencion/centros-costo'),
                api.get('/index.php/personal') 
            ]);

            setActivos(resActivos.data.data || []);
            setInsumos(resInsumos.data.data || []);
            setCentrosCosto(resCC.data.success ? resCC.data.data : []);
            
            const listaEmpleados = resPersonal.data.success ? resPersonal.data.data : [];
            setPersonal(listaEmpleados); 
            const soloTecnicos = listaEmpleados.filter(e => {
                if (!e.usuario_id) return false;
                if (!e.cargo || e.cargo.trim() === '') return false;
                const cargoNorm = e.cargo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                const keywords = [
                    'tecn',      // Técnico, Tecnologo
                    'mant',      // Mantención, Mantenimiento
                    'mecan',     // Mecánico
                    'elec',      // Eléctrico, Electricista
                    'sold',      // Soldador
                    'instru',    // Instrumentista
                    'oper',      // Operario
                    'ayud',      // Ayudante
                    'capataz',   
                    'lider',     
                    'jefe'       
                ];

                return keywords.some(k => cargoNorm.includes(k));
            });
            
            console.log("Técnicos filtrados (Estricto):", soloTecnicos);
            setTecnicos(soloTecnicos);

            if (otEditar) {
                cargarDatosEdicion();
            } else {
                resetearFormulario();
            }
        } catch (e) {
            console.error("Error cargando maestros:", e);
            setMsgModal({ show: true, title: "Error", message: "No se pudieron cargar los datos.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const resetearFormulario = () => {
        setModo('maquina');
        setActivoId('');
        setObservacion('');
        setBusqueda('');
        setSolicitanteExterno('');
        setCentroCostoOT('');
        setAsignados([]); 
        setItems([]);
    };

    const cargarDatosEdicion = async () => {
        try {
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
            if (otEditar.asignados_ids) {
                const ids = String(otEditar.asignados_ids).split(',').map(Number);
                setAsignados(ids);
            } else {
                setAsignados([]);
            }

            const resDetalles = await api.get(`/index.php/mantencion?detalle=true&id=${otEditar.id}`);

            if (resDetalles.data.success) {
                const listaItems = resDetalles.data.data.items || [];
                const itemsMapeados = listaItems.map(d => ({
                    id_producto: d.insumo_id || d.id,
                    id_linea: d.detalle_id || d.id,
                    nombre: d.nombre,
                    codigo_sku: d.codigo_sku,
                    stock_actual: parseFloat(d.stock_actual || 0),
                    unidad_medida: d.unidad_medida,
                    cantidad: parseFloat(d.cantidad || 0),
                    oc_id: d.oc_id,
                    oc_proveedor: d.oc_proveedor,
                    estado_linea: d.estado_linea || 'PENDIENTE',
                    retirado_por: d.retirado_por,
                    fecha_retiro: d.fecha_retiro
                }));
                setItems(itemsMapeados);
            }
        } catch (error) {
            console.error("Error cargando detalle OT:", error);
        }
    };

    const toggleTecnico = (empleado) => {
        const uid = empleado.usuario_id ? parseInt(empleado.usuario_id) : parseInt(empleado.id);

        setAsignados(prev => {
            if (prev.includes(uid)) return prev.filter(id => id !== uid);
            return [...prev, uid];
        });
    };

    const getNombresAsignados = () => {
        if (asignados.length === 0) return "Sin asignar";
        
        const nombres = tecnicos
            .filter(t => {
                const uid = t.usuario_id ? parseInt(t.usuario_id) : parseInt(t.id);
                return asignados.includes(uid);
            })
            .map(t => {
                const nombreFull = t.nombre_completo || t.nombre || '';
                const partes = nombreFull.split(' ');
                if (partes.length >= 2) return `${partes[0]} ${partes[2] || partes[1]}`; 
                return nombreFull;
            });
            
        return nombres.join(', ');
    };

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
                        message: `Esta máquina tiene un kit con ${res.data.data.length} insumos. ¿Deseas cargarlos?`,
                        action: () => {
                            const kitItems = res.data.data.map(k => ({
                                id_producto: k.insumo_id || k.id,
                                id_linea: null,
                                nombre: k.nombre_insumo || k.nombre,
                                codigo_sku: k.codigo_sku,
                                stock_actual: parseFloat(k.stock_actual || 0),
                                unidad_medida: k.unidad_medida,
                                cantidad: parseFloat(k.cantidad || 1),
                                estado_linea: 'NUEVO'
                            }));
                            setItems(kitItems);
                            setConfirmModal({ show: false });
                        }
                    });
                } else {
                    setItems([]);
                }
            } catch (e) {
                setItems([]);
            }
        }
    };

    const agregarItem = (insumo, e) => {
        if (e) e.preventDefault();
        const yaExiste = items.some(i => String(i.id_producto) === String(insumo.id));
        if (yaExiste) {
            setMsgModal({ show: true, title: "Duplicado", message: "Este insumo ya está en la lista.", type: "warning" });
            setBusqueda('');
            setMostrarLista(false);
            return;
        }

        const nuevoItem = {
            id_producto: insumo.id,
            id_linea: null,
            nombre: insumo.nombre,
            codigo_sku: insumo.codigo_sku,
            stock_actual: parseFloat(insumo.stock_actual || 0),
            unidad_medida: insumo.unidad_medida,
            cantidad: 1,
            estado_linea: 'NUEVO'
        };

        setItems(prev => [...prev, nuevoItem]);
        setBusqueda('');
        setMostrarLista(false);
    };

    const actualizarCantidad = (idx, val) => {
        const copia = [...items];
        let valor = parseFloat(val);
        if (isNaN(valor) || valor < 0) valor = 0;
        copia[idx].cantidad = valor;
        setItems(copia);
    };

    const eliminarItem = (idx) => {
        setItems(items.filter((_, i) => i !== idx));
    };

    const preSubmit = () => {
        if (modo === 'maquina' && !activoId) {
            return setMsgModal({ show: true, title: "Faltan Datos", message: "Por favor seleccione una máquina o activo.", type: "warning" });
        }
        if (modo === 'servicio' && (!centroCostoOT || !solicitanteExterno)) {
            return setMsgModal({ show: true, title: "Faltan Datos", message: "Debe indicar el Solicitante y el Centro de Costo.", type: "warning" });
        }
        if (items.length === 0 && !observacion.trim()) {
            return setMsgModal({ show: true, title: "OT Vacía", message: "Debe agregar una descripción o al menos un insumo.", type: "warning" });
        }

        const itemsConStock = items.filter(i => (i.estado_linea === 'NUEVO' || i.estado_linea === 'PENDIENTE') && i.stock_actual >= i.cantidad && i.cantidad > 0);

        if (!otEditar && itemsConStock.length > 0) {
            setConfirmModal({
                show: true,
                type: "info",
                title: "Confirmar Creación",
                message: `Se generará la OT y se reservarán ${itemsConStock.length} insumos de bodega.\n¿Continuar?`,
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
            const itemsFormateados = items.map(i => ({
                id_linea: i.id_linea || null,
                insumo_id: i.id_producto,
                cantidad: parseFloat(i.cantidad)
            }));

            const payload = {
                id: otEditar ? otEditar.id : null,
                activo_id: modo === 'maquina' ? activoId : null,
                observacion: observacion,
                items: itemsFormateados,
                solicitante_externo: modo === 'servicio' ? solicitanteExterno : null,
                area_negocio: null,
                centro_costo_ot: modo === 'servicio' ? centroCostoOT : null,
                origen_tipo: modo === 'maquina' ? 'Interna' : 'Servicio',
                asignados: asignados
            };

            if (otEditar) {
                await api.put(`/index.php/mantencion?id=${otEditar.id}`, payload);
                setMsgModal({ show: true, title: "Actualizado", message: "OT actualizada correctamente.", type: "success" });
            } else {
                await api.post('/index.php/mantencion', payload);
                setMsgModal({ show: true, title: "Creado", message: "OT generada exitosamente.", type: "success" });
            }

            setTimeout(() => {
                setMsgModal({ ...msgModal, show: false });
                onSave();
                onClose();
            }, 1500);

        } catch (error) {
            console.error("Error en petición:", error);
            const errorMsg = error.response?.data?.message || "Error al procesar.";
            setMsgModal({ show: true, title: "Error", message: errorMsg, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const insumosFiltrados = busqueda
        ? insumos.filter(i =>
            i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (i.codigo_sku && i.codigo_sku.includes(busqueda))
        ).slice(0, 10)
        : [];

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
            <ConfirmModal
                show={confirmModal.show}
                onClose={() => setConfirmModal({ ...confirmModal, show: false })}
                onConfirm={confirmModal.action}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type || 'primary'}
                confirmText="Sí, Proceder"
            />

            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto', zIndex: 1050 }}>
                <div className="modal-dialog modal-xl">
                    <div className="modal-content shadow-lg border-0">

                        <div className="modal-header bg-warning text-dark border-bottom border-warning">
                            <h5 className="modal-title fw-bold">
                                {otEditar ? `✏️ Detalle OT #${otEditar.id}` : '🛠️ Nueva Orden de Trabajo'}
                            </h5>
                            <button className="btn-close" onClick={onClose} disabled={loading}></button>
                        </div>

                        <div className="modal-body bg-light p-4">

                            {!otEditar && (
                                <div className="d-flex justify-content-center mb-4">
                                    <div className="btn-group shadow-sm" role="group">
                                        <button type="button"
                                            className={`btn fw-bold px-4 ${modo === 'maquina' ? 'btn-primary' : 'btn-outline-primary bg-white'}`}
                                            onClick={() => { setModo('maquina'); setActivoId(''); setItems([]); }}>
                                            <i className="bi bi-gear-fill me-2"></i>Maquinaria
                                        </button>
                                        <button type="button"
                                            className={`btn fw-bold px-4 ${modo === 'servicio' ? 'btn-success' : 'btn-outline-success bg-white'}`}
                                            onClick={() => { setModo('servicio'); setActivoId(''); setItems([]); }}>
                                            <i className="bi bi-people-fill me-2"></i>Servicio / Área
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            {/* SELECTOR DE MÁQUINA / SERVICIO */}
                                            {modo === 'maquina' ? (
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold small text-muted text-uppercase">Máquina / Activo</label>
                                                    <select className="form-select border-primary shadow-sm"
                                                        value={activoId}
                                                        onChange={handleActivoChange}
                                                        disabled={!!otEditar}
                                                    >
                                                        <option value="">-- Seleccione Máquina --</option>
                                                        {activos.map(a => (
                                                            <option key={a.id} value={a.id}>{a.nombre} [{a.codigo_interno}]</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="bg-white p-3 rounded border border-success mb-3 shadow-sm">
                                                    <h6 className="text-success fw-bold border-bottom pb-2 mb-3"><i className="bi bi-person-badge me-2"></i>Datos del Servicio</h6>
                                                    <div className="mb-3">
                                                        <label className="form-label small text-muted">Solicitante</label>
                                                        <select className="form-select" value={solicitanteExterno} onChange={e => setSolicitanteExterno(e.target.value)} disabled={!!otEditar}>
                                                            <option value="">Seleccione Solicitante...</option>
                                                            {personal.map(p => (
                                                                <option key={p.id} value={p.nombre_completo}>
                                                                    {p.nombre_completo}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-2">
                                                        <label className="form-label small text-muted">Centro de Costo</label>
                                                        <select className="form-select fw-bold" value={centroCostoOT} onChange={e => setCentroCostoOT(e.target.value)} disabled={!!otEditar}>
                                                            <option value="">Seleccione Centro...</option>
                                                            {centrosCosto.map(cc => (
                                                                <option key={cc.id} value={cc.codigo}>{cc.codigo} - {cc.nombre}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ASIGNACIÓN MÚLTIPLE DE TÉCNICOS */}
                                            <div className="mb-2" ref={dropdownRef}>
                                                <label className="form-label fw-bold small text-primary text-uppercase">Asignar Técnicos (Multi-Selección)</label>
                                                <div className="dropdown w-100">
                                                    <button 
                                                        className="form-select text-start d-flex justify-content-between align-items-center border-info shadow-sm" 
                                                        type="button"
                                                        onClick={() => setShowDropdownAsignados(!showDropdownAsignados)}
                                                        disabled={!editable}
                                                    >
                                                        <span className="text-truncate" style={{maxWidth: '90%'}}>
                                                            {getNombresAsignados()}
                                                        </span>
                                                        <i className="bi bi-chevron-down small"></i>
                                                    </button>
                                                    
                                                    {showDropdownAsignados && (
                                                        <div className="dropdown-menu show w-100 p-2 shadow border-info" style={{maxHeight: '250px', overflowY: 'auto'}}>
                                                            {tecnicos.length > 0 ? tecnicos.map(t => {
                                                                const uid = t.usuario_id ? parseInt(t.usuario_id) : parseInt(t.id);
                                                                return (
                                                                    <div key={uid} className="form-check py-1 px-3 hover-bg-light rounded cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleTecnico(t); }}>
                                                                        <input 
                                                                            className="form-check-input cursor-pointer" 
                                                                            type="checkbox" 
                                                                            id={`tec-${uid}`}
                                                                            checked={asignados.includes(uid)}
                                                                            onChange={() => {}} 
                                                                        />
                                                                        <label className="form-check-label w-100 cursor-pointer user-select-none" htmlFor={`tec-${uid}`}>
                                                                            {t.nombre_completo} <small className="text-muted ms-1">({t.cargo})</small>
                                                                        </label>
                                                                    </div>
                                                                );
                                                            }) : <div className="text-muted small p-2 text-center">No se encontraron técnicos con cargo válido.</div>}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="form-text small text-end">
                                                    {asignados.length} técnico(s) asignado(s).
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="h-100 d-flex flex-column">
                                                <label className="form-label fw-bold small text-muted text-uppercase">Descripción del Trabajo</label>
                                                <textarea className="form-control flex-grow-1 shadow-sm" style={{ minHeight: '120px' }}
                                                    value={observacion} onChange={e => setObservacion(e.target.value)}
                                                    placeholder="Describa el problema o requerimiento detalladamente..."
                                                    disabled={!editable}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN DE INSUMOS (SIN CAMBIOS) */}
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-0">
                                    {editable && (
                                        <div className="p-3 border-bottom position-relative" ref={wrapperRef}>
                                            <div className="input-group shadow-sm">
                                                <span className="input-group-text bg-white text-primary border-end-0"><i className="bi bi-search"></i></span>
                                                <input type="text" className="form-control border-start-0" placeholder="Escriba para buscar repuestos..."
                                                    value={busqueda}
                                                    onChange={e => { setBusqueda(e.target.value); setMostrarLista(true); }}
                                                    onFocus={() => setMostrarLista(true)}
                                                />
                                            </div>
                                            {mostrarLista && busqueda && (
                                                <ul className="list-group position-absolute w-100 shadow mt-1 start-0" style={{ zIndex: 2000, maxHeight: '250px', overflowY: 'auto' }}>
                                                    {insumosFiltrados.length > 0 ? insumosFiltrados.map(ins => (
                                                        <li key={ins.id}
                                                            className="list-group-item list-group-item-action cursor-pointer d-flex justify-content-between align-items-center p-3"
                                                            onMouseDown={(e) => agregarItem(ins, e)}
                                                        >
                                                            <div>
                                                                <div className="fw-bold text-dark">{ins.nombre}</div>
                                                                <small className="text-muted">{ins.codigo_sku}</small>
                                                            </div>
                                                            <span className={`badge rounded-pill ${parseFloat(ins.stock_actual) > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                                Stock: {ins.stock_actual}
                                                            </span>
                                                        </li>
                                                    )) : (
                                                        <li className="list-group-item text-center text-muted p-3">No se encontraron resultados</li>
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    )}

                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-light text-secondary small text-uppercase">
                                                <tr>
                                                    <th className="py-3 ps-4">Insumo Requerido</th>
                                                    <th className="text-center py-3" style={{ width: '100px' }}>Cant.</th>
                                                    <th className="py-3">Estado / Trazabilidad</th>
                                                    <th className="py-3" style={{ width: '50px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.length > 0 ? items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="ps-4">
                                                            <div className="fw-bold text-dark">{item.nombre}</div>
                                                            <small className="text-muted font-monospace">{item.codigo_sku}</small>
                                                            {item.unidad_medida && <span className="badge bg-light text-dark border ms-2">{item.unidad_medida}</span>}
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                min="0.1"
                                                                step="any"
                                                                className="form-control form-control-sm text-center fw-bold border-secondary"
                                                                value={item.cantidad}
                                                                onChange={e => actualizarCantidad(idx, e.target.value)}
                                                                disabled={!editable || ['ENTREGADO', 'COMPRADO'].includes(item.estado_linea)}
                                                            />
                                                        </td>
                                                        <td>
                                                            {item.estado_linea === 'ENTREGADO' ? (
                                                                <div className="alert alert-success py-1 px-2 mb-0 d-inline-block small border-success bg-opacity-10">
                                                                    <i className="bi bi-check-circle-fill me-1"></i>
                                                                    <strong>Entregado a:</strong> {item.retirado_por || 'S/Inf'} <br />
                                                                    <span className="text-muted ms-3">{item.fecha_retiro}</span>
                                                                </div>
                                                            ) : item.estado_linea === 'EN_BODEGA' ? (
                                                                <div className="d-flex align-items-center">
                                                                    <span className="badge bg-warning text-dark border border-warning me-2 shadow-sm">
                                                                        <i className="bi bi-box-seam me-1"></i>En Bodega
                                                                    </span>
                                                                    {item.oc_id && (
                                                                        <small className="text-primary" title={`Llegó de la OC #${item.oc_id}`}>
                                                                            (De OC #{item.oc_id})
                                                                        </small>
                                                                    )}
                                                                </div>
                                                            ) : item.estado_linea === 'COMPRADO' ? (
                                                                <div className="alert alert-info py-1 px-2 mb-0 d-inline-block small border-info bg-opacity-10">
                                                                    <i className="bi bi-cart-check-fill me-1"></i>
                                                                    <strong>Comprado:</strong> OC #{item.oc_id}
                                                                </div>
                                                            ) : item.estado_linea === 'REQUIERE_COMPRA' ? (
                                                                <span className="badge bg-danger shadow-sm">
                                                                    <i className="bi bi-exclamation-circle me-1"></i>Requiere Compra
                                                                </span>
                                                            ) : (
                                                                item.stock_actual >= item.cantidad ?
                                                                    <span className="badge bg-white text-success border border-success shadow-sm">
                                                                        <i className="bi bi-check me-1"></i>Stock Disponible ({item.stock_actual})
                                                                    </span> :
                                                                    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger shadow-sm">
                                                                        <i className="bi bi-x-circle me-1"></i>Falta Stock (Hay {item.stock_actual})
                                                                    </span>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            {editable && !['ENTREGADO', 'COMPRADO'].includes(item.estado_linea) && (
                                                                <button className="btn btn-sm text-danger hover-bg-light" onClick={() => eliminarItem(idx)} title="Quitar ítem">
                                                                    <i className="bi bi-trash-fill"></i>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-5 text-muted">
                                                            <i className="bi bi-tools display-6 mb-3 d-block text-secondary opacity-25"></i>
                                                            No se han agregado insumos o repuestos.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="modal-footer bg-white border-top-0 py-3">
                            <button className="btn btn-secondary px-4" onClick={onClose} disabled={loading}>Cerrar</button>

                            {editable && (
                                <button className="btn btn-warning fw-bold px-4 shadow-sm d-flex align-items-center" onClick={preSubmit} disabled={loading}>
                                    {loading ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span> Guardando...</>
                                    ) : (
                                        otEditar ? <><i className="bi bi-save me-2"></i>Guardar Cambios</> : <><i className="bi bi-check-lg me-2"></i>Generar Solicitud</>
                                    )}
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