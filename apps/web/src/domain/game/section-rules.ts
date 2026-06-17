/**
 * Reglas curadas por sección del Libro 1 que no están en el XML estructurado:
 *  - Inmunidades al Ataque Psíquico (Mindblast).
 *  - Modificadores de Destreza en el Combate del jugador (p.ej. ataque mental).
 *  - Opciones de elusión durante el combate.
 *  - Condiciones de disciplina/objeto para mostrar u ocultar choices.
 *  - Efectos al entrar en una sección (daño narrativo, comidas obligatorias).
 *
 * Fuente: texto completo de la edición Project Aon Español (01hdlo.xml).
 */

import type { Character, InventoryItem, ItemKind } from "../character/character";
import {
  applyDamage,
  changeGold,
  heal,
  loseAllEquipment,
  removeFromBackpack,
} from "../character/character-operations";
import type { KaiDiscipline } from "../character/kai-discipline";

// ---------------------------------------------------------------------------
// Condiciones de elección
// ---------------------------------------------------------------------------

export type ChoiceCondition =
  | { type: "discipline"; discipline: KaiDiscipline }
  | { type: "item"; itemId: string }
  | { type: "gold"; minGold: number }
  | { type: "endurance"; comparison: ">=" | "<"; value: number };

export interface SectionChoiceRule {
  target: string;
  condition: ChoiceCondition;
}

/** Evalúa si una condición se cumple con el estado actual del personaje. */
export function evaluateCondition(
  condition: ChoiceCondition,
  character: Character,
): boolean {
  switch (condition.type) {
    case "discipline":
      return character.disciplines.includes(condition.discipline);
    case "item": {
      const all = [
        ...character.weapons,
        ...character.backpack,
        ...character.specialItems,
      ];
      return all.some((i) => i.id === condition.itemId);
    }
    case "gold":
      return character.gold >= condition.minGold;
    case "endurance":
      return condition.comparison === ">="
        ? character.stats.enduranceCurrent >= condition.value
        : character.stats.enduranceCurrent < condition.value;
  }
}

/**
 * Mapa sectionId → lista de condiciones por choice target.
 * Extraídas del texto de Project Aon Español (01hdlo.xml).
 */
export const SECTION_CHOICE_CONDITIONS: Record<string, SectionChoiceRule[]> = {
  sect1: [{ target: "sect141", condition: { type: "discipline", discipline: "sixthSense" } }],
  sect4: [{ target: "sect218", condition: { type: "discipline", discipline: "sixthSense" } }],
  sect12: [{ target: "sect262", condition: { type: "gold", minGold: 10 } }],
  sect18: [{ target: "sect114", condition: { type: "discipline", discipline: "camouflage" } }],
  sect19: [{ target: "sect69", condition: { type: "discipline", discipline: "tracking" } }],
  sect23: [{ target: "sect151", condition: { type: "discipline", discipline: "mindOverMatter" } }],
  sect37: [{ target: "sect282", condition: { type: "discipline", discipline: "camouflage" } }],
  sect46: [{ target: "sect296", condition: { type: "discipline", discipline: "sixthSense" } }],
  sect52: [{ target: "sect225", condition: { type: "discipline", discipline: "animalKinship" } }],
  sect70: [{ target: "sect8", condition: { type: "discipline", discipline: "sixthSense" } }],
  sect71: [{ target: "sect65", condition: { type: "discipline", discipline: "sixthSense" } }],
  sect83: [{ target: "sect45", condition: { type: "discipline", discipline: "sixthSense" } }],
  sect88: [{ target: "sect216", condition: { type: "discipline", discipline: "healing" } }],
  sect91: [{ target: "sect198", condition: { type: "discipline", discipline: "sixthSense" } }],
  sect105: [{ target: "sect298", condition: { type: "discipline", discipline: "animalKinship" } }],
  sect125: [{ target: "sect301", condition: { type: "discipline", discipline: "tracking" } }],
  sect128: [{ target: "sect297", condition: { type: "discipline", discipline: "hunting" } }],
  sect151: [{ target: "sect87", condition: { type: "discipline", discipline: "mindOverMatter" } }],
  sect162: [{ target: "sect258", condition: { type: "discipline", discipline: "mindOverMatter" } }],
  sect167: [{ target: "sect178", condition: { type: "discipline", discipline: "sixthSense" } }],
  sect172: [{ target: "sect114", condition: { type: "discipline", discipline: "camouflage" } }],
  sect175: [{ target: "sect182", condition: { type: "discipline", discipline: "camouflage" } }],
  sect200: [{ target: "sect168", condition: { type: "discipline", discipline: "camouflage" } }],
  sect203: [
    { target: "sect80", condition: { type: "endurance", comparison: ">=", value: 10 } },
    { target: "sect344", condition: { type: "endurance", comparison: "<", value: 10 } },
  ],
  sect211: [{ target: "sect244", condition: { type: "discipline", discipline: "sixthSense" } }],
  sect222: [{ target: "sect67", condition: { type: "discipline", discipline: "tracking" } }],
  sect235: [{ target: "sect254", condition: { type: "discipline", discipline: "tracking" } }],
  sect242: [{ target: "sect166", condition: { type: "discipline", discipline: "mindshield" } }],
  sect272: [{ target: "sect134", condition: { type: "discipline", discipline: "tracking" } }],
  sect303: [{ target: "sect237", condition: { type: "discipline", discipline: "camouflage" } }],
  sect308: [{ target: "sect122", condition: { type: "discipline", discipline: "animalKinship" } }],
  sect311: [{ target: "sect324", condition: { type: "discipline", discipline: "camouflage" } }],
  sect334: [
    { target: "sect48", condition: { type: "discipline", discipline: "sixthSense" } },
    { target: "sect73", condition: { type: "discipline", discipline: "camouflage" } },
  ],
  sect341: [{ target: "sect310", condition: { type: "discipline", discipline: "tracking" } }],
};

