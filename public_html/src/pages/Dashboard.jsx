import { useEffect, useState, useContext } from 'react';
import api from '../api/axiosConfig';
import AuthContext from '../context/AuthContext';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

const Dashboard = () => {
    const { auth } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Filtros de fecha y empleado
    const [fechas, setFechas] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [empleadoFilter, setEmpleadoFilter] = useState('');

    // --- LÓGICA DE PERMISOS ESTRICTA ---
    // dash_resumen, dash_compras, dash_mantencion, dash_bodega
    const can = (permiso) => {
        if (auth.rol === 'Admin' || auth.rol === 1) return true;
        return auth.permisos && auth.permisos.includes(permiso);
    };

    useEffect(() => {
        cargarDatos();
    }, [fechas, empleadoFilter]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/index.php/dashboard/analytics?start=${fechas.start}&end=${fechas.end} 23:59:59&empleado_id=${empleadoFilter}`);
            if(res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error("Error Dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- SECCIÓN 0: RESUMEN SUPERIOR (KPIs) ---
    const renderResumenSuperior = () => (
        <div className="row g-3 mb-5 animate__animated animate__fadeIn">
            <div className="col-12 col-sm-6 col-lg-3">
                <div className="card border-0 shadow-sm border-start border-4 border-primary h-100">
                    <div className="card-body">
                        <h6 className="text-muted text-uppercase small fw-bold">Gasto Total</h6>
                        <h3 className="fw-bold text-dark mb-0">${parseInt(data.kpis?.total_gasto || 0).toLocaleString()}</h3>
                    </div>
                </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
                <div className="card border-0 shadow-sm border-start border-4 border-warning h-100">
                    <div className="card-body">
                        <h6 className="text-muted text-uppercase small fw-bold">OTs Totales</h6>
                        <h3 className="fw-bold text-dark mb-0">{data.kpis?.total_ots || 0}</h3>
                    </div>
                </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
                <div className="card border-0 shadow-sm border-start border-4 border-danger h-100">
                    <div className="card-body">
                        <h6 className="text-muted text-uppercase small fw-bold">Stock Crítico</h6>
                        <h3 className="fw-bold text-danger mb-0">{data.kpis?.stock_bajo || 0} <small className="fs-6 text-muted">items</small></h3>
                    </div>
                </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
                <div className="card border-0 shadow-sm border-start border-4 border-success h-100">
                    <div className="card-body">
                        <h6 className="text-muted text-uppercase small fw-bold">Proveedores</h6>
                        <h3 className="fw-bold text-dark mb-0">{data.kpis?.proveedores_activos || 0}</h3>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- SECCIÓN 1: GESTIÓN DE COMPRAS ---
    const renderCompras = () => (
        <div className="mb-5 animate__animated animate__fadeIn">
            <h5 className="text-secondary border-bottom pb-2 mb-3"><i className="bi bi-cart3 me-2"></i>Gestión de Compras</h5>
            <div className="row g-4 mb-4">
                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center d-flex flex-column justify-content-center">
                            <h6 className="text-muted">Inversión en el Periodo</h6>
                            <h2 className="fw-bold text-primary display-6">${parseInt(data.kpis?.total_gasto || 0).toLocaleString()}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-bold py-3 border-0">📉 Tendencia de Gasto</div>
                        <div className="card-body" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.compras?.tendencia_gasto || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="mes" style={{ fontSize: '12px' }} />
                                    <YAxis style={{ fontSize: '12px' }} />
                                    <Tooltip formatter={(v) => `$${parseInt(v).toLocaleString()}`} />
                                    <Legend />
                                    <Line type="monotone" dataKey="total" stroke="#0d6efd" name="Gasto $" strokeWidth={3} dot={{r: 4}} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-bold py-3 border-0">🏆 Top Proveedores</div>
                        <div className="card-body" style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={data.compras?.top_proveedores || []} margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="nombre" type="category" width={100} style={{fontSize: '11px'}} />
                                    <Tooltip formatter={(v) => `$${parseInt(v).toLocaleString()}`} />
                                    <Bar dataKey="total" fill="#198754" name="Monto $" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-bold py-3 border-0">📦 Top Productos (Inversión)</div>
                        <div className="card-body" style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.compras?.top_insumos_comprados || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="nombre" style={{fontSize: '10px'}} interval={0} angle={-15} textAnchor="end" height={60} />
                                    <YAxis style={{ fontSize: '11px' }} />
                                    <Tooltip formatter={(v) => `$${parseInt(v).toLocaleString()}`} />
                                    <Bar dataKey="total_gasto" fill="#6610f2" name="Total Invertido" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- SECCIÓN 2: GESTIÓN DE MANTENCIÓN ---
    const renderMantencion = () => (
        <div className="mb-5 animate__animated animate__fadeIn">
            <h5 className="text-secondary border-bottom pb-2 mb-3"><i className="bi bi-wrench me-2"></i>Gestión de Mantención</h5>
            <div className="row g-4 mb-4">
                <div className="col-12 col-xl-6">
                    <div className="row g-3 h-100">
                        <div className="col-12 col-sm-6">
                            <div className="card bg-primary text-white border-0 shadow-sm h-100">
                                <div className="card-body text-center d-flex flex-column justify-content-center py-4">
                                    <h6>Solicitudes OT</h6>
                                    <h1 className="fw-bold display-4 mb-0">{data.kpis?.total_ots || 0}</h1>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6">
                            <div className="card bg-warning text-dark border-0 shadow-sm h-100">
                                <div className="card-body text-center d-flex flex-column justify-content-center py-4">
                                    <h6>Insumos Usados</h6>
                                    <h1 className="fw-bold display-4 mb-0">{parseInt(data.kpis?.insumos_usados || 0)}</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-xl-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-bold py-3 border-0">🚨 Máquinas Críticas</div>
                        <div className="card-body" style={{ height: '250px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.mantencion?.top_maquinas || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="nombre" style={{fontSize: '10px'}} interval={0} />
                                    <YAxis allowDecimals={false} style={{ fontSize: '12px' }} />
                                    <Tooltip />
                                    <Bar dataKey="total_ots" fill="#ff7300" name="Cantidad OTs" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-bold py-3 border-0">🔧 Insumos Más Usados</div>
                        <div className="card-body" style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.mantencion?.insumos_mas_usados || []} layout="vertical" margin={{left: 20}}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="nombre" type="category" width={120} style={{fontSize: '11px'}} />
                                    <Tooltip />
                                    <Bar dataKey="cantidad" fill="#0088FE" name="Unidades" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-bold py-3 border-0">🔄 Entregas vs Devoluciones</div>
                        <div className="card-body d-flex justify-content-center align-items-center" style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Entregas', value: parseInt(data.mantencion?.ratio_devolucion?.entregas || 0) },
                                            { name: 'Devoluciones', value: parseInt(data.mantencion?.ratio_devolucion?.devoluciones || 0) }
                                        ]}
                                        cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value"
                                    >
                                        <Cell fill="#00C49F" stroke="none" />
                                        <Cell fill="#FF8042" stroke="none" />
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- SECCIÓN 3: GESTIÓN DE BODEGA ---
    const renderBodega = () => (
        <div className="mb-5 animate__animated animate__fadeIn">
            <h5 className="text-secondary border-bottom pb-2 mb-3"><i className="bi bi-box-seam me-2"></i>Gestión de Bodega</h5>
            <div className="row g-4 mb-4">
                <div className="col-12 col-md-6">
                    <div className="row g-3">
                        <div className="col-6">
                            <div className="card bg-warning bg-opacity-10 border-warning border-0 h-100">
                                <div className="card-body text-center">
                                    <h6 className="text-warning fw-bold text-uppercase small">Por Entregar</h6>
                                    <h2 className="display-5 fw-bold text-dark mb-0">{data.bodega?.entregas_pendientes || 0}</h2>
                                    <small className="text-muted">Ítems en espera</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card bg-danger bg-opacity-10 border-danger border-0 h-100">
                                <div className="card-body text-center">
                                    <h6 className="text-danger fw-bold text-uppercase small">Stock Crítico</h6>
                                    <h2 className="display-5 fw-bold text-dark mb-0">{data.kpis?.stock_bajo || 0}</h2>
                                    <small className="text-muted">Bajo el mínimo</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card border-0 shadow-sm mt-3">
                        <div className="card-header bg-white fw-bold py-3 border-0">👷‍♂️ Top Receptores (Más Insumos)</div>
                        <div className="card-body" style={{ height: '250px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.bodega?.top_receptores || []} layout="vertical" margin={{ left: 40, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="nombre" type="category" width={100} style={{ fontSize: '11px', fontWeight: 'bold' }} />
                                    <Tooltip cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="total_items" fill="#ffc107" radius={[0, 4, 4, 0]} barSize={25} name="Total Retirado" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-bold py-3 d-flex justify-content-between align-items-center border-0">
                            <span>🚚 Últimas Entregas Realizadas</span>
                            {empleadoFilter && <span className="badge bg-primary">Filtrado</span>}
                        </div>
                        <div className="card-body p-0 overflow-auto custom-scrollbar" style={{ maxHeight: '450px' }}>
                            {data.bodega?.timeline_entregas?.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {data.bodega.timeline_entregas.map((log, idx) => (
                                        <li key={idx} className="list-group-item px-4 py-3 border-bottom-0 border-top">
                                            <div className="d-flex">
                                                <div className="d-flex flex-column align-items-center me-3" style={{minWidth: '50px'}}>
                                                    <span className="fw-bold text-dark" style={{fontSize: '1.1rem'}}>
                                                        {new Date(log.fecha_entrega).getDate()}
                                                    </span>
                                                    <span className="text-uppercase text-muted small" style={{fontSize: '0.7rem'}}>
                                                        {new Date(log.fecha_entrega).toLocaleDateString('es-ES', { month: 'short' })}
                                                    </span>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <h6 className="mb-1 fw-bold text-primary">{log.insumo}</h6>
                                                        <span className="badge bg-success bg-opacity-10 text-success border border-success">
                                                            - {parseFloat(log.cantidad)} {log.unidad_medida}
                                                        </span>
                                                    </div>
                                                    <div className="text-muted small">
                                                        <i className="bi bi-person me-1"></i> Recibió: <strong>{log.retirado_por}</strong>
                                                    </div>
                                                    {log.ot_id && <div className="text-muted small mt-1"><i className="bi bi-ticket-detailed me-1"></i> OT #{log.ot_id}</div>}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-5 text-muted">Sin movimientos registrados.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container-fluid p-3 p-md-4 bg-light min-vh-100">
            {/* HEADER PRINCIPAL */}
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center mb-5 gap-3">
                <div>
                    <h3 className="fw-bold text-dark mb-0">Dashboard Operativo</h3>
                    <p className="text-muted small mb-0">Indicadores clave de gestión</p>
                </div>
                
                <div className="d-flex flex-wrap gap-2 justify-content-end bg-white p-2 rounded shadow-sm">
                    {/* FILTRO TÉCNICO (dash_bodega) */}
                    {can('dash_bodega') && data?.bodega?.lista_empleados && (
                        <select className="form-select form-select-sm border-0 bg-light fw-600" style={{maxWidth: '180px'}} 
                            value={empleadoFilter} onChange={e => setEmpleadoFilter(e.target.value)}>
                            <option value="">Todos los Técnicos</option>
                            {data.bodega.lista_empleados.map(e => (
                                <option key={e.id} value={e.id}>{e.nombre_completo}</option>
                            ))}
                        </select>
                    )}

                    {/* FILTRO FECHAS */}
                    <div className="input-group input-group-sm" style={{ maxWidth: '320px' }}>
                        <input type="date" className="form-control border-0 bg-light" value={fechas.start} onChange={e => setFechas({...fechas, start: e.target.value})} />
                        <span className="input-group-text border-0 bg-light text-muted">al</span>
                        <input type="date" className="form-control border-0 bg-light" value={fechas.end} onChange={e => setFechas({...fechas, end: e.target.value})} />
                        <button className="btn btn-primary btn-sm px-3 ms-2 rounded" onClick={cargarDatos}><i className="bi bi-arrow-repeat"></i></button>
                    </div>
                </div>
            </div>

            {loading || !data ? (
                <div className="text-center py-5">
                    <div className="spinner-grow text-primary" role="status"></div>
                    <div className="mt-2 text-muted small">Actualizando indicadores...</div>
                </div>
            ) : (
                <>
                    {/* 0. RESUMEN SUPERIOR (dash_resumen) */}
                    {can('dash_resumen') && renderResumenSuperior()}

                    {/* 1. SECCIÓN COMPRAS (dash_compras) */}
                    {can('dash_compras') && data.compras && renderCompras()}

                    {/* 2. SECCIÓN MANTENCIÓN (dash_mantencion) */}
                    {can('dash_mantencion') && data.mantencion && renderMantencion()}

                    {/* 3. SECCIÓN BODEGA (dash_bodega) */}
                    {can('dash_bodega') && data.bodega && renderBodega()}
                </>
            )}
        </div>
    );
};

export default Dashboard;