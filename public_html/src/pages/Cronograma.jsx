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
        // 1. Intentar generar OTs automáticas inmediatamente (por si la fecha es hoy o próxima)
        try { await api.get('/index.php/cronograma/verificar'); } catch(e){}
        
        // 2. Recargar la lista para mostrar la OT generada
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

        const blanks = Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`} className="calendar-day empty bg-light border-end border-bottom"></div>);
        
        const daysArray = Array.from({ length: days }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${(month+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
            const dayEvents = eventos.filter(ev => ev.fecha_programada === dateStr);
            const isToday = new Date().toISOString().slice(0,10) === dateStr;

            return (
                <div key={day} 
                    className={`calendar-day border-end border-bottom p-1 position-relative ${isToday ? 'bg-primary bg-opacity-10' : 'bg-white'}`} 
                    style={{height: '120px', cursor: 'pointer', overflow: 'hidden'}}
                    onClick={() => handleDayClick(day)}
                >
                    <div className={`fw-bold small mb-1 ${isToday?'text-primary':'text-secondary'}`} style={{textAlign:'right'}}>{day}</div>
                    
                    <div className="d-flex flex-column gap-1" style={{maxHeight:'90px', overflowY:'auto'}}>
                        {dayEvents.map(ev => (
                            <div key={ev.id} 
                                 className="badge text-start text-truncate fw-normal shadow-sm border" 
                                 style={{backgroundColor: ev.color || '#0d6efd', color: '#fff', fontSize: '0.7rem', cursor: 'pointer'}}
                                 onClick={(e) => handleEventClick(e, ev.id)}
                                 title={`${ev.titulo} - ${ev.activo_nombre}`}>
                                
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>
                                        <i className={`bi ${ev.icono || 'bi-tools'} me-1`}></i>
                                        {ev.activo_nombre}
                                    </span>
                                    {/* MUESTRA NÚMERO DE OT SI EXISTE */}
                                    {ev.solicitud_ot_id && (
                                        <span className="badge bg-white text-dark ms-1" style={{fontSize:'0.65rem'}}>
                                            OT #{ev.solicitud_ot_id}
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

    return (
        <div className="container-fluid p-3 h-100 d-flex flex-column">
            <ModalAgendar 
                show={showModal} 
                onClose={() => setShowModal(false)} 
                fechaSeleccionada={fechaSeleccionada}
                eventId={selectedEventId}
                onSave={handleSaveCallback} // Usamos la nueva función
            />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fw-bold mb-0 text-dark">
                    <i className="bi bi-calendar-week me-2"></i>
                    {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="btn-group">
                    <button className="btn btn-outline-dark" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}><i className="bi bi-chevron-left"></i></button>
                    <button className="btn btn-outline-dark" onClick={() => setCurrentDate(new Date())}>Hoy</button>
                    <button className="btn btn-outline-dark" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}><i className="bi bi-chevron-right"></i></button>
                </div>
            </div>

            <div className="flex-grow-1 border rounded shadow-sm overflow-hidden d-flex flex-column bg-white">
                <div className="d-grid bg-light border-bottom text-center fw-bold py-2 text-muted" style={{gridTemplateColumns: 'repeat(7, 1fr)'}}>
                    <div>DOM</div><div>LUN</div><div>MAR</div><div>MIÉ</div><div>JUE</div><div>VIE</div><div>SÁB</div>
                </div>
                <div className="d-grid flex-grow-1" style={{gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr'}}>
                    {renderCells()}
                </div>
            </div>
        </div>
    );
};

export default Cronograma;