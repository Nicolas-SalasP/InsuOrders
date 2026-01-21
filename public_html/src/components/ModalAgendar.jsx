import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2';

const ModalAgendar = ({ show, onClose, onSave, initialDate, eventData, mode, readOnly = false }) => {
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        fecha_programada: initialDate || '',
        activo_id: '',
        color: mode === 'COMPRA' ? '#198754' : '#0d6efd', // Verde si es compra, Azul si es mantención
        icono: mode === 'COMPRA' ? 'bi-cart-fill' : 'bi-tools',
        tipo_evento: mode // 'MANTENCION' o 'COMPRA'
    });
    
    const [items, setItems] = useState([]);
    const [activos, setActivos] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    // Helper para saber si estamos en modo compra
    const isCompra = formData.tipo_evento === 'COMPRA';

    const listaIconos = [
        { icon: 'bi-tools', label: 'Herramienta' },
        { icon: 'bi-cart-fill', label: 'Compra' }, // Agregado para compras
        { icon: 'bi-oil-can', label: 'Aceite' },
        { icon: 'bi-shield-check', label: 'Seguridad' },
        { icon: 'bi-lightning-charge', label: 'Energía' },
        { icon: 'bi-gear-wide-connected', label: 'Engranaje' },
        { icon: 'bi-truck', label: 'Transporte' },
        { icon: 'bi-droplet-half', label: 'Fluido' },
        { icon: 'bi-thermometer-half', label: 'Temperatura' }
    ];

    useEffect(() => {
        if (show) {
            api.get('/index.php/mantencion/activos').then(res => setActivos(res.data.data || []));
            api.get('/index.php/inventario').then(res => setInsumos(res.data.data || []));

            if (eventData?.id) {
                api.get(`/index.php/cronograma?id=${eventData.id}`)
                    .then(res => {
                        if (res.data.success) {
                            const data = res.data.data;
                            setFormData(prev => ({
                                ...prev,
                                titulo: data.titulo,
                                descripcion: data.descripcion,
                                fecha_programada: data.fecha_programada,
                                activo_id: data.activo_id,
                                color: data.color || (data.tipo_evento === 'COMPRA' ? '#198754' : '#0d6efd'),
                                icono: data.icono || (data.tipo_evento === 'COMPRA' ? 'bi-cart-fill' : 'bi-tools'),
                                tipo_evento: data.tipo_evento
                            }));

                            if (data.items) {
                                const loadedItems = data.items.map(i => ({
                                    insumo_id: i.insumo_id || i.id,
                                    nombre: i.nombre,
                                    codigo_sku: i.codigo_sku,
                                    cantidad: Math.floor(i.cantidad),
                                    stock_actual: Math.floor(i.stock_actual)
                                }));
                                setItems(loadedItems);
                            }
                        }
                    })
                    .catch(e => console.error("Error cargando detalles del evento", e));
            }
            else if (eventData) {
                // Caso: Click en fecha vacía (Nuevo)
                setFormData({ 
                    ...formData, 
                    ...eventData,
                    tipo_evento: mode,
                    color: mode === 'COMPRA' ? '#198754' : '#0d6efd',
                    icono: mode === 'COMPRA' ? 'bi-cart-fill' : 'bi-tools'
                });
                setItems(eventData.items || []);
            }
        }
    }, [show, eventData, mode]);

    const cargarKitActivo = async (activoId) => {
        if (!activoId || readOnly || isCompra) return; // Si es compra no cargamos kit de mantención
        try {
            const res = await api.get(`/index.php/mantencion/kit?id=${activoId}`);
            if (res.data.success && res.data.data.length > 0) {
                const kitItems = res.data.data.map(i => ({
                    insumo_id: i.id,
                    nombre: i.nombre,
                    codigo_sku: i.codigo_sku,
                    cantidad: Math.floor(i.cantidad),
                    stock_actual: i.stock_actual
                }));
                setItems(kitItems);
            }
        } catch (e) { console.error("Error al cargar kit", e); }
    };

    const handleAddInsumo = (insumo) => {
        if (readOnly) return;
        if (items.find(i => i.insumo_id === insumo.id)) return;
        setItems([...items, {
            insumo_id: insumo.id,
            nombre: insumo.nombre,
            codigo_sku: insumo.codigo_sku,
            cantidad: 1,
            stock_actual: insumo.stock_actual
        }]);
        setBusqueda('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (readOnly) return;

        try {
            const payload = { ...formData, items };
            if (eventData?.id) {
                await api.put('/index.php/cronograma', { ...payload, id: eventData.id });
            } else {
                await api.post('/index.php/cronograma', payload);
            }
            onSave();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'No se pudo procesar la solicitud', 'error');
        }
    };

    const handleDelete = async () => {
        if (readOnly) return;

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará el evento y se anulará la Orden asociada.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/index.php/cronograma?id=${eventData.id}`);
                Swal.fire('Eliminado', 'La tarea ha sido eliminada.', 'success');
                onSave();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el evento', 'error');
            }
        }
    };

    if (!show) return null;

    const activoSelect = activos.find(a => a.id == formData.activo_id);

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060, overflowY: 'auto' }}>
            <div className="modal-dialog modal-lg shadow-lg my-4">
                <form className="modal-content border-0 rounded-4 overflow-hidden" onSubmit={handleSubmit}>

                    {/* CABECERA DINÁMICA (Mantención = Dark / Compra = Success) */}
                    <div className={`p-3 text-white border-bottom border-secondary ${readOnly ? 'bg-secondary' : (isCompra ? 'bg-success' : 'bg-dark')}`}>
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 className="fw-bold mb-1 text-white">
                                    {readOnly 
                                        ? '👁️ Detalle de Actividad' 
                                        : (eventData?.id 
                                            ? (isCompra ? 'Editar Compra Programada' : 'Editar Mantención') 
                                            : (isCompra ? 'Programar Compra' : 'Nueva Mantención')
                                        )
                                    }
                                </h5>
                                <div className="d-flex gap-2 flex-wrap align-items-center">
                                    {/* Fecha */}
                                    <span className={`badge rounded-pill fw-normal ${isCompra ? 'bg-black bg-opacity-25' : 'bg-primary'}`}>
                                        <i className="bi bi-calendar3 me-1"></i>{formData.fecha_programada}
                                    </span>
                                    
                                    {/* Código Activo */}
                                    {activoSelect && (
                                        <span className="badge bg-light text-dark rounded-pill fw-normal">
                                            {activoSelect.codigo_interno}
                                        </span>
                                    )}

                                    {/* --- NUEVO: OT (Solo si existe y NO es compra) --- */}
                                    {eventData?.solicitud_ot_id && !isCompra && (
                                        <span className="badge bg-warning text-dark rounded-pill fw-normal border border-warning">
                                            OT #{eventData.solicitud_ot_id}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                    </div>

                    <div className="modal-body p-3 p-md-4 bg-white">
                        
                        {readOnly && (
                            <div className="alert alert-warning border-0 bg-warning bg-opacity-10 d-flex align-items-center mb-4">
                                <i className="bi bi-lock-fill fs-4 me-3 text-warning"></i>
                                <div>
                                    <strong className="text-warning-emphasis">Modo Consulta</strong>
                                    <div className="small text-muted">Evento finalizado o pasado. No editable.</div>
                                </div>
                            </div>
                        )}

                        <div className="row g-3">
                            <div className="col-12 col-md-7">
                                <label className="form-label fw-bold text-dark small">TÍTULO DE LA ACTIVIDAD</label>
                                <input type="text" className="form-control fw-semibold" required
                                    value={formData.titulo} 
                                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                    placeholder={isCompra ? "Ej: Compra de Repuestos Trimestral" : "Ej: Mantenimiento Preventivo"}
                                    disabled={readOnly}
                                />
                            </div>

                            <div className="col-12 col-md-5">
                                <label className="form-label fw-bold text-dark small">ICONO VISUAL</label>
                                <div className={`d-flex flex-wrap gap-1 p-2 border rounded ${readOnly ? 'bg-light' : 'bg-light'}`} style={{ minHeight: '38px' }}>
                                    {listaIconos.map((obj) => (
                                        <button
                                            key={obj.icon}
                                            type="button"
                                            title={obj.label}
                                            className={`btn btn-sm d-flex align-items-center justify-content-center ${formData.icono === obj.icon ? (isCompra ? 'btn-success' : 'btn-primary') : 'btn-white border'}`}
                                            style={{ width: '32px', height: '32px' }}
                                            onClick={() => !readOnly && setFormData({ ...formData, icono: obj.icon })}
                                            disabled={readOnly}
                                        >
                                            <i className={`bi ${obj.icon}`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label fw-bold text-dark small">
                                    {isCompra ? 'ASOCIAR A ACTIVO (Opcional)' : 'ASIGNAR A MAQUINARIA'}
                                </label>
                                <select className="form-select" 
                                    required={!isCompra} // Obligatorio solo en Mantención
                                    value={formData.activo_id}
                                    onChange={e => { setFormData({ ...formData, activo_id: e.target.value }); cargarKitActivo(e.target.value); }}
                                    disabled={readOnly}
                                >
                                    <option value="">{isCompra ? '-- Ninguno (Compra General) --' : 'Seleccione un activo...'}</option>
                                    {activos.map(a => <option key={a.id} value={a.id}>{a.codigo_interno} - {a.nombre}</option>)}
                                </select>
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label fw-bold text-dark small">COLOR EN CALENDARIO</label>
                                <div className="input-group">
                                    <input type="color" className="form-control form-control-color"
                                        style={{ maxWidth: '50px' }}
                                        value={formData.color} 
                                        onChange={e => setFormData({ ...formData, color: e.target.value })} 
                                        disabled={readOnly}
                                    />
                                    <input type="text" className="form-control font-monospace"
                                        value={formData.color.toUpperCase()}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        maxLength="7" 
                                        disabled={readOnly}
                                    />
                                </div>
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-bold text-dark small">DESCRIPCIÓN / OBSERVACIONES</label>
                                <textarea className="form-control" rows="2"
                                    value={formData.descripcion} 
                                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                    placeholder="Detalles adicionales..."
                                    disabled={readOnly}
                                ></textarea>
                            </div>

                            <div className="col-12 mt-3">
                                <div className="p-3 rounded border bg-light">
                                    <label className={`fw-bold small mb-2 d-block ${isCompra ? 'text-success' : 'text-primary'}`}>
                                        <i className={`bi ${isCompra ? 'bi-cart-plus-fill' : 'bi-box-seam-fill'} me-2`}></i>
                                        {isCompra ? 'LISTA DE PRODUCTOS A COMPRAR' : 'INSUMOS REQUERIDOS (KIT)'}
                                    </label>

                                    {!readOnly && (
                                        <div className="position-relative">
                                            <div className="input-group mb-2">
                                                <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                                                <input type="text" className="form-control"
                                                    placeholder="Buscar SKU o Nombre..."
                                                    value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                                            </div>

                                            {busqueda && (
                                                <div className="list-group shadow position-absolute w-100" style={{ zIndex: 1050, top: '100%' }}>
                                                    {insumos.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase()) || i.codigo_sku?.toLowerCase().includes(busqueda.toLowerCase())).slice(0, 5).map(i => (
                                                        <button key={i.id} type="button" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onClick={() => handleAddInsumo(i)}>
                                                            <span className="small"><strong>{i.codigo_sku}</strong> - {i.nombre}</span>
                                                            <span className={`badge ${i.stock_actual > 0 ? 'bg-success' : 'bg-danger'}`}>{Math.floor(i.stock_actual)}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="table-responsive bg-white border rounded">
                                        <table className="table table-sm align-middle mb-0">
                                            <thead className="table-light small">
                                                <tr>
                                                    <th className="ps-2">SKU</th>
                                                    <th>Ítem</th>
                                                    <th className="text-center">Cant.</th>
                                                    <th>Stock Actual</th>
                                                    {!readOnly && <th></th>}
                                                </tr>
                                            </thead>
                                            <tbody className="small">
                                                {items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="ps-2 font-monospace fw-bold">{item.codigo_sku}</td>
                                                        <td>{item.nombre}</td>
                                                        <td style={{ width: '70px' }}>
                                                            <input type="number" className="form-control form-control-sm text-center p-0"
                                                                value={item.cantidad} 
                                                                onChange={e => {
                                                                    const n = [...items]; n[idx].cantidad = Math.floor(e.target.value); setItems(n);
                                                                }} 
                                                                disabled={readOnly}
                                                            />
                                                        </td>
                                                        <td>
                                                            {item.stock_actual >= item.cantidad ?
                                                                <span className="text-success fw-bold"><i className="bi bi-check-circle me-1"></i>{item.stock_actual}</span> :
                                                                <span className="badge bg-danger">Stock: {item.stock_actual}</span>
                                                            }
                                                        </td>
                                                        {!readOnly && (
                                                            <td className="text-end pe-2">
                                                                <button type="button" className="btn btn-link text-danger p-0" onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                                                                    <i className="bi bi-trash-fill"></i>
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                                {items.length === 0 && (
                                                    <tr>
                                                        <td colSpan={readOnly ? 4 : 5} className="text-center py-3 text-muted fst-italic">
                                                            {isCompra ? 'Agregue productos a la lista de compra.' : 'Sin insumos asignados.'}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer border-0 p-3 bg-light d-flex justify-content-between align-items-center">
                        <div>
                            {!readOnly && eventData?.id && (
                                <button type="button" className="btn btn-outline-danger btn-sm fw-bold rounded-pill px-3" onClick={handleDelete}>
                                    <i className="bi bi-trash me-1"></i>ELIMINAR
                                </button>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
                                {readOnly ? 'Cerrar' : 'Cancelar'}
                            </button>
                            {!readOnly && (
                                <button type="submit" className={`btn rounded-pill px-4 fw-bold shadow-sm ${isCompra ? 'btn-success' : 'btn-primary'}`}>
                                    {isCompra ? 'Programar Compra' : 'Guardar Actividad'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalAgendar;