/**
 * Construye la aplicación Express (middlewares + rutas). Lo separamos de
 * index.ts para poder, en el futuro, importar la app en tests sin arrancar
 * el servidor.
 */

import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { healthRouter } from "./routes/health";

export function createApp() {
  const app = express();

  // Permite que el frontend (otro origen) llame a la API.
  app.use(cors({ origin: env.corsOrigin }));
  // Parsea el cuerpo JSON de las peticiones.
  app.use(express.json());

  // Rutas de la aplicación.
  app.use(healthRouter);

  // Cualquier ruta no encontrada devuelve 404 en JSON.
  app.use((_req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
  });

  return app;
}
