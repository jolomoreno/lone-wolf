/**
 * Composition root: el ÚNICO lugar que conoce las implementaciones concretas
 * y las "enchufa" entre sí (inyección de dependencias manual).
 *
 * Aquí, a medida que crezca la app, instanciaremos los repositorios (Mongo),
 * los inyectaremos en los casos de uso, y estos en los controllers HTTP.
 */

import type { Express } from "express";
import { GetSection } from "../application/section/get-section.use-case";
import { createHealthRouter } from "../infrastructure/http/health.controller";
import { createSectionRouter } from "../infrastructure/http/section.controller";
import { createHttpServer } from "../infrastructure/http/server";
import { MongoSectionRepository } from "../infrastructure/persistence/mongo-section.repository";

export function buildApp(): Express {
  // --- Adaptadores de salida (repositorios) ---
  const sectionRepository = new MongoSectionRepository();

  // --- Casos de uso (reciben los repositorios por inyección) ---
  const getSection = new GetSection(sectionRepository);

  // --- Adaptadores de entrada (routers HTTP) ---
  const healthRouter = createHealthRouter();
  const sectionRouter = createSectionRouter(getSection);

  // --- Ensamblar el servidor con todos los routers ---
  return createHttpServer([healthRouter, sectionRouter]);
}
