import { useState } from 'react';
import api from '../api/axiosConfig';

const SubirArchivoModal = ({ show, onClose, ordenId, onSave }) => {
    const [archivo, setArchivo] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!archivo) return alert("Selecciona un archivo");

        setLoading(true);
        const formData = new FormData();
        formData.append('orden_id', ordenId);
        formData.append('archivo', archivo);

        try {
            await api.post('/index.php/compras/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Archivo subido con éxito");
            onSave(); // Recargar lista
            onClose();
        } catch (error) {
            alert("Error: " + error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title">📎 Adjuntar PDF/Respaldo</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Seleccionar Archivo</label>
                                <input type="file" className="form-control" accept=".pdf,.jpg,.png"
                                    onChange={e => setArchivo(e.target.files[0])} required />
                                <div className="form-text">Sube la Orden de Compra original firmada o escaneada.</div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Subiendo...' : 'Guardar Archivo'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubirArchivoModal;