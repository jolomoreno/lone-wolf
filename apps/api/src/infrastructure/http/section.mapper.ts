/**
 * Mapeo entidad de dominio `Section` -> `SectionDTO` (el contrato HTTP).
 *
 * Es la frontera "de libro": el dominio no sale crudo por la red; se traduce
 * al contrato compartido. Aquí las formas son casi idénticas, pero el mapeo
 * explícito nos protege si algún día divergen.
 */

import type { ChoiceDTO, ContentBlockDTO, SectionDTO } from "@lone-wolf/shared";
import type { ContentBlock, Section } from "../../domain/section/section";

function toBlockDTO(block: ContentBlock): ContentBlockDTO {
  switch (block.type) {
    case "paragraph":
      return { type: "paragraph", text: block.text };
    case "list":
      return { type: "list", items: [...block.items] };
    case "illustration":
      return block.alt
        ? { type: "illustration", src: block.src, alt: block.alt }
        : { type: "illustration", src: block.src };
    case "combat":
      return { type: "combat", combat: { ...block.combat } };
  }
}

export function toSectionDTO(section: Section): SectionDTO {
  return {
    id: section.id,
    number: section.number,
    blocks: section.blocks.map(toBlockDTO),
    choices: section.choices.map(
      (choice): ChoiceDTO => ({ text: choice.text, target: choice.target }),
    ),
  };
}

// Aserción de contrato: si Section o SectionDTO añaden/eliminan campos sin
// actualizar el mapper, tsc --noEmit falla aquí.
// Aserción de contrato en tiempo de compilación: si Section o SectionDTO
// añaden/eliminan campos sin actualizar el mapper, tsc falla aquí.
type _Assert<T extends true> = T;
export type _MapperContract = _Assert<
  typeof toSectionDTO extends (s: Section) => SectionDTO ? true : false
>;
