import React, { useState } from 'react';
import VideoModal from './VideoModal';

const DetalleSolicitudClienteModal = ({ show, onClose, solicitud, getBadgeColor }) => {
    const [enlargedImage, setEnlargedImage] = useState(null);
    const [videoModalUrl, setVideoModalUrl] = useState(null);

    if (!show || !solicitud) return null;

    const renderEvidenciasGrid = (evidenciaStr) => {
        if (!evidenciaStr) return <span className="text-muted small fst-italic">Sin evidencias adjuntas.</span>;

        let archivos = [];
        try {
            archivos = JSON.parse(evidenciaStr);
            if (!Array.isArray(archivos)) archivos = [evidenciaStr];
        } catch (e) {
            archivos = [evidenciaStr];
        }

        return (
            <div className="d-flex flex-wrap gap-2 mt-2">
                {archivos.map((url, idx) => {
                    const isVideo = /\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?.*)?$/i.test(url || '');
                    return isVideo ? (
                        <div 
                            key={idx} 
                            className="position-relative border rounded shadow-sm bg-dark cursor-pointer overflow-hidden d-flex align-items-center justify-content-center" 
                            style={{ width: '120px', height: '90px' }}
                            onClick={() => setVideoModalUrl(`/api/${url}`)}
                            title="Clic para reproducir video"
                        >
                            <video src={`/api/${url}`} preload="metadata" className="w-100 h-100 opacity-60 object-fit-cover" />
                            <div className="position-absolute top-50 start-50 translate-middle text-warning">
                                <i className="bi bi-play-circle-fill fs-2"></i>
                            </div>
                        </div>
                    ) : (
                        <img
                            key={idx}
                            src={`/api/${url}`}
                            alt={`Evidencia ${idx + 1}`}
                            className="rounded border shadow-sm cursor-pointer image-hover"
                            style={{ width: '120px', height: '90px', objectFit: 'cover' }}
                            onClick={() => setEnlargedImage(`/api/${url}`)}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <>
            {/* Zoom de Foto Interno */}
            {enlargedImage && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center animate__animated animate__fadeIn" 
                    style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1150 }} 
                    onClick={() => setEnlargedImage(null)}
                >
                    <div className="position-relative text-center p-3">
                        <img src={enlargedImage} alt="Ampliación" className="img-fluid rounded shadow-lg" style={{ maxHeight: '90vh', objectFit: 'contain' }} />
                    </div>
                </div>
            )}

            {/* Modal de Video Interno Reutilizado */}
            <VideoModal show={!!videoModalUrl} onClose={() => setVideoModalUrl(null)} videoUrl={videoModalUrl} />

            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header bg-white border-bottom py-3">
                            <h5 className="modal-title fw-bold text-dark">
                                <i className="bi bi-file-earmark-text text-primary me-2 fs-4"></i>
                                Detalle de Solicitud #{solicitud.id}
                            </h5>
                            <button className="btn-close" onClick={onClose}></button>
                        </div>

                        <div className="modal-body bg-white p-4">
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 p-3 bg-light rounded-3 border">
                                <div>
                                    <span className="text-muted small text-uppercase d-block fw-bold">Estado actual</span>
                                    <span className={`badge ${getBadgeColor(solicitud.state || solicitud.estado)} px-3 py-2 rounded-pill mt-1 shadow-sm`}>
                                        {solicitud.estado}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted small text-uppercase d-block fw-bold text-md-end">Técnico Asignado</span>
                                    <span className="fw-bold text-dark d-block mt-1">
                                        <i className="bi bi-person-badge text-primary me-1"></i>
                                        {solicitud.tecnico_asignado || 'Sin Asignar'}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h6 className="text-muted text-uppercase fw-bold border-bottom pb-2" style={{ fontSize: '0.85rem' }}>Ficha del Equipo</h6>
                                <div className="p-3 bg-light rounded-3 border">
                                    <div className="fs-5 fw-bold text-dark">{solicitud.activo_nombre || 'Servicio General'}</div>
                                    {solicitud.activo_codigo && <div className="font-monospace text-primary small fw-bold">{solicitud.activo_codigo}</div>}
                                    {solicitud.ubicacion && (
                                        <div className="small text-secondary mt-2">
                                            <i className="bi bi-geo-alt-fill text-danger me-1"></i> {solicitud.ubicacion}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <h6 className="text-muted text-uppercase fw-bold border-bottom pb-2" style={{ fontSize: '0.85rem' }}>Problema Reportado</h6>
                                <h5 className="fw-bold text-dark mt-2">{solicitud.titulo}</h5>
                                <p className="p-3 bg-light rounded-3 border text-secondary mb-3 shadow-inner" style={{ whiteSpace: 'pre-line' }}>
                                    {solicitud.descripcion}
                                </p>
                                <small className="text-muted fw-bold d-block mb-1">Evidencias Adjuntas Iniciales:</small>
                                {renderEvidenciasGrid(solicitud.imagen_url)}
                            </div>

                            {/* Reporte final de cierre (Si ya se terminó) */}
                            {parseInt(solicitud.estado_id) === 5 && (
                                <div className="mt-4 border-start border-success border-4 ps-3">
                                    <h6 className="text-success text-uppercase fw-bold d-flex align-items-center" style={{ fontSize: '0.85rem' }}>
                                        <i className="bi bi-check-circle-fill me-2"></i> Reporte del Operario
                                    </h6>
                                    <div className="p-3 bg-success bg-opacity-10 text-dark border border-success border-opacity-25 rounded-3 mt-2 shadow-inner">
                                        <div className="small mb-2"><strong>Fecha de Cierre:</strong> {solicitud.fecha_cierre ? new Date(solicitud.fecha_cierre).toLocaleString() : 'No especificada'}</div>
                                        <div className="small mb-0"><strong>Detalles del Trabajo:</strong> {solicitud.comentarios_finales || 'Sin especificaciones del técnico.'}</div>
                                    </div>
                                    {solicitud.evidencia_cierre && (
                                        <div className="mt-2">
                                            <small className="text-muted fw-bold d-block mb-1">Evidencias del Trabajo Concluido:</small>
                                            {renderEvidenciasGrid(solicitud.evidencia_cierre)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer bg-light border-top py-2">
                            <button className="btn btn-secondary px-4 rounded-pill shadow-sm" onClick={onClose}>
                                Cerrar Ventana
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DetalleSolicitudClienteModal;