# Lobo Solitario — webapp interactiva

Adaptación interactiva del libro-juego **Lobo Solitario, Libro 1: Huida de la Oscuridad**,
para poder jugar sin lápiz ni papel: gestión de Resistencia/Destreza, combates,
inventario y guardado de la partida.

## Estado del proyecto

| Paso | Qué | Estado |
|------|-----|--------|
| 1-9 | Base · Personaje · Combate · Guardado automático | ✅ Hecho |
| 10 | Experiencia de juego — guardado manual, control consciente del jugador | ✅ Hecho |
| 11 | Fidelidad del juego — reglas por sección, ilustraciones, tiradas, botín | ✅ Hecho |
| 12 | Tiradas animadas — animación CSS del dado, revelación progresiva, pulido UX | ✅ Hecho |
| **13** | **Refactors / deuda técnica** — lint, tests backend, build prod | ⬜ Siguiente |
| 14 | Despliegue + CI/CD — Atlas · Render · Vercel · GitHub Actions | ⬜ |

> Detalle completo, prerequisitos y subtareas en [TODO.md](TODO.md).

## Estructura (monorepo con pnpm workspaces)

```
lone-wolf/
├── apps/
│   ├── web/      # Frontend: React + Vite + TypeScript
│   └── api/      # Backend: Express 5 + TypeScript + Mongoose (MongoDB)
├── packages/
│   └── shared/   # DTOs/contratos entre web y api (solo tipos de red)
└── data/         # XML de Project Aon + script de importación a Mongo
```

### apps/web — frontend

```
apps/web/src/
├── domain/
│   ├── character/        # Character, create-character (stats + disciplinas + equipo inicial),
│   │                     #   character-operations (heal, applyDamage, addWeapon, loseAllEquipment…)
│   ├── combat/           # CombatTable canónica (10×13), applyRound, tipos Enemy/CombatStatus
│   └── game/             # GameState (inmutable, versionado), goToSection, getFlag/setFlag
│                         #   section-rules: reglas curadas por sección (condiciones de elección,
│                         #   modificadores CS, inmunidad Mindblast, elusión, daño narrativo,
│                         #   comidas obligatorias, tablas de tirada, botín por sección)
├── application/
│   ├── section/          # Caso de uso GetSection (invoca ContentPort)
│   └── ports/            # ContentPort (acceso al contenido), SavePort (persistencia)
├── infrastructure/
│   ├── http/             # HttpContentAdapter — fetch a la API REST
│   └── storage/          # LocalStorageSaveAdapter — serializa/deserializa GameState
├── config/
│   ├── composition-root  # Única instancia de adaptadores; inyectada vía DependencyProvider
│   └── project-aon       # URL base de ilustraciones + texto de atribución de licencia
└── ui/
    ├── App.tsx            # Orquestador: inicio / creación / aventura; autoguardado
    ├── DependencyProvider # Contexto React que expone los adaptadores inyectados
    ├── components/
    │   ├── CharacterCreation  # Tiradas de stats (revelación progresiva), selección de 5 disciplinas, equipo inicial
    │   ├── CharacterSheet     # Ficha en partida: stats, disciplinas, inventario,
    │   │                      #   botones Usar (poción) y Soltar (arma/mochila)
    │   ├── SectionView        # Texto + ilustración (hotlink Project Aon) + opciones;
    │   │                      #   deshabilita con 🔒 las opciones cuya condición no se cumple
    │   ├── CombatPanel        # Barras de Resistencia, ratio efectivo, modificadores CS,
    │   │                      #   botón Eludir (si la sección lo permite), log de asaltos
    │   ├── DiceRoll           # Dado animado (CSS @keyframes); API: roll(value, onDone) / reset()
    │   ├── RollPanel          # Tirada en Tabla de la Suerte: muestra dado, aplica rama y navega
    │   └── LootPanel          # Objetos cogibles por sección; respeta límites de inventario
    └── hooks/
        └── useSection         # Carga la sección actual vía GetSection; devuelve {loading|ok|error}
```

### apps/api — backend

