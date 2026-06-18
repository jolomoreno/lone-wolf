/**
 * Adaptador de entrada de datos: parsea el XML de Project Aon y devuelve las
 * entidades de dominio `Section`.
 *
 * Usa fast-xml-parser en modo `preserveOrder` para respetar el orden del
 * contenido mixto (texto intercalado con elementos inline). Este fichero NO
 * contiene texto del libro: solo lógica de transformación de etiquetas.
 */

import { XMLParser } from "fast-xml-parser";
import type {
  Choice,
  Combat,
  ContentBlock,
  Section,
} from "../../domain/section/section";

/**
 * En modo preserveOrder, cada nodo es un objeto con UNA clave = nombre de la
 * etiqueta, cuyo valor es el array (ordenado) de hijos. Los atributos van en
 * ":@" y los textos como { "#text": "..." }.
 */
type XmlNode = Record<string, unknown>;

const ATTR_PREFIX = "@_";

/** Mapeo de los caracteres especiales <ch.xxx/> de Project Aon a Unicode. */
const CHAR_MAP: Record<string, string> = {
  "ch.ellips": "…",
  "ch.lellips": "…",
  "ch.endash": "–",
  "ch.emdash": "—",
  "ch.minus": "−",
  "ch.copy": "©",
  "ch.apos": "’",
  "ch.lsquo": "‘",
  "ch.rsquo": "’",
  "ch.ldquo": "“",
  "ch.rdquo": "”",
  "ch.percent": "%",
  "ch.ampersand": "&",
  "ch.frac12": "½",
  "ch.frac14": "¼",
  "ch.frac34": "¾",
  "ch.thinspace": " ",
  "ch.nbsp": " ",
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: ATTR_PREFIX,
  preserveOrder: true,
  trimValues: false, // conservamos espacios entre inline; normalizamos después
  parseTagValue: false, // todo como string (los números los convertimos a mano)
});

/** Devuelve el nombre de etiqueta de un nodo (o "#text" si es texto). */
function tagOf(node: XmlNode): string {
  for (const key of Object.keys(node)) {
    if (key !== ":@" && key !== "#text") return key;
  }
  return node["#text"] !== undefined ? "#text" : "";
}

/** Hijos del nodo (el valor de su propia etiqueta). */
function kids(node: XmlNode): XmlNode[] {
  const value = node[tagOf(node)];
  return Array.isArray(value) ? (value as XmlNode[]) : [];
}

/** Valor de un atributo del nodo. */
function attrOf(node: XmlNode, name: string): string | undefined {
  const attrs = node[":@"] as Record<string, string> | undefined;
  return attrs?.[ATTR_PREFIX + name];
}

/** Aplana texto + elementos inline a texto plano (resolviendo <ch.xxx/>). */
function flattenChildren(children: XmlNode[]): string {
  let out = "";
  for (const child of children) {
    const text = child["#text"];
    if (typeof text === "string" || typeof text === "number") {
      out += String(text);
      continue;
    }
    const tag = tagOf(child);
    if (tag in CHAR_MAP) {
      out += CHAR_MAP[tag];
    } else if (tag === "br") {
      out += "\n";
    } else {
      out += flattenChildren(kids(child));
    }
  }
  return out;
}

/** Colapsa espacios en blanco y recorta. */
function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function parseChoice(node: XmlNode): Choice {
  return {
    text: normalize(flattenChildren(kids(node))),
    target: attrOf(node, "idref") ?? "",
  };
}

function parseCombat(node: XmlNode): Combat {
  const children = kids(node);
  const enemyNode = children.find((c) => tagOf(c) === "enemy");
  const enemy = enemyNode ? normalize(flattenChildren(kids(enemyNode))) : "Enemigo";

  let combatSkill = 0;
  let endurance = 0;
  for (const child of children) {
    if (tagOf(child) !== "enemy-attribute") continue;
    const value = Number(normalize(flattenChildren(kids(child))));
    if (attrOf(child, "class") === "combatskill") combatSkill = value;
    else if (attrOf(child, "class") === "endurance") endurance = value;
  }
  return { enemy, combatSkill, endurance };
}

function parseIllustration(node: XmlNode): ContentBlock | null {
  let src: string | undefined;
  let alt: string | undefined;
  for (const child of kids(node)) {
    const tag = tagOf(child);
    if (tag === "instance" && attrOf(child, "class") === "html") {
      src = attrOf(child, "src");
    } else if (tag === "meta") {
      const desc = kids(child).find((m) => tagOf(m) === "description");
      if (desc) alt = normalize(flattenChildren(kids(desc)));
    }
  }
  if (!src) return null;
  return alt ? { type: "illustration", src, alt } : { type: "illustration", src };
}

/**
 * Parsea <ul><li>…</li></ul> como lista de strings.
 * Cada <li> puede contener texto inline, párrafos anidados o ilustraciones;
 * aplana el texto visible de cada elemento.
 */
