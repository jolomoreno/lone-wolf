/**
 * La ficha del personaje (Lobo Solitario) y sus constantes de reglas. Dominio
 * puro: sin React, sin red, sin almacenamiento.
 */

import type { KaiDiscipline } from "./kai-discipline";
import type { WeaponType } from "./weapon";

/** Atributos numéricos. */
export interface CharacterStats {
  /** Destreza en el Combate. Se fija al crear y no cambia durante la aventura. */
  combatSkill: number;
  /** Resistencia máxima (tope al curarse). */
  enduranceMax: number;
  /** Resistencia actual. A 0, Lobo Solitario muere. */
  enduranceCurrent: number;
}

/** Un objeto del inventario. */
export interface InventoryItem {
  id: string;
  name: string;
}

/** La ficha completa. */
export interface Character {
  stats: CharacterStats;
  /** Las 5 disciplinas elegidas. */
  disciplines: KaiDiscipline[];
  /** Arma de "Dominio de las Armas", si se eligió esa disciplina. */
  weaponskillWeapon?: WeaponType;
  weapons: InventoryItem[];
  backpack: InventoryItem[];
  specialItems: InventoryItem[];
  gold: number;
  meals: number;
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
