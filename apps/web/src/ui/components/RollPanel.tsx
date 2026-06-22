/**
 * Panel de tirada en la Tabla de la Suerte: cuando la sección exige una tirada
 * (0-9), el azar —no el jugador— decide la rama. Reemplaza a los botones de
 * elección normales.
 *
 * Soporta cascadas (nextTable): cuando una rama lleva a otra tirada, el panel
 * muestra los mensajes anteriores y pide una nueva tirada. Solo llama a
 * onResolve con el resultado final (navegación o muerte narrativa).
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
  onResolve: (outcome: RollOutcome, rolls: number[]) => void;
}

function sectionLabel(id: string): string {
  const m = id.match(/^sect(\d+)$/);
  return m ? m[1] : id;
}

export function RollPanel({ table, onResolve }: Props) {
  const [currentTable, setCurrentTable] = useState<RollOutcome[]>(table);
  const [rolled, setRolled] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [chainMessages, setChainMessages] = useState<string[]>([]);
  const [chainRolls, setChainRolls] = useState<number[]>([]);
  const dieRef = useRef<DiceRollHandle>(null);

  const outcome =
    rolled != null ? resolveRoll(currentTable, rolled) : undefined;

  function handleRoll() {
    if (rolling || rolled !== null) return;
    setRolling(true);
    const value = defaultRandomNumber();
    dieRef.current?.roll(value, () => {
      setRolled(value);
      setRolling(false);
    });
  }

  function handleContinue() {
    if (rolled === null || !outcome) return;

    const newRolls = [...chainRolls, rolled];

    if (outcome.nextTable) {
      // Encadenar siguiente tirada: acumular mensaje y reiniciar el dado
      setChainMessages((prev) =>
        outcome.message ? [...prev, outcome.message] : prev,
      );
      setChainRolls(newRolls);
      setCurrentTable(outcome.nextTable);
      setRolled(null);
      dieRef.current?.reset();
    } else {
      // Resolución final (navegación o muerte narrativa)
      onResolve(outcome, newRolls);
    }
  }

  const continueLabel = outcome?.nextTable
    ? "Continuar"
    : outcome?.kills
      ? "Ver resultado"
      : `Continuar → ${sectionLabel(outcome?.target ?? "")}`;

  return (
    <section className="roll-panel" data-testid="roll-panel">
      <h3>🎲 Tabla de la Suerte</h3>

      {chainMessages.length > 0 && (
        <div className="roll-chain-messages">
          {chainMessages.map((msg) => (
            <p key={msg} className="muted small">
              {msg}
            </p>
          ))}
        </div>
      )}

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
          {outcome?.message && !outcome.nextTable && (
            <p className="muted small">{outcome.message}</p>
          )}
          <button
            type="button"
            className="primary"
            data-testid="roll-continue"
            onClick={handleContinue}
          >
            {continueLabel}
          </button>
        </>
      )}
    </section>
  );
}
