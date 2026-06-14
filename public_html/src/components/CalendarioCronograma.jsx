import React, { useState, useMemo } from 'react';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildGrid(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDow = first.getDay(); // 0=Dom
  const startOffset = startDow === 0 ? 6 : startDow - 1;
  const endDow = last.getDay();
  const endOffset = endDow === 0 ? 0 : 7 - endDow;

  const cursor = new Date(first);
  cursor.setDate(cursor.getDate() - startOffset);
  const end = new Date(last);
  end.setDate(end.getDate() + endOffset);

  const days = [];
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

const MAX_VISIBLE = 3;

export default function CalendarioCronograma({ events, onDayClick, onEventClick }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = useMemo(() => buildGrid(year, month), [year, month]);
  const todayStr = toDateStr(today);

  const byDate = useMemo(() => {
    const map = {};
    (events || []).forEach(evt => {
      const key = (evt.start || '').substring(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(evt);
    });
    return map;
  }, [events]);

  const prev = () => setViewDate(new Date(year, month - 1, 1));
  const next = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      {/* ── Cabecera ── */}
      <div className="card-header bg-white border-bottom px-3 px-md-4 pt-3 pb-0">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold text-dark mb-0 text-capitalize fs-6">
            {MESES[month]} {year}
          </h6>
          <div className="d-flex align-items-center gap-1">
            <button
              className="btn btn-sm btn-light rounded-circle lh-1 p-0 d-flex align-items-center justify-content-center"
              style={{ width: 30, height: 30 }}
              onClick={prev}
              aria-label="Mes anterior"
            >
              <i className="bi bi-chevron-left" style={{ fontSize: '0.8rem' }} />
            </button>
            <button
              className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1"
              style={{ fontSize: '0.8rem' }}
              onClick={goToday}
            >
              Hoy
            </button>
            <button
              className="btn btn-sm btn-light rounded-circle lh-1 p-0 d-flex align-items-center justify-content-center"
              style={{ width: 30, height: 30 }}
              onClick={next}
              aria-label="Mes siguiente"
            >
              <i className="bi bi-chevron-right" style={{ fontSize: '0.8rem' }} />
            </button>
          </div>
        </div>

        {/* Encabezados días */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {DIAS.map(d => (
            <div
              key={d}
              className="text-center text-muted fw-semibold pb-2"
              style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              <span className="d-none d-sm-inline">{d}</span>
              <span className="d-inline d-sm-none">{d[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Grilla ── */}
      <div className="card-body p-2 p-md-3">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {days.map(day => {
            const dateStr = toDateStr(day);
            const inMonth = day.getMonth() === month;
            const isToday = dateStr === todayStr;
            const dayEvts = byDate[dateStr] || [];

            const cellBase = {
              minHeight: 72,
              cursor: 'pointer',
              transition: 'background 0.15s',
            };

            let cellClass = 'rounded-3 border p-1 d-flex flex-column gap-1 ';
            if (isToday) {
              cellClass += 'border-primary ';
            } else if (inMonth) {
              cellClass += 'border-light ';
            } else {
              cellClass += 'border-0 bg-light ';
            }

            return (
              <div
                key={dateStr}
                style={cellBase}
                className={cellClass}
                onClick={() => onDayClick(day)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onDayClick(day)}
              >
                {/* Número del día */}
                <span
                  className={`d-flex align-items-center justify-content-center rounded-circle fw-semibold flex-shrink-0 ${
                    isToday
                      ? 'bg-primary text-white'
                      : inMonth
                      ? 'text-dark'
                      : 'text-muted'
                  }`}
                  style={{ width: 24, height: 24, fontSize: '0.78rem' }}
                >
                  {day.getDate()}
                </span>

                {/* Eventos */}
                <div className="d-flex flex-column gap-1 overflow-hidden flex-grow-1">
                  {dayEvts.slice(0, MAX_VISIBLE).map(evt => {
                    const props = evt.extendedProps || {};
                    const closed = props.ot_estado == 5 || props.ot_estado == 6;
                    const icon = props.icono || (props.tipo_evento === 'COMPRA' ? 'bi-cart-fill' : 'bi-tools');
                    return (
                      <div
                        key={evt.id}
                        onClick={e => { e.stopPropagation(); onEventClick(evt); }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && (e.stopPropagation(), onEventClick(evt))}
                        className="rounded-2 d-flex align-items-center gap-1 text-white text-truncate"
                        style={{
                          backgroundColor: evt.backgroundColor || '#0d6efd',
                          fontSize: '0.68rem',
                          padding: '2px 5px',
                          opacity: closed ? 0.65 : 1,
                          textDecoration: closed ? 'line-through' : 'none',
                          flexShrink: 0,
                        }}
                        title={evt.title}
                      >
                        <i className={`bi ${icon} flex-shrink-0`} style={{ fontSize: '0.6rem' }} />
                        <span className="text-truncate d-none d-sm-inline">{evt.title}</span>
                      </div>
                    );
                  })}
                  {dayEvts.length > MAX_VISIBLE && (
                    <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                      +{dayEvts.length - MAX_VISIBLE} más
                    </span>
                  )}
                  {/* En móvil muestra puntos si hay eventos */}
                  {dayEvts.length > 0 && (
                    <div className="d-flex gap-1 d-sm-none mt-auto flex-wrap">
                      {dayEvts.slice(0, 3).map(evt => (
                        <span
                          key={evt.id}
                          className="rounded-circle flex-shrink-0"
                          style={{
                            width: 6,
                            height: 6,
                            backgroundColor: evt.backgroundColor || '#0d6efd',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Leyenda ── */}
      <div className="card-footer bg-white border-top-0 px-3 px-md-4 pb-3 pt-0">
        <div className="d-flex flex-wrap gap-3" style={{ fontSize: '0.75rem' }}>
          <span className="d-flex align-items-center gap-2 text-muted">
            <span className="rounded-circle flex-shrink-0"
              style={{ width: 8, height: 8, backgroundColor: '#0d6efd', display: 'inline-block' }} />
            Mantenciones
          </span>
          <span className="d-flex align-items-center gap-2 text-muted">
            <span className="rounded-circle flex-shrink-0"
              style={{ width: 8, height: 8, backgroundColor: '#198754', display: 'inline-block' }} />
            Compras
          </span>
        </div>
      </div>
    </div>
  );
}
