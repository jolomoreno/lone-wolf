/**
 * Conexión a MongoDB mediante Mongoose.
 *
 * De momento es tolerante a fallos: si no hay MONGODB_URI o falla la conexión,
 * el servidor sigue arrancando (sin BD). Más adelante, cuando montemos Atlas,
 * la conexión será obligatoria.
 */

import mongoose from "mongoose";
import { env } from "../config/env";

export async function connectToDatabase(): Promise<void> {
  if (!env.mongodbUri) {
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
