import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const MisInsumos = () => {
    const [data, setData] = useState({ pendientes: [], inventario: [] });
    const [loading, setLoading] = useState(true);
    const [consumo, setConsumo] = useState({});

    const cargarDatos = () => {
        setLoading(true);
        api.get('/operario/mis-insumos')
            .then(res => {
                console.log("Datos recibidos:", res.data);
                if (res.data.success && res.data.data) {
                    setData({
                        pendientes: res.data.data.pendientes || [],
                        inventario: res.data.data.inventario || []
                    });
                } else {
                    setData({ pendientes: [], inventario: [] });
                }
            })
            .catch(err => {
                console.error("Error cargando insumos:", err);
                setData({ pendientes: [], inventario: [] });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleResponder = async (entregaId, accion) => {
        const texto = accion === 'ACEPTAR' ? 'recibir' : 'rechazar';
        if (!window.confirm(`¿Confirmas que deseas ${texto} esta entrega?`)) return;
        
        try {
            await api.post('/operario/responder', { entrega_id: entregaId, accion });
            cargarDatos();
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Ocurrió un error"));
        }
    };

    const handleConsumir = async (entregaId) => {
        const cant = parseFloat(consumo[entregaId]);
        if (!cant || cant <= 0) return alert("Ingresa una cantidad válida.");

        try {
            await api.post('/operario/consumir', { entrega_id: entregaId, cantidad: cant });
            alert("Consumo registrado correctamente.");
            setConsumo({ ...consumo, [entregaId]: '' });
            cargarDatos();
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Error al registrar consumo"));
        }
    };

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid py-4">
            <h3 className="mb-4 fw-bold text-dark"><i className="bi bi-tools me-2"></i>Panel de Insumos</h3>

            {/* SECCIÓN 1: PENDIENTES DE ACEPTAR */}
            {data.pendientes && data.pendientes.length > 0 && (
                <div className="card border-warning mb-4 shadow-sm">
                    <div className="card-header bg-warning text-dark fw-bold d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i> Tienes entregas por confirmar
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-3">Fecha</th>
                                        <th>Insumo</th>
                                        <th className="text-center">Cant.</th>
                                        <th className="text-end pe-3">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.pendientes.map(p => (
                                        <tr key={p.id}>
                                            <td className="ps-3 small">{new Date(p.fecha_entrega).toLocaleDateString()}</td>
                                            <td>
                                                <div className="fw-bold">{p.insumo}</div>
                                                <small className="text-muted">Bodeguero: {p.bodeguero_nombre}</small>
                                            </td>
                                            <td className="text-center fw-bold fs-5 text-dark">{parseFloat(p.cantidad_entregada)} <small className="fs-6 fw-normal text-muted">{p.unidad_medida}</small></td>
                                            <td className="text-end pe-3">
                                                <button className="btn btn-sm btn-success me-2" title="Aceptar" onClick={() => handleResponder(p.id, 'ACEPTAR')}>
                                                    <i className="bi bi-check-lg"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" title="Rechazar" onClick={() => handleResponder(p.id, 'RECHAZAR')}>
                                                    <i className="bi bi-x-lg"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SECCIÓN 2: MI INVENTARIO */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white fw-bold py-3 border-bottom">
                    <i className="bi bi-box-seam me-2"></i> Mis Materiales en Poder
                </div>
                <div className="card-body p-0">
                    {(!data.inventario || data.inventario.length === 0) ? (
                        <div className="p-5 text-center text-muted">No tienes materiales asignados actualmente.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-3">Insumo</th>
                                        <th className="text-center">Stock Actual</th>
                                        <th style={{width: '220px'}} className="pe-3">Reportar Uso</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.inventario.map(i => (
                                        <tr key={i.id}>
                                            <td className="ps-3">
                                                <div className="fw-bold text-primary">{i.insumo}</div>
                                                <small className="text-muted">{i.codigo_sku}</small>
                                            </td>
                                            <td className="text-center">
                                                <span className="badge bg-light text-dark border fs-6 px-3 py-2">
                                                    {parseFloat(i.saldo_actual)} {i.unidad_medida}
                                                </span>
                                            </td>
                                            <td className="pe-3">
                                                <div className="input-group input-group-sm">
                                                    <input 
                                                        type="number" 
                                                        className="form-control" 
                                                        placeholder="Cant."
                                                        min="0.1"
                                                        step="0.1"
                                                        max={i.saldo_actual}
                                                        value={consumo[i.id] || ''}
                                                        onChange={e => setConsumo({...consumo, [i.id]: e.target.value})}
                                                    />
                                                    <button className="btn btn-primary" onClick={() => handleConsumir(i.id)}>
                                                        Usar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MisInsumos;