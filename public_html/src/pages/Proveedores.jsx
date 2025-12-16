import { useEffect, useState, useContext } from 'react';
import api from '../api/axiosConfig';
import AuthContext from '../context/AuthContext';
import ProveedorModal from '../components/ProveedorModal';
import ModalCargaMasiva from '../components/ModalCargaMasiva';
import MessageModal from '../components/MessageModal';
import ConfirmModal from '../components/ConfirmModal';

const Proveedores = () => {
    const { auth } = useContext(AuthContext);
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroPais, setFiltroPais] = useState('');
    const [filtroRegion, setFiltroRegion] = useState('');
    const [filtroComuna, setFiltroComuna] = useState('');
    const [filtroTipoVenta, setFiltroTipoVenta] = useState('');

    // Listas auxiliares
    const [listas, setListas] = useState({ 
        tipos_venta: [], paises: [], regiones: [], comunas: [] 
    });

    // Estados para modales
    const [showModal, setShowModal] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [proveedorEditar, setProveedorEditar] = useState(null);

    // Estados para mensajes y confirmación
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });
    const [confirm, setConfirm] = useState({ show: false, id: null, titulo: '', mensaje: '' });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [resProv, resAux] = await Promise.all([
                api.get('/index.php/proveedores'),
                api.get('/index.php/proveedores/auxiliares')
            ]);

            if (resProv.data.success) setProveedores(resProv.data.data);
            if (resAux.data.success) setListas(resAux.data.data);

        } catch (error) {
            console.error("Error cargando datos", error);
            setMsg({ show: true, title: "Error", text: "No se pudieron cargar los proveedores.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // --- REEMPLAZO DE ALERT Y CONFIRM ---
    
    const handleDeleteClick = (id) => {
        setConfirm({
            show: true,
            id: id,
            titulo: 'Eliminar Proveedor',
            mensaje: '¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer.'
        });
    };

    const handleConfirmDelete = async () => {
        if (!confirm.id) return;

        try {
            await api.delete(`/index.php/proveedores?id=${confirm.id}`);
            cargarDatos();
            setMsg({ show: true, title: "Eliminado", text: "Proveedor eliminado correctamente.", type: "success" });
        } catch (error) {
            const errorMsg = error.response?.data?.message || "No se pudo eliminar el proveedor.";
            setMsg({ show: true, title: "Error", text: errorMsg, type: "error" });
        } finally {
            setConfirm({ ...confirm, show: false, id: null });
        }
    };

    const handleEdit = (proveedor) => {
        setProveedorEditar(proveedor);
        setShowModal(true);
    };

    const handleNew = () => {
        setProveedorEditar(null);
        setShowModal(true);
    };

    const handleExportar = () => {
        setLoading(true);
        api.get('/index.php/exportar?modulo=proveedores', { responseType: 'blob' })
            .then((res) => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Proveedores_${new Date().toISOString().slice(0,10)}.xlsx`);
                document.body.appendChild(link);
                link.click();
            })
            .catch(() => setMsg({ show: true, title: "Error", text: "Error al exportar los datos.", type: "error" }))
            .finally(() => setLoading(false));
    };

    const limpiarFiltros = () => {
        setBusqueda('');
        setFiltroPais('');
        setFiltroRegion('');
        setFiltroComuna('');
        setFiltroTipoVenta('');
    };

    // --- FILTRADO ---
    const proveedoresFiltrados = proveedores.filter(p => {
        const matchTexto = !busqueda || 
            (p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
            (p.rut && p.rut.toLowerCase().includes(busqueda.toLowerCase()));

        const matchPais = !filtroPais || (p.pais_id && p.pais_id.toString() === filtroPais);
        const matchRegion = !filtroRegion || (p.region_id && p.region_id.toString() === filtroRegion);
        const matchComuna = !filtroComuna || (p.comuna_id && p.comuna_id.toString() === filtroComuna);
        const matchTipo = !filtroTipoVenta || (p.tipo_venta_id && p.tipo_venta_id.toString() === filtroTipoVenta);

        return matchTexto && matchPais && matchRegion && matchComuna && matchTipo;
    });

    const regionesDisponibles = filtroPais 
        ? listas.regiones.filter(r => r.pais_id.toString() === filtroPais) 
        : listas.regiones;

    const comunasDisponibles = filtroRegion
        ? listas.comunas.filter(c => c.region_id.toString() === filtroRegion)
        : listas.comunas;

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            
            <MessageModal 
                show={msg.show} 
                onClose={() => setMsg({ ...msg, show: false })} 
                title={msg.title} 
                message={msg.text} 
                type={msg.type} 
            />
            
            <ConfirmModal 
                show={confirm.show}
                onClose={() => setConfirm({ ...confirm, show: false })}
                onConfirm={handleConfirmDelete}
                title={confirm.titulo}
                message={confirm.mensaje}
            />

            <ProveedorModal 
                show={showModal} 
                onClose={() => setShowModal(false)}
                proveedorEditar={proveedorEditar}
                onSave={() => {
                    cargarDatos();
                    setMsg({ show: true, title: "Éxito", text: "Datos guardados correctamente.", type: "success" });
                }}
            />
            
            <ModalCargaMasiva 
                show={showImport} 
                onClose={() => setShowImport(false)} 
                onSave={() => {
                    cargarDatos();
                }}
                tipo="proveedores"
            />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-shrink-0">
                    <h4 className="mb-0 text-primary fw-bold">
                        <i className="bi bi-people-fill me-2"></i>Proveedores
                    </h4>
                    <div>
                        <button className="btn btn-outline-success me-2" onClick={handleExportar} disabled={loading}>
                            <i className="bi bi-file-earmark-excel me-2"></i>Exportar
                        </button>
                        {auth.rol === 'Admin' && (
                            <button className="btn btn-outline-dark me-2" onClick={() => setShowImport(true)}>
                                <i className="bi bi-file-earmark-arrow-up me-2"></i>Importar
                            </button>
                        )}
                        <button className="btn btn-primary d-flex align-items-center gap-2 d-inline-flex" onClick={handleNew}>
                            <i className="bi bi-plus-lg"></i>
                            <span className="d-none d-sm-inline">Nuevo</span>
                        </button>
                    </div>
                </div>
                
                {/* --- FILTROS --- */}
                <div className="p-3 border-bottom bg-light">
                    <div className="row g-2">
                        <div className="col-md-3">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-search"></i></span>
                                <input 
                                    type="text" 
                                    className="form-control border-start-0 ps-0" 
                                    placeholder="Buscar empresa, RUT..." 
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-2">
                            <select className="form-select" value={filtroPais} onChange={(e) => { setFiltroPais(e.target.value); setFiltroRegion(''); setFiltroComuna(''); }}>
                                <option value="">País...</option>
                                {listas.paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <select className="form-select" value={filtroRegion} onChange={(e) => setFiltroRegion(e.target.value)}>
                                <option value="">Región...</option>
                                {regionesDisponibles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <select className="form-select" value={filtroComuna} onChange={(e) => setFiltroComuna(e.target.value)} disabled={!filtroRegion && comunasDisponibles.length > 100}>
                                <option value="">Comuna...</option>
                                {comunasDisponibles.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <select className="form-select" value={filtroTipoVenta} onChange={(e) => setFiltroTipoVenta(e.target.value)}>
                                <option value="">Condición...</option>
                                {listas.tipos_venta.map(t => <option key={t.id} value={t.id}>{t.descripcion}</option>)}
                            </select>
                        </div>

                        <div className="col-md-1 d-grid">
                            {(busqueda || filtroPais || filtroRegion || filtroComuna || filtroTipoVenta) && (
                                <button className="btn btn-outline-secondary" onClick={limpiarFiltros} title="Limpiar Filtros">
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="mt-2 text-muted small text-end">
                        Mostrando {proveedoresFiltrados.length} de {proveedores.length} registros
                    </div>
                </div>

                <div className="flex-grow-1 overflow-auto">
                    {loading ? (
                        <div className="d-flex flex-column justify-content-center align-items-center h-100">
                            <div className="spinner-border text-primary mb-2" role="status"></div>
                            <span className="text-muted">Cargando proveedores...</span>
                        </div>
                    ) : (
                        <table className="table table-hover align-middle mb-0" style={{ minWidth: '1000px' }}>
                            <thead className="bg-light sticky-top" style={{ zIndex: 1 }}>
                                <tr>
                                    <th className="ps-4 py-3">RUT</th>
                                    <th className="py-3">Razón Social</th>
                                    <th className="py-3">Contacto</th>
                                    <th className="py-3">Ubicación</th>
                                    <th className="py-3">Condición Venta</th>
                                    <th className="text-end pe-4 py-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proveedoresFiltrados.map((p) => (
                                    <tr key={p.id}>
                                        <td className="ps-4 font-monospace fw-bold">{p.rut}</td>
                                        <td>
                                            <div className="fw-bold text-primary">{p.nombre}</div>
                                            <div className="small text-muted">{p.email}</div>
                                        </td>
                                        <td>
                                            <div className="text-truncate" style={{maxWidth: '150px'}} title={p.contacto_vendedor}>
                                                {p.contacto_vendedor || <span className="text-muted fst-italic">--</span>}
                                            </div>
                                            <div className="small text-muted">{p.telefono}</div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <div className="text-truncate" style={{maxWidth: '200px'}} title={p.direccion}>
                                                    {p.direccion}
                                                </div>
                                                <small className="text-muted">
                                                    {p.comuna_nombre ? `${p.comuna_nombre}, ${p.region_nombre}` : 'Sin dirección'}
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill ${
                                                p.tipo_venta_nombre === 'Contado' || p.tipo_venta_nombre === 'Efectivo' 
                                                ? 'bg-success' 
                                                : p.tipo_venta_nombre === 'Crédito' ? 'bg-primary' : 'bg-secondary'
                                            }`}>
                                                {p.tipo_venta_nombre || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-link text-secondary" onClick={() => handleEdit(p)} title="Editar">
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-sm btn-link text-danger" onClick={() => handleDeleteClick(p.id)} title="Eliminar">
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {proveedoresFiltrados.length === 0 && (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">No se encontraron proveedores con los filtros seleccionados</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Proveedores;