```
apps/api/src/
├── domain/
│   └── section/          # Entidades puras: Section, ContentBlock (paragraph|illustration|combat),
│                         #   Choice, SectionRepository (puerto — interfaz sin implementación)
├── application/
│   └── section/          # Caso de uso GetSection: execute(id: string) → Section | null
├── infrastructure/
│   ├── http/
│   │   ├── server.ts         # Express app, helmet (cabeceras HTTP seguras), CORS
│   │   │                     #   (localhost:* en dev; CORS_ORIGIN en prod), middleware JSON, 500
│   │   ├── section.router    # Monta GET /sections/:id y GET /health
│   │   └── section.controller# Valida el id (regex alfanum), llama al caso de uso, devuelve DTO
│   └── persistence/
│       ├── section.schema    # Mongoose schema + model (Mongo Atlas)
│       ├── section.mapper    # Section (dominio) → SectionDTO (@lone-wolf/shared); aserción de contrato en tiempo de compilación
│       ├── mongo-section-repository  # Implementación de SectionRepository sobre Mongoose
│       └── parse-gamebook-xml        # Parser ISO-8859-1 del XML de Project Aon → documentos Mongo
└── config/
    ├── composition-root  # Instancia MongoSectionRepository y lo pasa al caso de uso
    └── env               # Lee variables de entorno (PORT, MONGODB_URI, CORS_ORIGIN, NODE_ENV)
```

## Arquitectura

Ambas aplicaciones siguen **arquitectura hexagonal (Ports & Adapters)**:

```
Dominio  →  Aplicación (casos de uso + puertos)  →  Infraestructura (adaptadores)
```

- El **dominio** es puro TypeScript sin dependencias externas (inmutable, testable).
- Los **puertos** son interfaces que el dominio define; los **adaptadores** los implementan.
- El **composition root** es el único lugar que instancia adaptadores concretos y los enchufa
  a los casos de uso.
- `@lone-wolf/shared` contiene solo DTOs de red (no modelos de dominio).

### Capas del frontend

| Capa | Ruta | Qué hay |
|------|------|---------|
| Dominio | `apps/web/src/domain/` | `Character`, `GameState`, `section-rules`, combat logic — funciones puras |
| Aplicación | `apps/web/src/application/` | Caso de uso `GetSection`, puertos `ContentPort` y `SavePort` |
| Infraestructura | `apps/web/src/infrastructure/` | `HttpContentAdapter`, `LocalStorageSaveAdapter` |
| UI | `apps/web/src/ui/` | Componentes React, hooks, DI via `DependencyProvider` |

### Capas del backend

| Capa | Ruta | Qué hay |
|------|------|---------|
| Dominio | `apps/api/src/domain/` | Entidades `Section`, `ContentBlock`, `Choice`; puerto `SectionRepository` |
| Aplicación | `apps/api/src/application/` | Caso de uso `GetSection` |
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
- **La web carga pero no aparecen las secciones** → la API está parada o `MONGODB_URI` es incorrecto
  en `apps/api/.env`. Comprueba `/health`.
- **La API no conecta a Mongo** → revisa que tu IP esté permitida en *Network Access* de Atlas.
- **Error CORS "Access-Control-Allow-Origin"** → el frontend está corriendo en un puerto distinto
  al esperado. En desarrollo la API acepta cualquier `localhost:*`; si ves este error, asegúrate de
  que estás arrancando con `pnpm dev` (composition root correcto) y no con un proceso de API antiguo
  aún vivo en el puerto 4000 (`lsof -ti:4000 | xargs kill`).

## Scripts útiles

```bash
pnpm dev                  # arranca web + api en paralelo
pnpm build                # build de producción de todos los paquetes
pnpm typecheck            # comprobación de tipos de todo el monorepo (3 proyectos)
pnpm test                 # ejecuta todos los tests (vitest)
pnpm --filter @lone-wolf/api import:book -- --dry-run   # parsea el XML sin tocar Mongo
```

## Tests

```bash
pnpm test          # todos (80 tests)
pnpm test --watch  # modo watch
```

