import React, { useState, useEffect } from 'react';

const ChecklistRenderer = ({ plantilla, respuestasIniciales, onChange, readOnly = false }) => {
    const [respuestas, setRespuestas] = useState({});

    useEffect(() => {
        if (respuestasIniciales) {
            setRespuestas(respuestasIniciales);
        }
    }, [respuestasIniciales]);

    const updateRespuesta = (seccion, key, campo, valor) => {
        if (readOnly) return;
        const newRespuestas = { ...respuestas };
        
        if (!newRespuestas[key]) {
            newRespuestas[key] = { seccion, key };
        }
        
        newRespuestas[key][campo] = valor;
        setRespuestas(newRespuestas);
        
        onChange(Object.values(newRespuestas));
    };

    if (!plantilla || !plantilla.secciones) {
        return <div className="p-5 text-center text-muted">No hay planilla configurada para este activo.</div>;
    }

    return (
        <div className="checklist-wrapper pb-4">
            {/* CABECERA */}
            <div className="alert alert-info py-2 mb-4 d-flex justify-content-between align-items-center shadow-sm">
                <div>
                    <strong>{plantilla.titulo}</strong>
                    <div className="small">{plantilla.codigo_doc}</div>
                </div>
                <i className="bi bi-file-text fs-3"></i>
            </div>

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
                                                        disabled={readOnly}
                                                    >Si</button>
                                                    <button 
                                                        className={`btn btn-sm ${respuestas[item.key]?.valor === 'no' ? 'btn-danger' : 'btn-outline-danger'}`}
                                                        onClick={() => updateRespuesta(seccion.key, item.key, 'valor', 'no')}
                                                        disabled={readOnly}
                                                    >No</button>
                                                </div>
                                            )}

                                            {seccion.tipo === 'estado_observacion' && (
                                                <select 
                                                    className={`form-select form-select-sm ${respuestas[item.key]?.valor === 'malo' ? 'border-danger text-danger fw-bold' : ''}`}
                                                    value={respuestas[item.key]?.valor || ''}
                                                    onChange={(e) => updateRespuesta(seccion.key, item.key, 'valor', e.target.value)}
                                                    disabled={readOnly}
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
                                                        disabled={readOnly}
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
                                                disabled={readOnly}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChecklistRenderer;