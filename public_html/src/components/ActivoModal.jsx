import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal'; // <--- IMPORTAR EL NUEVO MODAL

const ActivoModal = ({ show, onClose, activo, onSave }) => {
    const [tab, setTab] = useState('general'); 
    
    // General
    const [formData, setFormData] = useState({ codigo_interno: '', nombre: '', tipo: '', ubicacion: '', descripcion: '' });
    
    // Kit
    const [kitItems, setKitItems] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [busquedaInsumo, setBusquedaInsumo] = useState('');
    
    // Docs
    const [docs, setDocs] = useState([]);
    const [file, setFile] = useState(null);

    // Estado para Mensajes
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        if (show) {
            if (activo) {
                setFormData(activo);
                cargarKit(activo.id);
                cargarDocs(activo.id);
            } else {
                setFormData({ codigo_interno: '', nombre: '', tipo: '', ubicacion: '', descripcion: '' });
                setKitItems([]);
                setDocs([]);
            }
            api.get('/index.php/inventario').then(res => setInsumos(res.data.data));
            setTab('general');
        }
    }, [show, activo]);
    const showMsg = (title, message, type = 'info') => {
        setMsgModal({ show: true, title, message, type });
    };

    // --- FUNCIONES KIT ---
    const cargarKit = async (id) => {
        const res = await api.get(`/index.php/mantencion/kit?id=${id}`);
        if(res.data.success) {
            const items = res.data.data.map(i => ({ ...i, cantidadEdit: i.cantidad }));
            setKitItems(items);
        }
    };

    const agregarAlKit = async (insumo) => {
        if (!activo) return showMsg("Atención", "Primero debes crear y guardar la máquina.", "error");
        
        try {
            await api.post('/index.php/mantencion/kit', { accion: 'add', activo_id: activo.id, insumo_id: insumo.id, cantidad: 1 });
            cargarKit(activo.id);
            setBusquedaInsumo('');
        } catch (error) {
            showMsg("Error", "No se pudo agregar al kit", "error");
        }
    };

    const actualizarCantidadKit = async (item) => {
        try {
            await api.post('/index.php/mantencion/kit', { 
                accion: 'add',
                activo_id: activo.id, 
                insumo_id: item.id, 
                cantidad: item.cantidadEdit 
            });
            showMsg("Éxito", "Cantidad actualizada correctamente", "success");
            cargarKit(activo.id);
        } catch (error) {
            showMsg("Error", "No se pudo actualizar la cantidad", "error");
        }
    };

    const quitarDelKit = async (insumoId) => {
        if(!window.confirm("¿Quitar del kit?")) return;
        await api.post('/index.php/mantencion/kit', { accion: 'remove', activo_id: activo.id, insumo_id: insumoId });
        cargarKit(activo.id);
    };

    const handleCantChange = (index, val) => {
        const nuevosItems = [...kitItems];
        nuevosItems[index].cantidadEdit = val;
        setKitItems(nuevosItems);
    };

    // --- FUNCIONES DOCS ---
    const cargarDocs = async (id) => {
        const res = await api.get(`/index.php/mantencion/docs?id=${id}`);
        if(res.data.success) setDocs(res.data.data);
    };

    const subirDoc = async () => {
        if (!file || !activo) return;
        const data = new FormData();
        data.append('archivo', file);
        data.append('activo_id', activo.id);
        try {
            await api.post('/index.php/mantencion/docs', data, { headers: {'Content-Type': 'multipart/form-data'} });
            setFile(null);
            cargarDocs(activo.id);
            showMsg("Éxito", "Documento subido correctamente", "success");
        } catch (error) {
            showMsg("Error", "Fallo al subir documento", "error");
        }
    };

    // --- GUARDAR GENERAL ---
    const guardarGeneral = async () => {
        try {
            if(!activo) {
                await api.post('/index.php/mantencion/crear-activo', formData);
                onSave(); 
                onClose();
            } else {
                showMsg("Info", "Edición de nombre no implementada aún en backend", "info");
            }
        } catch (error) {
            showMsg("Error", "No se pudo guardar el activo", "error");
        }
    };

    const insumosFiltrados = busquedaInsumo ? insumos.filter(i => i.nombre.toLowerCase().includes(busquedaInsumo.toLowerCase())) : [];

    if (!show) return null;

    return (
        <>
            {/* Componente de Mensaje */}
            <MessageModal 
                show={msgModal.show} 
                onClose={() => setMsgModal({...msgModal, show: false})}
                title={msgModal.title}
                message={msgModal.message}
                type={msgModal.type}
            />

            <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto'}}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content shadow-lg">
                        <div className="modal-header bg-dark text-white">
                            <h5 className="modal-title">
                                {activo ? <span><i className="bi bi-gear-wide-connected me-2"></i>Configurar: {activo.nombre}</span> : 'Nuevo Activo'}
                            </h5>
                            <button className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            {/* TABS */}
                            <ul className="nav nav-tabs mb-4">
                                <li className="nav-item"><button className={`nav-link ${tab==='general'?'active fw-bold':''}`} onClick={()=>setTab('general')}>General</button></li>
                                {activo && <li className="nav-item"><button className={`nav-link ${tab==='kit'?'active fw-bold':''}`} onClick={()=>setTab('kit')}>📦 Kit Mantención</button></li>}
                                {activo && <li className="nav-item"><button className={`nav-link ${tab==='docs'?'active fw-bold':''}`} onClick={()=>setTab('docs')}>📄 Manuales</button></li>}
                            </ul>

                            {/* CONTENIDO TABS */}
                            {tab === 'general' && (
                                <div className="row g-3 fade-in">
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold">Código Interno</label>
                                        <input type="text" className="form-control" placeholder="Ej: PRENSA-01"
                                            value={formData.codigo_interno} onChange={e=>setFormData({...formData, codigo_interno:e.target.value})} />
                                    </div>
                                    <div className="col-md-8">
                                        <label className="form-label fw-bold">Nombre Máquina</label>
                                        <input type="text" className="form-control" placeholder="Ej: Prensa Hidráulica"
                                            value={formData.nombre} onChange={e=>setFormData({...formData, nombre:e.target.value})} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Tipo</label>
                                        <input type="text" className="form-control" placeholder="Ej: Vehículo, Generador" 
                                            value={formData.tipo} onChange={e=>setFormData({...formData, tipo:e.target.value})} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Ubicación</label>
                                        <input type="text" className="form-control" placeholder="Ej: Planta 1, Pasillo B"
                                            value={formData.ubicacion} onChange={e=>setFormData({...formData, ubicacion:e.target.value})} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Descripción</label>
                                        <textarea className="form-control" rows="2" 
                                            value={formData.descripcion} onChange={e=>setFormData({...formData, descripcion:e.target.value})}></textarea>
                                    </div>
                                    {!activo && <div className="col-12 mt-4"><button className="btn btn-success w-100 py-2 fw-bold" onClick={guardarGeneral}>Crear Máquina</button></div>}
                                </div>
                            )}

                            {tab === 'kit' && (
                                <div className="fade-in">
                                    <div className="alert alert-info py-2 small d-flex align-items-center">
                                        <i className="bi bi-info-circle fs-5 me-2"></i>
                                        Los insumos agregados aquí se cargarán automáticamente al crear una OT.
                                    </div>
                                    
                                    <div className="card bg-light border-0 mb-3">
                                        <div className="card-body p-2">
                                            <div className="input-group">
                                                <span className="input-group-text bg-white border-end-0">🔎</span>
                                                <input type="text" className="form-control border-start-0" placeholder="Buscar insumo para agregar..." 
                                                    value={busquedaInsumo} onChange={e => setBusquedaInsumo(e.target.value)} />
                                            </div>
                                            
                                            {insumosFiltrados.length > 0 && (
                                                <ul className="list-group mt-1 shadow-sm" style={{maxHeight:'150px', overflowY:'auto'}}>
                                                    {insumosFiltrados.map(ins => (
                                                        <li key={ins.id} className="list-group-item list-group-item-action cursor-pointer d-flex justify-content-between align-items-center" 
                                                            onClick={() => agregarAlKit(ins)}>
                                                            <div>
                                                                <span className="fw-bold">{ins.nombre}</span> 
                                                                <small className="text-muted ms-2">({ins.codigo_sku})</small>
                                                            </div>
                                                            <i className="bi bi-plus-circle text-primary"></i>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    <div className="table-responsive border rounded">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Insumo</th>
                                                    <th style={{width:'160px'}}>Cant. Requerida</th>
                                                    <th style={{width:'50px'}}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {kitItems.map((k, idx) => (
                                                    <tr key={k.id}>
                                                        <td>
                                                            <div className="fw-medium">{k.nombre}</div>
                                                            <small className="text-muted">{k.codigo_sku}</small>
                                                        </td>
                                                        <td>
                                                            <div className="input-group input-group-sm">
                                                                <input type="number" className="form-control text-center" 
                                                                    value={k.cantidadEdit} 
                                                                    onChange={(e) => handleCantChange(idx, e.target.value)}
                                                                />
                                                                <span className="input-group-text">{k.unidad_medida}</span>
                                                                <button className="btn btn-outline-primary" 
                                                                    title="Guardar Cantidad"
                                                                    onClick={() => actualizarCantidadKit(k)}>
                                                                    <i className="bi bi-save"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="text-end">
                                                            <button className="btn btn-sm text-danger" onClick={()=>quitarDelKit(k.id)}>
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {kitItems.length === 0 && <tr><td colSpan="3" className="text-center text-muted py-3">Kit vacío</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {tab === 'docs' && (
                                <div className="fade-in">
                                    <div className="input-group mb-4">
                                        <input type="file" className="form-control" onChange={e => setFile(e.target.files[0])} />
                                        <button className="btn btn-primary" onClick={subirDoc} disabled={!file}>
                                            <i className="bi bi-upload me-2"></i>Subir
                                        </button>
                                    </div>
                                    <div className="list-group">
                                        {docs.map(d => (
                                            <div key={d.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-file-earmark-text fs-4 text-danger me-3"></i>
                                                    <div>
                                                        <a href={`http://localhost/insuorders/public_html${d.url_archivo}`} target="_blank" className="text-decoration-none fw-bold text-dark stretched-link">
                                                            {d.nombre_archivo}
                                                        </a>
                                                        <div className="small text-muted">Subido el {new Date(d.fecha_subida).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <i className="bi bi-chevron-right text-muted"></i>
                                            </div>
                                        ))}
                                        {docs.length === 0 && <div className="text-center text-muted py-3">No hay documentos adjuntos</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ActivoModal;