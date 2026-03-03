import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';
import ConfirmModal from './ConfirmModal';

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
        unidad_frecuencia: 'MESES',
        activo_padre_id: ''
    });

    const [listaCentros, setListaCentros] = useState([]);
    const [listaActivos, setListaActivos] = useState([]); 
    
    const [mainImage, setMainImage] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [galleryItems, setGalleryItems] = useState([]); 
    const [existingGallery, setExistingGallery] = useState([]); 
    
    const [zoomImage, setZoomImage] = useState(null); 
    const [zoomLevel, setZoomLevel] = useState(1); 

    const [kitItems, setKitItems] = useState([]);
    const [insumosList, setInsumosList] = useState([]);
    const [loadingKit, setLoadingKit] = useState(false);
    
    // --- ESTADOS PARA BUSCADOR DE INSUMOS ---
    const [busquedaInsumo, setBusquedaInsumo] = useState('');
    const [insumoSeleccionado, setInsumoSeleccionado] = useState(null);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const wrapperRef = useRef(null);

    const [docs, setDocs] = useState([]);
    const [file, setFile] = useState(null);
    const [loadingDocs, setLoadingDocs] = useState(false);

    const [saving, setSaving] = useState(false);

    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ show: false, id: null, action: null, title: '', message: '' });

    // Cerrar buscador de insumos al hacer clic afuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setMostrarSugerencias(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (show) {
            setTab('general');
            
            // 1. Cargar Centros de Costo
            api.get('/index.php/mantencion/centros-costo').then(res => {
                if(res.data.success) setListaCentros(res.data.data || []);
            }).catch(console.error);
            
            // 2. CORRECCIÓN: Cargar TODO EL INVENTARIO (No los filtros de compras)
            api.get('/index.php/inventario').then(res => {
                if(res.data.success) setInsumosList(res.data.data || []);
            }).catch(console.error);

            // 3. Cargar todos los activos para el selector de Sub-Equipo
            api.get('/index.php/mantencion/activos').then(res => {
                if(res.data.success) setListaActivos(res.data.data || []);
            }).catch(console.error);

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
                    unidad_frecuencia: activo.unidad_frecuencia || 'MESES',
                    activo_padre_id: activo.activo_padre_id || '' 
                });
                
                if (activo.imagen_url || activo.imagen_principal) {
                    setMainImagePreview(`${BASE_URL}${activo.imagen_url || activo.imagen_principal}`);
                } else {
                    setMainImagePreview(null);
                }
                
                setMainImage(null);
                setGalleryItems([]);
                
                cargarGaleria(activo.id);
                cargarKit(activo.id);
                cargarDocs(activo.id);
            } else {
                setFormData({
                    codigo_interno: '', codigo_maquina: '', nombre: '', tipo: '', marca: '', modelo: '', anio: '',
                    numero_serie: '', ubicacion: '', estado_activo: 'OPERATIVO', descripcion: '', centro_costo: '',
                    frecuencia_mantencion: '', unidad_frecuencia: 'MESES', activo_padre_id: ''
                });
                setMainImage(null); setMainImagePreview(null); setGalleryItems([]); setExistingGallery([]);
                setKitItems([]); setDocs([]);
            }
            
            setBusquedaInsumo('');
            setInsumoSeleccionado(null);
        }
    }, [show, activo]);

    const cargarGaleria = (id) => {
        api.get(`/index.php/mantencion/galeria?id=${id}`)
            .then(res => { if(res.data.success) setExistingGallery(res.data.data || []); })
            .catch(console.error);
    };

    const cargarKit = (id) => {
        setLoadingKit(true);
        api.get(`/index.php/mantencion/kit?id=${id}`)
            .then(res => { if(res.data.success) setKitItems(res.data.data || []); })
            .catch(console.error)
            .finally(() => setLoadingKit(false));
    };

    const cargarDocs = (id) => {
        setLoadingDocs(true);
        api.get(`/index.php/mantencion/docs?id=${id}`)
            .then(res => { if(res.data.success) setDocs(res.data.data || []); })
            .catch(console.error)
            .finally(() => setLoadingDocs(false));
    };

    const handleSubmitGeneral = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formDataObj = new FormData();
            Object.keys(formData).forEach(key => {
                formDataObj.append(key, formData[key] === null ? '' : formData[key]);
            });

            if (mainImage) formDataObj.append('imagen_principal', mainImage);
            
            // CORRECCIÓN GALERÍA: Usar los nombres de variable exactos que espera MantencionService.php
            galleryItems.forEach((file) => {
                formDataObj.append('galeria_files[]', file);
                formDataObj.append('galeria_tipos[]', 'General');
            });

            let res;
            if (activo) {
                formDataObj.append('id', activo.id);
                res = await api.post('/index.php/mantencion/editar-activo', formDataObj, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                res = await api.post('/index.php/mantencion/crear-activo', formDataObj, { headers: { 'Content-Type': 'multipart/form-data' } });
            }

            if (res.data.success) {
                setMsgModal({ show: true, title: 'Éxito', message: 'Activo guardado correctamente.', type: 'success' });
                onSave();
                if (!activo) {
                    setTimeout(onClose, 1000);
                } else { 
                    setMainImage(null); 
                    setGalleryItems([]); 
                    cargarGaleria(activo.id); 
                }
            }
        } catch (error) {
            setMsgModal({ show: true, title: 'Error', message: error.response?.data?.message || 'Ocurrió un error al guardar.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleAddKitItem = async () => {
        const cant = document.getElementById('nuevaCantidad').value;
        if (!insumoSeleccionado || !cant) return setMsgModal({show:true, title:'Error', message:'Faltan datos de insumo o cantidad', type:'warning'});

        try {
            await api.post('/index.php/mantencion/kit', { activo_id: activo.id, insumo_id: insumoSeleccionado.id, cantidad: cant });
            setInsumoSeleccionado(null);
            setBusquedaInsumo('');
            document.getElementById('nuevaCantidad').value = '';
            cargarKit(activo.id);
        } catch (e) {
            setMsgModal({show:true, title:'Error', message:'No se pudo agregar', type:'error'});
        }
    };

    const handleDeleteKit = (id) => {
        api.delete(`/index.php/mantencion/kit?id=${id}`).then(() => cargarKit(activo.id)).catch(console.error);
    };

    const subirDoc = async () => {
        if (!file || !activo) return;
        const data = new FormData();
        data.append('activo_id', activo.id);
        data.append('documento', file);
        data.append('nombre_archivo', file.name);

        try {
            await api.post('/index.php/mantencion/docs', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setFile(null);
            document.getElementById('fileInput').value = '';
            cargarDocs(activo.id);
        } catch(e) { console.error(e); }
    };

    const solicitarBorrarDoc = (id) => {
        setConfirmModal({
            show: true, id: id, title: 'Borrar Documento', message: '¿Estás seguro de borrar este archivo?',
            action: () => {
                api.delete(`/index.php/mantencion/docs?id=${id}`).then(() => {
                    setConfirmModal({ show: false, id: null, action: null });
                    cargarDocs(activo.id);
                });
            }
        });
    };

    const handleDeleteImage = (id, type) => {
        setConfirmModal({
            show: true, id: id, title: 'Eliminar Imagen', message: `¿Seguro de eliminar esta imagen ${type === 'principal' ? 'principal' : 'de la galería'}?`,
            action: async () => {
                try {
                    await api.delete(`/index.php/mantencion/imagen?id=${id}&tipo=${type}&activo_id=${activo.id}`);
                    setConfirmModal({ show: false, id: null });
                    if (type === 'principal') setMainImagePreview(null);
                    else cargarGaleria(activo.id);
                    onSave(); 
                } catch(e) { console.error(e); }
            }
        });
    };

    // Filtro para el buscador interactivo de insumos
    const insumosFiltrados = busquedaInsumo
        ? insumosList.filter(i =>
            i.nombre.toLowerCase().includes(busquedaInsumo.toLowerCase()) ||
            (i.codigo_sku && i.codigo_sku.toLowerCase().includes(busquedaInsumo.toLowerCase()))
        ).slice(0, 15)
        : insumosList.slice(0, 15);

    if (!show) return null;

    return (
        <>
            <MessageModal show={msgModal.show} onClose={() => setMsgModal({...msgModal, show: false})} title={msgModal.title} message={msgModal.message} type={msgModal.type} />
            <ConfirmModal show={confirmModal.show} onClose={() => setConfirmModal({...confirmModal, show: false})} onConfirm={confirmModal.action} title={confirmModal.title} message={confirmModal.message} />
            
            {zoomImage && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1070 }} onClick={() => setZoomImage(null)}>
                    <div className="position-relative text-center p-4">
                        <div className="btn-group position-absolute top-0 start-50 translate-middle-x mt-3" onClick={e => e.stopPropagation()}>
                            <button className="btn btn-light" onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}><i className="bi bi-zoom-in"></i></button>
                            <button className="btn btn-light" onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 0.5))}><i className="bi bi-zoom-out"></i></button>
                            <button className="btn btn-danger" onClick={() => setZoomImage(null)}><i className="bi bi-x-lg"></i></button>
                        </div>
                        <img src={zoomImage} alt="Zoom" className="img-fluid shadow-lg rounded mt-5" style={{ maxHeight: '80vh', maxWidth: '90vw', transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
                    </div>
                </div>
            )}

            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header bg-dark text-white border-bottom-0 py-3">
                            <h5 className="modal-title fw-bold"><i className="bi bi-box me-2 text-warning"></i>{activo ? `Editar: ${activo.nombre}` : 'Nuevo Activo'}</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={saving}></button>
                        </div>
                        
                        <div className="modal-body p-0 d-flex flex-column flex-md-row">
                            
                            {/* MENU VERTICAL */}
                            <div className="bg-light border-end p-3 d-flex flex-column gap-2" style={{ minWidth: '220px' }}>
                                <button className={`btn text-start fw-bold w-100 shadow-sm ${tab === 'general' ? 'btn-primary' : 'btn-white border text-muted'}`} onClick={() => setTab('general')}><i className="bi bi-info-circle me-2"></i>Datos Generales</button>
                                {activo && (
                                    <>
                                        <button className={`btn text-start fw-bold w-100 shadow-sm ${tab === 'galeria' ? 'btn-primary' : 'btn-white border text-muted'}`} onClick={() => setTab('galeria')}><i className="bi bi-images me-2"></i>Galería de Fotos</button>
                                        <button className={`btn text-start fw-bold w-100 shadow-sm ${tab === 'kit' ? 'btn-primary' : 'btn-white border text-muted'}`} onClick={() => setTab('kit')}><i className="bi bi-tools me-2"></i>Kit Mantenimiento</button>
                                        <button className={`btn text-start fw-bold w-100 shadow-sm ${tab === 'docs' ? 'btn-primary' : 'btn-white border text-muted'}`} onClick={() => setTab('docs')}><i className="bi bi-file-earmark-pdf me-2"></i>Documentos</button>
                                    </>
                                )}
                            </div>

                            <div className="p-4 flex-grow-1 bg-white" style={{ minHeight: '60vh' }}>
                                
                                <form onSubmit={handleSubmitGeneral} className={(tab === 'general' || tab === 'galeria') ? "d-flex flex-column h-100" : "d-none"}>
                                    
                                    {/* TAB 1: DATOS GENERALES */}
                                    <div className={tab === 'general' ? 'd-block' : 'd-none'}>
                                        <div className="row g-3">
                                            
                                            <div className="col-12 mb-2">
                                                <label className="form-label fw-bold text-muted small text-uppercase">
                                                    <i className="bi bi-diagram-2 me-1"></i> Sub-Equipo De (Opcional)
                                                </label>
                                                <select 
                                                    className="form-select border-primary shadow-sm" 
                                                    value={formData.activo_padre_id} 
                                                    onChange={e => setFormData({...formData, activo_padre_id: e.target.value})}
                                                >
                                                    <option value="">-- Ninguno (Es una máquina principal) --</option>
                                                    {listaActivos.filter(a => a.id !== activo?.id).map(a => (
                                                        <option key={a.id} value={a.id}>
                                                            {a.codigo_interno} - {a.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                                <small className="text-muted fst-italic">Indique si pertenece a otra máquina.</small>
                                            </div>

                                            <div className="col-md-6"><label className="form-label fw-bold text-muted small text-uppercase">Nombre del Activo <span className="text-danger">*</span></label><input type="text" className="form-control" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required /></div>
                                            <div className="col-md-3"><label className="form-label fw-bold text-muted small text-uppercase">Cód. Interno <span className="text-danger">*</span></label><input type="text" className="form-control font-monospace" value={formData.codigo_interno} onChange={e => setFormData({...formData, codigo_interno: e.target.value})} required /></div>
                                            <div className="col-md-3"><label className="form-label fw-bold text-muted small text-uppercase">Cód. Fabricante</label><input type="text" className="form-control font-monospace" value={formData.codigo_maquina} onChange={e => setFormData({...formData, codigo_maquina: e.target.value})} /></div>
                                            
                                            <div className="col-md-3"><label className="form-label fw-bold text-muted small text-uppercase">Tipo</label><input type="text" className="form-control" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} /></div>
                                            <div className="col-md-3"><label className="form-label fw-bold text-muted small text-uppercase">Marca</label><input type="text" className="form-control" value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} /></div>
                                            <div className="col-md-3"><label className="form-label fw-bold text-muted small text-uppercase">Modelo</label><input type="text" className="form-control" value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} /></div>
                                            <div className="col-md-3"><label className="form-label fw-bold text-muted small text-uppercase">N° Serie</label><input type="text" className="form-control" value={formData.numero_serie} onChange={e => setFormData({...formData, numero_serie: e.target.value})} /></div>

                                            <div className="col-md-4"><label className="form-label fw-bold text-muted small text-uppercase">Ubicación</label><input type="text" className="form-control" value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} /></div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-bold text-muted small text-uppercase">Centro de Costo</label>
                                                <select className="form-select" value={formData.centro_costo} onChange={e => setFormData({...formData, centro_costo: e.target.value})}>
                                                    <option value="">Seleccione...</option>
                                                    {listaCentros.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-bold text-muted small text-uppercase">Estado</label>
                                                <select className="form-select fw-bold" value={formData.estado_activo} onChange={e => setFormData({...formData, estado_activo: e.target.value})}>
                                                    <option value="OPERATIVO" className="text-success">🟢 Operativo</option>
                                                    <option value="FUERA DE SERVICIO" className="text-danger">🔴 Fuera de Servicio</option>
                                                    <option value="EN MANTENCION" className="text-warning">🟡 En Mantención</option>
                                                </select>
                                            </div>

                                            <div className="col-12"><label className="form-label fw-bold text-muted small text-uppercase">Descripción / Notas</label><textarea className="form-control" rows="3" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})}></textarea></div>
                                        </div>
                                    </div>

                                    {/* TAB 2: GALERÍA DE FOTOS */}
                                    <div className={tab === 'galeria' ? 'd-block' : 'd-none'}>
                                        <h5 className="fw-bold mb-4 border-bottom pb-2"><i className="bi bi-images text-primary me-2"></i>Gestión de Fotografías</h5>
                                        <div className="row g-4">
                                            <div className="col-md-4">
                                                <label className="form-label fw-bold text-muted small text-uppercase">Imagen Principal (Portada)</label>
                                                {mainImagePreview ? (
                                                    <div className="position-relative border rounded shadow-sm w-100 mb-3 bg-light" style={{height:'180px', overflow:'hidden'}}>
                                                        <img src={mainImagePreview} className="w-100 h-100" style={{objectFit:'contain', cursor:'pointer'}} onClick={() => {setZoomImage(mainImagePreview); setZoomLevel(1);}} alt="Portada"/>
                                                        {activo?.imagen_url && <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle shadow" onClick={() => handleDeleteImage(null, 'principal')} title="Eliminar Foto Principal"><i className="bi bi-trash"></i></button>}
                                                    </div>
                                                ) : (
                                                    <div className="border rounded d-flex align-items-center justify-content-center bg-light w-100 mb-3 text-muted" style={{height:'180px'}}>
                                                        <div className="text-center"><i className="bi bi-camera fs-1 d-block mb-1"></i>Sin portada</div>
                                                    </div>
                                                )}
                                                <input type="file" className="form-control form-control-sm" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if(file) {
                                                        setMainImage(file);
                                                        setMainImagePreview(URL.createObjectURL(file));
                                                    }
                                                }}/>
                                            </div>

                                            {activo && (
                                                <div className="col-md-8 border-start ps-4">
                                                    <label className="form-label fw-bold text-muted small text-uppercase d-flex justify-content-between">
                                                        <span>Galería Adicional</span>
                                                        <span className="badge bg-secondary">{existingGallery.length} fotos</span>
                                                    </label>
                                                    
                                                    <div className="d-flex flex-wrap gap-2 pb-3 mb-3 border-bottom">
                                                        {existingGallery.map(img => (
                                                            <div key={img.id} className="position-relative border rounded shadow-sm" style={{width:'100px', height:'100px', backgroundColor:'#fff'}}>
                                                                <img src={`${BASE_URL}${img.imagen_url || img.url_imagen}`} className="w-100 h-100 rounded" style={{objectFit:'cover', cursor:'pointer'}} onClick={() => {setZoomImage(`${BASE_URL}${img.imagen_url || img.url_imagen}`); setZoomLevel(1);}} alt="Galeria" />
                                                                <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 p-1 lh-1 shadow-sm" onClick={() => handleDeleteImage(img.id, 'galeria')}><i className="bi bi-x-circle-fill"></i></button>
                                                            </div>
                                                        ))}
                                                        {existingGallery.length === 0 && <div className="text-muted small py-4 fst-italic w-100 text-center bg-light rounded border">No hay fotos adicionales guardadas.</div>}
                                                    </div>

                                                    <label className="form-label fw-bold text-primary small"><i className="bi bi-plus-circle me-1"></i>Añadir nuevas fotos</label>
                                                    <input type="file" className="form-control form-control-sm" accept="image/*" multiple onChange={(e) => {
                                                        const files = Array.from(e.target.files);
                                                        setGalleryItems(prev => [...prev, ...files]);
                                                    }}/>
                                                    
                                                    {galleryItems.length > 0 && (
                                                        <div className="mt-2 d-flex flex-wrap gap-2">
                                                            {galleryItems.map((file, idx) => (
                                                                <span key={idx} className="badge bg-success bg-opacity-10 text-success border border-success d-flex align-items-center">
                                                                    <i className="bi bi-image me-1"></i> {file.name.substring(0, 15)}...
                                                                    <i className="bi bi-x-circle-fill ms-2 cursor-pointer" onClick={() => setGalleryItems(prev => prev.filter((_, i) => i !== idx))}></i>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-end mt-auto pt-3 border-top position-sticky bottom-0 bg-white py-2" style={{zIndex: 10}}>
                                        <button type="submit" className="btn btn-success fw-bold px-4 shadow-sm" disabled={saving}>
                                            {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="bi bi-save me-2"></i>Guardar Activo</>}
                                        </button>
                                    </div>
                                </form>

                                {/* TAB 3: KIT DE MANTENCION (CON BUSCADOR MEJORADO Y INVENTARIO FULL) */}
                                {activo && (
                                    <div className={tab === 'kit' ? 'd-block' : 'd-none'}>
                                        <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-tools text-primary me-2"></i>Kit de Repuestos Sugeridos</h5>
                                        <div className="alert alert-info border-info d-flex align-items-center p-3 shadow-sm">
                                            <i className="bi bi-info-circle-fill fs-3 me-3 text-info"></i>
                                            <div>Estos insumos se cargarán automáticamente al abrir una Solicitud de Mantención para este equipo.</div>
                                        </div>
                                        
                                        <div className="row g-2 mb-4 bg-light p-3 rounded border shadow-sm align-items-end">
                                            <div className="col-12 col-md-7 position-relative" ref={wrapperRef}>
                                                <label className="small fw-bold text-muted mb-1">Buscar Insumo / Repuesto</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        placeholder="Escriba nombre o SKU..."
                                                        value={busquedaInsumo}
                                                        onChange={e => {
                                                            setBusquedaInsumo(e.target.value);
                                                            setInsumoSeleccionado(null);
                                                            setMostrarSugerencias(true);
                                                        }}
                                                        onFocus={() => setMostrarSugerencias(true)}
                                                    />
                                                </div>
                                                
                                                {/* LISTA DESPLEGABLE BUSCADOR */}
                                                {mostrarSugerencias && (
                                                    <ul className="list-group position-absolute w-100 shadow mt-1" style={{ zIndex: 1050, maxHeight: '220px', overflowY: 'auto', left: 0 }}>
                                                        {insumosFiltrados.length > 0 ? insumosFiltrados.map(ins => (
                                                            <li key={ins.id} 
                                                                className="list-group-item list-group-item-action cursor-pointer d-flex justify-content-between align-items-center"
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    setInsumoSeleccionado(ins);
                                                                    setBusquedaInsumo(`${ins.codigo_sku} - ${ins.nombre}`);
                                                                    setMostrarSugerencias(false);
                                                                }}
                                                            >
                                                                <div>
                                                                    <div className="fw-bold small text-dark">{ins.nombre}</div>
                                                                    <small className="text-muted" style={{fontSize: '0.75rem'}}>{ins.codigo_sku}</small>
                                                                </div>
                                                                <span className={`badge rounded-pill ${parseFloat(ins.stock_actual) > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                                    Stock: {ins.stock_actual}
                                                                </span>
                                                            </li>
                                                        )) : (
                                                            <li className="list-group-item text-center text-muted small py-3">No se encontraron resultados</li>
                                                        )}
                                                    </ul>
                                                )}
                                            </div>
                                            
                                            <div className="col-8 col-md-3">
                                                <label className="small fw-bold text-muted mb-1">Cant. Default</label>
                                                <input type="number" id="nuevaCantidad" className="form-control text-center fw-bold" placeholder="0.0" min="0.1" step="0.1" />
                                            </div>
                                            
                                            <div className="col-4 col-md-2">
                                                <button type="button" className="btn btn-primary w-100 fw-bold shadow-sm" onClick={handleAddKitItem}>Agregar</button>
                                            </div>
                                        </div>
                                        
                                        <div className="table-responsive">
                                            {loadingKit ? <div className="text-center py-5"><div className="spinner-border text-primary"></div></div> : (
                                                <table className="table table-hover align-middle border shadow-sm">
                                                    <thead className="table-light text-secondary small text-uppercase">
                                                        <tr>
                                                            <th className="ps-3">Ref. / Jerarquía</th>
                                                            <th>SKU</th>
                                                            <th>Insumo</th>
                                                            <th className="text-center">Cantidad</th>
                                                            <th className="text-end pe-3">Acción</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {kitItems.map(k => (
                                                            <tr key={k.id}>
                                                                <td className="ps-3">
                                                                    {k.activo_id === activo.id ? (
                                                                        <span className="badge bg-primary text-white shadow-sm">Directo</span>
                                                                    ) : (
                                                                        <span className="badge bg-light text-dark border"><i className="bi bi-diagram-2 me-1 text-primary"></i>De: {k.origen_codigo || k.origen_nombre}</span>
                                                                    )}
                                                                </td>
                                                                <td className="font-monospace text-muted small">{k.insumo_sku}</td>
                                                                <td className="fw-bold text-dark">{k.insumo_nombre || k.nombre}</td>
                                                                <td className="text-center fw-bold text-success">{k.cantidad_sugerida || k.cantidad} <span className="small text-muted fw-normal">{k.unidad_medida}</span></td>
                                                                <td className="text-end pe-3">
                                                                    {k.activo_id === activo.id && (
                                                                        <button className="btn btn-sm text-danger border-0" title="Quitar de este kit" onClick={() => handleDeleteKit(k.id)}><i className="bi bi-trash-fill fs-5"></i></button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {kitItems.length === 0 && <tr><td colSpan="5" className="text-center py-5 text-muted fst-italic">No hay repuestos configurados.</td></tr>}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* TAB 4: DOCUMENTOS */}
                                {activo && (
                                    <div className={tab === 'docs' ? 'd-block' : 'd-none'}>
                                        <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-file-earmark-text text-primary me-2"></i>Manuales y Planos</h5>
                                        <div className="input-group mb-4 shadow-sm">
                                            <input type="file" id="fileInput" className="form-control bg-white" onChange={e => setFile(e.target.files[0])} />
                                            <button type="button" className="btn btn-primary fw-bold px-4" onClick={subirDoc} disabled={!file}><i className="bi bi-cloud-upload me-2"></i>Subir Archivo</button>
                                        </div>
                                        
                                        <div className="card border-0 shadow-sm">
                                            {loadingDocs ? <div className="text-center py-5"><div className="spinner-border text-primary"></div></div> : (
                                                <div className="list-group list-group-flush border rounded">
                                                    {docs.map(d => (
                                                        <div key={d.id} className="list-group-item d-flex justify-content-between align-items-center p-3 hover-bg-light">
                                                            <a href={`${BASE_URL}${d.url_archivo}`} target="_blank" rel="noreferrer" className="text-decoration-none text-dark d-flex align-items-center text-truncate">
                                                                <i className="bi bi-file-earmark-pdf-fill me-3 text-danger fs-3"></i>
                                                                <span className="fw-bold text-truncate">{d.nombre_archivo}</span>
                                                            </a>
                                                            <button className="btn btn-sm text-danger flex-shrink-0" title="Borrar Documento" onClick={() => solicitarBorrarDoc(d.id)}><i className="bi bi-trash fs-5"></i></button>
                                                        </div>
                                                    ))}
                                                    {docs.length === 0 && <div className="text-center py-5 text-muted fst-italic">No hay documentos cargados.</div>}
                                                </div>
                                            )}
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