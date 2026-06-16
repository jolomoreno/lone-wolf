/**
 * La ficha del personaje (Lobo Solitario) en el Libro 1.
 *
 * Nota: aquí solo guardamos los NOMBRES de disciplinas/armas (términos del
 * juego). Las descripciones largas pertenecen al texto del libro y se cargan
 * desde los datos de Project Aon, no se escriben a mano aquí.
 */

/** Las 10 Disciplinas del Kai del Libro 1. El jugador elige 5 al empezar. */
export type KaiDiscipline =
  | "camouflage"
  | "hunting"
  | "sixthSense"
  | "tracking"
  | "healing"
  | "weaponskill"
  | "mindshield"
  | "mindblast"
  | "animalKinship"
  | "mindOverMatter";

/** Nombres en español de las Disciplinas del Kai (solo etiquetas). */
export const KAI_DISCIPLINE_NAMES: Record<KaiDiscipline, string> = {
  camouflage: "Camuflaje",
  hunting: "Caza",
  sixthSense: "Sexto Sentido",
  tracking: "Rastreo",
  healing: "Curación",
  weaponskill: "Dominio de las Armas",
  mindshield: "Escudo Psíquico",
  mindblast: "Ataque Psíquico",
  animalKinship: "Empatía Animal",
  mindOverMatter: "Dominio sobre la Materia",
};

/** Lista de todas las disciplinas (útil para pintar la pantalla de creación). */
export const ALL_KAI_DISCIPLINES = Object.keys(
  KAI_DISCIPLINE_NAMES,
) as KaiDiscipline[];

/** Cuántas disciplinas se eligen al crear el personaje en el Libro 1. */
export const KAI_DISCIPLINES_TO_CHOOSE = 5;

/** Armas que pueden asociarse a la disciplina "Dominio de las Armas". */
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

/** Nombres en español de las armas. */
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

/** Atributos numéricos del personaje. */
export interface CharacterStats {
  /** Destreza en el Combate. Se fija al crear y no cambia durante la aventura. */
  combatSkill: number;
  /** Resistencia máxima (tope al curarse). */
  enduranceMax: number;
  /** Resistencia actual. A 0, Lobo Solitario muere. */
  enduranceCurrent: number;
}

/** Un objeto del inventario (arma, objeto de mochila u objeto especial). */
export interface InventoryItem {
  /** Identificador estable para añadir/quitar, p.ej. "sword". */
  id: string;
  /** Nombre mostrado, p.ej. "Espada" o "Mapa de Sommerlund". */
  name: string;
}

/** La ficha completa del personaje. */
export interface Character {
  stats: CharacterStats;
  /** Las 5 disciplinas elegidas al crear el personaje. */
  disciplines: KaiDiscipline[];
  /** Si eligió "Dominio de las Armas", con qué arma. */
  weaponskillWeapon?: WeaponType;
  /** Armas que lleva (máx. 2 en el Libro 1). */
  weapons: InventoryItem[];
  /** Mochila (máx. 8 objetos; las Comidas ocupan sitio). */
  backpack: InventoryItem[];
  /** Objetos Especiales (sin límite fijo). */
  specialItems: InventoryItem[];
  /** Coronas de Oro (máx. 50 en la bolsa). */
  gold: number;
  /** Número de Comidas que lleva. */
  meals: number;
}

/** Constantes de las reglas de creación/inventario del Libro 1. */
export const BASE_COMBAT_SKILL = 10; // + número aleatorio (0-9)
export const BASE_ENDURANCE = 20; // + número aleatorio (0-9)
export const MAX_WEAPONS = 2;
export const MAX_BACKPACK_ITEMS = 8;
export const MAX_GOLD = 50;
