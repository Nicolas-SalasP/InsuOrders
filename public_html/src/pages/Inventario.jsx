import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import InsumoModal from '../components/InsumoModal';
import ModalEntrada from '../components/ModalEntrada';
import ModalSalida from '../components/ModalSalida';
import MessageModal from '../components/MessageModal';

const Inventario = () => {
    const [insumos, setInsumos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Listas para filtros
    const [listas, setListas] = useState({ categorias: [], ubicaciones: [] });

    // Estados de Filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroUbicacion, setFiltroUbicacion] = useState(''); // ID de ubicación
    const [ordenStock, setOrdenStock] = useState(''); // '' | 'asc' | 'desc'

    // Modales
    const [showInsumoModal, setShowInsumoModal] = useState(false);
    const [insumoEditar, setInsumoEditar] = useState(null);
    const [entradaModal, setEntradaModal] = useState({ show: false, insumo: null });
    const [salidaModal, setSalidaModal] = useState({ show: false, insumo: null });
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            // Cargar Insumos y Auxiliares en paralelo para los filtros
            const [resInsumos, resAux] = await Promise.all([
                api.get('/index.php/inventario'),
                api.get('/index.php/inventario/auxiliares')
            ]);

            if (resInsumos.data.success) setInsumos(resInsumos.data.data);
            if (resAux.data.success) setListas(resAux.data.data);

        } catch (error) {
            setMsg({ show: true, title: "Error", text: "Error cargando datos.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => { setInsumoEditar(null); setShowInsumoModal(true); };
    const handleEdit = (item) => { setInsumoEditar(item); setShowInsumoModal(true); };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar artículo?')) {
            try {
                await api.delete(`/index.php/inventario?id=${id}`);
                cargarDatos(); // Recargar para actualizar lista
                setMsg({ show: true, title: "Eliminado", text: "Artículo eliminado.", type: "success" });
            } catch (error) {
                setMsg({ show: true, title: "Error", text: "No se pudo eliminar.", type: "error" });
            }
        }
    };

    const handleExportar = () => {
        setLoading(true);
        api.get('/index.php/exportar?modulo=inventario', { responseType: 'blob' })
            .then((res) => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Inventario_${new Date().toISOString().slice(0,10)}.xlsx`);
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

    // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
    const insumosFiltrados = insumos.filter(i => {
        // 1. Texto (SKU o Nombre)
        const matchTexto = 
            i.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
            i.codigo_sku.toLowerCase().includes(busqueda.toLowerCase());
        
        // 2. Categoría
        const matchCat = !filtroCategoria || (i.categoria_id && i.categoria_id.toString() === filtroCategoria);

        // 3. Ubicación (Busca dentro del string "ubicaciones_multiples" o "ubicacion_nombre")
        // Nota: Esto es una búsqueda aproximada de texto porque el backend devuelve un string concatenado.
        // Para ser exactos por ID necesitaríamos una relación en el frontend, pero por texto funciona bien visualmente.
        let matchUbi = true;
        if (filtroUbicacion) {
            // Buscamos el nombre de la ubicación seleccionada en la lista auxiliar
            const ubiObj = listas.ubicaciones.find(u => u.id.toString() === filtroUbicacion);
            if (ubiObj) {
                const nombreUbi = ubiObj.nombre.toLowerCase();
                const stringUbicaciones = (i.ubicaciones_multiples || i.ubicacion_nombre || '').toLowerCase();
                matchUbi = stringUbicaciones.includes(nombreUbi);
            }
        }

        return matchTexto && matchCat && matchUbi;
    }).sort((a, b) => {
        // Lógica de Ordenamiento
        if (ordenStock === 'asc') return parseFloat(a.stock_actual) - parseFloat(b.stock_actual);
        if (ordenStock === 'desc') return parseFloat(b.stock_actual) - parseFloat(a.stock_actual);
        return 0; // Orden original (por nombre)
    });

    // Helper para renderizar ubicaciones múltiples
    const renderUbicaciones = (item) => {
        if (item.ubicaciones_multiples) {
            // Viene como "Sector A - Estante 1 (50)||Sector B - Piso (20)"
            const locs = item.ubicaciones_multiples.split('||');
            return (
                <div className="d-flex flex-column gap-1">
                    {locs.map((loc, idx) => (
                        <span key={idx} className="badge bg-light text-dark border text-start fw-normal" style={{fontSize: '0.75rem'}}>
                            <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                            {loc}
                        </span>
                    ))}
                </div>
            );
        }
        // Fallback para legacy (sin ubicación asignada en tabla nueva)
        return <span className="text-muted small fst-italic">Sin ubicación asignada</span>;
    };

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />
            
            {/* Modal Editar recibe el insumo seleccionado */}
            <InsumoModal show={showInsumoModal} onClose={() => setShowInsumoModal(false)} onSave={cargarDatos} insumo={insumoEditar} />
            
            <ModalEntrada show={entradaModal.show} insumo={entradaModal.insumo} onClose={() => setEntradaModal({ show: false, insumo: null })} onSave={cargarDatos} />
            <ModalSalida show={salidaModal.show} insumo={salidaModal.insumo} onClose={() => setSalidaModal({ show: false, insumo: null })} onSave={cargarDatos} />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-shrink-0">
                    <h4 className="mb-0 fw-bold text-dark"><i className="bi bi-boxes me-2"></i>Inventario Maestro</h4>
                    <div>
                        <button className="btn btn-outline-success me-2" onClick={handleExportar} disabled={loading}>
                            <i className="bi bi-file-earmark-excel me-2"></i>Exportar
                        </button>
                        <button className="btn btn-primary" onClick={handleCreate}>
                            <i className="bi bi-plus-lg me-2"></i>Nuevo Artículo
                        </button>
                    </div>
                </div>

                {/* --- BARRA DE FILTROS --- */}
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
                        
                        {/* Filtro Categoría */}
                        <div className="col-md-3">
                            <select className="form-select" value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
                                <option value="">Todas las Categorías</option>
                                {listas.categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>

                        {/* Filtro Ubicación */}
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

                        {/* Botón Ordenar Stock */}
                        <div className="col-md-3 d-flex gap-2">
                            <button 
                                className={`btn w-100 ${ordenStock ? 'btn-primary' : 'btn-outline-secondary'}`} 
                                onClick={toggleOrdenStock}
                            >
                                <i className={`bi bi-sort-${ordenStock === 'asc' ? 'numeric-down' : 'numeric-up-alt'} me-2`}></i>
                                {ordenStock === 'asc' ? 'Menor Stock' : ordenStock === 'desc' ? 'Mayor Stock' : 'Stock (Orden)'}
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
                                            <td className="ps-4 fw-bold text-secondary font-monospace">{item.codigo_sku}</td>
                                            <td>
                                                <div className="fw-medium text-dark">{item.nombre}</div>
                                                {parseFloat(item.stock_actual) <= parseFloat(item.stock_minimo) && (
                                                    <span className="badge bg-warning text-dark mt-1">
                                                        <i className="bi bi-exclamation-triangle me-1"></i>Bajo Stock
                                                    </span>
                                                )}
                                            </td>
                                            <td><span className="badge bg-light text-secondary border">{item.categoria_nombre}</span></td>
                                            
                                            {/* Columna Ubicaciones Múltiples */}
                                            <td>
                                                {renderUbicaciones(item)}
                                            </td>

                                            <td className="text-center">
                                                <span className={`fw-bold fs-5 ${parseFloat(item.stock_actual) <= 0 ? 'text-danger' : 'text-success'}`}>
                                                    {parseFloat(item.stock_actual)}
                                                </span>
                                                <small className="text-muted ms-1">{item.unidad_medida}</small>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="btn-group" role="group">
                                                    <button className="btn btn-sm btn-outline-success" onClick={() => setEntradaModal({ show: true, insumo: item })} title="Entrada Manual"><i className="bi bi-plus-lg"></i></button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => setSalidaModal({ show: true, insumo: item })} title="Salida Manual"><i className="bi bi-dash-lg"></i></button>
                                                </div>
                                                <span className="mx-2 text-muted">|</span>
                                                <button className="btn btn-sm btn-link text-secondary" onClick={() => handleEdit(item)} title="Editar"><i className="bi bi-pencil"></i></button>
                                                <button className="btn btn-sm btn-link text-danger" onClick={() => handleDelete(item.id)} title="Eliminar"><i className="bi bi-trash"></i></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {insumosFiltrados.length === 0 && (
                                        <tr><td colSpan="6" className="text-center py-5 text-muted">No se encontraron artículos con los filtros actuales.</td></tr>
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