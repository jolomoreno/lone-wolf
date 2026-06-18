/**
 * Contratos (DTOs) de la API de contenido: la forma EXACTA de los datos que
 * viajan por HTTP entre el backend y el frontend. No contienen lógica.
 *
 * - El backend mapea su entidad de dominio `Section` -> `SectionDTO` al responder.
 * - El frontend consume estos DTOs como modelo de lectura del contenido.
 */

/** Datos de un enemigo para un combate, tal y como los envía la API. */
export interface CombatDTO {
  enemy: string;
  combatSkill: number;
  endurance: number;
}

/** Un bloque de contenido renderizable (unión discriminada por `type`). */
export type ContentBlockDTO =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "illustration"; src: string; alt?: string }
  | { type: "combat"; combat: CombatDTO };

/** Una opción de navegación: texto + id de la sección destino. */
export interface ChoiceDTO {
  text: string;
  target: string;
}

/** Una sección (un "número") del libro, tal y como la sirve la API. */
export interface SectionDTO {
  id: string;
  number: number | null;
  blocks: ContentBlockDTO[];
  choices: ChoiceDTO[];
}
