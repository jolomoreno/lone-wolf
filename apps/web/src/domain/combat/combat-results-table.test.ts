import { describe, expect, it } from "vitest";
import {
  combatRatioColumn,
  DAMAGE_TO_ENEMY,
  DAMAGE_TO_LONE_WOLF,
  lookupRound,
} from "./combat-results-table";

describe("dimensiones de la tabla", () => {
  it("tiene 10 filas (0-9) y 13 columnas cada una", () => {
    expect(DAMAGE_TO_ENEMY).toHaveLength(10);
    expect(DAMAGE_TO_LONE_WOLF).toHaveLength(10);
    for (const row of [...DAMAGE_TO_ENEMY, ...DAMAGE_TO_LONE_WOLF]) {
      expect(row).toHaveLength(13);
    }
  });
});

describe("combatRatioColumn", () => {
  it("mapea ratios a columnas 0-12", () => {
    expect(combatRatioColumn(-15)).toBe(0);
    expect(combatRatioColumn(-11)).toBe(0);
    expect(combatRatioColumn(-10)).toBe(1);
    expect(combatRatioColumn(-2)).toBe(5);
    expect(combatRatioColumn(-1)).toBe(5);
    expect(combatRatioColumn(0)).toBe(6);
    expect(combatRatioColumn(1)).toBe(7);
    expect(combatRatioColumn(2)).toBe(7);
    expect(combatRatioColumn(10)).toBe(11);
    expect(combatRatioColumn(11)).toBe(12);
    expect(combatRatioColumn(20)).toBe(12);
  });
});

describe("lookupRound (celdas conocidas)", () => {
  it("ratio 0, saca 0 → enemigo pierde 12, Lobo Solitario 0 (crítico)", () => {
    expect(lookupRound(0, 0)).toEqual({ enemyLoss: 12, loneWolfLoss: 0 });
  });

  it("ratio 0, saca 9 → enemigo 11, Lobo Solitario 0", () => {
    expect(lookupRound(0, 9)).toEqual({ enemyLoss: 11, loneWolfLoss: 0 });
  });

  it("ratio ≥+11, saca 0 → enemigo K (muerto)", () => {
    expect(lookupRound(11, 0)).toEqual({ enemyLoss: "K", loneWolfLoss: 0 });
  });

  it("ratio ≤−11, saca 1 → Lobo Solitario K (muerto)", () => {
    expect(lookupRound(-11, 1)).toEqual({ enemyLoss: 0, loneWolfLoss: "K" });
  });

  it("ratio +2, saca 1 → enemigo 4, Lobo Solitario 5", () => {
    expect(lookupRound(2, 1)).toEqual({ enemyLoss: 4, loneWolfLoss: 5 });
  });
});
