import { describe, expect, it, vi } from "vitest";
import type { Section } from "../../domain/section/section";
import type { SectionRepository } from "../../domain/section/section-repository";
import { GetSection } from "./get-section.use-case";

const sect1: Section = {
  id: "sect1",
  number: 1,
  blocks: [{ type: "paragraph", text: "Texto." }],
  choices: [{ text: "Ve al 2.", target: "sect2" }],
};

function makeRepo(result: Section | null): SectionRepository {
  return {
    findById: vi.fn().mockResolvedValue(result),
    findByNumber: vi.fn(),
    saveMany: vi.fn(),
    count: vi.fn(),
    clear: vi.fn(),
  };
}

describe("GetSection", () => {
  it("delega en el repositorio con el id recibido", async () => {
    const repo = makeRepo(sect1);
    await new GetSection(repo).execute("sect1");
    expect(repo.findById).toHaveBeenCalledWith("sect1");
    expect(repo.findById).toHaveBeenCalledTimes(1);
  });

  it("devuelve la sección cuando el repositorio la encuentra", async () => {
    const result = await new GetSection(makeRepo(sect1)).execute("sect1");
    expect(result).toBe(sect1);
  });

  it("devuelve null cuando el repositorio no la encuentra", async () => {
    const result = await new GetSection(makeRepo(null)).execute("sect999");
    expect(result).toBeNull();
  });
});
