/**
 * Adaptador de entrada (HTTP): construye el servidor Express.
 *
 * No conoce rutas concretas: recibe los routers ya montados desde el
 * composition root. Así el servidor es "tonto" y reutilizable, y el cableado
 * de dependencias está en un único sitio.
 */

import express, { type Express, type Router } from "express";
import cors from "cors";
import { env } from "../../config/env";

export function createHttpServer(routers: Router[]): Express {
  const app = express();

  // Permite que el frontend (otro origen) llame a la API.
  app.use(cors({ origin: env.corsOrigin }));
  // Parsea el cuerpo JSON de las peticiones.
  app.use(express.json());

  // Monta todos los routers que nos pasa el composition root.
  for (const router of routers) {
    app.use(router);
  }

  // Cualquier ruta no encontrada devuelve 404 en JSON.
  app.use((_req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
  });

  return app;
}
