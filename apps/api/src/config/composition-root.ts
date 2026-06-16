/**
 * Composition root: el ÚNICO lugar que conoce las implementaciones concretas
 * y las "enchufa" entre sí (inyección de dependencias manual).
 *
 * Aquí, a medida que crezca la app, instanciaremos los repositorios (Mongo),
 * los inyectaremos en los casos de uso, y estos en los controllers HTTP.
 */

import { type Express } from "express";
import { createHttpServer } from "../infrastructure/http/server";
import { createHealthRouter } from "../infrastructure/http/health.controller";

export function buildApp(): Express {
  // --- Adaptadores de salida (repositorios) ---
  // (todavía ninguno; aquí irá MongoSectionRepository)

  // --- Casos de uso ---
  // (todavía ninguno; aquí irá GetSection, etc., recibiendo los repositorios)

  // --- Adaptadores de entrada (routers HTTP) ---
  const healthRouter = createHealthRouter();

  // --- Ensamblar el servidor con todos los routers ---
  return createHttpServer([healthRouter]);
}
