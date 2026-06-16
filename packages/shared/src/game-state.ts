/**
 * El estado de una partida: es lo que guardaremos en localStorage (y, más
 * adelante, lo que podría sincronizarse en la nube).
 */

import type { Character } from "./character";

/** Versión del formato de guardado, para poder migrar partidas antiguas. */
export const SAVE_FORMAT_VERSION = 1;

/** Tipos admitidos por las banderas de estado del juego. */
export type FlagValue = boolean | number | string;

/** El estado completo de una partida en curso. */
export interface GameState {
  /** Versión del formato (= SAVE_FORMAT_VERSION al crearse). */
  version: number;
  /** Sección en la que está el jugador ahora mismo, p.ej. "sect1". */
  currentSectionId: string;
  /** Ficha del personaje. */
  character: Character;
  /** Historial de secciones visitadas, en orden. */
  history: string[];
  /**
   * Banderas de estado del juego: eventos, decisiones, pistas...
   * p.ej. { tieneSommerswerd: true, pistaDelMapa: true }.
   */
  flags: Record<string, FlagValue>;
  /** Marca de tiempo ISO de la última modificación. */
  updatedAt: string;
}
