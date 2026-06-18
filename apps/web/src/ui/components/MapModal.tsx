import { illustrationUrl } from "../../config/project-aon";

const MAP_SRC = illustrationUrl("map.png");

interface Props {
  onClose: () => void;
}

export function MapModal({ onClose }: Props) {
  return (
    <div className="modal-overlay map-modal-overlay" onClick={onClose}>
      <div className="modal map-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Mapa de Sommerlund</h2>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="map-modal-body">
          <img
            src={MAP_SRC}
            alt="Mapa de Sommerlund — Libro 1: Huida de la Oscuridad"
            className="map-img"
          />
        </div>
      </div>
    </div>
  );
}
