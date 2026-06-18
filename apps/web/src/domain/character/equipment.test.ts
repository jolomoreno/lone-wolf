import { describe, expect, it } from "vitest";
import {
  STOREROOM,
  createStartingCharacter,
  rollStoreroomChoiceId,
} from "./equipment";
import { countMeals } from "./character";
import type { KaiDiscipline } from "./kai-discipline";

const disciplines: KaiDiscipline[] = [
  "camouflage",
  "hunting",
  "sixthSense",
  "tracking",
  "healing",
];
const base = { combatSkill: 15, enduranceMax: 25, gold: 5, disciplines };

describe("STOREROOM", () => {
  it("tiene 9 objetos", () => {
    expect(STOREROOM).toHaveLength(9);
  });
});

describe("rollStoreroomChoiceId", () => {
  it("mapea la tirada 0-9 a un id de objeto 1-9 (tabla explícita, sin sesgo)", () => {
    expect(rollStoreroomChoiceId(() => 0)).toBe(1); // Espada
    expect(rollStoreroomChoiceId(() => 3)).toBe(4); // Cota de Malla
    expect(rollStoreroomChoiceId(() => 8)).toBe(9); // 12 Coronas
    // El 9 también da 12 Coronas (no repite Espada como hacía el % 9 anterior)
    expect(rollStoreroomChoiceId(() => 9)).toBe(9);
  });

  it("siempre devuelve un id existente en el almacén", () => {
    for (let n = 0; n <= 9; n++) {
      const id = rollStoreroomChoiceId(() => n);
      expect(STOREROOM.some((c) => c.id === id)).toBe(true);
    }
  });
});

describe("createStartingCharacter", () => {
  it("siempre incluye el equipo fijo: Hacha, 1 Comida y Mapa de Sommerlund", () => {
    const character = createStartingCharacter({ ...base, storeroomChoiceId: 1 });
    expect(character.weapons.some((w) => w.id === "axe")).toBe(true);
    expect(character.specialItems.some((s) => s.id === "map")).toBe(true);
    expect(countMeals(character)).toBe(1);
  });

  it("objeto 1 (Espada): se convierte en la 2ª arma", () => {
    const character = createStartingCharacter({ ...base, storeroomChoiceId: 1 });
    expect(character.weapons).toHaveLength(2);
    expect(character.weapons.some((w) => w.id === "sword")).toBe(true);
  });

  it("objeto 2 (Casco): suma +2 a la Resistencia", () => {
    const character = createStartingCharacter({ ...base, storeroomChoiceId: 2 });
    expect(character.stats.enduranceMax).toBe(27);
    expect(character.stats.enduranceCurrent).toBe(27);
  });

  it("objeto 3 (Dos Comidas): deja 3 comidas en total", () => {
    const character = createStartingCharacter({ ...base, storeroomChoiceId: 3 });
    expect(countMeals(character)).toBe(3);
  });

  it("objeto 4 (Cota de Malla): suma +4 a la Resistencia", () => {
    const character = createStartingCharacter({ ...base, storeroomChoiceId: 4 });
    expect(character.stats.enduranceMax).toBe(29);
  });

  it("objeto 6 (Poción): va a la mochila como objeto de poción", () => {
    const character = createStartingCharacter({ ...base, storeroomChoiceId: 6 });
    expect(character.backpack.some((i) => i.kind === "potion")).toBe(true);
  });

  it("objeto 9 (12 Coronas): suma 12 al oro tirado", () => {
    const character = createStartingCharacter({ ...base, gold: 5, storeroomChoiceId: 9 });
    expect(character.gold).toBe(17);
  });

  it("rechaza un objeto de almacén inexistente", () => {
    expect(() =>
      createStartingCharacter({ ...base, storeroomChoiceId: 99 }),
    ).toThrow();
  });
});
