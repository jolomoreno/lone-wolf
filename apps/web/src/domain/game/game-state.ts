/**
 * Estado de una partida: la pieza que persistiremos en localStorage (paso 9) y
 * sobre la que más adelante evaluaremos opciones condicionales.
 *
 * Dominio puro e inmutable: cada función devuelve un GameState nuevo.
 */

import type { Character } from "../character/character";

/** Versión del formato de guardado, para migrar partidas antiguas. */
export const SAVE_FORMAT_VERSION = 1;

/** Tipos admitidos por las banderas de estado del juego. */
export type FlagValue = boolean | number | string;

export interface GameState {
  /** Versión del formato (= SAVE_FORMAT_VERSION al crear). */
  version: number;
  /** Número de la sección en la que está el jugador ahora. */
  currentSection: number;
  /** Ficha del personaje. */
  character: Character;
  /** Historial de secciones visitadas, en orden. */
  history: number[];
  /** Banderas de estado del juego (eventos, decisiones, pistas...). */
  flags: Record<string, FlagValue>;
  /** Marca de tiempo ISO de la última modificación. */
  updatedAt: string;
}

const now = (): string => new Date().toISOString();

/** Crea una partida nueva en la sección inicial. */
export function createGameState(
  character: Character,
  startSection = 1,
): GameState {
  return {
    version: SAVE_FORMAT_VERSION,
    currentSection: startSection,
    character,
    history: [startSection],
    flags: {},
    updatedAt: now(),
  };
}

/** Avanza a una sección y la registra en el historial. */
export function goToSection(state: GameState, section: number): GameState {
  return {
    ...state,
    currentSection: section,
    history: [...state.history, section],
    updatedAt: now(),
  };
}

/** Sustituye la ficha del personaje (p.ej. tras daño/curación en combate). */
export function updateCharacter(
  state: GameState,
  character: Character,
): GameState {
  return { ...state, character, updatedAt: now() };
}

/** Fija una bandera de estado. */
export function setFlag(
  state: GameState,
  key: string,
  value: FlagValue,
): GameState {
  return {
    ...state,
    flags: { ...state.flags, [key]: value },
    updatedAt: now(),
  };
}

/** Lee una bandera de estado (undefined si no existe). */
export function getFlag(state: GameState, key: string): FlagValue | undefined {
  return state.flags[key];
}
