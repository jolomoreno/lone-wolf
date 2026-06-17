/**
 * Panel de combate: enfrenta a Lobo Solitario con el enemigo de la sección,
 * asalto a asalto, usando la Destreza y la Resistencia reales del personaje.
 *
 * En cada asalto avisa al padre de la nueva Resistencia de Lobo Solitario
 * (para que la ficha se actualice en vivo) y, al terminar, del resultado.
 */

import { useState } from "react";
import type { Character } from "../../domain/character/character";
import type { Damage } from "../../domain/combat/combat-results-table";
import {
  type CombatState,
  type Enemy,
  fightRound,
  startCombat,
} from "../../domain/combat/combat";

interface Props {
  character: Character;
  enemy: Enemy;
  onEnduranceChange: (loneWolfEndurance: number) => void;
  onEnd: (status: "won" | "lost") => void;
}

/** +2 si el personaje lucha con el arma de "Dominio de las Armas". */
function hasWeaponskillBonus(character: Character): boolean {
  return (
    character.weaponskillWeapon != null &&
    character.weapons.some((w) => w.id === character.weaponskillWeapon)
  );
}

function formatLoss(loss: Damage): string {
  return loss === "K" ? "¡muerte!" : `−${loss}`;
}

export function CombatPanel({ character, enemy, onEnduranceChange, onEnd }: Props) {
  // Modificadores fijados al empezar el combate.
  const [modifiers] = useState(() => ({
    weaponskill: hasWeaponskillBonus(character),
    mindblast: character.disciplines.includes("mindblast"),
  }));
  const [combat, setCombat] = useState<CombatState>(() =>
    startCombat(
      character.stats.combatSkill,
      character.stats.enduranceCurrent,
      enemy,
      modifiers,
    ),
  );

  function nextRound() {
    const next = fightRound(combat);
    setCombat(next);
    onEnduranceChange(next.loneWolfEndurance);
    if (next.status !== "ongoing") onEnd(next.status);
  }

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
        {modifiers.weaponskill ? " · Dominio de las Armas (+2)" : ""}
        {modifiers.mindblast ? " · Ataque Psíquico (+2)" : ""}
      </p>

      {combat.status === "ongoing" ? (
        <button
          type="button"
          className="primary"
          data-testid="next-round"
          onClick={nextRound}
        >
          Siguiente asalto
        </button>
      ) : (
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