Los tests cubren el dominio del frontend: creación de personaje, equipo inicial, combate
(tabla de resultados, asaltos, modificadores), `GameState` (navegación, flags, guardado)
y `section-rules` (condiciones de elección, efectos de entrada, tablas de tirada, botín).
Se usan dobles inyectables (`RandomNumber`, `KeyValueStorage`) para evitar dependencias
de DOM o aleatoriedad real.

Un test específico valida que **cada tabla de tirada en `SECTION_ROLL_TABLES` cubre
exactamente los 10 valores (0–9) sin huecos ni solapamientos**.

Pendiente: tests del backend (parser XML, mapper, caso de uso `GetSection`).

## API REST

```
GET /health          → { status: "ok", db: "connected" }
GET /sections/:id    → SectionDTO  (id de sección del libro, ej: /sections/sect1)
```

El `id` de sección sigue el formato `sect<número>` (ej. `sect1`, `sect85`, `sect350`).
Las secciones especiales (reglas, tabla de Weaponskill, equipo del almacén) tienen ids
alfanuméricos sin número fijo.

El DTO de sección sigue el esquema de `@lone-wolf/shared` (`API_CONTRACT_VERSION = 1`).
Cada sección contiene bloques de contenido (`paragraph | illustration | combat`) y opciones.
El guardado en `localStorage` está versionado (`SAVE_FORMAT_VERSION = 2`); partidas antiguas
en formato v1 (ids numéricos) se descartan automáticamente al cargar.

## Decisiones de diseño relevantes

- **Navegación por id string**: `GameState.currentSection` y el historial usan `"sect1"`,
  `"sect85"`, etc. en lugar de números enteros. Esto permite alcanzar secciones especiales
  (reglas, almacén) y simplifica la navegación: el frontend usa `choice.target` directamente
  sin parsear.
- **Reglas curadas por sección** (`section-rules.ts`): en lugar de parsear semántica del texto
  en tiempo de ejecución, los datos de fidelidad (condiciones de elección, modificadores CS,
  inmunidades al Mindblast, puntos de elusión, daño narrativo, comidas, tablas de tirada y botín)
  se declaran en una tabla estática derivada del XML de Project Aon. Evita heurísticas frágiles
  y es fácil de auditar sección por sección.
- **Ilustraciones hotlinked desde Project Aon**: las imágenes se cargan directamente desde
  `projectaon.org` (sin redistribuir), cumpliendo la Project Aon License. Si una imagen
  no carga, aparece un marcador de posición. Atribución y enlace visibles en el pie de página.
- **Meals como objetos de mochila**: las comidas no son un contador; son `InventoryItem` con
  `kind: "meal"` dentro del `backpack[]`. Así respetan el límite de 8 huecos de mochila.
- **Objeto del almacén**: se decide por tirada (0–9 aleatorio), no por elección del jugador.
- **RandomNumber inyectable**: todas las funciones que usan azar reciben `random?: RandomNumber`
  para ser 100 % deterministas en tests.
- **Tabla de Resultados de Combate canónica**: 10 filas (tirada 0–9) × 13 columnas (rangos de
  ratio de combate de ≤−11 a ≥+11). Fuente: MikeSchulenberg/LoneWolfCombatCalculator.
- **Encoding ISO-8859-1**: el XML de Project Aon está en ISO-8859-1. El script de importación
  detecta el encoding por la cabecera XML y lee con `latin1` si es necesario.
- **CORS en desarrollo**: la API acepta cualquier `localhost:*` como origen en `development`
  (el puerto del frontend puede variar: 5173 con Vite directo, 5174 con herramientas de preview,
  etc.). En producción se usa el valor estricto de `CORS_ORIGIN` del entorno.

## Créditos y licencia del contenido

El texto e ilustraciones de *Lobo Solitario* pertenecen a sus autores y se distribuyen
a través de [Project Aon](https://www.projectaon.org) bajo la **Project Aon License**
(uso no comercial, con condiciones de atribución y distribución).

Este proyecto es un trabajo personal **no comercial**. Antes de publicarlo en internet,
revisa y cumple los términos de la Project Aon License (atribución visible, enlace a
Project Aon, sin uso comercial). El código de esta aplicación es independiente del
contenido del libro.
