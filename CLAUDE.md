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
| Bundler API | esbuild — empaqueta `apps/api/handler.ts` → `api/handler.js` (~4 MB CJS) |
| Gestor de paquetes | pnpm 11 workspaces |
| Node | 22.17.0 (nvm) — **usar `nvm use 22` antes de cualquier comando** |
| Lint | Biome (`pnpm lint` → `biome ci .`) |
| Tests | Vitest (88 tests de dominio en `apps/web`) |

Arquitectura **hexagonal** en ambas apps: `domain / application / infrastructure + composition-root`.

---

## Estructura del monorepo

```
apps/
  api/          Express serverless (handler.ts = entry point para Vercel)
  web/          React SPA
packages/
  shared/       DTOs compartidos (SectionDTO, etc.)
api/            handler.js — bundle generado por esbuild (gitignored)
data/           01hdlo.xml — XML de Project Aon (gitignored por licencia)
vercel.json     Build + rewrites /sections/* y /health → api/handler
.vercelignore   Excluye .env del upload (evita localhost en bundle prod)
biome.json      Config lint + formato
DEPLOY_PLAN.md  Plan completo de despliegue con todas las decisiones
TODO.md         Backlog completo paso a paso
```

---

## Estado actual del proyecto

**Pasos 1–13 completados.** Paso 14 en progreso.

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
| 14 Despliegue + CI/CD | 🔄 en progreso |

### Paso 14 — pendiente

Ver **`DEPLOY_PLAN.md`** para el plan completo con código y comandos.

- [x] Fase 0: Biome + validación env vars
- [x] Fase 1: handler serverless + vercel.json + esbuild
- [x] Fase 2: MongoDB Atlas Network Access
- [x] Fase 3: primer deploy Vercel (app jugable en prod)
- [ ] **Fase 4: GitHub Actions** — CI gate real (`needs: ci` bloquea el deploy)
  - CI1: `.github/workflows/ci.yml` (typecheck + lint + test + deploy condicional)
  - CI2: secrets en GitHub (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)
  - CI3: desactivar auto-deploy en Vercel dashboard
- [ ] **Fase 5: Smoke test E2E manual** — personaje → combate → guardar → recargar → muerte/victoria

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
