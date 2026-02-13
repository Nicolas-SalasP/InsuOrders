import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import api from '../api/axiosConfig';

const CategoriaModal = ({ show, onClose, onSave, data }) => {
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            setNombre(data ? data.nombre : '');
            setError('');
        }
    }, [show, data]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) {
            setError('El nombre es obligatorio');
            return;
        }

        setLoading(true);
        try {
            if (data) {
                // Editar (PUT)
                await api.put('/index.php/categorias', { id: data.id, nombre });
            } else {
                // Crear (POST)
                await api.post('/index.php/categorias', { nombre });
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{data ? 'Editar Categoría' : 'Nueva Categoría'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <div className="alert alert-danger p-2 small">{error}</div>}
                    <Form.Group>
                        <Form.Label className="fw-bold">Nombre de la Categoría</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={nombre} 
                            onChange={(e) => setNombre(e.target.value)} 
                            placeholder="Ej: Herramientas"
                            autoFocus
                        />
                        <Form.Text className="text-muted small">
                            Se guardará con la primera letra mayúscula automáticamente.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CategoriaModal;