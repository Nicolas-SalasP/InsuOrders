import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Table, Alert } from 'react-bootstrap'; // Usamos componentes de BS para la estructura visual
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';

const ModalEntregaMasivaBodega = ({ show, onClose, onConfirm, selectedItems }) => {
    // Estados para la lógica de Personal (Igual a tu ejemplo)
    const [personal, setPersonal] = useState([]);
    const [personalId, setPersonalId] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [mostrarLista, setMostrarLista] = useState(false);
    const [nombreSeleccionado, setNombreSeleccionado] = useState('');
    
    // Estados propios del modal masivo
    const wrapperRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });

    // 1. Cargar Personal al abrir el modal (Igual a tu ejemplo)
    useEffect(() => {
        if (show) {
            setPersonalId('');
            setNombreSeleccionado('');
            setBusqueda('');
            setLoading(false);
            
            api.get('/index.php/personal')
                .then(res => { 
                    // Agregamos la validación extra de array por seguridad
                    if (res.data.success && Array.isArray(res.data.data)) {
                        setPersonal(res.data.data); 
                    } else {
                        setPersonal([]);
                    }
                })
                .catch(e => {
                    console.error(e);
                    setPersonal([]);
                });
        }
    }, [show]);

    // 2. Manejar click fuera del buscador (Igual a tu ejemplo)
    useEffect(() => {
        const handleClickOutside = (event) => { 
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setMostrarLista(false); 
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Lógica de filtrado
    const personalFiltrado = personal.filter(p => 
        (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) || 
        (p.rut || '').toLowerCase().includes(busqueda.toLowerCase())
    );

    const handleSeleccionarPersonal = (p) => {
        setPersonalId(p.id);
        setNombreSeleccionado(p.nombre);
        setMostrarLista(false);
        setBusqueda('');
    };

    // 3. Confirmar Entrega Masiva
    const handleSubmit = () => {
        if (!personalId) {
            return setMsgModal({ show: true, title: "Error", message: "Debe indicar quién retira los materiales", type: "warning" });
        }

        if (!selectedItems || selectedItems.length === 0) return;

        setLoading(true);

        // Preparamos el array de items para enviar
        const itemsPayload = selectedItems.map(item => ({
            detalle_id: item.detalle_id,
            cantidad: parseFloat(item.cantidad_pendiente) // En masivo se entrega todo lo pendiente
        }));

        // Llamamos a la función del padre con el formato correcto
        if (onConfirm) {
            onConfirm(itemsPayload, personalId);
        }
    };

    if (!show) return null;

    return (
        <>
            <MessageModal 
                show={msgModal.show} 
                onClose={() => setMsgModal({ ...msgModal, show: false })} 
                title={msgModal.title} 
                message={msgModal.message} 
                type={msgModal.type} 
            />

            {/* Estructura Modal Bootstrap */}
            <Modal show={show} onHide={onClose} size="lg" centered backdrop="static">
                <Modal.Header className="bg-success text-white">
                    <Modal.Title className="fw-bold">📦 Entrega Masiva ({selectedItems.length} ítems)</Modal.Title>
                    <button className="btn-close btn-close-white" onClick={onClose}></button>
                </Modal.Header>
                
                <Modal.Body>
                    {/* SECCIÓN 1: BUSCADOR DE PERSONAL (Copiado de tu lógica) */}
                    <div className="mb-4 position-relative" ref={wrapperRef}>
                        <label className="form-label fw-bold"><i className="bi bi-person-vcard me-2 fs-5 align-middle"></i>Responsable del Retiro</label>
                        
                        {nombreSeleccionado ? (
                            <div className="input-group">
                                <span className="input-group-text bg-white text-success"><i className="bi bi-check-circle-fill"></i></span>
                                <input type="text" className="form-control bg-white text-dark fw-bold" value={nombreSeleccionado} readOnly />
                                <button className="btn btn-outline-secondary" type="button" onClick={() => { setPersonalId(''); setNombreSeleccionado(''); setMostrarLista(true); }}>
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Buscar empleado por nombre o RUT..." 
                                        value={busqueda} 
                                        onChange={e => { setBusqueda(e.target.value); setMostrarLista(true); }}
                                        autoFocus
                                    />
                                </div>
                                {mostrarLista && (
                                    <ul className="list-group position-absolute w-100 shadow mt-1 bg-white" style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}>
                                        {personalFiltrado.map(p => (
                                            <li key={p.id} className="list-group-item list-group-item-action cursor-pointer" onClick={() => handleSeleccionarPersonal(p)}>
                                                <div className="fw-bold">{p.nombre}</div>
                                                <small className="text-muted">{p.rut}</small>
                                            </li>
                                        ))}
                                        {personalFiltrado.length === 0 && <li className="list-group-item text-muted small">No se encontraron resultados</li>}
                                    </ul>
                                )}
                            </>
                        )}
                    </div>

                    {/* SECCIÓN 2: TABLA RESUMEN DE ÍTEMS */}
                    <h6 className="fw-bold text-muted mb-2">Resumen de materiales a entregar:</h6>
                    <div className="table-responsive border rounded" style={{ maxHeight: '300px' }}>
                        <Table size="sm" striped hover className="mb-0">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>OT</th>
                                    <th>Insumo</th>
                                    <th className="text-center">Cant.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedItems.map(item => (
                                    <tr key={item.detalle_id}>
                                        <td>#{item.ot_id}</td>
                                        <td>
                                            {item.insumo}
                                            <br/>
                                            <small className="text-muted">{item.codigo_sku}</small>
                                        </td>
                                        <td className="text-center fw-bold text-success">
                                            {parseFloat(item.cantidad_pendiente)} {item.unidad_medida}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    
                    <Alert variant="info" className="mt-3 py-2 small mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        Esta acción entregará la cantidad total pendiente de todos los ítems listados arriba y los descontará del inventario.
                    </Alert>

                </Modal.Body>
                
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button 
                        variant="success" 
                        onClick={handleSubmit} 
                        disabled={!personalId || loading}
                        className="fw-bold px-4"
                    >
                        {loading ? 'Procesando...' : 'Confirmar Entrega Masiva'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ModalEntregaMasivaBodega;