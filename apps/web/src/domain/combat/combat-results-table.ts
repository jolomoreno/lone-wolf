/**
 * Tabla de Resultados del Combate de Lobo Solitario (la tabla canónica de la
 * serie, que en el libro es una imagen).
 *
 * - Filas (0-9): el número sacado en la Tabla de la Suerte.
 * - Columnas (13): el Ratio de Combate agrupado:
 *     ≤−11, −9/−10, −7/−8, −5/−6, −3/−4, −1/−2, 0, +1/+2, +3/+4, +5/+6, +7/+8, +9/+10, ≥+11
 * - Cada celda: puntos de RESISTENCIA perdidos. "K" = muerte instantánea.
 *
 * `DAMAGE_TO_ENEMY[numero][columna]` = lo que pierde el enemigo.
 * `DAMAGE_TO_LONE_WOLF[numero][columna]` = lo que pierde Lobo Solitario.
 */

export type Damage = number | "K";

// prettier-ignore
export const DAMAGE_TO_ENEMY: Damage[][] = [
  [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, "K", "K", "K"], // sacas 0
  [0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // sacas 1
  [0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // sacas 2
  [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // sacas 3
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // sacas 4
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14], // sacas 5
  [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16], // sacas 6
  [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18], // sacas 7
  [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, "K"], // sacas 8
  [5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, "K", "K"], // sacas 9
];

// prettier-ignore
export const DAMAGE_TO_LONE_WOLF: Damage[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // sacas 0 (¡crítico! 0 daño)
  ["K", "K", 8, 6, 6, 5, 5, 5, 4, 4, 4, 3, 3], // sacas 1
  ["K", 8, 7, 6, 5, 5, 4, 4, 3, 3, 3, 3, 2], // sacas 2
  [8, 7, 6, 5, 5, 4, 4, 3, 3, 3, 2, 2, 2], // sacas 3
  [8, 7, 6, 5, 4, 4, 3, 3, 2, 2, 2, 2, 2], // sacas 4
  [7, 6, 5, 4, 4, 3, 2, 2, 2, 2, 2, 2, 1], // sacas 5
  [6, 6, 5, 4, 3, 2, 2, 2, 2, 1, 1, 1, 1], // sacas 6
  [5, 5, 4, 3, 2, 2, 1, 1, 1, 0, 0, 0, 0], // sacas 7
  [4, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0], // sacas 8
  [3, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // sacas 9
];

/** Mapea un Ratio de Combate (entero) a la columna 0-12 de la tabla. */
export function combatRatioColumn(ratio: number): number {
  if (ratio <= -11) return 0;
  if (ratio >= 11) return 12;
  if (ratio === 0) return 6;
  if (ratio > 0) return 6 + Math.ceil(ratio / 2);
  return 6 - Math.ceil(Math.abs(ratio) / 2);
}

export interface RoundLosses {
  enemyLoss: Damage;
  loneWolfLoss: Damage;
}

/** Consulta la tabla para un ratio y un número sacado (0-9). */
export function lookupRound(ratio: number, randomNumber: number): RoundLosses {
  const column = combatRatioColumn(ratio);
  return {
    enemyLoss: DAMAGE_TO_ENEMY[randomNumber][column],
    loneWolfLoss: DAMAGE_TO_LONE_WOLF[randomNumber][column],
  };
}
