import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import InsumoModal from '../components/InsumoModal';
import ModalEntrada from '../components/ModalEntrada';
import ModalSalida from '../components/ModalSalida';
import MessageModal from '../components/MessageModal';

const Inventario = () => {
    const [insumos, setInsumos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);

    // Modales
    const [showInsumoModal, setShowInsumoModal] = useState(false);
    const [insumoEditar, setInsumoEditar] = useState(null);
    const [entradaModal, setEntradaModal] = useState({ show: false, insumo: null });
    const [salidaModal, setSalidaModal] = useState({ show: false, insumo: null });

    // Mensajes
    const [msg, setMsg] = useState({ show: false, title: '', text: '', type: 'info' });

    useEffect(() => {
        cargarInventario();
    }, []);

    const cargarInventario = async () => {
        setLoading(true);
        try {
            const res = await api.get('/index.php/inventario');
            if (res.data.success) setInsumos(res.data.data);
        } catch (error) {
            console.error(error);
            setMsg({ show: true, title: "Error", text: "No se pudo cargar el inventario", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setInsumoEditar(null);
        setShowInsumoModal(true);
    };

    const handleEdit = (item) => {
        setInsumoEditar(item);
        setShowInsumoModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este artículo? Se perderá todo el historial asociado.')) {
            try {
                await api.delete(`/index.php/inventario?id=${id}`);
                cargarInventario();
                setMsg({ show: true, title: "Eliminado", text: "Artículo eliminado correctamente.", type: "success" });
            } catch (error) {
                setMsg({ show: true, title: "Error", text: "No se pudo eliminar.", type: "error" });
            }
        }
    };

    const filtrar = insumos.filter(i => 
        i.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        i.codigo_sku.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            {/* Componente de Mensajes */}
            <MessageModal show={msg.show} onClose={() => setMsg({ ...msg, show: false })} title={msg.title} message={msg.text} type={msg.type} />
            
            {/* Modales de Gestión */}
            <InsumoModal 
                show={showInsumoModal} 
                onClose={() => setShowInsumoModal(false)} 
                onSave={cargarInventario} 
                // Nota: Asegúrate que tu InsumoModal esté preparado para recibir esta prop si quieres que se rellene al editar
                // Si no, avísame para actualizar InsumoModal también.
                // insumoEditar={insumoEditar} 
            />
            
            {/* Modales de Movimiento */}
            <ModalEntrada 
                show={entradaModal.show} 
                insumo={entradaModal.insumo} 
                onClose={() => setEntradaModal({ show: false, insumo: null })} 
                onSave={cargarInventario} 
            />
            
            <ModalSalida 
                show={salidaModal.show} 
                insumo={salidaModal.insumo} 
                onClose={() => setSalidaModal({ show: false, insumo: null })} 
                onSave={cargarInventario} 
            />

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-shrink-0">
                    <h4 className="mb-0 fw-bold text-dark"><i className="bi bi-boxes me-2"></i>Inventario Maestro</h4>
                    <button className="btn btn-primary" onClick={handleCreate}>
                        <i className="bi bi-plus-lg me-2"></i>Nuevo Artículo
                    </button>
                </div>

                <div className="card-body d-flex flex-column p-0" style={{ overflow: 'hidden' }}>
                    <div className="p-3 bg-light border-bottom">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">🔎</span>
                            <input 
                                type="text" 
                                className="form-control border-start-0 ps-0" 
                                placeholder="Buscar por código SKU o nombre..." 
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="flex-grow-1 overflow-auto">
                        {loading ? (
                            <div className="text-center p-5">Cargando inventario...</div>
                        ) : (
                            <table className="table table-hover align-middle mb-0" style={{ minWidth: '1000px' }}>
                                <thead className="bg-light sticky-top" style={{ zIndex: 1 }}>
                                    <tr>
                                        <th className="ps-4">SKU</th>
                                        <th>Descripción</th>
                                        <th>Categoría</th>
                                        <th>Ubicación</th>
                                        <th className="text-center">Stock</th>
                                        <th className="text-end pe-4">Acciones (Ajustes)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtrar.map(item => (
                                        <tr key={item.id}>
                                            <td className="ps-4 fw-bold text-secondary font-monospace">{item.codigo_sku}</td>
                                            <td>
                                                <div className="fw-medium text-dark">{item.nombre}</div>
                                                {parseFloat(item.stock_actual) <= parseFloat(item.stock_minimo) && (
                                                    <span className="badge bg-warning text-dark mt-1" style={{ fontSize: '0.7rem' }}>
                                                        <i className="bi bi-exclamation-triangle me-1"></i>Bajo Stock
                                                    </span>
                                                )}
                                            </td>
                                            <td><span className="badge bg-light text-secondary border">{item.categoria_nombre}</span></td>
                                            
                                            {/* COLUMNA UBICACIÓN JERÁRQUICA */}
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className="fw-bold text-dark small">{item.sector_nombre || 'General'}</span>
                                                    <small className="text-muted"><i className="bi bi-geo-alt me-1"></i>{item.ubicacion_nombre}</small>
                                                </div>
                                            </td>
                                            
                                            {/* Columna Stock: Visualización */}
                                            <td className="text-center">
                                                <span className={`fw-bold fs-5 ${parseFloat(item.stock_actual) <= 0 ? 'text-danger' : 'text-success'}`}>
                                                    {parseFloat(item.stock_actual)} 
                                                </span>
                                                <small className="text-muted ms-1">{item.unidad_medida}</small>
                                            </td>

                                            {/* Columna Acciones */}
                                            <td className="text-end pe-4">
                                                <div className="btn-group" role="group">
                                                    <button className="btn btn-sm btn-outline-success" 
                                                        title="Ajuste Positivo / Entrada"
                                                        onClick={() => setEntradaModal({ show: true, insumo: item })}>
                                                        <i className="bi bi-plus-lg"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger" 
                                                        title="Ajuste Negativo / Salida"
                                                        onClick={() => setSalidaModal({ show: true, insumo: item })}>
                                                        <i className="bi bi-dash-lg"></i>
                                                    </button>
                                                </div>
                                                
                                                <span className="mx-2 text-muted">|</span>

                                                <button className="btn btn-sm btn-link text-secondary" 
                                                    onClick={() => handleEdit(item)} title="Editar Datos">
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button className="btn btn-sm btn-link text-danger" 
                                                    onClick={() => handleDelete(item.id)} title="Eliminar">
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtrar.length === 0 && (
                                        <tr><td colSpan="6" className="text-center py-5 text-muted">No se encontraron productos</td></tr>
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