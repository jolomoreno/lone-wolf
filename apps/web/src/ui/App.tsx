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
import { isDead } from "../domain/character/character";
import { heal, setEnduranceCurrent } from "../domain/character/character-operations";
import type { CombatStatus, Enemy } from "../domain/combat/combat";
import {
  createGameState,
  type GameState,
  goToSection,
  updateCharacter,
} from "../domain/game/game-state";
import {
  applyEntryEffect,
  evaluateCondition,
  SECTION_CHOICE_CONDITIONS,
  SECTION_COMBAT_RULES,
  SECTION_ENTRY_EFFECTS,
} from "../domain/game/section-rules";
import {
  PROJECT_AON_ATTRIBUTION,
  PROJECT_AON_URL,
} from "../config/project-aon";
import { CharacterCreation } from "./components/CharacterCreation";
import { CharacterSheet } from "./components/CharacterSheet";
import { CombatPanel } from "./components/CombatPanel";
import { SectionView } from "./components/SectionView";
import { useContainer } from "./DependencyProvider";
import { useSection } from "./hooks/useSection";

const FIRST_SECTION = "sect1";
/** Id de la sección final del Libro 1 (sección 350). */
const FINAL_SECTION = "sect350";

function formatSavedAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

/** Extrae el número de un id de sección ("sect85" → "85"), o el id completo si no aplica. */
function sectionLabel(sectionId: string): string {
  const match = sectionId.match(/^sect(\d+)$/);
  return match ? match[1] : sectionId;
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
          Sección <strong>{sectionLabel(saved.currentSection)}</strong> · Resistencia{" "}
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
  const sectionId = game.currentSection;
  const [combatOutcome, setCombatOutcome] = useState<CombatStatus | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [entryMessages, setEntryMessages] = useState<string[]>([]);
  const savedAtTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const section = useSection(sectionId);

  // Al cambiar de sección, se reinicia el resultado del combate.
  useEffect(() => {
    setCombatOutcome(null);
  }, [sectionId]);

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

  // Reglas curadas para la sección actual.
  const combatRules = SECTION_COMBAT_RULES[sectionId];
  const choiceConditions = SECTION_CHOICE_CONDITIONS[sectionId] ?? [];

  /** Devuelve si un choice (por target) está disponible para el personaje actual. */
  function isChoiceAvailable(target: string): boolean {
    const rule = choiceConditions.find((r) => r.target === target);
    if (!rule) return true;
    return evaluateCondition(rule.condition, character);
  }

  /**
   * Al navegar a una sección:
   *  1. Si la actual no tiene combate y el personaje tiene Curación, +1 Resistencia.
   *  2. Mueve a la sección destino.
   *  3. Aplica los efectos de entrada de la sección destino (daño narrativo,
   *     comidas obligatorias) UNA sola vez y muestra qué ha pasado.
   */
  function handleNavigate(targetId: string) {
    let next = game;
    if (
      !enemy &&
      character.disciplines.includes("healing") &&
      next.character.stats.enduranceCurrent < next.character.stats.enduranceMax
    ) {
      next = updateCharacter(next, heal(next.character, 1));
    }

    next = goToSection(next, targetId);

    const effect = SECTION_ENTRY_EFFECTS[targetId];
    if (effect) {
      const { character: updated, messages } = applyEntryEffect(next.character, effect);
      next = updateCharacter(next, updated);
      setEntryMessages(messages);
    } else {
      setEntryMessages([]);
    }

    onChange(next);
  }

  // Pantalla de victoria al llegar a la sección final.
  if (sectionId === FINAL_SECTION) {
    return (
      <main className="creation">
        <h1>🐺 ¡Victoria!</h1>
        <p>Has completado el Libro 1 — Huida de la Oscuridad.</p>
        <p className="muted small">
          Lobo Solitario ha escapado con el Libro de Plenitud del Kai.
          El Maestro de las Tinieblas conocerá su nombre.
        </p>
        <button type="button" className="primary" onClick={onNewGame}>
          Nueva partida
        </button>
      </main>
    );
  }

  // Muerte fuera de combate (Resistencia a 0 por causas no relacionadas con el combate).
  if (isDead(character) && !enemy) {
    return (
      <main className="creation">
        <h1>🐺 Fin de la aventura</h1>
        <p className="status-bad">
          Las heridas y el agotamiento han acabado con Lobo Solitario.
        </p>
        <button type="button" className="primary" onClick={onNewGame}>
          Nueva partida
        </button>
      </main>
    );
  }

  const displayNumber =
    section.status === "ok" && section.data.number != null
      ? section.data.number
      : sectionLabel(sectionId);

  return (
    <main className="game">
      <header className="game-header">
        <div>
          <h1>🐺 Lobo Solitario</h1>
          <p className="muted small">Libro 1 — Huida de la Oscuridad</p>
        </div>
        <span className="section-badge" data-testid="section-number">
          {displayNumber}
        </span>
      </header>

      <div className="layout">
        <CharacterSheet
          character={character}
          onCharacterChange={(updated) => onChange(updateCharacter(game, updated))}
        />

        <div className="reader">
          {section.status === "loading" && (
            <p className="muted">Cargando sección…</p>
          )}
          {section.status === "error" && (
            <p className="status-bad">⚠️ {section.message}</p>
          )}
          {section.status === "ok" && (
            <>
              {entryMessages.length > 0 && (
                <div className="entry-messages" data-testid="entry-messages">
                  {entryMessages.map((msg, i) => (
                    <p key={i}>{msg}</p>
                  ))}
                </div>
              )}

              <SectionView
                section={section.data}
                onNavigate={handleNavigate}
                showChoices={showChoices}
                isChoiceAvailable={isChoiceAvailable}
              />

              {enemy && (
                <CombatPanel
                  key={sectionId}
                  character={character}
                  enemy={enemy}
                  rules={combatRules}
                  onEnduranceChange={(endurance) =>
                    onChange(
                      updateCharacter(game, setEnduranceCurrent(character, endurance)),
                    )
                  }
                  onEnd={(status) => setCombatOutcome(status)}
                  onEvade={handleNavigate}
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

      <p className="attribution muted small">
        {PROJECT_AON_ATTRIBUTION}{" "}
        <a href={PROJECT_AON_URL} target="_blank" rel="noopener noreferrer">
          projectaon.org
        </a>
      </p>
    </main>
  );
}
