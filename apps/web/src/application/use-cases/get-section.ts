/**
 * Caso de uso: obtener una sección del libro por su número.
 *
 * Depende del puerto ContentPort (no de fetch). Hoy es fino, pero es el sitio
 * natural donde más adelante añadiremos reglas (p.ej. registrar la sección en
 * el historial de la partida).
 */

import type { SectionDTO } from "@lone-wolf/shared";
import type { ContentPort } from "../ports/content.port";

export class GetSection {
  constructor(private readonly content: ContentPort) {}

  execute(number: number): Promise<SectionDTO> {
    return this.content.getSection(number);
  }
}
