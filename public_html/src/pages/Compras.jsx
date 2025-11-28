import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import NuevaOrdenModal from '../components/NuevaOrdenModal';
import DetalleOrdenModal from '../components/DetalleOrdenModal';
import SubirArchivoModal from '../components/SubirArchivoModal';

const Compras = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [verModal, setVerModal] = useState({ show: false, id: null });
    const [uploadModal, setUploadModal] = useState({ show: false, id: null });

    useEffect(() => {
        cargarOrdenes();
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

    // Función para obtener color según estado
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
            <NuevaOrdenModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={cargarOrdenes}
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

            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-shrink-0">
                    <h4 className="mb-0 fw-bold text-dark"><i className="bi bi-cart3 me-2"></i>Gestión de Compras</h4>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <i className="bi bi-plus-lg me-2"></i>Nueva Orden
                    </button>
                </div>


                <div className="card-body p-0 flex-grow-1 overflow-auto">
                    {loading ? (
                        <div className="text-center p-5">Cargando órdenes...</div>
                    ) : (
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light sticky-top" style={{ zIndex: 1 }}>
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
                                {ordenes.map(oc => (
                                    <tr key={oc.id}>
                                        <td className="ps-4 fw-bold">#{oc.id}</td>
                                        <td>
                                            <div className="fw-medium">{oc.proveedor}</div>
                                            <small className="text-muted">{oc.proveedor_rut}</small>
                                        </td>
                                        <td>{new Date(oc.fecha_creacion).toLocaleDateString()}</td>
                                        <td className="fw-bold">${parseInt(oc.monto_total).toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${getBadgeColor(oc.estado)}`}>{oc.estado}</span>
                                        </td>
                                        <td className="text-end pe-4">
                                            {/* Botón Descargar PDF */}
                                            <a
                                                href={`http://localhost/insuorders/public_html/api/index.php/compras/pdf?id=${oc.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-danger me-2"
                                                title="Descargar PDF"
                                            >
                                                <i className="bi bi-file-earmark-pdf"></i>
                                            </a>

                                            {/* Botón Ver Detalle (El Ojito) - CORREGIDO */}
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => setVerModal({ show: true, id: oc.id })}
                                                title="Ver Detalle"
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>
                                            {/* Botón de Archivo Adjunto */}
                                            {oc.url_archivo ? (
                                                <a href={`http://localhost/insuorders/public_html${oc.url_archivo}`}
                                                    target="_blank" className="btn btn-sm btn-success me-2" title="Ver Respaldo">
                                                    <i className="bi bi-paperclip"></i>
                                                </a>
                                            ) : (
                                                <button className="btn btn-sm btn-outline-secondary me-2"
                                                    onClick={() => setUploadModal({ show: true, id: oc.id })}
                                                    title="Adjuntar Respaldo">
                                                    <i className="bi bi-upload"></i>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {ordenes.length === 0 && (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">No hay órdenes registradas</td></tr>
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