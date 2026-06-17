# Lobo Solitario — webapp interactiva

Adaptación interactiva del libro-juego **Lobo Solitario, Libro 1: Huida de la Oscuridad**,
para poder jugar sin lápiz ni papel: gestión de Resistencia/Destreza, combates,
inventario y guardado de la partida.

## Estado del proyecto

Pasos completados: 1-9 (base, personaje, combate, guardado automático).

| Paso | Qué | Estado |
|------|-----|--------|
| 1-9 | Base · Personaje · Combate · Guardado automático | ✅ Hecho |
| **10** | **Experiencia de juego** — guardado manual bajo control del jugador | ⬜ Siguiente |
| 11 | Fidelidad del juego — opciones condicionales, bonus, curación, estados finales | ⬜ |
| 12 | Tiradas animadas — dados en la creación del personaje | ⬜ |
| 13 | Refactors / deuda técnica — lint, tests backend, build prod | ⬜ |
| 14 | Despliegue + CI/CD — Atlas · Render · Vercel · GitHub Actions | ⬜ |

> Detalle completo, prerequisitos y subtareas en [TODO.md](TODO.md).

## Estructura (monorepo con pnpm workspaces)

```
lone-wolf/
├── apps/
│   ├── web/      # Frontend: React + Vite + TypeScript
│   └── api/      # Backend: Express + TypeScript + Mongoose (MongoDB)
├── packages/
│   └── shared/   # DTOs/contratos entre web y api (solo tipos de red)
└── data/         # XML de Project Aon + script de importación a Mongo
```

## Arquitectura

Ambas aplicaciones siguen **arquitectura hexagonal (Ports & Adapters)**:

```
Dominio  →  Aplicación (casos de uso + puertos)  →  Infraestructura (adaptadores)
```

- El **dominio** es puro TypeScript sin dependencias externas (inmutable, testable).
- Los **puertos** son interfaces que el dominio define; los **adaptadores** los implementan.
- El **composition root** (`apps/*/src/config/composition-root.ts`) es el único lugar que
  instancia adaptadores concretos y los enchufa a los casos de uso.
- `@lone-wolf/shared` contiene solo DTOs de red (no modelos de dominio).

### Capas del frontend

| Capa | Ruta | Qué hay |
|------|------|---------|
| Dominio | `apps/web/src/domain/` | `Character`, `GameState`, combat logic, funciones puras |
| Aplicación | `apps/web/src/application/` | Casos de uso (`GetSection`), puertos (`SavePort`) |
| Infraestructura | `apps/web/src/infrastructure/` | `HttpContentAdapter`, `LocalStorageSaveAdapter` |
| UI | `apps/web/src/ui/` | Componentes React, hooks, DI via `DependencyProvider` |

### Capas del backend

| Capa | Ruta | Qué hay |
|------|------|---------|
| Dominio | `apps/api/src/domain/` | Entidades `Section`, `ContentBlock`, `Choice` |
| Aplicación | `apps/api/src/application/` | Caso de uso `GetSection`, puerto `SectionRepository` |
| Infraestructura | `apps/api/src/infrastructure/` | `MongoSectionRepository`, routers HTTP, XML parser |

## Requisitos

