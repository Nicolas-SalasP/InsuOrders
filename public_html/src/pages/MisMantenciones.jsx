import { useEffect, useState, useContext, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import api from '../api/axiosConfig';
import AuthContext from '../context/AuthContext';
import ChecklistRenderer from '../components/ChecklistRenderer';
import MessageModal from '../components/MessageModal';
import ConfirmModal from '../components/ConfirmModal';
import { usePermission } from '../hooks/usePermission';

const MisMantenciones = () => {
    const { can } = usePermission();
    const { auth: authData } = useContext(AuthContext);
    const [ots, setOts] = useState([]);
    const [selectedOt, setSelectedOt] = useState(null);
    const [detallesOt, setDetallesOt] = useState({ insumos: [], respuestas: [] });
    const [activeTab, setActiveTab] = useState('info');
    const [datosEnvio, setDatosEnvio] = useState({ respuestas: [], firma: null, comentarios: '', archivos: [] });
    const [loading, setLoading] = useState(true);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState('pendientes');
    const [busqueda, setBusqueda] = useState('');
    const [filtroFecha, setFiltroFecha] = useState('');
    const [filtroTecnico, setFiltroTecnico] = useState(null);
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: '' });
    const [confirm, setConfirm] = useState({ show: false, title: '', message: '', action: null });
    
    const esJefe = authData?.rol === 'Jefe Mantención' || authData?.rol === 'Admin';
    const sigCanvas = useRef(null);
    const [enlargedImage, setEnlargedImage] = useState(null); // Estado para el visor de imágenes

    useEffect(() => {
        if (can('ope_mant')) {
            cargarMisOts();
        }
    }, []);

    const cargarMisOts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/mis-mantenciones');
            if (res.data.success) setOts(res.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const obtenerEstadisticasEquipo = () => {
        const stats = {};
        ots.forEach(ot => {
            if (!ot.asignados_ids) return;
            const ids = ot.asignados_ids.toString().split(',');
            const nombres = ot.asignados_nombres ? ot.asignados_nombres.toString().split(', ') : [];

            ids.forEach((id, index) => {
                if (!stats[id]) {
                    stats[id] = {
                        id,
                        nombre: nombres[index] || 'Técnico',
                        pendientes: 0,
                        proceso: 0,
                        terminado: 0
                    };
                }
                if (ot.estado_id === 1 || ot.estado_id === 4) stats[id].pendientes++;
                else if (ot.estado_id === 2) stats[id].proceso++;
                else if (ot.estado_id === 3 || ot.estado_id === 5) stats[id].terminado++;
            });
        });
        return Object.values(stats);
    };

    const teamStats = esJefe ? obtenerEstadisticasEquipo() : [];

    const handleSelectOt = async (ot) => {
        setSelectedOt(ot);
        setLoadingDetalle(true);
        setActiveTab('info');
        setDatosEnvio({ respuestas: [], firma: null, comentarios: '', archivos: [] });
        sigCanvas.current?.clear();
        setEnlargedImage(null);

        try {
            const res = await api.get(`/mis-mantenciones/detalle?id=${ot.id}`);
            if (res.data.success) {
                setDetallesOt({
                    insumos: res.data.data.insumos,
                    respuestas: formatearRespuestas(res.data.data.respuestas)
                });
            }
        } catch (error) {
            console.error("Error cargando detalle", error);
            setMsg({ show: true, title: "Error", text: "No se pudieron cargar los detalles de la OT.", type: "error" });
        } finally {
            setLoadingDetalle(false);
        }
    };

    const formatearRespuestas = (lista) => {
        const mapa = {};
        if (lista) {
            lista.forEach(r => {
                mapa[r.item_key] = { valor: r.valor, observacion: r.observacion };
            });
        }
        return mapa;
    };

    const otsFiltradas = ots.filter(ot => {
        if (filtroTecnico) {
            const asignados = ot.asignados_ids ? ot.asignados_ids.toString().split(',') : [];
            if (!asignados.includes(filtroTecnico.toString())) return false;
        }

        const matchEstado =
            filtroEstado === 'pendientes' ? (ot.estado_id === 1 || ot.estado_id === 4) :
                filtroEstado === 'proceso' ? ot.estado_id === 2 :
                    filtroEstado === 'terminado' ? ot.mi_completado === 1 || ot.estado_id === 5 : true;

        const texto = busqueda.toLowerCase();
        const matchTexto = ot.activo.toLowerCase().includes(texto) ||
            `${ot.solicitante_nombre} ${ot.solicitante_apellido}`.toLowerCase().includes(texto) ||
            ot.id.toString().includes(texto) ||
            (ot.asignados_nombres && ot.asignados_nombres.toLowerCase().includes(texto));

        const matchFecha = filtroFecha ? ot.fecha_solicitud.startsWith(filtroFecha) : true;

        return matchEstado && matchTexto && matchFecha;
    });

    const comprimirImagen = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                    }, 'image/jpeg', 0.3);
                };
            };
        });
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        setGuardando(true); 
        
        const processedFiles = await Promise.all(files.map(async (file) => {
            if (file.type.startsWith('image/')) {
                return await comprimirImagen(file);
            }
            return file;
        }));
        
        setDatosEnvio(prev => ({ ...prev, archivos: [...(prev.archivos || []), ...processedFiles] }));
        setGuardando(false);
    };

    const renderEvidencia = (evidenciaStr) => {
        if (!evidenciaStr) return (
            <div className="p-5 bg-light rounded border text-center text-muted h-100 d-flex flex-column align-items-center justify-content-center">
                <i className="bi bi-image text-secondary opacity-50 display-4 mb-2"></i>
                <span>Sin imagen adjunta</span>
            </div>
        );

        let archivos = [];
        try {
            archivos = JSON.parse(evidenciaStr);
            if (!Array.isArray(archivos)) archivos = [evidenciaStr];
        } catch (e) {
            archivos = [evidenciaStr];
        }

        return (
            <div className="d-flex flex-wrap gap-2 mt-1">
                {archivos.map((url, idx) => {
                    const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
                    return isVideo ? (
                        <video key={idx} src={`/api/${url}`} controls className="rounded border shadow-sm bg-dark" style={{ height: '120px', maxWidth: '100%' }}></video>
                    ) : (
                        <img 
                            key={idx} 
                            src={`/api/${url}`} 
                            alt={`Evidencia ${idx+1}`} 
                            className="rounded border shadow-sm cursor-pointer" 
                            style={{ height: '120px', width: '120px', objectFit: 'cover' }} 
                            onClick={() => setEnlargedImage(`/api/${url}`)} 
                        />
                    );
                })}
            </div>
        );
    };

    const iniciarGuardado = () => {
        if (!selectedOt) return;
        if (datosEnvio.firma) {
            const faltantes = detallesOt.insumos.filter(i => parseFloat(i.stock_usuario || 0) < parseFloat(i.cantidad));

            if (faltantes.length > 0) {
                const itemsLista = faltantes.map(f =>
                    `• ${f.nombre} (Pide: ${parseFloat(f.cantidad)}, Tienes: ${parseFloat(f.stock_usuario || 0)})`
                ).join('\n');

                setConfirm({
                    show: true,
                    title: "⚠️ Stock Insuficiente",
                    message: `No tienes suficiente stock en "Mis Insumos" para cubrir esta OT:\n\n${itemsLista}\n\n¿Estás seguro de finalizar? El sistema registrará el consumo de todas formas.`,
                    action: procesarGuardado
                });
                return;
            }
        }
        procesarGuardado();
    };

    const procesarGuardado = async () => {
        setConfirm({ ...confirm, show: false });
        setGuardando(true);

        try {
            const formData = new FormData();
            formData.append('ot_id', selectedOt.id);
            formData.append('respuestas', JSON.stringify(datosEnvio.respuestas || []));
            if (datosEnvio.firma) formData.append('firma', datosEnvio.firma);
            if (datosEnvio.comentarios) formData.append('comentarios', datosEnvio.comentarios);
            if (datosEnvio.archivos && datosEnvio.archivos.length > 0) {
                datosEnvio.archivos.forEach((file, index) => {
                    formData.append(`evidencia_${index}`, file);
                });
            }

            const res = await api.post('/mis-mantenciones/guardar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setMsg({ show: true, title: datosEnvio.firma ? '¡Trabajo Finalizado!' : 'Avance Guardado', text: 'Operación registrada correctamente.', type: 'success' });
                if (datosEnvio.firma) {
                    cargarMisOts();
                    setSelectedOt(null);
                } else {
                    cargarMisOts();
                }
            }
        } catch (e) {
            setMsg({ show: true, title: 'Error', text: e.response?.data?.message || 'No se pudo guardar el avance.', type: 'error' });
        } finally {
            setGuardando(false);
        }
    };

    if (!can('ope_mant')) {
        return (
            <div className="container h-100 d-flex align-items-center justify-content-center">
                <div className="text-center p-5 shadow rounded bg-white">
                    <i className="bi bi-shield-lock-fill text-danger display-1"></i>
                    <h2 className="mt-3 fw-bold">Acceso Denegado</h2>
                    <p className="text-muted">No tienes el permiso 'ope_mant' para acceder a este módulo.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column bg-light position-relative">
            
            {/* VISOR DE IMÁGENES A PANTALLA COMPLETA */}
            {enlargedImage && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
                    style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999 }} 
                    onClick={() => setEnlargedImage(null)}
                >
                    <div className="position-relative text-center p-3" style={{ maxWidth: '100%', maxHeight: '100%' }}>
                        <button 
                            className="btn btn-light position-absolute top-0 end-0 m-4 rounded-circle shadow-sm d-flex justify-content-center align-items-center" 
                            style={{ zIndex: 10000, width: '45px', height: '45px', transform: 'translate(25%, -25%)' }}
                            onClick={() => setEnlargedImage(null)}
                        >
                            <i className="bi bi-x-lg text-dark fw-bold fs-5"></i>
                        </button>
                        <img 
                            src={enlargedImage} 
                            alt="Ampliación" 
                            className="img-fluid rounded shadow-lg" 
                            style={{ maxHeight: '90vh', maxWidth: '100%', objectFit: 'contain' }}
                            onClick={(e) => e.stopPropagation()} 
                        />
                    </div>
                </div>
            )}

            <MessageModal
                show={msg.show}
                onClose={() => setMsg({ ...msg, show: false })}
                title={msg.title}
                message={msg.text}
                type={msg.type}
            />

            <ConfirmModal
                show={confirm.show}
                onClose={() => setConfirm({ ...confirm, show: false })}
                onConfirm={confirm.action}
                title={confirm.title}
                message={confirm.message}
                confirmText="Sí, Finalizar igual"
                cancelText="Cancelar"
                type="warning"
            />

            <div className="row g-0 flex-grow-1" style={{ minHeight: 0 }}>
                <div className={`col-12 col-md-4 col-lg-3 border-end bg-white d-flex flex-column shadow-sm z-1 ${selectedOt ? 'd-none d-md-flex' : 'd-flex'}`}>
                    {esJefe && (
                        <div className="p-3 bg-light border-bottom" style={{ maxHeight: '35vh', overflowY: 'auto' }}>
                            <div className="d-flex justify-content-between align-items-center mb-2 sticky-top bg-light pt-1 pb-2" style={{ zIndex: 5 }}>
                                <h6 className="fw-bold m-0 text-primary"><i className="bi bi-people-fill me-2"></i>Equipo</h6>
                                {filtroTecnico && <button className="btn btn-xs btn-outline-secondary py-0" onClick={() => setFiltroTecnico(null)}>Ver Todos</button>}
                            </div>
                            <div className="row g-2">
                                <div className="col-6">
                                    <div
                                        className={`card border-0 shadow-sm h-100 cursor-pointer ${filtroTecnico === null ? 'ring-2 ring-primary bg-primary text-white' : 'bg-white'}`}
                                        onClick={() => setFiltroTecnico(null)}
                                    >
                                        <div className="card-body p-2 text-center d-flex flex-column justify-content-center align-items-center">
                                            <div className="fw-bold mb-1 text-truncate w-100">TODOS</div>
                                            <div className="display-6 fw-bold lh-1">{ots.length}</div>
                                            <div className="small opacity-75 mt-1" style={{ fontSize: '0.7rem' }}>Total Tareas</div>
                                        </div>
                                    </div>
                                </div>
                                {teamStats.map(stat => (
                                    <div className="col-6" key={stat.id}>
                                        <div
                                            className={`card border-0 shadow-sm h-100 cursor-pointer ${filtroTecnico === stat.id ? 'border border-2 border-primary bg-primary bg-opacity-10' : 'bg-white'}`}
                                            onClick={() => setFiltroTecnico(stat.id)}
                                        >
                                            <div className="card-body p-2 d-flex flex-column justify-content-between">
                                                <div className="fw-bold mb-2 text-truncate text-center w-100 fs-5" title={stat.nombre}>
                                                    {stat.nombre.split(' ')[0]}
                                                </div>
                                                <div className="d-flex justify-content-between text-center px-1" style={{ fontSize: '0.7rem' }}>
                                                    <div>
                                                        <span className="d-block fw-bold text-warning fs-6">{stat.pendientes}</span>
                                                        <span className="text-muted">Pend</span>
                                                    </div>
                                                    <div>
                                                        <span className="d-block fw-bold text-primary fs-6">{stat.proceso}</span>
                                                        <span className="text-muted">Proc</span>
                                                    </div>
                                                    <div>
                                                        <span className="d-block fw-bold text-success fs-6">{stat.terminado}</span>
                                                        <span className="text-muted">Fin</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-4 border-bottom bg-white flex-shrink-0">
                        <h5 className="fw-bold mb-3 text-dark d-flex align-items-center">
                            <i className="bi bi-clipboard-data me-3 fs-4 text-primary"></i>
                            {filtroTecnico ? 'Tareas de Usuario' : 'Listado General'}
                        </h5>
                        <div className="input-group input-group-sm mb-2 shadow-sm">
                            <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-search"></i></span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Título, solicitante o #OT..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <div className="input-group input-group-sm mb-3 shadow-sm">
                            <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-calendar"></i></span>
                            <input
                                type="date"
                                className="form-control border-start-0 ps-0"
                                value={filtroFecha}
                                onChange={(e) => setFiltroFecha(e.target.value)}
                            />
                        </div>
                        <div className="btn-group w-100 shadow-sm" role="group">
                            <button
                                className={`btn btn-sm ${filtroEstado === 'pendientes' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setFiltroEstado('pendientes')}
                            >
                                Pendientes
                            </button>
                            <button
                                className={`btn btn-sm ${filtroEstado === 'proceso' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setFiltroEstado('proceso')}
                            >
                                En Proceso
                            </button>
                            <button
                                className={`btn btn-sm ${filtroEstado === 'terminado' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setFiltroEstado('terminado')}
                            >
                                Terminado
                            </button>
                        </div>
                    </div>

                    <div className="flex-grow-1 overflow-auto p-2 bg-light">
                        {loading ? (
                            <div className="p-5 text-center"><span className="spinner-border text-primary"></span></div>
                        ) : (
                            otsFiltradas.length === 0 ? (
                                <div className="p-5 text-center text-muted small">No se encontraron tareas con estos filtros.</div>
                            ) : (
                                otsFiltradas.map(ot => {
                                    const isActive = selectedOt?.id === ot.id;
                                    return (
                                        <button key={ot.id}
                                            className={`card w-100 mb-2 border-0 shadow-sm text-start card-hover transition-all ${isActive ? 'border-start border-5 border-primary bg-white' : 'bg-white'}`}
                                            onClick={() => handleSelectOt(ot)}>
                                            <div className="card-body p-3">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className={`badge ${isActive ? 'bg-primary' : 'bg-secondary'} bg-opacity-25 text-dark fw-bold`}>OT #{ot.id}</span>
                                                    <small className="text-muted">{new Date(ot.fecha_solicitud).toLocaleDateString()}</small>
                                                </div>
                                                <h6 className="mb-1 fw-bold text-dark text-truncate">{ot.activo}</h6>
                                                <div className="small text-muted text-truncate mb-1">
                                                    <i className="bi bi-person-fill me-1"></i>Solicita: {ot.solicitante_nombre}
                                                </div>
                                                {esJefe && (
                                                    <div className={`small text-truncate fst-italic mb-2 ${ot.asignados_nombres ? 'text-primary' : 'text-muted opacity-75'}`}>
                                                        <i className={`bi ${ot.asignados_nombres ? 'bi-tools' : 'bi-exclamation-circle'} me-1`}></i>
                                                        {ot.asignados_nombres ? `Asignado: ${ot.asignados_nombres}` : 'Sin técnicos'}
                                                    </div>
                                                )}
                                                <span className="badge bg-info text-dark bg-opacity-25 border border-info fw-normal">{ot.estado}</span>
                                            </div>
                                        </button>
                                    );
                                })
                            )
                        )}
                    </div>
                </div>
                <div className={`col-12 col-md-8 col-lg-9 d-flex flex-column position-relative ${!selectedOt ? 'd-none d-md-flex' : 'd-flex'}`} style={{ backgroundColor: '#f8f9fa' }}>
                    {selectedOt ? (
                        <>
                            <div className="bg-white border-bottom shadow-sm sticky-top" style={{ zIndex: 1020 }}>
                                <div className="d-flex justify-content-between align-items-center p-3 p-md-4 pb-md-2">
                                    <div className="d-flex align-items-center overflow-hidden">
                                        <button className="btn btn-link text-dark d-md-none me-2 p-0" onClick={() => setSelectedOt(null)}>
                                            <i className="bi bi-arrow-left display-6"></i>
                                        </button>
                                        <div className="text-truncate">
                                            <h4 className="fw-bold mb-0 text-truncate">{selectedOt.activo}</h4>
                                            <div className="text-muted small d-flex align-items-center">
                                                <i className="bi bi-upc-scan me-1"></i> {selectedOt.codigo_interno}
                                                <span className="mx-2">|</span>
                                                <i className="bi bi-person-fill me-1"></i> Solicita: {selectedOt.solicitante_nombre} {selectedOt.solicitante_apellido}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ps-3">
                                        <button
                                            className={`btn btn-lg fw-bold px-4 shadow d-flex align-items-center ${datosEnvio.firma ? 'btn-danger' : 'btn-primary'}`}
                                            onClick={iniciarGuardado}
                                            disabled={guardando}
                                        >
                                            {guardando ? <span className="spinner-border spinner-border-sm me-2"></span> :
                                                datosEnvio.firma ? <i className="bi bi-file-earmark-lock-fill me-2 fs-5"></i> : <i className="bi bi-save-fill me-2 fs-5"></i>
                                            }
                                            <span className="d-none d-sm-inline">{datosEnvio.firma ? 'FINALIZAR Y FIRMAR' : 'GUARDAR AVANCE'}</span>
                                            <span className="d-inline d-sm-none">{datosEnvio.firma ? 'FINALIZAR' : 'GUARDAR'}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="px-3 px-md-4">
                                    <ul className="nav nav-pills nav-fill gap-2 p-1 bg-light rounded-pill" role="tablist" style={{ maxWidth: '600px' }}>
                                        <li className="nav-item">
                                            <button className={`nav-link rounded-pill fw-bold d-flex align-items-center justify-content-center py-2 ${activeTab === 'info' ? 'active shadow-sm' : 'text-muted'}`}
                                                onClick={() => setActiveTab('info')}>
                                                <i className="bi bi-info-circle me-2 fs-5"></i>Info. Solicitud
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button className={`nav-link rounded-pill fw-bold d-flex align-items-center justify-content-center py-2 ${activeTab === 'checklist' ? 'active shadow-sm' : 'text-muted'}`}
                                                onClick={() => setActiveTab('checklist')}>
                                                <i className="bi bi-list-check me-2 fs-5"></i>Pauta
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button className={`nav-link rounded-pill fw-bold d-flex align-items-center justify-content-center py-2 position-relative ${activeTab === 'materiales' ? 'active shadow-sm' : 'text-muted'}`}
                                                onClick={() => setActiveTab('materiales')}>
                                                <i className="bi bi-tools me-2 fs-5"></i>Materiales
                                                {detallesOt.insumos.length > 0 &&
                                                    <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle border border-light">{detallesOt.insumos.length}</span>
                                                }
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex-grow-1 overflow-auto p-3 p-md-4">
                                {loadingDetalle ? (
                                    <div className="d-flex flex-column align-items-center justify-content-center h-50 text-muted">
                                        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                                        <p className="fw-medium">Cargando datos de la orden...</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-4 shadow-sm p-4 mx-auto" style={{ maxWidth: '1000px', minHeight: '100%' }}>
                                        
                                        {/* PESTAÑA 1: INFO GENERAL */}
                                        <div className={activeTab === 'info' ? 'd-block' : 'd-none'}>
                                            <h5 className="fw-bold mb-4 text-dark border-bottom pb-2">
                                                <i className="bi bi-journal-text me-2 text-primary"></i>
                                                Detalles del Requerimiento
                                            </h5>
                                            <div className="row">
                                                <div className="col-md-7">
                                                    <div className="mb-4">
                                                        <label className="text-muted small fw-bold text-uppercase mb-1">Descripción del Problema</label>
                                                        <div className="p-3 bg-light rounded border">
                                                            {selectedOt.descripcion_solicitud || 'Sin descripción proporcionada.'}
                                                        </div>
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className="text-muted small fw-bold text-uppercase mb-1">Ubicación / Referencia</label>
                                                        <div className="d-flex align-items-center">
                                                            <i className="bi bi-geo-alt-fill text-danger me-2 fs-5"></i>
                                                            <span className="fs-6 fw-medium">{selectedOt.ubicacion || 'No especificada'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-5">
                                                    <label className="text-muted small fw-bold text-uppercase mb-1">Evidencia (Cliente)</label>
                                                    {renderEvidencia(selectedOt.imagen_url)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* PESTAÑA 2: CHECKLIST (PAUTA) O CIERRE DIRECTO */}
                                        <div className={activeTab === 'checklist' ? 'd-block' : 'd-none'}>
                                            {selectedOt.plantilla_json ? (
                                                <ChecklistRenderer
                                                    plantilla={typeof selectedOt.plantilla_json === 'string' ? JSON.parse(selectedOt.plantilla_json) : selectedOt.plantilla_json}
                                                    respuestasIniciales={detallesOt.respuestas}
                                                    onChange={(data) => setDatosEnvio(data)}
                                                />
                                            ) : (
                                                <div className="bg-white rounded border shadow-sm p-4 mb-4">
                                                    <h5 className="fw-bold mb-4 text-dark border-bottom pb-2">
                                                        <i className="bi bi-clipboard-check me-2 text-primary"></i>
                                                        Cierre de Servicio General
                                                    </h5>
                                                    
                                                    <div className="alert alert-light border d-flex align-items-center mb-4">
                                                        <i className="bi bi-info-circle-fill fs-4 me-3 text-secondary"></i>
                                                        <span className="small text-muted">Este trabajo no requiere pauta paso a paso. Adjunte evidencias, comente y firme para finalizar.</span>
                                                    </div>

                                                    <div className="mb-4">
                                                        <label className="form-label fw-bold text-muted small text-uppercase">1. Detalles del Trabajo Realizado</label>
                                                        <textarea 
                                                            className="form-control bg-light" 
                                                            rows="4" 
                                                            placeholder="Describa aquí lo que se reparó, cambió o solucionó..."
                                                            value={datosEnvio.comentarios || ''}
                                                            onChange={(e) => setDatosEnvio({ ...datosEnvio, comentarios: e.target.value })}
                                                        ></textarea>
                                                    </div>

                                                    <div className="mb-4">
                                                        <label className="form-label fw-bold text-muted small text-uppercase">2. Evidencia (Fotos / Videos)</label>
                                                        <input 
                                                            type="file" 
                                                            className="form-control mb-2" 
                                                            accept="image/*,video/*" 
                                                            capture="environment" 
                                                            multiple 
                                                            onChange={handleFileChange} 
                                                        />
                                                        {datosEnvio.archivos && datosEnvio.archivos.length > 0 && (
                                                            <div className="d-flex flex-wrap gap-2 mt-2">
                                                                {datosEnvio.archivos.map((file, idx) => (
                                                                    <span key={idx} className="badge bg-secondary d-flex align-items-center gap-2 p-2">
                                                                        <i className={file.type.startsWith('video') ? "bi bi-film" : "bi bi-image"}></i> 
                                                                        {file.name.substring(0,10)}... 
                                                                        <i className="bi bi-x-circle-fill text-danger cursor-pointer fs-6 ms-2" 
                                                                           onClick={() => setDatosEnvio(prev => ({...prev, archivos: prev.archivos.filter((_, i) => i !== idx)}))}></i>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <small className="text-muted d-block mt-1"><i className="bi bi-arrows-collapse me-1"></i>Las imágenes se comprimirán automáticamente un 70%.</small>
                                                    </div>

                                                    <div className="mb-2">
                                                        <div className="d-flex justify-content-between align-items-end mb-2">
                                                            <label className="form-label fw-bold text-muted small text-uppercase mb-0">3. Firma de Conformidad</label>
                                                            <button type="button" className="btn btn-sm btn-outline-danger py-0 px-2 rounded-pill" onClick={() => {
                                                                sigCanvas.current?.clear();
                                                                setDatosEnvio({ ...datosEnvio, firma: null });
                                                            }}>
                                                                <i className="bi bi-eraser me-1"></i>Limpiar
                                                            </button>
                                                        </div>
                                                        <div className="border border-2 border-primary border-opacity-25 bg-white rounded-3 shadow-sm overflow-hidden" style={{ height: '200px' }}>
                                                            <SignatureCanvas 
                                                                ref={sigCanvas}
                                                                canvasProps={{ className: 'w-100 h-100' }}
                                                                onEnd={() => setDatosEnvio({ ...datosEnvio, firma: sigCanvas.current.getTrimmedCanvas().toDataURL('image/png') })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* PESTAÑA 3: MATERIALES */}
                                        <div className={activeTab === 'materiales' ? 'd-block' : 'd-none'}>
                                            <h5 className="fw-bold mb-4 text-dark border-bottom pb-2">
                                                <i className="bi bi-box-seam me-2 text-primary"></i>
                                                Repuestos e Insumos Asignados
                                            </h5>

                                            {detallesOt.insumos.length === 0 ? (
                                                <div className="text-center py-5 text-muted opacity-50">
                                                    <i className="bi bi-box display-1"></i>
                                                    <p className="mt-3 fw-bold">No se requieren materiales para esta tarea.</p>
                                                </div>
                                            ) : (
                                                <div className="row row-cols-1 row-cols-md-2 g-3">
                                                    {detallesOt.insumos.map((item, idx) => {
                                                        const stockDisponible = parseFloat(item.stock_usuario || 0);
                                                        const cantidadRequerida = parseFloat(item.cantidad);
                                                        const tengoStock = stockDisponible >= cantidadRequerida;

                                                        return (
                                                            <div key={idx} className="col">
                                                                <div className={`card h-100 border-0 shadow-sm ${tengoStock ? 'border-start border-success border-4' : 'border-start border-danger border-4'}`}>
                                                                    <div className="card-body d-flex align-items-center p-3">
                                                                        <div className={`rounded-circle p-3 me-3 d-flex align-items-center justify-content-center flex-shrink-0 ${tengoStock ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`} style={{ width: '60px', height: '60px' }}>
                                                                            <i className={`bi ${tengoStock ? 'bi-check-lg display-6' : 'bi-x-lg display-6'}`}></i>
                                                                        </div>
                                                                        <div className="flex-grow-1 overflow-hidden">
                                                                            <h6 className="fw-bold mb-1 text-truncate">{item.nombre}</h6>
                                                                            <div className="d-flex justify-content-between align-items-end">
                                                                                <div>
                                                                                    <small className="text-muted d-block font-monospace"><i className="bi bi-upc me-1"></i>{item.codigo_sku}</small>
                                                                                    <div className="mt-2">
                                                                                        <span className="badge bg-light text-dark border me-2">Solicita: {cantidadRequerida} {item.unidad_medida}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-end">
                                                                                    <small className="text-muted d-block">Tienes:</small>
                                                                                    <span className={`fs-5 fw-bold ${tengoStock ? 'text-success' : 'text-danger'}`}>
                                                                                        {stockDisponible}
                                                                                    </span>
                                                                                    <small className="text-muted ms-1">{item.unidad_medida}</small>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`card-footer py-1 small fw-bold text-center ${tengoStock ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                                                                        {tengoStock ? 'DISPONIBLE EN MIS INSUMOS' : 'STOCK INSUFICIENTE'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            <div className="alert alert-light border mt-4 d-flex align-items-center shadow-sm mb-0">
                                                <i className="bi bi-info-circle-fill fs-4 me-3 text-secondary"></i>
                                                <div className="small text-muted">
                                                    <strong>Nota:</strong> El sistema valida contra tu stock personal. Si el indicador está en ROJO, debes solicitar el material a bodega antes de finalizar.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted p-4 text-center" style={{ backgroundColor: '#f8f9fa' }}>
                            <img src="https://cdn-icons-png.flaticon.com/512/7693/7693327.png" alt="Select Task" style={{ width: '150px', opacity: 0.5 }} className="mb-4 grayscale" />
                            <h3 className="fw-bold text-dark">¡Listo para trabajar!</h3>
                            <p className="lead mb-0">Selecciona una tarea del panel izquierdo para comenzar tu pauta.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = document.createElement('style');
styles.innerHTML = `
    .card-hover:hover { transform: translateX(5px); background-color: #f8f9fa !important; cursor: pointer; }
    .grayscale { filter: grayscale(100%); }
    .transition-all { transition: all 0.3s ease; }
`;
document.head.appendChild(styles);

export default MisMantenciones;