import { describe, expect, it } from "vitest";
import type { Section } from "../../domain/section/section";
import { parseGamebook } from "./parse-gamebook-xml";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Envuelve contenido de <data> en un XML mínimo válido. */
function wrap(dataContent: string, id = "sect1", title = "1"): string {
  return `<gamebook><section id="${id}"><meta><title>${title}</title></meta><data>${dataContent}</data></section></gamebook>`;
}

/** Parsea y devuelve la primera sección; lanza si no hay ninguna. */
function first(xml: string): Section {
  const sections = parseGamebook(xml);
  const [s] = sections;
  if (!s) throw new Error("No se parseó ninguna sección");
  return s;
}

/** Atajo: wrap + first. */
function sect(dataContent: string, id = "sect1", title = "1"): Section {
  return first(wrap(dataContent, id, title));
}

// ---------------------------------------------------------------------------
// Bloques de contenido
// ---------------------------------------------------------------------------

describe("parseGamebook — párrafos", () => {
  it("parsea un párrafo simple", () => {
    const s = sect("<p>Hola mundo.</p>");
    expect(s.blocks).toEqual([{ type: "paragraph", text: "Hola mundo." }]);
  });

  it("normaliza espacios y saltos de línea dentro del párrafo", () => {
    const s = sect("<p>  múltiple   espacio  </p>");
    expect(s.blocks[0]).toEqual({
      type: "paragraph",
      text: "múltiple espacio",
    });
  });

  it("ignora párrafos vacíos", () => {
    const s = sect("<p></p><p>Válido.</p>");
    expect(s.blocks).toHaveLength(1);
    expect(s.blocks[0]).toEqual({ type: "paragraph", text: "Válido." });
  });
});

describe("parseGamebook — caracteres especiales (CHAR_MAP)", () => {
  it("convierte ch.ellips a …", () => {
    const s = sect("<p>Espera<ch.ellips/>un momento.</p>");
    expect((s.blocks[0] as { text: string }).text).toBe("Espera…un momento.");
  });

  it("convierte ch.endash a –", () => {
    const s = sect("<p>10<ch.endash/>20</p>");
    expect((s.blocks[0] as { text: string }).text).toBe("10–20");
  });

  it("convierte ch.apos al apóstrofe tipográfico (U+2019)", () => {
    const s = sect("<p>l<ch.apos/>herbe</p>");
    // U+2019 RIGHT SINGLE QUOTATION MARK, no el ASCII ‘ (U+0027)
    expect((s.blocks[0] as { text: string }).text).toBe("l’herbe");
  });

  it("convierte br a espacio (tras normalización)", () => {
    const s = sect("<p>Línea 1<br/>Línea 2</p>");
    expect((s.blocks[0] as { text: string }).text).toBe("Línea 1 Línea 2");
  });
});

describe("parseGamebook — choices", () => {
  it("parsea choice con idref como opción de navegación", () => {
    const s = sect('<choice idref="sect2">Ve al 2.</choice>');
    expect(s.choices).toEqual([{ text: "Ve al 2.", target: "sect2" }]);
    expect(s.blocks).toHaveLength(0);
  });

  it("parsea choice sin idref como párrafo (fin de partida)", () => {
    const s = sect("<choice>Tu aventura acaba aquí.</choice>");
    expect(s.choices).toHaveLength(0);
    expect(s.blocks).toEqual([
      { type: "paragraph", text: "Tu aventura acaba aquí." },
    ]);
  });

  it("extrae choice anidado dentro de <p> tanto en choices como en bloque", () => {
    const s = sect('<p>Puedes ir a <choice idref="sect2">2</choice>.</p>');
    expect(s.choices).toEqual([{ text: "2", target: "sect2" }]);
    expect(s.blocks).toHaveLength(1);
    expect((s.blocks[0] as { text: string }).text).toContain("2");
  });
});

