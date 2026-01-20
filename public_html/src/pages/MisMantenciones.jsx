import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import ChecklistRenderer from '../components/ChecklistRenderer';
import MessageModal from '../components/MessageModal';

const MisMantenciones = () => {
    const [ots, setOts] = useState([]);
    const [selectedOt, setSelectedOt] = useState(null);
    const [detallesOt, setDetallesOt] = useState({ insumos: [], respuestas: [] });
    
    // Estado de pestañas
    const [activeTab, setActiveTab] = useState('checklist'); // 'checklist' o 'materiales'

    const [datosEnvio, setDatosEnvio] = useState({ respuestas: [], firma: null, comentarios: '' });
    const [loading, setLoading] = useState(true);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: '' });

    useEffect(() => { cargarMisOts(); }, []);

    const cargarMisOts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/mis-mantenciones');
            if (res.data.success) setOts(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleSelectOt = async (ot) => {
        setSelectedOt(ot);
        setLoadingDetalle(true);
        setActiveTab('checklist');
        setDatosEnvio({ respuestas: [], firma: null, comentarios: '' });

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

    const handleGuardar = async () => {
        if (!selectedOt) return;
        
        const hayPendientes = detallesOt.insumos.some(i => i.estado_linea === 'PENDIENTE' || i.estado_linea === 'REQUIERE_COMPRA');
        if (datosEnvio.firma && hayPendientes) {
            // Aquí podrías usar un ConfirmModal propio si lo prefieres
            if (!window.confirm("⚠️ ALERTA: Tienes materiales PENDIENTES de entrega por bodega.\n\n¿Estás seguro de que puedes finalizar la mantención sin ellos?")) {
                return;
            }
        }

        setGuardando(true);
        try {
            const res = await api.post('/mis-mantenciones/guardar', {
                ot_id: selectedOt.id,
                ...datosEnvio
            });
            if (res.data.success) {
                setMsg({ show: true, title: datosEnvio.firma ? '¡Trabajo Finalizado!' : 'Avance Guardado', text: 'Operación registrada correctamente.', type: 'success' });
                if (datosEnvio.firma) {
                    cargarMisOts();
                    setSelectedOt(null);
                }
            }
        } catch (e) {
            setMsg({ show: true, title: 'Error', text: 'No se pudo guardar el avance.', type: 'error' });
        } finally { setGuardando(false); }
    };

    // --- RENDERIZADO ---
    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column bg-light">
            <MessageModal show={msg.show} onClose={() => setMsg({...msg, show: false})} title={msg.title} message={msg.text} type={msg.type} />
            
            <div className="row g-0 flex-grow-1" style={{minHeight: 0}}>
                
                {/* PANEL IZQUIERDO: LISTA DE TAREAS */}
                <div className={`col-md-4 col-lg-3 border-end bg-white d-flex flex-column shadow-sm z-1 ${selectedOt ? 'd-none d-md-flex' : 'd-flex'}`}>
                    <div className="p-4 border-bottom bg-white">
                        <h5 className="fw-bold mb-0 text-dark d-flex align-items-center">
                            <i className="bi bi-clipboard-data me-3 fs-4 text-primary"></i>
                            Mis Asignaciones
                        </h5>
                        <small className="text-muted">Selecciona una tarea para comenzar</small>
                    </div>
                    <div className="flex-grow-1 overflow-auto p-2 bg-light">
                        {loading ? <div className="p-5 text-center"><span className="spinner-border text-primary"></span></div> : 
                        ots.length === 0 ? <div className="p-5 text-center text-muted">No tienes tareas pendientes. ¡Buen trabajo!</div> :
                        ots.map(ot => {
                            const isActive = selectedOt?.id === ot.id;
                            return (
                                <button key={ot.id} 
                                    className={`card w-100 mb-2 border-0 shadow-sm text-start card-hover transition-all ${isActive ? 'border-start border-5 border-primary bg-white' : 'bg-white'}`}
                                    style={{ transition: 'all 0.2s', transform: isActive ? 'translateX(5px)' : 'none' }}
                                    onClick={() => handleSelectOt(ot)}>
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className={`badge ${isActive ? 'bg-primary' : 'bg-secondary'} bg-opacity-25 text-dark fw-bold`}>OT #{ot.id}</span>
                                            <small className="text-muted"><i className="bi bi-calendar-event me-1"></i>{new Date(ot.fecha_solicitud).toLocaleDateString()}</small>
                                        </div>
                                        <h6 className="mb-1 fw-bold text-dark text-truncate">{ot.activo}</h6>
                                        <p className="mb-2 small text-muted text-truncate">{ot.descripcion_solicitud}</p>
                                        <span className="badge bg-info text-dark bg-opacity-25 border border-info fw-normal">{ot.estado}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* PANEL DERECHO: ÁREA DE TRABAJO */}
                <div className={`col-md-8 col-lg-9 d-flex flex-column position-relative ${!selectedOt ? 'd-none d-md-flex' : 'd-flex'}`} style={{backgroundColor: '#f8f9fa'}}>
                    {selectedOt ? (
                        <>
                            {/* CABECERA FLOTANTE INTEGRADA */}
                            <div className="bg-white border-bottom shadow-sm sticky-top" style={{zIndex: 1020}}>
                                {/* Fila Superior: Título y Botón de Acción */}
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
                                        <button className={`btn btn-lg fw-bold px-4 shadow d-flex align-items-center ${datosEnvio.firma ? 'btn-danger' : 'btn-primary'}`} onClick={handleGuardar} disabled={guardando}>
                                            {guardando ? <span className="spinner-border spinner-border-sm me-2"></span> : 
                                                datosEnvio.firma ? <i className="bi bi-file-earmark-lock-fill me-2 fs-5"></i> : <i className="bi bi-save-fill me-2 fs-5"></i>
                                            }
                                            <span className="d-none d-sm-inline">{datosEnvio.firma ? 'FINALIZAR Y FIRMAR' : 'GUARDAR AVANCE'}</span>
                                            <span className="d-inline d-sm-none">{datosEnvio.firma ? 'FINALIZAR' : 'GUARDAR'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Pestañas de Navegación Estilizadas */}
                                <div className="px-3 px-md-4">
                                    <ul className="nav nav-pills nav-fill gap-2 p-1 bg-light rounded-pill" role="tablist" style={{maxWidth: '600px'}}>
                                        <li className="nav-item" role="presentation">
                                            <button className={`nav-link rounded-pill fw-bold d-flex align-items-center justify-content-center py-2 ${activeTab === 'checklist' ? 'active shadow-sm' : 'text-muted'}`} 
                                                onClick={() => setActiveTab('checklist')}>
                                                <i className="bi bi-list-check me-2 fs-5"></i>Pauta de Trabajo
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
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

                            {/* CONTENIDO PRINCIPAL (EL DOCUMENTO) */}
                            <div className="flex-grow-1 overflow-auto p-3 p-md-4">
                                {loadingDetalle ? (
                                    <div className="d-flex flex-column align-items-center justify-content-center h-50 text-muted">
                                        <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}}></div>
                                        <p className="fw-medium">Cargando datos de la orden...</p>
                                    </div>
                                ) : (
                                    // Este div simula la "hoja de papel"
                                    <div className="bg-white rounded-4 shadow-sm p-4 mx-auto" style={{maxWidth: '1000px', minHeight: '100%'}}>
                                        
                                        {/* --- PESTAÑA CHECKLIST --- */}
                                        <div className={activeTab === 'checklist' ? 'd-block' : 'd-none'}>
                                            {selectedOt.plantilla_json ? (
                                                <ChecklistRenderer 
                                                    plantilla={typeof selectedOt.plantilla_json === 'string' ? JSON.parse(selectedOt.plantilla_json) : selectedOt.plantilla_json}
                                                    respuestasIniciales={detallesOt.respuestas} 
                                                    onChange={(data) => setDatosEnvio(data)}
                                                />
                                            ) : (
                                                <div className="text-center py-5 text-muted opacity-50">
                                                    <i className="bi bi-file-earmark-x display-1"></i>
                                                    <h4 className="mt-3">Sin Pauta Digital</h4>
                                                    <p>Este activo no tiene un checklist configurado.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* --- PESTAÑA MATERIALES (NUEVO DISEÑO DE TARJETAS) --- */}
                                        <div className={activeTab === 'materiales' ? 'd-block' : 'd-none'}>
                                            <h5 className="fw-bold mb-4 text-dark border-bottom pb-2">
                                                <i className="bi bi-box-seam me-2 text-primary"></i>
                                                Repuestos e Insumos Asignados
                                            </h5>
                                            
                                            {detallesOt.insumos.length === 0 ? (
                                                 <div className="text-center py-5 text-muted opacity-50">
                                                    <i className="bi bi-box display-1"></i>
                                                    <p className="mt-3 fw-bold">No se requieren materiales adicionales para esta tarea.</p>
                                                </div>
                                            ) : (
                                                <div className="row row-cols-1 row-cols-md-2 g-3">
                                                    {detallesOt.insumos.map((item, idx) => {
                                                        const estaListo = item.estado_linea === 'ENTREGADO';
                                                        const esParcial = item.estado_linea === 'PARCIAL';
                                                        
                                                        return (
                                                            <div key={idx} className="col">
                                                                <div className={`card h-100 border-0 shadow-sm ${estaListo ? 'border-start border-success border-4' : esParcial ? 'border-start border-warning border-4' : 'border-start border-danger border-4'}`}>
                                                                    <div className="card-body d-flex align-items-center p-3">
                                                                        {/* Icono Estado Grande */}
                                                                        <div className={`rounded-circle p-3 me-3 d-flex align-items-center justify-content-center flex-shrink-0 ${estaListo ? 'bg-success bg-opacity-10 text-success' : esParcial ? 'bg-warning bg-opacity-10 text-warning' : 'bg-danger bg-opacity-10 text-danger'}`} style={{width: '60px', height: '60px'}}>
                                                                            <i className={`bi ${estaListo ? 'bi-check-lg display-6' : esParcial ? 'bi-hourglass-split display-6' : 'bi-x-lg display-6'}`}></i>
                                                                        </div>
                                                                        
                                                                        {/* Detalles */}
                                                                        <div className="flex-grow-1 overflow-hidden">
                                                                            <h6 className="fw-bold mb-1 text-truncate">{item.nombre}</h6>
                                                                            <div className="d-flex justify-content-between align-items-end">
                                                                                <div>
                                                                                    <small className="text-muted d-block font-monospace"><i className="bi bi-upc me-1"></i>{item.codigo_sku}</small>
                                                                                    <div className="mt-2">
                                                                                        <span className="badge bg-light text-dark border me-2">Solicitado: {parseFloat(item.cantidad)} {item.unidad_medida}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-end">
                                                                                    <small className="text-muted d-block">En tu poder:</small>
                                                                                    <span className={`fs-5 fw-bold ${estaListo ? 'text-success' : 'text-danger'}`}>
                                                                                        {parseFloat(item.cantidad_entregada)}
                                                                                    </span>
                                                                                    <small className="text-muted ms-1">{item.unidad_medida}</small>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* Footer de estado */}
                                                                    <div className={`card-footer py-1 small fw-bold text-center ${estaListo ? 'bg-success text-white' : esParcial ? 'bg-warning text-dark' : 'bg-danger text-white'}`}>
                                                                        {estaListo ? 'LISTO PARA USAR' : esParcial ? 'ENTREGA PARCIAL EN BODEGA' : 'PENDIENTE DE BODEGA'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {detallesOt.insumos.length > 0 && (
                                                <div className="alert alert-info mt-4 d-flex align-items-center shadow-sm mb-0">
                                                    <i className="bi bi-info-circle-fill fs-4 me-3 text-info"></i>
                                                    <div>
                                                        <strong>Información Importante:</strong> Solo puedes utilizar los materiales que figuren con estado <span className="badge bg-success mx-1">LISTO PARA USAR</span>. Si un material sigue pendiente, contacta a bodega antes de finalizar la OT.
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // ESTADO VACÍO (Sin seleccionar)
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted p-4 text-center" style={{backgroundColor: '#f8f9fa'}}>
                            <img src="https://cdn-icons-png.flaticon.com/512/7693/7693327.png" alt="Select Task" style={{width: '150px', opacity: 0.5}} className="mb-4 grayscale" />
                            <h3 className="fw-bold text-dark">¡Listo para trabajar!</h3>
                            <p className="lead mb-0">Selecciona una Orden de Trabajo del panel izquierdo para comenzar tu pauta.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Un pequeño estilo CSS en línea para el efecto hover de las tarjetas del sidebar
const styles = document.createElement('style');
styles.innerHTML = `
    .card-hover:hover { transform: translateX(5px); background-color: #f8f9fa !important; cursor: pointer; }
    .grayscale { filter: grayscale(100%); }
    .transition-all { transition: all 0.3s ease; }
`;
document.head.appendChild(styles);

export default MisMantenciones;