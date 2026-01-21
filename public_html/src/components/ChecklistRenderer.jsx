import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const ChecklistRenderer = ({ plantilla, respuestasIniciales, onChange }) => {
    // Estado local para las respuestas del checklist
    const [respuestas, setRespuestas] = useState({});
    
    // Estado local para comentarios
    const [comentarios, setComentarios] = useState('');
    
    // Referencia al pad de firma
    const sigCanvas = useRef({});

    // Cargar datos previos si existen
    useEffect(() => {
        if (respuestasIniciales) {
            // Respuestas del checklist
            setRespuestas(respuestasIniciales);
        }
    }, [respuestasIniciales]);

    // Función centralizada para notificar cambios al padre (MisMantenciones)
    const notificarCambios = (nuevasRespuestas, nuevoComentario, nuevaFirma) => {
        // Preparamos el objeto completo que espera el backend
        const payload = {
            respuestas: Object.values(nuevasRespuestas), // Convertimos obj a array
            comentarios: nuevoComentario,
            firma: nuevaFirma // Base64 image string
        };
        onChange(payload);
    };

    // Manejar cambios en el Checklist (Si/No, Textos, etc)
    const updateRespuesta = (seccion, key, campo, valor) => {
        const newRespuestas = { ...respuestas };
        
        if (!newRespuestas[key]) {
            newRespuestas[key] = { seccion, key };
        }
        
        newRespuestas[key][campo] = valor;
        setRespuestas(newRespuestas);
        
        // Notificamos manteniendo los otros estados actuales
        notificarCambios(
            newRespuestas, 
            comentarios, 
            sigCanvas.current.isEmpty() ? null : sigCanvas.current.toDataURL()
        );
    };

    // Manejar cambio en Comentarios
    const handleComentarioChange = (e) => {
        const val = e.target.value;
        setComentarios(val);
        notificarCambios(
            respuestas, 
            val, 
            sigCanvas.current.isEmpty() ? null : sigCanvas.current.toDataURL()
        );
    };

    // Manejar fin de trazo en la firma
    const handleFirmaEnd = () => {
        notificarCambios(
            respuestas, 
            comentarios, 
            sigCanvas.current.toDataURL() // Obtenemos la imagen base64
        );
    };

    // Borrar firma
    const limpiarFirma = () => {
        sigCanvas.current.clear();
        notificarCambios(respuestas, comentarios, null);
    };

    if (!plantilla || !plantilla.secciones) {
        return <div className="p-5 text-center text-muted">No hay planilla configurada para este activo.</div>;
    }

    return (
        <div className="checklist-wrapper pb-5">
            {/* CABECERA */}
            <div className="alert alert-info py-2 mb-4 d-flex justify-content-between align-items-center shadow-sm">
                <div>
                    <strong>{plantilla.titulo}</strong>
                    <div className="small">{plantilla.codigo_doc}</div>
                </div>
                <i className="bi bi-file-text fs-3"></i>
            </div>

            {/* SECCIONES DEL CHECKLIST */}
            {plantilla.secciones.map((seccion) => (
                <div key={seccion.key} className="card mb-4 border-0 shadow-sm">
                    <div className="card-header bg-light fw-bold text-uppercase small text-primary d-flex justify-content-between">
                        <span>{seccion.titulo}</span>
                        {seccion.tipo === 'repuestos_validacion' && <span className="badge bg-secondary">Verificación de Stock</span>}
                    </div>
                    <div className="card-body p-0">
                        <table className="table table-hover mb-0 align-middle">
                            <tbody>
                                {seccion.items.map((item) => (
                                    <tr key={item.key}>
                                        <td className="ps-3" style={{width: '45%'}}>
                                            <div className="fw-medium">{item.label}</div>
                                            {item.sku && <small className="text-muted font-monospace d-block">{item.sku}</small>}
                                        </td>
                                        
                                        <td style={{width: '25%'}}>
                                            {seccion.tipo === 'checklist_si_no' && (
                                                <div className="btn-group w-100 shadow-sm" role="group">
                                                    <button 
                                                        className={`btn btn-sm ${respuestas[item.key]?.valor === 'si' ? 'btn-success' : 'btn-outline-success'}`}
                                                        onClick={() => updateRespuesta(seccion.key, item.key, 'valor', 'si')}
                                                    >Si</button>
                                                    <button 
                                                        className={`btn btn-sm ${respuestas[item.key]?.valor === 'no' ? 'btn-danger' : 'btn-outline-danger'}`}
                                                        onClick={() => updateRespuesta(seccion.key, item.key, 'valor', 'no')}
                                                    >No</button>
                                                </div>
                                            )}

                                            {seccion.tipo === 'estado_observacion' && (
                                                <select 
                                                    className={`form-select form-select-sm ${respuestas[item.key]?.valor === 'malo' ? 'border-danger text-danger fw-bold' : ''}`}
                                                    value={respuestas[item.key]?.valor || ''}
                                                    onChange={(e) => updateRespuesta(seccion.key, item.key, 'valor', e.target.value)}
                                                >
                                                    <option value="">-- Estado --</option>
                                                    <option value="bueno">✅ Bueno</option>
                                                    <option value="regular">⚠️ Regular</option>
                                                    <option value="malo">❌ Malo / Cambio</option>
                                                    <option value="no_aplica">🚫 No Aplica</option>
                                                </select>
                                            )}

                                            {seccion.tipo === 'repuestos_validacion' && (
                                                <div className="input-group input-group-sm">
                                                    <span className="input-group-text bg-light">Cant.</span>
                                                    <input 
                                                        type="number" 
                                                        className="form-control text-center fw-bold" 
                                                        placeholder={item.cant}
                                                        value={respuestas[item.key]?.valor || ''}
                                                        onChange={(e) => updateRespuesta(seccion.key, item.key, 'valor', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </td>
                                        
                                        <td className="pe-2">
                                            <input 
                                                type="text" 
                                                className="form-control form-control-sm border-0 bg-light" 
                                                placeholder="Observaciones..."
                                                value={respuestas[item.key]?.observacion || ''}
                                                onChange={(e) => updateRespuesta(seccion.key, item.key, 'observacion', e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {/* --- PIE DE PÁGINA: COMENTARIOS Y FIRMA --- */}
            <div className="card border-secondary shadow-sm mt-5">
                <div className="card-header bg-secondary text-white fw-bold d-flex justify-content-between align-items-center">
                    <span><i className="bi bi-pen-fill me-2"></i> FINALIZACIÓN Y FIRMA</span>
                    <small className="fw-light">Paso Final</small>
                </div>
                <div className="card-body bg-light">
                    
                    {/* Comentarios Finales */}
                    <div className="mb-4">
                        <label className="form-label fw-bold text-dark">Comentarios Generales / Observaciones Finales</label>
                        <textarea 
                            className="form-control shadow-sm" 
                            rows="3"
                            placeholder="Detalle cualquier anomalía extra, trabajos pendientes o insumos adicionales utilizados..."
                            value={comentarios}
                            onChange={handleComentarioChange}
                        ></textarea>
                    </div>

                    {/* Pad de Firma */}
                    <div className="mb-3">
                        <label className="form-label fw-bold text-dark">Firma del Técnico Responsable</label>
                        <div className="border border-2 rounded bg-white shadow-sm position-relative" style={{ width: '100%', height: '200px' }}>
                            <SignatureCanvas 
                                ref={sigCanvas}
                                penColor="black"
                                canvasProps={{ className: 'sigCanvas w-100 h-100' }}
                                onEnd={handleFirmaEnd} // Se dispara al soltar el mouse/dedo
                            />
                            <div className="position-absolute bottom-0 end-0 p-2 pointer-events-none text-muted small opacity-50 user-select-none">
                                Área de Firma
                            </div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <small className="text-muted fst-italic">* Firme en el recuadro blanco usando el mouse o pantalla táctil.</small>
                            <button className="btn btn-sm btn-outline-danger" onClick={limpiarFirma}>
                                <i className="bi bi-eraser me-1"></i> Borrar Firma
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ChecklistRenderer;