const Dashboard = () => {
    return (
        <div>
            <h2 className="mb-4">Panel de Control</h2>
            
            <div className="row g-4">
                {/* Tarjeta de Resumen 1 */}
                <div className="col-md-3">
                    <div className="card text-white bg-primary h-100">
                        <div className="card-body">
                            <h5 className="card-title">Solicitudes Pendientes</h5>
                            <p className="card-text display-6 fw-bold">12</p>
                            <small>3 urgentes</small>
                        </div>
                    </div>
                </div>

                {/* Tarjeta de Resumen 2 */}
                <div className="col-md-3">
                    <div className="card text-white bg-success h-100">
                        <div className="card-body">
                            <h5 className="card-title">Stock Saludable</h5>
                            <p className="card-text display-6 fw-bold">95%</p>
                            <small>Ítems OK</small>
                        </div>
                    </div>
                </div>

                {/* Tarjeta de Resumen 3 */}
                <div className="col-md-3">
                    <div className="card text-white bg-warning h-100">
                        <div className="card-body">
                            <h5 className="card-title">Bajo Stock</h5>
                            <p className="card-text display-6 fw-bold text-dark">8</p>
                            <small className="text-dark">Requieren compra</small>
                        </div>
                    </div>
                </div>

                {/* Tarjeta de Resumen 4 */}
                <div className="col-md-3">
                    <div className="card text-white bg-danger h-100">
                        <div className="card-body">
                            <h5 className="card-title">Órdenes Atrasadas</h5>
                            <p className="card-text display-6 fw-bold">2</p>
                            <small>Contactar proveedor</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-5">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Actividad Reciente</h5>
                        </div>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">Nicolas creó la OT #293 para Prensa Hidráulica.</li>
                            <li className="list-group-item">Llegada parcial de OC #105 (Induslab).</li>
                            <li className="list-group-item">Stock crítico detectado en: Válvulas Inoxidables.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;