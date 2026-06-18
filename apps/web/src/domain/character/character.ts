/**
 * La ficha del personaje (Lobo Solitario) y sus constantes de reglas. Dominio
 * puro: sin React, sin red, sin almacenamiento.
 */

import type { KaiDiscipline } from "./kai-discipline";
import type { WeaponType } from "./weapon";

/** Categoría de un objeto, para lógica especial (comidas, pociones). */
export type ItemKind = "meal" | "potion";

/** Un objeto del inventario. */
export interface InventoryItem {
  /** Identificador único de la instancia (para añadir/quitar). */
  id: string;
  name: string;
  /** Categoría opcional (p.ej. "meal" para que cuente como Comida). */
  kind?: ItemKind;
  /**
   * Tipo de arma canónico. Necesario para aplicar el +2 de Dominio de las Armas
   * cuando el id del objeto no coincide con el WeaponType (p.ej. "loot-dagger").
   */
  weaponType?: WeaponType;
}

/** Atributos numéricos. */
export interface CharacterStats {
  /** Destreza en el Combate. Se fija al crear y no cambia durante la aventura. */
  combatSkill: number;
  /** Resistencia máxima (tope al curarse). */
  enduranceMax: number;
  /** Resistencia actual. A 0, Lobo Solitario muere. */
  enduranceCurrent: number;
}

/** La ficha completa. */
export interface Character {
  stats: CharacterStats;
  /** Las 5 disciplinas elegidas. */
  disciplines: KaiDiscipline[];
  /** Arma de "Dominio de las Armas", si se eligió esa disciplina. */
  weaponskillWeapon?: WeaponType;
  /** Armas que lleva (máx. 2). */
  weapons: InventoryItem[];
  /** Mochila (máx. 8 objetos; las Comidas cuentan como objetos de mochila). */
  backpack: InventoryItem[];
  /** Objetos Especiales (sin límite fijo). */
  specialItems: InventoryItem[];
  /** Coronas de Oro (máx. 50 en la bolsa). */
  gold: number;
}

/** Constantes de las reglas de creación e inventario del Libro 1. */
export const BASE_COMBAT_SKILL = 10; // + número aleatorio (0-9)
export const BASE_ENDURANCE = 20; // + número aleatorio (0-9)
export const MAX_WEAPONS = 2;
export const MAX_BACKPACK_ITEMS = 8;
export const MAX_GOLD = 50;

/** ¿Lobo Solitario ha muerto (Resistencia a 0)? */
export function isDead(character: Character): boolean {
  return character.stats.enduranceCurrent <= 0;
}

/** Número de Comidas en la mochila. */
export function countMeals(character: Character): number {
  return character.backpack.filter((item) => item.kind === "meal").length;
}

/**
 * ¿Aplica el +2 de "Dominio de las Armas" en el próximo combate?
 * True si el personaje lleva en su inventario el tipo de arma de dominio.
 */
export function hasWeaponskillBonus(character: Character): boolean {
  return (
    character.weaponskillWeapon != null &&
    character.weapons.some(
      (w) => (w.weaponType ?? w.id) === character.weaponskillWeapon,
    )
  );
}
