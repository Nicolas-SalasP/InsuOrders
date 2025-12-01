const MessageModal = ({ show, onClose, title, message, type = 'info' }) => {
    if (!show) return null;

    const headerClass = type === 'error' ? 'bg-danger text-white' :
        type === 'success' ? 'bg-success text-white' :
            'bg-primary text-white';

    const icon = type === 'error' ? 'bi-exclamation-triangle-fill' :
        type === 'success' ? 'bi-check-circle-fill' :
            'bi-info-circle-fill';

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow border-0">
                    <div className={`modal-header ${headerClass}`}>
                        <h5 className="modal-title fw-bold">
                            <i className={`bi ${icon} me-2`}></i>{title}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4 text-center">
                        <p className="fs-5 mb-0">{message}</p>
                    </div>
                    <div className="modal-footer border-0 justify-content-center pb-4">
                        <button type="button" className={`btn ${type === 'error' ? 'btn-outline-danger' : 'btn-primary'} px-4`} onClick={onClose}>
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageModal;