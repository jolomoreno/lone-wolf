/**
 * Lee y centraliza la configuración del servidor a partir de variables de
 * entorno. Cargamos primero el archivo .env (en desarrollo) con dotenv.
 */

import dotenv from "dotenv";

dotenv.config();

/** Devuelve la variable si existe y no está vacía; si no, el valor por defecto. */
function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  nodeEnv: optional("NODE_ENV", "development"),
  port: Number(optional("PORT", "4000")),
  /** Vacío significa "arrancar sin base de datos" (útil al principio). */
  mongodbUri: process.env.MONGODB_URI ?? "",
  corsOrigin: optional("CORS_ORIGIN", "http://localhost:5173"),
} as const;

export const isProduction = env.nodeEnv === "production";

if (isProduction && !env.mongodbUri) {
  throw new Error("[config] MONGODB_URI es obligatoria en producción");
}
