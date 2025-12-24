import React from 'react';

const MessageModal = ({ show, onClose, title, message, type = 'info' }) => {
    if (!show) return null;

    const headerClass = type === 'error' ? 'bg-danger text-white' :
        type === 'success' ? 'bg-success text-white' :
            'bg-primary text-white';

    const icon = type === 'error' ? 'bi-exclamation-triangle-fill' :
        type === 'success' ? 'bi-check-circle-fill' :
            'bi-info-circle-fill';

    const btnClass = type === 'error' ? 'btn-outline-danger' :
        type === 'success' ? 'btn-outline-success' :
            'btn-primary';

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow border-0">

                    {/* Encabezado con color dinámico */}
                    <div className={`modal-header ${headerClass}`}>
                        <h5 className="modal-title fw-bold">
                            <i className={`bi ${icon} me-2`}></i>{title}
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onClose}
                            aria-label="Cerrar"
                        ></button>
                    </div>

                    {/* Cuerpo del mensaje */}
                    <div className="modal-body p-4 text-center">
                        <p className="fs-5 mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                            {message}
                        </p>
                    </div>

                    {/* Botón de acción */}
                    <div className="modal-footer border-0 justify-content-center pb-4">
                        <button
                            type="button"
                            className={`btn ${btnClass} px-4 fw-bold`}
                            onClick={onClose}
                        >
                            Entendido
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MessageModal;