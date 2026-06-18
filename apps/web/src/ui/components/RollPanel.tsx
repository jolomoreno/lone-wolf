/**
 * Panel de tirada en la Tabla de la Suerte: cuando la sección exige una tirada
 * (0-9), el azar —no el jugador— decide la rama. Reemplaza a los botones de
 * elección normales.
 *
 * Flujo: se pulsa "Tirar", el dado 3D anima y se detiene en el resultado,
 * luego "Continuar" navega a la sección resultante.
 */

import { useRef, useState } from "react";
import { type RollOutcome, resolveRoll } from "../../domain/game/section-rules";
import { defaultRandomNumber } from "../../domain/random/random-number";
import { DiceRoll, type DiceRollHandle } from "./DiceRoll";

interface Props {
  table: RollOutcome[];
  onResolve: (roll: number) => void;
}

function sectionLabel(id: string): string {
  const m = id.match(/^sect(\d+)$/);
  return m ? m[1] : id;
}

export function RollPanel({ table, onResolve }: Props) {
  const [rolled, setRolled] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const dieRef = useRef<DiceRollHandle>(null);
  const outcome = rolled != null ? resolveRoll(table, rolled) : undefined;

  function handleRoll() {
    if (rolling || rolled !== null) return;
    setRolling(true);
    const value = defaultRandomNumber();
    dieRef.current?.roll(value, () => {
      setRolled(value);
      setRolling(false);
    });
  }

  return (
    <section className="roll-panel" data-testid="roll-panel">
      <h3>🎲 Tabla de la Suerte</h3>
      <div className="roll-panel-die">
        <DiceRoll ref={dieRef} size="lg" />
      </div>
      {rolled == null ? (
        <>
          <p className="muted small">
            El destino depende del azar. Tira un número (0-9).
          </p>
          <button
            type="button"
            className="primary"
            data-testid="roll-button"
            disabled={rolling}
            onClick={handleRoll}
          >
            Tirar
          </button>
        </>
      ) : (
        <>
          <p>
            Sacas un <strong data-testid="roll-result">{rolled}</strong>.
          </p>
          {outcome?.message && <p className="muted small">{outcome.message}</p>}
          <button
            type="button"
            className="primary"
            data-testid="roll-continue"
            onClick={() => onResolve(rolled)}
          >
            Continuar{outcome ? ` → ${sectionLabel(outcome.target)}` : ""}
          </button>
        </>
      )}
    </section>
  );
}
