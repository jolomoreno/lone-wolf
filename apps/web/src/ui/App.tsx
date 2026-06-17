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
import {
  addSpecialItem,
  addToBackpack,
  addWeapon,
  heal,
  setEnduranceCurrent,
} from "../domain/character/character-operations";
import type { CombatStatus, Enemy } from "../domain/combat/combat";
import {
  createGameState,
  type GameState,
  getFlag,
  goToSection,
  setFlag,
  updateCharacter,
} from "../domain/game/game-state";
import {
  applyEntryEffect,
  applyRollOutcome,
  collectGold,
  evaluateCondition,
  type LootItem,
  lootToInventoryItem,
  resolveRoll,
  SECTION_CHOICE_CONDITIONS,
  SECTION_COMBAT_RULES,
  SECTION_ENTRY_EFFECTS,
  SECTION_LOOT,
  SECTION_ROLL_TABLES,
} from "../domain/game/section-rules";
import {
  PROJECT_AON_ATTRIBUTION,
  PROJECT_AON_URL,
} from "../config/project-aon";
import { CharacterCreation } from "./components/CharacterCreation";
import { CharacterSheet } from "./components/CharacterSheet";
import { CombatPanel } from "./components/CombatPanel";
import { LootPanel } from "./components/LootPanel";
import { RollPanel } from "./components/RollPanel";
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

  // Autoguardado en cada cambio. Los estados terminales (muerte/victoria) se
  // borran del guardado para que "Continuar" no lleve a una partida ya acabada.
  useEffect(() => {
    if (!game) return;
    const isTerminal =
      isDead(game.character) || game.currentSection === FINAL_SECTION;
    if (isTerminal) {
      save.clear();
    } else {
      save.save(game);
    }
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

  // Fin de partida (victoria o muerte): borra el guardado y va a creación sin confirmación.
  function handleGameOver() {
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
        onGameOver={handleGameOver}
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
  onGameOver: () => void;
}

type CombatBlock = Extract<ContentBlockDTO, { type: "combat" }>;

function Adventure({ game, onChange, onSave, onReturnToMenu, onGameOver }: AdventureProps) {
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
  const rollTable = SECTION_ROLL_TABLES[sectionId];
  const loot = SECTION_LOOT[sectionId];

  /** Devuelve si un choice (por target) está disponible para el personaje actual. */
  function isChoiceAvailable(target: string): boolean {
    const rule = choiceConditions.find((r) => r.target === target);
    if (!rule) return true;
    return evaluateCondition(rule.condition, character);
  }

  /**
   * Resuelve la transición a una sección destino (núcleo compartido por la
   * navegación normal y la tirada):
   *  1. Si la sección actual no tiene combate y hay Curación, +1 Resistencia.
   *  2. Mueve a la sección destino.
   *  3. Aplica sus efectos de entrada (daño narrativo, comidas) una sola vez.
   *  4. Cobra el oro del botín de la sección destino (una sola vez, anti-farmeo).
   */
  function navigateTo(fromGame: GameState, targetId: string): {
    game: GameState;
    messages: string[];
  } {
    let next = fromGame;
    const messages: string[] = [];

    if (
      !enemy &&
      next.character.disciplines.includes("healing") &&
      next.character.stats.enduranceCurrent < next.character.stats.enduranceMax
    ) {
      next = updateCharacter(next, heal(next.character, 1));
    }

    next = goToSection(next, targetId);

    const effect = SECTION_ENTRY_EFFECTS[targetId];
    if (effect) {
      const result = applyEntryEffect(next.character, effect);
      next = updateCharacter(next, result.character);
      messages.push(...result.messages);
    }

    const targetLoot = SECTION_LOOT[targetId];
    const goldFlag = `gold:${targetId}`;
    if (targetLoot?.gold && !getFlag(next, goldFlag)) {
      const result = collectGold(next.character, targetLoot.gold);
      next = updateCharacter(next, result.character);
      next = setFlag(next, goldFlag, true);
      messages.push(...result.messages);
    }

    return { game: next, messages };
  }

  function handleNavigate(targetId: string) {
    const { game: next, messages } = navigateTo(game, targetId);
    setEntryMessages(messages);
    onChange(next);
  }

  /** Resuelve una tirada: aplica el efecto de la rama y navega a su destino. */
  function handleRoll(roll: number) {
    if (!rollTable) return;
    const outcome = resolveRoll(rollTable, roll);
    if (!outcome) return;

    const applied = applyRollOutcome(game.character, outcome);
    const fromGame = updateCharacter(game, applied.character);
    const { game: next, messages } = navigateTo(fromGame, outcome.target);

    setEntryMessages([`🎲 Sacas un ${roll}.`, ...applied.messages, ...messages]);
    onChange(next);
  }

  /** Coge un objeto del botín, respetando la ranura de inventario. */
  function handleTakeLoot(item: LootItem) {
    const inv = lootToInventoryItem(item);
    let updated = character;
    if (item.slot === "weapon") updated = addWeapon(character, inv);
    else if (item.slot === "backpack") updated = addToBackpack(character, inv);
    else updated = addSpecialItem(character, inv);
    onChange(updateCharacter(game, updated));
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
        <div className="start-actions">
          <button type="button" className="primary" onClick={onGameOver}>
            Nueva partida
          </button>
        </div>
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
        <div className="start-actions">
          <button type="button" className="primary" onClick={onGameOver}>
            Nueva partida
          </button>
        </div>
      </main>
    );
  }

  // Muerte en combate: pantalla completa en lugar de div embebido.
  if (combatOutcome === "lost") {
    return (
      <main className="creation">
        <h1>🐺 Fin de la aventura</h1>
        <p className="status-bad">Has caído en combate. Tu aventura termina aquí.</p>
        <div className="start-actions">
          <button type="button" className="primary" onClick={onGameOver}>
            Nueva partida
          </button>
        </div>
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
                showChoices={showChoices && !rollTable}
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

              {showChoices && loot?.items && (
                <LootPanel
                  character={character}
                  items={loot.items}
                  onTake={handleTakeLoot}
                />
              )}

              {showChoices && rollTable && (
                <RollPanel key={sectionId} table={rollTable} onResolve={handleRoll} />
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
