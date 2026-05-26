import React from 'react';

const VideoModal = ({ show, onClose, videoUrl }) => {
    if (!show || !videoUrl) return null;

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center animate__animated animate__fadeIn"
            style={{ backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1100 }}
            onClick={onClose}
        >
            <div className="position-relative p-2 w-100" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
                <button
                    className="btn btn-light position-absolute top-0 end-0 m-3 rounded-circle shadow-sm d-flex justify-content-center align-items-center"
                    style={{ zIndex: 1101, width: '40px', height: '40px', transform: 'translate(30%, -30%)' }}
                    onClick={onClose}
                >
                    <i className="bi bi-x-lg text-dark fw-bold"></i>
                </button>
                <div className="bg-black rounded-3 overflow-hidden shadow-lg border border-secondary border-opacity-25 p-1">
                    <video 
                        src={videoUrl} 
                        controls 
                        autoPlay 
                        playsInline 
                        className="w-100 d-block rounded" 
                        style={{ maxHeight: '75vh' }} 
                    />
                </div>
            </div>
        </div>
    );
};

export default VideoModal;