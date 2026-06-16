/**
 * Puerto para obtener el contenido del libro (las secciones).
 *
 * La aplicación define QUÉ necesita (una sección por número); la infraestructura
 * decide CÓMO (una llamada HTTP a la API). El tipo que devuelve es el contrato
 * compartido `SectionDTO`.
 */

import type { SectionDTO } from "@lone-wolf/shared";

export interface ContentPort {
  getSection(number: number): Promise<SectionDTO>;
}
