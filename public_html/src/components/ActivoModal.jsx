import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';
import ConfirmModal from './ConfirmModal';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const BASE_URL = '/api';

const ActivoModal = ({ show, onClose, activo, onSave }) => {
    const [tab, setTab] = useState('general');

    const [formData, setFormData] = useState({
        codigo_interno: '',
        codigo_maquina: '',
        nombre: '',
        tipo: '',
        marca: '',
        modelo: '',
        anio: '',
        numero_serie: '',
        ubicacion: '',
        estado_activo: 'OPERATIVO',
        descripcion: '',
        centro_costo: '',
        frecuencia_mantencion: '',
        unidad_frecuencia: 'MESES'
    });

    const [listaCentros, setListaCentros] = useState([]);

    // --- ESTADOS PARA IMÁGENES ---
    const [mainImage, setMainImage] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [galleryItems, setGalleryItems] = useState([]);
    const [existingGallery, setExistingGallery] = useState([]);
    const [zoomImage, setZoomImage] = useState(null);

    // --- ESTADOS EXISTENTES ---
    const [kitItems, setKitItems] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [busquedaInsumo, setBusquedaInsumo] = useState('');
    const [cantidadKit, setCantidadKit] = useState(1);
    const [docs, setDocs] = useState([]);
    const [file, setFile] = useState(null);
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });
    const [confirm, setConfirm] = useState({ show: false, title: '', message: '', action: null });
    const [saving, setSaving] = useState(false);

    const showMessage = (title, message, type = 'error') => {
        setMsgModal({ show: true, title, message, type });
    };

    useEffect(() => {
        if (show) {
            setSaving(false);
            setMainImage(null);
            setMainImagePreview(null);
            setGalleryItems([]);
            setExistingGallery([]);

            api.get('/index.php/mantencion/centros-costo').then(res => { if (res.data.success) setListaCentros(res.data.data); });

            if (activo) {
                setFormData({
                    codigo_interno: activo.codigo_interno || '',
                    codigo_maquina: activo.codigo_maquina || '',
                    nombre: activo.nombre || '',
                    tipo: activo.tipo || '',
                    marca: activo.marca || '',
                    modelo: activo.modelo || '',
                    anio: activo.anio || '',
                    numero_serie: activo.numero_serie || '',
                    ubicacion: activo.ubicacion || '',
                    estado_activo: activo.estado_activo || 'OPERATIVO',
                    descripcion: activo.descripcion || '',
                    centro_costo: activo.centro_costo_id || '',
                    frecuencia_mantencion: activo.frecuencia_mantencion || '',
                    unidad_frecuencia: activo.unidad_frecuencia || 'MESES'
                });

                if (activo.imagen_url) {
                    const url = activo.imagen_url.startsWith('http') ? activo.imagen_url : `${BASE_URL}${activo.imagen_url}`;
                    setMainImagePreview(url);
                }

                api.get(`/index.php/mantencion/galeria?id=${activo.id}`)
                    .then(res => { if (res.data.success) setExistingGallery(res.data.data); });

                cargarKit(activo.id);
                cargarDocs(activo.id);
            } else {
                setFormData({
                    codigo_interno: '', codigo_maquina: '', nombre: '', tipo: '',
                    marca: '', modelo: '', anio: '', numero_serie: '',
                    ubicacion: '', estado_activo: 'OPERATIVO', descripcion: '', centro_costo: '',
                    frecuencia_mantencion: '', unidad_frecuencia: 'MESES'
                });
                setKitItems([]);
                setDocs([]);
            }
            api.get('/index.php/inventario').then(res => setInsumos(res.data.data || []));
            setTab('general');
        }
    }, [show, activo]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleMainImageChange = (e) => { const file = e.target.files[0]; if (file) { setMainImage(file); setMainImagePreview(URL.createObjectURL(file)); } };
    const handleAddGalleryItem = (e) => { const file = e.target.files[0]; if (file) { const newItem = { file, preview: URL.createObjectURL(file), tipo: 'General' }; setGalleryItems([...galleryItems, newItem]); } e.target.value = ''; };
    const handleGalleryTypeChange = (index, newType) => { const updatedItems = [...galleryItems]; updatedItems[index].tipo = newType; setGalleryItems(updatedItems); };
    const handleRemoveGalleryItem = (index) => { setGalleryItems(galleryItems.filter((_, i) => i !== index)); };

    const handleSubmitGeneral = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const dataToSend = new FormData();
            Object.keys(formData).forEach(key => { dataToSend.append(key, formData[key] ?? ''); });
            if (activo) dataToSend.append('id', activo.id);
            if (mainImage) dataToSend.append('imagen_principal', mainImage);
            galleryItems.forEach((item) => {
                dataToSend.append('galeria_files[]', item.file);
                dataToSend.append('galeria_tipos[]', item.tipo);
            });

            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const url = activo ? '/index.php/mantencion/editar-activo' : '/index.php/mantencion/crear-activo';
            await api.post(url, dataToSend, config);

            showMessage("Éxito", "Activo guardado correctamente", "success");
            setTimeout(() => { onSave(); onClose(); }, 1000);
        } catch (error) {
            showMessage("Error", error.response?.data?.message || "Error al guardar", "error");
        } finally { setSaving(false); }
    };

    const cargarKit = async (id) => { try { const res = await api.get(`/index.php/mantencion/kit?id=${id}`); setKitItems(res.data.data || []); } catch (e) { setKitItems([]); } };
    const agregarAlKit = async (insumo) => { if (!activo) return showMessage("Atención", "Guarda el activo primero.", "warning"); try { await api.post('/index.php/mantencion/kit', { activo_id: activo.id, insumo_id: insumo.id, cantidad: cantidadKit }); cargarKit(activo.id); setBusquedaInsumo(''); setCantidadKit(1); } catch (e) { showMessage("Error", "Error al agregar", "error"); } };
    const actualizarCantKit = async (insumoId, nuevaCant) => { const c = parseInt(nuevaCant); if (isNaN(c) || c < 1) return; try { await api.put('/index.php/mantencion/kit', { activo_id: activo.id, insumo_id: insumoId, cantidad: c }); cargarKit(activo.id); } catch (e) { } };
    const solicitarQuitarKit = (insumoId) => { setConfirm({ show: true, title: "Eliminar", message: "¿Quitar repuesto?", action: async () => { await api.delete(`/index.php/mantencion/kit?activo_id=${activo.id}&insumo_id=${insumoId}`); cargarKit(activo.id); } }); };
    const cargarDocs = async (id) => { try { const res = await api.get(`/index.php/mantencion/docs?id=${id}`); setDocs(res.data.data || []); } catch (e) { } };
    const subirDoc = async () => { if (!file || !activo) return; const d = new FormData(); d.append('activo_id', activo.id); d.append('archivo', file); try { await api.post('/index.php/mantencion/docs', d, { headers: { 'Content-Type': 'multipart/form-data' } }); setFile(null); document.getElementById('fileInput').value = ""; cargarDocs(activo.id); } catch (e) { showMessage("Error", "Error al subir", "error"); } };
    const solicitarBorrarDoc = (docId) => { setConfirm({ show: true, title: "Eliminar", message: "¿Borrar archivo?", action: async () => { await api.delete(`/index.php/mantencion/docs?id=${docId}`); cargarDocs(activo.id); } }); };
    const handleConfirm = () => { if (confirm.action) confirm.action(); setConfirm({ ...confirm, show: false, action: null }); };

    if (!show) return null;

    return (
        <>
            <MessageModal show={msgModal.show} onClose={() => setMsgModal({ ...msgModal, show: false })} title={msgModal.title} message={msgModal.message} type={msgModal.type} />
            <ConfirmModal show={confirm.show} onClose={() => setConfirm({ ...confirm, show: false })} onConfirm={handleConfirm} title={confirm.title} message={confirm.message} confirmText="Confirmar" type="danger" />

            <Modal show={!!zoomImage} onHide={() => setZoomImage(null)} centered size="lg" className="bg-dark bg-opacity-75">
                <Modal.Header closeButton className="bg-white border-0 py-2"></Modal.Header>
                <Modal.Body className="p-0 text-center bg-white">
                    <img src={zoomImage} alt="Zoom" className="img-fluid" style={{ maxHeight: '85vh', cursor: 'zoom-out' }} onClick={() => setZoomImage(null)} />
                </Modal.Body>
            </Modal>

            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto', zIndex: 1050 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content shadow border-0">
                        <div className="modal-header bg-dark text-white">
                            <h5 className="modal-title fw-bold">{activo ? `🔧 Editar: ${activo.nombre}` : '✨ Nuevo Activo / Máquina'}</h5>
                            <button className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>

                        <div className="modal-body p-0">
                            {activo && (
                                <ul className="nav nav-tabs nav-fill bg-light px-3 pt-3 border-bottom-0">
                                    <li className="nav-item"><button className={`nav-link fw-bold ${tab === 'general' ? 'active' : ''}`} onClick={() => setTab('general')}>General</button></li>
                                    <li className="nav-item"><button className={`nav-link fw-bold ${tab === 'imagenes' ? 'active' : ''}`} onClick={() => setTab('imagenes')}>Imágenes</button></li>
                                    <li className="nav-item"><button className={`nav-link fw-bold ${tab === 'kit' ? 'active' : ''}`} onClick={() => setTab('kit')}>Kit Repuestos</button></li>
                                    <li className="nav-item"><button className={`nav-link fw-bold ${tab === 'docs' ? 'active' : ''}`} onClick={() => setTab('docs')}>Documentación</button></li>
                                </ul>
                            )}

                            <div className="p-4 bg-white">
                                {tab === 'general' && (
                                    <form onSubmit={handleSubmitGeneral}>
                                        <div className="row g-3">
                                            <div className="col-12 mb-3">
                                                <div className="d-flex align-items-center bg-light p-2 rounded border">
                                                    <div className="me-3 shadow-sm border rounded overflow-hidden bg-white"
                                                        style={{ width: '85px', height: '85px', cursor: mainImagePreview ? 'zoom-in' : 'default' }}
                                                        onClick={() => mainImagePreview && setZoomImage(mainImagePreview)}>
                                                        {mainImagePreview ? (
                                                            <img src={mainImagePreview} alt="Port" className="w-100 h-100 object-fit-cover" />
                                                        ) : (
                                                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                                                <i className="bi bi-camera fs-2"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <label className="form-label small fw-bold text-primary mb-1">Imagen Principal (Click en foto para ampliar)</label>
                                                        <input type="file" className="form-control form-control-sm" accept="image/*" onChange={handleMainImageChange} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6"><label className="form-label small fw-bold text-muted">CÓDIGO INTERNO</label><input type="text" name="codigo_interno" className="form-control fw-bold" required value={formData.codigo_interno} onChange={handleChange} /></div>
                                            <div className="col-md-6"><label className="form-label small fw-bold text-muted">CÓDIGO MÁQUINA</label><input type="text" name="codigo_maquina" className="form-control" value={formData.codigo_maquina} onChange={handleChange} /></div>
                                            <div className="col-12"><label className="form-label small fw-bold text-muted">NOMBRE ACTIVO</label><input type="text" name="nombre" className="form-control" required value={formData.nombre} onChange={handleChange} /></div>
                                            <div className="col-md-4"><label className="form-label small fw-bold text-muted">MARCA</label><input type="text" name="marca" className="form-control" value={formData.marca} onChange={handleChange} /></div>
                                            <div className="col-md-4"><label className="form-label small fw-bold text-muted">MODELO</label><input type="text" name="modelo" className="form-control" value={formData.modelo} onChange={handleChange} /></div>
                                            <div className="col-md-4"><label className="form-label small fw-bold text-muted">AÑO</label><input type="number" name="anio" className="form-control" value={formData.anio} onChange={handleChange} /></div>

                                            <div className="col-12 mt-3"><h6 className="text-primary small fw-bold border-bottom pb-2">PLANIFICACIÓN</h6></div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">FRECUENCIA MANTENCIÓN</label>
                                                <div className="input-group">
                                                    <input type="number" name="frecuencia_mantencion" className="form-control" placeholder="Ej: 3" min="0" value={formData.frecuencia_mantencion} onChange={handleChange} />
                                                    <select name="unidad_frecuencia" className="form-select bg-light" value={formData.unidad_frecuencia} onChange={handleChange}>
                                                        <option value="DIAS">Días</option>
                                                        <option value="SEMANAS">Semanas</option>
                                                        <option value="MESES">Meses</option>
                                                        <option value="ANIOS">Años</option>
                                                    </select>
                                                </div>
                                                <div className="form-text small">Cada cuánto tiempo se debe realizar mantención. Dejar en 0 si no aplica.</div>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">ESTADO ACTUAL</label>
                                                <select name="estado_activo" className="form-select" value={formData.estado_activo} onChange={handleChange}>
                                                    <option value="OPERATIVO">OPERATIVO</option><option value="EN_MANTENCION">EN MANTENCIÓN</option><option value="BAJA">DE BAJA</option>
                                                </select>
                                            </div>

                                            <div className="col-12 mt-3"><h6 className="text-secondary small fw-bold border-bottom pb-2">DETALLES ADICIONALES</h6></div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">TIPO DE ACTIVO</label>
                                                <select name="tipo" className="form-select" value={formData.tipo} onChange={handleChange}>
                                                    <option value="">Seleccione...</option><option value="Maquinaria">Maquinaria</option><option value="Vehículo">Vehículo</option><option value="Generador">Generador</option><option value="Equipo">Equipo</option>
                                                </select>
                                            </div>
                                            <div className="col-md-4"><label className="form-label small fw-bold text-muted">UBICACIÓN FÍSICA</label><input type="text" name="ubicacion" className="form-control" value={formData.ubicacion} onChange={handleChange} /></div>
                                            <div className="col-md-4"><label className="form-label small fw-bold text-muted">SERIE</label><input type="text" name="numero_serie" className="form-control" value={formData.numero_serie} onChange={handleChange} /></div>
                                            <div className="col-md-6"><label className="form-label small fw-bold text-primary">CENTRO DE COSTO</label><select name="centro_costo" className="form-select border-primary" value={formData.centro_costo} onChange={handleChange}><option value="">-- Sin Asignar --</option>{listaCentros.map(cc => <option key={cc.id} value={cc.id}>{cc.codigo} - {cc.nombre}</option>)}</select></div>
                                            <div className="col-12"><label className="form-label small fw-bold text-muted">DESCRIPCIÓN</label><textarea name="descripcion" className="form-control" rows="2" value={formData.descripcion} onChange={handleChange}></textarea></div>
                                        </div>
                                        <div className="modal-footer border-top-0 px-0 pb-0 mt-4 d-flex justify-content-end gap-2">
                                            <button type="button" className="btn btn-outline-secondary px-4" onClick={onClose} disabled={saving}>Cancelar</button>
                                            <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm" disabled={saving}>{saving ? 'Guardando...' : 'Guardar Cambios'}</button>
                                        </div>
                                    </form>
                                )}

                                {tab === 'imagenes' && (
                                    <div>
                                        <div className="mb-4 bg-light p-3 rounded border">
                                            <label className="form-label fw-bold small text-success">AGREGAR NUEVA FOTO A GALERÍA</label>
                                            <input type="file" className="form-control" accept="image/*" onChange={handleAddGalleryItem} />
                                        </div>

                                        {galleryItems.length > 0 && (
                                            <div className="mb-4">
                                                <h6 className="text-success small fw-bold border-bottom pb-2">Fotos nuevas por subir ({galleryItems.length})</h6>
                                                <div className="row g-2">
                                                    {galleryItems.map((item, index) => (
                                                        <div className="col-md-6" key={index}>
                                                            <div className="card p-2 border-success bg-success bg-opacity-10 shadow-sm">
                                                                <div className="d-flex align-items-center">
                                                                    <img src={item.preview} alt="N" style={{ width: '55px', height: '55px', objectFit: 'cover', cursor: 'zoom-in' }}
                                                                        className="me-2 rounded border" onClick={() => setZoomImage(item.preview)} />
                                                                    <select className="form-select form-select-sm" value={item.tipo} onChange={(e) => handleGalleryTypeChange(index, e.target.value)}>
                                                                        <option value="General">General</option><option value="Frente">Frente</option><option value="Atrás">Atrás</option><option value="Motor">Motor</option><option value="Interior">Interior</option>
                                                                    </select>
                                                                    <button className="btn btn-sm text-danger ms-1" onClick={() => handleRemoveGalleryItem(index)}><i className="bi bi-x-circle-fill fs-5"></i></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="d-grid mt-2"><button className="btn btn-success btn-sm fw-bold" onClick={handleSubmitGeneral} disabled={saving}>{saving ? 'Guardando...' : 'Confirmar Subida de Imágenes'}</button></div>
                                            </div>
                                        )}

                                        <h6 className="text-secondary small fw-bold border-bottom pb-2">Galería Guardada (Haz clic para ampliar)</h6>
                                        {existingGallery.length === 0 ? (<p className="text-muted small fst-italic py-3 text-center">Sin imágenes secundarias.</p>) : (
                                            <div className="row g-2">
                                                {existingGallery.map((img) => (
                                                    <div key={img.id} className="col-6 col-md-3">
                                                        <div className="card h-100 border-0 shadow-sm overflow-hidden"
                                                            style={{ cursor: 'zoom-in' }} onClick={() => setZoomImage(`${BASE_URL}${img.imagen_url}`)}>
                                                            <img src={`${BASE_URL}${img.imagen_url}`} className="card-img-top" alt={img.tipo} style={{ height: '110px', objectFit: 'cover' }} />
                                                            <div className="card-footer p-1 bg-white text-center"><small className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}>{img.tipo}</small></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {tab === 'kit' && (
                                    <div>
                                        <div className="mb-3 border p-3 rounded bg-light">
                                            <div className="input-group">
                                                <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                                                <input type="text" className="form-control" placeholder="Buscar insumo..." value={busquedaInsumo} onChange={e => setBusquedaInsumo(e.target.value)} />
                                                <input type="number" className="form-control" style={{ maxWidth: '80px' }} value={cantidadKit} onChange={e => setCantidadKit(parseInt(e.target.value) || 1)} min="1" />
                                            </div>
                                            {busquedaInsumo && (
                                                <div className="list-group position-absolute w-100 shadow mt-1" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                                    {insumos.filter(i =>
                                                        i.nombre.toLowerCase().includes(busquedaInsumo.toLowerCase()) ||
                                                        (i.codigo_sku && i.codigo_sku.toLowerCase().includes(busquedaInsumo.toLowerCase()))
                                                    ).slice(0, 8).map(i => (
                                                        <button key={i.id} className="list-group-item list-group-item-action d-flex justify-content-between" onClick={() => agregarAlKit(i)}><span>{i.nombre}</span><small className="text-muted">{i.codigo_sku}</small></button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <ul className="list-group">
                                            {kitItems.map(k => (
                                                <li key={k.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                    <div><div className="fw-bold">{k.nombre}</div><small className="text-muted">SKU: {k.codigo_sku}</small></div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <input type="number" className="form-control form-control-sm text-center" style={{ width: '70px' }} value={Math.floor(k.cantidad)} onChange={(e) => actualizarCantKit(k.id, e.target.value)} />
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => solicitarQuitarKit(k.id)}><i className="bi bi-trash"></i></button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {tab === 'docs' && (
                                    <div>
                                        <div className="input-group mb-3"><input type="file" id="fileInput" className="form-control" onChange={e => setFile(e.target.files[0])} /><button type="button" className="btn btn-primary" onClick={subirDoc} disabled={!file}><i className="bi bi-cloud-upload me-2"></i>Subir</button></div>
                                        <div className="list-group">
                                            {docs.map(d => (
                                                <div key={d.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                    <a href={`${BASE_URL}${d.url_archivo}`} target="_blank" rel="noreferrer" className="text-decoration-none text-dark d-flex align-items-center"><i className="bi bi-file-earmark-pdf me-2 text-danger fs-5"></i><span>{d.nombre_archivo}</span></a>
                                                    <button className="btn btn-sm text-danger" onClick={() => solicitarBorrarDoc(d.id)}><i className="bi bi-trash"></i></button>
                                                </div>
                                            ))}
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