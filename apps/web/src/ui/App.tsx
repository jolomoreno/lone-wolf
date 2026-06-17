/**
 * Orquesta las dos fases del juego:
 *  - Sin personaje  → pantalla de creación.
 *  - Con personaje  → la aventura (sección actual + ficha + combate).
 *
 * El personaje vive en estado de React (se perderá al recargar hasta que
 * implementemos el guardado en localStorage, paso 9). El combate de una sección
 * usa y modifica la Resistencia real del personaje.
 */

import { useEffect, useState } from "react";
import type { ContentBlockDTO } from "@lone-wolf/shared";
import type { Character } from "../domain/character/character";
import { setEnduranceCurrent } from "../domain/character/character-operations";
import type { CombatStatus, Enemy } from "../domain/combat/combat";
import { CharacterCreation } from "./components/CharacterCreation";
import { CharacterSheet } from "./components/CharacterSheet";
import { CombatPanel } from "./components/CombatPanel";
import { SectionView } from "./components/SectionView";
import { useSection } from "./hooks/useSection";

const FIRST_SECTION = 1;

export function App() {
  const [character, setCharacter] = useState<Character | null>(null);

  if (!character) {
    return <CharacterCreation onCreate={setCharacter} />;
  }

  return (
    <Adventure
      character={character}
      onCharacterChange={setCharacter}
      onRestart={() => setCharacter(null)}
    />
  );
}

interface AdventureProps {
  character: Character;
  onCharacterChange: (character: Character) => void;
  onRestart: () => void;
}

type CombatBlock = Extract<ContentBlockDTO, { type: "combat" }>;

function Adventure({ character, onCharacterChange, onRestart }: AdventureProps) {
  const [sectionNumber, setSectionNumber] = useState(FIRST_SECTION);
  const [combatOutcome, setCombatOutcome] = useState<CombatStatus | null>(null);
  const section = useSection(sectionNumber);

  // Al cambiar de sección, se reinicia el resultado del combate.
  useEffect(() => {
    setCombatOutcome(null);
  }, [sectionNumber]);

  const combatBlock =
    section.status === "ok"
      ? section.data.blocks.find(
          (block): block is CombatBlock => block.type === "combat",
        )
      : undefined;

  const enemy: Enemy | undefined = combatBlock
    ? {
        name: combatBlock.combat.enemy,
        combatSkill: combatBlock.combat.combatSkill,
        endurance: combatBlock.combat.endurance,
      }
    : undefined;

  // Durante un combate sin ganar, se ocultan las opciones de la sección.
  const showChoices = !enemy || combatOutcome === "won";

  return (
    <main className="game">
      <header className="game-header">
        <div>
          <h1>🐺 Lobo Solitario</h1>
          <p className="muted small">Libro 1 — Huida de la Oscuridad</p>
        </div>
        <span className="section-badge" data-testid="section-number">
          {sectionNumber}
        </span>
      </header>

      <div className="layout">
        <CharacterSheet character={character} />

        <div className="reader">
          {section.status === "loading" && (
            <p className="muted">Cargando sección…</p>
          )}
          {section.status === "error" && (
            <p className="status-bad">⚠️ {section.message}</p>
          )}
          {section.status === "ok" && (
            <>
              <SectionView
                section={section.data}
                onNavigate={setSectionNumber}
                showChoices={showChoices}
              />

              {enemy && (
                <CombatPanel
                  key={sectionNumber}
                  character={character}
                  enemy={enemy}
                  onEnduranceChange={(endurance) =>
                    onCharacterChange(setEnduranceCurrent(character, endurance))
                  }
                  onEnd={(status) => setCombatOutcome(status)}
                />
              )}

              {combatOutcome === "lost" && (
                <div className="death">
                  <p className="status-bad">Tu aventura termina aquí.</p>
                  <button type="button" className="primary" onClick={onRestart}>
                    Nueva partida
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <footer className="game-footer">
        <button type="button" className="ghost" onClick={onRestart}>
          ↺ Nueva partida
        </button>
      </footer>
    </main>
  );
}
