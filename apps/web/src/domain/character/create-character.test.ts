import { describe, expect, it } from "vitest";
import {
  createCharacter,
  rollCombatSkill,
  rollEndurance,
  rollWeaponskillWeapon,
} from "./create-character";
import type { KaiDiscipline } from "./kai-discipline";
import { WEAPON_NAMES } from "./weapon";
import type { RandomNumber } from "../random/random-number";

/** RandomNumber que siempre devuelve el mismo número. */
const fixed = (n: number): RandomNumber => () => n;

const fiveDisciplines: KaiDiscipline[] = [
  "camouflage",
  "hunting",
  "sixthSense",
  "tracking",
  "healing",
];

describe("tiradas de creación", () => {
  it("Destreza = 10 + número aleatorio", () => {
    expect(rollCombatSkill(fixed(0))).toBe(10);
    expect(rollCombatSkill(fixed(9))).toBe(19);
  });

  it("Resistencia = 20 + número aleatorio", () => {
    expect(rollEndurance(fixed(0))).toBe(20);
    expect(rollEndurance(fixed(9))).toBe(29);
  });

  it("rollWeaponskillWeapon devuelve un arma válida", () => {
    expect(WEAPON_NAMES[rollWeaponskillWeapon(fixed(0))]).toBeDefined();
    expect(WEAPON_NAMES[rollWeaponskillWeapon(fixed(5))]).toBeDefined();
  });
});

describe("createCharacter", () => {
  it("usa las stats dadas y pone la Resistencia actual al máximo", () => {
    const character = createCharacter({
      combatSkill: 13,
      enduranceMax: 28,
      disciplines: fiveDisciplines,
    });
    expect(character.stats.combatSkill).toBe(13);
    expect(character.stats.enduranceMax).toBe(28);
    expect(character.stats.enduranceCurrent).toBe(28);
    expect(character.disciplines).toHaveLength(5);
  });

  it("exige exactamente 5 disciplinas", () => {
    expect(() =>
      createCharacter({
        combatSkill: 15,
        enduranceMax: 25,
        disciplines: fiveDisciplines.slice(0, 4),
      }),
    ).toThrow(/5 disciplinas/);
  });

  it("no permite disciplinas repetidas", () => {
    const repeated: KaiDiscipline[] = [
      "hunting",
      "hunting",
      "sixthSense",
      "tracking",
      "healing",
    ];
    expect(() =>
      createCharacter({ combatSkill: 15, enduranceMax: 25, disciplines: repeated }),
    ).toThrow(/repetir/);
  });

  it('"Dominio de las Armas" requiere un arma', () => {
    const withWeaponskill: KaiDiscipline[] = [
      "weaponskill",
      "hunting",
      "sixthSense",
      "tracking",
      "healing",
    ];
    expect(() =>
      createCharacter({
        combatSkill: 15,
        enduranceMax: 25,
        disciplines: withWeaponskill,
      }),
    ).toThrow(/arma/);

    const character = createCharacter({
      combatSkill: 15,
      enduranceMax: 25,
      disciplines: withWeaponskill,
      weaponskillWeapon: "sword",
    });
    expect(character.weaponskillWeapon).toBe("sword");
  });

  it("no deja exceder el oro máximo", () => {
    expect(() =>
      createCharacter({
        combatSkill: 15,
        enduranceMax: 25,
        disciplines: fiveDisciplines,
        gold: 999,
      }),
    ).toThrow(/oro/);
  });

  it("no muta los arrays de entrada (copias defensivas)", () => {
    const disciplines = [...fiveDisciplines];
    const character = createCharacter({
      combatSkill: 15,
      enduranceMax: 25,
      disciplines,
    });
    expect(character.disciplines).not.toBe(disciplines);
  });
});
