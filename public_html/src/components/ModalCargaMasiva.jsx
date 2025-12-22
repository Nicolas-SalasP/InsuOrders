import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const ModalCargaMasiva = ({ show, onClose, tipo, onSave }) => {
    const [archivo, setArchivo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [infoTexto, setInfoTexto] = useState([]);

    // Actualizar texto según el tipo cuando se abre el modal
    useEffect(() => {
        if (tipo === 'proveedores') {
            setInfoTexto([
                "El RUT debe incluir puntos y guion.",
                "Escriba el nombre exacto del País, Región y Comuna (ej: 'Metropolitana').",
                "En Condición Venta use: 'Crédito', 'Contado' o 'Efectivo'."
            ]);
        } else if (tipo === 'insumos') {
            setInfoTexto([
                "El SKU se genera automáticamente (deje la columna o ponga 'AUTO').",
                "Si la categoría no existe, se creará automáticamente.",
                "Use punto (.) o coma (,) para decimales en precios."
            ]);
        } else if (tipo === 'activos') {
            setInfoTexto([
                "Defina un código interno único para cada activo.",
                "La ubicación es texto libre (ej: 'Taller Central')."
            ]);
        }
    }, [tipo]);

    if (!show) return null;

    const handleDownloadTemplate = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/index.php/importar/plantilla?tipo=${tipo}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `plantilla_${tipo}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setMensaje({ type: 'danger', text: "Error descargando plantilla." });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!archivo) return alert("Selecciona un archivo");

        const formData = new FormData();
        formData.append('archivo', archivo);
        formData.append('tipo', tipo);

        setLoading(true);
        setMensaje(null);

        try {
            const res = await api.post('/index.php/importar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setMensaje({ type: 'success', text: res.data.message });
                setTimeout(() => { onSave(); onClose(); setMensaje(null); setArchivo(null); }, 2500);
            }
        } catch (error) {
            setMensaje({ type: 'danger', text: error.response?.data?.message || "Error al importar." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title"><i className="bi bi-file-earmark-spreadsheet me-2"></i>Carga Masiva: {tipo.toUpperCase()}</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {mensaje && <div className={`alert alert-${mensaje.type} text-center`}>{mensaje.text}</div>}

                        <div className="alert alert-light border small">
                            <h6 className="fw-bold"><i className="bi bi-lightbulb me-2"></i>Instrucciones para {tipo}:</h6>
                            <ul className="mb-0 ps-3">
                                <li>Descarga la <strong>plantilla</strong> y ábrela en Excel.</li>
                                {infoTexto.map((txt, i) => <li key={i}>{txt}</li>)}
                                <li>Guarda como <strong>CSV (delimitado por comas)</strong>.</li>
                            </ul>
                        </div>

                        <div className="d-flex justify-content-center mb-4">
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleDownloadTemplate} disabled={loading}>
                                <i className="bi bi-download me-2"></i>Descargar Plantilla
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Seleccionar Archivo CSV</label>
                                <input type="file" className="form-control" accept=".csv" onChange={e => setArchivo(e.target.files[0])} required />
                            </div>
                            <div className="d-grid">
                                <button type="submit" className="btn btn-success fw-bold" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-upload me-2"></i>}
                                    Procesar Carga
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalCargaMasiva;