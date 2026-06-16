/**
 * Tipos de arma del Libro 1. Relevantes sobre todo para la disciplina
 * "Dominio de las Armas" (el arma concreta se decide al crear el personaje).
 */

export type WeaponType =
  | "dagger"
  | "spear"
  | "mace"
  | "shortSword"
  | "warhammer"
  | "sword"
  | "axe"
  | "quarterstaff"
  | "broadsword";

export const WEAPON_NAMES: Record<WeaponType, string> = {
  dagger: "Daga",
  spear: "Lanza",
  mace: "Maza",
  shortSword: "Espada Corta",
  warhammer: "Martillo de Guerra",
  sword: "Espada",
  axe: "Hacha",
  quarterstaff: "Bastón",
  broadsword: "Espadón",
};
