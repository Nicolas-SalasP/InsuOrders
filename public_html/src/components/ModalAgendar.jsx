import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import Swal from 'sweetalert2';

const ModalAgendar = ({ show, onClose, onSave, initialDate, eventData, mode }) => {
    // Datos Generales
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        fecha_programada: initialDate || '',
        hora_programada: '09:00',
        estado: 'PENDIENTE',
        activo_id: '',
        monto_estimado: 0,
        insumos: []
    });

    const [activos, setActivos] = useState([]);
    const [listaInsumos, setListaInsumos] = useState([]);
    const [insumoSeleccionado, setInsumoSeleccionado] = useState('');
    const [cantidadInsumo, setCantidadInsumo] = useState(1);

    useEffect(() => {
        if (show) {
            cargarDatosAuxiliares();
            if (eventData) {
                setFormData({
                    ...formData,
                    ...eventData,
                    fecha_programada: eventData.start || initialDate
                });
            } else {
                setFormData(prev => ({ ...prev, fecha_programada: initialDate || '' }));
            }
        }
    }, [show, eventData, initialDate, mode]);

    const cargarDatosAuxiliares = async () => {
        try {
            if (mode === 'MANTENCION') {
                const res = await axios.get('/mantencion/activos');
                if (res.data.success) setActivos(res.data.data);
            } else {
                // CORREGIDO: Usar /inventario/auxiliares para coincidir con index.php
                const res = await axios.get('/inventario/auxiliares'); 
                if (res.data.success) {
                    // CORREGIDO: Usar /inventario para traer la lista de productos
                    const resInsumos = await axios.get('/inventario');
                    if (resInsumos.data.success) setListaInsumos(resInsumos.data.data);
                }
            }
        } catch (error) {
            console.error("Error cargando auxiliares", error);
            // Opcional: Mostrar alerta solo si es crítico
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const agregarInsumoALista = () => {
        if (!insumoSeleccionado || cantidadInsumo <= 0) return;
        const insumoObj = listaInsumos.find(i => i.id == insumoSeleccionado);

        setFormData(prev => ({
            ...prev,
            insumos: [...prev.insumos, {
                insumo_id: insumoSeleccionado,
                nombre: insumoObj?.nombre,
                cantidad: cantidadInsumo
            }]
        }));
        setInsumoSeleccionado('');
        setCantidadInsumo(1);
    };

    const eliminarInsumoLista = (index) => {
        const nuevos = [...formData.insumos];
        nuevos.splice(index, 1);
        setFormData(prev => ({ ...prev, insumos: nuevos }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, tipo_evento: mode };
            let response;
            if (eventData?.id) {
                response = await axios.put(`/cronograma/${eventData.id}`, payload); // Si falla, probar PUT body
            } else {
                response = await axios.post('/cronograma', payload);
            }

            if (response.data.success) {
                Swal.fire('Éxito', 'Evento guardado correctamente', 'success');
                onSave();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
        }
    };

    const handleDelete = async () => {
        if (!eventData?.id) return;
        const result = await Swal.fire({
            title: '¿Eliminar evento?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                // Pasamos el ID en la URL
                await axios.delete(`/cronograma?id=${eventData.id}&tipo=${mode}`);
                Swal.fire('Eliminado', 'El evento ha sido eliminado.', 'success');
                onSave();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar.', 'error');
            }
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content shadow">
                    <div className={`modal-header text-white ${mode === 'MANTENCION' ? 'bg-primary' : 'bg-success'}`}>
                        <h5 className="modal-title">
                            {eventData ? 'Editar' : 'Agendar'} {mode === 'MANTENCION' ? 'Mantención' : 'Compra Programada'}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-md-8">
                                    <label className="form-label">Título</label>
                                    <input type="text" className="form-control" name="titulo" value={formData.titulo} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Estado</label>
                                    <select className="form-select" name="estado" value={formData.estado} onChange={handleChange}>
                                        <option value="PENDIENTE">Pendiente</option>
                                        <option value="EN_PROCESO">En Proceso</option>
                                        <option value="COMPLETADO">Completado</option>
                                        <option value="CANCELADO">Cancelado</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Fecha</label>
                                    <input type="date" className="form-control" name="fecha_programada" value={formData.fecha_programada} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Hora</label>
                                    <input type="time" className="form-control" name="hora_programada" value={formData.hora_programada} onChange={handleChange} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Descripción</label>
                                    <textarea className="form-control" name="descripcion" rows="2" value={formData.descripcion} onChange={handleChange}></textarea>
                                </div>

                                <hr />

                                {mode === 'MANTENCION' && (
                                    <div className="col-12">
                                        <label className="form-label">Activo / Máquina</label>
                                        <select className="form-select" name="activo_id" value={formData.activo_id} onChange={handleChange}>
                                            <option value="">-- Seleccionar Activo --</option>
                                            {activos.map(a => (
                                                <option key={a.id} value={a.id}>{a.codigo_interno} - {a.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {mode === 'COMPRA' && (
                                    <>
                                        <div className="col-md-6">
                                            <label className="form-label">Monto Estimado ($)</label>
                                            <input type="number" className="form-control" name="monto_estimado" value={formData.monto_estimado} onChange={handleChange} />
                                        </div>
                                        <div className="col-12 mt-3">
                                            <h6>Lista de Compras</h6>
                                            <div className="input-group mb-2">
                                                <select className="form-select" value={insumoSeleccionado} onChange={(e) => setInsumoSeleccionado(e.target.value)}>
                                                    <option value="">-- Buscar Insumo --</option>
                                                    {listaInsumos.map(i => (
                                                        <option key={i.id} value={i.id}>{i.codigo_sku} - {i.nombre}</option>
                                                    ))}
                                                </select>
                                                <input type="number" className="form-control" placeholder="Cant." style={{ maxWidth: '80px' }} value={cantidadInsumo} onChange={(e) => setCantidadInsumo(e.target.value)} />
                                                <button type="button" className="btn btn-success" onClick={agregarInsumoALista}><i className="bi bi-plus"></i></button>
                                            </div>
                                            <ul className="list-group">
                                                {formData.insumos?.map((item, idx) => (
                                                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center p-2">
                                                        <span>{item.nombre} (x{item.cantidad})</span>
                                                        <button type="button" className="btn btn-sm btn-danger py-0" onClick={() => eliminarInsumoLista(idx)}>x</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            {eventData?.id && <button type="button" className="btn btn-danger me-auto" onClick={handleDelete}>Eliminar</button>}
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalAgendar;