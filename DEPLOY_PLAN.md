# Plan de despliegue — Lobo Solitario

> Creado: 2026-06-18. Ejecutar en sesiones separadas, fase por fase.
> Progreso: marcar cada tarea con `[x]` al completarla.

## Decisiones tomadas

| Decisión | Elección |
|---|---|
| Plataforma | **Vercel** (único proveedor: web estático + API serverless) |
| Linter / formatter | **Biome** (`biome ci` en CI, `biome check --write` en local) |
| CI/CD | **GitHub Actions** como gate real (`needs: ci` bloquea el deploy) |
| Base de datos | **MongoDB Atlas** (ya creado, free tier M0) |
| Cold starts | ~300 ms (serverless Vercel) — aceptable para este proyecto |

## Arquitectura resultante

```
git push → GitHub → GitHub Actions ──(CI ✓)──> vercel --prod
                     typecheck                       │
                     biome ci                        ▼
                     vitest 88 tests          Vercel (lone-wolf.vercel.app)
                                               ├── /          → web estático (React + Vite)
                                               ├── /sections/* → api/handler.ts (serverless)
                                               └── /health     → api/handler.ts (serverless)
                                                        │
                                                        ▼
                                                  MongoDB Atlas
```

- **Sin Render.** Sin segundo proveedor.
- **Sin CORS** en producción (web y API en el mismo origen).
- **Sin `VITE_API_URL`** en Vercel (fallback a `""` → mismo origen).
- `@vercel/node` compila TypeScript nativamente — `tsx` no se necesita en prod.

---

## Fase 0 — Prerrequisitos

### P1 · Validación de variables de entorno (~15 min)

- [x] Editar [`apps/api/src/config/env.ts`](apps/api/src/config/env.ts)

Añadir al final del fichero, después de exportar `env`:

```typescript
if (isProduction && !env.mongodbUri) {
  throw new Error("[config] MONGODB_URI es obligatoria en producción");
}
```

Esto garantiza que la función serverless falla en frío con un mensaje claro si falta
la variable, en vez de fallar en la primera query con un error de Mongoose críptico.

### P2 · Biome — lint + formato (~45 min)

- [x] Instalar: `pnpm add -Dw @biomejs/biome` (se instaló v2.5.0)

- [x] Crear `biome.json` en raíz (esquema v2.5.0, `biome migrate` aplicado):
  - `files.includes` con exclusiones `!**/dist` y `!**/node_modules`
  - `formatter`: spaces 2, comillas dobles en JS
  - `linter`: enabled; a11y/useKeyWithClickEvents, noStaticElementInteractions,
    noSvgWithoutTitle desactivados (accesibilidad pendiente en nice-to-have)
  - `noNonNullAssertion` suprimido con biome-ignore en 3 tests (uso intencional)

- [x] Script `lint` en `package.json` raíz: `"biome ci ."` (sustituye `pnpm -r lint`)

- [x] `pnpm biome check --write .` — auto-fix aplicado; correcciones manuales:
  - `usePotion` renombrado a `applyPotion` en `CharacterSheet.tsx` (no era hook)
  - `key={msg}` en `App.tsx` entry messages (en vez del índice)

- [x] `pnpm lint` pasa en verde (82 ficheros, 0 errores, 0 warnings)

---

## Fase 1 — Cambios serverless (5 ficheros)

### S1 · Nuevo fichero: `api/handler.ts` (raíz del monorepo, ~15 min)

- [x] Crear `api/handler.ts`:

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Express } from "express";
import { buildApp } from "../apps/api/src/config/composition-root";
import { connectToDatabase } from "../apps/api/src/infrastructure/persistence/mongoose";

