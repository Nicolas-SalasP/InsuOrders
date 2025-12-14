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

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

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
            {/* Gasto Total */}
            <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-body text-center">
                        <h6 className="text-muted">Gasto Total (Periodo)</h6>
                        <h2 className="fw-bold text-primary">${parseInt(data.kpis?.gasto_total || 0).toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            {/* Gráfico Tendencia Gasto (Línea) */}
            <div className="col-md-8">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white fw-bold">📉 Tendencia de Gasto (Últimos 6 Meses)</div>
                    <div className="card-body" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.compras?.tendencia_gasto || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip formatter={(value) => `$${parseInt(value).toLocaleString()}`} />
                                <Legend />
                                <Line type="monotone" dataKey="total" stroke="#8884d8" name="Gasto $" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Proveedores (Barras) */}
            <div className="col-md-6">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white fw-bold">🏆 Top Proveedores (Gasto)</div>
                    <div className="card-body" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={data.compras?.top_proveedores || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="nombre" type="category" width={100} style={{fontSize: '12px'}} />
                                <Tooltip formatter={(value) => `$${parseInt(value).toLocaleString()}`} />
                                <Bar dataKey="total" fill="#82ca9d" name="Monto Comprado" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Insumos (Barras) */}
            <div className="col-md-6">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white fw-bold">📦 Top Productos Comprados ($)</div>
                    <div className="card-body" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.compras?.top_insumos_comprados || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="nombre" style={{fontSize: '10px'}} interval={0} />
                                <YAxis />
                                <Tooltip formatter={(value) => `$${parseInt(value).toLocaleString()}`} />
                                <Bar dataKey="total_gasto" fill="#8884d8" name="Inversión" />
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
            {/* KPIs Rápidos */}
            <div className="col-md-6">
                <div className="row g-3">
                    <div className="col-6">
                        <div className="card bg-primary text-white border-0 shadow-sm h-100">
                            <div className="card-body text-center">
                                <h6>Solicitudes OT</h6>
                                <h1 className="fw-bold">{data.kpis?.total_ots || 0}</h1>
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="card bg-warning text-dark border-0 shadow-sm h-100">
                            <div className="card-body text-center">
                                <h6>Insumos Usados</h6>
                                <h1 className="fw-bold">{parseInt(data.kpis?.insumos_usados || 0)}</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Máquinas Críticas */}
            <div className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white fw-bold">🚨 Máquinas con más Mantenciones</div>
                    <div className="card-body" style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.mantencion?.top_maquinas || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="nombre" style={{fontSize: '11px'}} />
                                {/* AQUÍ ESTABA EL ERROR: Corregido a YAxis con prop allowDecimals */}
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="total_ots" fill="#ff7300" name="Cantidad OTs" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Insumos más gastados */}
            <div className="col-md-8">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white fw-bold">🔧 Insumos Más Usados (Cantidad)</div>
                    <div className="card-body" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.mantencion?.insumos_mas_usados || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="nombre" type="category" width={150} style={{fontSize: '11px'}} />
                                <Tooltip />
                                <Bar dataKey="cantidad" fill="#0088FE" name="Unidades Usadas" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Ratio Devoluciones */}
            <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white fw-bold">🔄 Devoluciones vs Entregas</div>
                    <div className="card-body d-flex justify-content-center" style={{ height: '300px' }}>
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
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark"><i className="bi bi-speedometer2 me-2"></i>Dashboard de Control</h3>
                
                {/* Filtro de Fechas */}
                <div className="d-flex gap-2">
                    <input type="date" className="form-control form-control-sm" 
                        value={fechas.start} onChange={e => setFechas({...fechas, start: e.target.value})} />
                    <span className="align-self-center text-muted">-</span>
                    <input type="date" className="form-control form-control-sm" 
                        value={fechas.end} onChange={e => setFechas({...fechas, end: e.target.value})} />
                    <button className="btn btn-primary btn-sm" onClick={cargarDatos}><i className="bi bi-filter"></i></button>
                </div>
            </div>

            {loading || !data ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : (
                <>
                    {/* KPI CARDS GENERALES */}
                    <div className="row g-3 mb-5">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm border-start border-4 border-primary">
                                <div className="card-body">
                                    <h6 className="text-muted text-uppercase small">Gasto Total</h6>
                                    <h3 className="fw-bold text-dark">${parseInt(data.general?.total_gasto || 0).toLocaleString()}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm border-start border-4 border-warning">
                                <div className="card-body">
                                    <h6 className="text-muted text-uppercase small">OTs Totales</h6>
                                    <h3 className="fw-bold text-dark">{data.general?.total_ots || 0}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm border-start border-4 border-danger">
                                <div className="card-body">
                                    <h6 className="text-muted text-uppercase small">Stock Crítico</h6>
                                    <h3 className="fw-bold text-danger">{data.general?.stock_bajo || 0} <small className="fs-6 text-muted">items</small></h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm border-start border-4 border-success">
                                <div className="card-body">
                                    <h6 className="text-muted text-uppercase small">Proveedores</h6>
                                    <h3 className="fw-bold text-dark">{data.general?.proveedores_activos || 0}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* VISTA CONDICIONAL SEGÚN ROL */}
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