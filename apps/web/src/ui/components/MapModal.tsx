import { useState } from "react";
import { illustrationUrl } from "../../config/project-aon";

const MAP_SRC = illustrationUrl("map.png");
const ZOOM_STEP = 0.25;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;

interface Props {
  onClose: () => void;
}

export function MapModal({ onClose }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);

  function zoomIn() { setZoom((z) => Math.min(z + ZOOM_STEP, ZOOM_MAX)); }
  function zoomOut() { setZoom((z) => Math.max(z - ZOOM_STEP, ZOOM_MIN)); }
  function zoomReset() { setZoom(1); }

  return (
    <div className="modal-overlay map-modal-overlay" onClick={onClose}>
      <div className="modal map-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Mapa de Sommerlund</h2>
          <div className="map-zoom-controls">
            <button type="button" className="map-zoom-btn" onClick={zoomOut} disabled={zoom <= ZOOM_MIN} aria-label="Reducir">−</button>
            <button type="button" className="map-zoom-reset" onClick={zoomReset}>{Math.round(zoom * 100)}%</button>
            <button type="button" className="map-zoom-btn" onClick={zoomIn} disabled={zoom >= ZOOM_MAX} aria-label="Ampliar">+</button>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="map-modal-body">
          {!loaded && (
            <div className="map-loading">
              <span className="muted">Cargando mapa…</span>
            </div>
          )}
          <img
            src={MAP_SRC}
            alt="Mapa de Sommerlund — Libro 1: Huida de la Oscuridad"
            className="map-img"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left", display: loaded ? "block" : "none" }}
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
}