describe("parseGamebook — combate", () => {
  it("parsea bloque de combate con enemy, combatSkill y endurance", () => {
    const s = sect(`
      <combat>
        <enemy>Kraan</enemy>
        <enemy-attribute class="combatskill">14</enemy-attribute>
        <enemy-attribute class="endurance">20</enemy-attribute>
      </combat>
    `);
    expect(s.blocks).toEqual([
      {
        type: "combat",
        combat: { enemy: "Kraan", combatSkill: 14, endurance: 20 },
      },
    ]);
  });

  it("usa 0 para atributos ausentes en el combate", () => {
    const s = sect("<combat><enemy>Enemigo</enemy></combat>");
    const block = s.blocks[0] as {
      type: string;
      combat: { combatSkill: number; endurance: number };
    };
    expect(block.combat.combatSkill).toBe(0);
    expect(block.combat.endurance).toBe(0);
  });

  it("usa 'Enemigo' como nombre por defecto si falta <enemy>", () => {
    const s = sect(`
      <combat>
        <enemy-attribute class="combatskill">10</enemy-attribute>
        <enemy-attribute class="endurance">15</enemy-attribute>
      </combat>
    `);
    const block = s.blocks[0] as { combat: { enemy: string } };
    expect(block.combat.enemy).toBe("Enemigo");
  });
});

describe("parseGamebook — ilustraciones", () => {
  it("parsea ilustración con src y alt", () => {
    const s = sect(`
      <illustration>
        <meta><description>Un guerrero</description></meta>
        <instance class="html" src="ill1.png"/>
      </illustration>
    `);
    expect(s.blocks).toEqual([
      { type: "illustration", src: "ill1.png", alt: "Un guerrero" },
    ]);
  });

  it("parsea ilustración sin description (alt ausente)", () => {
    const s = sect(`
      <illustration>
        <instance class="html" src="ill2.png"/>
      </illustration>
    `);
    expect(s.blocks[0]).toEqual({ type: "illustration", src: "ill2.png" });
    // biome-ignore lint/style/noNonNullAssertion: existencia verificada arriba
    expect("alt" in s.blocks[0]!).toBe(false);
  });

  it("ignora ilustración sin src (no se incluye en blocks)", () => {
    const s = sect(`
      <illustration>
        <meta><description>Sin imagen</description></meta>
      </illustration>
    `);
    expect(s.blocks).toHaveLength(0);
  });
});

describe("parseGamebook — listas <ul>", () => {
  it("parsea lista de items", () => {
    const s = sect("<ul><li>Item uno</li><li>Item dos</li></ul>");
    expect(s.blocks).toEqual([
      { type: "list", items: ["Item uno", "Item dos"] },
    ]);
  });

  it("filtra items vacíos", () => {
    const s = sect("<ul><li></li><li>Válido</li></ul>");
    expect(s.blocks).toEqual([{ type: "list", items: ["Válido"] }]);
  });

  it("no incluye el bloque si todos los items están vacíos", () => {
    const s = sect("<ul><li></li></ul>");
    expect(s.blocks).toHaveLength(0);
  });
});

describe("parseGamebook — listas <dl>", () => {
  it("parsea par término: definición", () => {
    const s = sect("<dl><dt>Término</dt><dd>Definición</dd></dl>");
    expect(s.blocks).toEqual([
      { type: "list", items: ["Término: Definición"] },
    ]);
  });

  it("parsea dd sin dt previo como item independiente", () => {
    const s = sect("<dl><dd>Solo definición</dd></dl>");
    expect(s.blocks).toEqual([{ type: "list", items: ["Solo definición"] }]);
  });

  it("incluye dt sin dd siguiente al final de la lista", () => {
    const s = sect("<dl><dt>Término solo</dt></dl>");
    expect(s.blocks).toEqual([{ type: "list", items: ["Término solo"] }]);
  });

  it("parsea múltiples pares dt+dd", () => {
    const s = sect(`
      <dl>
        <dt>A</dt><dd>1</dd>
        <dt>B</dt><dd>2</dd>
      </dl>
    `);
    const block = s.blocks[0] as { items: string[] };
    expect(block.items).toEqual(["A: 1", "B: 2"]);
  });
});

