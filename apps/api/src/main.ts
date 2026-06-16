/**
 * Punto de entrada del proceso: conecta a la base de datos (si procede),
 * construye la app vía composition root y se pone a escuchar.
 */

import { env } from "./config/env";
import { buildApp } from "./config/composition-root";
import { connectToDatabase } from "./infrastructure/persistence/mongoose";

async function main(): Promise<void> {
  await connectToDatabase();

  const app = buildApp();
  app.listen(env.port, () => {
    console.log(`[api] Servidor escuchando en http://localhost:${env.port}`);
  });
}

main().catch((error) => {
  console.error("[api] Error fatal al arrancar:", error);
  process.exit(1);
});
