import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import ProveedorModal from '../components/ProveedorModal';

const Proveedores = () => {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroPais, setFiltroPais] = useState('');
    const [filtroRegion, setFiltroRegion] = useState('');
    const [filtroComuna, setFiltroComuna] = useState('');
    const [filtroTipoVenta, setFiltroTipoVenta] = useState('');

    // Listas para los selects de filtro
    const [listas, setListas] = useState({ 
        tipos_venta: [], paises: [], regiones: [], comunas: [] 
    });

    // Estados para el modal
    const [showModal, setShowModal] = useState(false);
    const [proveedorEditar, setProveedorEditar] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            // Cargar Proveedores y Auxiliares en paralelo
            const [resProv, resAux] = await Promise.all([
                api.get('/index.php/proveedores'),
                api.get('/index.php/proveedores/auxiliares')
            ]);

            if (resProv.data.success) setProveedores(resProv.data.data);
            if (resAux.data.success) setListas(resAux.data.data);

        } catch (error) {
            console.error("Error cargando datos", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
            try {
                await api.delete('/index.php/proveedores?id=' + id);
                cargarDatos(); // Recargar todo
            } catch (error) {
                alert("Error al eliminar");
            }
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

    const limpiarFiltros = () => {
        setBusqueda('');
        setFiltroPais('');
        setFiltroRegion('');
        setFiltroComuna('');
        setFiltroTipoVenta('');
    };

    // --- LÓGICA DE FILTRADO AVANZADO ---
    const proveedoresFiltrados = proveedores.filter(p => {
        // 1. Filtro de Texto (Busca en nombre o rut)
        const matchTexto = !busqueda || 
            (p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
            (p.rut && p.rut.toLowerCase().includes(busqueda.toLowerCase()));

        // 2. Filtros Select
        const matchPais = !filtroPais || (p.pais_id && p.pais_id.toString() === filtroPais);
        const matchRegion = !filtroRegion || (p.region_id && p.region_id.toString() === filtroRegion);
        const matchComuna = !filtroComuna || (p.comuna_id && p.comuna_id.toString() === filtroComuna);
        const matchTipo = !filtroTipoVenta || (p.tipo_venta_id && p.tipo_venta_id.toString() === filtroTipoVenta);

        return matchTexto && matchPais && matchRegion && matchComuna && matchTipo;
    });

    // Filtros en Cascada para los Selects (Visual)
    const regionesDisponibles = filtroPais 
        ? listas.regiones.filter(r => r.pais_id.toString() === filtroPais) 
        : listas.regiones;

    const comunasDisponibles = filtroRegion
        ? listas.comunas.filter(c => c.region_id.toString() === filtroRegion)
        : listas.comunas;

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            <ProveedorModal 
                show={showModal} 
                onClose={() => setShowModal(false)}
                proveedorEditar={proveedorEditar}
                onSave={cargarDatos}
            />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-shrink-0">
                    <h4 className="mb-0 text-primary fw-bold">
                        <i className="bi bi-people-fill me-2"></i>Proveedores
                    </h4>
                    <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleNew}>
                        <i className="bi bi-plus-lg"></i>
                        <span className="d-none d-sm-inline">Nuevo</span>
                    </button>
                </div>
                
                {/* --- BARRA DE FILTROS --- */}
                <div className="p-3 border-bottom bg-light">
                    <div className="row g-2">
                        {/* Buscador Texto */}
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

                        {/* Filtro País */}
                        <div className="col-md-2">
                            <select className="form-select" value={filtroPais} onChange={(e) => { setFiltroPais(e.target.value); setFiltroRegion(''); setFiltroComuna(''); }}>
                                <option value="">Todos los Países</option>
                                {listas.paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                        </div>

                        {/* Filtro Región */}
                        <div className="col-md-2">
                            <select className="form-select" value={filtroRegion} onChange={(e) => { setFiltroRegion(e.target.value); setFiltroComuna(''); }} disabled={!filtroPais && regionesDisponibles.length > 50}>
                                <option value="">Todas las Regiones</option>
                                {regionesDisponibles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                            </select>
                        </div>

                        {/* Filtro Comuna */}
                        <div className="col-md-2">
                            <select className="form-select" value={filtroComuna} onChange={(e) => setFiltroComuna(e.target.value)} disabled={!filtroRegion && comunasDisponibles.length > 100}>
                                <option value="">Todas las Comunas</option>
                                {comunasDisponibles.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>

                        {/* Filtro Tipo Venta */}
                        <div className="col-md-2">
                            <select className="form-select" value={filtroTipoVenta} onChange={(e) => setFiltroTipoVenta(e.target.value)}>
                                <option value="">Condición Venta</option>
                                {listas.tipos_venta.map(t => <option key={t.id} value={t.id}>{t.descripcion}</option>)}
                            </select>
                        </div>

                        {/* Botón Limpiar */}
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
                                        <td className="ps-4 fw-bold text-dark font-monospace">{p.rut}</td>
                                        <td>
                                            <div className="fw-semibold text-primary">{p.nombre}</div>
                                            <div className="small text-muted">{p.email || 'Sin email'}</div>
                                        </td>
                                        <td>
                                            <div className="text-truncate" style={{maxWidth: '150px'}} title={p.contacto_vendedor}>
                                                {p.contacto_vendedor || <span className="text-muted fst-italic">--</span>}
                                            </div>
                                            <div className="small text-secondary">{p.telefono}</div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <div className="text-truncate" style={{maxWidth: '200px'}} title={p.direccion}>
                                                    {p.direccion}
                                                </div>
                                                <small className="text-muted">
                                                    {p.comuna_nombre ? p.comuna_nombre : '---'}, {p.pais_nombre}
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
                                            <button className="btn btn-sm btn-outline-secondary me-2" 
                                                onClick={() => handleEdit(p)} title="Editar">
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" 
                                                onClick={() => handleDelete(p.id)} title="Eliminar">
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