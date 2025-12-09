import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import NuevaOrdenModal from '../components/NuevaOrdenModal';
import DetalleOrdenModal from '../components/DetalleOrdenModal';
import SubirArchivoModal from '../components/SubirArchivoModal';
import RecepcionCompraModal from '../components/RecepcionCompraModal';

const Compras = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados de Modales
    const [showModal, setShowModal] = useState(false); // Nueva Orden
    const [verModal, setVerModal] = useState({ show: false, id: null }); // Ver Detalle
    const [uploadModal, setUploadModal] = useState({ show: false, id: null }); // Subir PDF
    const [recepcionModal, setRecepcionModal] = useState({ show: false, id: null }); // Recepción

    // Estados de Filtros
    const [filtroProveedor, setFiltroProveedor] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroFecha, setFiltroFecha] = useState('');

    const [itemsPrecargados, setItemsPrecargados] = useState([]);
    const [pendientes, setPendientes] = useState([]);

    useEffect(() => {
        cargarOrdenes();
        cargarPendientes();
    }, []);

    const cargarOrdenes = async () => {
        try {
            const res = await api.get('/index.php/compras');
            if (res.data.success) setOrdenes(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const cargarPendientes = async () => {
        try {
            const res = await api.get('/index.php/compras/pendientes');
            if (res.data.success) setPendientes(res.data.data);
        } catch (e) { }
    };

    const generarOrdenDesdePendientes = () => {
        const items = pendientes.map(p => ({
            id: p.id,
            nombre: p.nombre,
            sku: p.codigo_sku,
            unidad: p.unidad_medida,
            cantidad: parseFloat(p.cantidad_total),
            precio: parseFloat(p.precio) || 0,
            tipo: 'existente',
            origen_ids: p.ids_detalle_solicitud
        }));

        setItemsPrecargados(items);
        setShowModal(true);
    };

    const handleNewOrder = () => {
        setItemsPrecargados([]);
        setShowModal(true);
    };

    const handleExportar = () => {
        setLoading(true);
        api.get('/index.php/exportar?modulo=compras', { responseType: 'blob' })
            .then((res) => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Compras_${new Date().toISOString().slice(0, 10)}.xlsx`);
                document.body.appendChild(link);
                link.click();
            })
            .catch(() => alert("Error al exportar"))
            .finally(() => setLoading(false));
    };

    const limpiarFiltros = () => {
        setFiltroProveedor('');
        setFiltroEstado('');
        setFiltroFecha('');
    };

    // Lógica de Filtrado
    const ordenesFiltradas = ordenes.filter(oc => {
        const matchProveedor = oc.proveedor.toLowerCase().includes(filtroProveedor.toLowerCase());
        const matchEstado = filtroEstado ? oc.estado === filtroEstado : true;

        // Comparación de fechas (YYYY-MM-DD)
        const fechaOC = oc.fecha_creacion.split(' ')[0];
        const matchFecha = filtroFecha ? fechaOC === filtroFecha : true;

        return matchProveedor && matchEstado && matchFecha;
    });

    const getBadgeColor = (estado) => {
        switch (estado) {
            case 'Emitida': return 'bg-primary';
            case 'Recepcion Parcial': return 'bg-warning text-dark';
            case 'Recepcion Total': return 'bg-success';
            case 'Anulada': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column">
            {/* --- MODALES --- */}
            <NuevaOrdenModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={() => { cargarOrdenes(); cargarPendientes(); }}
                itemsIniciales={itemsPrecargados}
            />

            <DetalleOrdenModal
                show={verModal.show}
                onClose={() => setVerModal({ show: false, id: null })}
                ordenId={verModal.id}
            />

            <SubirArchivoModal
                show={uploadModal.show}
                onClose={() => setUploadModal({ show: false, id: null })}
                ordenId={uploadModal.id}
                onSave={cargarOrdenes}
            />

            <RecepcionCompraModal
                show={recepcionModal.show}
                onClose={() => setRecepcionModal({ show: false, id: null })}
                ordenId={recepcionModal.id}
                onSave={() => { cargarOrdenes(); cargarPendientes(); }}
            />

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-shrink-0">
                    <h4 className="mb-0 fw-bold text-dark"><i className="bi bi-cart3 me-2"></i>Gestión de Compras</h4>
                    <div>
                        <button className="btn btn-outline-success me-2" onClick={handleExportar} disabled={loading}>
                            <i className="bi bi-file-earmark-excel me-2"></i>Exportar
                        </button>
                        <button className="btn btn-primary" onClick={handleNewOrder}>
                            <i className="bi bi-plus-lg me-2"></i>Nueva Orden
                        </button>
                    </div>
                </div>

                {/* --- BARRA DE FILTROS --- */}
                <div className="bg-light p-3 border-bottom">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-3">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Buscar proveedor..."
                                    value={filtroProveedor}
                                    onChange={(e) => setFiltroProveedor(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                                <option value="">Todos los Estados</option>
                                <option value="Emitida">Emitida</option>
                                <option value="Recepcion Parcial">Recepción Parcial</option>
                                <option value="Recepcion Total">Recepción Total</option>
                                <option value="Anulada">Anulada</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <input
                                type="date"
                                className="form-control"
                                value={filtroFecha}
                                onChange={(e) => setFiltroFecha(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3 text-end">
                            {(filtroProveedor || filtroEstado || filtroFecha) && (
                                <button className="btn btn-outline-secondary btn-sm" onClick={limpiarFiltros}>
                                    <i className="bi bi-x-lg me-1"></i>Limpiar Filtros
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card-body p-0 flex-grow-1 overflow-auto">

                    {/* ALERTA INTELIGENTE DE MANTENCIÓN */}
                    {pendientes.length > 0 && (
                        <div className="alert alert-warning border-warning d-flex align-items-center justify-content-between m-3 shadow-sm fade show" role="alert">
                            <div className="d-flex align-items-center">
                                <div className="bg-warning text-white rounded-circle p-2 me-3 d-flex justify-content-center align-items-center" style={{ width: 40, height: 40 }}>
                                    <i className="bi bi-bell-fill"></i>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0 text-dark">Solicitudes de Mantención Pendientes</h6>
                                    <span className="small text-muted">Hay <strong>{pendientes.length} insumos</strong> marcados como 'Falta Stock'.</span>
                                </div>
                            </div>
                            <button className="btn btn-sm btn-warning fw-bold text-dark border-dark" onClick={generarOrdenDesdePendientes}>
                                Generar OC con estos ítems <i className="bi bi-arrow-right ms-1"></i>
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center p-5">Cargando órdenes...</div>
                    ) : (
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light sticky-top">
                                <tr>
                                    <th className="ps-4">N° Orden</th>
                                    <th>Proveedor</th>
                                    <th>Fecha</th>
                                    <th>Monto Total</th>
                                    <th>Estado</th>
                                    <th className="text-end pe-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordenesFiltradas.length > 0 ? (
                                    ordenesFiltradas.map(oc => (
                                        <tr key={oc.id}>
                                            <td className="ps-4 fw-bold text-primary">#{oc.id}</td>
                                            <td>
                                                <div className="fw-medium">{oc.proveedor}</div>
                                                <small className="text-muted">{oc.proveedor_rut}</small>
                                            </td>
                                            <td>{new Date(oc.fecha_creacion).toLocaleDateString()}</td>
                                            <td className="fw-bold text-dark">
                                                ${parseInt(oc.monto_total).toLocaleString()} {oc.moneda !== 'CLP' ? oc.moneda : ''}
                                            </td>
                                            <td>
                                                <span className={`badge ${getBadgeColor(oc.estado)}`}>{oc.estado}</span>
                                            </td>
                                            <td className="text-end pe-4">

                                                {/* BOTÓN RECEPCIONAR */}
                                                {oc.estado !== 'Anulada' && oc.estado !== 'Recepcion Total' && (
                                                    <button
                                                        className="btn btn-sm btn-warning me-2 text-dark"
                                                        title="Recepcionar Mercadería"
                                                        onClick={() => setRecepcionModal({ show: true, id: oc.id })}
                                                    >
                                                        <i className="bi bi-truck"></i>
                                                    </button>
                                                )}

                                                {/* PDF */}
                                                <a
                                                    href={`http://localhost/insuorders/public_html/api/index.php/compras/pdf?id=${oc.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-danger me-2"
                                                    title="Descargar PDF"
                                                >
                                                    <i className="bi bi-file-earmark-pdf"></i>
                                                </a>

                                                {/* Ver Detalle */}
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => setVerModal({ show: true, id: oc.id })}
                                                    title="Ver Detalle"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>

                                                {/* Adjuntar Respaldo */}
                                                {oc.url_archivo ? (
                                                    <a href={`http://localhost/insuorders/public_html${oc.url_archivo}`}
                                                        target="_blank" className="btn btn-sm btn-success" title="Ver Respaldo Adjunto">
                                                        <i className="bi bi-paperclip"></i>
                                                    </a>
                                                ) : (
                                                    <button className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => setUploadModal({ show: true, id: oc.id })}
                                                        title="Adjuntar PDF Proveedor">
                                                        <i className="bi bi-upload"></i>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">No se encontraron órdenes con esos filtros</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Compras;