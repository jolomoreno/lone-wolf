import { describe, expect, it } from "vitest";
import {
  createGameState,
  getFlag,
  goToSection,
  SAVE_FORMAT_VERSION,
  setFlag,
  updateCharacter,
} from "./game-state";
import { createCharacter } from "../character/create-character";
import { applyDamage } from "../character/character-operations";
import type { KaiDiscipline } from "../character/kai-discipline";

const disciplines: KaiDiscipline[] = [
  "camouflage",
  "hunting",
  "sixthSense",
  "tracking",
  "healing",
];

function character() {
  return createCharacter({ combatSkill: 15, enduranceMax: 25, disciplines });
}

describe("createGameState", () => {
  it("arranca en la sección dada, con historial y flags vacíos", () => {
    const state = createGameState(character(), 1);
    expect(state.version).toBe(SAVE_FORMAT_VERSION);
    expect(state.currentSection).toBe(1);
    expect(state.history).toEqual([1]);
    expect(state.flags).toEqual({});
    expect(typeof state.updatedAt).toBe("string");
  });
});

describe("goToSection", () => {
  it("cambia de sección y la añade al historial", () => {
    const initial = createGameState(character(), 1);
    const next = goToSection(initial, 85);
    expect(next.currentSection).toBe(85);
    expect(next.history).toEqual([1, 85]);
  });

  it("no muta el estado anterior", () => {
    const initial = createGameState(character(), 1);
    goToSection(initial, 85);
    expect(initial.currentSection).toBe(1);
    expect(initial.history).toEqual([1]);
  });
});

describe("updateCharacter", () => {
  it("sustituye la ficha (p.ej. tras recibir daño)", () => {
    const initial = createGameState(character(), 1);
    const hurt = updateCharacter(initial, applyDamage(initial.character, 10));
    expect(hurt.character.stats.enduranceCurrent).toBe(15);
    expect(initial.character.stats.enduranceCurrent).toBe(25);
  });
});

describe("flags", () => {
  it("fija y lee banderas", () => {
    const state = setFlag(createGameState(character(), 1), "tieneMapa", true);
    expect(getFlag(state, "tieneMapa")).toBe(true);
    expect(getFlag(state, "noExiste")).toBeUndefined();
  });
});
