/**
 * Esquema Mongoose para las secciones (detalle de persistencia).
 *
 * Guardamos `blocks` como Mixed porque es una unión discriminada (párrafo /
 * ilustración / combate) y no nos interesa consultarlo por dentro: lo leemos
 * entero y lo servimos. Indexamos `sectionId` y `number` para buscar rápido.
 */

import { model, Schema } from "mongoose";
import type { Choice, ContentBlock } from "../../domain/section/section";

/** Forma del documento, para que Mongoose tipe bien las operaciones. */
export interface SectionDoc {
  sectionId: string;
  number: number | null;
  blocks: ContentBlock[];
  choices: Choice[];
}

const choiceSchema = new Schema(
  {
    text: { type: String, required: true },
    target: { type: String, required: true },
  },
  { _id: false },
);

const sectionSchema = new Schema(
  {
    /** id original del XML (p.ej. "sect1"). Usamos este nombre para no chocar con _id. */
    sectionId: { type: String, required: true, unique: true, index: true },
    number: { type: Number, default: null, index: true },
    blocks: { type: [Schema.Types.Mixed], default: [] },
    choices: { type: [choiceSchema], default: [] },
  },
  { collection: "sections", timestamps: true },
);

export const SectionModel = model<SectionDoc>("Section", sectionSchema);
