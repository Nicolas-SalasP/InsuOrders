import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const NuevaOrdenModal = ({ show, onClose, onSave }) => {
    // Datos Maestros
    const [proveedores, setProveedores] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    
    // Cabecera Orden
    const [proveedorId, setProveedorId] = useState('');
    const [moneda, setMoneda] = useState('CLP');
    const [tipoCambio, setTipoCambio] = useState(1);
    const [numeroCotizacion, setNumeroCotizacion] = useState(''); // Nuevo campo
    
    // Ítems
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estado para "Agregar Producto"
    const [modoNuevo, setModoNuevo] = useState(false); // false: Buscar, true: Crear
    const [busqueda, setBusqueda] = useState('');
    
    // Formulario Producto Nuevo
    const [nuevoProd, setNuevoProd] = useState({ nombre: '', categoria_id: '', unidad: 'UN', precio: '', cantidad: '' });

    useEffect(() => {
        if (show) {
            // Cargar listas
            api.get('/index.php/proveedores').then(res => setProveedores(res.data.data));
            api.get('/index.php/inventario').then(res => setInsumos(res.data.data));
            api.get('/index.php/inventario/auxiliares').then(res => setCategorias(res.data.data.categorias));
            
            // Resetear formulario
            setItems([]); setProveedorId(''); setMoneda('CLP'); setTipoCambio(1); setNumeroCotizacion('');
            setModoNuevo(false); setBusqueda('');
            setNuevoProd({ nombre: '', categoria_id: '', unidad: 'UN', precio: '', cantidad: '' });
        }
    }, [show]);

    // Búsqueda por Nombre y SKU
    const insumosFiltrados = busqueda 
        ? insumos.filter(i => 
            i.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
            i.codigo_sku.toLowerCase().includes(busqueda.toLowerCase())
          ) 
        : [];

    const agregarItemExistente = (insumo) => {
        // Evitar duplicados visuales (opcional)
        // if (items.find(i => i.id === insumo.id)) return alert("El producto ya está en la lista");

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
        if (!nuevoProd.nombre || !nuevoProd.categoria_id || !nuevoProd.cantidad || !nuevoProd.precio) {
            return alert("Completa todos los datos del nuevo producto (incluyendo precio).");
        }
        setItems([...items, {
            id: null, // Es nuevo
            nombre: nuevoProd.nombre,
            unidad: nuevoProd.unidad,
            categoria_id: nuevoProd.categoria_id,
            cantidad: parseFloat(nuevoProd.cantidad),
            precio: parseFloat(nuevoProd.precio),
            sku: 'NUEVO',
            tipo: 'nuevo'
        }]);
        // Resetear form nuevo
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
        if (!proveedorId || items.length === 0) return alert("Faltan datos (Proveedor o Productos).");
        
        setLoading(true);
        try {
            await api.post('/index.php/compras', {
                proveedor_id: proveedorId,
                moneda,
                tipo_cambio: tipoCambio,
                numero_cotizacion: numeroCotizacion,
                items
            });
            onSave();
            onClose();
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Error desconocido"));
        } finally {
            setLoading(false);
        }
    };

    // Cálculos Totales
    const totalNeto = items.reduce((acc, i) => acc + (i.cantidad * i.precio), 0);
    const totalIVA = totalNeto * 0.19; // IVA Chile
    const totalFinal = totalNeto + totalIVA;

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
            <div className="modal-dialog modal-xl">
                <div className="modal-content shadow-lg">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title fw-bold">📑 Generar Orden de Compra</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body bg-light">
                        
                        {/* 1. Cabecera */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Proveedor</label>
                                        <select className="form-select" value={proveedorId} onChange={e => setProveedorId(e.target.value)}>
                                            <option value="">Seleccione Proveedor...</option>
                                            {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.rut})</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label fw-bold small text-uppercase text-muted">N° Cotización</label>
                                        <input type="text" className="form-control" placeholder="Ej: COT-100" 
                                            value={numeroCotizacion} onChange={e => setNumeroCotizacion(e.target.value)} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Moneda</label>
                                        <select className="form-select" value={moneda} onChange={e => { setMoneda(e.target.value); if(e.target.value==='CLP') setTipoCambio(1); }}>
                                            <option value="CLP">Peso Chileno (CLP)</option>
                                            <option value="UF">UF</option>
                                            <option value="USD">Dólar (USD)</option>
                                            <option value="EUR">Euro (EUR)</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Tipo Cambio</label>
                                        <input type="number" className="form-control" 
                                            value={tipoCambio} onChange={e => setTipoCambio(e.target.value)} 
                                            disabled={moneda === 'CLP'} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Agregar Productos */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white d-flex justify-content-between align-items-center py-2">
                                <span className="fw-bold small text-dark">DETALLE DE PRODUCTOS</span>
                                <div className="btn-group btn-group-sm">
                                    <button className={`btn ${!modoNuevo ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setModoNuevo(false)}>Buscar Existente</button>
                                    <button className={`btn ${modoNuevo ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setModoNuevo(true)}>Crear Nuevo</button>
                                </div>
                            </div>
                            <div className="card-body py-3">
                                {!modoNuevo ? (
                                    // MODO BUSCAR
                                    <div className="position-relative">
                                        <div className="input-group">
                                            <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                                            <input type="text" className="form-control" placeholder="Escribe nombre o SKU..." 
                                                value={busqueda} onChange={e => setBusqueda(e.target.value)} autoFocus />
                                        </div>
                                        {insumosFiltrados.length > 0 && (
                                            <ul className="list-group position-absolute w-100 shadow mt-1" style={{ zIndex: 100, maxHeight: '200px', overflowY: 'auto' }}>
                                                {insumosFiltrados.map(ins => (
                                                    <li key={ins.id} className="list-group-item list-group-item-action cursor-pointer d-flex justify-content-between align-items-center" 
                                                        onClick={() => agregarItemExistente(ins)}>
                                                        <span>{ins.nombre}</span>
                                                        <small className="text-muted badge bg-light text-dark border">{ins.codigo_sku}</small>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    // MODO CREAR NUEVO
                                    <div className="row g-2 align-items-end">
                                        <div className="col-md-3">
                                            <label className="small text-muted">Nombre Producto</label>
                                            <input type="text" className="form-control form-control-sm" placeholder="Ej: Tornillo 3mm"
                                                value={nuevoProd.nombre} onChange={e => setNuevoProd({...nuevoProd, nombre: e.target.value})} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="small text-muted">Categoría</label>
                                            <select className="form-select form-select-sm" 
                                                value={nuevoProd.categoria_id} onChange={e => setNuevoProd({...nuevoProd, categoria_id: e.target.value})}>
                                                <option value="">Elegir...</option>
                                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-2">
                                            <label className="small text-muted">Precio Neto</label>
                                            <input type="number" className="form-control form-control-sm" placeholder="0" min="0"
                                                value={nuevoProd.precio} onChange={e => setNuevoProd({...nuevoProd, precio: e.target.value})} />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="small text-muted">Cant.</label>
                                            <input type="number" className="form-control form-control-sm" placeholder="1" min="0.1"
                                                value={nuevoProd.cantidad} onChange={e => setNuevoProd({...nuevoProd, cantidad: e.target.value})} />
                                        </div>
                                        <div className="col-md-2">
                                            <button className="btn btn-sm btn-success w-100" onClick={agregarItemNuevo}>
                                                <i className="bi bi-plus-lg me-1"></i>Agregar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Tabla Resumen */}
                        <div className="table-responsive bg-white border rounded mb-3">
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Producto</th>
                                        <th className="text-center" style={{width:'80px'}}>Tipo</th>
                                        <th style={{width:'100px'}}>Cant.</th>
                                        <th style={{width:'120px'}}>Precio Unit.</th>
                                        <th className="text-end">Total</th>
                                        <th style={{width:'50px'}}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <div className="fw-medium">{item.nombre}</div>
                                                <small className="text-muted" style={{fontSize:'0.75rem'}}>{item.sku !== 'NUEVO' ? `SKU: ${item.sku}` : ''}</small>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge ${item.tipo === 'nuevo' ? 'bg-warning text-dark' : 'bg-light text-secondary border'}`}>
                                                    {item.tipo === 'nuevo' ? 'NUEVO' : 'EXIST.'}
                                                </span>
                                            </td>
                                            <td>
                                                <input type="number" className="form-control form-control-sm text-center" min="0.1"
                                                    value={item.cantidad} onChange={e => actualizarItem(idx, 'cantidad', e.target.value)} />
                                            </td>
                                            <td>
                                                <input type="number" className="form-control form-control-sm text-end" min="0"
                                                    value={item.precio} onChange={e => actualizarItem(idx, 'precio', e.target.value)} />
                                            </td>
                                            <td className="text-end fw-bold">
                                                {moneda === 'CLP' ? '$' : ''}{(item.cantidad * item.precio).toLocaleString('es-CL', { maximumFractionDigits: 2 })}
                                            </td>
                                            <td>
                                                <button className="btn btn-sm text-danger" onClick={() => eliminarItem(idx)}><i className="bi bi-trash"></i></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr><td colSpan="6" className="text-center text-muted py-4">No hay productos agregados</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* 4. Totales */}
                        <div className="row justify-content-end">
                            <div className="col-md-4">
                                <ul className="list-group list-group-flush shadow-sm">
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span className="text-muted">Neto:</span> 
                                        <strong>{totalNeto.toLocaleString('es-CL', { maximumFractionDigits: 2 })}</strong>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span className="text-muted">IVA (19%):</span> 
                                        <span>{totalIVA.toLocaleString('es-CL', { maximumFractionDigits: 2 })}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between bg-light">
                                        <span className="fs-5">Total:</span> 
                                        <strong className="fs-5 text-primary">{totalFinal.toLocaleString('es-CL', { maximumFractionDigits: 2 })} {moneda}</strong>
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button className="btn btn-success px-4" onClick={handleSubmit} disabled={loading || items.length === 0}>
                            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-lg me-2"></i>}
                            Confirmar Orden
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NuevaOrdenModal;