import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';
import ConfirmModal from './ConfirmModal';
import { Form, Row, Col, Badge, Spinner } from 'react-bootstrap';

const ModalAgendar = ({ show, onClose, fechaSeleccionada, eventId, tipoInicial, onSave }) => {
    // Estados de Datos
    const [activos, setActivos] = useState([]);
    const [insumos, setInsumos] = useState([]);

    // Estados de UI
    const [tipo, setTipo] = useState('MANTENCION');
    const [busqueda, setBusqueda] = useState('');
    const [loadingData, setLoadingData] = useState(false);

    // Estados para Modales
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', type: 'primary', action: null });

    // Formulario
    const [formData, setFormData] = useState({
        titulo: '', descripcion: '', activo_id: '', insumo_id: '',
        fecha_programada: '', icono: 'bi-tools', color: '#0d6efd',
        cantidad: '', monto_estimado: '',
        solicitud_ot_id: null, tipo_evento: 'MANTENCION'
    });

    const [itemsSeleccionados, setItemsSeleccionados] = useState([]);

    // 1. Cargar Catálogos al abrir
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

                    if (eventId) {
                        cargarDetalleEvento(eventId, inventarioData);
                    } else {
                        setTipo(tipoInicial || 'MANTENCION');
                        resetearFormulario(tipoInicial || 'MANTENCION');
                    }
                } catch (e) { console.error("Error catálogos", e); }
            };
            cargarCatalogos();
            setBusqueda('');
        }
    }, [show, eventId, fechaSeleccionada, tipoInicial]);

    const resetearFormulario = (t) => {
        setFormData({
            titulo: '', descripcion: '', activo_id: '', insumo_id: '',
            fecha_programada: fechaSeleccionada || '',
            icono: t === 'MANTENCION' ? 'bi-tools' : 'bi-cart-plus',
            color: t === 'MANTENCION' ? '#0d6efd' : '#198754',
            cantidad: '', monto_estimado: '',
            solicitud_ot_id: null, tipo_evento: t
        });
        setItemsSeleccionados([]);
    };

    const cargarDetalleEvento = async (id, catalogoInsumos) => {
        setLoadingData(true);
        try {
            const res = await api.get(`/index.php/cronograma?id=${id}`);
            if (res.data.success) {
                const ev = res.data.data;
                setTipo(ev.tipo_evento);
                setFormData({
                    ...ev,
                    fecha_programada: ev.fecha_programada.split(' ')[0],
                    tipo_evento: ev.tipo_evento
                });

                if (ev.tipo_evento === 'MANTENCION') {
                    const items = (ev.items || []).map(i => {
                        const info = catalogoInsumos.find(inv => inv.id == i.id);
                        return {
                            id: i.id, nombre: i.nombre, codigo_sku: i.codigo_sku,
                            cantidad: parseFloat(i.cantidad),
                            stock_actual: info ? parseFloat(info.stock_actual) : 0,
                            unidad: info ? info.unidad_medida : 'UN'
                        };
                    });
                    setItemsSeleccionados(items);
                }
            }
        } catch (error) { onClose(); }
        finally { setLoadingData(false); }
    };

    const handleActivoChange = async (e) => {
        const id = e.target.value;
        setFormData({ ...formData, activo_id: id });
        if (id && tipo === 'MANTENCION' && itemsSeleccionados.length === 0) {
            try {
                const res = await api.get(`/index.php/mantencion/kit?id=${id}`);
                const kit = res.data.data || [];
                setItemsSeleccionados(kit.map(k => ({
                    ...k, cantidad: parseFloat(k.cantidad),
                    stock_actual: parseFloat(insumos.find(i => i.id == k.id)?.stock_actual || 0),
                    unidad: insumos.find(i => i.id == k.id)?.unidad_medida || 'UN'
                })));
            } catch (e) { }
        }
    };

    const agregarInsumo = (insumo) => {
        if (itemsSeleccionados.find(i => i.id === insumo.id)) return;
        setItemsSeleccionados([...itemsSeleccionados, {
            id: insumo.id, nombre: insumo.nombre, codigo_sku: insumo.codigo_sku,
            cantidad: 1, stock_actual: parseFloat(insumo.stock_actual), unidad: insumo.unidad_medida
        }]);
        setBusqueda('');
    };

    const procesarGuardado = async () => {
        const payload = { ...formData, tipo_evento: tipo, items: itemsSeleccionados };
        try {
            if (eventId) await api.put('/index.php/cronograma', payload);
            else await api.post('/index.php/cronograma', payload);
            onSave(); onClose();
        } catch (error) {
            setMsgModal({ show: true, title: "Error", message: error.response?.data?.error || "Error al guardar", type: "error" });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (tipo === 'MANTENCION' && !formData.activo_id) {
            return setMsgModal({ show: true, title: "Atención", message: "Seleccione un activo.", type: "warning" });
        }
        if (tipo === 'COMPRA' && !formData.insumo_id) {
            return setMsgModal({ show: true, title: "Atención", message: "Seleccione el insumo a comprar.", type: "warning" });
        }

        // Alerta de Stock solo para Mantenciones
        if (tipo === 'MANTENCION') {
            const faltantes = itemsSeleccionados.filter(i => i.cantidad > i.stock_actual);
            if (faltantes.length > 0) {
                return setConfirmModal({
                    show: true, title: "Falta Stock",
                    message: `Hay insumos sin stock. Se notificará a compras. ¿Agendar de todas formas?`,
                    type: "warning", confirmText: "Sí, Agendar", action: procesarGuardado
                });
            }
        }
        procesarGuardado();
    };

    const handleEliminar = () => {
        setConfirmModal({
            show: true, title: "Eliminar", message: "¿Borrar esta programación?",
            type: "danger", confirmText: "Eliminar", action: async () => {
                await api.delete(`/index.php/cronograma?id=${eventId}&tipo=${tipo}`);
                onSave(); onClose();
            }
        });
    };

    if (!show) return null;

    return (
        <>
            <MessageModal show={msgModal.show} onClose={() => setMsgModal({ ...msgModal, show: false })} {...msgModal} />
            <ConfirmModal show={confirmModal.show} onClose={() => setConfirmModal({ ...confirmModal, show: false })} onConfirm={() => { confirmModal.action(); setConfirmModal({ ...confirmModal, show: false }); }} {...confirmModal} />

            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', overflowY: 'auto', zIndex: 1050 }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content border-0 shadow-lg">
                        <div className="modal-header text-white" style={{ backgroundColor: formData.color }}>
                            <h5 className="modal-title fw-bold">
                                <i className={`bi ${tipo === 'MANTENCION' ? 'bi-tools' : 'bi-cart-plus'} me-2`}></i>
                                {eventId ? 'Editar' : 'Programar'} {tipo === 'MANTENCION' ? 'Mantención Técnica' : 'Compra de Insumo'}
                            </h5>
                            <button className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>

                        {loadingData ? <div className="p-5 text-center"><Spinner animation="border" /></div> : (
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <Col md={4}>
                                            <label className="form-label small fw-bold text-muted">FECHA</label>
                                            <input type="date" className="form-control fw-bold" required value={formData.fecha_programada} onChange={e => setFormData({ ...formData, fecha_programada: e.target.value })} />
                                        </Col>

                                        <Col md={8}>
                                            <label className="form-label small fw-bold text-muted">TÍTULO O MOTIVO</label>
                                            <input type="text" className="form-control" required placeholder="Ej: Cambio de rodamientos / Stock crítico" value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} />
                                        </Col>

                                        <Col md={12}>
                                            {tipo === 'MANTENCION' ? (
                                                <>
                                                    <label className="form-label small fw-bold text-primary">SELECCIONAR MÁQUINA / ACTIVO</label>
                                                    <select className="form-select border-primary" required value={formData.activo_id} onChange={handleActivoChange}>
                                                        <option value="">Seleccione activo...</option>
                                                        {activos.map(a => <option key={a.id} value={a.id}>{a.codigo_interno} - {a.nombre}</option>)}
                                                    </select>
                                                </>
                                            ) : (
                                                <>
                                                    <label className="form-label small fw-bold text-success">INSUMO A COMPRAR</label>
                                                    <select className="form-select border-success" required value={formData.insumo_id} onChange={e => setFormData({ ...formData, insumo_id: e.target.value })}>
                                                        <option value="">Seleccione insumo...</option>
                                                        {insumos.map(i => <option key={i.id} value={i.id}>{i.nombre} (Stock: {parseFloat(i.stock_actual)})</option>)}
                                                    </select>
                                                </>
                                            )}
                                        </Col>

                                        {tipo === 'COMPRA' && (
                                            <Col md={6}>
                                                <label className="form-label small fw-bold">CANTIDAD A PEDIR</label>
                                                <input type="number" className="form-control fw-bold" required value={formData.cantidad} onChange={e => setFormData({ ...formData, cantidad: e.target.value })} />
                                            </Col>
                                        )}

                                        <Col md={tipo === 'COMPRA' ? 6 : 12}>
                                            <label className="form-label small fw-bold">NOTAS</label>
                                            <textarea className="form-control" rows="1" value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })}></textarea>
                                        </Col>
                                    </div>

                                    {tipo === 'MANTENCION' && (
                                        <div className="mt-4">
                                            <h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">Insumos Planificados para la Tarea</h6>
                                            <input type="text" className="form-control form-control-sm mb-2" placeholder="🔍 Buscar y agregar repuestos..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                                            {busqueda && (
                                                <div className="list-group shadow-sm mb-3">
                                                    {insumos.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase())).slice(0, 5).map(i => (
                                                        <button key={i.id} type="button" className="list-group-item list-group-item-action small" onClick={() => agregarInsumo(i)}>
                                                            {i.nombre} <span className="float-end badge bg-light text-dark">Stock: {parseFloat(i.stock_actual)}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="table-responsive border rounded" style={{ maxHeight: '200px' }}>
                                                <table className="table table-sm align-middle mb-0">
                                                    <thead className="table-light">
                                                        <tr className="small"><th>Insumo</th><th className="text-center">Cant.</th><th className="text-end"></th></tr>
                                                    </thead>
                                                    <tbody>
                                                        {itemsSeleccionados.map(item => (
                                                            <tr key={item.id}>
                                                                <td className="small ps-3"><strong>{item.nombre}</strong><br /><span className="text-muted">{item.codigo_sku}</span></td>
                                                                <td style={{ width: '80px' }}><input type="number" className="form-control form-control-sm text-center" value={item.cantidad} onChange={e => setItemsSeleccionados(itemsSeleccionados.map(it => it.id === item.id ? { ...it, cantidad: e.target.value } : it))} /></td>
                                                                <td className="text-end pe-3"><button type="button" className="btn btn-sm text-danger" onClick={() => setItemsSeleccionados(itemsSeleccionados.filter(it => it.id !== item.id))}><i className="bi bi-x-circle"></i></button></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="modal-footer bg-light">
                                    {eventId && <button type="button" className="btn btn-link text-danger me-auto" onClick={handleEliminar}>Eliminar</button>}
                                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary fw-bold">Guardar Cambios</button>
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