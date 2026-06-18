/**
 * Adaptador de salida: implementa el puerto SectionRepository con MongoDB.
 *
 * Traduce entre el documento de Mongo y la entidad de dominio `Section`. El
 * dominio nunca ve un documento de Mongoose.
 */

import type { Section } from "../../domain/section/section";
import type { SectionRepository } from "../../domain/section/section-repository";
import { type SectionDoc, SectionModel } from "./section.schema";

function toDomain(doc: SectionDoc): Section {
  return {
    id: doc.sectionId,
    number: doc.number ?? null,
    blocks: doc.blocks ?? [],
    choices: doc.choices ?? [],
  };
}

export class MongoSectionRepository implements SectionRepository {
  async findByNumber(number: number): Promise<Section | null> {
    const doc = await SectionModel.findOne({ number })
      .lean<SectionDoc>()
      .exec();
    return doc ? toDomain(doc) : null;
  }

  async findById(id: string): Promise<Section | null> {
    const doc = await SectionModel.findOne({ sectionId: id })
      .lean<SectionDoc>()
      .exec();
    return doc ? toDomain(doc) : null;
  }

  async saveMany(sections: Section[]): Promise<void> {
    if (sections.length === 0) return;
    await SectionModel.bulkWrite(
      sections.map((section) => ({
        updateOne: {
          filter: { sectionId: section.id },
          update: {
            $set: {
              sectionId: section.id,
              number: section.number,
              blocks: section.blocks,
              choices: section.choices,
            },
          },
          upsert: true,
        },
      })),
    );
  }

  async count(): Promise<number> {
    return SectionModel.countDocuments().exec();
  }

  async clear(): Promise<void> {
    await SectionModel.deleteMany({}).exec();
  }
}