// ---------------------------------------------------------------------------
// Reglas de combate por sección
// ---------------------------------------------------------------------------

export interface SectionEvasion {
  /** Id de la sección destino al eludir. */
  target: string;
  /** Número mínimo de asaltos que deben haber pasado antes de poder eludir. */
  afterRound: number;
}

export interface SectionCombatRules {
  /** El enemigo es inmune al Ataque Psíquico (Mindblast no da +2). */
  mindblastImmune?: boolean;
  /**
   * Modificador a la Destreza en el Combate del jugador al inicio del combate.
   * Negativo = penalización (p.ej. ataque mental del Vordak).
   */
  playerCSModifier?: number;
  /** Si es true, la disciplina "Defensa Psíquica" (mindshield) anula playerCSModifier. */
  mindshieldProtects?: boolean;
  /** Opción de eludir el combate. */
  evasion?: SectionEvasion;
}

/**
 * Reglas de combate por sección del Libro 1.
 * Fuente: texto de Project Aon Español (01hdlo.xml).
 */
export const SECTION_COMBAT_RULES: Record<string, SectionCombatRules> = {
  // Vordak — ataque psíquico -2 CS (salvo Defensa Psíquica); sect342 también immune Mindblast
  sect29: { playerCSModifier: -2, mindshieldProtects: true },
  sect34: { playerCSModifier: -2, mindshieldProtects: true },
  sect283: { playerCSModifier: -2, mindshieldProtects: true },
  sect342: { mindblastImmune: true, playerCSModifier: -2, mindshieldProtects: true },
  // Kraan — penalización por polvo / batir de alas
  sect17: { playerCSModifier: -1 },
  sect229: { playerCSModifier: -1 },
  // Inmunidades explícitas al Mindblast
  sect133: { mindblastImmune: true },  // Serpiente alada
  sect170: { mindblastImmune: true },  // Alacrán zapador
  sect255: { mindblastImmune: true },  // Gourgaz
  // Elusión durante el combate
  sect169: { evasion: { target: "sect23", afterRound: 1 } },
  sect180: { evasion: { target: "sect22", afterRound: 0 } },
  sect191: { evasion: { target: "sect234", afterRound: 0 } },
  sect220: { evasion: { target: "sect234", afterRound: 0 } },
  sect339: { evasion: { target: "sect7", afterRound: 0 } },
};

