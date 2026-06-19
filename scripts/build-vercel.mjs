/**
 * Build para Vercel usando la Build Output API (v3).
 *
 * La autodetección del directorio `/api` de Vercel NO recoge ficheros generados
 * durante el build cuando hay `buildCommand` + `outputDirectory` personalizados:
 * esbuild generaba `api/handler.js` pero Vercel lo descartaba y desplegaba CERO
 * funciones (toda llamada a la API daba 404). Para eliminar esa ambigüedad,
 * montamos nosotros mismos `.vercel/output/`, que Vercel consume tal cual.
 *
 * Estructura resultante:
 *   .vercel/output/
 *   ├── config.json                      rutas: /sections/* y /health → función
 *   ├── static/                          = apps/web/dist (SPA)
 *   └── functions/api/handler.func/
 *       ├── .vc-config.json              runtime nodejs22.x → handler.js
 *       └── handler.js                   bundle CJS de esbuild
 */

import { execSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, ".vercel/output");
const funcDir = resolve(outDir, "functions/api/handler.func");
const staticDir = resolve(outDir, "static");

function run(cmd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

// 1. Limpiar solo el output (preservar .vercel/project.json y README.txt).
rmSync(outDir, { recursive: true, force: true });
mkdirSync(funcDir, { recursive: true });

// 2. SPA estática.
run("pnpm --filter @lone-wolf/web build");
cpSync(resolve(root, "apps/web/dist"), staticDir, { recursive: true });

// 3. Función serverless: el handler de Express empaquetado por esbuild.
run(
  `esbuild apps/api/handler.ts --bundle --platform=node --format=cjs --outfile=${JSON.stringify(
    resolve(funcDir, "handler.js"),
  )}`,
);

writeFileSync(
  resolve(funcDir, ".vc-config.json"),
  `${JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "handler.js",
      launcherType: "Nodejs",
      shouldAddHelpers: true,
    },
    null,
    2,
  )}\n`,
);

// 4. Enrutado (sustituye a los rewrites de vercel.json).
writeFileSync(
  resolve(outDir, "config.json"),
  `${JSON.stringify(
    {
      version: 3,
      routes: [
        { src: "/sections/(.*)", dest: "/api/handler" },
        { src: "/health", dest: "/api/handler" },
        { handle: "filesystem" },
        { src: "/.*", dest: "/index.html" },
      ],
    },
    null,
    2,
  )}\n`,
);

console.log("✓ .vercel/output listo (Build Output API v3)");
