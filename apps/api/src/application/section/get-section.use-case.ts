/**
 * Caso de uso: obtener una sección por su número.
 *
 * Orquesta el dominio a través del puerto SectionRepository. No sabe si los
 * datos vienen de Mongo, de memoria o de un fichero: solo conoce el puerto.
 */

import type { Section } from "../../domain/section/section";
import type { SectionRepository } from "../../domain/section/section-repository";

export class GetSection {
  constructor(private readonly sections: SectionRepository) {}

  execute(number: number): Promise<Section | null> {
    return this.sections.findByNumber(number);
  }
}
