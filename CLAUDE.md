# CLAUDE.md — Lobo Solitario

Contexto permanente para Claude Code. Se carga automáticamente en cualquier sesión.

---

## Cómo colaborar con José

- Responde **siempre en español**.
- Avanza **un paso acotado por turno**: explica qué se hace y por qué, verifica (typecheck / build / preview) y para a confirmar antes de seguir.
- **No commitees** hasta que José lo pida explícitamente.
- Al terminar cada sesión, llama a `preview_stop` (si el servidor de preview estuvo activo). Si el puerto 5173 queda ocupado: `lsof -ti:5173 | xargs kill`.

---

## Qué es el proyecto

Webapp interactiva del libro-juego **Lobo Solitario, Libro 1: Huida de la Oscuridad**. El jugador gestiona Resistencia, Destreza, inventario y combates sin lápiz ni papel.

Demo en producción: **https://lone-wolf-five.vercel.app**

---

## Stack y arquitectura

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite + TypeScript (`apps/web`) |
| Backend | Express 5 + Mongoose (`apps/api`) |
| Contratos | `packages/shared` — solo DTOs, sin lógica |
| Base de datos | MongoDB Atlas (dev: `lonewolf-dev`, prod: `lonewolf-prod`) |
| Hosting | Vercel único — web estático + API serverless (mismo origen, sin CORS) |
| Bundler API | esbuild — empaqueta `apps/api/handler.ts` → función serverless (~4 MB CJS) |
| Empaquetado deploy | **Build Output API v3** de Vercel — `scripts/build-vercel.mjs` monta `.vercel/output/` (estático + función + rutas) |
| Gestor de paquetes | pnpm 11 workspaces |
| Node | 22.17.0 (nvm) — **usar `nvm use 22` antes de cualquier comando** |
| Lint | Biome (`pnpm lint` → `biome ci .`) |
| Tests | Vitest — 133 tests: 88 dominio en `apps/web`, 45 backend en `apps/api` |

Arquitectura **hexagonal** en ambas apps: `domain / application / infrastructure + composition-root`.

---

## Estructura del monorepo

```
apps/
  api/          Express serverless (handler.ts = entry point para Vercel)
  web/          React SPA
packages/
  shared/       DTOs compartidos (SectionDTO, etc.)
scripts/
  build-vercel.mjs  Monta .vercel/output/ (Build Output API v3) en el deploy
api/            handler.js — bundle suelto de esbuild para uso local (gitignored)
data/           01hdlo.xml — XML de Project Aon (gitignored por licencia)
.github/
  workflows/
    ci.yml      CI gate (typecheck+lint+test) + deploy condicional a Vercel
vercel.json     Solo buildCommand (pnpm build:vercel) + installCommand
.vercelignore   Excluye .env del upload (evita localhost en bundle prod)
biome.json      Config lint + formato
DEPLOY_PLAN.md  Plan completo de despliegue con todas las decisiones
TODO.md         Backlog completo paso a paso
```

> **Enrutado en prod**: las rewrites `/sections/*` y `/health` → función ya NO viven en
> `vercel.json`, sino en `.vercel/output/config.json` (lo genera `build-vercel.mjs`).

---

## Estado actual del proyecto

**Pasos 1–14 completados.** Proyecto desplegado y verificado E2E en producción (2026-06-19). Nice-to-haves trabajados en sesión 2026-06-22 (ver detalle abajo).

### Nice-to-haves — estado (2026-06-22 → 2026-06-22)

| Ítem | Estado |
|---|---|
| CORS de dev emitido en producción | ✅ corregido — middleware `cors` omitido en prod |
| Error Boundary en React | ✅ `ErrorBoundary.tsx` envuelve toda la app en `main.tsx` |
| sect21 — tirada encadenada con muerte | ✅ `RollOutcome.nextTable` + `kills`; `RollPanel` gestiona la cascada |
| Tests del backend (parser XML, mapper, `GetSection`) | ✅ 45 tests en `apps/api`; total: **133 tests** |
| Responsive / móvil y accesibilidad básica | ✅ completado — móvil, tablet y desktop |

#### Responsive — estado (sesión 2026-06-22)

| Sub-paso | Estado |
|---|---|
| Móvil: stats bar + drawer + touch targets | ✅ implementado y verificado en preview |
| Tablet: ficha más ancha (18rem) + disciplinas en grid 2 col | ✅ implementado y verificado en preview |
| Desktop: ficha a 20rem + barra de Resistencia visual | ✅ implementado y verificado en preview |