let app: Express | undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectToDatabase();  // sin-op si readyState >= 1 (ver S3)
  app ??= buildApp();         // se reutiliza en invocaciones calientes
  app(req as any, res as any);
}
```

`buildApp()` y `connectToDatabase()` ya existen y están bien desacoplados; este fichero
es solo el glue layer entre Vercel y Express.

### S2 · Nuevo fichero: `vercel.json` (raíz del monorepo, ~10 min)

- [x] Crear `vercel.json`:

```json
{
  "buildCommand": "pnpm --filter @lone-wolf/web build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install --frozen-lockfile",
  "rewrites": [
    { "source": "/sections/:path*", "destination": "/api/handler" },
    { "source": "/health",          "destination": "/api/handler" }
  ]
}
```

Vercel sirve `apps/web/dist` como estático. Antes de buscar fichero estático, las rutas
`/sections/*` y `/health` se reescriben a la función — el frontend no cambia de URL.

### S3 · Edit: `apps/api/src/infrastructure/persistence/mongoose.ts` (+1 línea, ~5 min)

- [ ] Añadir guard al inicio de `connectToDatabase()`:

```typescript
export async function connectToDatabase(): Promise<void> {
  if (mongoose.connection.readyState >= 1) return;  // ← añadir esta línea

  if (!env.mongodbUri) { /* … */ }
  // resto sin cambios
}
```

Sin este guard, cada invocación caliente (función ya activa en Vercel) intentaría
reconectar a MongoDB aunque la conexión siga activa en esa instancia.

### S4 · Edit: `apps/web/src/config/composition-root.ts` (1 línea, ~5 min)

- [ ] Cambiar el fallback de `apiUrl`:

```typescript
// Antes:
const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// Después:
const apiUrl = import.meta.env.VITE_API_URL ?? "";
```

En producción Vercel `VITE_API_URL` no se define → `""` → las llamadas van a
`/sections/sect1` en el mismo origen. En desarrollo local sigue funcionando con
`VITE_API_URL=http://localhost:4000` en `apps/web/.env`.

### S5 · Añadir `@vercel/node` (~5 min)

- [ ] Instalar:

```bash
pnpm add -Dw @vercel/node
```

Solo tipos y runtime helper de Vercel. No afecta al bundle de producción.

---

## Fase 2 — MongoDB Atlas

### M1 · Network Access — IPs dinámicas de Vercel (~5 min)

- [ ] En Atlas dashboard → **Network Access** → **Add IP Address** → `0.0.0.0/0` → confirmar.

Vercel Functions ejecutan desde IPs dinámicas de AWS; sin este paso Atlas rechaza
todas las conexiones desde producción. La única protección real es el `MONGODB_URI`
(que incluye usuario y contraseña y nunca se expone en el cliente).

---

## Fase 3 — Primer deploy en Vercel

### V1 · Vincular el repo (~5 min)

- [ ] Instalar la CLI y vincular:

```bash
pnpm add -g vercel
vercel link   # asocia el directorio local con el proyecto de Vercel
              # genera .vercel/project.json (añadir a .gitignore si no está)
```

- [ ] Añadir `.vercel/` a `.gitignore` si no está ya.

### V2 · Variables de entorno en Vercel (~5 min)

- [ ] En Vercel dashboard → Settings → Environment Variables → entorno **Production**:

| Variable | Valor | Nota |
|---|---|---|
| `MONGODB_URI` | cadena de conexión Atlas | nunca la expongas en el cliente |
| `NODE_ENV` | `production` | activa la validación de env vars del paso P1 |
| `VITE_API_URL` | **no definir** | fallback a `""` → mismo origen |
| `CORS_ORIGIN` | **no definir** | irrelevante en producción (mismo origen) |

### V3 · Deploy y verificar (~15 min)

- [ ] Primer deploy:

```bash
vercel --prod
```

- [ ] Verificar endpoints:
  - `https://lone-wolf.vercel.app/health` → `{ "status": "ok", "db": "connected" }`
  - `https://lone-wolf.vercel.app/sections/sect1` → JSON con el contenido de la sección 1
- [ ] Abrir la web, crear un personaje, navegar al menos 3 secciones.

---

## Fase 4 — GitHub Actions (CI gate real)

