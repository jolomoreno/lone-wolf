/**
 * Script de importación: lee el XML del Libro 1, lo parsea a entidades de
 * dominio y las guarda en MongoDB a través del repositorio.
 *
 * Uso (desde apps/api):
 *   pnpm import:book                 # importa data/01hdlo.xml a Mongo
 *   pnpm import:book -- --dry-run    # solo parsea y muestra estadísticas
 *   pnpm import:book -- ruta/al.xml  # usa otro fichero
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { env } from "../config/env";
import { parseGamebook } from "../infrastructure/import/parse-gamebook-xml";
import { MongoSectionRepository } from "../infrastructure/persistence/mongo-section.repository";

// Por defecto: data/01hdlo.xml en la raíz del monorepo (relativo a este fichero).
const DEFAULT_XML = fileURLToPath(
  new URL("../../../../data/01hdlo.xml", import.meta.url),
);

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const fileArg = args.find((arg) => !arg.startsWith("--"));
  const xmlPath = fileArg ?? DEFAULT_XML;

  console.log(`[import] Leyendo ${xmlPath}`);
  const xml = readFileSync(xmlPath, "utf-8");
  const sections = parseGamebook(xml);

  const numbered = sections.filter((s) => s.number !== null).length;
  const combats = sections.reduce(
    (n, s) => n + s.blocks.filter((b) => b.type === "combat").length,
    0,
  );
  const illustrations = sections.reduce(
    (n, s) => n + s.blocks.filter((b) => b.type === "illustration").length,
    0,
  );
  const choices = sections.reduce((n, s) => n + s.choices.length, 0);

  console.log(
    `[import] Secciones: ${sections.length} (numeradas: ${numbered})`,
  );
  console.log(
    `[import] Combates: ${combats} | Ilustraciones: ${illustrations} | Opciones: ${choices}`,
  );

  if (dryRun) {
    console.log("[import] --dry-run: no se escribe en Mongo.");
    return;
  }

  if (!env.mongodbUri) {
    console.error(
      "[import] Falta MONGODB_URI en apps/api/.env. Aborto (usa --dry-run para solo parsear).",
    );
    process.exitCode = 1;
    return;
  }

  await mongoose.connect(env.mongodbUri);
  const repository = new MongoSectionRepository();
  await repository.clear();
  await repository.saveMany(sections);
  console.log(`[import] Importadas ${await repository.count()} secciones a MongoDB.`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("[import] Error:", error);
  process.exitCode = 1;
});
