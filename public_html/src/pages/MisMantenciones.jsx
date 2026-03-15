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
    const [filtroUbicacion, setFiltroUbicacion] = useState('');

    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: '' });
    const [confirm, setConfirm] = useState({ show: false, title: '', message: '', action: null });

    const esJefe = authData?.rol === 'Jefe Mantención' || authData?.rol === 'Admin';
    const sigCanvas = useRef(null);
    const [enlargedImage, setEnlargedImage] = useState(null);

    const esServicio = selectedOt && (!selectedOt.activo_id || selectedOt.codigo_interno === 'SERV');

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
                    stats[id] = { id, nombre: nombres[index] || 'Técnico', pendientes: 0, proceso: 0, terminado: 0 };
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

        setDatosEnvio({
            respuestas: [],
            firma: null,
            comentarios: ot.comentarios_finales || '',
            archivos: []
        });
        setEnlargedImage(null);

        try {
            const res = await api.get(`/index.php/mantencion?detalle=true&id=${ot.id}`);
            if (res.data.success) {
                setSelectedOt({ ...ot, ...res.data.data });
                setDetallesOt({
                    insumos: res.data.data.items || [],
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

    const handleCambiarEstadoManual = async (nuevoEstadoId) => {
        try {
            setGuardando(true);
            const res = await api.post('/mis-mantenciones/cambiar-estado', {
                ot_id: selectedOt.id,
                estado_id: nuevoEstadoId
            });
            if (res.data.success) {
                setSelectedOt({ ...selectedOt, estado_id: parseInt(nuevoEstadoId) });
                cargarMisOts();
                setMsg({ show: true, title: "Éxito", text: "Estado actualizado correctamente", type: "success" });
            }
        } catch (e) {
            setMsg({ show: true, title: "Error", text: e.response?.data?.message || "No se pudo cambiar el estado", type: "error" });
        } finally {
            setGuardando(false);
        }
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
            (ot.titulo && ot.titulo.toLowerCase().includes(texto)) ||
            `${ot.solicitante_nombre} ${ot.solicitante_apellido}`.toLowerCase().includes(texto) ||
            ot.id.toString().includes(texto) ||
            (ot.asignados_nombres && ot.asignados_nombres.toLowerCase().includes(texto));

        const matchFecha = filtroFecha ? ot.fecha_solicitud.startsWith(filtroFecha) : true;
        const matchUbicacion = !filtroUbicacion || (ot.ubicacion && ot.ubicacion.toLowerCase().includes(filtroUbicacion.toLowerCase()));

        return matchEstado && matchTexto && matchFecha && matchUbicacion;
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
            if (file.type.startsWith('image/')) return await comprimirImagen(file);
            return file;
        }));
        setDatosEnvio(prev => ({ ...prev, archivos: [...(prev.archivos || []), ...processedFiles] }));
        setGuardando(false);
    };

    const renderEvidencia = (evidenciaStr) => {
        if (!evidenciaStr) return null;

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
                            alt={`Evidencia ${idx + 1}`}
                            className="rounded border shadow-sm cursor-pointer"
                            style={{ height: '120px', width: '120px', objectFit: 'cover' }}
                            onClick={() => setEnlargedImage(`/api/${url}`)}
                        />
                    );
                })}
            </div>
        );
    };

    const iniciarGuardado = (isFinalizar = false) => {
        if (!selectedOt) return;

        if (isFinalizar) {
            if (!esServicio && !datosEnvio.firma) {
                setMsg({ show: true, title: "Firma Requerida", text: "Debe firmar de conformidad para finalizar esta OT.", type: "warning" });
                return;
            }

            const faltantes = detallesOt.insumos.filter(i => parseFloat(i.stock_usuario || 0) < parseFloat(i.cantidad));

            if (faltantes.length > 0) {
                const itemsLista = faltantes.map(f =>
                    `• ${f.nombre} (Pide: ${parseFloat(f.cantidad)}, Tienes: ${parseFloat(f.stock_usuario || 0)})`
                ).join('\n');

                setConfirm({
                    show: true,
                    title: "⚠️ Stock Insuficiente",
                    message: `No tienes suficiente stock en "Mis Insumos" para cubrir esta solicitud:\n\n${itemsLista}\n\n¿Estás seguro de finalizar? El sistema registrará el consumo de todas formas.`,
                    action: () => procesarGuardado(true)
                });
                return;
            }
        }
        procesarGuardado(isFinalizar);
    };

    const procesarGuardado = async (isFinalizar) => {
        setConfirm({ ...confirm, show: false });
        setGuardando(true);

        try {
            const formData = new FormData();
            formData.append('ot_id', selectedOt.id);
            formData.append('respuestas', JSON.stringify(datosEnvio.respuestas || []));
            if (datosEnvio.firma) formData.append('firma', datosEnvio.firma);
            if (datosEnvio.comentarios) formData.append('comentarios', datosEnvio.comentarios);

            formData.append('finalizar', isFinalizar ? 'true' : 'false');

            if (datosEnvio.archivos && datosEnvio.archivos.length > 0) {
                datosEnvio.archivos.forEach((file, index) => {
                    formData.append(`evidencia_${index}`, file);
                });
            }

            const res = await api.post('/mis-mantenciones/guardar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setMsg({ show: true, title: isFinalizar ? '¡Trabajo Finalizado!' : 'Avance Guardado', text: 'Operación registrada correctamente.', type: 'success' });

                setDatosEnvio(prev => ({ ...prev, archivos: [] }));

                if (isFinalizar) {
                    cargarMisOts();
                    setSelectedOt(null);
                } else {
                    cargarMisOts();
                    const updatedOt = ots.find(o => o.id === selectedOt.id) || selectedOt;
                    handleSelectOt(updatedOt);
                }
            }
        } catch (e) {
            setMsg({ show: true, title: 'Error', text: e.response?.data?.message || 'No se pudo guardar.', type: 'error' });
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

            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />
            <ConfirmModal show={confirm.show} onClose={() => setConfirm({ ...confirm, show: false })} onConfirm={confirm.action} title={confirm.title} message={confirm.message} confirmText="Sí, Finalizar igual" cancelText="Cancelar" type="warning" />

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
                            <input type="text" className="form-control border-start-0 ps-0" placeholder="Título, #OT o Solicitante..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                        </div>

                        <div className="input-group input-group-sm mb-3 shadow-sm">
                            <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-geo-alt"></i></span>
                            <select
                                className="form-select border-start-0 ps-0 text-muted"
                                value={filtroUbicacion}
                                onChange={(e) => setFiltroUbicacion(e.target.value)}
                            >
                                <option value="">Todas las ubicaciones...</option>
                                <optgroup label="🏢 Insuban ">
                                    <option value="Planta 1">Planta 1</option>
                                    <option value="Planta 2">Planta 2</option>
                                    <option value="Patio">Patio</option>
                                    <option value="Hor">Hor</option>
                                    <option value="Lavanderia">Lavandería</option>
                                    <option value="Taller de Mantencion">Taller de Mantención</option>
                                </optgroup>
                                <optgroup label="🚚 Externos">
                                    <option value="Comafri">Comafri</option>
                                    <option value="Coexca">Coexca</option>
                                    <option value="Camer">Camer</option>
                                </optgroup>
                            </select>
                        </div>

                        <div className="btn-group w-100 shadow-sm" role="group">
                            <button className={`btn btn-sm ${filtroEstado === 'pendientes' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFiltroEstado('pendientes')}>Pendientes</button>
                            <button className={`btn btn-sm ${filtroEstado === 'proceso' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFiltroEstado('proceso')}>En Proceso</button>
                            <button className={`btn btn-sm ${filtroEstado === 'terminado' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFiltroEstado('terminado')}>Terminado</button>
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
                                    const requierePermiso = Number(ot.requiere_permiso) === 1;

                                    return (
                                        <button key={ot.id}
                                            className={`card w-100 mb-2 border-0 shadow-sm text-start card-hover transition-all ${isActive ? 'border-start border-5 border-primary bg-white' : 'bg-white'}`}
                                            onClick={() => handleSelectOt(ot)}>
                                            <div className="card-body p-3 position-relative">
                                                <div className="d-flex justify-content-between mb-1 align-items-center">
                                                    <div>
                                                        <span className={`badge ${isActive ? 'bg-primary' : 'bg-secondary'} bg-opacity-25 text-dark fw-bold`}>OT #{ot.id}</span>
                                                        {requierePermiso && (
                                                            <span className="badge bg-danger ms-1 shadow-sm blink-badge" style={{ fontSize: '0.65rem' }}>
                                                                <i className="bi bi-shield-exclamation me-1"></i>RIESGO
                                                            </span>
                                                        )}
                                                    </div>
                                                    <small className="text-muted">{new Date(ot.fecha_solicitud).toLocaleDateString()}</small>
                                                </div>

                                                <h6 className="mb-1 fw-bold text-primary text-truncate">{ot.titulo || 'Sin Título'}</h6>

                                                <div className="fw-bold text-dark text-truncate small mb-1"><i className="bi bi-gear-fill me-1 text-muted"></i>{ot.activo}</div>

                                                {ot.ubicacion && (
                                                    <div className="small text-danger text-truncate mb-1"><i className="bi bi-geo-alt-fill me-1"></i>{ot.ubicacion}</div>
                                                )}

                                                <div className="small text-muted text-truncate mb-1">
                                                    <i className="bi bi-person-fill me-1"></i>Solicita: {ot.solicitante_nombre}
                                                </div>
                                                {esJefe && (
                                                    <div className={`small text-truncate fst-italic mb-2 ${ot.asignados_nombres ? 'text-primary' : 'text-muted opacity-75'}`}>
                                                        <i className={`bi ${ot.asignados_nombres ? 'bi-tools' : 'bi-exclamation-circle'} me-1`}></i>
                                                        {ot.asignados_nombres ? `Asignado: ${ot.asignados_nombres}` : 'Sin técnicos'}
                                                    </div>
                                                )}
                                                <span className="badge bg-info text-dark bg-opacity-25 border border-info fw-normal mt-1">{ot.estado}</span>
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
                                            <h4 className="fw-bold mb-0 text-truncate text-primary">{selectedOt.titulo || 'Sin Título'}</h4>

                                            <div className="text-dark fw-bold small d-flex align-items-center mt-1">
                                                <i className="bi bi-gear-wide-connected me-1"></i> {selectedOt.activo}
                                                <span className="mx-2 text-muted">|</span>
                                                <i className="bi bi-upc-scan me-1 text-muted"></i> {selectedOt.codigo_interno}
                                            </div>
                                            <div className="text-muted small mt-1">
                                                <i className="bi bi-person-fill me-1"></i> Solicita: {selectedOt.solicitante_nombre} {selectedOt.solicitante_apellido}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ps-3 d-flex gap-2">
                                        {esServicio ? (
                                            <>
                                                <button
                                                    className="btn btn-outline-primary fw-bold px-3 shadow-sm d-flex align-items-center"
                                                    onClick={() => iniciarGuardado(false)}
                                                    disabled={guardando || parseInt(selectedOt.estado_id) === 5}
                                                >
                                                    {guardando ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-save-fill me-1 me-sm-2"></i>}
                                                    <span className="d-none d-sm-inline">Guardar Avance</span>
                                                </button>
                                                <button
                                                    className="btn btn-success fw-bold px-3 px-sm-4 shadow d-flex align-items-center"
                                                    onClick={() => iniciarGuardado(true)}
                                                    disabled={guardando || parseInt(selectedOt.estado_id) === 5}
                                                >
                                                    {guardando ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-circle-fill me-1 me-sm-2"></i>}
                                                    <span className="d-none d-sm-inline">Finalizar</span>
                                                    <span className="d-inline d-sm-none">Fin</span>
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className={`btn btn-lg fw-bold px-4 shadow d-flex align-items-center ${datosEnvio.firma ? 'btn-danger' : 'btn-primary'}`}
                                                onClick={() => iniciarGuardado(!!datosEnvio.firma)}
                                                disabled={guardando || parseInt(selectedOt.estado_id) === 5}
                                            >
                                                {guardando ? <span className="spinner-border spinner-border-sm me-2"></span> :
                                                    datosEnvio.firma ? <i className="bi bi-file-earmark-lock-fill me-2 fs-5"></i> : <i className="bi bi-save-fill me-2 fs-5"></i>
                                                }
                                                <span className="d-none d-sm-inline">{datosEnvio.firma ? 'FINALIZAR Y FIRMAR' : 'GUARDAR AVANCE'}</span>
                                                <span className="d-inline d-sm-none">{datosEnvio.firma ? 'FINALIZAR' : 'GUARDAR'}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {Number(selectedOt.requiere_permiso) === 1 && (
                                    <div className="bg-warning bg-opacity-25 border-top border-bottom border-warning p-2 d-flex align-items-center px-4">
                                        <i className="bi bi-exclamation-triangle-fill text-danger fs-4 me-3 blink-badge"></i>
                                        <div>
                                            <div className="fw-bold text-danger text-uppercase mb-0" style={{ fontSize: '0.85rem' }}>
                                                Atención: Permiso de {selectedOt.tipo_permiso_nombre || 'Trabajo Seguro'} Requerido
                                            </div>
                                            <div className="small text-dark fw-medium">
                                                Debes gestionar la firma con Prevención de Riesgos antes de comenzar la tarea.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="px-3 px-md-4 mt-2 mb-2">
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
                                                <i className="bi bi-list-check me-2 fs-5"></i>Avance / Cierre
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

                                        <div className={activeTab === 'info' ? 'd-block' : 'd-none'}>
                                            <div className="mb-5 p-4 bg-light rounded-4 border shadow-sm">
                                                <h6 className="fw-bold text-dark text-uppercase mb-3">
                                                    <i className="bi bi-gear-fill text-primary me-2"></i> Cambiar Mi Estado
                                                </h6>
                                                <div className="d-flex flex-wrap gap-2">
                                                    <button
                                                        className={`btn rounded-pill px-4 fw-bold shadow-sm ${parseInt(selectedOt.estado_id) === 1 ? 'btn-warning text-dark border-warning' : 'btn-white border text-muted'}`}
                                                        onClick={() => handleCambiarEstadoManual(1)}
                                                        disabled={guardando || parseInt(selectedOt.estado_id) === 1 || parseInt(selectedOt.estado_id) === 5}
                                                    >
                                                        <i className="bi bi-hourglass-split me-2"></i>Pendiente
                                                    </button>
                                                    <button
                                                        className={`btn rounded-pill px-4 fw-bold shadow-sm ${parseInt(selectedOt.estado_id) === 2 ? 'btn-primary border-primary' : 'btn-white border text-muted'}`}
                                                        onClick={() => handleCambiarEstadoManual(2)}
                                                        disabled={guardando || parseInt(selectedOt.estado_id) === 2 || parseInt(selectedOt.estado_id) === 5}
                                                    >
                                                        <i className="bi bi-tools me-2"></i>En Proceso
                                                    </button>
                                                    <button
                                                        className={`btn rounded-pill px-4 fw-bold shadow-sm ${parseInt(selectedOt.estado_id) === 4 ? 'btn-danger border-danger' : 'btn-white border text-muted'}`}
                                                        onClick={() => handleCambiarEstadoManual(4)}
                                                        disabled={guardando || parseInt(selectedOt.estado_id) === 4 || parseInt(selectedOt.estado_id) === 5}
                                                    >
                                                        <i className="bi bi-pause-circle-fill me-2"></i>Pausada
                                                    </button>
                                                </div>
                                                {parseInt(selectedOt.estado_id) === 5 ? (
                                                    <small className="text-success mt-3 d-block fw-bold">
                                                        <i className="bi bi-check-circle-fill me-1"></i> Esta tarea ya fue finalizada. No se puede revertir.
                                                    </small>
                                                ) : (
                                                    <small className="text-muted mt-3 d-block">
                                                        <i className="bi bi-info-circle me-1"></i> Actualiza esto si debes pausar. <b>Para Finalizar, usa {esServicio ? 'el botón Finalizar' : 'el botón de la firma'} de arriba.</b>
                                                    </small>
                                                )}
                                            </div>

                                            <h5 className="fw-bold mb-4 text-dark border-bottom pb-2 mt-4">
                                                <i className="bi bi-journal-text me-2 text-primary"></i>
                                                Detalles del Requerimiento
                                            </h5>
                                            <div className="row">
                                                <div className="col-md-7">
                                                    <div className="mb-4">
                                                        <label className="text-muted small fw-bold text-uppercase mb-1">Descripción del Problema</label>
                                                        <div className="p-3 bg-light rounded border">
                                                            {selectedOt.descripcion_solicitud || selectedOt.descripcion_trabajo || 'Sin descripción proporcionada.'}
                                                        </div>
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className="text-muted small fw-bold text-uppercase mb-1">Ubicación / Referencia</label>
                                                        <div className="d-flex align-items-center">
                                                            <i className="bi bi-geo-alt-fill text-danger me-2 fs-5"></i>
                                                            <span className="fs-6 fw-medium">{selectedOt.ubicacion || 'No especificada'}</span>
                                                        </div>
                                                    </div>
                                                    {selectedOt.descripcion_permiso && (
                                                        <div className="mb-4 p-3 bg-warning bg-opacity-10 border border-warning rounded">
                                                            <label className="text-warning small fw-bold text-uppercase mb-1"><i className="bi bi-shield-exclamation me-1"></i>Nota de Prevención</label>
                                                            <div className="text-dark">{selectedOt.descripcion_permiso}</div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-md-5">
                                                    <label className="text-muted small fw-bold text-uppercase mb-1">Evidencia (Cliente)</label>
                                                    {renderEvidencia(selectedOt.imagen_url)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={activeTab === 'checklist' ? 'd-block' : 'd-none'}>
                                            {activeTab === 'checklist' && (
                                                selectedOt.plantilla_json ? (
                                                    <ChecklistRenderer
                                                        plantilla={typeof selectedOt.plantilla_json === 'string' ? JSON.parse(selectedOt.plantilla_json) : selectedOt.plantilla_json}
                                                        respuestasIniciales={detallesOt.respuestas}
                                                        onChange={(data) => setDatosEnvio(data)}
                                                    />
                                                ) : (
                                                    <div className="bg-white rounded border shadow-sm p-4 mb-4">
                                                        <h5 className="fw-bold mb-4 text-dark border-bottom pb-2">
                                                            <i className="bi bi-clipboard-check me-2 text-primary"></i>
                                                            Avance y Cierre de Tarea
                                                        </h5>

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

                                                            {selectedOt.evidencia_cierre && (
                                                                <div className="mb-3 p-3 bg-light rounded border border-success border-opacity-25">
                                                                    <span className="small text-success d-block mb-2 fw-bold"><i className="bi bi-check-circle-fill me-1"></i>Archivos Guardados Anteriormente:</span>
                                                                    {renderEvidencia(selectedOt.evidencia_cierre)}
                                                                </div>
                                                            )}

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
                                                                        <span key={idx} className="badge bg-secondary d-flex align-items-center gap-2 p-2 shadow-sm">
                                                                            <i className={file.type.startsWith('video') ? "bi bi-film" : "bi bi-image"}></i>
                                                                            {file.name.substring(0, 10)}...
                                                                            <i className="bi bi-x-circle-fill text-danger cursor-pointer fs-6 ms-2"
                                                                                onClick={() => setDatosEnvio(prev => ({ ...prev, archivos: prev.archivos.filter((_, i) => i !== idx) }))}></i>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {!esServicio && (
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
                                                                <div className="border border-2 border-primary border-opacity-25 bg-white rounded-3 shadow-sm" style={{ height: '200px' }}>
                                                                    <SignatureCanvas
                                                                        ref={sigCanvas}
                                                                        canvasProps={{ className: 'w-100 h-100' }}
                                                                        onEnd={() => setDatosEnvio({ ...datosEnvio, firma: sigCanvas.current.getTrimmedCanvas().toDataURL('image/png') })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>

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
                            <p className="lead mb-0">Selecciona una tarea del panel izquierdo para comenzar.</p>
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
    @keyframes blink-animation {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
    }
    .blink-badge {
    animation: blink-animation 1.5s infinite;
    }
`;
document.head.appendChild(styles);

export default MisMantenciones;