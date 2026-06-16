/**
 * El contenido del libro-juego: una "sección" es cada número del libro
 * (del 1 al 350) más algunas secciones especiales (equipo, reglas, etc.).
 *
 * El formato refleja el XML de Project Aon, pero ya "limpio" para que el
 * frontend lo pinte sin saber nada de XML.
 */

/** Datos de un enemigo para un combate. */
export interface Combat {
  /** Nombre del enemigo, p.ej. "Guardia de Sommerlund". */
  enemy: string;
  /** Destreza en el Combate del enemigo (COMBAT SKILL). */
  combatSkill: number;
  /** Resistencia del enemigo (ENDURANCE); a 0 es derrotado. */
  endurance: number;
}

/**
 * Un bloque de contenido renderizable dentro de una sección, en orden de
 * aparición. Es una "unión discriminada": cada bloque tiene un `type` que
 * indica cómo pintarlo. Añadir nuevos tipos en el futuro es trivial.
 */
export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "illustration"; src: string; alt?: string }
  | { type: "combat"; combat: Combat };

/** Una opción de navegación: el texto que ve el jugador y la sección destino. */
export interface Choice {
  /** Texto mostrado, p.ej. "Si quieres ir hacia el norte...". */
  text: string;
  /** id de la sección destino, p.ej. "sect85". */
  target: string;
}

/** Una sección (un "número") del libro-juego. */
export interface Section {
  /** id original del XML, p.ej. "sect1" o "equipmnt". */
  id: string;
  /** Número de la sección (1..350). `null` en secciones especiales. */
  number: number | null;
  /** Contenido narrativo en orden de aparición. */
  blocks: ContentBlock[];
  /** Opciones de navegación (normalmente al final de la sección). */
  choices: Choice[];
}
