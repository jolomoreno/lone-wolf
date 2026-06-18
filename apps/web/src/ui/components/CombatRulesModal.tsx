import {
  DAMAGE_TO_ENEMY,
  DAMAGE_TO_LONE_WOLF,
  type Damage,
} from "../../domain/combat/combat-results-table";

const RATIO_COLS = [
  "≤−11", "−10/−9", "−8/−7", "−6/−5", "−4/−3", "−2/−1",
  "0", "+1/+2", "+3/+4", "+5/+6", "+7/+8", "+9/+10", "≥+11",
];

function fmt(d: Damage) {
  return d === "K" ? <span className="dmg-kill">M</span> : d;
}

function ResultTable({
  data,
  label,
}: {
  data: Damage[][];
  label: string;
}) {
  return (
    <div className="combat-ref-table-wrap">
      <p className="combat-ref-label">{label}</p>
      <div className="combat-ref-scroll">
        <table className="combat-ref-table">
          <thead>
            <tr>
              <th scope="col">Tirada</th>
              {RATIO_COLS.map((h) => (
                <th key={h} scope="col">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <th scope="row">{i}</th>
                {row.map((cell, j) => (
                  <td key={j}>{fmt(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CombatRulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Reglas de combate"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h2>Reglas de Combate</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <section className="rules-section">
            <h3>Ratio de Combate</h3>
            <p>
              <strong>Ratio = Destreza de Lobo Solitario − Destreza del enemigo.</strong>
              {" "}El resultado puede ser positivo, negativo o cero. Cuanto mayor sea el Ratio,
              mejores son tus probabilidades en combate.
            </p>
            <p>
              Consulta la columna correspondiente al Ratio y la fila correspondiente al
              número sacado en la Tabla de la Suerte (0–9). La tabla indica los puntos de
              Resistencia que pierde cada bando en ese asalto. <strong>M</strong> significa
              muerte instantánea.
            </p>
          </section>

          <ResultTable
            data={DAMAGE_TO_ENEMY}
            label="Pérdidas del enemigo por asalto"
          />
          <ResultTable
            data={DAMAGE_TO_LONE_WOLF}
            label="Pérdidas de Lobo Solitario por asalto"
          />

          <section className="rules-section">
            <h3>Bonificaciones y penalizaciones a la Destreza</h3>
            <ul className="rules-list">
              <li>
                <strong>Dominio de las Armas (+2):</strong> si llevas el arma de tu
                especialidad, tu Destreza efectiva sube 2 puntos antes de calcular el Ratio.
              </li>
              <li>
                <strong>Ataque Psíquico (Mindblast, +2):</strong> si tienes la disciplina
                Explosión Mental y el enemigo no es inmune, sumas +2 a tu Destreza.
              </li>
              <li>
                <strong>Sin arma (−4):</strong> si comienzas un combate sin ningún arma,
                tu Destreza se reduce en 4 puntos durante todo ese combate.
              </li>
              <li>
                <strong>Modificador de sección:</strong> algunas secciones imponen bonos o
                penalizaciones adicionales indicadas en el panel de combate.
              </li>
            </ul>
          </section>

          <section className="rules-section">
            <h3>Eludir combate</h3>
            <p>
              En determinadas secciones puedes abandonar el combate antes de que concluya.
              Si el botón <em>Eludir</em> aparece en el panel de combate, puedes usarlo
              tras completar al menos un asalto. Al eludir, tu enemigo te inflige la
              pérdida de Resistencia indicada en la sección.
            </p>
          </section>

          <section className="rules-section">
            <h3>Defensa Psíquica</h3>
            <p>
              La disciplina Defensa Psíquica te protege del Ataque Psíquico de ciertos
              enemigos (Vordak, Kraan y similares) que de otro modo reducirían tu Destreza
              durante el combate. Con Defensa Psíquica activa, ese modificador negativo
              no se aplica.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
