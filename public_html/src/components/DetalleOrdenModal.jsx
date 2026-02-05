import { useEffect, useState } from 'react';
import { Modal, Button, Table, Badge, Spinner } from 'react-bootstrap';
import api from '../api/axiosConfig';

const DetalleOrdenModal = ({ show, onHide, ordenId, onDownloadPdf, onExportExcel }) => {
    const [orden, setOrden] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && ordenId) {
            cargarDetalle();
        } else {
            setOrden(null);
        }
    }, [show, ordenId]);

    const cargarDetalle = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/index.php/compras/detalle?id=${ordenId}`);
            if (res.data.success) {
                setOrden(res.data.data);
            }
        } catch (e) {
            console.error("Error al cargar detalle OC", e);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="bg-light">
                <Modal.Title className="fw-bold">Detalle Orden de Compra #{ordenId}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ minHeight: '250px' }}>
                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                ) : orden && orden.cabecera ? (
                    <>
                        <div className="row mb-4 border-bottom pb-3">
                            <div className="col-md-6">
                                <p className="mb-1 text-muted small text-uppercase fw-bold">Proveedor</p>
                                <p className="fw-bold mb-3 fs-5">{orden.cabecera.proveedor || "N/A"}</p>
                                
                                <div className="row">
                                    <div className="col-6">
                                        <p className="mb-1 text-muted small text-uppercase fw-bold">RUT</p>
                                        <p className="mb-3">{orden.cabecera.proveedor_rut || "N/A"}</p>
                                    </div>
                                    <div className="col-6">
                                        <p className="mb-1 text-muted small text-uppercase fw-bold">Fecha Emisión</p>
                                        <p className="mb-0">{new Date(orden.cabecera.fecha_creacion).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-md-6 text-md-end">
                                <div className="d-flex flex-column align-items-end h-100 justify-content-between">
                                    <div>
                                        <p className="mb-1 text-muted small text-uppercase fw-bold">Estado</p>
                                        <Badge bg="primary" className="mb-3 fs-6 px-3 py-2">{orden.cabecera.estado_nombre}</Badge>
                                    </div>
                                    {orden.cabecera.destino && (
                                        <div className="text-start bg-light p-2 rounded border mb-3 w-100">
                                            <small className="text-muted fw-bold text-uppercase d-block mb-1" style={{fontSize:'0.65rem'}}>
                                                Destino Interno:
                                            </small>
                                            <div className="fw-bold text-dark small text-break">
                                                <i className="bi bi-geo-alt-fill me-1 text-secondary"></i>
                                                {orden.cabecera.destino}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <p className="mb-0 text-muted small text-uppercase fw-bold">Monto Total</p>
                                        <h3 className="fw-bold text-primary mb-0">${parseInt(orden.cabecera.monto_total).toLocaleString()}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Table responsive striped bordered hover size="sm" className="small mb-0">
                            <thead className="table-dark text-uppercase">
                                <tr>
                                    <th>SKU</th>
                                    <th>Insumo</th>
                                    <th className="text-center">Cant.</th>
                                    <th className="text-end">Precio Unit.</th>
                                    <th className="text-end">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orden.detalles?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="font-monospace">{item.codigo_sku}</td>
                                        <td className="fw-bold">{item.insumo}</td>
                                        <td className="text-center fw-bold">{parseFloat(item.cantidad_solicitada)} <span className="text-muted fw-normal small">{item.unidad_medida}</span></td>
                                        <td className="text-end">${parseInt(item.precio_unitario).toLocaleString()}</td>
                                        <td className="text-end fw-bold">${parseInt(item.total_linea).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </>
                ) : (
                    <div className="text-center py-5 text-muted small">No se encontró la información de la orden.</div>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-light">
                <Button variant="outline-danger" onClick={() => onDownloadPdf(ordenId)} disabled={!orden}>
                    <i className="bi bi-file-earmark-pdf me-2"></i>PDF Proveedor
                </Button>
                <Button variant="outline-success" onClick={() => onExportExcel(ordenId)} disabled={!orden}>
                    <i className="bi bi-file-earmark-excel me-2"></i>Excel Interno
                </Button>
                <Button variant="secondary" onClick={onHide}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DetalleOrdenModal;