/**
 * Puerto de salida: cómo el dominio/aplicación piden y guardan secciones, sin
 * saber si por detrás hay MongoDB, un fichero o memoria.
 *
 * La implementación concreta (MongoSectionRepository) vive en infraestructura.
 */

import type { Section } from "./section";

export interface SectionRepository {
  /** Busca una sección por su número (1..350). */
  findByNumber(number: number): Promise<Section | null>;
  /** Busca una sección por su id original (p.ej. "sect1"). */
  findById(id: string): Promise<Section | null>;
  /** Inserta o actualiza un lote de secciones (idempotente por id). */
  saveMany(sections: Section[]): Promise<void>;
  /** Número total de secciones almacenadas. */
  count(): Promise<number>;
  /** Borra todas las secciones (útil para reimportar). */
  clear(): Promise<void>;
}
