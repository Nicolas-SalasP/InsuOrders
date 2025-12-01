import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import ActivoModal from '../components/ActivoModal';

const Activos = () => {
    const [activos, setActivos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [activoSeleccionado, setActivoSeleccionado] = useState(null);

    useEffect(() => { cargarActivos(); }, []);

    const cargarActivos = async () => {
        const res = await api.get('/index.php/mantencion/activos');
        if (res.data.success) setActivos(res.data.data);
    };

    const handleEdit = (activo) => {
        setActivoSeleccionado(activo);
        setShowModal(true);
    };

    const handleNew = () => {
        setActivoSeleccionado(null);
        setShowModal(true);
    };

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            <ActivoModal 
                show={showModal} 
                onClose={() => setShowModal(false)} 
                activo={activoSeleccionado} 
                onSave={cargarActivos} 
            />

            <div className="card shadow-sm border-0 flex-grow-1">
                <div className="card-header bg-white py-3 d-flex justify-content-between">
                    <h4 className="mb-0 fw-bold text-dark">🚜 Activos / Máquinas</h4>
                    <button className="btn btn-success" onClick={handleNew}>+ Nuevo Activo</button>
                </div>
                <div className="card-body p-0 overflow-auto">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light sticky-top">
                            <tr>
                                <th className="ps-4">Código</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Ubicación</th>
                                <th className="text-end pe-4">Gestión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activos.map(a => (
                                <tr key={a.id}>
                                    <td className="ps-4 fw-bold">{a.codigo_interno}</td>
                                    <td>{a.nombre}</td>
                                    <td><span className="badge bg-info text-dark">{a.tipo || 'General'}</span></td>
                                    <td>{a.ubicacion}</td>
                                    <td className="text-end pe-4">
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(a)}>
                                            <i className="bi bi-gear me-1"></i> Configurar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Activos;