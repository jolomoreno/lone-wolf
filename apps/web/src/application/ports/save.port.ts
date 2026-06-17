/**
 * Puerto para guardar y recuperar la partida. La aplicación define QUÉ necesita
 * (cargar / guardar / borrar un GameState); la infraestructura decide CÓMO
 * (localStorage, y en el futuro quizá la nube).
 */

import type { GameState } from "../../domain/game/game-state";

export interface SavePort {
  /** Carga la partida guardada, o null si no hay (o es incompatible). */
  load(): GameState | null;
  /** Guarda la partida. */
  save(state: GameState): void;
  /** Borra la partida guardada. */
  clear(): void;
}
