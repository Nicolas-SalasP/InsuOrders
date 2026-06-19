import { useRef } from 'react';

/**
 * Mobile-friendly file picker que muestra botones separados para
 * cámara (capture="environment") y galería/archivos.
 * En desktop muestra solo un input normal.
 *
 * Props:
 *   onChange  - handler recibe FileList (igual que input onChange → e.target.files)
 *   multiple  - bool, galería permite múltiples archivos
 *   accept    - string, default "image/*,video/*"
 *   className - clases extra para el wrapper
 */
export default function MediaPickerInput({ onChange, multiple = false, accept = 'image/*,video/*', className = '' }) {
    const cameraRef = useRef(null);
    const galleryRef = useRef(null);

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onChange(e);
        }
        e.target.value = '';
    };

    return (
        <div className={`d-flex gap-2 ${className}`}>
            {/* Botón cámara */}
            <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 flex-shrink-0"
                onClick={() => cameraRef.current?.click()}
                title="Tomar foto o video"
            >
                <i className="bi bi-camera-fill"></i>
                <span className="d-none d-sm-inline">Cámara</span>
            </button>
            <input
                ref={cameraRef}
                type="file"
                accept={accept}
                capture="environment"
                className="d-none"
                onChange={handleChange}
            />

            {/* Botón galería */}
            <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 flex-shrink-0"
                onClick={() => galleryRef.current?.click()}
                title="Seleccionar desde galería o archivos"
            >
                <i className="bi bi-images"></i>
                <span className="d-none d-sm-inline">Galería</span>
            </button>
            <input
                ref={galleryRef}
                type="file"
                accept={accept}
                multiple={multiple}
                className="d-none"
                onChange={handleChange}
            />
        </div>
    );
}
