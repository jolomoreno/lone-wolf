/**
 * Adaptador de salida: implementa SavePort con el almacenamiento del navegador.
 *
 * Recibe un almacén tipo clave-valor (por defecto `window.localStorage`), lo que
 * permite inyectar uno falso en los tests sin necesidad de un DOM.
 */

import type { SavePort } from "../../application/ports/save.port";
import {
  type GameState,
  SAVE_FORMAT_VERSION,
} from "../../domain/game/game-state";

/** Subconjunto de la Web Storage API que usamos (facilita los tests). */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const STORAGE_KEY = "lone-wolf:save";

export class LocalStorageSaveAdapter implements SavePort {
  constructor(
    private readonly storage: KeyValueStorage = window.localStorage,
  ) {}

  load(): GameState | null {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as GameState;
      // Descartar guardados de un formato incompatible.
      if (parsed.version !== SAVE_FORMAT_VERSION) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  save(state: GameState): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  clear(): void {
    this.storage.removeItem(STORAGE_KEY);
  }
}
