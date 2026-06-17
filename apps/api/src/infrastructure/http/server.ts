/**
 * Adaptador de entrada (HTTP): construye el servidor Express.
 *
 * No conoce rutas concretas: recibe los routers ya montados desde el
 * composition root. Así el servidor es "tonto" y reutilizable, y el cableado
 * de dependencias está en un único sitio.
 */

import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
  type Router,
} from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "../../config/env";

export function createHttpServer(routers: Router[]): Express {
  const app = express();

  // En desarrollo acepta cualquier localhost (el puerto puede variar según la
  // herramienta de preview). En producción usa el origen exacto de CORS_ORIGIN.
  const corsOrigin =
    env.nodeEnv === "production"
      ? env.corsOrigin
      : (origin: string | undefined, cb: (e: Error | null, ok?: boolean) => void) => {
          if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) cb(null, true);
          else cb(new Error(`CORS: origen no permitido → ${origin}`));
        };
  app.use(helmet()); // Cabeceras de seguridad HTTP
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  // Monta todos los routers que nos pasa el composition root.
  for (const router of routers) {
    app.use(router);
  }

  // Cualquier ruta no encontrada devuelve 404 en JSON.
  app.use((_req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
  });

  // Manejador de errores: cualquier excepción no controlada -> 500 en JSON.
  // (En Express 5, las promesas rechazadas de los handlers llegan aquí.)
  app.use(
    (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
      console.error("[http] Error no controlado:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    },
  );

  return app;
}
