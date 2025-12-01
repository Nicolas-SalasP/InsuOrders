const ConfirmModal = ({ show, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", type = "danger" }) => {
    if (!show) return null;

    const headerClass = type === 'danger' ? 'bg-danger text-white' : 
                        type === 'warning' ? 'bg-warning text-dark' : 
                        'bg-primary text-white';

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow border-0">
                    <div className={`modal-header ${headerClass}`}>
                        <h5 className="modal-title fw-bold">{title}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4 text-center">
                        <i className={`bi ${type === 'danger' ? 'bi-exclamation-octagon' : 'bi-question-circle'} display-4 text-${type} mb-3`}></i>
                        <p className="fs-5 mb-0">{message}</p>
                    </div>
                    <div className="modal-footer border-0 justify-content-center pb-4">
                        <button type="button" className="btn btn-secondary px-4" onClick={onClose}>
                            {cancelText}
                        </button>
                        <button type="button" className={`btn btn-${type} px-4 fw-bold`} onClick={onConfirm}>
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;