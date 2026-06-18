import { describe, expect, it } from "vitest";
import {
  combatRatio,
  type Enemy,
  fightRound,
  startCombat,
} from "./combat";

const enemy: Enemy = { name: "Kraan", combatSkill: 13, endurance: 25 };
const fixed = (n: number) => () => n;

describe("combatRatio", () => {
  it("es Destreza de Lobo Solitario − Destreza del enemigo", () => {
    expect(combatRatio(15, 13)).toBe(2);
  });

  it("suma +2 por 'Dominio de las Armas' y +2 por 'Ataque Psíquico'", () => {
    expect(combatRatio(15, 13, { weaponskill: true })).toBe(4);
    expect(combatRatio(15, 13, { mindblast: true })).toBe(4);
    expect(combatRatio(15, 13, { weaponskill: true, mindblast: true })).toBe(6);
  });

  it("aplica el bonus de sección (puede ser negativo)", () => {
    expect(combatRatio(15, 13, { bonus: -3 })).toBe(-1);
  });

  it("resta 4 cuando Lobo Solitario no lleva armas (unarmed)", () => {
    expect(combatRatio(15, 13, { unarmed: true })).toBe(-2);
  });
});

describe("startCombat", () => {
  it("calcula el ratio y prepara las resistencias", () => {
    const state = startCombat(15, 25, enemy);
    expect(state.ratio).toBe(2);
    expect(state.loneWolfEndurance).toBe(25);
    expect(state.enemyEndurance).toBe(25);
    expect(state.status).toBe("ongoing");
  });
});

describe("fightRound", () => {
  it("aplica el daño de un asalto a ambos (ratio 2, saca 9)", () => {
    // ratio 2 → columna 7; fila 9 → enemigo 12, Lobo Solitario 0
    const state = fightRound(startCombat(15, 25, enemy), fixed(9));
    expect(state.enemyEndurance).toBe(13);
    expect(state.loneWolfEndurance).toBe(25);
    expect(state.status).toBe("ongoing");
    expect(state.rounds).toHaveLength(1);
  });

  it("victoria por 'K' (ratio alto, saca 0)", () => {
    const weak: Enemy = { name: "Giak", combatSkill: 10, endurance: 30 };
    const state = fightRound(startCombat(25, 25, weak), fixed(0)); // ratio 15
    expect(state.enemyEndurance).toBe(0);
    expect(state.status).toBe("won");
  });

  it("derrota por 'K' (ratio bajo, saca 1)", () => {
    const strong: Enemy = { name: "Vordak", combatSkill: 25, endurance: 30 };
    const state = fightRound(startCombat(10, 25, strong), fixed(1)); // ratio -15
    expect(state.loneWolfEndurance).toBe(0);
    expect(state.status).toBe("lost");
  });

  it("no muta el estado anterior", () => {
    const initial = startCombat(15, 25, enemy);
    fightRound(initial, fixed(9));
    expect(initial.enemyEndurance).toBe(25);
    expect(initial.rounds).toHaveLength(0);
  });

  it("un combate completo termina en victoria o derrota", () => {
    let state = startCombat(15, 25, enemy);
    let guard = 0;
    while (state.status === "ongoing" && guard++ < 100) {
      state = fightRound(state, fixed(7)); // número favorable y constante
    }
    expect(state.status).toBe("won");
    expect(state.enemyEndurance).toBe(0);
  });

  it("ignora asaltos si el combate ya terminó", () => {
    const won = fightRound(startCombat(25, 25, { name: "x", combatSkill: 10, endurance: 5 }), fixed(0));
    const after = fightRound(won, fixed(0));
    expect(after).toBe(won);
  });
});
