import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import ModalAgendar from '../components/ModalAgendar';
import axios from '../api/axiosConfig';
import Swal from 'sweetalert2';
import { usePermission } from '../hooks/usePermission';

const Cronograma = () => {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modoModal, setModoModal] = useState('MANTENCION');

    const calendarRef = useRef(null);
    const { can } = usePermission();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get('/cronograma');
            if (response.data.success) {
                const formattedEvents = response.data.data.map(evt => ({
                    id: evt.id,
                    title: evt.titulo,
                    // Si tiene hora, usarla. Si no, FullCalendar asume todo el día si no tiene 'T'
                    start: evt.hora_programada ? `${evt.fecha_programada}T${evt.hora_programada}` : evt.fecha_programada,
                    backgroundColor: evt.tipo_evento === 'COMPRA' ? '#198754' : '#0d6efd',
                    borderColor: 'transparent',
                    extendedProps: {
                        description: evt.descripcion,
                        tipo_evento: evt.tipo_evento,
                        estado: evt.estado,
                        ...evt
                    }
                }));
                setEvents(formattedEvents);
            }
        } catch (error) {
            console.error("Error cargando eventos", error);
        }
    };

    // Renderizado personalizado de la celda del evento
    const renderEventContent = (eventInfo) => {
        const isCompra = eventInfo.event.extendedProps.tipo_evento === 'COMPRA';
        return (
            <div className="d-flex align-items-center px-2 py-1 overflow-hidden" style={{ fontSize: '0.85rem' }}>
                <i className={`bi ${isCompra ? 'bi-cart-fill' : 'bi-tools'} me-2`}></i>
                <span className="fw-semibold text-truncate">{eventInfo.event.title}</span>
            </div>
        );
    };

    const handleDateSelect = async (selectInfo) => {
        const calendarApi = selectInfo.view.calendar;
        calendarApi.unselect(); // Limpiar selección visual

        const fechaSeleccionada = selectInfo.startStr.split('T')[0]; // Solo la parte de fecha YYYY-MM-DD
        setSelectedDate(fechaSeleccionada);
        setSelectedEvent(null);

        const puedeMantencion = can('cron_mant_crear');
        const puedeCompra = can('cron_compra_crear');

        if (puedeMantencion && puedeCompra) {
            // Modal Pregunta: ¿Qué quieres crear?
            const { value: tipo } = await Swal.fire({
                title: 'Nueva Tarea',
                text: `¿Qué deseas agendar para el ${new Date(selectInfo.start).toLocaleDateString()}?`,
                icon: 'question',
                showConfirmButton: false,
                showCloseButton: true,
                html: `
                    <div class="d-grid gap-3 mt-3">
                        <button id="btn-mant" class="btn btn-outline-primary p-3 shadow-sm text-start d-flex align-items-center">
                            <div class="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                                <i class="bi bi-tools fs-4 text-primary"></i>
                            </div>
                            <div>
                                <h6 class="mb-0 fw-bold">Mantención</h6>
                                <small class="text-muted">Programar revisión de equipos</small>
                            </div>
                        </button>
                        <button id="btn-comp" class="btn btn-outline-success p-3 shadow-sm text-start d-flex align-items-center">
                            <div class="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                                <i class="bi bi-cart-fill fs-4 text-success"></i>
                            </div>
                            <div>
                                <h6 class="mb-0 fw-bold">Compra Programada</h6>
                                <small class="text-muted">Planificar adquisición de insumos</small>
                            </div>
                        </button>
                    </div>
                `,
                didOpen: () => {
                    document.getElementById('btn-mant').onclick = () => { Swal.close(); abrirModal('MANTENCION'); };
                    document.getElementById('btn-comp').onclick = () => { Swal.close(); abrirModal('COMPRA'); };
                }
            });
        } else if (puedeMantencion) {
            abrirModal('MANTENCION');
        } else if (puedeCompra) {
            abrirModal('COMPRA');
        } else {
            Swal.fire('Acceso Denegado', 'No tienes permisos para agendar eventos.', 'warning');
        }
    };

    const abrirModal = (modo) => {
        setModoModal(modo);
        setShowModal(true);
    };

    const handleEventClick = (clickInfo) => {
        const evt = clickInfo.event;
        const props = evt.extendedProps;

        // Verificar permisos de edición
        const sinPermisoMant = props.tipo_evento === 'MANTENCION' && !can('cron_mant_editar');
        const sinPermisoComp = props.tipo_evento === 'COMPRA' && !can('cron_compra_editar');

        if (sinPermisoMant || sinPermisoComp) {
            // Solo ver detalle
            Swal.fire({
                title: `<span class="${props.tipo_evento === 'COMPRA' ? 'text-success' : 'text-primary'}">${evt.title}</span>`,
                html: `
                    <div class="text-start p-3 bg-light rounded border">
                        <p class="mb-2"><strong><i class="bi bi-calendar-event me-2"></i>Fecha:</strong> ${new Date(evt.start).toLocaleDateString()} ${evt.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <p class="mb-2"><strong><i class="bi bi-tag me-2"></i>Tipo:</strong> ${props.tipo_evento}</p>
                        <p class="mb-2"><strong><i class="bi bi-info-circle me-2"></i>Estado:</strong> <span class="badge bg-secondary">${props.estado}</span></p>
                        <hr/>
                        <p class="mb-0 text-muted"><em>${props.descripcion || 'Sin descripción adicional'}</em></p>
                    </div>
                `,
                showCloseButton: true,
                showConfirmButton: false
            });
            return;
        }

        // Abrir modal de edición
        setSelectedEvent({
            id: evt.id,
            title: evt.title,
            start: evt.startStr.split('T')[0], // Fecha YYYY-MM-DD
            hora: evt.startStr.includes('T') ? evt.startStr.split('T')[1].substring(0, 5) : '09:00', // Hora HH:mm
            ...props
        });
        setModoModal(props.tipo_evento);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedEvent(null);
    };

    const handleModalSave = () => {
        fetchEvents();
        setShowModal(false);
    };

    return (
        <>
            <div className="container-fluid py-4 fade-in">
                {/* Cabecera Estilizada */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                    <div>
                        <h3 className="fw-bold text-dark mb-1">
                            <i className="bi bi-calendar-check text-primary me-2"></i>
                            Planificación Operativa
                        </h3>
                        <p className="text-muted mb-0 small">Gestiona mantenciones y compras desde una vista unificada.</p>
                    </div>
                    
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 d-flex align-items-center border border-primary border-opacity-25">
                            <i className="bi bi-tools me-2"></i> Mantenciones
                        </span>
                        <span className="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-2 d-flex align-items-center border border-success border-opacity-25">
                            <i className="bi bi-cart-fill me-2"></i> Compras
                        </span>
                    </div>
                </div>

                {/* Contenedor del Calendario */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            locale={esLocale}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            buttonText={{
                                today: 'Hoy',
                                month: 'Mes',
                                week: 'Semana',
                                day: 'Día'
                            }}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            weekends={true}
                            events={events}
                            select={handleDateSelect}
                            eventClick={handleEventClick}
                            eventContent={renderEventContent}
                            height="auto"
                            contentHeight="75vh"
                            themeSystem="bootstrap5"
                            eventClassNames="rounded-2 shadow-sm border-0 my-1 cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Modal de Agendamiento */}
            {showModal && (
                <ModalAgendar
                    show={showModal}
                    onClose={handleModalClose}
                    onSave={handleModalSave}
                    initialDate={selectedDate}
                    eventData={selectedEvent}
                    mode={modoModal}
                />
            )}
        </>
    );
};

export default Cronograma;