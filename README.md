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

- Node.js >= 22.13 (ver `.nvmrc`)
- pnpm 11+

## Desarrollo

```bash
pnpm install      # instala dependencias de todo el monorepo
pnpm dev          # arranca web y api en paralelo
```

## Créditos y licencia del contenido

El texto e ilustraciones de *Lobo Solitario* pertenecen a sus autores y se distribuyen
a través de [Project Aon](https://www.projectaon.org) bajo la **Project Aon License**
(uso no comercial, con condiciones de atribución y distribución).

Este proyecto es un trabajo personal **no comercial**. Antes de publicarlo en internet,
revisa y cumple los términos de la Project Aon License. El código de esta aplicación es
independiente del contenido del libro.