| Paso | Estado |
|---|---|
| 1-6 Base (monorepo, parser XML, API, navegación) | ✅ |
| 7 Personaje (creación, disciplinas, equipo) | ✅ |
| 8 Combate (tabla canónica, asaltos, UI) | ✅ |
| 9 Guardado (GameState, autoguardado, localStorage) | ✅ |
| 10 Experiencia de juego (guardar manual, carga, nueva partida) | ✅ |
| 11 Fidelidad (weaponskill, curación, reglas por sección, ilustraciones) | ✅ |
| 12 Tiradas animadas (dado 3D, revelación progresiva) | ✅ |
| 13 Refactors / deuda técnica | ✅ |
| 14 Despliegue + CI/CD (incl. smoke test E2E) | ✅ |

### Paso 14 — estado

- [x] Fase 0: Biome + validación env vars
- [x] Fase 1: handler serverless + Build Output API (`scripts/build-vercel.mjs`)
- [x] Fase 2: MongoDB Atlas Network Access
- [x] Fase 3: deploy Vercel — **API serverless realmente operativa desde 2026-06-19** (ver nota abajo)
- [x] **Fase 4: GitHub Actions** — pipeline operativo desde 2026-06-19
  - CI1: `.github/workflows/ci.yml` — jobs `ci` (typecheck+lint+test) y `deploy` (`needs: ci`)
  - CI2: secrets configurados en GitHub (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)
  - CI3: integración automática de GitHub desconectada en Vercel dashboard
- [x] **Fase 5: Smoke test E2E** — verificado en producción el 2026-06-19 con navegador real:
  personaje → combate (victoria sobre Kraan) → guardar mid-combate → recargar (persistencia íntegra
  de `pendingCombat`) → victoria. Las 5 navegaciones golpearon la API serverless
  (`GET /sections/sect*` → `200`), confirmando que prod ya no se enmascara con `localStorage`.
  Evidencias en [SMOKE_TEST.md](SMOKE_TEST.md).
  - ~~Pendiente menor~~: cabecera CORS de dev corregida el 2026-06-22 — el middleware `cors` ya no se registra en producción.

> **Nota histórica (2026-06-19)**: hasta el commit `56f81c3`, la API en producción estaba
> **muerta**. esbuild generaba la función pero Vercel no la registraba (autodetección de `/api`
> no recoge ficheros generados) → todo `/sections/*` daba 404 del edge. La SPA cargaba el
> personaje desde `localStorage`, lo que enmascaraba el fallo. Solucionado migrando a la
> **Build Output API** (`.vercel/output/` montado por `scripts/build-vercel.mjs`).

### Pipeline CI/CD (activo)

```
git push → GitHub Actions
              ├── pnpm typecheck
              ├── pnpm lint  (Biome)
              └── pnpm test  (133 tests Vitest: 88 web + 45 api)
                      ↓ solo si los tres pasan
              npx vercel@latest --prod
                 → build remoto: pnpm build:vercel monta .vercel/output/
                 → Vercel sirve estático + función desde ahí
                 → https://lone-wolf-five.vercel.app
```

Secrets en GitHub repo → Settings → Secrets and variables → Actions:
`VERCEL_TOKEN`, `VERCEL_ORG_ID` (`team_ixbQs0t1lxD7ADx5Ys6QXsRL`), `VERCEL_PROJECT_ID` (`prj_lJ4FkS6VKZqkFrVPN48MXewLytQL`).

### Gotchas CI/CD (lecciones aprendidas)

- **`pnpm add -g vercel` no funciona en GitHub Actions**: el bin global de pnpm no está en PATH. Usar `npx vercel@latest` directamente.
- **`pnpm/action-setup@v4` + `packageManager` en package.json**: no especificar `version:` en el YAML — la action lo lee del campo `packageManager` automáticamente.
- **Biome en CI es estricto**: ejecutar `pnpm biome check --write .` localmente antes de cada commit para evitar errores de formato en CI. Sin esto, ediciones manuales en JSX complejo (ternarios anidados en `&&`) pueden fallar.
- **Node local puede ser distinto**: si `node --version` devuelve algo distinto a v22, ejecutar `nvm install 22 && nvm use 22` antes de cualquier comando del proyecto. Con Node 10, `npx vercel` falla con "await is only valid in async function".
- **La autodetección de `/api` de Vercel NO recoge ficheros generados en el build**: con `buildCommand`/`outputDirectory` custom, esbuild creaba `api/handler.js` pero Vercel desplegaba **cero funciones** → 404 `x-vercel-error: NOT_FOUND` en `/sections/*` y `/health`. Por eso se usa la **Build Output API** (`scripts/build-vercel.mjs` → `.vercel/output/`), que Vercel consume tal cual. No volver a confiar en la autodetección.
- **Distinguir el 404 del edge del 404 de la API**: edge = `text/plain` + `x-vercel-error: NOT_FOUND`; nuestra API = `application/json` + `{"error":"No existe..."}`. Si ves el primero, la función no está desplegada.
- **Validar el deploy sin tocar prod**: `nvm use 22` → `npx vercel deploy --prebuilt` (preview) y luego `npx vercel curl <url>/health` (atraviesa la Vercel Authentication). El preview NO tiene `MONGODB_URI` (solo Production), así que dará `FUNCTION_INVOCATION_FAILED` con "[config] MONGODB_URI es obligatoria" → eso CONFIRMA que la función carga y solo falta el env.

