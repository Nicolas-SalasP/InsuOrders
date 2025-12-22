import { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    // Estado para controlar si el menú móvil está abierto o cerrado
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="d-flex vw-100 vh-100 overflow-hidden bg-light position-relative">
            
            {/* --- OVERLAY OSCURO (Solo móvil) --- */}
            {/* Fondo negro semitransparente que aparece al abrir el menú en móvil */}
            {isMobileMenuOpen && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
                    style={{ zIndex: 1040 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* --- SIDEBAR CONTAINER --- */}
            {/* En Escritorio (d-md-block): Se ve siempre, posición relativa.
                En Móvil (d-md-none): Se oculta por defecto. Si isMobileMenuOpen es true, se muestra fixed.
            */}
            <div 
                className={`flex-shrink-0 h-100 bg-dark shadow-sm transition-all ${isMobileMenuOpen ? 'd-block position-fixed top-0 start-0' : 'd-none d-md-block position-relative'}`}
                style={{ zIndex: 1050 }}
            >
                <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="flex-grow-1 h-100 overflow-auto w-100 d-flex flex-column">
                
                {/* BARRA SUPERIOR MÓVIL (Solo visible en pantallas chicas < 768px) */}
                <div className="d-md-none bg-white p-3 shadow-sm d-flex align-items-center justify-content-between sticky-top">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-box-seam fs-4 text-primary me-2"></i>
                        <span className="fw-bold fs-5 text-dark">InsuOrders</span>
                    </div>
                    <button 
                        className="btn btn-outline-dark btn-sm border-0" 
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <i className="bi bi-list fs-2"></i>
                    </button>
                </div>

                {/* El Outlet donde se renderizan las páginas */}
                <div className="container-fluid p-3 p-md-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;