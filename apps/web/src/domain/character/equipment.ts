/**
 * Equipo inicial del Libro 1.
 *
 * Equipo fijo: Hacha (arma), 1 Comida (mochila), Mapa de Sommerlund (especial),
 * y Coronas de Oro = tirada en la Tabla de la Suerte (0-9).
 *
 * Además, el jugador elige UN objeto del almacén del monasterio (lista de 9).
 */

import { type Character, type InventoryItem, MAX_WEAPONS } from "./character";
import { createCharacter } from "./create-character";
import type { KaiDiscipline } from "./kai-discipline";
import { WEAPON_NAMES, type WeaponType } from "./weapon";
import { defaultRandomNumber, type RandomNumber } from "../random/random-number";

/** Cómo afecta un objeto del almacén al personaje. */
export type StoreroomGrant =
  | { kind: "weapon"; item: InventoryItem }
  | { kind: "special"; item: InventoryItem; enduranceBonus?: number }
  | { kind: "meals"; amount: number }
  | { kind: "backpackItem"; item: InventoryItem }
  | { kind: "gold"; amount: number };

/** Un objeto elegible del almacén (eliges 1). */
export interface StoreroomChoice {
  /** Número de la lista del libro (1-9). */
  id: number;
  name: string;
  grant: StoreroomGrant;
}

/** Los 9 objetos del almacén del Libro 1 (eliges uno). */
export const STOREROOM: StoreroomChoice[] = [
  { id: 1, name: "Espada", grant: { kind: "weapon", item: { id: "sword", name: "Espada" } } },
  {
    id: 2,
    name: "Casco",
    grant: {
      kind: "special",
      item: { id: "helmet", name: "Casco" },
      enduranceBonus: 2,
    },
  },
  { id: 3, name: "Dos Comidas", grant: { kind: "meals", amount: 2 } },
  {
    id: 4,
    name: "Cota de Malla",
    grant: {
      kind: "special",
      item: { id: "mail", name: "Cota de Malla" },
      enduranceBonus: 4,
    },
  },
  { id: 5, name: "Maza", grant: { kind: "weapon", item: { id: "mace", name: "Maza" } } },
  {
    id: 6,
    name: "Poción Curativa",
    grant: {
      kind: "backpackItem",
      item: { id: "laumspur-potion", name: "Poción Curativa", kind: "potion" },
    },
  },
  { id: 7, name: "Estaca", grant: { kind: "weapon", item: { id: "stake", name: "Estaca" } } },
  { id: 8, name: "Lanza", grant: { kind: "weapon", item: { id: "spear", name: "Lanza" } } },
  { id: 9, name: "12 Coronas de Oro", grant: { kind: "gold", amount: 12 } },
];

/**
 * Tabla explícita tirada 0-9 → id de objeto del almacén (1-9).
 * Sustituye a `(raw % 9) + 1`, que daba doble probabilidad al id 1
 * porque raw=0 y raw=9 producían el mismo resultado.
 * El 9 comparte el último objeto (12 Coronas), igual que la tabla de
 * Weaponskill reparte el 0 y el 9 entre la Daga.
 */
const STOREROOM_ROLL_TABLE: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 9];

/**
 * Tira el objeto del almacén (1-9) en la Tabla de la Suerte.
 */
export function rollStoreroomChoiceId(
  random: RandomNumber = defaultRandomNumber,
): number {
  return STOREROOM_ROLL_TABLE[random()];
}

export interface StartingCharacterParams {
  /** Destreza ya tirada (10-19). */
  combatSkill: number;
  /** Resistencia base ya tirada (20-29), antes de bonus de equipo. */
  enduranceMax: number;
  /** Oro ya tirado (0-9), antes del posible objeto de oro. */
  gold: number;
  disciplines: KaiDiscipline[];
  weaponskillWeapon?: WeaponType;
  /** Objeto elegido del almacén (1-9). */
  storeroomChoiceId: number;
  /**
   * Resolución del conflicto cuando el almacén da un arma diferente al arma de dominio
   * y ambos huecos de arma quedarían ocupados.
   *
   * "weaponskill" → se descarta el arma del almacén y se añade la de dominio.
   * "storeroom"   → se mantiene el arma del almacén; la de dominio queda latente.
   *
   * Si no hay conflicto, este campo se ignora.
   */
  weaponConflictResolution?: "weaponskill" | "storeroom";
}

/**
 * Construye el personaje inicial del Libro 1: equipo fijo + el objeto elegido
 * del almacén, aplicando sus efectos (Resistencia, oro, comidas...).
 */
export function createStartingCharacter(params: StartingCharacterParams): Character {
  const choice = STOREROOM.find((c) => c.id === params.storeroomChoiceId);
  if (!choice) {
    throw new Error(`Objeto de almacén inválido: ${params.storeroomChoiceId}.`);
  }

  // Equipo fijo del Libro 1.
  const weapons: InventoryItem[] = [{ id: "axe", name: "Hacha" }];
  const backpack: InventoryItem[] = [{ id: "meal-0", name: "Comida", kind: "meal" }];
  const specialItems: InventoryItem[] = [
    { id: "map", name: "Mapa de Sommerlund" },
  ];
  let gold = params.gold;
  let enduranceBonus = 0;

  // Aplicar el objeto elegido del almacén.
  const { grant } = choice;
  switch (grant.kind) {
    case "weapon":
      // Si el jugador resolvió el conflicto a favor del arma de dominio,
      // el arma del almacén se descarta (el hueco lo ocupará la de dominio).
      if (params.weaponConflictResolution !== "weaponskill") {
        weapons.push(grant.item);
      }
      break;
    case "special":
      specialItems.push(grant.item);
      enduranceBonus += grant.enduranceBonus ?? 0;
      break;
    case "meals":
      for (let i = 1; i <= grant.amount; i++) {
        backpack.push({ id: `meal-${i}`, name: "Comida", kind: "meal" });
      }
      break;
    case "backpackItem":
      backpack.push(grant.item);
      break;
    case "gold":
      gold += grant.amount;
      break;
  }

  // Si el jugador tiene Dominio de las Armas y el arma de dominio no está ya
  // en el inventario, añadirla si hay hueco. Así el bono +2 aplica desde el
  // principio. Si ambos huecos están ocupados (Hacha + arma del almacén),
  // la disciplina queda latente hasta encontrar esa arma en la aventura.
  if (params.weaponskillWeapon) {
    const alreadyHasIt = weapons.some(
      (w) => (w.weaponType ?? w.id) === params.weaponskillWeapon,
    );
    if (!alreadyHasIt && weapons.length < MAX_WEAPONS) {
      weapons.push({
        id: params.weaponskillWeapon,
        name: WEAPON_NAMES[params.weaponskillWeapon],
        weaponType: params.weaponskillWeapon,
      });
    }
  }

  return createCharacter({
    combatSkill: params.combatSkill,
    enduranceMax: params.enduranceMax + enduranceBonus,
    disciplines: params.disciplines,
    ...(params.weaponskillWeapon
      ? { weaponskillWeapon: params.weaponskillWeapon }
      : {}),
    weapons,
    backpack,
    specialItems,
    gold,
  });
}
