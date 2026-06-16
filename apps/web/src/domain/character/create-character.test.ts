import { describe, expect, it } from "vitest";
import {
  createCharacter,
  rollCombatSkill,
  rollEndurance,
} from "./create-character";
import type { KaiDiscipline } from "./kai-discipline";
import type { RandomNumber } from "../random/random-number";

/** RandomNumber que siempre devuelve el mismo número. */
const fixed = (n: number): RandomNumber => () => n;
/** RandomNumber que recorre una secuencia (para tiradas distintas). */
const sequence = (...numbers: number[]): RandomNumber => {
  let i = 0;
  return () => numbers[i++ % numbers.length];
};

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
});

describe("createCharacter", () => {
  it("crea con stats tirados y la Resistencia actual al máximo", () => {
    const character = createCharacter({
      disciplines: fiveDisciplines,
      random: sequence(3, 8), // 1ª tirada Destreza, 2ª Resistencia
    });
    expect(character.stats.combatSkill).toBe(13);
    expect(character.stats.enduranceMax).toBe(28);
    expect(character.stats.enduranceCurrent).toBe(28);
    expect(character.disciplines).toHaveLength(5);
  });

  it("exige exactamente 5 disciplinas", () => {
    expect(() =>
      createCharacter({ disciplines: fiveDisciplines.slice(0, 4) }),
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
    expect(() => createCharacter({ disciplines: repeated })).toThrow(/repetir/);
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
      createCharacter({ disciplines: withWeaponskill, random: fixed(0) }),
    ).toThrow(/arma/);

    const character = createCharacter({
      disciplines: withWeaponskill,
      weaponskillWeapon: "sword",
      random: fixed(0),
    });
    expect(character.weaponskillWeapon).toBe("sword");
  });

  it("no deja exceder el oro máximo", () => {
    expect(() =>
      createCharacter({ disciplines: fiveDisciplines, gold: 999 }),
    ).toThrow(/oro/);
  });

  it("no muta los arrays de entrada (copias defensivas)", () => {
    const disciplines = [...fiveDisciplines];
    const character = createCharacter({ disciplines });
    expect(character.disciplines).not.toBe(disciplines);
  });
});
