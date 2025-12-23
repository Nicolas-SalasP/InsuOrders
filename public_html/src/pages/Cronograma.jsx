import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import ModalAgendar from '../components/ModalAgendar';

const Cronograma = () => {
    const [eventos, setEventos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [fechaSeleccionada, setFechaSeleccionada] = useState('');
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        cargarEventos();
    }, []);

    const cargarEventos = async () => {
        try {
            const res = await api.get('/index.php/cronograma');
            if (res.data.success) setEventos(res.data.data);
        } catch (error) { console.error(error); }
    };

    // --- MANEJO DE GUARDADO INTELIGENTE ---
    const handleSaveCallback = async () => {
        try { await api.get('/index.php/cronograma/verificar'); } catch (e) { }
        cargarEventos();
    };

    const handleDayClick = (day) => {
        const mesStr = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const diaStr = day.toString().padStart(2, '0');
        setFechaSeleccionada(`${currentDate.getFullYear()}-${mesStr}-${diaStr}`);
        setSelectedEventId(null);
        setShowModal(true);
    };

    const handleEventClick = (e, id) => {
        e.stopPropagation();
        setSelectedEventId(id);
        setShowModal(true);
    };

    // --- RENDERIZADO CALENDARIO ---
    const renderCells = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        const blanks = Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`} className="bg-light border-end border-bottom"></div>);

        const daysArray = Array.from({ length: days }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dayEvents = eventos.filter(ev => ev.fecha_programada === dateStr);
            const isToday = new Date().toISOString().slice(0, 10) === dateStr;

            return (
                <div key={day}
                    className={`border-end border-bottom p-1 position-relative ${isToday ? 'bg-primary bg-opacity-10' : 'bg-white'}`}
                    style={{ height: '120px', cursor: 'pointer', overflow: 'hidden', minWidth: '100px' }} // minWidth evita que se aplaste en movil
                    onClick={() => handleDayClick(day)}
                >
                    <div className={`fw-bold small mb-1 ${isToday ? 'text-primary' : 'text-secondary'}`} style={{ textAlign: 'right' }}>{day}</div>

                    <div className="d-flex flex-column gap-1" style={{ maxHeight: '90px', overflowY: 'auto' }}>
                        {dayEvents.map(ev => (
                            <div key={ev.id}
                                className="badge text-start text-truncate fw-normal shadow-sm border"
                                style={{ backgroundColor: ev.color || '#0d6efd', color: '#fff', fontSize: '0.7rem', cursor: 'pointer' }}
                                onClick={(e) => handleEventClick(e, ev.id)}
                                title={`${ev.titulo} - ${ev.activo_nombre}`}>

                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-truncate">
                                        <i className={`bi ${ev.icono || 'bi-tools'} me-1`}></i>
                                        {ev.activo_nombre}
                                    </span>
                                    {ev.solicitud_ot_id && (
                                        <span className="badge bg-white text-dark ms-1 rounded-pill" style={{ fontSize: '0.6rem' }}>
                                            OT{ev.solicitud_ot_id}
                                        </span>
                                    )}
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
        <div className="container-fluid h-100 p-0 d-flex flex-column">

            <ModalAgendar
                show={showModal}
                onClose={() => setShowModal(false)}
                fechaSeleccionada={fechaSeleccionada}
                eventId={selectedEventId}
                onSave={handleSaveCallback}
            />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>

                <div className="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 flex-shrink-0">

                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary d-none d-sm-block">
                            <i className="bi bi-calendar-week fs-3"></i>
                        </div>
                        <h4 className="mb-0 fw-bold text-dark">Cronograma</h4>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <h4 className="mb-0 text-dark fw-bold text-capitalize d-none d-sm-block">
                            {mesActual} {currentDate.getFullYear()}
                        </h4>

                        <div className="btn-group shadow-sm">
                            <button className="btn btn-outline-primary" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
                                <i className="bi bi-chevron-left"></i>
                            </button>
                            <button className="btn btn-primary fw-bold px-3" onClick={() => setCurrentDate(new Date())}>
                                Hoy
                            </button>
                            <button className="btn btn-outline-primary" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                    <h5 className="mb-0 text-dark fw-bold text-capitalize d-block d-sm-none">
                        {mesActual} {currentDate.getFullYear()}
                    </h5>
                </div>

                <div className="card-body p-0 d-flex flex-column" style={{ overflow: 'hidden' }}>

                    <div className="d-grid bg-light border-bottom text-center fw-bold py-2 text-secondary small text-uppercase"
                        style={{ gridTemplateColumns: 'repeat(7, 1fr)', minWidth: '700px' }}>
                        <div>Domingo</div><div>Lunes</div><div>Martes</div><div>Miércoles</div><div>Jueves</div><div>Viernes</div><div>Sábado</div>
                    </div>

                    <div className="flex-grow-1 overflow-auto bg-light">
                        <div className="d-grid bg-white" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(120px, 1fr)', minWidth: '700px' }}>
                            {renderCells()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cronograma;