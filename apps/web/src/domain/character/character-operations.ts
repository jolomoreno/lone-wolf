/**
 * Operaciones sobre la ficha durante la partida. Todas son PURAS e INMUTABLES:
 * reciben un `Character` y devuelven uno nuevo, sin mutar el original.
 */

import {
  type Character,
  type InventoryItem,
  MAX_BACKPACK_ITEMS,
  MAX_GOLD,
  MAX_WEAPONS,
} from "./character";

/** Resta Resistencia (nunca baja de 0). */
export function applyDamage(character: Character, amount: number): Character {
  const damage = Math.max(0, amount);
  const enduranceCurrent = Math.max(0, character.stats.enduranceCurrent - damage);
  return { ...character, stats: { ...character.stats, enduranceCurrent } };
}

/** Cura Resistencia (nunca sube por encima del máximo). */
export function heal(character: Character, amount: number): Character {
  const healed = Math.max(0, amount);
  const enduranceCurrent = Math.min(
    character.stats.enduranceMax,
    character.stats.enduranceCurrent + healed,
  );
  return { ...character, stats: { ...character.stats, enduranceCurrent } };
}

/** Añade un objeto a la mochila (lanza si está llena). */
export function addToBackpack(
  character: Character,
  item: InventoryItem,
): Character {
  if (character.backpack.length >= MAX_BACKPACK_ITEMS) {
    throw new Error(`La mochila está llena (máximo ${MAX_BACKPACK_ITEMS} objetos).`);
  }
  return { ...character, backpack: [...character.backpack, item] };
}

/** Quita un objeto de la mochila por id. */
export function removeFromBackpack(
  character: Character,
  itemId: string,
): Character {
  return {
    ...character,
    backpack: character.backpack.filter((item) => item.id !== itemId),
  };
}

/** Añade un arma (lanza si ya lleva el máximo). */
export function addWeapon(character: Character, weapon: InventoryItem): Character {
  if (character.weapons.length >= MAX_WEAPONS) {
    throw new Error(`No puedes llevar más de ${MAX_WEAPONS} armas.`);
  }
  return { ...character, weapons: [...character.weapons, weapon] };
}

/** Cambia el oro en `delta` (se mantiene entre 0 y el máximo de la bolsa). */
export function changeGold(character: Character, delta: number): Character {
  const gold = Math.min(MAX_GOLD, Math.max(0, character.gold + delta));
  return { ...character, gold };
}

/** Fija la Resistencia actual a un valor (acotado entre 0 y el máximo). */
export function setEnduranceCurrent(character: Character, value: number): Character {
  const enduranceCurrent = Math.max(
    0,
    Math.min(character.stats.enduranceMax, value),
  );
  return { ...character, stats: { ...character.stats, enduranceCurrent } };
}
