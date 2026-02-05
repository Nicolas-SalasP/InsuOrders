import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'; // Usamos componentes de Bootstrap para limpieza
import api from '../api/axiosConfig';
import MessageModal from './MessageModal';

const BASE_URL_IMAGENES = '/api';

const InsumoModal = ({ show, onClose, onSave, insumo }) => {
    // Estado inicial limpio
    const initialState = {
        codigo_sku: '', nombre: '', descripcion: '',
        categoria_id: '',
        // ubicacion_id se elimina de aquí porque ahora es múltiple
        stock_actual: 0, stock_minimo: 5,
        precio_costo: 0, moneda: 'CLP', unidad_medida: 'UN'
    };

    const [formData, setFormData] = useState(initialState);
    
    // Estados para Múltiples Ubicaciones
    const [stockLocations, setStockLocations] = useState([{ ubicacion_id: '', cantidad: 0 }]);
    
    // Estados de UI y Datos
    const [imagenFile, setImagenFile] = useState(null);
    const [imagenPreview, setImagenPreview] = useState(null);
    const [listas, setListas] = useState({ categorias: [], sectores: [], ubicaciones: [] });
    const [saving, setSaving] = useState(false);
    const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'info' });
    
    // Estado SKU Automático
    const [esAutomatico, setEsAutomatico] = useState(true);

    // Cargar listas y datos al abrir
    useEffect(() => {
        if (show) {
            setSaving(false);
            cargarAuxiliares();
        }
    }, [show, insumo]); // Dependencia 'insumo' para recargar si cambia la selección

    const cargarAuxiliares = async () => {
        try {
            const res = await api.get('/index.php/inventario/auxiliares'); // Tu ruta original
            if (res.data.success) {
                // CORRECCIÓN DEL ERROR: Aseguramos que siempre sean arrays
                const data = res.data.data;
                setListas({
                    categorias: data.categorias || [],
                    sectores: data.sectores || [],
                    ubicaciones: data.ubicaciones || []
                });

                procesarDatosEdicion(data);
            }
        } catch (error) {
            console.error("Error cargando auxiliares:", error);
            setMsgModal({ show: true, title: "Error", message: "No se pudieron cargar las listas.", type: "error" });
        }
    };

    const procesarDatosEdicion = (datosListas) => {
        if (insumo) {
            // --- MODO EDICIÓN ---
            setFormData({
                id: insumo.id,
                codigo_sku: insumo.codigo_sku || '',
                nombre: insumo.nombre || '',
                descripcion: insumo.descripcion || '',
                categoria_id: insumo.categoria_id || '',
                stock_actual: parseFloat(insumo.stock_actual) || 0,
                stock_minimo: parseFloat(insumo.stock_minimo) || 0,
                precio_costo: parseFloat(insumo.precio_costo) || 0,
                moneda: insumo.moneda || 'CLP',
                unidad_medida: insumo.unidad_medida || 'UN'
            });

            // Lógica de Imagen
            if (insumo.imagen_url) {
                const url = insumo.imagen_url.startsWith('http') ? insumo.imagen_url : `${BASE_URL_IMAGENES}${insumo.imagen_url}`;
                setImagenPreview(url);
            } else {
                setImagenPreview(null);
            }

            // Desactivar automático al editar
            setEsAutomatico(false);

            // --- CARGAR UBICACIONES MÚLTIPLES ---
            if (insumo.stocks_json) {
                try {
                    // El backend devuelve JSON, parseamos si es string o usamos directo si es objeto
                    const parsedStocks = typeof insumo.stocks_json === 'string' 
                        ? JSON.parse(insumo.stocks_json) 
                        : insumo.stocks_json;
                    
                    if (Array.isArray(parsedStocks) && parsedStocks.length > 0) {
                        setStockLocations(parsedStocks);
                    } else {
                         // Fallback si el array está vacío pero hay stock
                        setStockLocations([{ ubicacion_id: insumo.ubicacion_defecto_id || '', cantidad: insumo.stock_actual || 0 }]);
                    }
                } catch (e) {
                    setStockLocations([{ ubicacion_id: '', cantidad: 0 }]);
                }
            } else {
                // Compatibilidad con datos antiguos (si no viene stocks_json)
                // Usamos la ubicacion_id antigua si existe en el objeto insumo
                const ubicacionAntigua = insumo.ubicacion_id || ''; 
                setStockLocations([{ ubicacion_id: ubicacionAntigua, cantidad: insumo.stock_actual || 0 }]);
            }

        } else {
            // --- MODO CREAR ---
            setFormData(initialState);
            setImagenFile(null);
            setImagenPreview(null);
            setStockLocations([{ ubicacion_id: '', cantidad: 0 }]);
            setEsAutomatico(true);
            obtenerSiguienteSku();
        }
    };

    const obtenerSiguienteSku = async () => {
        setFormData(prev => ({ ...prev, codigo_sku: 'Generando...' }));
        try {
            const res = await api.get('/index.php/insumos/next-sku');
            if (res.data.success) {
                setFormData(prev => ({ ...prev, codigo_sku: res.data.sku }));
            }
        } catch (err) {
            setFormData(prev => ({ ...prev, codigo_sku: '' }));
        }
    };

    // --- MANEJO DE UBICACIONES DINÁMICAS ---
    const handleLocationChange = (index, field, value) => {
        const newLocations = [...stockLocations];
        newLocations[index][field] = value;
        setStockLocations(newLocations);
    };

    const addLocationRow = () => {
        setStockLocations([...stockLocations, { ubicacion_id: '', cantidad: 0 }]);
    };

    const removeLocationRow = (index) => {
        const newLocations = stockLocations.filter((_, i) => i !== index);
        setStockLocations(newLocations);
    };

    // Calculamos el total visual sumando las filas
    const totalStockCalculado = stockLocations.reduce((acc, curr) => acc + (parseFloat(curr.cantidad) || 0), 0);

    // ----------------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagenFile(file);
            setImagenPreview(URL.createObjectURL(file));
        }
    };

    const handleToggleAutomatico = (e) => {
        const isAuto = e.target.checked;
        setEsAutomatico(isAuto);
        if (isAuto) obtenerSiguienteSku();
        else setFormData(prev => ({ ...prev, codigo_sku: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ubiIds = stockLocations.map(s => s.ubicacion_id).filter(id => id);
        const uniqueIds = new Set(ubiIds);
        if (ubiIds.length !== uniqueIds.size) {
            setMsgModal({ show: true, title: "Atención", message: "No puedes seleccionar la misma ubicación dos veces.", type: "warning" });
            return;
        }

        setSaving(true);
        try {
            const dataToSend = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (key !== 'id' && formData[key] !== null) {
                    dataToSend.append(key, formData[key]);
                }
            });

            dataToSend.append('stock_actual', totalStockCalculado);
            dataToSend.append('stock_distribucion', JSON.stringify(stockLocations));

            if (stockLocations.length > 0 && stockLocations[0].ubicacion_id) {
                dataToSend.append('ubicacion_id', stockLocations[0].ubicacion_id);
            }

            if (imagenFile) dataToSend.append('imagen', imagenFile);

            const url = '/index.php/insumos'; 
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };

            if (insumo) {
                dataToSend.append('id', insumo.id);
                dataToSend.append('_method', 'PUT'); 
            }
            await api.post(url, dataToSend, config);
            
            onSave();
            onClose();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Error al guardar el insumo.";
            setMsgModal({ show: true, title: "Error", message: msg, type: "error" });
        } finally {
            setSaving(false);
        }
    };

    // Helper para mostrar nombre de ubicación completo (Sector - Ubicación)
    const getUbicacionLabel = (ubi) => {
        return ubi.sector_nombre ? `${ubi.sector_nombre} - ${ubi.nombre}` : ubi.nombre;
    };

    if (!show) return null;

    return (
        <>
            <MessageModal 
                show={msgModal.show} 
                onClose={() => setMsgModal({...msgModal, show: false})} 
                title={msgModal.title} 
                message={msgModal.message} 
                type={msgModal.type} 
            />
            
            {/* Modal Overlay Manual con estilos de Bootstrap */}
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }} tabIndex="-1">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content shadow">
                        
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">
                                {insumo ? <><i className="bi bi-pencil-square me-2"></i>Editar Insumo</> : <><i className="bi bi-plus-circle me-2"></i>Nuevo Insumo</>}
                            </h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={saving}></button>
                        </div>
                        
                        <div className="modal-body">
                            <Form onSubmit={handleSubmit}>
                                <Row className="g-3">
                                    {/* SKU y Nombre */}
                                    <Col md={4}>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <Form.Label className="small fw-bold mb-0">Código SKU</Form.Label>
                                            {!insumo && (
                                                <Form.Check 
                                                    type="switch"
                                                    id="autoSkuSwitch"
                                                    label={esAutomatico ? "Auto" : "Manual"}
                                                    checked={esAutomatico}
                                                    onChange={handleToggleAutomatico}
                                                    className="small"
                                                    style={{fontSize: '0.8rem'}}
                                                />
                                            )}
                                        </div>
                                        <Form.Control 
                                            type="text" 
                                            name="codigo_sku" 
                                            value={formData.codigo_sku} 
                                            onChange={handleChange}
                                            readOnly={esAutomatico}
                                            className={`font-monospace fw-bold ${esAutomatico ? 'bg-light text-primary' : ''}`}
                                            required={!esAutomatico}
                                            placeholder={esAutomatico ? "Generando..." : "Ej: SKU-001"}
                                        />
                                    </Col>
                                    <Col md={8}>
                                        <Form.Label className="small fw-bold">Nombre <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                                    </Col>

                                    {/* Categoría y Unidad */}
                                    <Col md={6}>
                                        <Form.Label className="small fw-bold">Categoría <span className="text-danger">*</span></Form.Label>
                                        <Form.Select name="categoria_id" value={formData.categoria_id} onChange={handleChange} required>
                                            <option value="">Seleccione...</option>
                                            {listas.categorias?.map(c => (
                                                <option key={c.id} value={c.id}>{c.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="small fw-bold">Unidad Medida</Form.Label>
                                        <Form.Select name="unidad_medida" value={formData.unidad_medida} onChange={handleChange}>
                                            <option value="UN">Unidad (UN)</option>
                                            <option value="KG">Kilogramos (KG)</option>
                                            <option value="LT">Litros (LT)</option>
                                            <option value="MT">Metros (MT)</option>
                                            <option value="CAJA">Caja</option>
                                            <option value="GL">Global</option>
                                        </Form.Select>
                                    </Col>

                                    {/* --- SECCIÓN MULTI-UBICACIÓN --- */}
                                    <Col xs={12}>
                                        <div className="p-3 bg-light border rounded">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="text-primary fw-bold mb-0"><i className="bi bi-box-seam"></i> Distribución de Stock</h6>
                                                <span className="badge bg-secondary">Total: {totalStockCalculado}</span>
                                            </div>
                                            
                                            {stockLocations.map((item, index) => (
                                                <Row key={index} className="mb-2 align-items-end g-2">
                                                    <Col md={8}>
                                                        <Form.Label className="small text-muted mb-0">Ubicación</Form.Label>
                                                        <Form.Select 
                                                            value={item.ubicacion_id}
                                                            onChange={(e) => handleLocationChange(index, 'ubicacion_id', e.target.value)}
                                                            required
                                                            size="sm"
                                                        >
                                                            <option value="">Seleccione ubicación...</option>
                                                            {listas.ubicaciones?.map(u => (
                                                                <option key={u.id} value={u.id}>
                                                                    {getUbicacionLabel(u)}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                    </Col>
                                                    <Col md={3}>
                                                        <Form.Label className="small text-muted mb-0">Cantidad</Form.Label>
                                                        <Form.Control 
                                                            type="number" 
                                                            min="0" 
                                                            step="0.01"
                                                            value={item.cantidad}
                                                            onChange={(e) => handleLocationChange(index, 'cantidad', e.target.value)}
                                                            required
                                                            size="sm"
                                                        />
                                                    </Col>
                                                    <Col md={1}>
                                                        {stockLocations.length > 1 && (
                                                            <Button variant="outline-danger" size="sm" onClick={() => removeLocationRow(index)}>
                                                                <i className="bi bi-trash"></i>
                                                            </Button>
                                                        )}
                                                    </Col>
                                                </Row>
                                            ))}
                                            
                                            <Button variant="link" size="sm" className="p-0 mt-2 text-decoration-none" onClick={addLocationRow}>
                                                <i className="bi bi-plus-circle"></i> Agregar otra ubicación
                                            </Button>
                                        </div>
                                    </Col>
                                    {/* ------------------------------- */}

                                    {/* Costos y Alertas */}
                                    <Col md={4}>
                                        <Form.Label className="small fw-bold">Costo Unit.</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text">$</span>
                                            <Form.Control type="number" name="precio_costo" value={formData.precio_costo} onChange={handleChange} />
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="small fw-bold">Moneda</Form.Label>
                                        <Form.Select name="moneda" value={formData.moneda} onChange={handleChange}>
                                            <option value="CLP">CLP</option>
                                            <option value="USD">USD</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="small fw-bold text-danger">Stock Mínimo</Form.Label>
                                        <Form.Control type="number" name="stock_minimo" value={formData.stock_minimo} onChange={handleChange} />
                                    </Col>

                                    {/* Descripción e Imagen */}
                                    <Col xs={12}>
                                        <Form.Label className="small text-muted">Descripción</Form.Label>
                                        <Form.Control as="textarea" rows={2} name="descripcion" value={formData.descripcion} onChange={handleChange} />
                                    </Col>
                                    
                                    <Col xs={12}>
                                        <Form.Label className="small fw-bold">Imagen</Form.Label>
                                        <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                                        {imagenPreview && (
                                            <div className="mt-2 text-center border rounded p-1 bg-light">
                                                <img src={imagenPreview} style={{ maxHeight: '100px', objectFit: 'contain' }} alt="Preview" />
                                            </div>
                                        )}
                                    </Col>
                                </Row>

                                <div className="modal-footer border-0 mt-3 p-0">
                                    <Button variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
                                    <Button variant="primary" type="submit" disabled={saving}>
                                        {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="bi bi-save me-2"></i>Guardar</>}
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InsumoModal;