// ---------------------------------------------------------------------------
// Efectos al entrar en una sección
// ---------------------------------------------------------------------------

export interface SectionEntryEffect {
  /** Cambio de Resistencia al entrar (negativo = daño narrativo incondicional). */
  enduranceDelta?: number;
  /** La sección obliga a comer una Comida (o penaliza si no puedes). */
  requiresMeal?: boolean;
  /** Resistencia perdida si no se puede comer (por defecto 3). */
  mealPenalty?: number;
}

/** Penalización estándar del Libro 1 al no poder comer. */
const DEFAULT_MEAL_PENALTY = 3;

/**
 * Efectos que se aplican UNA vez al entrar en la sección.
 * Solo incluye casos incondicionales y claros del texto (los condicionales,
 * que dependen de una tirada en el propio texto, se dejan al jugador).
 * Fuente: texto de Project Aon Español (01hdlo.xml).
 */
export const SECTION_ENTRY_EFFECTS: Record<string, SectionEntryEffect> = {
  // Daño narrativo fuera de combate (incondicional)
  sect76: { enduranceDelta: -2 },   // te quemas la mano
  sect119: { enduranceDelta: -2 },  // resta 2 de los que tengas
  sect144: { enduranceDelta: -2 },  // quedas aturdido
  sect146: { enduranceDelta: -3 },  // proyectil
  sect158: { enduranceDelta: -6 },  // primer rayo (el 2º depende de tirada → SECTION_ROLL_TABLES)
  sect166: { enduranceDelta: -4 },
  // sect188: el daño depende de una tirada (0-6 pierdes equipo, 7-9 -3) → SECTION_ROLL_TABLES
  sect203: { enduranceDelta: -10 }, // explosión de chispas
  sect236: { enduranceDelta: -6 },  // gema vordak (la pérdida de DC es aparte)
  sect276: { enduranceDelta: -1 },
  sect304: { enduranceDelta: -2 },  // te quema la mano
  sect308: { enduranceDelta: -1 },  // empujón al suelo
  sect343: { enduranceDelta: -2 },
  // Comidas obligatorias
  sect130: { requiresMeal: true },
  sect147: { requiresMeal: true },
  sect168: { requiresMeal: true },
  sect184: { requiresMeal: true },
  sect235: { requiresMeal: true },
  sect300: { requiresMeal: true },
};

export interface EntryEffectResult {
  character: Character;
  /** Mensajes legibles de lo ocurrido (para mostrar al jugador). */
  messages: string[];
}

/**
 * Aplica el efecto de entrada a un personaje. Puro e inmutable.
 *  - Daño/curación narrativos.
 *  - Comidas: la disciplina de Caza evita comer; si no, se consume una Comida;
 *    si no hay, se pierde la penalización de Resistencia.
 */
export function applyEntryEffect(
  character: Character,
  effect: SectionEntryEffect,
): EntryEffectResult {
  let result = character;
  const messages: string[] = [];

  if (effect.enduranceDelta) {
    if (effect.enduranceDelta < 0) {
      result = applyDamage(result, -effect.enduranceDelta);
      messages.push(`Pierdes ${-effect.enduranceDelta} de Resistencia.`);
    } else {
      result = heal(result, effect.enduranceDelta);
      messages.push(`Recuperas ${effect.enduranceDelta} de Resistencia.`);
    }
  }

  if (effect.requiresMeal) {
    if (result.disciplines.includes("hunting")) {
      messages.push("Te alimentas con la disciplina de Caza (no gastas Comida).");
    } else {
      const meal = result.backpack.find((item) => item.kind === "meal");
      if (meal) {
        result = removeFromBackpack(result, meal.id);
        messages.push("Consumes una Comida de tu mochila.");
      } else {
        const penalty = effect.mealPenalty ?? DEFAULT_MEAL_PENALTY;
        result = applyDamage(result, penalty);
        messages.push(`No tienes Comida: pierdes ${penalty} de Resistencia.`);
      }
    }
  }

  return { character: result, messages };
}

