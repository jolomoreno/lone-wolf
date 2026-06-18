/**
 * Creación del personaje según las reglas del Libro 1:
 * - Destreza en el Combate = 10 + número aleatorio (0-9)
 * - Resistencia = 20 + número aleatorio (0-9)  (la actual empieza al máximo)
 * - 5 Disciplinas del Kai elegidas
 * - Equipo inicial
 *
 * Diseño: la TIRADA (aleatoriedad) está separada del ENSAMBLADO. La UI tira
 * primero las stats, las muestra, y al confirmar llama a `createCharacter` con
 * esos valores ya fijados.
 */

import {
  defaultRandomNumber,
  type RandomNumber,
} from "../random/random-number";
import {
  BASE_COMBAT_SKILL,
  BASE_ENDURANCE,
  type Character,
  type InventoryItem,
  MAX_BACKPACK_ITEMS,
  MAX_GOLD,
  MAX_WEAPONS,
} from "./character";
import {
  KAI_DISCIPLINES_TO_CHOOSE,
  type KaiDiscipline,
} from "./kai-discipline";
import type { WeaponType } from "./weapon";

export function rollCombatSkill(
  random: RandomNumber = defaultRandomNumber,
): number {
  return BASE_COMBAT_SKILL + random();
}

export function rollEndurance(
  random: RandomNumber = defaultRandomNumber,
): number {
  return BASE_ENDURANCE + random();
}

/** Tira las Coronas de Oro iniciales (0-9) en la Tabla de la Suerte. */
export function rollStartingGold(
  random: RandomNumber = defaultRandomNumber,
): number {
  return random();
}

/**
 * Tabla exacta del Libro 1: tirada 0-9 → arma de "Dominio de las Armas".
 * El 0 y el 9 dan Daga (igual que en las reglas impresas).
 */
const WEAPONSKILL_TABLE: WeaponType[] = [
  "dagger", // 0
  "spear", // 1
  "mace", // 2
  "shortSword", // 3
  "warhammer", // 4
  "sword", // 5
  "axe", // 6
  "quarterstaff", // 7
  "broadsword", // 8
  "dagger", // 9
];

export function rollWeaponskillWeapon(
  random: RandomNumber = defaultRandomNumber,
): WeaponType {
  return WEAPONSKILL_TABLE[random()];
}

export interface CreateCharacterParams {
  /** Destreza ya tirada (10-19). */
  combatSkill: number;
  /** Resistencia máxima ya tirada (20-29). */
  enduranceMax: number;
  /** Las 5 disciplinas elegidas. */
  disciplines: KaiDiscipline[];
  /** Arma de "Dominio de las Armas" (obligatoria si se eligió esa disciplina). */
  weaponskillWeapon?: WeaponType;
  weapons?: InventoryItem[];
  backpack?: InventoryItem[];
  specialItems?: InventoryItem[];
  gold?: number;
}

export function createCharacter(params: CreateCharacterParams): Character {
  const {
    combatSkill,
    enduranceMax,
    disciplines,
    weaponskillWeapon,
    weapons = [],
    backpack = [],
    specialItems = [],
    gold = 0,
  } = params;

  if (disciplines.length !== KAI_DISCIPLINES_TO_CHOOSE) {
    throw new Error(
      `Debes elegir exactamente ${KAI_DISCIPLINES_TO_CHOOSE} disciplinas (elegidas: ${disciplines.length}).`,
    );
  }
  if (new Set(disciplines).size !== disciplines.length) {
    throw new Error("No puedes repetir disciplinas.");
  }
  if (disciplines.includes("weaponskill") && !weaponskillWeapon) {
    throw new Error(
      'La disciplina "Dominio de las Armas" requiere elegir un arma.',
    );
  }
  if (weapons.length > MAX_WEAPONS) {
    throw new Error(`No puedes empezar con más de ${MAX_WEAPONS} armas.`);
  }
  if (backpack.length > MAX_BACKPACK_ITEMS) {
    throw new Error(
      `La mochila admite como máximo ${MAX_BACKPACK_ITEMS} objetos.`,
    );
  }
  if (gold < 0 || gold > MAX_GOLD) {
    throw new Error(`El oro debe estar entre 0 y ${MAX_GOLD} coronas.`);
  }

  return {
    stats: { combatSkill, enduranceMax, enduranceCurrent: enduranceMax },
    disciplines: [...disciplines],
    ...(weaponskillWeapon ? { weaponskillWeapon } : {}),
    weapons: [...weapons],
    backpack: [...backpack],
    specialItems: [...specialItems],
    gold,
  };
}
