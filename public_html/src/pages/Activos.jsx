import { useEffect, useState, useContext } from 'react';
import api from '../api/axiosConfig';
import AuthContext from '../context/AuthContext';
import ActivoModal from '../components/ActivoModal';
import ModalCargaMasiva from '../components/ModalCargaMasiva';
import MessageModal from '../components/MessageModal';
import PlantillaBuilderModal from '../components/PlantillaBuilderModal';

const Activos = () => {
    const { auth } = useContext(AuthContext);
    
    // --- ESTADOS DE DATOS ---
    const [activos, setActivos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // --- ESTADOS DE MODALES ---
    const [showModal, setShowModal] = useState(false); // Crear/Editar Activo
    const [showImport, setShowImport] = useState(false); // Carga Masiva
    const [showBuilder, setShowBuilder] = useState(false); // Constructor de Plantillas
    
    // --- ESTADOS DE SELECCIÓN ---
    const [activoSeleccionado, setActivoSeleccionado] = useState(null); 
    const [activoParaPlantilla, setActivoParaPlantilla] = useState(null); 

    // --- MENSAJES DE SISTEMA ---
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });

    const hasPermission = (permiso) => {
        if (auth.rol === 'Admin') return true;
        return auth.permisos && auth.permisos.includes(permiso);
    };

    useEffect(() => { 
        if (hasPermission('activos_ver')) cargarActivos(); 
    }, []);

    const cargarActivos = async () => {
        setLoading(true);
        try {
            const res = await api.get('/index.php/mantencion/activos');
            if (res.data.success) {
                setActivos(res.data.data);
            } else {
                setMsgModal({ show: true, title: "Atención", message: "No se pudieron obtener los datos.", type: "warning" });
            }
        } catch (e) { 
            console.error(e);
            setMsgModal({ show: true, title: "Error", message: "Error de conexión al cargar activos.", type: "error" });
        } finally { 
            setLoading(false); 
        }
    };

    const activosFiltrados = activos.filter(a => 
        (a.nombre && a.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.codigo_interno && a.codigo_interno.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.codigo_maquina && a.codigo_maquina.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // --- MANEJADORES ---

    const handleEdit = (activo) => { 
        setActivoSeleccionado(activo); 
        setShowModal(true); 
    };

    const handleNew = () => { 
        setActivoSeleccionado(null); 
        setShowModal(true); 
    };

    const handlePlantilla = (activo) => {
        setActivoParaPlantilla(activo);
        setShowBuilder(true);
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            const response = await api.get('/index.php/exportar?modulo=activos', { responseType: 'blob' });
            
            // Crear link de descarga invisible
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Activos_${new Date().toISOString().slice(0, 10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setMsgModal({ show: true, title: "Éxito", message: "Archivo exportado correctamente.", type: "success" });

        } catch (error) {
            setMsgModal({ show: true, title: "Error", message: "No se pudo exportar el archivo. Verifique permisos.", type: "error" });
        } finally { 
            setLoading(false); 
        }
    };

    if (!hasPermission('activos_ver')) return <div className="alert alert-danger m-4">No tienes permisos para ver este módulo.</div>;

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            
            {/* --- COMPONENTES MODALES --- */}
            <MessageModal 
                show={msgModal.show} 
                onClose={() => setMsgModal({...msgModal, show: false})} 
                title={msgModal.title} 
                message={msgModal.message} 
                type={msgModal.type} 
            />
            
            {(hasPermission('activos_crear') || hasPermission('activos_editar')) && (
                <ActivoModal show={showModal} onClose={() => setShowModal(false)} activo={activoSeleccionado} onSave={cargarActivos} />
            )}
            
            <ModalCargaMasiva show={showImport} onClose={() => setShowImport(false)} tipo="activos" onSave={cargarActivos} />

            <PlantillaBuilderModal 
                show={showBuilder} 
                onHide={() => setShowBuilder(false)}
                activo={activoParaPlantilla}
                onSuccess={() => {
                    cargarActivos(); // Actualiza la lista para mostrar el icono verde
                }}
            />

            {/* --- INTERFAZ PRINCIPAL --- */}
            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 flex-shrink-0">
                    <div className="d-flex align-items-center mb-2 mb-md-0">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary d-none d-sm-block">
                            <i className="bi bi-truck fs-3"></i>
                        </div>
                        <h4 className="mb-0 fw-bold text-dark">Activos / Máquinas</h4>
                    </div>
                    
                    <div className="d-flex gap-2 justify-content-center justify-content-md-end flex-wrap align-items-center w-100 w-md-auto">
                        <div className="input-group" style={{ maxWidth: '300px' }}>
                            <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                            <input 
                                type="text" 
                                className="form-control border-start-0 ps-0" 
                                placeholder="Buscar equipo..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        {hasPermission('activos_exportar') && (
                            <button className="btn btn-outline-success shadow-sm d-flex align-items-center py-2 px-3" onClick={handleExport} disabled={loading}>
                                <i className="bi bi-file-earmark-excel fs-5"></i>
                            </button>
                        )}
                        {auth.rol === 'Admin' && (
                            <button className="btn btn-outline-dark shadow-sm d-flex align-items-center py-2 px-3" onClick={() => setShowImport(true)}>
                                <i className="bi bi-file-earmark-arrow-up fs-5"></i>
                            </button>
                        )}
                        {hasPermission('activos_crear') && (
                            <button className="btn btn-primary fw-bold shadow-sm d-flex align-items-center py-2 px-3" onClick={handleNew}>
                                <i className="bi bi-plus-lg fs-5 me-2"></i><span className="small">Nuevo</span>
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="card-body p-0 flex-grow-1 overflow-auto">
                    {loading && activos.length === 0 ? (
                        <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
                    ) : (
                        <table className="table table-hover align-middle mb-0" style={{ minWidth: '1200px' }}>
                            <thead className="bg-light sticky-top">
                                <tr>
                                    <th className="ps-4">Equipo / Activo</th>
                                    <th>Cod. Interno</th>
                                    <th>Cod. Máquina</th>
                                    <th>Marca</th>
                                    <th>Modelo</th>
                                    <th>Año</th>
                                    <th>Ubicación</th>
                                    <th>Centro Costo</th>
                                    <th className="text-end pe-4">Gestión</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activosFiltrados.map(a => (
                                    <tr key={a.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="avatar me-3 bg-light rounded d-flex align-items-center justify-content-center flex-shrink-0" style={{width:'40px', height:'40px'}}>
                                                    {a.imagen_url ? 
                                                        <img src={`/api${a.imagen_url}`} className="rounded" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Activo" /> 
                                                        : <i className="bi bi-box-seam text-secondary fs-4"></i>
                                                    }
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{a.nombre}</div>
                                                    <div className="small text-muted">{a.tipo || 'General'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-monospace text-primary fw-bold">{a.codigo_interno}</td>
                                        <td className="font-monospace">{a.codigo_maquina || '-'}</td> 
                                        <td>{a.marca || '-'}</td>
                                        <td className="text-muted">{a.modelo || '-'}</td>
                                        <td>{a.anio || '-'}</td> 
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
                                            {hasPermission('activos_editar') && (
                                                <>
                                                    <button 
                                                        className={`btn btn-sm me-2 ${a.plantilla_json ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                                                        onClick={() => handlePlantilla(a)}
                                                        title="Diseñar Pauta de Mantención (Checklist)"
                                                    >
                                                        <i className="bi bi-clipboard-check"></i>
                                                    </button>

                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(a)} title="Editar Datos del Activo">
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {activosFiltrados.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="text-center p-5 text-muted">
                                            {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay activos registrados.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Activos;