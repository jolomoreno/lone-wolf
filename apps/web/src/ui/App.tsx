/**
 * Orquesta el juego sobre un GameState persistente:
 *  - Sin partida y con guardado → pantalla de inicio (Continuar / Nueva).
 *  - Sin partida y sin guardado → creación de personaje.
 *  - Con partida → la aventura (sección + ficha + combate).
 *
 * El GameState se autoguarda en cada cambio (red de seguridad ante cierre
 * inesperado). El jugador también puede guardar explícitamente con el botón
 * del pie de página.
 */

import { useEffect, useRef, useState } from "react";
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

function formatSavedAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function App() {
  const { save } = useContainer();
  const [savedState, setSavedState] = useState<GameState | null>(() => save.load());
  const [game, setGame] = useState<GameState | null>(null);

  // Autoguardado en cada cambio (red de seguridad ante cierre inesperado).
  useEffect(() => {
    if (game) save.save(game);
  }, [game, save]);

  // Vuelve al menú conservando la partida guardada.
  function returnToMenu() {
    setGame(null);
    setSavedState(save.load());
  }

  // Borra la partida y va a la creación de personaje (con confirmación).
  function startNewGame() {
    if (game || savedState) {
      const ok = window.confirm(
        "¿Empezar una nueva partida? Se perderá el progreso actual.",
      );
      if (!ok) return;
    }
    save.clear();
    setGame(null);
    setSavedState(null);
  }

  if (game) {
    return (
      <Adventure
        game={game}
        onChange={setGame}
        onSave={() => save.save(game)}
        onReturnToMenu={returnToMenu}
        onNewGame={startNewGame}
      />
    );
  }

  if (savedState) {
    return (
      <StartScreen
        saved={savedState}
        onContinue={() => setGame(savedState)}
        onNew={startNewGame}
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
        <span className="muted small">
          Partida guardada · {formatSavedAt(saved.updatedAt)}
        </span>
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
  onSave: () => void;
  onReturnToMenu: () => void;
  onNewGame: () => void;
}

type CombatBlock = Extract<ContentBlockDTO, { type: "combat" }>;

function Adventure({ game, onChange, onSave, onReturnToMenu, onNewGame }: AdventureProps) {
  const character: Character = game.character;
  const sectionNumber = game.currentSection;
  const [combatOutcome, setCombatOutcome] = useState<CombatStatus | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const savedAtTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const section = useSection(sectionNumber);

  // Al cambiar de sección, se reinicia el resultado del combate.
  useEffect(() => {
    setCombatOutcome(null);
  }, [sectionNumber]);

  // Limpia el timer al desmontar para evitar fugas.
  useEffect(() => {
    return () => {
      if (savedAtTimerRef.current) clearTimeout(savedAtTimerRef.current);
    };
  }, []);

  function handleSave() {
    onSave();
    const time = formatSavedAt(new Date().toISOString());
    setSavedAt(time);
    if (savedAtTimerRef.current) clearTimeout(savedAtTimerRef.current);
    savedAtTimerRef.current = setTimeout(() => setSavedAt(null), 3000);
  }

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
                  <button type="button" className="primary" onClick={onNewGame}>
                    Nueva partida
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <footer className="game-footer">
        <button type="button" className="ghost" onClick={onReturnToMenu}>
          ← Inicio
        </button>
        <div className="save-controls">
          {savedAt && (
            <span className="save-indicator">✓ Guardado {savedAt}</span>
          )}
          <button type="button" className="ghost" onClick={handleSave}>
            Guardar partida
          </button>
        </div>
      </footer>
    </main>
  );
}
