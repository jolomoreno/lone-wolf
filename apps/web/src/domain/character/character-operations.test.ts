import { describe, expect, it } from "vitest";
import { createCharacter } from "./create-character";
import {
  addToBackpack,
  addWeapon,
  applyDamage,
  changeGold,
  heal,
  removeFromBackpack,
  setEnduranceCurrent,
} from "./character-operations";
import { type Character, isDead, MAX_BACKPACK_ITEMS } from "./character";
import type { KaiDiscipline } from "./kai-discipline";

const disciplines: KaiDiscipline[] = [
  "camouflage",
  "hunting",
  "sixthSense",
  "tracking",
  "healing",
];

/** Personaje base con Resistencia máxima 25. */
function baseCharacter(): Character {
  return createCharacter({ combatSkill: 15, enduranceMax: 25, disciplines });
}

describe("Resistencia", () => {
  it("applyDamage nunca baja de 0 y detecta la muerte", () => {
    const hurt = applyDamage(baseCharacter(), 100);
    expect(hurt.stats.enduranceCurrent).toBe(0);
    expect(isDead(hurt)).toBe(true);
  });

  it("heal nunca supera el máximo", () => {
    const character = baseCharacter(); // max 25
    const damaged = applyDamage(character, 10); // 15
    const healed = heal(damaged, 100);
    expect(healed.stats.enduranceCurrent).toBe(25);
  });

  it("no muta el personaje original", () => {
    const character = baseCharacter();
    applyDamage(character, 10);
    expect(character.stats.enduranceCurrent).toBe(25);
  });

  it("setEnduranceCurrent acota entre 0 y el máximo", () => {
    const character = baseCharacter(); // max 25
    expect(setEnduranceCurrent(character, 12).stats.enduranceCurrent).toBe(12);
    expect(setEnduranceCurrent(character, -5).stats.enduranceCurrent).toBe(0);
    expect(setEnduranceCurrent(character, 999).stats.enduranceCurrent).toBe(25);
  });
});

describe("inventario", () => {
  it("respeta el límite de la mochila", () => {
    let character = baseCharacter();
    for (let i = 0; i < MAX_BACKPACK_ITEMS; i++) {
      character = addToBackpack(character, { id: `item${i}`, name: `Objeto ${i}` });
    }
    expect(character.backpack).toHaveLength(MAX_BACKPACK_ITEMS);
    expect(() =>
      addToBackpack(character, { id: "extra", name: "De más" }),
    ).toThrow(/llena/);
  });

  it("quita objetos de la mochila por id", () => {
    const character = addToBackpack(baseCharacter(), { id: "map", name: "Mapa" });
    const without = removeFromBackpack(character, "map");
    expect(without.backpack).toHaveLength(0);
  });

  it("no deja llevar más de 2 armas", () => {
    let character = addWeapon(baseCharacter(), { id: "sword", name: "Espada" });
    character = addWeapon(character, { id: "axe", name: "Hacha" });
    expect(() =>
      addWeapon(character, { id: "dagger", name: "Daga" }),
    ).toThrow(/armas/);
  });

  it("mantiene el oro entre 0 y el máximo", () => {
    const character = baseCharacter();
    expect(changeGold(character, -10).gold).toBe(0);
    expect(changeGold(character, 999).gold).toBe(50);
  });
});
