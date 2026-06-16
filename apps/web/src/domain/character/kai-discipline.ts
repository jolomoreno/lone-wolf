/**
 * Las 10 Disciplinas del Kai del Libro 1. El jugador elige 5 al crear el
 * personaje.
 */

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

export const ALL_KAI_DISCIPLINES = Object.keys(
  KAI_DISCIPLINE_NAMES,
) as KaiDiscipline[];

/** Cuántas disciplinas se eligen al crear el personaje en el Libro 1. */
export const KAI_DISCIPLINES_TO_CHOOSE = 5;
