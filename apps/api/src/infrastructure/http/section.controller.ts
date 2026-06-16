/**
 * Adaptador de entrada (HTTP): expone las secciones del libro.
 *
 * Recibe el caso de uso por inyección (lo monta el composition root) y traduce
 * entre HTTP y dominio: valida el parámetro, llama al caso de uso y mapea la
 * entidad a `SectionDTO` para responder.
 */

import { Router } from "express";
import type { GetSection } from "../../application/section/get-section.use-case";
import { toSectionDTO } from "./section.mapper";

export function createSectionRouter(getSection: GetSection): Router {
  const router = Router();

  router.get("/sections/:number", async (req, res) => {
    const number = Number(req.params.number);
    if (!Number.isInteger(number) || number < 1) {
      res.status(400).json({ error: "Número de sección inválido" });
      return;
    }

    const section = await getSection.execute(number);
    if (!section) {
      res.status(404).json({ error: `No existe la sección ${number}` });
      return;
    }

    res.json(toSectionDTO(section));
  });

  return router;
}