// ---------------------------------------------------------------------------
// Tiradas en la Tabla de la Suerte (rama según el número 0-9)
// ---------------------------------------------------------------------------

export interface RollOutcome {
  /** Límite inferior del rango (0-9, inclusive). */
  min: number;
  /** Límite superior del rango (0-9, inclusive). */
  max: number;
  /** Sección a la que se va con este resultado. */
  target: string;
  /** Cambio de Resistencia aplicado en esta rama (negativo = daño). */
  enduranceDelta?: number;
  /** Si true, pierdes todo el equipo portable (armas, mochila, oro). */
  losesAllEquipment?: boolean;
  /** Descripción de lo que ocurre en esta rama. */
  message?: string;
}

/**
 * Secciones con tirada obligatoria en la Tabla de la Suerte. El número (0-9)
 * decide la rama; el jugador NO elige. Fuente: texto de Project Aon (01hdlo.xml).
 *
 * Excluida sect21 (cascada de tiradas encadenadas con muerte): se deja como
 * elección libre por ahora.
 */
export const SECTION_ROLL_TABLES: Record<string, RollOutcome[]> = {
  sect2: [
    { min: 0, max: 4, target: "sect343" },
    { min: 5, max: 9, target: "sect276" },
  ],
  sect7: [
    { min: 0, max: 2, target: "sect108" },
    { min: 3, max: 9, target: "sect25" },
  ],
  sect17: [
    { min: 0, max: 0, target: "sect53" },
    { min: 1, max: 2, target: "sect274" },
    { min: 3, max: 9, target: "sect316" },
  ],
  sect22: [
    { min: 0, max: 4, target: "sect181" },
    { min: 5, max: 9, target: "sect145" },
  ],
  sect36: [
    {
      min: 0,
      max: 4,
      target: "sect140",
      enduranceDelta: -2,
      message: "Caes al suelo: pierdes 2 de Resistencia.",
    },
    { min: 5, max: 9, target: "sect323", message: "No te caes." },
  ],
  sect44: [
    { min: 0, max: 4, target: "sect277" },
    { min: 5, max: 9, target: "sect338" },
  ],
  sect49: [
    { min: 0, max: 4, target: "sect339" },
    { min: 5, max: 9, target: "sect60" },
  ],
  sect89: [
    { min: 0, max: 1, target: "sect53" },
    { min: 2, max: 4, target: "sect274" },
    { min: 5, max: 9, target: "sect316" },
  ],
  // Segundo rayo del druida: misma salida (106), distinto daño.
  sect158: [
    { min: 0, max: 5, target: "sect106", message: "El rayo falla y se estrella en la pared." },
    {
      min: 6,
      max: 9,
      target: "sect106",
      enduranceDelta: -4,
      message: "El rayo te alcanza en la espalda: pierdes 4 de Resistencia.",
    },
  ],
  sect160: [
    { min: 0, max: 4, target: "sect286", message: "Eres descubierto." },
    { min: 5, max: 9, target: "sect10", message: "No te descubren." },
  ],
  // El Kraan te derriba: la tirada decide el efecto (misma salida, 303).
  sect188: [
    {
      min: 0,
      max: 6,
      target: "sect303",
      losesAllEquipment: true,
      message: "El Kraan te arrebata la mochila: pierdes todo tu equipo.",
    },
    {
      min: 7,
      max: 9,
      target: "sect303",
      enduranceDelta: -3,
      message: "Resultas herido en ambos brazos: pierdes 3 de Resistencia.",
    },
  ],
  sect205: [
    { min: 0, max: 4, target: "sect181" },
    { min: 5, max: 9, target: "sect145" },
  ],
  sect226: [
    { min: 0, max: 4, target: "sect277" },
    { min: 5, max: 9, target: "sect338" },
  ],
  sect237: [
    { min: 0, max: 4, target: "sect265", message: "No eres descubierto." },
    { min: 5, max: 9, target: "sect72", message: "Te descubren." },
  ],
  sect275: [
    { min: 0, max: 4, target: "sect345" },
    { min: 5, max: 9, target: "sect74" },
  ],
  sect279: [
    { min: 0, max: 6, target: "sect112" },
    { min: 7, max: 9, target: "sect96" },
  ],
  sect294: [
    { min: 0, max: 2, target: "sect230" },
    { min: 3, max: 6, target: "sect190" },
    { min: 7, max: 9, target: "sect321" },
  ],
  sect302: [
    { min: 0, max: 2, target: "sect110" },
    { min: 3, max: 9, target: "sect285" },
  ],
  sect314: [
    { min: 0, max: 6, target: "sect341" },
    { min: 7, max: 9, target: "sect98" },
  ],
  sect337: [
    { min: 0, max: 4, target: "sect219" },
    { min: 5, max: 9, target: "sect317" },
  ],
};

