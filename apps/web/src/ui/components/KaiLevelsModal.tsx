const KAI_LEVELS = [
  "Postulante",
  "Novicio",
  "Aprendiz",
  "Discípulo",
  "Iniciado",
  "Aspirante",
  "Guardián",
  "Guerrero o Viajero",
  "Sabio",
  "Maestro",
] as const;

/** Rango del jugador en el Libro 1: 5 = Iniciado. */
const PLAYER_LEVEL = 5;

interface Props {
  onClose: () => void;
}

export function KaiLevelsModal({ onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Niveles de Entrenamiento Kai</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="rules-intro">
          El cuadro de más abajo indica los distintos rangos y títulos otorgados
          a los Señores del Kai en cada etapa de su entrenamiento. Cada vez que
          completes con éxito una aventura de la serie Lobo Solitario,
          conseguirás una Disciplina Kai suplementaria y podrás ascender
          progresivamente hacia el dominio completo de las diez Disciplinas Kai.
        </p>

        <ol className="kai-levels-list">
          {KAI_LEVELS.map((name, i) => {
            const rank = i + 1;
            const isPlayer = rank === PLAYER_LEVEL;
            return (
              <li
                key={rank}
                className={`kai-level-item${isPlayer ? " current" : ""}`}
              >
                <span className="kai-level-name">{name}</span>
                {isPlayer && <span className="kai-disc-badge">TU RANGO</span>}
              </li>
            );
          })}
        </ol>

        <p className="rules-intro" style={{ marginTop: "1.25rem" }}>
          Tras estas diez disciplinas Kai básicas existen otras Disciplinas Kai
          secretas, de orden superior, llamadas Magnakai. Adquiriendo la
          sabiduría del Magnakai, un Señor del Kai puede progresar hacia el
          dominio supremo y convertirse en un Gran Señor del Kai.
        </p>
      </div>
    </div>
  );
}