- Node.js >= 22.13 (ver `.nvmrc`). Con [nvm](https://github.com/nvm-sh/nvm): `nvm use`.
- pnpm 11+ (`corepack enable` lo activa).
- Una base de datos MongoDB (p.ej. [MongoDB Atlas](https://www.mongodb.com/atlas), capa gratuita).

## Puesta en marcha (primera vez)

```bash
# 1. Instalar dependencias de todo el monorepo
pnpm install

# 2. Configurar la API: copia el ejemplo y rellena tu cadena de conexión
cp apps/api/.env.example apps/api/.env
#    edita apps/api/.env y pon tu MONGODB_URI, p.ej.:
#    MONGODB_URI=mongodb+srv://USUARIO:PASSWORD@TU-CLUSTER.xxxxx.mongodb.net/lonewolf?retryWrites=true&w=majority

# 3. Importar el contenido del Libro 1 a Mongo
#    (antes, descarga data/01hdlo.xml; ver data/README.md)
pnpm --filter @lone-wolf/api import:book
```

> `apps/api/.env` y `data/*.xml` están en `.gitignore`: no se suben al repo.

## Ejecutar la aplicación

**Forma rápida (un comando, arranca API + WEB):**

```bash
nvm use      # activa Node 22 (lee el .nvmrc)
pnpm dev     # arranca los dos en paralelo; para todo con Ctrl+C
```

Abre **http://localhost:5173** en el navegador.

**Forma clara (dos terminales, logs separados):**

```bash
# Terminal 1 — backend
pnpm --filter @lone-wolf/api dev

# Terminal 2 — frontend
pnpm --filter @lone-wolf/web dev
```

### URLs y comprobaciones

| Servicio | URL | Notas |
|----------|-----|-------|
| Web (React/Vite) | http://localhost:5173 | la interfaz del juego |
| API (Express) | http://localhost:4000 | REST API |
| Salud de la API | http://localhost:4000/health | debe mostrar `"db":"connected"` |

### Problemas comunes

- **`nvm: version "22.17.0" not found`** → `nvm install`.
- **`Address already in use`** → quedó un proceso colgado: `lsof -ti:4000 | xargs kill` (o `:5173`).
- **La web carga pero no aparecen las secciones** → la API está parada o `MONGODB_URI` es incorrecto en `apps/api/.env`. Comprueba `/health`.
- **La API no conecta a Mongo** → revisa que tu IP esté permitida en *Network Access* de Atlas.

## Scripts útiles

```bash
pnpm dev                  # arranca web + api en paralelo
pnpm build                # build de producción de todos los paquetes
pnpm typecheck            # comprobación de tipos de todo el monorepo
pnpm test                 # ejecuta todos los tests (vitest)
pnpm --filter @lone-wolf/api import:book -- --dry-run   # parsea el XML sin tocar Mongo
```

## Tests

```bash
pnpm test          # todos (55 tests)
pnpm test --watch  # modo watch
```

Los tests cubren el dominio del frontend: creación de personaje, equipo inicial, combate
(tabla de resultados, asaltos, modificadores) y `GameState` (navegación, flags, guardado).
Se usan dobles inyectables (`RandomNumber`, `KeyValueStorage`) para evitar dependencias
de DOM o aleatoriedad real.

Pendiente: tests del backend (parser XML, mapper, caso de uso `GetSection`).

## API REST

```
GET /health           → { status: "ok", db: "connected" }
GET /sections/:number → SectionDTO  (número de sección del libro, ej: /sections/1)
```

El DTO de sección sigue el esquema de `@lone-wolf/shared` (`API_CONTRACT_VERSION = 1`).
Cada sección contiene bloques de contenido (`paragraph | illustration | combat`) y opciones.

## Decisiones de diseño relevantes

- **Meals como objetos de mochila**: las comidas no son un contador; son `InventoryItem` con
  `kind: "meal"` dentro del `backpack[]`. Así respetan el límite de 8 huecos de mochila.
- **Objeto del almacén**: se decide por tirada (1-9 aleatorio), no por elección del jugador.
- **RandomNumber inyectable**: todas las funciones que usan azar reciben `random?: RandomNumber`
  para ser 100% deterministas en tests.
- **Tabla de Resultados de Combate canónica**: 10 filas (tirada 0-9) × 13 columnas (rangos de
  ratio de combate de ≤−11 a ≥+11). Fuente: MikeSchulenberg/LoneWolfCombatCalculator.
- **Encoding ISO-8859-1**: el XML de Project Aon está en ISO-8859-1. El script de importación
  detecta el encoding por la cabecera XML y lee con `latin1` si es necesario.

## Créditos y licencia del contenido

El texto e ilustraciones de *Lobo Solitario* pertenecen a sus autores y se distribuyen
a través de [Project Aon](https://www.projectaon.org) bajo la **Project Aon License**
(uso no comercial, con condiciones de atribución y distribución).

Este proyecto es un trabajo personal **no comercial**. Antes de publicarlo en internet,
revisa y cumple los términos de la Project Aon License (atribución visible, enlace a
Project Aon, sin uso comercial). El código de esta aplicación es independiente del
contenido del libro.
