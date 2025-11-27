import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="d-flex vw-100 vh-100 overflow-hidden bg-light">
            <div className="flex-shrink-0 h-100 shadow-sm" style={{ zIndex: 1000 }}>
                <Sidebar />
            </div>
            <div className="flex-grow-1 h-100 overflow-auto w-100">
                <div className="container-fluid p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;