function parseUl(node: XmlNode): ContentBlock | null {
  const items: string[] = [];
  for (const child of kids(node)) {
    if (tagOf(child) !== "li") continue;
    const text = normalize(flattenChildren(kids(child)));
    if (text) items.push(text);
  }
  return items.length > 0 ? { type: "list", items } : null;
}

/**
 * Parsea <dl><dt>…</dt><dd>…</dd></dl> como lista de strings "término: definición".
 * Empareja cada <dt> con el <dd> siguiente; <dd> sin <dt> previo se añade sola.
 */
function parseDl(node: XmlNode): ContentBlock | null {
  const items: string[] = [];
  let pendingTerm: string | null = null;
  for (const child of kids(node)) {
    const tag = tagOf(child);
    if (tag === "dt") {
      pendingTerm = normalize(flattenChildren(kids(child)));
    } else if (tag === "dd") {
      const def = normalize(flattenChildren(kids(child)));
      if (pendingTerm) {
        items.push(`${pendingTerm}: ${def}`);
        pendingTerm = null;
      } else if (def) {
        items.push(def);
      }
    }
  }
  if (pendingTerm) items.push(pendingTerm);
  return items.length > 0 ? { type: "list", items } : null;
}

/** Recorre los hijos de <data> separando bloques de contenido y opciones. */
function parseData(dataChildren: XmlNode[]): {
  blocks: ContentBlock[];
  choices: Choice[];
} {
  const blocks: ContentBlock[] = [];
  const choices: Choice[] = [];

  for (const node of dataChildren) {
    const tag = tagOf(node);
    switch (tag) {
      case "#text":
      case "":
        break;
      case "choice":
        choices.push(parseChoice(node));
        break;
      case "combat":
        blocks.push({ type: "combat", combat: parseCombat(node) });
        break;
      case "illustration": {
        const illustration = parseIllustration(node);
        if (illustration) blocks.push(illustration);
        break;
      }
      case "p": {
        // Un párrafo puede contener un <choice> anidado (poco frecuente).
        for (const child of kids(node)) {
          if (tagOf(child) === "choice") choices.push(parseChoice(child));
        }
        const text = normalize(flattenChildren(kids(node)));
        if (text) blocks.push({ type: "paragraph", text });
        break;
      }
      case "ul": {
        const list = parseUl(node);
        if (list) blocks.push(list);
        break;
      }
      case "dl": {
        const list = parseDl(node);
        if (list) blocks.push(list);
        break;
      }
      default: {
        // signpost y otros: aplanamos a párrafo para no perder contenido.
        const text = normalize(flattenChildren(kids(node)));
        if (text) blocks.push({ type: "paragraph", text });
      }
    }
  }

  return { blocks, choices };
}

/** Extrae el número de sección de <meta><title>, si es numérico. */
function parseNumber(sectionChildren: XmlNode[]): number | null {
  const meta = sectionChildren.find((c) => tagOf(c) === "meta");
  if (!meta) return null;
  const title = kids(meta).find((c) => tagOf(c) === "title");
  if (!title) return null;
  const raw = normalize(flattenChildren(kids(title)));
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && String(value) === raw ? value : null;
}

function parseSection(node: XmlNode): Section | null {
  const id = attrOf(node, "id");
  if (!id) return null;
  const children = kids(node);
  const dataNode = children.find((c) => tagOf(c) === "data");
  if (!dataNode) return null; // secciones contenedoras (solo subsecciones) se omiten
  const { blocks, choices } = parseData(kids(dataNode));
  return { id, number: parseNumber(children), blocks, choices };
}

/** Recorre el árbol recogiendo todas las <section> (a cualquier profundidad). */
function collect(nodes: XmlNode[], out: Section[]): void {
  for (const node of nodes) {
    const tag = tagOf(node);
    if (tag === "" || tag === "#text") continue;
    if (tag === "section") {
      const section = parseSection(node);
      if (section) out.push(section);
    }
    collect(kids(node), out);
  }
}

/**
 * Quita la declaración <!DOCTYPE ...> (con su subconjunto interno de DTD). El
 * contenido del libro no la necesita: los caracteres especiales son elementos
 * <ch.xxx/>, no entidades de DTD. fast-xml-parser, además, falla al leer las
 * entidades de parámetro (%) que contiene.
 */
function stripDoctype(xml: string): string {
  return xml
    .replace(/<!DOCTYPE[\s\S]*?\]\s*>/, "")
    .replace(/<!DOCTYPE[^>]*>/, "");
}

/** Parsea el XML completo del libro-juego y devuelve sus secciones. */
export function parseGamebook(xml: string): Section[] {
  const root = parser.parse(stripDoctype(xml)) as XmlNode[];
  const sections: Section[] = [];
  collect(root, sections);
  return sections;
}
