/**
 * Panel de tirada en la Tabla de la Suerte: cuando la sección exige una tirada
 * (0-9), el azar —no el jugador— decide la rama. Reemplaza a los botones de
 * elección normales.
 *
 * Flujo en dos pasos (como el combate): primero se tira y se muestra el número
 * y lo que ocurre; luego "Continuar" navega a la sección resultante.
 */

import { useState } from "react";
import { defaultRandomNumber } from "../../domain/random/random-number";
import { resolveRoll, type RollOutcome } from "../../domain/game/section-rules";

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
  const outcome = rolled != null ? resolveRoll(table, rolled) : undefined;

  return (
    <section className="roll-panel" data-testid="roll-panel">
      <h3>🎲 Tabla de la Suerte</h3>
      {rolled == null ? (
        <>
          <p className="muted small">
            El destino depende del azar. Tira un número (0-9).
          </p>
          <button
            type="button"
            className="primary"
            data-testid="roll-button"
            onClick={() => setRolled(defaultRandomNumber())}
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