/** Devuelve la rama que corresponde a un número de tirada (0-9), o undefined. */
export function resolveRoll(
  table: RollOutcome[],
  roll: number,
): RollOutcome | undefined {
  return table.find((o) => roll >= o.min && roll <= o.max);
}

/** Aplica el efecto de una rama de tirada al personaje. Puro e inmutable. */
export function applyRollOutcome(
  character: Character,
  outcome: RollOutcome,
): EntryEffectResult {
  let result = character;
  const messages: string[] = [];

  if (outcome.message) messages.push(outcome.message);

  if (outcome.losesAllEquipment) {
    result = loseAllEquipment(result);
  }
  if (outcome.enduranceDelta) {
    result =
      outcome.enduranceDelta < 0
        ? applyDamage(result, -outcome.enduranceDelta)
        : heal(result, outcome.enduranceDelta);
  }

  return { character: result, messages };
}

// ---------------------------------------------------------------------------
// Botín por sección (oro automático + objetos que el jugador puede coger)
// ---------------------------------------------------------------------------

/** Un objeto que se puede recoger, con su ranura de inventario. */
export interface LootItem {
  id: string;
  name: string;
  slot: "weapon" | "backpack" | "special";
  kind?: ItemKind;
}

export interface SectionLoot {
  /** Coronas de oro que se cobran automáticamente al entrar (una sola vez). */
  gold?: number;
  /** Objetos ofrecidos para coger (panel interactivo, sujeto a límites). */
  items?: LootItem[];
}

/**
 * Botín al registrar cadáveres / cofres. Oro extraído del texto de Project Aon
 * (01hdlo.xml); los objetos se ofrecen y el jugador decide si los coge.
 */
export const SECTION_LOOT: Record<string, SectionLoot> = {
  sect33: { gold: 3 },
  sect62: { gold: 28 },
  sect94: { gold: 16 },
  sect269: { gold: 10 },
  sect124: {
    gold: 15,
    items: [{ id: "silver-key", name: "Llave de plata", slot: "special" }],
  },
  sect197: {
    gold: 6,
    items: [{ id: "short-sword", name: "Espada corta", slot: "weapon" }],
  },
  sect291: {
    gold: 6,
    items: [
      { id: "loot-dagger", name: "Daga", slot: "weapon" },
      { id: "loot-spear", name: "Lanza", slot: "weapon" },
    ],
  },
  sect315: {
    gold: 6,
    items: [
      { id: "soap", name: "Pastilla de jabón perfumado", slot: "special" },
    ],
  },
};

/** Convierte un LootItem en el InventoryItem que se guarda en la ficha. */
export function lootToInventoryItem(item: LootItem): InventoryItem {
  return item.kind
    ? { id: item.id, name: item.name, kind: item.kind }
    : { id: item.id, name: item.name };
}

/** Cobra el oro de una sección (acotado al máximo de la bolsa). */
export function collectGold(character: Character, gold: number): EntryEffectResult {
  const before = character.gold;
  const result = changeGold(character, gold);
  const gained = result.gold - before;
  const messages =
    gained > 0
      ? [`Encuentras ${gold} Coronas de oro (recoges ${gained}).`]
      : ["Tu bolsa está llena: no puedes llevar más oro."];
  return { character: result, messages };
}
