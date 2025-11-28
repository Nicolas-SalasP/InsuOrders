import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import InsumoModal from '../components/InsumoModal';
import ModalEntrada from '../components/ModalEntrada'; // <--- IMPORTAR
import ModalSalida from '../components/ModalSalida';   // <--- IMPORTAR

const Inventario = () => {
    const [insumos, setInsumos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    // Estados separados para cada modal
    const [entradaModal, setEntradaModal] = useState({ show: false, insumo: null });
    const [salidaModal, setSalidaModal] = useState({ show: false, insumo: null });

    useEffect(() => { cargarInventario(); }, []);

    const cargarInventario = async () => {
        try {
            const res = await api.get('/index.php/inventario');
            if (res.data.success) setInsumos(res.data.data);
        } catch (error) { console.error(error); }
    };

    const filtrar = insumos.filter(i => 
        i.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        i.codigo_sku.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            {/* Modales */}
            <InsumoModal show={showModal} onClose={() => setShowModal(false)} onSave={cargarInventario} />
            
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
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 fw-bold text-dark"><i className="bi bi-box-seam me-2"></i>Inventario</h4>
                    <button className="btn btn-dark" onClick={() => setShowModal(true)}>
                        <i className="bi bi-plus-lg me-2"></i>Nuevo Artículo
                    </button>
                </div>

                <div className="card-body d-flex flex-column p-0" style={{ overflow: 'hidden' }}>
                    <div className="p-3 bg-light border-bottom">
                        <input type="text" className="form-control" placeholder="🔍 Buscar..." 
                            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                    </div>

                    <div className="flex-grow-1 overflow-auto">
                        <table className="table table-hover align-middle mb-0" style={{ minWidth: '900px' }}>
                            <thead className="bg-light sticky-top" style={{ zIndex: 1 }}>
                                <tr>
                                    <th className="ps-4">Código</th>
                                    <th>Artículo</th>
                                    <th>Categoría</th>
                                    <th>Ubicación</th>
                                    <th className="text-center">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtrar.map(item => (
                                    <tr key={item.id}>
                                        <td className="ps-4 fw-bold text-secondary">{item.codigo_sku}</td>
                                        <td>
                                            <div className="fw-medium">{item.nombre}</div>
                                            {item.stock_actual <= item.stock_minimo && <span className="badge bg-warning text-dark mt-1">⚠️ Bajo Stock</span>}
                                        </td>
                                        <td><span className="badge bg-light text-dark border">{item.categoria_nombre}</span></td>
                                        <td><small className="text-muted">{item.ubicacion_nombre}</small></td>
                                        <td className="text-center">
                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                {/* Botón Salida (Abre ModalSalida) */}
                                                <button className="btn btn-sm btn-outline-danger py-0 px-2 fw-bold"
                                                    onClick={() => setSalidaModal({ show: true, insumo: item })}>-</button>
                                                
                                                <span className={`fw-bold fs-5 ${item.stock_actual <= 0 ? 'text-danger' : 'text-success'}`}>
                                                    {item.stock_actual}
                                                </span>

                                                {/* Botón Entrada (Abre ModalEntrada) */}
                                                <button className="btn btn-sm btn-outline-success py-0 px-2 fw-bold"
                                                    onClick={() => setEntradaModal({ show: true, insumo: item })}>+</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inventario;