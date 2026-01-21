import { useEffect, useState, useContext } from 'react';
import api from '../api/axiosConfig';
import AuthContext from '../context/AuthContext';
import InsumoModal from '../components/InsumoModal';
import ModalEntrada from '../components/ModalEntrada';
import ModalSalida from '../components/ModalSalida';
import MessageModal from '../components/MessageModal';
import ConfirmModal from '../components/ConfirmModal';
import ModalCargaMasiva from '../components/ModalCargaMasiva';

const getBaseUrl = () => {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}/INSUORDERS/public_html`;
};

const BASE_URL_IMAGENES = getBaseUrl();

const Inventario = () => {
    const { auth } = useContext(AuthContext);
    const [insumos, setInsumos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listas, setListas] = useState({ categorias: [], ubicaciones: [] });
    const [busqueda, setBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroUbicacion, setFiltroUbicacion] = useState('');
    const [orden, setOrden] = useState('');
    const [showInsumoModal, setShowInsumoModal] = useState(false);
    const [insumoEditar, setInsumoEditar] = useState(null);
    const [entradaModal, setEntradaModal] = useState({ show: false, insumo: null });
    const [salidaModal, setSalidaModal] = useState({ show: false, insumo: null });
    const [showImport, setShowImport] = useState(false);
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });
    const [confirm, setConfirm] = useState({ show: false, id: null, titulo: '', mensaje: '' });

    const can = (permiso) => {
        if (auth.rol === 'Admin' || auth.rol === 1) return true;
        return auth.permisos && auth.permisos.includes(permiso);
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async (silent = false) => {
        if (!silent) setLoading(true);

        try {
            const [resInsumos, resAux] = await Promise.all([
                api.get('/index.php/inventario'),
                api.get('/index.php/inventario/auxiliares')
            ]);

            if (resInsumos.data.success) setInsumos(resInsumos.data.data);
            if (resAux.data.success) setListas(resAux.data.data);

        } catch (error) {
            console.error(error);
            setMsg({ show: true, title: "Error", text: "Error cargando datos.", type: "error" });
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleSaveSilent = () => {
        cargarDatos(true);
    };

    const handleCreate = () => { setInsumoEditar(null); setShowInsumoModal(true); };
    const handleEdit = (item) => { setInsumoEditar(item); setShowInsumoModal(true); };

    const handleDeleteClick = (item) => {
        setConfirm({
            show: true,
            id: item.id,
            titulo: 'Eliminar Insumo',
            mensaje: `¿Estás seguro de eliminar "${item.nombre}"? Esta acción no se puede deshacer.`
        });
    };

    const handleConfirmDelete = async () => {
        if (!confirm.id) return;

        try {
            await api.delete(`/index.php/inventario?id=${confirm.id}`);
            handleSaveSilent();
            setMsg({ show: true, title: "Eliminado", text: "Artículo eliminado.", type: "success" });
        } catch (error) {
            setMsg({ show: true, title: "Error", text: "No se pudo eliminar el artículo.", type: "error" });
        } finally {
            setConfirm({ ...confirm, show: false, id: null });
        }
    };

    const handleExportar = () => {
        setLoading(true);
        api.get('/index.php/exportar?modulo=inventario', { responseType: 'blob' })
            .then((res) => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Inventario_${new Date().toISOString().slice(0, 10)}.xlsx`);
                document.body.appendChild(link);
                link.click();
            })
            .catch(() => setMsg({ show: true, title: "Error", text: "Error al exportar", type: "error" }))
            .finally(() => setLoading(false));
    };

    // --- LÓGICA DE ORDENAMIENTO ---

    const toggleSku = () => {
        if (orden === 'sku_asc') setOrden('sku_desc');
        else setOrden('sku_asc');
    };

    const toggleStock = () => {
        if (orden === 'stock_asc') setOrden('stock_desc');
        else setOrden('stock_asc');
    };

    const insumosFiltrados = insumos.filter(i => {
        const matchTexto =
            i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            i.codigo_sku.toLowerCase().includes(busqueda.toLowerCase());
        const matchCat = !filtroCategoria || (i.categoria_id && i.categoria_id.toString() === filtroCategoria);

        let matchUbi = true;
        if (filtroUbicacion) {
            const ubiObj = listas.ubicaciones.find(u => u.id.toString() === filtroUbicacion);
            if (ubiObj) {
                const nombreUbi = ubiObj.nombre.toLowerCase();
                const stringUbicaciones = (i.ubicaciones_multiples || i.ubicacion_defecto || '').toLowerCase();
                matchUbi = stringUbicaciones.includes(nombreUbi);
            }
        }
        return matchTexto && matchCat && matchUbi;
    }).sort((a, b) => {
        if (orden === 'stock_asc') return parseFloat(a.stock_actual) - parseFloat(b.stock_actual);
        if (orden === 'stock_desc') return parseFloat(b.stock_actual) - parseFloat(a.stock_actual);
        if (orden === 'sku_asc') return a.codigo_sku.localeCompare(b.codigo_sku);
        if (orden === 'sku_desc') return b.codigo_sku.localeCompare(a.codigo_sku);
        return 0;
    });

    const renderUbicaciones = (item) => {
        if (item.ubicaciones_multiples) {
            const locs = item.ubicaciones_multiples.split('||');
            return (
                <div className="d-flex flex-column gap-1">
                    {locs.map((loc, idx) => (
                        <span key={idx} className="badge bg-light text-dark border text-start fw-normal" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                            {loc}
                        </span>
                    ))}
                </div>
            );
        }
        if (item.ubicacion_defecto) {
            return (
                <span className="badge bg-light text-dark border text-start fw-normal" style={{ fontSize: '0.75rem' }}>
                    <i className="bi bi-geo-alt me-1 text-primary"></i>
                    {item.ubicacion_defecto}
                </span>
            );
        }
        return <span className="text-muted small fst-italic">Sin ubicación asignada</span>;
    };

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">

            {/* MODALES GLOBALES */}
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />

            <ConfirmModal
                show={confirm.show}
                onClose={() => setConfirm({ ...confirm, show: false })}
                onConfirm={handleConfirmDelete}
                title={confirm.titulo}
                message={confirm.mensaje}
            />

            <ModalCargaMasiva
                show={showImport}
                onClose={() => setShowImport(false)}
                tipo="insumos"
                onSave={handleSaveSilent}
            />

            <InsumoModal
                show={showInsumoModal}
                onClose={() => setShowInsumoModal(false)}
                onSave={handleSaveSilent}
                insumo={insumoEditar}
            />

            <ModalEntrada show={entradaModal.show} insumo={entradaModal.insumo} onClose={() => setEntradaModal({ show: false, insumo: null })} onSave={handleSaveSilent} />
            <ModalSalida show={salidaModal.show} insumo={salidaModal.insumo} onClose={() => setSalidaModal({ show: false, insumo: null })} onSave={handleSaveSilent} />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 flex-shrink-0">

                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary d-none d-sm-block">
                            <i className="bi bi-boxes fs-3"></i>
                        </div>
                        <h4 className="mb-0 fw-bold text-dark">Inventario Maestro</h4>
                    </div>

                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                        {can('inv_exportar') && (
                            <button
                                className="btn btn-outline-success shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-center py-2 px-3"
                                onClick={handleExportar}
                                disabled={loading}
                                title="Exportar a Excel"
                            >
                                <i className="bi bi-file-earmark-excel fs-5 mb-1 mb-md-0 me-md-2"></i>
                                <span className="small fw-bold">Exportar</span>
                            </button>
                        )}

                        {can('inv_importar') && (
                            <button
                                className="btn btn-outline-dark shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-center py-2 px-3"
                                onClick={() => setShowImport(true)}
                                title="Importar Masivamente"
                            >
                                <i className="bi bi-file-earmark-arrow-up fs-5 mb-1 mb-md-0 me-md-2"></i>
                                <span className="small fw-bold">Importar</span>
                            </button>
                        )}

                        {can('inv_crear') && (
                            <button
                                className="btn btn-primary shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-center py-2 px-3"
                                onClick={handleCreate}
                            >
                                <i className="bi bi-plus-lg fs-5 mb-1 mb-md-0 me-md-2"></i>
                                <span className="small fw-bold">Nuevo Artículo</span>
                            </button>
                        )}
                    </div>
                </div>
                <div className="p-3 bg-light border-bottom">
                    <div className="row g-2">
                        <div className="col-md-3">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">🔎</span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Buscar SKU o nombre..."
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
                                <option value="">Todas las Categorías</option>
                                {listas.categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={filtroUbicacion} onChange={e => setFiltroUbicacion(e.target.value)}>
                                <option value="">Todas las Ubicaciones</option>
                                {listas.ubicaciones.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.sector_nombre ? `${u.sector_nombre} - ` : ''}{u.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3 d-flex gap-1">
                            <button
                                className={`btn w-50 ${orden.includes('sku') ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={toggleSku}
                                title="Ordenar por Código SKU"
                            >
                                {orden === 'sku_asc' ? <i className="bi bi-sort-alpha-down me-1"></i> :
                                    orden === 'sku_desc' ? <i className="bi bi-sort-alpha-down-alt me-1"></i> :
                                        <i className="bi bi-filter me-1"></i>}
                                SKU
                            </button>
                            <button
                                className={`btn w-50 ${orden.includes('stock') ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={toggleStock}
                                title="Ordenar por Cantidad de Stock"
                            >
                                {orden === 'stock_asc' ? <i className="bi bi-sort-numeric-down me-1"></i> :
                                    orden === 'stock_desc' ? <i className="bi bi-sort-numeric-down-alt me-1"></i> :
                                        <i className="bi bi-bar-chart me-1"></i>}
                                Stock
                            </button>
                        </div>
                    </div>
                    <div className="mt-2 text-end small text-muted">
                        Mostrando {insumosFiltrados.length} de {insumos.length} registros
                    </div>
                </div>

                <div className="card-body d-flex flex-column p-0" style={{ overflow: 'hidden' }}>
                    <div className="flex-grow-1 overflow-auto">
                        {loading ? <div className="text-center p-5">Cargando...</div> : (
                            <table className="table table-hover align-middle mb-0" style={{ minWidth: '1000px' }}>
                                <thead className="bg-light sticky-top" style={{ zIndex: 1 }}>
                                    <tr>
                                        <th>Imagen</th>
                                        <th className="ps-4">SKU</th>
                                        <th>Descripción</th>
                                        <th>Categoría</th>
                                        <th>Ubicaciones Físicas</th>
                                        <th className="text-center">Stock Total</th>
                                        <th className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {insumosFiltrados.map(item => (
                                        <tr key={item.id}>
                                            <td style={{ width: '80px', textAlign: 'center' }}>
                                                {item.imagen_url ? (
                                                    <img
                                                        src={`${BASE_URL_IMAGENES}${item.imagen_url}`}
                                                        alt="Prod"
                                                        style={{
                                                            width: '50px',
                                                            height: '50px',
                                                            objectFit: 'cover',
                                                            borderRadius: '4px',
                                                            border: '1px solid #ddd',
                                                            cursor: 'pointer'
                                                        }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/50?text=Error';
                                                        }}
                                                        onClick={() => window.open(`${BASE_URL_IMAGENES}${item.imagen_url}`, '_blank')}
                                                    />
                                                ) : (
                                                    <span className="text-muted small">Sin img</span>
                                                )}
                                            </td>
                                            <td className="ps-4 fw-bold text-secondary font-monospace">{item.codigo_sku}</td>
                                            <td>
                                                <div className="fw-medium text-dark">{item.nombre}</div>
                                                {parseFloat(item.stock_minimo) > 0 && parseFloat(item.stock_actual) <= parseFloat(item.stock_minimo) && (
                                                    <span className="badge bg-warning text-dark mt-1">
                                                        <i className="bi bi-exclamation-triangle me-1"></i>Bajo Stock
                                                    </span>
                                                )}
                                            </td>
                                            <td><span className="badge bg-light text-secondary border">{item.categoria_nombre}</span></td>
                                            <td>{renderUbicaciones(item)}</td>
                                            <td className="text-center">
                                                <span className={`fw-bold fs-5 ${parseFloat(item.stock_actual) <= 0 ? 'text-danger' : 'text-success'}`}>
                                                    {parseFloat(item.stock_actual)}
                                                </span>
                                                <small className="text-muted ms-1">{item.unidad_medida}</small>
                                            </td>
                                            <td className="text-end pe-4">
                                                {can('ajustar_stock') && (
                                                    <div className="btn-group me-2" role="group">
                                                        <button className="btn btn-sm btn-outline-success" onClick={() => setEntradaModal({ show: true, insumo: item })} title="Entrada Manual"><i className="bi bi-plus-lg"></i></button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => setSalidaModal({ show: true, insumo: item })} title="Salida Manual"><i className="bi bi-dash-lg"></i></button>
                                                    </div>
                                                )}

                                                <span className="mx-1 text-muted">|</span>

                                                {can('inv_editar') && (
                                                    <button className="btn btn-sm btn-link text-secondary" onClick={() => handleEdit(item)} title="Editar">
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                )}

                                                {can('inv_eliminar') && (
                                                    <button className="btn btn-sm btn-link text-danger" onClick={() => handleDeleteClick(item)} title="Eliminar">
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {insumosFiltrados.length === 0 && (
                                        <tr><td colSpan="7" className="text-center py-5 text-muted">No se encontraron artículos con los filtros actuales.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inventario;