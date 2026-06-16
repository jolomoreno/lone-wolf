/**
 * Punto de entrada del servidor: conecta a la base de datos (si procede),
 * crea la app Express y se pone a escuchar.
 */

import { createApp } from "./app";
import { connectToDatabase } from "./db/connect";
import { env } from "./config/env";

async function main(): Promise<void> {
  await connectToDatabase();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[api] Servidor escuchando en http://localhost:${env.port}`);
  });
}

main().catch((error) => {
  console.error("[api] Error fatal al arrancar:", error);
  process.exit(1);
});
