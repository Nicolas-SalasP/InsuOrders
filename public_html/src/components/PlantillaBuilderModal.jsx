import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card } from 'react-bootstrap';
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';
import ConfirmModal from './ConfirmModal';

const PlantillaBuilderModal = ({ show, onHide, activo, onSuccess }) => {
    const estructuraBase = {
        titulo: `PAUTA DE MANTENCIÓN`,
        codigo_doc: "V.1.0",
        secciones: []
    };

    const [plantilla, setPlantilla] = useState(estructuraBase);
    const [saving, setSaving] = useState(false);

    // Estados para Modales
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info', action: null });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', action: null });

    useEffect(() => {
        if (show && activo) {
            if (activo.plantilla_json) {
                try {
                    const parsed = typeof activo.plantilla_json === 'string' 
                        ? JSON.parse(activo.plantilla_json) 
                        : activo.plantilla_json;
                    setPlantilla(parsed);
                } catch (e) {
                    setPlantilla({ ...estructuraBase, titulo: `MANTENCIÓN - ${activo.nombre}` });
                }
            } else {
                setPlantilla({ ...estructuraBase, titulo: `MANTENCIÓN - ${activo.nombre}` });
            }
        }
    }, [show, activo]);

    // --- MANEJADORES DE CIERRE DE MODALES ---
    
    const handleMsgClose = () => {
        const action = msgModal.action;
        setMsgModal({ ...msgModal, show: false, action: null });
        if (action) action(); // Ejecutar acción post-cierre (ej: cerrar el builder)
    };

    // --- FUNCIONES DEL CONSTRUCTOR ---

    const updateHeader = (field, value) => {
        setPlantilla({ ...plantilla, [field]: value });
    };

    const addSection = () => {
        const newSection = {
            titulo: "Nueva Sección",
            key: `sec_${Date.now()}`,
            tipo: "checklist_si_no",
            items: []
        };
        setPlantilla({ ...plantilla, secciones: [...plantilla.secciones, newSection] });
    };

    const removeSection = (idx) => {
        // Reemplazo de window.confirm por ConfirmModal
        setConfirmModal({
            show: true,
            title: "Eliminar Sección",
            message: "¿Estás seguro de que deseas eliminar esta sección y todas sus preguntas?",
            action: () => {
                const newSecs = [...plantilla.secciones];
                newSecs.splice(idx, 1);
                setPlantilla({ ...plantilla, secciones: newSecs });
                setConfirmModal({ ...confirmModal, show: false });
            }
        });
    };

    const updateSection = (idx, field, value) => {
        const newSecs = [...plantilla.secciones];
        newSecs[idx][field] = value;
        setPlantilla({ ...plantilla, secciones: newSecs });
    };

    const addItem = (secIdx) => {
        const newSecs = [...plantilla.secciones];
        const newItem = {
            key: `item_${Date.now()}`,
            label: "",
            sku: "",
            cant: 1
        };
        newSecs[secIdx].items.push(newItem);
        setPlantilla({ ...plantilla, secciones: newSecs });
    };

    const removeItem = (secIdx, itemIdx) => {
        const newSecs = [...plantilla.secciones];
        newSecs[secIdx].items.splice(itemIdx, 1);
        setPlantilla({ ...plantilla, secciones: newSecs });
    };

    const updateItem = (secIdx, itemIdx, field, value) => {
        const newSecs = [...plantilla.secciones];
        newSecs[secIdx].items[itemIdx][field] = value;
        setPlantilla({ ...plantilla, secciones: newSecs });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/mantencion/plantilla', {
                activo_id: activo.id,
                plantilla: plantilla
            });
            
            // Reemplazo de alert por MessageModal con callback
            setMsgModal({
                show: true,
                title: "Éxito",
                message: "Plantilla guardada correctamente.",
                type: "success",
                action: () => {
                    onSuccess();
                    onHide();
                }
            });

        } catch (error) {
            console.error(error);
            setMsgModal({
                show: true,
                title: "Error",
                message: "No se pudo guardar la plantilla. Intente nuevamente.",
                type: "error"
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {/* INYECCIÓN DE MODALES */}
            <MessageModal 
                show={msgModal.show} 
                onClose={handleMsgClose} 
                title={msgModal.title} 
                message={msgModal.message} 
                type={msgModal.type} 
            />
            
            <ConfirmModal 
                show={confirmModal.show} 
                onClose={() => setConfirmModal({ ...confirmModal, show: false })} 
                onConfirm={confirmModal.action}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Sí, Eliminar"
            />

            <Modal show={show} onHide={onHide} size="xl" backdrop="static" scrollable>
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title>
                        <i className="bi bi-pencil-square me-2"></i>
                        Diseñador de Pauta: {activo?.nombre}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-light">
                    
                    <Card className="mb-4 shadow-sm border-0">
                        <Card.Body>
                            <Row className="g-3">
                                <Col md={8}>
                                    <Form.Label className="fw-bold text-muted small">TÍTULO DEL DOCUMENTO</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={plantilla.titulo} 
                                        onChange={(e) => updateHeader('titulo', e.target.value)} 
                                        placeholder="Ej: MANTENCIÓN PREVENTIVA 500 HRS"
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Label className="fw-bold text-muted small">CÓDIGO (ISO/SOP)</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={plantilla.codigo_doc} 
                                        onChange={(e) => updateHeader('codigo_doc', e.target.value)} 
                                        placeholder="Ej: R.SOP-01"
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {plantilla.secciones.map((sec, secIdx) => (
                        <Card key={sec.key} className="mb-4 border-primary shadow-sm">
                            <Card.Header className="bg-white d-flex flex-wrap justify-content-between align-items-center py-2">
                                <div className="d-flex align-items-center gap-2 flex-grow-1">
                                    <span className="badge bg-primary rounded-circle">{secIdx + 1}</span>
                                    <Form.Control 
                                        type="text" 
                                        value={sec.titulo} 
                                        className="fw-bold border-0 fs-5"
                                        onChange={(e) => updateSection(secIdx, 'titulo', e.target.value)}
                                        placeholder="Nombre de la Sección (Ej: Seguridad)"
                                    />
                                </div>
                                <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
                                    <Form.Select 
                                        size="sm" 
                                        value={sec.tipo} 
                                        onChange={(e) => updateSection(secIdx, 'tipo', e.target.value)}
                                        className="border-primary text-primary fw-bold"
                                        style={{width: 'auto'}}
                                    >
                                        <option value="checklist_si_no">☑️ Checklist (Si/No)</option>
                                        <option value="estado_observacion">🚦 Estado (Bueno/Malo)</option>
                                        <option value="repuestos_validacion">⚙️ Repuestos (Stock)</option>
                                    </Form.Select>
                                    <Button variant="outline-danger" size="sm" onClick={() => removeSection(secIdx)} title="Borrar Sección">
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </div>
                            </Card.Header>
                            
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0 align-middle">
                                        <thead className="bg-light text-muted small text-uppercase">
                                            <tr>
                                                <th className="ps-4">Item a revisar / Tarea</th>
                                                {sec.tipo === 'repuestos_validacion' && (
                                                    <>
                                                        <th style={{width: '20%'}}>SKU / Código</th>
                                                        <th style={{width: '10%'}} className="text-center">Cant.</th>
                                                    </>
                                                )}
                                                <th style={{width: '50px'}}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sec.items.map((item, itemIdx) => (
                                                <tr key={item.key}>
                                                    <td className="ps-3">
                                                        <Form.Control 
                                                            type="text" 
                                                            size="sm" 
                                                            value={item.label} 
                                                            onChange={(e) => updateItem(secIdx, itemIdx, 'label', e.target.value)}
                                                            placeholder="Describe qué revisar..."
                                                            className="border-0 bg-transparent"
                                                        />
                                                    </td>
                                                    {sec.tipo === 'repuestos_validacion' && (
                                                        <>
                                                            <td>
                                                                <Form.Control 
                                                                    type="text" 
                                                                    size="sm" 
                                                                    value={item.sku || ''} 
                                                                    onChange={(e) => updateItem(secIdx, itemIdx, 'sku', e.target.value)}
                                                                    placeholder="Opcional"
                                                                />
                                                            </td>
                                                            <td>
                                                                <Form.Control 
                                                                    type="number" 
                                                                    size="sm" 
                                                                    className="text-center"
                                                                    value={item.cant || 1} 
                                                                    onChange={(e) => updateItem(secIdx, itemIdx, 'cant', e.target.value)}
                                                                />
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="text-center">
                                                        <i className="bi bi-x text-danger fs-5 cursor-pointer" 
                                                        style={{cursor: 'pointer'}}
                                                        onClick={() => removeItem(secIdx, itemIdx)}
                                                        title="Quitar ítem"></i>
                                                    </td>
                                                </tr>
                                            ))}
                                            {sec.items.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="text-center text-muted py-3 small fst-italic">
                                                        Sin ítems. Pulsa "Agregar Ítem" para comenzar.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-2 border-top bg-light">
                                    <Button variant="link" size="sm" className="text-decoration-none fw-bold" onClick={() => addItem(secIdx)}>
                                        <i className="bi bi-plus-circle-fill me-1"></i> Agregar Ítem
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}

                    <div className="text-center py-4 border border-2 border-dashed rounded-3 text-muted" 
                        style={{cursor: 'pointer', backgroundColor: '#f8f9fa'}}
                        onClick={addSection}>
                        <i className="bi bi-folder-plus display-6 mb-2 d-block text-primary opacity-50"></i>
                        <h6 className="text-primary fw-bold">Agregar Nueva Sección</h6>
                        <small>Crea un grupo de revisiones (Ej: Hidráulica, Eléctrica)</small>
                    </div>

                </Modal.Body>
                <Modal.Footer className="bg-white">
                    <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                    <Button variant="success" onClick={handleSave} disabled={saving} className="px-4 fw-bold shadow-sm">
                        {saving ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
                        ) : (
                            <><i className="bi bi-save me-2"></i>Guardar Plantilla</>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default PlantillaBuilderModal;