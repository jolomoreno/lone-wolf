/**
 * Composition root del frontend: el único lugar que conoce las implementaciones
 * concretas (adaptadores) y las enchufa a los casos de uso.
 *
 * La UI consumirá los casos de uso desde aquí (a través del DependencyProvider),
 * sin instanciar adaptadores por su cuenta.
 */

import type { SavePort } from "../application/ports/save.port";
import { CheckApiHealth } from "../application/use-cases/check-api-health";
import { GetSection } from "../application/use-cases/get-section";
import { HttpContentAdapter } from "../infrastructure/http/http-content.adapter";
import { HttpHealthAdapter } from "../infrastructure/http/http-health.adapter";
import { LocalStorageSaveAdapter } from "../infrastructure/storage/local-storage-save.adapter";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// --- Adaptadores de salida ---
const healthAdapter = new HttpHealthAdapter(apiUrl);
const contentAdapter = new HttpContentAdapter(apiUrl);
const saveAdapter: SavePort = new LocalStorageSaveAdapter();

// --- Casos de uso y puertos disponibles para la UI ---
export const container = {
  checkApiHealth: new CheckApiHealth(healthAdapter),
  getSection: new GetSection(contentAdapter),
  save: saveAdapter,
} as const;

export type Container = typeof container;