describe("parseGamebook — tag desconocido (fallback)", () => {
  it("aplana signpost y otros tags desconocidos a párrafo", () => {
    const s = sect("<signpost>Texto de señal.</signpost>");
    expect(s.blocks).toEqual([{ type: "paragraph", text: "Texto de señal." }]);
  });
});

// ---------------------------------------------------------------------------
// Número de sección
// ---------------------------------------------------------------------------

describe("parseGamebook — número de sección", () => {
  it("extrae el número cuando el título es numérico", () => {
    const s = sect("<p>X.</p>", "sect42", "42");
    expect(s.number).toBe(42);
  });

  it("devuelve null cuando el título no es numérico", () => {
    const s = sect("<p>X.</p>", "sectEquipo", "Equipo");
    expect(s.number).toBeNull();
  });

  it("devuelve null cuando no hay meta en la sección", () => {
    const xml = `<gamebook><section id="sect1"><data><p>X.</p></data></section></gamebook>`;
    expect(first(xml).number).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// stripDoctype
// ---------------------------------------------------------------------------

describe("parseGamebook — stripDoctype", () => {
  it("parsea correctamente XML con DOCTYPE complejo (subconjunto interno)", () => {
    const xml = `<!DOCTYPE gamebook [
  <!ENTITY % foo "bar">
]>
${wrap("<p>Texto.</p>")}`;
    expect(first(xml).blocks).toEqual([{ type: "paragraph", text: "Texto." }]);
  });

  it("parsea correctamente XML con DOCTYPE simple sin subconjunto", () => {
    const xml = `<!DOCTYPE gamebook>\n${wrap("<p>Texto.</p>")}`;
    expect(first(xml).blocks).toEqual([{ type: "paragraph", text: "Texto." }]);
  });

  it("parsea correctamente XML sin DOCTYPE", () => {
    expect(first(wrap("<p>Texto.</p>")).blocks).toEqual([
      { type: "paragraph", text: "Texto." },
    ]);
  });
});

// ---------------------------------------------------------------------------
// Recolección de secciones (collect)
// ---------------------------------------------------------------------------

describe("parseGamebook — recolección", () => {
  it("recoge múltiples secciones en orden", () => {
    const xml = `
      <gamebook>
        <section id="sect1"><meta><title>1</title></meta><data><p>A.</p></data></section>
        <section id="sect2"><meta><title>2</title></meta><data><p>B.</p></data></section>
      </gamebook>
    `;
    const sections = parseGamebook(xml);
    expect(sections).toHaveLength(2);
    expect(sections[0]?.id).toBe("sect1");
    expect(sections[1]?.id).toBe("sect2");
  });

  it("recorre secciones anidadas (contenedor sin <data> es omitido)", () => {
    const xml = `
      <gamebook>
        <section id="contenedor">
          <section id="sect1">
            <meta><title>1</title></meta>
            <data><p>Texto.</p></data>
          </section>
        </section>
      </gamebook>
    `;
    const sections = parseGamebook(xml);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.id).toBe("sect1");
  });

  it("omite secciones sin atributo id", () => {
    const xml = `
      <gamebook>
        <section><meta><title>1</title></meta><data><p>Sin id.</p></data></section>
        <section id="sect2"><meta><title>2</title></meta><data><p>Con id.</p></data></section>
      </gamebook>
    `;
    const sections = parseGamebook(xml);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.id).toBe("sect2");
  });

  it("devuelve array vacío para XML sin secciones", () => {
    expect(parseGamebook("<gamebook></gamebook>")).toHaveLength(0);
  });
});
