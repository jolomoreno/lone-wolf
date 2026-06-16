/**
 * Adaptador de salida: implementa ContentPort llamando a la API real.
 *
 * Único sitio que sabe que el contenido se obtiene con fetch a /sections/:number.
 */

import type { SectionDTO } from "@lone-wolf/shared";
import type { ContentPort } from "../../application/ports/content.port";

export class HttpContentAdapter implements ContentPort {
  constructor(private readonly baseUrl: string) {}

  async getSection(number: number): Promise<SectionDTO> {
    const response = await fetch(`${this.baseUrl}/sections/${number}`);
    if (response.status === 404) {
      throw new Error(`No existe la sección ${number}`);
    }
    if (!response.ok) {
      throw new Error(`Error ${response.status} al cargar la sección ${number}`);
    }
    return (await response.json()) as SectionDTO;
  }
}
