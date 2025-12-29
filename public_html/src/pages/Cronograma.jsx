import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import ModalAgendar from '../components/ModalAgendar';
import { Button, Badge, Form, Spinner } from 'react-bootstrap';

const Cronograma = () => {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [fechaSeleccionada, setFechaSeleccionada] = useState('');
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [modalTipo, setModalTipo] = useState('MANTENCION'); 
    const [filtroTipo, setFiltroTipo] = useState('TODOS'); 
    const [currentDate, setCurrentDate] = useState(new Date());

    // --- SISTEMA DE PERMISOS ---
    const permisosStr = localStorage.getItem('permisos');
    const permisos = permisosStr ? JSON.parse(permisosStr) : [];
    
    const tienePermiso = (codigo) => permisos.some(p => p.codigo === codigo);
    
    // Debug de permisos en consola
    console.log("Permisos cargados en el Cronograma:", permisos.map(p => p.codigo));

    const canCreateMant = tienePermiso('cron_mant_crear'); // ID 37
    const canCreateCompra = tienePermiso('cron_compra_crear'); // ID 38
    const canViewMant = tienePermiso('cron_mant_ver'); // ID 35
    const canViewCompra = tienePermiso('cron_insumos_ver'); // ID 36

    useEffect(() => {
        cargarEventos();
    }, []);

    const cargarEventos = async () => {
        setLoading(true);
        try {
            const res = await api.get('/index.php/cronograma');
            if (res.data.success) {
                // Filtrado por permisos de vista en el front para redundancia
                const dataFiltrada = res.data.data.filter(ev => {
                    if (ev.tipo_evento === 'MANTENCION') return canViewMant;
                    if (ev.tipo_evento === 'COMPRA') return canViewCompra;
                    return true;
                });
                setEventos(dataFiltrada);
            }
        } catch (error) { 
            console.error("Error al cargar eventos:", error); 
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCallback = async () => {
        try { await api.get('/index.php/cronograma/verificar'); } catch (e) { }
        cargarEventos();
    };

    const handleDayClick = (day) => {
        // Bloquear si no tiene permisos de creación
        if (!canCreateMant && !canCreateCompra) return;

        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const diaStr = day.toString().padStart(2, '0');
        setFechaSeleccionada(`${year}-${month}-${diaStr}`);
        
        setSelectedEventId(null);
        // Ajustar tipo inicial según el permiso que tenga disponible
        setModalTipo(canCreateMant ? 'MANTENCION' : 'COMPRA');
        setShowModal(true);
    };

    const handleEventClick = (e, evento) => {
        e.stopPropagation();
        setSelectedEventId(evento.id);
        setModalTipo(evento.tipo_evento);
        setShowModal(true);
    };

    const renderCells = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`blank-${i}`} className="bg-light border-end border-bottom"></div>
        ));

        const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            
            const dayEvents = eventos.filter(ev => {
                const matchFecha = ev.fecha_programada.startsWith(dateStr);
                const matchTipo = filtroTipo === 'TODOS' || ev.tipo_evento === filtroTipo;
                return matchFecha && matchTipo;
            });

            const isToday = new Date().toISOString().slice(0, 10) === dateStr;

            return (
                <div key={day}
                    className={`border-end border-bottom p-1 position-relative ${isToday ? 'bg-primary bg-opacity-10' : 'bg-white'}`}
                    style={{ height: '140px', cursor: 'pointer', overflow: 'hidden', minWidth: '100px' }}
                    onClick={() => handleDayClick(day)}
                >
                    <div className={`fw-bold small mb-1 ${isToday ? 'text-primary' : 'text-secondary'}`} style={{ textAlign: 'right' }}>{day}</div>

                    <div className="d-flex flex-column gap-1" style={{ maxHeight: '110px', overflowY: 'auto' }}>
                        {dayEvents.map(ev => (
                            <div key={ev.id}
                                className="badge text-start text-truncate fw-normal shadow-sm border p-1"
                                style={{ 
                                    backgroundColor: ev.tipo_evento === 'COMPRA' ? '#198754' : (ev.color || '#0d6efd'), 
                                    color: '#fff', 
                                    fontSize: '0.65rem', 
                                    cursor: 'pointer' 
                                }}
                                onClick={(e) => handleEventClick(e, ev)}
                            >
                                <div className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="text-truncate flex-grow-1">
                                            <i className={`bi ${ev.tipo_evento === 'COMPRA' ? 'bi-cart-plus' : (ev.icono || 'bi-tools')} me-1`}></i>
                                            <strong>{ev.titulo}</strong>
                                        </span>
                                        {ev.solicitud_ot_id && (
                                            <span className="badge bg-white text-dark ms-1 rounded-pill" style={{ fontSize: '0.55rem' }}>
                                                OT{ev.solicitud_ot_id}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-truncate opacity-75" style={{ fontSize: '0.6rem' }}>
                                        {ev.tipo_evento === 'MANTENCION' ? ev.activo_nombre : `${ev.insumo_nombre} (${parseFloat(ev.cantidad || 0)})`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        });
        return [...blanks, ...daysArray];
    };

    const mesActual = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][currentDate.getMonth()];

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column bg-light">
            <ModalAgendar
                show={showModal}
                onClose={() => setShowModal(false)}
                fechaSeleccionada={fechaSeleccionada}
                eventId={selectedEventId}
                tipoInicial={modalTipo} 
                onSave={handleSaveCallback}
            />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column m-3" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3">
                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary d-none d-sm-block">
                            <i className="bi bi-calendar-check fs-3"></i>
                        </div>
                        <div>
                            <h4 className="mb-0 fw-bold">Cronograma Operativo</h4>
                            <p className="text-muted small mb-0 d-none d-md-block">Gestión de planta e insumos</p>
                        </div>
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-3 justify-content-center">
                        <Form.Select 
                            size="sm" 
                            className="fw-bold text-primary"
                            style={{ width: '180px' }}
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                        >
                            <option value="TODOS">📅 Ver Todo</option>
                            <option value="MANTENCION">🛠️ Mantenciones</option>
                            <option value="COMPRA">🛒 Compras</option>
                        </Form.Select>

                        <div className="d-flex align-items-center gap-2">
                            <h5 className="mb-0 text-dark fw-bold px-2">{mesActual} {currentDate.getFullYear()}</h5>
                            <div className="btn-group">
                                <Button variant="outline-primary" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}><i className="bi bi-chevron-left"></i></Button>
                                <Button variant="primary" size="sm" onClick={() => setCurrentDate(new Date())}>Hoy</Button>
                                <Button variant="outline-primary" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}><i className="bi bi-chevron-right"></i></Button>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex gap-2">
                        {canCreateCompra && (
                            <Button variant="outline-success" size="sm" className="fw-bold" onClick={() => { setModalTipo('COMPRA'); setSelectedEventId(null); setFechaSeleccionada(new Date().toISOString().split('T')[0]); setShowModal(true); }}>
                                <i className="bi bi-cart-plus me-2"></i> Programar Compra
                            </Button>
                        )}
                        {canCreateMant && (
                            <Button variant="primary" size="sm" className="fw-bold" onClick={() => { setModalTipo('MANTENCION'); setSelectedEventId(null); setFechaSeleccionada(new Date().toISOString().split('T')[0]); setShowModal(true); }}>
                                <i className="bi bi-tools me-2"></i> Nueva Mantención
                            </Button>
                        )}
                    </div>
                </div>

                <div className="card-body p-0 d-flex flex-column">
                    <div className="d-grid bg-light border-bottom text-center fw-bold py-2 text-secondary small text-uppercase"
                        style={{ gridTemplateColumns: 'repeat(7, 1fr)', minWidth: '800px' }}>
                        <div>Domingo</div><div>Lunes</div><div>Martes</div><div>Miércoles</div><div>Jueves</div><div>Viernes</div><div>Sábado</div>
                    </div>

                    <div className="flex-grow-1 overflow-auto bg-light">
                        {loading ? (
                            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                        ) : (
                            <div className="d-grid bg-white shadow-inner" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(140px, 1fr)', minWidth: '800px' }}>
                                {renderCells()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cronograma;