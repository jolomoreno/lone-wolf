/**
 * Panel de combate: enfrenta a Lobo Solitario con el enemigo de la sección,
 * asalto a asalto, usando la Destreza y la Resistencia reales del personaje.
 *
 * Aplica las reglas curadas por sección (SectionCombatRules):
 *  - Inmunidad al Ataque Psíquico del enemigo.
 *  - Modificador de Destreza al jugador (p.ej. ataque mental del Vordak).
 *  - Opción de eludir el combate cuando la sección lo permite.
 */

import { useState } from "react";
import { hasWeaponskillBonus, type Character } from "../../domain/character/character";
import type { Damage } from "../../domain/combat/combat-results-table";
import {
  type CombatState,
  type Enemy,
  fightRound,
  startCombat,
} from "../../domain/combat/combat";
import type { SectionCombatRules } from "../../domain/game/section-rules";

interface Props {
  character: Character;
  enemy: Enemy;
  rules?: SectionCombatRules;
  /**
   * Estado de combate serializado para restaurar una partida recargada.
   * Solo se usa si `status === "ongoing"`; en cualquier otro caso se ignora.
   */
  initialState?: CombatState;
  /**
   * Llamado tras cada asalto con el nuevo CombatState.
   * Reemplaza a `onEnduranceChange`: el orquestador extrae la Resistencia
   * y persiste el estado del combate en un único `onChange` atómico.
   */
  onStateChange: (state: CombatState) => void;
  onEnd: (status: "won" | "lost") => void;
  onEvade?: (targetId: string) => void;
}


function formatLoss(loss: Damage): string {
  return loss === "K" ? "¡muerte!" : `−${loss}`;
}

export function CombatPanel({
  character,
  enemy,
  rules,
  initialState,
  onStateChange,
  onEnd,
  onEvade,
}: Props) {
  const [modifiers] = useState(() => {
    const mindblastImmune = rules?.mindblastImmune ?? false;

    // Modificador de CS por ataque psíquico del enemigo (p.ej. Vordak −2).
    // Si mindshieldProtects y el jugador tiene Defensa Psíquica, se anula.
    let csBonus = rules?.playerCSModifier ?? 0;
    if (rules?.mindshieldProtects && character.disciplines.includes("mindshield")) {
      csBonus = 0;
    }

    return {
      weaponskill: hasWeaponskillBonus(character),
      mindblast: !mindblastImmune && character.disciplines.includes("mindblast"),
      bonus: csBonus,
      unarmed: character.weapons.length === 0,
      mindblastImmune,
      mindshieldActive:
        (rules?.playerCSModifier ?? 0) < 0 &&
        rules?.mindshieldProtects === true &&
        character.disciplines.includes("mindshield"),
      rawCSPenalty: rules?.playerCSModifier ?? 0,
    };
  });

  const [combat, setCombat] = useState<CombatState>(() => {
    // Restaurar desde el guardado si el combate sigue en curso.
    if (initialState?.status === "ongoing") return initialState;
    return startCombat(
      character.stats.combatSkill,
      character.stats.enduranceCurrent,
      enemy,
      {
        weaponskill: modifiers.weaponskill,
        mindblast: modifiers.mindblast,
        bonus: modifiers.bonus,
        unarmed: modifiers.unarmed,
      },
    );
  });

  function nextRound() {
    const next = fightRound(combat);
    setCombat(next);
    onStateChange(next);
    if (next.status !== "ongoing") onEnd(next.status);
  }

  function handleEvade() {
    if (onEvade && rules?.evasion) onEvade(rules.evasion.target);
  }

  const canEvade =
    onEvade != null &&
    rules?.evasion != null &&
    combat.rounds.length >= rules.evasion.afterRound &&
    combat.status === "ongoing";

  const lwPct = Math.round(
    (combat.loneWolfEndurance / Math.max(1, character.stats.enduranceMax)) * 100,
  );
  const enemyPct = Math.round(
    (combat.enemyEndurance / Math.max(1, enemy.endurance)) * 100,
  );
  const ratioLabel = combat.ratio >= 0 ? `+${combat.ratio}` : `${combat.ratio}`;

  return (
    <section className="combat" data-testid="combat-panel">
      <h3>⚔️ Combate</h3>

      <div className="combat-bars">
        <div className="combatant">
          <div className="combat-name">Lobo Solitario</div>
          <div className="bar">
            <div className="bar-fill lw" style={{ width: `${lwPct}%` }} />
          </div>
          <div className="combat-end" data-testid="lw-endurance">
            {combat.loneWolfEndurance}
          </div>
        </div>
        <div className="vs">vs</div>
        <div className="combatant">
          <div className="combat-name">{enemy.name}</div>
          <div className="bar">
            <div className="bar-fill enemy" style={{ width: `${enemyPct}%` }} />
          </div>
          <div className="combat-end" data-testid="enemy-endurance">
            {combat.enemyEndurance}
          </div>
        </div>
      </div>

      <p className="muted small">
        Ratio de combate: {ratioLabel}
        {modifiers.unarmed ? " · Sin arma (−4)" : ""}
        {modifiers.weaponskill ? " · Dominio de las Armas (+2)" : ""}
        {modifiers.mindblast ? " · Ataque Psíquico (+2)" : ""}
        {modifiers.mindblastImmune ? " · Inmune al Ataque Psíquico" : ""}
        {modifiers.rawCSPenalty < 0 && !modifiers.mindshieldActive
          ? ` · Ataque mental (${modifiers.rawCSPenalty} DC)`
          : ""}
        {modifiers.mindshieldActive ? " · Defensa Psíquica activa" : ""}
      </p>

      {combat.status === "ongoing" && (
        <div className="combat-actions">
          <button
            type="button"
            className="primary"
            data-testid="next-round"
            onClick={nextRound}
          >
            Siguiente asalto
          </button>
          {canEvade && (
            <button
              type="button"
              className="ghost"
              data-testid="evade-combat"
              onClick={handleEvade}
            >
              Eludir combate
            </button>
          )}
          {rules?.evasion && !canEvade && combat.status === "ongoing" && rules.evasion.afterRound > 0 && (
            <button type="button" className="ghost" disabled>
              Eludir (desde asalto {rules.evasion.afterRound + 1})
            </button>
          )}
        </div>
      )}

      {combat.status !== "ongoing" && (
        <p
          className={combat.status === "won" ? "status-ok" : "status-bad"}
          data-testid="combat-result"
        >
          {combat.status === "won"
            ? `¡Has vencido a ${enemy.name}!`
            : "Has caído en combate…"}
        </p>
      )}

      {combat.rounds.length > 0 && (
        <ul className="round-log">
          {combat.rounds.map((r) => (
            <li key={r.round}>
              Asalto {r.round}: sacas <strong>{r.randomNumber}</strong> →{" "}
              {enemy.name} {formatLoss(r.enemyLoss)}, tú {formatLoss(r.loneWolfLoss)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
