/**
 * Lógica de combate de Lobo Solitario. Dominio puro e inmutable.
 *
 * Flujo: `startCombat` calcula el Ratio de Combate y prepara el estado; cada
 * `fightRound` resuelve un asalto (saca número → consulta la tabla → aplica el
 * daño a ambos) y actualiza el estado (en curso / victoria / derrota).
 */

import {
  defaultRandomNumber,
  type RandomNumber,
} from "../random/random-number";
import { type Damage, lookupRound } from "./combat-results-table";

export interface Enemy {
  name: string;
  combatSkill: number;
  endurance: number;
}

export interface CombatModifiers {
  /** +2 si Lobo Solitario lucha con el arma de "Dominio de las Armas". */
  weaponskill?: boolean;
  /** +2 por "Ataque Psíquico" (Mindblast) si el enemigo es vulnerable. */
  mindblast?: boolean;
  /** Modificador extra específico de la sección (puede ser negativo). */
  bonus?: number;
  /** −4 si Lobo Solitario no lleva ningún arma al inicio del combate. */
  unarmed?: boolean;
}

/** Ratio de Combate = Destreza de Lobo Solitario (+ bonus) − Destreza del enemigo. */
export function combatRatio(
  loneWolfCombatSkill: number,
  enemyCombatSkill: number,
  modifiers: CombatModifiers = {},
): number {
  let combatSkill = loneWolfCombatSkill;
  if (modifiers.weaponskill) combatSkill += 2;
  if (modifiers.mindblast) combatSkill += 2;
  if (modifiers.unarmed) combatSkill -= 4;
  combatSkill += modifiers.bonus ?? 0;
  return combatSkill - enemyCombatSkill;
}

export type CombatStatus = "ongoing" | "won" | "lost";

export interface RoundResult {
  round: number;
  randomNumber: number;
  enemyLoss: Damage;
  loneWolfLoss: Damage;
}

export interface CombatState {
  enemy: Enemy;
  /** Ratio fijo durante todo el combate. */
  ratio: number;
  loneWolfEndurance: number;
  enemyEndurance: number;
  rounds: RoundResult[];
  status: CombatStatus;
}

export function startCombat(
  loneWolfCombatSkill: number,
  loneWolfEndurance: number,
  enemy: Enemy,
  modifiers: CombatModifiers = {},
): CombatState {
  return {
    enemy,
    ratio: combatRatio(loneWolfCombatSkill, enemy.combatSkill, modifiers),
    loneWolfEndurance,
    enemyEndurance: enemy.endurance,
    rounds: [],
    status: "ongoing",
  };
}

function applyLoss(endurance: number, loss: Damage): number {
  if (loss === "K") return 0;
  return Math.max(0, endurance - loss);
}

/** Resuelve un asalto y devuelve el nuevo estado (no muta el anterior). */
export function fightRound(
  state: CombatState,
  random: RandomNumber = defaultRandomNumber,
): CombatState {
  if (state.status !== "ongoing") return state;

  const randomNumber = random();
  const { enemyLoss, loneWolfLoss } = lookupRound(state.ratio, randomNumber);

  const enemyEndurance = applyLoss(state.enemyEndurance, enemyLoss);
  const loneWolfEndurance = applyLoss(state.loneWolfEndurance, loneWolfLoss);

  // Si Lobo Solitario cae, pierde (un héroe muerto no puede vencer).
  const status: CombatStatus =
    loneWolfEndurance <= 0 ? "lost" : enemyEndurance <= 0 ? "won" : "ongoing";

  return {
    ...state,
    loneWolfEndurance,
    enemyEndurance,
    status,
    rounds: [
      ...state.rounds,
      { round: state.rounds.length + 1, randomNumber, enemyLoss, loneWolfLoss },
    ],
  };
}
