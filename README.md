# Lobo Solitario — webapp interactiva

Adaptación interactiva del libro-juego **Lobo Solitario, Libro 1: Huida de la Oscuridad**,
para poder jugar sin lápiz ni papel: gestión de Resistencia/Destreza, combates,
inventario y guardado de la partida.

## Estructura (monorepo con pnpm workspaces)

```
lone-wolf/
├── apps/
│   ├── web/      # Frontend: React + Vite + TypeScript
│   └── api/      # Backend: Express + TypeScript + Mongoose (MongoDB)
├── packages/
│   └── shared/   # Tipos TypeScript compartidos entre web y api
└── data/         # XML de Project Aon + script de importación a Mongo
```

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
pnpm dev          # arranca web + api en paralelo
pnpm build        # build de producción de todos los paquetes
pnpm typecheck    # comprobación de tipos de todo el monorepo
pnpm --filter @lone-wolf/api import:book -- --dry-run   # parsea el XML sin tocar Mongo
```

## Créditos y licencia del contenido

El texto e ilustraciones de *Lobo Solitario* pertenecen a sus autores y se distribuyen
a través de [Project Aon](https://www.projectaon.org) bajo la **Project Aon License**
(uso no comercial, con condiciones de atribución y distribución).

Este proyecto es un trabajo personal **no comercial**. Antes de publicarlo en internet,
revisa y cumple los términos de la Project Aon License. El código de esta aplicación es
independiente del contenido del libro.
