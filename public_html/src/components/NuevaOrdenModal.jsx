import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const NuevaOrdenModal = ({ show, onClose, onSave, itemsIniciales = [] }) => {
    // Datos Maestros
    const [proveedores, setProveedores] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    // Cabecera Orden
    const [proveedorId, setProveedorId] = useState('');
    const [moneda, setMoneda] = useState('CLP');
    const [tipoCambio, setTipoCambio] = useState(1);
    const [numeroCotizacion, setNumeroCotizacion] = useState('');

    // Estado para Impuesto Variable (Por defecto 19)
    const [impuestoPorcentaje, setImpuestoPorcentaje] = useState(19);

    // Ítems y Estado General
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); 

    // Estado para "Agregar Producto"
    const [modoNuevo, setModoNuevo] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    // Formulario Producto Nuevo
    const [nuevoProd, setNuevoProd] = useState({ nombre: '', categoria_id: '', unidad: 'UN', precio: '', cantidad: '' });

    useEffect(() => {
        if (show) {
            // Limpiar errores al abrir
            setError('');

            // Cargar listas
            api.get('/index.php/proveedores').then(res => {
                if (res.data.success) setProveedores(res.data.data);
            });
            api.get('/index.php/inventario').then(res => {
                if (res.data.success) setInsumos(res.data.data);
            });
            api.get('/index.php/inventario/auxiliares').then(res => {
                if (res.data.success) setCategorias(res.data.data.categorias);
            });

            // Resetear formulario
            setProveedorId('');
            setMoneda('CLP');
            setTipoCambio(1);
            setNumeroCotizacion('');
            setImpuestoPorcentaje(19);
            setModoNuevo(false);
            setBusqueda('');
            setNuevoProd({ nombre: '', categoria_id: '', unidad: 'UN', precio: '', cantidad: '' });

            // Cargar ítems iniciales
            if (itemsIniciales.length > 0) {
                const itemsFormateados = itemsIniciales.map(i => ({
                    ...i,
                    ids_detalle_solicitud: i.ids_detalle_solicitud || i.origen_ids || null,
                    // Aseguramos capturar la lista de OTs si viene
                    ot_ids: i.ot_ids || null 
                }));
                setItems(itemsFormateados);
            } else {
                setItems([]);
            }
        }
    }, [show, itemsIniciales]);

    // Búsqueda por Nombre y SKU
    const insumosFiltrados = busqueda
        ? insumos.filter(i =>
            i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (i.codigo_sku && i.codigo_sku.toLowerCase().includes(busqueda.toLowerCase()))
        )
        : [];

    const agregarItemExistente = (insumo) => {
        setError(''); // Limpiar error si agrega bien
        setItems([...items, {
            id: insumo.id,
            nombre: insumo.nombre,
            unidad: insumo.unidad_medida,
            cantidad: 1,
            precio: parseFloat(insumo.precio_costo) || 0,
            sku: insumo.codigo_sku,
            tipo: 'existente'
        }]);
        setBusqueda('');
    };

    const agregarItemNuevo = () => {
        setError(''); // Limpiar errores previos
        if (!nuevoProd.nombre || !nuevoProd.categoria_id || !nuevoProd.cantidad || !nuevoProd.precio) {
            setError("Completa todos los datos del nuevo producto (incluyendo precio).");
            return;
        }
        setItems([...items, {
            id: null,
            nombre: nuevoProd.nombre,
            unidad: nuevoProd.unidad,
            categoria_id: nuevoProd.categoria_id,
            cantidad: parseFloat(nuevoProd.cantidad),
            precio: parseFloat(nuevoProd.precio),
            sku: 'NUEVO',
            tipo: 'nuevo'
        }]);

        setNuevoProd({ nombre: '', categoria_id: '', unidad: 'UN', precio: '', cantidad: '' });
        setModoNuevo(false);
    };

    const eliminarItem = (idx) => {
        setItems(items.filter((_, i) => i !== idx));
    };

    const actualizarItem = (index, campo, valor) => {
        const copia = [...items];
        copia[index][campo] = parseFloat(valor) || 0;
        setItems(copia);
    };

    const handleSubmit = async () => {
        setError(''); // Limpiar errores antes de enviar

        if (!proveedorId) {
            setError("Debes seleccionar un Proveedor.");
            return;
        }
        if (items.length === 0) {
            setError("La orden debe tener al menos un producto.");
            return;
        }

        setLoading(true);
        try {
            await api.post('/index.php/compras', {
                proveedor_id: proveedorId,
                moneda,
                tipo_cambio: tipoCambio,
                numero_cotizacion: numeroCotizacion,
                impuesto_porcentaje: impuestoPorcentaje,
                items
            });
            onSave();
            onClose();
        } catch (error) {
            setError("Error: " + (error.response?.data?.message || "Error desconocido al guardar"));
        } finally {
            setLoading(false);
        }
    };

    // Cálculos Totales
    const totalNeto = items.reduce((acc, i) => acc + (i.cantidad * i.precio), 0);
    const totalIVA = totalNeto * (impuestoPorcentaje / 100);
    const totalFinal = totalNeto + totalIVA;

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto', zIndex: 1060 }}>
            <div className="modal-dialog modal-xl">
                <div className="modal-content shadow-lg border-0">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title fw-bold"><i className="bi bi-file-earmark-plus me-2"></i>Generar Orden de Compra</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body bg-light">

                        {error && (
                            <div className="alert alert-danger d-flex align-items-center mb-3 border-0 shadow-sm" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
                                <div>{error}</div>
                            </div>
                        )}

                        {/* 1. Cabecera */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Proveedor</label>
                                        <select className={`form-select ${!proveedorId && error ? 'is-invalid' : ''}`}
                                            value={proveedorId} onChange={e => { setProveedorId(e.target.value); setError(''); }}>
                                            <option value="">Seleccione Proveedor...</option>
                                            {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.rut})</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label fw-bold small text-uppercase text-muted">N° Cotización</label>
                                        <input type="text" className="form-control" placeholder="Ej: COT-100"
                                            value={numeroCotizacion} onChange={e => setNumeroCotizacion(e.target.value)} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Moneda</label>
                                        <select className="form-select" value={moneda} onChange={e => { setMoneda(e.target.value); if (e.target.value === 'CLP') setTipoCambio(1); }}>
                                            <option value="CLP">CLP</option>
                                            <option value="UF">UF</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Tipo Cambio</label>
                                        <input type="number" className="form-control"
                                            value={tipoCambio} onChange={e => setTipoCambio(e.target.value)}
                                            disabled={moneda === 'CLP'}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Impuesto %</label>
                                        <div className="input-group">
                                            <input
                                                type="number" className="form-control"
                                                value={impuestoPorcentaje}
                                                onChange={e => setImpuestoPorcentaje(parseFloat(e.target.value) || 0)}
                                                min="0" max="100" step="0.1"
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Agregar Productos */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                                <span className="fw-bold text-dark"><i className="bi bi-box-seam me-2 text-primary"></i>DETALLE DE PRODUCTOS</span>
                                <div className="btn-group btn-group-sm">
                                    <button className={`btn ${!modoNuevo ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setModoNuevo(false); setError(''); }}>Buscar Existente</button>
                                    <button className={`btn ${modoNuevo ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setModoNuevo(true); setError(''); }}>Crear Nuevo</button>
                                </div>
                            </div>
                            <div className="card-body p-4 bg-white">
                                {!modoNuevo ? (
                                    <div className="position-relative">
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                                            <input type="text" className="form-control border-start-0 ps-0" placeholder="Buscar insumo por nombre o SKU..."
                                                value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                                        </div>
                                        {insumosFiltrados.length > 0 && busqueda && (
                                            <ul className="list-group position-absolute w-100 shadow mt-1" style={{ zIndex: 100, maxHeight: '200px', overflowY: 'auto' }}>
                                                {insumosFiltrados.map(ins => (
                                                    <li key={ins.id} className="list-group-item list-group-item-action cursor-pointer d-flex justify-content-between align-items-center"
                                                        onClick={() => agregarItemExistente(ins)}>
                                                        <div>
                                                            <div className="fw-bold text-dark">{ins.nombre}</div>
                                                            <small className="text-muted">SKU: {ins.codigo_sku}</small>
                                                        </div>
                                                        <span className="badge bg-light text-dark border">Stock: {Math.floor(ins.stock_actual)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <div className="row g-2 align-items-end bg-light p-3 rounded border">
                                        <div className="col-md-3">
                                            <label className="small text-muted fw-bold">Nombre Producto</label>
                                            <input type="text" className="form-control form-control-sm" placeholder="Ej: Tornillo 3mm"
                                                value={nuevoProd.nombre} onChange={e => setNuevoProd({ ...nuevoProd, nombre: e.target.value })} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="small text-muted fw-bold">Categoría</label>
                                            <select className="form-select form-select-sm"
                                                value={nuevoProd.categoria_id} onChange={e => setNuevoProd({ ...nuevoProd, categoria_id: e.target.value })}>
                                                <option value="">Elegir...</option>
                                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-2">
                                            <label className="small text-muted fw-bold">Precio Neto</label>
                                            <input type="number" className="form-control form-control-sm" placeholder="0" min="0"
                                                value={nuevoProd.precio} onChange={e => setNuevoProd({ ...nuevoProd, precio: e.target.value })} />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="small text-muted fw-bold">Cant.</label>
                                            <input type="number" className="form-control form-control-sm" placeholder="1" min="0.1"
                                                value={nuevoProd.cantidad} onChange={e => setNuevoProd({ ...nuevoProd, cantidad: e.target.value })} />
                                        </div>
                                        <div className="col-md-2">
                                            <button className="btn btn-sm btn-success w-100 fw-bold" onClick={agregarItemNuevo}>
                                                <i className="bi bi-plus-lg me-1"></i>Agregar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Tabla Resumen */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="bg-light text-secondary small text-uppercase">
                                        <tr>
                                            <th className="ps-4">Producto</th>
                                            <th className="text-center" style={{ width: '100px' }}>Tipo</th>
                                            <th style={{ width: '120px' }}>Cant.</th>
                                            <th style={{ width: '150px' }}>Precio Unit.</th>
                                            <th className="text-end">Total ({moneda})</th>
                                            <th style={{ width: '60px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="ps-4">
                                                    <div className="fw-bold text-dark">{item.nombre}</div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <small className="text-muted font-monospace">{item.sku !== 'NUEVO' ? item.sku : ''}</small>
                                                        
                                                        {/* --- CAMBIO: Badge de OT mejorado --- */}
                                                        {item.ids_detalle_solicitud && (
                                                            <span className="badge bg-warning text-dark border border-warning" title="Proviene de Solicitud de Mantención">
                                                                <i className="bi bi-link-45deg me-1"></i>
                                                                {item.ot_ids 
                                                                    ? `OT: ${item.ot_ids}` 
                                                                    : 'Solicitud'
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge rounded-pill fw-normal ${item.tipo === 'nuevo' ? 'bg-info text-dark' : 'bg-light text-secondary border'}`}>
                                                        {item.tipo === 'nuevo' ? 'NUEVO' : 'EXIST.'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <input type="number" className="form-control form-control-sm text-center fw-bold" min="0.1"
                                                        value={item.cantidad} onChange={e => actualizarItem(idx, 'cantidad', e.target.value)} />
                                                </td>
                                                <td>
                                                    <input type="number" className="form-control form-control-sm text-end" min="0"
                                                        value={item.precio} onChange={e => actualizarItem(idx, 'precio', e.target.value)} />
                                                </td>
                                                <td className="text-end fw-bold text-dark">
                                                    {(item.cantidad * item.precio).toLocaleString('es-CL', { maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="text-center">
                                                    <button className="btn btn-sm btn-link text-danger p-0" onClick={() => eliminarItem(idx)}><i className="bi bi-trash-fill"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {items.length === 0 && (
                                            <tr><td colSpan="6" className="text-center text-muted py-5 fst-italic">No hay productos agregados a la orden.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 4. Totales */}
                        <div className="row justify-content-end">
                            <div className="col-md-5 col-lg-4">
                                <div className="card border-0 bg-white shadow-sm">
                                    <div className="card-body p-0">
                                        <ul className="list-group list-group-flush">
                                            <li className="list-group-item d-flex justify-content-between border-0 pt-3 px-4">
                                                <span className="text-muted">Subtotal Neto:</span>
                                                <span className="fw-bold">{totalNeto.toLocaleString('es-CL', { maximumFractionDigits: 2 })}</span>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between border-0 px-4">
                                                <span className="text-muted">Impuesto ({impuestoPorcentaje}%):</span>
                                                <span className="fw-bold">{totalIVA.toLocaleString('es-CL', { maximumFractionDigits: 2 })}</span>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between bg-light border-top py-3 px-4">
                                                <span className="fs-5 fw-bold text-dark">Total a Pagar:</span>
                                                <span className="fs-5 fw-bold text-primary">{totalFinal.toLocaleString('es-CL', { maximumFractionDigits: 2 })} {moneda}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="modal-footer bg-white border-top-0 py-3">
                        <button className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>Cancelar</button>
                        <button className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" onClick={handleSubmit} disabled={loading}>
                            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</> : <><i className="bi bi-check-lg me-2"></i>Confirmar Orden</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NuevaOrdenModal;