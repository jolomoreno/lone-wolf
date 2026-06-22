import { describe, expect, it } from "vitest";
import type { Section } from "../../domain/section/section";
import { toSectionDTO } from "./section.mapper";

function section(overrides: Partial<Section> = {}): Section {
  return {
    id: "sect1",
    number: 1,
    blocks: [],
    choices: [],
    ...overrides,
  };
}

describe("toSectionDTO", () => {
  it("preserva id y number (incluyendo null)", () => {
    const dto = toSectionDTO(section({ id: "sect99", number: null }));
    expect(dto.id).toBe("sect99");
    expect(dto.number).toBeNull();
  });

  it("mapea bloque párrafo", () => {
    const dto = toSectionDTO(
      section({ blocks: [{ type: "paragraph", text: "Hola." }] }),
    );
    expect(dto.blocks).toEqual([{ type: "paragraph", text: "Hola." }]);
  });

  it("mapea bloque lista con copia superficial de items", () => {
    const items = ["a", "b"];
    const dto = toSectionDTO(section({ blocks: [{ type: "list", items }] }));
    expect(dto.blocks[0]).toEqual({ type: "list", items: ["a", "b"] });
    // la copia es nueva (no la misma referencia)
    // biome-ignore lint/style/noNonNullAssertion: longitud comprobada arriba
    expect((dto.blocks[0]! as { items: string[] }).items).not.toBe(items);
  });

  it("mapea ilustración con alt", () => {
    const dto = toSectionDTO(
      section({
        blocks: [{ type: "illustration", src: "ill1.png", alt: "Un guerrero" }],
      }),
    );
    expect(dto.blocks[0]).toEqual({
      type: "illustration",
      src: "ill1.png",
      alt: "Un guerrero",
    });
  });

  it("mapea ilustración sin alt y no incluye la propiedad alt", () => {
    const dto = toSectionDTO(
      section({ blocks: [{ type: "illustration", src: "ill1.png" }] }),
    );
    expect(dto.blocks[0]).toEqual({ type: "illustration", src: "ill1.png" });
    // biome-ignore lint/style/noNonNullAssertion: longitud comprobada arriba
    expect("alt" in dto.blocks[0]!).toBe(false);
  });

  it("mapea bloque de combate con copia superficial del objeto combat", () => {
    const combat = { enemy: "Kraan", combatSkill: 14, endurance: 20 };
    const dto = toSectionDTO(section({ blocks: [{ type: "combat", combat }] }));
    expect(dto.blocks[0]).toEqual({ type: "combat", combat });
    // la copia es nueva
    // biome-ignore lint/style/noNonNullAssertion: longitud comprobada arriba
    expect((dto.blocks[0]! as { combat: object }).combat).not.toBe(combat);
  });

  it("mapea choices con texto y target", () => {
    const dto = toSectionDTO(
      section({ choices: [{ text: "Ve al 2.", target: "sect2" }] }),
    );
    expect(dto.choices).toEqual([{ text: "Ve al 2.", target: "sect2" }]);
  });

  it("preserva el orden de múltiples bloques", () => {
    const dto = toSectionDTO(
      section({
        blocks: [
          { type: "paragraph", text: "Primero." },
          { type: "list", items: ["x"] },
          { type: "paragraph", text: "Tercero." },
        ],
      }),
    );
    expect(dto.blocks.map((b) => b.type)).toEqual([
      "paragraph",
      "list",
      "paragraph",
    ]);
  });
});
