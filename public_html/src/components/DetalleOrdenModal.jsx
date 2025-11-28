import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

const DetalleOrdenModal = ({ show, onClose, ordenId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && ordenId) {
            setLoading(true);
            api.get(`/index.php/compras?id=${ordenId}`)
                .then(res => setData(res.data.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        } else {
            setData(null);
        }
    }, [show, ordenId]);

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title">Detalle Orden #{ordenId}</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {loading || !data ? (
                            <div className="text-center p-4">Cargando...</div>
                        ) : (
                            <>
                                {/* Cabecera */}
                                <div className="row mb-4 border-bottom pb-3">
                                    <div className="col-6">
                                        <h6 className="text-primary fw-bold">PROVEEDOR</h6>
                                        <div className="fs-5 fw-bold">{data.cabecera.proveedor}</div>
                                        <div className="text-muted">RUT: {data.cabecera.proveedor_rut}</div>
                                    </div>
                                    <div className="col-6 text-end">
                                        <div className="badge bg-success fs-6 mb-2">{data.cabecera.estado_nombre}</div>
                                        <div>Fecha: {new Date(data.cabecera.fecha_creacion).toLocaleDateString()}</div>
                                        <div>Creado por: {data.cabecera.creador}</div>
                                    </div>
                                </div>

                                {/* Tabla */}
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>SKU</th>
                                                <th>Producto</th>
                                                <th className="text-center">Cant.</th>
                                                <th className="text-end">Precio</th>
                                                <th className="text-end">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.detalles.map((d, i) => (
                                                <tr key={i}>
                                                    <td><small>{d.codigo_sku}</small></td>
                                                    <td>{d.insumo}</td>
                                                    <td className="text-center">{d.cantidad_solicitada}</td>
                                                    <td className="text-end">${parseFloat(d.precio_unitario).toLocaleString()}</td>
                                                    <td className="text-end fw-bold">${parseFloat(d.total_linea).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Totales */}
                                <div className="row justify-content-end mt-3">
                                    <div className="col-md-5">
                                        <ul className="list-group">
                                            <li className="list-group-item d-flex justify-content-between">
                                                <span>Neto</span> <span>${parseFloat(data.cabecera.monto_neto).toLocaleString()}</span>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between active">
                                                <span className="fw-bold">TOTAL ({data.cabecera.moneda})</span>
                                                <span className="fw-bold">${parseFloat(data.cabecera.monto_total).toLocaleString()}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                        <a href={`http://localhost/insuorders/public_html/api/index.php/compras/pdf?id=${ordenId}`}
                            target="_blank" className="btn btn-danger">
                            <i className="bi bi-file-pdf me-2"></i>Descargar PDF
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleOrdenModal;