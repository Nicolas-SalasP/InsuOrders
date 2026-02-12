import { useEffect, useState, useContext } from 'react';
import api from '../api/axiosConfig';
import AuthContext from '../context/AuthContext';
import ActivoModal from '../components/ActivoModal';
import ModalCargaMasiva from '../components/ModalCargaMasiva';
import MessageModal from '../components/MessageModal';
import PlantillaBuilderModal from '../components/PlantillaBuilderModal';
import ConfirmModal from '../components/ConfirmModal';

const Activos = () => {
    const { auth } = useContext(AuthContext);
    
    const [activos, setActivos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [showBuilder, setShowBuilder] = useState(false);
    const [confirm, setConfirm] = useState({ show: false, title: '', message: '', action: null, type: 'danger', confirmText: '' });
    
    const [modalImport, setModalImport] = useState({ show: false, tipo: 'activos' });
    
    const [activoSeleccionado, setActivoSeleccionado] = useState(null); 
    const [activoParaPlantilla, setActivoParaPlantilla] = useState(null); 

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

    const abrirImportar = (tipo) => {
        setModalImport({ show: true, tipo });
    };

    const handleEliminar = (id) => {
        setConfirm({
            show: true,
            title: "⚠️ ¿Eliminar Activo?",
            message: "¿Estás seguro de que quieres eliminar este activo? Se borrará su configuración, galería y kit de repuestos.",
            type: "warning",
            confirmText: "Sí, continuar",
            action: () => {
                setTimeout(() => {
                    setConfirm({
                        show: true,
                        title: "🚨 CONFIRMACIÓN FINAL IRREVERSIBLE",
                        message: "¡CUIDADO! Esta acción no se puede deshacer. ¿Estás 100% seguro de eliminar este equipo permanentemente?",
                        type: "danger",
                        confirmText: "SÍ, ELIMINAR AHORA",
                        action: async () => {
                            try {
                                const res = await api.delete(`/index.php/mantencion/activos?id=${id}`);
                                if (res.data.success) {
                                    setMsgModal({ show: true, title: 'Éxito', message: 'Activo eliminado correctamente', type: 'success' });
                                    cargarActivos();
                                }
                            } catch (error) {
                                setMsgModal({ 
                                    show: true, 
                                    title: 'No se pudo eliminar', 
                                    message: error.response?.data?.message || 'El activo tiene historiales asociados.', 
                                    type: 'error' 
                                });
                            }
                        }
                    });
                }, 200);
            }
        });
    };

    const handleConfirmAction = () => {
        if (confirm.action) confirm.action();
        setConfirm({ ...confirm, show: false });
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

            setMsgModal({ show: true, title: "Éxito", message: "Archivo exportado correctamente.", type: "success" });

        } catch (error) {
            setMsgModal({ show: true, title: "Error", message: "No se pudo exportar el archivo.", type: "error" });
        } finally { 
            setLoading(false); 
        }
    };

    if (!hasPermission('activos_ver')) return <div className="alert alert-danger m-4">No tienes permisos para ver este módulo.</div>;

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            
            <MessageModal 
                show={msgModal.show} 
                onClose={() => setMsgModal({...msgModal, show: false})} 
                title={msgModal.title} 
                message={msgModal.message} 
                type={msgModal.type} 
            />

            <ConfirmModal 
                show={confirm.show} 
                onClose={() => setConfirm({ ...confirm, show: false })} 
                onConfirm={handleConfirmAction} 
                title={confirm.title} 
                message={confirm.message} 
                confirmText={confirm.confirmText} 
                type={confirm.type} 
            />
            
            {(hasPermission('activos_crear') || hasPermission('activos_editar')) && (
                <ActivoModal show={showModal} onClose={() => setShowModal(false)} activo={activoSeleccionado} onSave={cargarActivos} />
            )}
            
            <ModalCargaMasiva 
                show={modalImport.show} 
                onClose={() => setModalImport({ ...modalImport, show: false })} 
                tipo={modalImport.tipo} 
                titulo={modalImport.tipo === 'activos' ? 'Importar Máquinas' : 'Importar Kits de Repuestos'}
                onSave={cargarActivos} 
            />

            <PlantillaBuilderModal 
                show={showBuilder} 
                onHide={() => setShowBuilder(false)}
                activo={activoParaPlantilla}
                onSuccess={() => cargarActivos()}
            />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 flex-shrink-0">
                    <div className="d-flex align-items-center mb-2 mb-md-0">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary d-none d-sm-block">
                            <i className="bi bi-truck fs-3"></i>
                        </div>
                        <h4 className="mb-0 fw-bold text-dark">Activos / Máquinas</h4>
                    </div>
                    
                    <div className="d-flex gap-2 justify-content-center justify-content-md-end flex-wrap align-items-center w-100 w-md-auto">
                        
                        <div className="input-group" style={{ maxWidth: '250px' }}>
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
                            <button 
                                className="btn btn-outline-success shadow-sm d-flex align-items-center py-2 px-3" 
                                onClick={handleExport} 
                                disabled={loading}
                                title="Exportar a Excel"
                            >
                                <i className="bi bi-file-earmark-excel fs-5"></i>
                            </button>
                        )}

                        {auth.rol === 'Admin' && (
                            <>
                                <button className="btn btn-outline-secondary shadow-sm d-flex align-items-center py-2 px-3 fw-bold" onClick={() => abrirImportar('activos')} title="Importar Activos">
                                    <i className="bi bi-file-earmark-spreadsheet me-2"></i>Activos
                                </button>
                                <button className="btn btn-outline-secondary shadow-sm d-flex align-items-center py-2 px-3 fw-bold" onClick={() => abrirImportar('kits')} title="Importar Kits">
                                    <i className="bi bi-tools me-2"></i>Kits
                                </button>
                            </>
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

                                                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(a)} title="Editar Datos del Activo">
                                                        <i className="bi bi-pencil"></i>
                                                    </button>

                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminar(a.id)} title="Eliminar Activo">
                                                        <i className="bi bi-trash"></i>
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