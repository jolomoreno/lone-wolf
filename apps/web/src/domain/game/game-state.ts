/**
 * Estado de una partida: la pieza que persistiremos en localStorage (paso 9) y
 * sobre la que más adelante evaluaremos opciones condicionales.
 *
 * Dominio puro e inmutable: cada función devuelve un GameState nuevo.
 */

import type { Character } from "../character/character";

/**
 * Versión del formato de guardado. Incrementar cuando el esquema cambie de
 * forma incompatible para que el adaptador descarte partidas antiguas.
 * v2: currentSection e history pasaron de number a string (id, p.ej. "sect1").
 */
export const SAVE_FORMAT_VERSION = 2;

/** Tipos admitidos por las banderas de estado del juego. */
export type FlagValue = boolean | number | string;

export interface GameState {
  /** Versión del formato (= SAVE_FORMAT_VERSION al crear). */
  version: number;
  /** Id de la sección actual (p.ej. "sect1", "sect350"). */
  currentSection: string;
  /** Ficha del personaje. */
  character: Character;
  /** Historial de ids de secciones visitadas, en orden. */
  history: string[];
  /** Banderas de estado del juego (eventos, decisiones, pistas...). */
  flags: Record<string, FlagValue>;
  /** Marca de tiempo ISO de la última modificación. */
  updatedAt: string;
}

const now = (): string => new Date().toISOString();

/** Crea una partida nueva en la sección inicial. */
export function createGameState(
  character: Character,
  startSection = "sect1",
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

/** Avanza a una sección (por id) y la registra en el historial. */
export function goToSection(state: GameState, sectionId: string): GameState {
  return {
    ...state,
    currentSection: sectionId,
    history: [...state.history, sectionId],
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
