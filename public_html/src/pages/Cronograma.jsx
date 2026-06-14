import React, { useState, useEffect } from 'react';
import CalendarioCronograma from '../components/CalendarioCronograma';
import ModalAgendar from '../components/ModalAgendar';
import axios from '../api/axiosConfig';
import Swal from 'sweetalert2';
import { usePermission } from '../hooks/usePermission';

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const Cronograma = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modoModal, setModoModal] = useState('MANTENCION');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const { can } = usePermission();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/index.php/cronograma');
      if (response.data.success) {
        const formattedEvents = response.data.data.map(evt => ({
          id: evt.id,
          title: evt.titulo,
          start: evt.fecha_programada,
          backgroundColor: evt.color || (evt.tipo_evento === 'COMPRA' ? '#198754' : '#0d6efd'),
          extendedProps: {
            ...evt,
            estado: evt.estado || 'PENDIENTE',
          },
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error cargando eventos', error);
    }
  };

  const handleDayClick = async (date) => {
    const fechaSeleccionada = toDateStr(date);
    const todayStr = toDateStr(new Date());

    if (fechaSeleccionada < todayStr) {
      Swal.fire('Fecha Pasada', 'No puedes agendar eventos en fechas pasadas.', 'warning');
      return;
    }

    setSelectedDate(fechaSeleccionada);
    setSelectedEvent(null);
    setIsReadOnly(false);

    const puedeMantencion = can('cron_mant_crear');
    const puedeCompra = can('cron_compra_crear');

    if (puedeMantencion && puedeCompra) {
      await Swal.fire({
        title: 'Nueva Tarea Programada',
        text: `¿Qué deseas agendar para el ${date.toLocaleDateString('es-CL')}?`,
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
                <h6 class="mb-0 fw-bold">Mantención Preventiva</h6>
                <small class="text-muted">Generará una OT automáticamente</small>
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
        },
      });
    } else if (puedeMantencion) {
      abrirModal('MANTENCION');
    } else if (puedeCompra) {
      abrirModal('COMPRA');
    } else {
      Swal.fire('Acceso Denegado', 'No tienes permisos para crear eventos.', 'warning');
    }
  };

  const abrirModal = (modo) => {
    setModoModal(modo);
    setShowModal(true);
  };

  const handleEventClick = (evt) => {
    const props = evt.extendedProps || {};
    const todayStr = toDateStr(new Date());
    const esPasado = props.fecha_programada < todayStr;
    const esFinalizada = props.ot_estado == 5 || props.ot_estado == 6;
    const sinPermisoMant = props.tipo_evento === 'MANTENCION' && !can('cron_mant_editar');
    const sinPermisoComp = props.tipo_evento === 'COMPRA' && !can('cron_compra_editar');
    const soloLectura = sinPermisoMant || sinPermisoComp || esPasado || esFinalizada;

    setSelectedEvent(props);
    setModoModal(props.tipo_evento);
    setIsReadOnly(soloLectura);
    setShowModal(true);
  };

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            <i className="bi bi-calendar-check text-primary me-2"></i>
            Planificación Operativa
          </h3>
          <p className="text-muted mb-0 small">Gestión unificada de activos y abastecimiento.</p>
        </div>

        <div className="d-flex gap-2 mt-3 mt-md-0">
          <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 border border-primary border-opacity-25">
            <i className="bi bi-tools me-2"></i> Mantenciones
          </span>
          <span className="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-2 border border-success border-opacity-25">
            <i className="bi bi-cart-fill me-2"></i> Compras
          </span>
        </div>
      </div>

      <CalendarioCronograma
        events={events}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
      />

      {showModal && (
        <ModalAgendar
          show={showModal}
          onClose={() => { setShowModal(false); setSelectedEvent(null); setIsReadOnly(false); }}
          onSave={() => { fetchEvents(); setShowModal(false); setSelectedEvent(null); setIsReadOnly(false); }}
          initialDate={selectedDate}
          eventData={selectedEvent}
          mode={modoModal}
          readOnly={isReadOnly}
        />
      )}
    </div>
  );
};

export default Cronograma;
