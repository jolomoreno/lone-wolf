/**
 * Creación del personaje según las reglas del Libro 1:
 * - Destreza en el Combate = 10 + número aleatorio (0-9)
 * - Resistencia = 20 + número aleatorio (0-9)  (la actual empieza al máximo)
 * - 5 Disciplinas del Kai elegidas
 * - Equipo inicial
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
import type { WeaponType } from "./weapon";
import { defaultRandomNumber, type RandomNumber } from "../random/random-number";

export function rollCombatSkill(random: RandomNumber = defaultRandomNumber): number {
  return BASE_COMBAT_SKILL + random();
}

export function rollEndurance(random: RandomNumber = defaultRandomNumber): number {
  return BASE_ENDURANCE + random();
}

export interface CreateCharacterParams {
  /** Las 5 disciplinas elegidas. */
  disciplines: KaiDiscipline[];
  /** Arma de "Dominio de las Armas" (obligatoria si se eligió esa disciplina). */
  weaponskillWeapon?: WeaponType;
  weapons?: InventoryItem[];
  backpack?: InventoryItem[];
  specialItems?: InventoryItem[];
  gold?: number;
  meals?: number;
  /** Fuente de aleatoriedad (inyectable para tests). */
  random?: RandomNumber;
}

export function createCharacter(params: CreateCharacterParams): Character {
  const {
    disciplines,
    weaponskillWeapon,
    weapons = [],
    backpack = [],
    specialItems = [],
    gold = 0,
    meals = 0,
    random = defaultRandomNumber,
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

  const combatSkill = rollCombatSkill(random);
  const enduranceMax = rollEndurance(random);

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
