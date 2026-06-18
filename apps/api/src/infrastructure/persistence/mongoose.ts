/**
 * Adaptador de salida: conexión a MongoDB con Mongoose.
 *
 * Es infraestructura pura (conoce el detalle técnico de la BD). El dominio no
 * sabe que esto existe; los repositorios concretos vivirán también aquí.
 *
 * De momento la conexión es tolerante a fallos: sin MONGODB_URI el servidor
 * arranca igual (sin BD). Cuando montemos Atlas, será obligatoria.
 */

import mongoose from "mongoose";
import { env, isProduction } from "../../config/env";

export async function connectToDatabase(): Promise<void> {
  if (mongoose.connection.readyState >= 1) return;

  if (!env.mongodbUri) {
    if (isProduction) {
      throw new Error("[db] MONGODB_URI es obligatoria en producción");
    }
    console.warn(
      "[db] MONGODB_URI no está definida; el servidor arranca sin base de datos.",
    );
    return;
  }

  try {
    await mongoose.connect(env.mongodbUri);
    console.log("[db] Conectado a MongoDB");
  } catch (error) {
    console.error("[db] Error al conectar a MongoDB:", error);
  }
}

/** Estado legible de la conexión, para el endpoint /health. */
export function databaseStatus(): string {
  // readyState: 0=desconectado, 1=conectado, 2=conectando, 3=desconectando
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] ?? "unknown";
}
