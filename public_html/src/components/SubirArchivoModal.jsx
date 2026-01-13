import { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';

const SubirArchivoModal = ({ show, onClose, ordenId, currentUrl, onSave }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });

    const handleUpload = async () => {
        if (!file || !ordenId) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('orden_id', ordenId);
        formData.append('archivo', file);

        try {
            const res = await api.post('/index.php/compras/upload', formData);
            if (res.data.success) {
                onSave();
                onClose();
                setFile(null);
            }
        } catch (e) {
            setMsgModal({ show: true, title: "Error", message: e.response?.data?.message || "Servidor no responde", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const getFullUrl = (path) => {
        if (!path) return null;
        const base = api.defaults.baseURL.split('/index.php')[0];
        return `${base}/${path}`.replace(/([^:]\/)\/+/g, "$1");
    };

    const fullUrl = getFullUrl(currentUrl);

    return (
        <>
            <MessageModal show={msgModal.show} onClose={() => setMsgModal({...msgModal, show: false})} title={msgModal.title} message={msgModal.message} type={msgModal.type} />
            <Modal show={show} onHide={onClose} centered size={currentUrl ? "lg" : "md"}>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold">Gestión de Documentos OC #{ordenId}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentUrl && (
                        <div className="mb-4">
                            <h6 className="fw-bold mb-3 small text-uppercase text-muted">Vista Previa:</h6>
                            <div className="border rounded bg-white shadow-sm" style={{ height: '450px' }}>
                                <iframe src={fullUrl} width="100%" height="100%" style={{ border: 'none' }} title="Visualizador de PDF" />
                            </div>
                        </div>
                    )}
                    <div className="p-3 border rounded bg-light">
                        <h6 className="fw-bold mb-3 small text-uppercase text-muted">Subir nuevo archivo</h6>
                        <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.jpg,.png" className="mb-3" />
                        <Button variant="primary" className="w-100 fw-bold" onClick={handleUpload} disabled={!file || loading}>
                            {loading ? <Spinner animation="border" size="sm" className="me-2" /> : <i className="bi bi-upload me-2"></i>}
                            {currentUrl ? 'Reemplazar Archivo' : 'Subir Archivo'}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default SubirArchivoModal;