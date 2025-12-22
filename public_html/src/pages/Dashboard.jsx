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
    
    // Fechas (Por defecto mes actual)
    const [fechas, setFechas] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        cargarDatos();
    }, [fechas]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/index.php/dashboard/analytics?start=${fechas.start}&end=${fechas.end} 23:59:59`);
            if(res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- VISTA COMPRAS ---
    const renderCompras = () => (
        <div className="row g-4 mb-4">
            <div className="col-12 col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-body text-center d-flex flex-column justify-content-center">
                        <h6 className="text-muted">Gasto Total (Periodo)</h6>
                        <h2 className="fw-bold text-primary display-6">${parseInt(data.kpis?.gasto_total || 0).toLocaleString()}</h2>
                    </div>
                </div>
            </div>
            <div className="col-12 col-lg-8">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white fw-bold py-3">📉 Tendencia de Gasto</div>
                    <div className="card-body" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.compras?.tendencia_gasto || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" style={{ fontSize: '12px' }} />
                                <YAxis style={{ fontSize: '12px' }} />
                                <Tooltip formatter={(value) => `$${parseInt(value).toLocaleString()}`} />
                                <Legend />
                                <Line type="monotone" dataKey="total" stroke="#8884d8" name="Gasto $" activeDot={{ r: 8 }} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white fw-bold py-3">🏆 Top Proveedores</div>
                    <div className="card-body" style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={data.compras?.top_proveedores || []} margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="nombre" type="category" width={100} style={{fontSize: '11px'}} />
                                <Tooltip formatter={(value) => `$${parseInt(value).toLocaleString()}`} cursor={{fill: 'transparent'}} />
                                <Bar dataKey="total" fill="#82ca9d" name="Monto Comprado" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white fw-bold py-3">📦 Top Productos ($)</div>
                    <div className="card-body" style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.compras?.top_insumos_comprados || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="nombre" style={{fontSize: '10px'}} interval={0} angle={-15} textAnchor="end" height={60} />
                                <YAxis style={{ fontSize: '11px' }} />
                                <Tooltip formatter={(value) => `$${parseInt(value).toLocaleString()}`} cursor={{fill: 'transparent'}} />
                                <Bar dataKey="total_gasto" fill="#8884d8" name="Inversión" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- VISTA MANTENCIÓN ---
    const renderMantencion = () => (
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
                    <div className="card-header bg-white fw-bold py-3">🚨 Máquinas Críticas</div>
                    <div className="card-body" style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.mantencion?.top_maquinas || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="nombre" style={{fontSize: '10px'}} interval={0} />
                                <YAxis allowDecimals={false} style={{ fontSize: '12px' }} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="total_ots" fill="#ff7300" name="Cantidad OTs" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="col-12 col-lg-8">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white fw-bold py-3">🔧 Insumos Más Usados</div>
                    <div className="card-body" style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.mantencion?.insumos_mas_usados || []} layout="vertical" margin={{left: 20}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="nombre" type="category" width={120} style={{fontSize: '11px'}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="cantidad" fill="#0088FE" name="Unidades Usadas" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="col-12 col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white fw-bold py-3">🔄 Entregas vs Devoluciones</div>
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
                                    <Cell fill="#00C49F" />
                                    <Cell fill="#FF8042" />
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container-fluid p-3 p-md-4">
            
            {/* === HEADER MEJORADO === */}
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center mb-4 gap-3">
                
                {/* Título */}
                <div className="d-flex align-items-center w-100 w-lg-auto mb-2 mb-lg-0">
                    <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary d-none d-md-block">
                        <i className="bi bi-speedometer2 fs-4"></i>
                    </div>
                    <div>
                        <h3 className="fw-bold text-dark mb-0">Dashboard</h3>
                        <p className="text-muted small mb-0 d-none d-md-block">Vista general del sistema</p>
                    </div>
                </div>
                
                {/* CORRECCIÓN CLAVE:
                   - Usamos 'col-12' para ancho total en móvil.
                   - Usamos 'col-lg-auto' para ancho automático en escritorio (quita el espacio morado).
                   - Usamos 'ms-lg-auto' para empujarlo a la derecha.
                */}
                <div className="col-12 col-lg-auto ms-lg-auto">
                    <div className="input-group input-group-sm">
                        
                        <span className="input-group-text border-end-0 text-primary">
                            <i className="bi bi-calendar-range"></i>
                        </span>
                        
                        <input 
                            type="date" 
                            className="form-control form-control-sm border-start-0 border-end-0 text-center" 
                            style={{ maxWidth: '130px' }} 
                            value={fechas.start} 
                            onChange={e => setFechas({...fechas, start: e.target.value})} 
                        />
                        
                        <span className="input-group-text border-start-0 border-end-0 text-muted px-2">al</span>
                        
                        <input 
                            type="date" 
                            className="form-control form-control-sm border-start-0 text-center" 
                            style={{ maxWidth: '130px' }}
                            value={fechas.end} 
                            onChange={e => setFechas({...fechas, end: e.target.value})} 
                        />
                        
                        <button className="btn btn-primary btn-sm px-3" onClick={cargarDatos} title="Aplicar Filtro">
                            <i className="bi bi-funnel-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
            {/* ======================= */}

            {loading || !data ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : (
                <>
                    <div className="row g-3 mb-5">
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card border-0 shadow-sm border-start border-4 border-primary h-100">
                                <div className="card-body">
                                    <h6 className="text-muted text-uppercase small fw-bold">Gasto Total</h6>
                                    <h3 className="fw-bold text-dark mb-0">${parseInt(data.general?.total_gasto || 0).toLocaleString()}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card border-0 shadow-sm border-start border-4 border-warning h-100">
                                <div className="card-body">
                                    <h6 className="text-muted text-uppercase small fw-bold">OTs Totales</h6>
                                    <h3 className="fw-bold text-dark mb-0">{data.general?.total_ots || 0}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card border-0 shadow-sm border-start border-4 border-danger h-100">
                                <div className="card-body">
                                    <h6 className="text-muted text-uppercase small fw-bold">Stock Crítico</h6>
                                    <h3 className="fw-bold text-danger mb-0">{data.general?.stock_bajo || 0} <small className="fs-6 text-muted">items</small></h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card border-0 shadow-sm border-start border-4 border-success h-100">
                                <div className="card-body">
                                    <h6 className="text-muted text-uppercase small fw-bold">Proveedores</h6>
                                    <h3 className="fw-bold text-dark mb-0">{data.general?.proveedores_activos || 0}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(auth.rol === 'Admin' || auth.rol === 'Compras') && (
                        <div className="mb-5">
                            <h5 className="text-secondary border-bottom pb-2 mb-3"><i className="bi bi-cart3 me-2"></i>Gestión de Compras</h5>
                            {renderCompras()}
                        </div>
                    )}

                    {(auth.rol === 'Admin' || auth.rol === 'Mantencion') && (
                        <div>
                            <h5 className="text-secondary border-bottom pb-2 mb-3"><i className="bi bi-wrench me-2"></i>Gestión de Mantención</h5>
                            {renderMantencion()}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Dashboard;