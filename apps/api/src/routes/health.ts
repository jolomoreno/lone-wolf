/**
 * Endpoint de salud: sirve para comprobar que la API está viva y para ver
 * de un vistazo si la base de datos está conectada.
 */

import { Router } from "express";
import { SAVE_FORMAT_VERSION } from "@lone-wolf/shared";
import { databaseStatus } from "../db/connect";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    db: databaseStatus(),
    // Importado desde @lone-wolf/shared: demuestra que el workspace enlaza bien.
    saveFormatVersion: SAVE_FORMAT_VERSION,
    timestamp: new Date().toISOString(),
  });
});
