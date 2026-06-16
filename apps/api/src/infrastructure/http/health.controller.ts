/**
 * Adaptador de entrada (HTTP): endpoint de salud.
 *
 * `/health` es un endpoint técnico/operacional, no de dominio: por eso no pasa
 * por ningún caso de uso. Vive directamente en el adaptador HTTP.
 *
 * Lo exponemos como una "factoría" que devuelve un Router, igual que harán los
 * futuros controllers de dominio (que recibirán sus casos de uso por inyección).
 */

import { Router } from "express";
import { API_CONTRACT_VERSION } from "@lone-wolf/shared";
import { databaseStatus } from "../persistence/mongoose";

export function createHealthRouter(): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      db: databaseStatus(),
      // Importado de @lone-wolf/shared: confirma que el workspace enlaza.
      apiContractVersion: API_CONTRACT_VERSION,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
