import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import api from '../api/axiosConfig';

const UbicacionEnvioModal = ({ show, onClose, onSave, ubicacion }) => {
    const [formData, setFormData] = useState({ id: null, nombre: '', descripcion: '', activo: 1 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (ubicacion) {
            setFormData(ubicacion);
        } else {
            setFormData({ id: null, nombre: '', descripcion: '', activo: 1 });
        }
    }, [ubicacion, show]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const method = formData.id ? 'put' : 'post';
            await api[method]('/index.php/mantenedores/ubicaciones-envio', formData);
            onSave();
            onClose();
        } catch (error) {
            alert("Error al guardar: " + (error.response?.data?.error || "Error desconocido"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton className="bg-light">
                <Modal.Title className="h5 fw-bold">{formData.id ? 'Editar' : 'Nueva'} Ubicación de Envío</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small">Nombre <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="text" 
                            name="nombre" 
                            value={formData.nombre} 
                            onChange={handleChange} 
                            required 
                            placeholder="Ej: Planta 1, HOR, Comafri..."
                            autoFocus
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small">Descripción (Opcional)</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3}
                            name="descripcion" 
                            value={formData.descripcion || ''} 
                            onChange={handleChange} 
                            placeholder="Detalles adicionales sobre este destino..."
                        />
                    </Form.Group>

                    {formData.id && (
                        <Form.Group className="mb-3">
                            <Form.Check 
                                type="switch"
                                label="Activo"
                                name="activo"
                                checked={formData.activo == 1}
                                onChange={(e) => setFormData({...formData, activo: e.target.checked ? 1 : 0})}
                            />
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="link" onClick={onClose} className="text-decoration-none text-muted">Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Ubicación'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default UbicacionEnvioModal;