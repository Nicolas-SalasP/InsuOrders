import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';
import ConfirmModal from './ConfirmModal';

const ActivoModal = ({ show, onClose, activo, onSave }) => {
    const [tab, setTab] = useState('general');
    // Estado del formulario
    const [formData, setFormData] = useState({
        codigo_interno: '', nombre: '', tipo: '', ubicacion: '', descripcion: '', centro_costo: ''
    });
    const [listaCentros, setListaCentros] = useState([]);

    // Estados para el Kit de Repuestos
    const [kitItems, setKitItems] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [busquedaInsumo, setBusquedaInsumo] = useState('');
    const [cantidadKit, setCantidadKit] = useState(1);

    // Estados para Documentos
    const [docs, setDocs] = useState([]);
    const [file, setFile] = useState(null);

    // Mensajes y Confirmaciones
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });
    const [confirm, setConfirm] = useState({ show: false, title: '', message: '', action: null });

    // --- CARGA INICIAL DE DATOS ---
    useEffect(() => {
        if (show) {
            // 1. Cargar lista de centros de costo
            api.get('/index.php/mantencion/centros-costo')
                .then(res => { if (res.data.success) setListaCentros(res.data.data); });

            // 2. Llenar formulario si es edición
            if (activo) {
                setFormData({
                    codigo_interno: activo.codigo_interno || '',
                    nombre: activo.nombre || '',
                    tipo: activo.tipo || '',
                    ubicacion: activo.ubicacion || '',
                    descripcion: activo.descripcion || '',
                    // CORRECCIÓN CRÍTICA: Usamos 'centro_costo_id' que viene del backend corregido
                    // Esto asegura que el select muestre el valor guardado
                    centro_costo: activo.centro_costo_id || ''
                });
                cargarKit(activo.id);
                cargarDocs(activo.id);
            } else {
                // Limpiar si es nuevo
                setFormData({ codigo_interno: '', nombre: '', tipo: '', ubicacion: '', descripcion: '', centro_costo: '' });
                setKitItems([]);
                setDocs([]);
            }

            // 3. Cargar inventario para el buscador de kits
            api.get('/index.php/inventario').then(res => setInsumos(res.data.data || []));
            setTab('general');
        }
    }, [show, activo]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // --- GUARDAR ACTIVO (GENERAL) ---
    const handleSubmitGeneral = async (e) => {
        e.preventDefault();
        try {
            if (activo) {
                // MODO EDICIÓN: Usamos la ruta específica editar-activo
                // Importante: Enviamos el ID en el cuerpo
                await api.post('/index.php/mantencion/editar-activo', { ...formData, id: activo.id });
            } else {
                // MODO CREACIÓN
                await api.post('/index.php/mantencion/crear-activo', formData);
            }

            setMsgModal({ show: true, title: "Éxito", message: "Activo guardado correctamente", type: "success" });
            setTimeout(() => { onSave(); onClose(); }, 1000);
        } catch (error) {
            setMsgModal({ show: true, title: "Error", message: error.response?.data?.message || "Error al guardar", type: "error" });
        }
    };

    // --- LÓGICA DE KITS ---
    const cargarKit = async (id) => {
        try {
            const res = await api.get(`/index.php/mantencion/kit?id=${id}`);
            setKitItems(res.data.data || []);
        } catch (e) { setKitItems([]); }
    };

    const agregarAlKit = async (insumo) => {
        if (!activo) return alert("Guarda el activo primero para agregar repuestos.");
        if (cantidadKit <= 0) return alert("Cantidad inválida");
        try {
            await api.post('/index.php/mantencion/kit', {
                activo_id: activo.id, insumo_id: insumo.id, cantidad: cantidadKit
            });
            cargarKit(activo.id);
            setBusquedaInsumo(''); setCantidadKit(1);
        } catch (e) { alert("Error al agregar repuesto"); }
    };

    const actualizarCantKit = async (insumoId, nuevaCant) => {
        const cantidadEntera = parseInt(nuevaCant, 10);
        if (isNaN(cantidadEntera) || cantidadEntera < 1) return;

        try {
            await api.put('/index.php/mantencion/kit', {
                activo_id: activo.id,
                insumo_id: insumoId,
                cantidad: cantidadEntera
            });
            cargarKit(activo.id);
        } catch (e) {
            alert("Error al actualizar cantidad");
        }
    };

    const solicitarQuitarKit = (insumoId) => {
        setConfirm({
            show: true,
            title: "Eliminar Repuesto",
            message: "¿Estás seguro de quitar este repuesto del kit?",
            action: async () => {
                try {
                    await api.delete(`/index.php/mantencion/kit?activo_id=${activo.id}&insumo_id=${insumoId}`);
                    cargarKit(activo.id);
                } catch (e) { }
            }
        });
    };

    // --- LÓGICA DE DOCUMENTOS ---
    const cargarDocs = async (id) => {
        try {
            const res = await api.get(`/index.php/mantencion/docs?id=${id}`);
            setDocs(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (e) {
            setDocs([]);
        }
    };

    const subirDoc = async () => {
        if (!file || !activo) return;
        const data = new FormData();
        data.append('activo_id', activo.id);
        data.append('archivo', file);
        try {
            await api.post('/index.php/mantencion/docs', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setFile(null);
            document.getElementById('fileInput').value = "";
            cargarDocs(activo.id);
        } catch (e) { alert("Error al subir archivo"); }
    };

    const solicitarBorrarDoc = (docId) => {
        setConfirm({
            show: true,
            title: "Eliminar Documento",
            message: "Esta acción borrará el archivo permanentemente. ¿Continuar?",
            action: async () => {
                try {
                    await api.delete(`/index.php/mantencion/docs?id=${docId}`);
                    cargarDocs(activo.id);
                } catch (e) { alert("Error al eliminar archivo"); }
            }
        });
    };

    const handleConfirm = () => {
        if (confirm.action) confirm.action();
        setConfirm({ ...confirm, show: false, action: null });
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

            <ConfirmModal
                show={confirm.show}
                onClose={() => setConfirm({ ...confirm, show: false })}
                onConfirm={handleConfirm}
                title={confirm.title}
                message={confirm.message}
                confirmText="Confirmar"
                type="danger"
            />

            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto', zIndex: 1050 }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content shadow border-0">
                        <div className="modal-header bg-dark text-white">
                            <h5 className="modal-title fw-bold">
                                {activo ? `🔧 Editar: ${activo.nombre}` : '✨ Nuevo Activo / Máquina'}
                            </h5>
                            <button className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>

                        <div className="modal-body p-0">
                            {/* Pestañas de Navegación (Solo visibles si ya existe el activo) */}
                            {activo && (
                                <ul className="nav nav-tabs nav-fill bg-light px-3 pt-3 border-bottom-0">
                                    <li className="nav-item">
                                        <button className={`nav-link fw-bold ${tab === 'general' ? 'active' : ''}`} onClick={() => setTab('general')}>General</button>
                                    </li>
                                    <li className="nav-item">
                                        <button className={`nav-link fw-bold ${tab === 'kit' ? 'active' : ''}`} onClick={() => setTab('kit')}>Kit Repuestos</button>
                                    </li>
                                    <li className="nav-item">
                                        <button className={`nav-link fw-bold ${tab === 'docs' ? 'active' : ''}`} onClick={() => setTab('docs')}>Documentación</button>
                                    </li>
                                </ul>
                            )}

                            <div className="p-4 bg-white">
                                {/* TAB 1: INFORMACIÓN GENERAL */}
                                {tab === 'general' && (
                                    <form onSubmit={handleSubmitGeneral}>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">CÓDIGO INTERNO</label>
                                                <input
                                                    type="text"
                                                    name="codigo_interno"
                                                    className="form-control fw-bold"
                                                    required
                                                    value={formData.codigo_interno}
                                                    onChange={handleChange}
                                                    placeholder="Ej: GEN-01"
                                                />
                                            </div>
                                            <div className="col-md-8">
                                                <label className="form-label small fw-bold text-muted">NOMBRE ACTIVO</label>
                                                <input
                                                    type="text"
                                                    name="nombre"
                                                    className="form-control"
                                                    required
                                                    value={formData.nombre}
                                                    onChange={handleChange}
                                                    placeholder="Ej: Generador Caterpillar"
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">TIPO</label>
                                                <select name="tipo" className="form-select" value={formData.tipo} onChange={handleChange}>
                                                    <option value="">Seleccione...</option>
                                                    <option value="Maquinaria">Maquinaria</option>
                                                    <option value="Vehículo">Vehículo</option>
                                                    <option value="Infraestructura">Infraestructura</option>
                                                    <option value="Equipo">Equipo Menor</option>
                                                    <option value="Generador">Generador</option>
                                                    <option value="Herramienta">Herramienta</option>
                                                    <option value="Instalación">Instalación</option>
                                                    <option value="Equipo Computacional">Equipo Computacional</option>
                                                    <option value="Otro">Otro</option>
                                                </select>
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">UBICACIÓN FÍSICA</label>
                                                <input
                                                    type="text"
                                                    name="ubicacion"
                                                    className="form-control"
                                                    value={formData.ubicacion}
                                                    onChange={handleChange}
                                                    placeholder="Ej: Patio Norte"
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-primary">CENTRO DE COSTO</label>
                                                <select
                                                    name="centro_costo"
                                                    className="form-select border-primary"
                                                    value={formData.centro_costo}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">-- Sin Asignar --</option>
                                                    {listaCentros.map(cc => (
                                                        <option key={cc.id} value={cc.id}>
                                                            {cc.codigo} - {cc.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label small fw-bold text-muted">DESCRIPCIÓN / DETALLES</label>
                                                <textarea
                                                    name="descripcion"
                                                    className="form-control"
                                                    rows="3"
                                                    value={formData.descripcion}
                                                    onChange={handleChange}
                                                    placeholder="Detalles técnicos..."
                                                ></textarea>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-end mt-4">
                                            <button type="submit" className="btn btn-primary px-4 fw-bold">
                                                <i className="bi bi-save me-2"></i>Guardar Cambios
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* TAB 2: KIT DE REPUESTOS */}
                                {tab === 'kit' && (
                                    <div>
                                        <div className="mb-3 border p-3 rounded bg-light">
                                            <label className="form-label small fw-bold text-muted">AGREGAR REPUESTO AL KIT</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Buscar insumo..."
                                                    value={busquedaInsumo}
                                                    onChange={e => setBusquedaInsumo(e.target.value)}
                                                />
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    style={{ maxWidth: '80px' }}
                                                    value={cantidadKit}
                                                    onChange={e => setCantidadKit(parseInt(e.target.value) || 1)}
                                                    min="1"
                                                    step="1"
                                                    placeholder="Cant."
                                                />
                                            </div>
                                            {busquedaInsumo && (
                                                <div className="list-group position-absolute w-100 shadow mt-1" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                                    {insumos.filter(i => i.nombre.toLowerCase().includes(busquedaInsumo.toLowerCase())).slice(0, 10).map(i => (
                                                        <button key={i.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onClick={() => agregarAlKit(i)}>
                                                            <span>{i.nombre}</span>
                                                            <span className="badge bg-secondary">{i.codigo_sku}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <ul className="list-group">
                                            {kitItems.map(k => (
                                                <li key={k.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="fw-bold">{k.nombre}</div>
                                                        <small className="text-muted">
                                                            SKU: {k.codigo_sku} | Stock Actual: {Math.floor(k.stock_actual)}
                                                        </small>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <label className="small text-muted mb-0">Cant:</label>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm text-center"
                                                            style={{ width: '70px' }}
                                                            value={Math.floor(k.cantidad)}
                                                            step="1"
                                                            onChange={(e) => actualizarCantKit(k.id, e.target.value)}
                                                        />
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => solicitarQuitarKit(k.id)} title="Quitar">
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                            {kitItems.length === 0 && <li className="list-group-item text-center text-muted py-4">Este activo no tiene repuestos definidos en su kit.</li>}
                                        </ul>
                                    </div>
                                )}

                                {/* TAB 3: DOCUMENTACIÓN */}
                                {tab === 'docs' && (
                                    <div>
                                        <div className="input-group mb-3">
                                            <input type="file" id="fileInput" className="form-control" onChange={e => setFile(e.target.files[0])} />
                                            <button type="button" className="btn btn-primary" onClick={subirDoc} disabled={!file}>
                                                <i className="bi bi-cloud-upload me-2"></i>Subir
                                            </button>
                                        </div>
                                        <div className="list-group">
                                            {docs && Array.isArray(docs) && docs.map(d => (
                                                <div key={d.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                    <a href={`http://localhost/insuorders/public_html${d.url_archivo}`} target="_blank" rel="noreferrer" className="text-decoration-none text-dark d-flex align-items-center">
                                                        <i className="bi bi-file-earmark-text me-3 fs-4 text-primary"></i>
                                                        <div>
                                                            <div className="fw-bold">{d.nombre_archivo}</div>
                                                            <small className="text-muted">{new Date(d.fecha_subida).toLocaleDateString()}</small>
                                                        </div>
                                                    </a>
                                                    <button className="btn btn-sm text-danger" onClick={() => solicitarBorrarDoc(d.id)} title="Eliminar">
                                                        <i className="bi bi-trash fs-5"></i>
                                                    </button>
                                                </div>
                                            ))}
                                            {(!docs || docs.length === 0) && <div className="text-center text-muted py-4">No hay documentos adjuntos.</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ActivoModal;