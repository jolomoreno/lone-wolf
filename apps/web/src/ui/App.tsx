/**
 * Orquesta el juego sobre un GameState persistente:
 *  - Sin partida y con guardado → pantalla de inicio (Continuar / Nueva).
 *  - Sin partida y sin guardado → creación de personaje.
 *  - Con partida → la aventura (sección + ficha + combate).
 *
 * El GameState se autoguarda en cada cambio (navegar, daño de combate) a través
 * del SavePort.
 */

import { useEffect, useState } from "react";
import type { ContentBlockDTO } from "@lone-wolf/shared";
import type { Character } from "../domain/character/character";
import { setEnduranceCurrent } from "../domain/character/character-operations";
import type { CombatStatus, Enemy } from "../domain/combat/combat";
import {
  createGameState,
  type GameState,
  goToSection,
  updateCharacter,
} from "../domain/game/game-state";
import { CharacterCreation } from "./components/CharacterCreation";
import { CharacterSheet } from "./components/CharacterSheet";
import { CombatPanel } from "./components/CombatPanel";
import { SectionView } from "./components/SectionView";
import { useContainer } from "./DependencyProvider";
import { useSection } from "./hooks/useSection";

const FIRST_SECTION = 1;

export function App() {
  const { save } = useContainer();
  const [savedState, setSavedState] = useState<GameState | null>(() => save.load());
  const [game, setGame] = useState<GameState | null>(null);

  // Autoguardado en cada cambio del estado de partida.
  useEffect(() => {
    if (game) save.save(game);
  }, [game, save]);

  function exitToStart() {
    save.clear();
    setGame(null);
    setSavedState(null);
  }

  if (game) {
    return <Adventure game={game} onChange={setGame} onExit={exitToStart} />;
  }

  if (savedState) {
    return (
      <StartScreen
        saved={savedState}
        onContinue={() => setGame(savedState)}
        onNew={() => setSavedState(null)}
      />
    );
  }

  return (
    <CharacterCreation
      onCreate={(character) => setGame(createGameState(character, FIRST_SECTION))}
    />
  );
}

function StartScreen({
  saved,
  onContinue,
  onNew,
}: {
  saved: GameState;
  onContinue: () => void;
  onNew: () => void;
}) {
  return (
    <main className="creation">
      <h1>🐺 Lobo Solitario</h1>
      <p className="muted small">Libro 1 — Huida de la Oscuridad</p>
      <div className="rolled-item">
        <span className="muted small">Tienes una partida guardada</span>
        <span>
          Sección <strong>{saved.currentSection}</strong> · Resistencia{" "}
          {saved.character.stats.enduranceCurrent}/{saved.character.stats.enduranceMax}
        </span>
      </div>
      <div className="start-actions">
        <button type="button" className="primary" onClick={onContinue}>
          Continuar partida
        </button>
        <button type="button" className="ghost" onClick={onNew}>
          Nueva partida
        </button>
      </div>
    </main>
  );
}

interface AdventureProps {
  game: GameState;
  onChange: (game: GameState) => void;
  onExit: () => void;
}

type CombatBlock = Extract<ContentBlockDTO, { type: "combat" }>;

function Adventure({ game, onChange, onExit }: AdventureProps) {
  const character: Character = game.character;
  const sectionNumber = game.currentSection;
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
                onNavigate={(n) => onChange(goToSection(game, n))}
                showChoices={showChoices}
              />

              {enemy && (
                <CombatPanel
                  key={sectionNumber}
                  character={character}
                  enemy={enemy}
                  onEnduranceChange={(endurance) =>
                    onChange(
                      updateCharacter(game, setEnduranceCurrent(character, endurance)),
                    )
                  }
                  onEnd={(status) => setCombatOutcome(status)}
                />
              )}

              {combatOutcome === "lost" && (
                <div className="death">
                  <p className="status-bad">Tu aventura termina aquí.</p>
                  <button type="button" className="primary" onClick={onExit}>
                    Nueva partida
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <footer className="game-footer">
        <button type="button" className="ghost" onClick={onExit}>
          ↺ Nueva partida
        </button>
      </footer>
    </main>
  );
}
