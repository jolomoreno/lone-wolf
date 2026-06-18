/**
 * Entidad de dominio `Section`: una sección (un "número") del libro-juego.
 *
 * Es el modelo INTERNO del backend (distinto del `SectionDTO` del contrato).
 * El adaptador HTTP la mapeará a `SectionDTO` al responder. Es TS puro: no sabe
 * nada de Mongo ni de Express.
 */

/** Datos de un enemigo para un combate. */
export interface Combat {
  enemy: string;
  combatSkill: number;
  endurance: number;
}

/** Un bloque de contenido renderizable (unión discriminada por `type`). */
export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "illustration"; src: string; alt?: string }
  | { type: "combat"; combat: Combat };

/** Una opción de navegación: texto + id de la sección destino. */
export interface Choice {
  text: string;
  target: string;
}

/** Una sección del libro. */
export interface Section {
  /** id original del XML, p.ej. "sect1". */
  id: string;
  /** Número (1..350). `null` en secciones especiales (equipo, reglas...). */
  number: number | null;
  /** Contenido en orden de aparición. */
  blocks: ContentBlock[];
  /** Opciones de navegación. */
  choices: Choice[];
}
