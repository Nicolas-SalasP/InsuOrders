import React, { useState, useEffect, useCallback } from 'react';
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

function dateToMes(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const PRIORIDAD_COLOR = {
  CRITICO: 'danger', CRÍTICO: 'danger',
  URGENTE: 'warning',
  ALTA: 'primary',
  MEDIA: 'info',
  BAJA: 'secondary',
};

const ESTADO_COLOR = {
  Pendiente: 'warning',
  'En Proceso': 'primary',
  Pausada: 'secondary',
  Completada: 'success',
  Cancelada: 'danger',
};

const MESES_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

const Cronograma = () => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loadingResumen, setLoadingResumen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modoModal, setModoModal] = useState('MANTENCION');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const { can } = usePermission();

  const fetchEvents = useCallback(async () => {
    try {
      const response = await axios.get('/index.php/cronograma');
      if (response.data.success) {
        setEvents(response.data.data.map(evt => ({
          id: evt.id,
          title: evt.titulo,
          start: evt.fecha_programada,
          backgroundColor: evt.color || (evt.tipo_evento === 'COMPRA' ? '#198754' : '#0d6efd'),
          extendedProps: { ...evt, estado: evt.estado || 'PENDIENTE' },
        })));
      }
    } catch (error) {
      console.error('Error cargando eventos', error);
    }
  }, []);

  const fetchResumen = useCallback(async (mes) => {
    setLoadingResumen(true);
    try {
      const { data } = await axios.get(`/index.php/cronograma/resumen?mes=${mes}`);
      if (data.success) setResumen(data.data);
    } catch {
      // silencioso — resumen no crítico
    } finally {
      setLoadingResumen(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchResumen(dateToMes(viewDate));
  }, [viewDate, fetchResumen]);

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

    setSelectedEvent(props);
    setModoModal(props.tipo_evento);
    setIsReadOnly(sinPermisoMant || sinPermisoComp || esPasado || esFinalizada);
    setShowModal(true);
  };

  // ── Totales para stat cards ──────────────────────────────────────────────
  const totalMes = resumen?.stats?.reduce((s, r) => s + Number(r.total), 0) ?? 0;
  const totalPendientes = resumen?.pendientes?.length ?? 0;

  const mesLabel = `${MESES_ES[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

  return (
    <div className="container-fluid py-4 fade-in">
      {/* ── Cabecera ── */}
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

      {/* ── Calendario ── */}
      <CalendarioCronograma
        events={events}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
        viewDate={viewDate}
        onViewDateChange={setViewDate}
      />

      {/* ── Panel resumen ── */}
      {!loadingResumen && resumen && (
        <div className="row g-3 mt-2">

          {/* Stat cards */}
          <div className="col-12">
            <div className="row g-3">
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body d-flex align-items-center gap-3 py-3">
                    <div className="bg-primary bg-opacity-10 rounded-3 p-2 flex-shrink-0">
                      <i className="bi bi-calendar3 text-primary fs-5"></i>
                    </div>
                    <div>
                      <div className="fw-bold fs-4 lh-1 text-dark">{totalMes}</div>
                      <div className="text-muted small">OTs en {mesLabel}</div>
                    </div>
                  </div>
                </div>
              </div>

              {resumen.stats.map(s => (
                <div key={s.estado_id} className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-body d-flex align-items-center gap-3 py-3">
                      <div className={`bg-${ESTADO_COLOR[s.estado] ?? 'secondary'} bg-opacity-10 rounded-3 p-2 flex-shrink-0`}>
                        <i className={`bi bi-circle-fill text-${ESTADO_COLOR[s.estado] ?? 'secondary'} fs-5`}></i>
                      </div>
                      <div>
                        <div className="fw-bold fs-4 lh-1 text-dark">{s.total}</div>
                        <div className="text-muted small">{s.estado}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Últimas OTs pendientes */}
          {resumen.pendientes?.length > 0 && (
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-0 px-4 pt-4 pb-2 d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="fw-bold mb-0">
                      <i className="bi bi-hourglass-split text-warning me-2"></i>
                      OTs Pendientes
                    </h6>
                    <p className="text-muted small mb-0">{totalPendientes} órdenes activas ordenadas por prioridad</p>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="ps-4 py-2 fw-semibold text-muted small border-0" style={{ width: 60 }}>#OT</th>
                          <th className="py-2 fw-semibold text-muted small border-0">Título</th>
                          <th className="py-2 fw-semibold text-muted small border-0 d-none d-md-table-cell">Activo</th>
                          <th className="py-2 fw-semibold text-muted small border-0 d-none d-lg-table-cell">Asignado a</th>
                          <th className="py-2 fw-semibold text-muted small border-0">Estado</th>
                          <th className="py-2 fw-semibold text-muted small border-0">Prioridad</th>
                          <th className="pe-4 py-2 fw-semibold text-muted small border-0 d-none d-md-table-cell">Fecha req.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumen.pendientes.map(ot => {
                          const prioColor = PRIORIDAD_COLOR[ot.prioridad?.toUpperCase()] ?? 'secondary';
                          const estColor = ESTADO_COLOR[ot.estado] ?? 'secondary';
                          const vencida = ot.fecha_requerida && ot.fecha_requerida < toDateStr(new Date());
                          return (
                            <tr key={ot.id}>
                              <td className="ps-4 py-3">
                                <span className="badge bg-light text-dark border fw-normal font-monospace">
                                  #{ot.id}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="fw-semibold text-dark" style={{ maxWidth: 260 }}>
                                  {ot.titulo}
                                </div>
                              </td>
                              <td className="py-3 d-none d-md-table-cell">
                                <span className="text-muted small">{ot.activo}</span>
                                {ot.activo_codigo !== 'N/A' && (
                                  <span className="d-block text-muted" style={{ fontSize: '0.7rem' }}>
                                    {ot.activo_codigo}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 d-none d-lg-table-cell">
                                <span className="text-muted small">
                                  {ot.asignados || <em className="text-muted">Sin asignar</em>}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`badge rounded-pill bg-${estColor} bg-opacity-10 text-${estColor} border border-${estColor} border-opacity-25`}
                                  style={{ fontSize: '0.72rem' }}>
                                  {ot.estado}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`badge rounded-pill bg-${prioColor} bg-opacity-10 text-${prioColor} border border-${prioColor} border-opacity-25`}
                                  style={{ fontSize: '0.72rem' }}>
                                  {ot.prioridad || 'Media'}
                                </span>
                              </td>
                              <td className="pe-4 py-3 d-none d-md-table-cell">
                                {ot.fecha_requerida ? (
                                  <span className={`small ${vencida ? 'text-danger fw-semibold' : 'text-muted'}`}>
                                    {vencida && <i className="bi bi-exclamation-triangle-fill me-1"></i>}
                                    {new Date(ot.fecha_requerida + 'T00:00:00').toLocaleDateString('es-CL')}
                                  </span>
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skeleton mientras carga */}
      {loadingResumen && (
        <div className="row g-3 mt-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body py-3">
                  <div className="placeholder-glow">
                    <span className="placeholder col-8 rounded"></span>
                    <span className="placeholder col-5 rounded mt-1"></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ModalAgendar
          show={showModal}
          onClose={() => { setShowModal(false); setSelectedEvent(null); setIsReadOnly(false); }}
          onSave={() => { fetchEvents(); fetchResumen(dateToMes(viewDate)); setShowModal(false); setSelectedEvent(null); setIsReadOnly(false); }}
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