### CI1 · Crear `.github/workflows/ci.yml` (~30 min)

- [ ] Crear el directorio y el fichero:

```yaml
name: CI / Deploy

on:
  push:
    branches: [main]

jobs:
  ci:
    name: Typecheck · Lint · Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 11

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test

  deploy:
    name: Deploy → Vercel
    needs: ci
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 11

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm add -g vercel
      - run: vercel --prod --yes --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID:     ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

`needs: ci` es el gate real: si typecheck, lint o tests fallan, el job `deploy`
no se ejecuta y Vercel no despliega.

### CI2 · Secrets en GitHub (~5 min)

- [ ] En GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Cómo obtenerlo |
|---|---|
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | `cat .vercel/project.json` (campo `orgId`) |
| `VERCEL_PROJECT_ID` | `cat .vercel/project.json` (campo `projectId`) |

### CI3 · Desactivar auto-deploy en Vercel (~2 min)

- [ ] En Vercel dashboard → Settings → Git → desconectar la integración automática de GitHub
  (o desactivar el auto-deploy en la rama `main`).

El deploy ahora lo dispara exclusivamente el job `deploy` del YAML, después de que
`ci` pase. Esto evita que un push roto llegue a producción aunque GitHub Actions tarde
en ejecutarse.

---

## Fase 5 — Smoke test E2E

### T1 · Test manual completo (~20 min)

- [ ] Crear personaje: animaciones de dado, selección de 5 disciplinas, equipo inicial correcto.
- [ ] Navegar 5+ secciones: textos, ilustraciones hotlinked, opciones con/sin 🔒.
- [ ] Combate: tabla de resultados, barras de Resistencia, registro de asaltos.
- [ ] Guardar → cerrar pestaña → reabrir → partida restaurada exactamente.
- [ ] Sección de muerte: pantalla de fin + "Nueva partida" funciona.
- [ ] DevTools → Network: llamadas a `/sections/:id` devuelven 200, sin errores CORS.

---

## Orden de ejecución y tiempo estimado

```
Fase 0
  P1  Validación env vars                   ~15 min
  P2  Biome + pnpm lint funcional           ~45 min

Fase 1
  S1  api/handler.ts                        ~15 min
  S2  vercel.json                           ~10 min
  S3  mongoose.ts guard                      ~5 min
  S4  composition-root.ts fallback URL       ~5 min
  S5  pnpm add @vercel/node                  ~5 min

Fase 2
  M1  Atlas Network Access 0.0.0.0/0         ~5 min

Fase 3
  V1  vercel link + .gitignore               ~5 min
  V2  Env vars en Vercel dashboard            ~5 min
  V3  vercel --prod + verificar             ~15 min

Fase 4
  CI1 .github/workflows/ci.yml             ~30 min
  CI2 Secrets en GitHub                      ~5 min
  CI3 Desactivar auto-deploy Vercel          ~2 min

Fase 5
  T1  Smoke test E2E manual                ~20 min
────────────────────────────────────────────────────
                                  Total  ~3 h 10 min
```

---

## Referencia rápida de ficheros modificados

| Fichero | Tipo | Qué cambia |
|---|---|---|
| `api/handler.ts` | Nuevo | Serverless handler — glue entre Vercel y Express |
| `vercel.json` | Nuevo | Build web + rewrites `/sections/*` y `/health` |
| `biome.json` | Nuevo | Config lint + formato para todo el monorepo |
| `.github/workflows/ci.yml` | Nuevo | CI gate + deploy condicional |
| `apps/api/src/config/env.ts` | Edit | Validación MONGODB_URI en producción |
| `apps/api/src/infrastructure/persistence/mongoose.ts` | Edit | Guard `readyState >= 1` |
| `apps/web/src/config/composition-root.ts` | Edit | Fallback `apiUrl` de `"http://localhost:4000"` a `""` |
| `package.json` (raíz) | Edit | Script `"lint": "biome ci ."` |
