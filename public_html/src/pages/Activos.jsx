import { useEffect, useState, useContext } from 'react';
import api from '../api/axiosConfig';
import AuthContext from '../context/AuthContext';
import ActivoModal from '../components/ActivoModal';
import ModalCargaMasiva from '../components/ModalCargaMasiva';

const Activos = () => {
    const { auth } = useContext(AuthContext);
    const [activos, setActivos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [activoSeleccionado, setActivoSeleccionado] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => { cargarActivos(); }, []);

    const cargarActivos = async () => {
        setLoading(true);
        try {
            const res = await api.get('/index.php/mantencion/activos');
            if (res.data.success) setActivos(res.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (activo) => {
        setActivoSeleccionado(activo);
        setShowModal(true);
    };

    const handleNew = () => {
        setActivoSeleccionado(null);
        setShowModal(true);
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            const response = await api.get('/index.php/exportar?modulo=activos', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Activos_${new Date().toISOString().slice(0, 10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exportando", error);
            alert("Error al exportar. Verifique sus permisos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">

            <ActivoModal
                show={showModal}
                onClose={() => setShowModal(false)}
                activo={activoSeleccionado}
                onSave={cargarActivos}
            />

            <ModalCargaMasiva
                show={showImport}
                onClose={() => setShowImport(false)}
                tipo="activos"
                onSave={cargarActivos}
            />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>

                <div className="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 flex-shrink-0">

                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary d-none d-sm-block">
                            <i className="bi bi-truck fs-3"></i>
                        </div>
                        <h4 className="mb-0 fw-bold text-dark">Activos / Máquinas</h4>
                    </div>

                    <div className="d-flex gap-2 justify-content-center flex-wrap">

                        <button
                            className="btn btn-outline-success shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-center py-2 px-3"
                            onClick={handleExport}
                            disabled={loading}
                            title="Exportar a Excel"
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm mb-1 mb-md-0 me-md-2"></span>
                            ) : (
                                <i className="bi bi-file-earmark-excel fs-5 mb-1 mb-md-0 me-md-2"></i>
                            )}
                            <span className="small fw-bold">Exportar</span>
                        </button>
                        {auth.rol === 'Admin' && (
                            <button
                                className="btn btn-outline-dark shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-center py-2 px-3"
                                onClick={() => setShowImport(true)}
                                title="Importar Masivamente"
                            >
                                <i className="bi bi-file-earmark-arrow-up fs-5 mb-1 mb-md-0 me-md-2"></i>
                                <span className="small fw-bold">Importar</span>
                            </button>
                        )}
                        <button
                            className="btn btn-primary fw-bold shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-center py-2 px-3"
                            onClick={handleNew}
                        >
                            <i className="bi bi-plus-lg fs-5 mb-1 mb-md-0 me-md-2"></i>
                            <span className="small">Nuevo Activo</span>
                        </button>
                    </div>
                </div>

                <div className="card-body p-0 flex-grow-1 overflow-auto">
                    {loading && activos.length === 0 ? (
                        <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
                    ) : (
                        <table className="table table-hover align-middle mb-0" style={{ minWidth: '900px' }}>
                            <thead className="bg-light sticky-top">
                                <tr>
                                    <th className="ps-4">Código</th>
                                    <th>Nombre</th>
                                    <th>Tipo</th>
                                    <th>Ubicación</th>
                                    <th>Centro Costo</th>
                                    <th className="text-end pe-4">Gestión</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activos.map(a => (
                                    <tr key={a.id}>
                                        <td className="ps-4 fw-bold font-monospace text-primary">{a.codigo_interno}</td>
                                        <td>
                                            <div className="fw-bold">{a.nombre}</div>
                                            {a.descripcion && <small className="text-muted d-block text-truncate" style={{ maxWidth: '250px' }}>{a.descripcion}</small>}
                                        </td>
                                        <td><span className="badge bg-info text-dark border">{a.tipo || 'General'}</span></td>
                                        <td>{a.ubicacion}</td>
                                        <td>
                                            {a.centro_costo_nombre ? (
                                                <span className="badge bg-light text-secondary border fw-normal text-dark">
                                                    {a.centro_costo_codigo ? `${a.centro_costo_codigo} - ` : ''}{a.centro_costo_nombre}
                                                </span>
                                            ) : (
                                                <span className="text-muted small fst-italic">Sin asignar</span>
                                            )}
                                        </td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(a)}>
                                                <i className="bi bi-gear me-1"></i> Configurar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {activos.length === 0 && <tr><td colSpan="6" className="text-center p-5 text-muted">No hay activos registrados.</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Activos;