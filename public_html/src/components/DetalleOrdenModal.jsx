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
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <p className="mb-1 text-muted small text-uppercase fw-bold">Proveedor</p>
                                <p className="fw-bold mb-3">{orden.cabecera.proveedor || "N/A"}</p>
                                <p className="mb-1 text-muted small text-uppercase fw-bold">RUT</p>
                                <p className="mb-3">{orden.cabecera.proveedor_rut || "N/A"}</p>
                                <p className="mb-1 text-muted small text-uppercase fw-bold">Fecha Emisión</p>
                                <p className="mb-0">{new Date(orden.cabecera.fecha_creacion).toLocaleDateString()}</p>
                            </div>
                            <div className="col-md-6 text-md-end">
                                <p className="mb-1 text-muted small text-uppercase fw-bold">Estado</p>
                                <Badge bg="primary" className="mb-3">{orden.cabecera.estado_nombre}</Badge>
                                <p className="mb-1 text-muted small text-uppercase fw-bold">Monto Total</p>
                                <h4 className="fw-bold text-primary">${parseInt(orden.cabecera.monto_total).toLocaleString()}</h4>
                            </div>
                        </div>

                        <Table responsive striped bordered hover className="small">
                            <thead className="table-dark">
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
                                        <td>{item.codigo_sku}</td>
                                        <td>{item.insumo}</td>
                                        <td className="text-center">{parseFloat(item.cantidad_solicitada)}</td>
                                        <td className="text-end">${parseInt(item.precio_unitario).toLocaleString()}</td>
                                        <td className="text-end">${parseInt(item.total_linea).toLocaleString()}</td>
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
                    <i className="bi bi-file-earmark-pdf me-2"></i>PDF
                </Button>
                <Button variant="outline-success" onClick={() => onExportExcel(ordenId)} disabled={!orden}>
                    <i className="bi bi-file-earmark-excel me-2"></i>Excel Detalle
                </Button>
                <Button variant="secondary" onClick={onHide}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DetalleOrdenModal;