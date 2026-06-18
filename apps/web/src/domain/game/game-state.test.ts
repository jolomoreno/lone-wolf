import { describe, expect, it } from "vitest";
import { applyDamage } from "../character/character-operations";
import { createCharacter } from "../character/create-character";
import type { KaiDiscipline } from "../character/kai-discipline";
import {
  createGameState,
  getFlag,
  goToSection,
  SAVE_FORMAT_VERSION,
  setFlag,
  setPendingCombat,
  updateCharacter,
} from "./game-state";

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
    const state = createGameState(character(), "sect1");
    expect(state.version).toBe(SAVE_FORMAT_VERSION);
    expect(state.currentSection).toBe("sect1");
    expect(state.history).toEqual(["sect1"]);
    expect(state.flags).toEqual({});
    expect(typeof state.updatedAt).toBe("string");
  });

  it("usa 'sect1' como sección inicial por defecto", () => {
    const state = createGameState(character());
    expect(state.currentSection).toBe("sect1");
  });
});

describe("goToSection", () => {
  it("cambia de sección y la añade al historial", () => {
    const initial = createGameState(character(), "sect1");
    const next = goToSection(initial, "sect85");
    expect(next.currentSection).toBe("sect85");
    expect(next.history).toEqual(["sect1", "sect85"]);
  });

  it("no muta el estado anterior", () => {
    const initial = createGameState(character(), "sect1");
    goToSection(initial, "sect85");
    expect(initial.currentSection).toBe("sect1");
    expect(initial.history).toEqual(["sect1"]);
  });
});

describe("updateCharacter", () => {
  it("sustituye la ficha (p.ej. tras recibir daño)", () => {
    const initial = createGameState(character(), "sect1");
    const hurt = updateCharacter(initial, applyDamage(initial.character, 10));
    expect(hurt.character.stats.enduranceCurrent).toBe(15);
    expect(initial.character.stats.enduranceCurrent).toBe(25);
  });
});

describe("flags", () => {
  it("fija y lee banderas", () => {
    const state = setFlag(
      createGameState(character(), "sect1"),
      "tieneMapa",
      true,
    );
    expect(getFlag(state, "tieneMapa")).toBe(true);
    expect(getFlag(state, "noExiste")).toBeUndefined();
  });
});

describe("setPendingCombat", () => {
  const enemy = { name: "Kraan", combatSkill: 13, endurance: 25 };
  const mockCombat = {
    enemy,
    ratio: 2,
    loneWolfEndurance: 20,
    enemyEndurance: 15,
    rounds: [],
    status: "ongoing" as const,
  };

  it("guarda el estado del combate en curso", () => {
    const state = createGameState(character(), "sect1");
    const withCombat = setPendingCombat(state, mockCombat);
    expect(withCombat.pendingCombat).toEqual(mockCombat);
    expect(state.pendingCombat).toBeUndefined();
  });

  it("borra el combate al pasar null", () => {
    const state = setPendingCombat(
      createGameState(character(), "sect1"),
      mockCombat,
    );
    const cleared = setPendingCombat(state, null);
    expect(cleared.pendingCombat).toBeNull();
  });
});
