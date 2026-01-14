import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const EmpleadoModal = ({ show, onClose, empleado, centros, usuarios = [], onSave }) => {
    // Estado inicial ajustado a tu DB (Sin teléfono)
    const [form, setForm] = useState({ 
        rut: '', 
        nombre_completo: '', 
        email: '', 
        cargo: '', 
        centro_costo_id: '', 
        usuario_id: '', 
        activo: 1 
    });

    useEffect(() => {
        if (show) {
            setForm(empleado ? {
                id: empleado.id,
                rut: empleado.rut || '',
                nombre_completo: empleado.nombre_completo || '',
                email: empleado.email || '',
                cargo: empleado.cargo || '', // Asegúrate de haber agregado esta columna a la DB
                centro_costo_id: empleado.centro_costo_id || '',
                usuario_id: empleado.usuario_id || '', // Asegúrate de haber agregado esta columna
                activo: empleado.activo !== undefined ? parseInt(empleado.activo) : 1
            } : { 
                rut: '', nombre_completo: '', email: '', cargo: '', 
                centro_costo_id: '', usuario_id: '', activo: 1 
            });
        }
    }, [show, empleado]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/index.php/mantenedores/empleados', form);
            onSave();
            onClose();
        } catch (error) { 
            alert("Error al guardar empleado: " + (error.response?.data?.error || error.message)); 
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg">
                    {/* CABECERA */}
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title fw-bold">
                            {empleado ? <i className="bi bi-pencil-square me-2"></i> : <i className="bi bi-person-plus-fill me-2"></i>}
                            {empleado ? 'Editar Empleado' : 'Nuevo Empleado'}
                        </h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4 bg-light">
                            
                            {/* SECCIÓN 1: IDENTIFICACIÓN */}
                            <div className="card border-0 shadow-sm p-3 mb-3">
                                <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">Identificación</h6>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-secondary">RUT</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white text-muted"><i className="bi bi-person-vcard"></i></span>
                                            <input type="text" className="form-control font-monospace" required placeholder="12.345.678-9"
                                                value={form.rut} onChange={e => setForm({...form, rut: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="col-md-8">
                                        <label className="form-label small fw-bold text-secondary">Nombre Completo</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white text-muted"><i className="bi bi-person"></i></span>
                                            <input type="text" className="form-control fw-bold" required placeholder="Nombre y Apellido"
                                                value={form.nombre_completo} onChange={e => setForm({...form, nombre_completo: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 2: CONTACTO Y CARGO */}
                            <div className="card border-0 shadow-sm p-3 mb-3">
                                <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">Contacto y Cargo</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-secondary">Correo Electrónico</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white text-muted"><i className="bi bi-envelope"></i></span>
                                            <input type="email" className="form-control" placeholder="correo@empresa.cl"
                                                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-secondary">Cargo / Puesto</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white text-muted"><i className="bi bi-briefcase"></i></span>
                                            <input type="text" className="form-control" placeholder="Ej: Operador de Grúa"
                                                value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 3: DATOS CORPORATIVOS */}
                            <div className="card border-0 shadow-sm p-3">
                                <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">Datos Corporativos</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-secondary">Centro de Costo</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white text-muted"><i className="bi bi-building"></i></span>
                                            <select className="form-select" required value={form.centro_costo_id} onChange={e => setForm({...form, centro_costo_id: e.target.value})}>
                                                <option value="">Seleccione...</option>
                                                {centros.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-secondary">Usuario de Sistema (Login)</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white text-muted"><i className="bi bi-key"></i></span>
                                            <select className="form-select" value={form.usuario_id} onChange={e => setForm({...form, usuario_id: e.target.value})}>
                                                <option value="">-- Sin Usuario Vinculado --</option>
                                                {usuarios.map(u => (
                                                    <option key={u.id} value={u.id}>{u.username} ({u.nombre} {u.apellido})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-12 mt-3">
                                        <div className={`form-check form-switch p-2 border rounded ${form.activo === 1 ? 'bg-success bg-opacity-10 border-success' : 'bg-light'}`}>
                                            <input className="form-check-input ms-0 me-3" type="checkbox" id="estadoSwitch"
                                                checked={form.activo === 1}
                                                onChange={e => setForm({...form, activo: e.target.checked ? 1 : 0})} 
                                                style={{ marginLeft: '10px', transform: 'scale(1.2)' }}
                                            />
                                            <label className="form-check-label fw-bold" htmlFor="estadoSwitch">
                                                {form.activo === 1 ? <span className="text-success"><i className="bi bi-check-circle-fill me-1"></i>Empleado Activo</span> : <span className="text-muted">Empleado Inactivo</span>}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer bg-white border-top-0">
                            <button type="button" className="btn btn-light border px-4" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm">
                                <i className="bi bi-floppy me-2"></i>Guardar Ficha
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default EmpleadoModal;