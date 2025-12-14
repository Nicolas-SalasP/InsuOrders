import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import InsumoModal from '../components/InsumoModal';
import ModalEntrada from '../components/ModalEntrada';
import ModalSalida from '../components/ModalSalida';
import MessageModal from '../components/MessageModal';
import ConfirmModal from '../components/ConfirmModal';

const BASE_URL_IMAGENES = 'http://localhost/INSUORDERS/public_html';

const Inventario = () => {
    const [insumos, setInsumos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listas, setListas] = useState({ categorias: [], ubicaciones: [] });

    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroUbicacion, setFiltroUbicacion] = useState('');
    const [ordenStock, setOrdenStock] = useState('');

    // Modales
    const [showInsumoModal, setShowInsumoModal] = useState(false);
    const [insumoEditar, setInsumoEditar] = useState(null);
    const [entradaModal, setEntradaModal] = useState({ show: false, insumo: null });
    const [salidaModal, setSalidaModal] = useState({ show: false, insumo: null });
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

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
            setMsg({ show: true, title: "Error", text: "Error cargando datos.", type: "error" });
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleSaveSilent = () => cargarDatos(true);
    const handleCreate = () => { setInsumoEditar(null); setShowInsumoModal(true); };
    const handleEdit = (item) => { setInsumoEditar(item); setShowInsumoModal(true); };

    const handleDeleteClick = (id) => setConfirmDelete({ show: true, id });

    const executeDelete = async () => {
        const id = confirmDelete.id;
        setConfirmDelete({ show: false, id: null });
        try {
            await api.delete(`/index.php/inventario?id=${id}`);
            handleSaveSilent();
            setMsg({ show: true, title: "Eliminado", text: "Artículo eliminado.", type: "success" });
        } catch (error) {
            const errorMsg = error.response?.data?.message || "No se pudo eliminar.";
            setMsg({ show: true, title: "No permitido", text: errorMsg, type: "error" });
        }
    };

    const handleExportar = () => {
        setLoading(true);
        api.get('/index.php/exportar?modulo=inventario', { responseType: 'blob' })
            .then((res) => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Inventario.xlsx`);
                document.body.appendChild(link);
                link.click();
            })
            .catch(() => setMsg({ show: true, title: "Error", text: "Error al exportar", type: "error" }))
            .finally(() => setLoading(false));
    };

    const toggleOrdenStock = () => {
        if (ordenStock === '') setOrdenStock('asc');
        else if (ordenStock === 'asc') setOrdenStock('desc');
        else setOrdenStock('');
    };

    const insumosFiltrados = insumos.filter(i => {
        const matchTexto = i.nombre.toLowerCase().includes(busqueda.toLowerCase()) || i.codigo_sku.toLowerCase().includes(busqueda.toLowerCase());
        const matchCat = !filtroCategoria || (i.categoria_id && i.categoria_id.toString() === filtroCategoria);
        let matchUbi = true;
        if (filtroUbicacion) {
            const ubiObj = listas.ubicaciones.find(u => u.id.toString() === filtroUbicacion);
            if (ubiObj) {
                const nombreUbi = ubiObj.nombre.toLowerCase();
                const stringUbicaciones = (i.ubicaciones_multiples || i.ubicacion_nombre || '').toLowerCase();
                matchUbi = stringUbicaciones.includes(nombreUbi);
            }
        }
        return matchTexto && matchCat && matchUbi;
    }).sort((a, b) => {
        if (ordenStock === 'asc') return parseFloat(a.stock_actual) - parseFloat(b.stock_actual);
        if (ordenStock === 'desc') return parseFloat(b.stock_actual) - parseFloat(a.stock_actual);
        return 0;
    });

    const renderUbicaciones = (item) => {
        if (item.ubicaciones_multiples) {
            const locs = item.ubicaciones_multiples.split('||');
            return (
                <div className="d-flex flex-column gap-1">
                    {locs.map((loc, idx) => (
                        <span key={idx} className="badge bg-light text-dark border text-start fw-normal" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-geo-alt-fill text-danger me-1"></i>{loc}
                        </span>
                    ))}
                </div>
            );
        }
        return <span className="text-muted small fst-italic">Sin ubicación asignada</span>;
    };

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />
            <InsumoModal show={showInsumoModal} onClose={() => setShowInsumoModal(false)} onSave={handleSaveSilent} insumo={insumoEditar} />
            <ModalEntrada show={entradaModal.show} insumo={entradaModal.insumo} onClose={() => setEntradaModal({ show: false, insumo: null })} onSave={handleSaveSilent} />
            <ModalSalida show={salidaModal.show} insumo={salidaModal.insumo} onClose={() => setSalidaModal({ show: false, insumo: null })} onSave={handleSaveSilent} />
            
            <ConfirmModal show={confirmDelete.show} onClose={() => setConfirmDelete({ show: false, id: null })} onConfirm={executeDelete} 
                title="Eliminar Artículo" message="¿Estás seguro? Si tiene historial, no se podrá borrar." confirmText="Sí, Eliminar" type="danger" />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-shrink-0">
                    <h4 className="mb-0 fw-bold text-dark"><i className="bi bi-boxes me-2"></i>Inventario Maestro</h4>
                    <div>
                        <button className="btn btn-outline-success me-2" onClick={handleExportar} disabled={loading}><i className="bi bi-file-earmark-excel me-2"></i>Exportar</button>
                        <button className="btn btn-primary" onClick={handleCreate}><i className="bi bi-plus-lg me-2"></i>Nuevo Artículo</button>
                    </div>
                </div>

                <div className="p-3 bg-light border-bottom">
                    <div className="row g-2">
                        <div className="col-md-3">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">🔎</span>
                                <input type="text" className="form-control border-start-0 ps-0" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
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
                                    <option key={u.id} value={u.id}>{u.sector_nombre ? `${u.sector_nombre} - ` : ''}{u.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3 d-flex gap-2">
                            <button className={`btn w-100 ${ordenStock ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={toggleOrdenStock}>
                                <i className={`bi bi-sort-${ordenStock === 'asc' ? 'numeric-down' : 'numeric-up-alt'} me-2`}></i>
                                {ordenStock === 'asc' ? 'Menor Stock' : ordenStock === 'desc' ? 'Mayor Stock' : 'Stock'}
                            </button>
                        </div>
                    </div>
                    <div className="mt-2 text-end small text-muted">Mostrando {insumosFiltrados.length} registros</div>
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
                                                    <img src={`${BASE_URL_IMAGENES}${item.imagen_url}`} alt="Prod" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer' }} 
                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/50?text=Error'; }}
                                                        onClick={() => window.open(`${BASE_URL_IMAGENES}${item.imagen_url}`, '_blank')} />
                                                ) : <span className="text-muted small">Sin img</span>}
                                            </td>
                                            <td className="ps-4 fw-bold text-secondary font-monospace">{item.codigo_sku}</td>
                                            <td>
                                                <div className="fw-medium text-dark">{item.nombre}</div>
                                                {/* Alerta de Bajo Stock (Normal) */}
                                                {parseFloat(item.stock_actual) <= parseFloat(item.stock_minimo) && (
                                                    <span className="badge bg-warning text-dark mt-1" title={`Mínimo Requerido: ${parseInt(item.stock_minimo)}`}>
                                                        <i className="bi bi-exclamation-triangle me-1"></i>Bajo Stock
                                                    </span>
                                                )}
                                            </td>
                                            <td><span className="badge bg-light text-secondary border">{item.categoria_nombre}</span></td>
                                            <td>{renderUbicaciones(item)}</td>
                                            
                                            {/* STOCK CON SUGERENCIA INTELIGENTE */}
                                            <td className="text-center">
                                                <div className="d-flex flex-column align-items-center">
                                                    <span className={`fw-bold fs-5 ${parseFloat(item.stock_actual) <= parseFloat(item.stock_minimo) ? 'text-danger' : 'text-success'}`}>
                                                        {parseInt(item.stock_actual)}
                                                    </span>
                                                    <small className="text-muted">{item.unidad_medida}</small>

                                                    {/* ALERTA DE COMPRA SUGERIDA (Regla x2) */}
                                                    {parseFloat(item.sugerencia_compra) > 0 && (
                                                        <div className="badge bg-danger bg-opacity-10 text-danger border border-danger mt-1 p-1" 
                                                             title={`Mínimo requerido: ${parseInt(item.stock_minimo)}. Ideal (x2): ${parseInt(item.stock_ideal)}`}>
                                                            <i className="bi bi-cart-plus me-1"></i>
                                                            Comprar +{parseInt(item.sugerencia_compra)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="text-end pe-4">
                                                <div className="btn-group" role="group">
                                                    <button className="btn btn-sm btn-outline-success" onClick={() => setEntradaModal({ show: true, insumo: item })} title="Entrada Manual"><i className="bi bi-plus-lg"></i></button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => setSalidaModal({ show: true, insumo: item })} title="Salida Manual"><i className="bi bi-dash-lg"></i></button>
                                                </div>
                                                <span className="mx-2 text-muted">|</span>
                                                <button className="btn btn-sm btn-link text-secondary" onClick={() => handleEdit(item)} title="Editar"><i className="bi bi-pencil"></i></button>
                                                <button className="btn btn-sm btn-link text-danger" onClick={() => handleDeleteClick(item.id)} title="Eliminar"><i className="bi bi-trash"></i></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {insumosFiltrados.length === 0 && <tr><td colSpan="7" className="text-center py-5 text-muted">No se encontraron artículos.</td></tr>}
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