---

## Diseño responsive — decisiones clave

El responsive se implementa en tres breakpoints usando **solo CSS + un mínimo de estado React** (sin librerías de media-query). El único breakpoint de corte es `760px` (ya existía para el grid de dos columnas).

### Estrategia por dispositivo

| Dispositivo | Ancho | Ficha de personaje | Stats |
|---|---|---|---|
| Móvil | < 760px | Drawer desde el fondo (`position: fixed`, `translateY`) | Stats bar compacta siempre visible |
| Tablet | 760px–1023px | Columna izquierda del grid, `18rem` | Oculta en stats bar |
| Desktop | ≥ 1024px | Columna izquierda del grid, `20rem`, `position: sticky` | Oculta en stats bar |

### Decisiones de diseño (móvil)

- **Stats bar (`Dez / Res / Oro`)** siempre visible debajo del header — evita el scroll para conocer el estado vital durante el juego.
- **Ficha como drawer** (no sidebar ni acordeón) porque permite ver el contenido de la sección a pantalla completa y consultar la ficha bajo demanda sin cambiar de página.
- **`position: fixed` + `translateY(100%)`** para el `.sheet` en móvil: saca la ficha del flujo del grid automáticamente (el `.reader` pasa a ocupar el 100% del ancho) sin necesidad de condicionantes en React. La clase `.sheet--open` aplica `translateY(0)`.
- **Handle + overlay** para cerrar el drawer: el handle (barra gris en la cima) es el patrón estándar de bottom-sheet; el overlay oscuro cierra al tocar fuera.
- **Touch targets**: `.choice` tiene `min-height: 48px` (recomendación WCAG/Material).
- **Stats bar y handle** son `display: none` por defecto (en desktop/tablet no aparecen) y solo se activan dentro del bloque `@media (max-width: 759px)`.

### Dónde vive el código

- Estilos: todo en `apps/web/src/index.css`, bloque final `@media (max-width: 759px)`.
- Estado `sheetOpen` y stats bar JSX: componente `Adventure` en `apps/web/src/ui/App.tsx`.
- Clase `sheet--open` y handle: `apps/web/src/ui/components/CharacterSheet.tsx` (props `isOpen`/`onClose`).

---

## Convenciones y constantes clave

- `FINAL_SECTION = "sect350"` — sección final del Libro 1
- `SAVE_FORMAT_VERSION = 3` — localStorage key: `"lone-wolf:save"`
- `GameState` es un objeto **plano**: `{ version, currentSection, character: { stats: { combatSkill, enduranceCurrent, enduranceMax }, disciplines, weapons, backpack, specialItems, gold, weaponskillWeapon }, history, flags, updatedAt, pendingCombat }`
- Secciones identificadas por string `"sect{N}"` (no por número)
- XML del libro **no está en git** — descargarlo de https://www.projectaon.org/data/trunk/es/xml/01hdlo.xml si se necesita reimportar
- Para importar a prod: cambiar temporalmente `MONGODB_URI` en `apps/api/.env` a `lonewolf-prod`, ejecutar `pnpm --filter @lone-wolf/api import:book`, restaurar

---

## Variables de entorno

| Fichero | Variable | Valor dev | Notas |
|---|---|---|---|
| `apps/api/.env` | `MONGODB_URI` | atlas lonewolf-dev | nunca pedir por chat |
| `apps/web/.env` | `VITE_API_URL` | `http://localhost:4000` | en prod no se define → fallback `""` |
| Vercel dashboard | `MONGODB_URI` | atlas lonewolf-prod | ya configurado |
| Vercel dashboard | `NODE_ENV` | `production` | ya configurado |

---

## Licencia Project Aon

Texto e ilustraciones © Joe Dever y Gary Chalk. Distribuidos bajo la **Project Aon License** (uso no comercial, con atribución). No redistribuir el XML ni las imágenes a través del repo. Las ilustraciones se sirven mediante hotlink desde `projectaon.org`.
