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
  BASE_COMBAT_SKILL,
  BASE_ENDURANCE,
  type Character,
  type InventoryItem,
  MAX_BACKPACK_ITEMS,
  MAX_GOLD,
  MAX_WEAPONS,
} from "./character";
import { KAI_DISCIPLINES_TO_CHOOSE, type KaiDiscipline } from "./kai-discipline";
import { WEAPON_NAMES, type WeaponType } from "./weapon";
import { defaultRandomNumber, type RandomNumber } from "../random/random-number";

export function rollCombatSkill(random: RandomNumber = defaultRandomNumber): number {
  return BASE_COMBAT_SKILL + random();
}

export function rollEndurance(random: RandomNumber = defaultRandomNumber): number {
  return BASE_ENDURANCE + random();
}

const WEAPONSKILL_WEAPONS = Object.keys(WEAPON_NAMES) as WeaponType[];

/**
 * Decide el arma de "Dominio de las Armas" con una tirada.
 * NOTA: usamos un reparto uniforme sobre las armas; la tabla exacta 0-9 del
 * libro se afinará en el paso 8 (cuando el arma dé bonus en combate).
 */
export function rollWeaponskillWeapon(
  random: RandomNumber = defaultRandomNumber,
): WeaponType {
  return WEAPONSKILL_WEAPONS[random() % WEAPONSKILL_WEAPONS.length];
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
  meals?: number;
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
    meals = 0,
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
    throw new Error('La disciplina "Dominio de las Armas" requiere elegir un arma.');
  }
  if (weapons.length > MAX_WEAPONS) {
    throw new Error(`No puedes empezar con más de ${MAX_WEAPONS} armas.`);
  }
  if (backpack.length > MAX_BACKPACK_ITEMS) {
    throw new Error(`La mochila admite como máximo ${MAX_BACKPACK_ITEMS} objetos.`);
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
    meals,
  };
}
