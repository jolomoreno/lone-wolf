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

  router.get("/sections/:id", async (req, res) => {
    const { id } = req.params;
    if (!id || !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id)) {
      res.status(400).json({ error: "ID de sección inválido" });
      return;
    }

    const section = await getSection.execute(id);
    if (!section) {
      res.status(404).json({ error: `No existe la sección ${id}` });
      return;
    }

    res.json(toSectionDTO(section));
  });

  return router;
}
