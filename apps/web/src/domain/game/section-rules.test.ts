import { describe, expect, it } from "vitest";
import type { Character } from "../character/character";
import { createCharacter } from "../character/create-character";
import type { KaiDiscipline } from "../character/kai-discipline";
import {
  applyEntryEffect,
  applyRollOutcome,
  collectGold,
  evaluateCondition,
  resolveRoll,
  SECTION_CHOICE_CONDITIONS,
  SECTION_COMBAT_RULES,
  SECTION_ENTRY_EFFECTS,
  SECTION_LOOT,
  SECTION_ROLL_TABLES,
} from "./section-rules";

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
      evaluateCondition(
        { type: "discipline", discipline: "tracking" },
        character(),
      ),
    ).toBe(true);
    expect(
      evaluateCondition(
        { type: "discipline", discipline: "healing" },
        character(),
      ),
    ).toBe(false);
  });

  it("gold: compara contra el oro actual", () => {
    expect(evaluateCondition({ type: "gold", minGold: 10 }, character())).toBe(
      true,
    );
    expect(evaluateCondition({ type: "gold", minGold: 11 }, character())).toBe(
      false,
    );
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
    expect(
      evaluateCondition({ type: "item", itemId: "meal-0" }, character()),
    ).toBe(true);
    expect(
      evaluateCondition({ type: "item", itemId: "nope" }, character()),
    ).toBe(false);
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
    const { character: result } = applyEntryEffect(hurt, {
      enduranceDelta: -10,
    });
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
    const { character: c, messages } = applyEntryEffect(noMeal, {
      requiresMeal: true,
    });
    expect(c.stats.enduranceCurrent).toBe(22);
    expect(messages[0]).toMatch(/pierdes 3/);
  });

  it("Caza evita comer y no penaliza", () => {
    const hunter = character({
      disciplines: [
        "hunting",
        "camouflage",
        "tracking",
        "sixthSense",
        "mindblast",
      ],
      backpack: [],
    });
    const { character: c, messages } = applyEntryEffect(hunter, {
      requiresMeal: true,
    });
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
    for (const id of [
      "sect130",
      "sect147",
      "sect168",
      "sect184",
      "sect235",
      "sect300",
    ]) {
      expect(SECTION_ENTRY_EFFECTS[id]?.requiresMeal).toBe(true);
    }
  });
});

describe("resolveRoll", () => {
  it("elige la rama según el número de tirada", () => {
    const table = SECTION_ROLL_TABLES.sect294; // [0-2], [3-6], [7-9]
    expect(resolveRoll(table, 0)?.target).toBe("sect230");
    expect(resolveRoll(table, 2)?.target).toBe("sect230");
    expect(resolveRoll(table, 5)?.target).toBe("sect190");
    expect(resolveRoll(table, 9)?.target).toBe("sect321");
  });

  it("toda tabla cubre los 10 resultados (0-9) sin huecos ni solapes", () => {
    for (const [id, table] of Object.entries(SECTION_ROLL_TABLES)) {
      for (let n = 0; n <= 9; n++) {
        const matches = table.filter((o) => n >= o.min && n <= o.max);
        expect(matches.length, `${id} con tirada ${n}`).toBe(1);
      }
    }
  });

  it("las ramas apuntan a secciones reales", () => {
    for (const table of Object.values(SECTION_ROLL_TABLES)) {
      for (const o of table) expect(o.target).toMatch(/^sect\d+$/);
    }
  });
});

describe("applyRollOutcome", () => {
  it("aplica el daño de la rama (sect36, 0-4)", () => {
    // biome-ignore lint/style/noNonNullAssertion: resolveRoll devuelve non-null para índices dentro del rango
    const out = resolveRoll(SECTION_ROLL_TABLES.sect36, 3)!;
    const { character: c, messages } = applyRollOutcome(character(), out);
    expect(c.stats.enduranceCurrent).toBe(23);
    expect(messages[0]).toMatch(/pierdes 2/i);
  });

  it("la rama segura no cambia nada (sect36, 5-9)", () => {
    // biome-ignore lint/style/noNonNullAssertion: resolveRoll devuelve non-null para índices dentro del rango
    const out = resolveRoll(SECTION_ROLL_TABLES.sect36, 8)!;
    const { character: c } = applyRollOutcome(character(), out);
    expect(c.stats.enduranceCurrent).toBe(25);
  });

  it("pierde todo el equipo (sect188, 0-6) conservando especiales", () => {
    const c0 = character({
      weapons: [{ id: "axe", name: "Hacha" }],
      backpack: [{ id: "meal-0", name: "Comida", kind: "meal" }],
      specialItems: [{ id: "map", name: "Mapa de Sommerlund" }],
      gold: 12,
    });
    // biome-ignore lint/style/noNonNullAssertion: resolveRoll devuelve non-null para índices dentro del rango
    const out = resolveRoll(SECTION_ROLL_TABLES.sect188, 3)!;
    const { character: c } = applyRollOutcome(c0, out);
    expect(c.weapons).toHaveLength(0);
    expect(c.backpack).toHaveLength(0);
    expect(c.gold).toBe(0);
    expect(c.specialItems).toHaveLength(1);
  });
});

describe("collectGold", () => {
  it("suma el oro acotado al máximo de la bolsa", () => {
    const { character: c, messages } = collectGold(character({ gold: 45 }), 28);
    expect(c.gold).toBe(50);
    expect(messages[0]).toMatch(/recoges 5/);
  });
});

describe("SECTION_LOOT", () => {
  it("los objetos de botín declaran ranura válida", () => {
    for (const entry of Object.values(SECTION_LOOT)) {
      for (const item of entry.items ?? []) {
        expect(["weapon", "backpack", "special"]).toContain(item.slot);
      }
    }
  });
});
