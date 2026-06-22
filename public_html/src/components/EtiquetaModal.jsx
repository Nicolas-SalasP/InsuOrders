import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';

export default function EtiquetaModal({ show, insumo, onClose }) {
    const svgRef = useRef(null);
    const [copias, setCopias] = useState(1);

    useEffect(() => {
        if (show && insumo?.codigo_sku && svgRef.current) {
            try {
                JsBarcode(svgRef.current, insumo.codigo_sku, {
                    format: 'CODE128',
                    width: 1.5,
                    height: 32,
                    displayValue: false,
                    margin: 2,
                });
            } catch (e) {
                console.error('Barcode error:', e);
            }
        }
    }, [show, insumo]);

    const imprimir = () => {
        const svgHtml = svgRef.current?.outerHTML ?? '';
        const ultimos4 = insumo.codigo_sku.slice(-4);
        const etiqueta = `
            <div class="etiqueta">
                <div class="nombre">${insumo.nombre}</div>
                <div class="sku-ultimos">···${ultimos4}</div>
                <div class="sku-completo">${insumo.codigo_sku}</div>
                ${svgHtml}
            </div>`;

        const win = window.open('', '_blank', 'width=900,height=600');
        win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Etiqueta ${insumo.codigo_sku}</title>
<style>
  @page { size: 62mm 32mm; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: #fff; }
  .pagina {
    display: flex;
    flex-wrap: wrap;
    gap: 2mm;
    padding: 2mm;
  }
  .etiqueta {
    width: 62mm;
    height: 32mm;
    border: 0.3mm solid #aaa;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5mm 2mm;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .nombre {
    font-size: 6.5pt;
    font-weight: bold;
    text-align: center;
    line-height: 1.2;
    max-width: 58mm;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin-bottom: 1.5mm;
  }
  .sku-ultimos {
    font-size: 16pt;
    font-family: monospace;
    font-weight: bold;
    letter-spacing: 3px;
    margin-top: 0.5mm;
    margin-bottom: 0.2mm;
  }
  .sku-completo {
    font-size: 5.5pt;
    font-family: monospace;
    color: #555;
    letter-spacing: 0.3px;
    margin-bottom: 0.5mm;
  }
  .etiqueta svg {
    max-width: 56mm;
    height: auto;
  }
</style>
</head>
<body>
<div class="pagina">
  ${Array(copias).fill(etiqueta).join('')}
</div>
<script>window.onload = () => { window.print(); window.close(); }</` + `script>
</body>
</html>`);
        win.document.close();
    };

    if (!show || !insumo) return null;

    return (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
                <div className="modal-content">
                    <div className="modal-header py-2">
                        <h6 className="modal-title fw-bold">
                            <i className="bi bi-upc-scan me-2"></i>Etiqueta de producto
                        </h6>
                        <button className="btn-close" onClick={onClose} />
                    </div>

                    <div className="modal-body text-center py-3">
                        {/* Preview */}
                        <div className="border rounded d-inline-flex flex-column align-items-center px-3 py-2 bg-white shadow-sm" style={{ minWidth: 200 }}>
                            <div className="fw-bold text-dark" style={{ fontSize: '0.75rem', maxWidth: 220, lineHeight: 1.3, textAlign: 'center' }}>
                                {insumo.nombre}
                            </div>
                            <div className="font-monospace fw-bold text-dark" style={{ fontSize: '1.6rem', letterSpacing: '3px', marginTop: '4px' }}>
                                ···{insumo.codigo_sku.slice(-4)}
                            </div>
                            <div className="font-monospace text-secondary" style={{ fontSize: '0.6rem', marginBottom: '4px' }}>
                                {insumo.codigo_sku}
                            </div>
                            <svg ref={svgRef} />
                        </div>

                        <div className="mt-3 d-flex align-items-center justify-content-center gap-2">
                            <label className="text-muted small mb-0">Copias:</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                style={{ width: 70 }}
                                min={1}
                                max={100}
                                value={copias}
                                onChange={e => setCopias(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                            />
                        </div>
                    </div>

                    <div className="modal-footer py-2">
                        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button>
                        <button className="btn btn-primary btn-sm" onClick={imprimir}>
                            <i className="bi bi-printer me-1"></i>Imprimir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
