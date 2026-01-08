import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const ModalCargaMasiva = ({ show, onClose, tipo, onSave }) => {
    const [archivo, setArchivo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [erroresDetallados, setErroresDetallados] = useState([]);
    const [infoTexto, setInfoTexto] = useState([]);

    useEffect(() => {
        setMensaje(null);
        setArchivo(null);
        setErroresDetallados([]);
        const instrucciones = {
            proveedores: [
                "El RUT debe incluir puntos y guion.",
                "Escriba el nombre exacto de País, Región y Comuna.",
                "Delimitador requerido: Punto y coma (;)."
            ],
            insumos: [
                "SKU: Deje vacío o ponga 'AUTO' para generación correlativa.",
                "Precios: Use solo números (sin signos de peso).",
                "Columnas mínimas: SKU, Nombre, Categoria, Stock, Minimo, Unidad, Costo, Moneda, Ubicación."
            ],
            activos: [
                "Código interno debe ser único por activo.",
                "La ubicación es texto libre (ej: 'Bodega Norte').",
                "El centro de costo debe existir en el sistema."
            ]
        };
        setInfoTexto(instrucciones[tipo] || []);
    }, [tipo, show]);

    if (!show) return null;

    const handleDownloadTemplate = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/index.php/importar/plantilla?tipo=${tipo}`, { 
                responseType: 'blob' 
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `plantilla_${tipo}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setMensaje({ type: 'danger', text: "No se pudo descargar la plantilla." });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!archivo) return;
        const formData = new FormData();
        formData.append('archivo', archivo);
        formData.append('tipo', tipo);
        setLoading(true);
        setMensaje(null);
        setErroresDetallados([]);
        try {
            const res = await api.post('/index.php/importar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) {
                const totalErr = res.data.detalles?.errores_count || 0;
                if (totalErr > 0) {
                    setMensaje({ type: 'warning', text: `Carga parcial: ${res.data.detalles.importados} exitosos, ${totalErr} fallidos.` });
                    setErroresDetallados(res.data.detalles.lista_errores || []);
                } else {
                    setMensaje({ type: 'success', text: "¡Importación completada con éxito!" });
                    setTimeout(() => { onSave(); onClose(); }, 2000);
                }
            }
        } catch (error) {
            setMensaje({ type: 'danger', text: error.response?.data?.message || "Error crítico en el servidor." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1055 }}>
            <div className="modal-dialog modal-md shadow-lg">
                <div className="modal-content border-0">
                    <div className="modal-header bg-dark text-white border-0">
                        <h5 className="modal-title d-flex align-items-center"><i className="bi bi-file-earmark-arrow-up-fill me-2"></i>Importar {tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        {mensaje && <div className={`alert alert-${mensaje.type} small d-flex align-items-center`}>
                            <i className={`bi ${mensaje.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                            <div>{mensaje.text}</div>
                        </div>}
                        <div className="card bg-light border-0 mb-4">
                            <div className="card-body p-3">
                                <h6 className="card-subtitle mb-2 text-primary fw-bold small"><i className="bi bi-info-circle-fill me-1"></i> Instrucciones:</h6>
                                <ul className="mb-0 ps-3 small text-muted">
                                    {infoTexto.map((txt, i) => <li key={i}>{txt}</li>)}
                                    <li>Asegúrese de que el archivo sea <strong>.CSV</strong></li>
                                </ul>
                            </div>
                        </div>
                        {erroresDetallados.length > 0 && (
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-danger">Problemas encontrados:</label>
                                <div className="border rounded p-2 bg-white" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                    {erroresDetallados.map((err, idx) => (
                                        <div key={idx} className="text-danger small border-bottom mb-1 pb-1">
                                            <strong>Fila {err.fila}:</strong> {err.item} <br/>
                                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>{err.error}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="d-grid mb-4">
                            <button type="button" className="btn btn-outline-primary shadow-sm" onClick={handleDownloadTemplate} disabled={loading}>
                                <i className="bi bi-cloud-download me-2"></i>Descargar Plantilla Maestra
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label fw-bold small">Paso 2: Subir archivo</label>
                                <div className="input-group">
                                    <input type="file" className="form-control" accept=".csv" onChange={e => setArchivo(e.target.files[0])} required disabled={loading} />
                                    <span className="input-group-text bg-white"><i className="bi bi-filetype-csv text-success"></i></span>
                                </div>
                            </div>
                            <div className="d-grid">
                                <button type="submit" className="btn btn-success p-2 fw-bold" disabled={loading || !archivo}>
                                    {loading ? 'Procesando...' : 'Iniciar Carga'}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer bg-light border-0 py-2">
                        <button type="button" className="btn btn-link text-muted btn-sm" onClick={onClose}>Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalCargaMasiva;