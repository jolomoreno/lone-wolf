/**
 * Composition root del frontend: el único lugar que conoce las implementaciones
 * concretas (adaptadores) y las enchufa a los casos de uso.
 *
 * La UI consumirá los casos de uso desde aquí (a través del DependencyProvider),
 * sin instanciar adaptadores por su cuenta.
 */

import { CheckApiHealth } from "../application/use-cases/check-api-health";
import { GetSection } from "../application/use-cases/get-section";
import { HttpHealthAdapter } from "../infrastructure/http/http-health.adapter";
import { HttpContentAdapter } from "../infrastructure/http/http-content.adapter";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// --- Adaptadores de salida ---
const healthAdapter = new HttpHealthAdapter(apiUrl);
const contentAdapter = new HttpContentAdapter(apiUrl);

// --- Casos de uso (reciben los adaptadores por inyección) ---
export const container = {
  checkApiHealth: new CheckApiHealth(healthAdapter),
  getSection: new GetSection(contentAdapter),
} as const;

export type Container = typeof container;
