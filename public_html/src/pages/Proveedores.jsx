import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import ProveedorModal from '../components/ProveedorModal'; // Importar el modal

const Proveedores = () => {
    const [proveedores, setProveedores] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Estados para el modal
    const [showModal, setShowModal] = useState(false);
    const [proveedorEditar, setProveedorEditar] = useState(null);

    useEffect(() => {
        cargarProveedores();
    }, []);

    const cargarProveedores = async () => {
        setLoading(true);
        try {
            const response = await api.get('/index.php/proveedores');
            if (response.data.success) {
                setProveedores(response.data.data);
            }
        } catch (error) {
            console.error("Error cargando proveedores", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
            try {
                await api.delete('/index.php/proveedores?id=' + id);
                cargarProveedores(); // Recargar lista
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

    // Filtro de búsqueda
    const proveedoresFiltrados = proveedores.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.rut.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            {/* Modal de Agregar/Editar */}
            <ProveedorModal 
                show={showModal} 
                onClose={() => setShowModal(false)}
                proveedorEditar={proveedorEditar}
                onSave={cargarProveedores}
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
                
                <div className="card-body d-flex flex-column p-0" style={{ overflow: 'hidden' }}>
                    <div className="p-3 border-bottom bg-light">
                        <div className="row g-2 align-items-center">
                            <div className="col-12 col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">🔎</span>
                                    <input 
                                        type="text" 
                                        className="form-control border-start-0 ps-0" 
                                        placeholder="Buscar por nombre, RUT..." 
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="col-12 col-md-6 text-md-end text-muted small">
                                {proveedoresFiltrados.length} registros encontrados
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow-1 overflow-auto">
                        {loading ? (
                            <div className="d-flex flex-column justify-content-center align-items-center h-100">
                                <div className="spinner-border text-primary mb-2" role="status"></div>
                                <span className="text-muted">Cargando proveedores...</span>
                            </div>
                        ) : (
                            <table className="table table-hover align-middle mb-0" style={{ minWidth: '800px' }}>
                                <thead className="bg-light sticky-top" style={{ zIndex: 1 }}>
                                    <tr>
                                        <th className="ps-4 py-3">RUT</th>
                                        <th className="py-3">Razón Social</th>
                                        <th className="py-3">Contacto</th>
                                        <th className="py-3">Ubicación</th>
                                        <th className="py-3">Tipo Venta</th>
                                        <th className="text-end pe-4 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proveedoresFiltrados.map((p) => (
                                        <tr key={p.id}>
                                            <td className="ps-4 fw-bold text-dark">{p.rut}</td>
                                            <td>
                                                <div className="fw-semibold text-primary">{p.nombre}</div>
                                                <div className="small text-muted">{p.email}</div>
                                            </td>
                                            <td>
                                                <div>{p.contacto_vendedor || <span className="text-muted fst-italic">--</span>}</div>
                                                <div className="small text-secondary">{p.telefono}</div>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className="badge bg-light text-dark border mb-1 w-auto align-self-start">
                                                        {p.comuna || 'Sin Comuna'}
                                                    </span>
                                                    <span className="small text-muted">{p.region}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill ${p.tipo_venta === 'Contado' ? 'bg-success' : 'bg-secondary'}`}>
                                                    {p.tipo_venta}
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
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Proveedores;