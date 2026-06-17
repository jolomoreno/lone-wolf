import { describe, expect, it } from "vitest";
import {
  applyEntryEffect,
  evaluateCondition,
  SECTION_CHOICE_CONDITIONS,
  SECTION_COMBAT_RULES,
  SECTION_ENTRY_EFFECTS,
} from "./section-rules";
import { createCharacter } from "../character/create-character";
import type { KaiDiscipline } from "../character/kai-discipline";
import type { Character } from "../character/character";

const baseDisciplines: KaiDiscipline[] = [
  "camouflage",
  "sixthSense",
  "tracking",
  "weaponskill",
  "mindblast",
];

function character(overrides: Partial<Character> = {}): Character {
  const c = createCharacter({
    combatSkill: 15,
    enduranceMax: 25,
    disciplines: baseDisciplines,
    weaponskillWeapon: "sword",
    backpack: [{ id: "meal-0", name: "Comida", kind: "meal" }],
    gold: 10,
  });
  return { ...c, ...overrides };
}

describe("evaluateCondition", () => {
  it("discipline: true si el personaje la tiene", () => {
    expect(
      evaluateCondition({ type: "discipline", discipline: "tracking" }, character()),
    ).toBe(true);
    expect(
      evaluateCondition({ type: "discipline", discipline: "healing" }, character()),
    ).toBe(false);
  });

  it("gold: compara contra el oro actual", () => {
    expect(evaluateCondition({ type: "gold", minGold: 10 }, character())).toBe(true);
    expect(evaluateCondition({ type: "gold", minGold: 11 }, character())).toBe(false);
  });

  it("endurance: compara según el operador", () => {
    const c = character();
    expect(
      evaluateCondition({ type: "endurance", comparison: ">=", value: 25 }, c),
    ).toBe(true);
    expect(
      evaluateCondition({ type: "endurance", comparison: "<", value: 25 }, c),
    ).toBe(false);
  });

  it("item: busca en armas, mochila y especiales", () => {
    expect(evaluateCondition({ type: "item", itemId: "meal-0" }, character())).toBe(true);
    expect(evaluateCondition({ type: "item", itemId: "nope" }, character())).toBe(false);
  });
});

describe("applyEntryEffect — daño narrativo", () => {
  it("aplica pérdida de Resistencia y lo informa", () => {
    const { character: c, messages } = applyEntryEffect(character(), {
      enduranceDelta: -6,
    });
    expect(c.stats.enduranceCurrent).toBe(19);
    expect(messages[0]).toMatch(/Pierdes 6/);
  });

  it("nunca baja de 0", () => {
    const c = character();
    const hurt = { ...c, stats: { ...c.stats, enduranceCurrent: 3 } };
    const { character: result } = applyEntryEffect(hurt, { enduranceDelta: -10 });
    expect(result.stats.enduranceCurrent).toBe(0);
  });
});

describe("applyEntryEffect — comidas", () => {
  it("consume una Comida si la tiene", () => {
    const { character: c, messages } = applyEntryEffect(character(), {
      requiresMeal: true,
    });
    expect(c.backpack.filter((i) => i.kind === "meal")).toHaveLength(0);
    expect(c.stats.enduranceCurrent).toBe(25);
    expect(messages[0]).toMatch(/Consumes una Comida/);
  });

  it("pierde 3 de Resistencia si no tiene Comida", () => {
    const noMeal = character({ backpack: [] });
    const { character: c, messages } = applyEntryEffect(noMeal, { requiresMeal: true });
    expect(c.stats.enduranceCurrent).toBe(22);
    expect(messages[0]).toMatch(/pierdes 3/);
  });

  it("Caza evita comer y no penaliza", () => {
    const hunter = character({
      disciplines: ["hunting", "camouflage", "tracking", "sixthSense", "mindblast"],
      backpack: [],
    });
    const { character: c, messages } = applyEntryEffect(hunter, { requiresMeal: true });
    expect(c.stats.enduranceCurrent).toBe(25);
    expect(messages[0]).toMatch(/Caza/);
  });

  it("respeta una penalización personalizada", () => {
    const noMeal = character({ backpack: [] });
    const { character: c } = applyEntryEffect(noMeal, {
      requiresMeal: true,
      mealPenalty: 5,
    });
    expect(c.stats.enduranceCurrent).toBe(20);
  });
});

describe("tablas de datos curados", () => {
  it("las condiciones de elección apuntan a secciones reales (sectNNN)", () => {
    for (const rules of Object.values(SECTION_CHOICE_CONDITIONS)) {
      for (const rule of rules) {
        expect(rule.target).toMatch(/^sect\d+$/);
      }
    }
  });

  it("las elusiones apuntan a secciones reales", () => {
    for (const rules of Object.values(SECTION_COMBAT_RULES)) {
      if (rules.evasion) expect(rules.evasion.target).toMatch(/^sect\d+$/);
    }
  });

  it("hay efectos de entrada para las secciones de comida conocidas", () => {
    for (const id of ["sect130", "sect147", "sect168", "sect184", "sect235", "sect300"]) {
      expect(SECTION_ENTRY_EFFECTS[id]?.requiresMeal).toBe(true);
    }
  });
});
