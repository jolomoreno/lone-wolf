# TODO / Backlog — Lobo Solitario

> Estado a 2026-06-16. Roadmap principal + deuda técnica detectada en una revisión del proyecto.

## Roadmap principal
- [ ] **7. Personaje** — Destreza, Resistencia, Disciplinas del Kai, equipo (dominio puro del front).
- [ ] **8. Combate** + tabla de números aleatorios.
- [ ] **9. Guardado** de la partida en localStorage.
- [ ] **10. Despliegue** (Atlas + Render + Vercel).

## Refactors / deuda técnica (detectados)
- [ ] **Tests (vitest) — no hay ninguno.** Prioridad alta: es el sentido del hexagonal.
      Empezar por lo puro: `parse-gamebook-xml.ts`, `section.mapper.ts`, y los casos de
      uso `GetSection` (back y front, este último con un `ContentPort` falso).
- [ ] **Navegación por id, no por número.** Hoy la API es `GET /sections/:number` y el
      front parsea `"sectNNN" → número` ([SectionView.tsx](apps/web/src/ui/components/SectionView.tsx)).
      Las secciones especiales (`number = null`) y los `choices` que apunten a ellas quedan
      inalcanzables (botón deshabilitado). Refactor: `GET /sections/:id` (el repositorio ya
      tiene `findById`) y navegar con `choice.target` directo.
- [ ] **Lint + formato.** No hay ESLint/Prettier/Biome. El script raíz `pnpm lint` no
      encuentra scripts en los paquetes. Añadir config + script `lint` por paquete.
- [ ] **Mongo obligatorio en producción.** `isProduction` está definido en
      [env.ts](apps/api/src/config/env.ts) pero **sin usar**; usarlo para fallar rápido si
      falta `MONGODB_URI` en prod (hoy la conexión es tolerante a fallos).
- [ ] **Build/arranque de la API en producción.** Dev y `start` usan `tsx`. Para Render:
      decidir entre correr con `tsx` en prod (mover `tsx` a deps o instalar devDeps) o
      compilar. Ojo: `@lone-wolf/shared` exporta `.ts` (va bien con tsx/Vite, pero un `tsc`
      plano no lo emite).
- [ ] **Ilustraciones.** Hoy son un placeholder. Decidir manejo de las imágenes de Project
      Aon (descargar y servir en local vs. omitir), respetando la licencia.
- [ ] **Frontmatter sin usar.** Se importaron 38 secciones no numeradas (reglas, Disciplinas
      del Kai, Equipo, tabla de números aleatorios) pero no se alcanzan. Integrarlas en el
      flujo (creación de personaje, reglas) — enlaza con el paso 7/8.

## Para el paso 8 (combate) — datos que harán falta
- [ ] Codificar la **Tabla de Resultados del Combate** (matriz: ratio de combate × número
      aleatorio → daño a cada lado). Son reglas/números, no prosa.
- [ ] **Generador de número aleatorio 0–9** (sustituye a la tabla de números aleatorios).
- [ ] Tras un combate, las opciones dependen del resultado (ganar/perder); hoy se muestran
      todas siempre.

## Preparación del despliegue (paso 10)
- [ ] `CORS_ORIGIN` debe apuntar a la URL desplegada del front (Vercel).
- [ ] Configurar monorepo pnpm en Vercel/Render (root dir, install/build commands), Node 22
      vía `.nvmrc`/`engines`, y asegurar el build de `esbuild` (`allowBuilds`) en CI.
- [ ] Endurecer la API: `helmet`, quizá rate-limit; validación de variables de entorno.
- [ ] Cumplir la **Project Aon License** al publicar: atribución visible + enlace + no comercial.

## Calidad / nice-to-have
- [ ] CI (GitHub Actions): `typecheck` + `test` + `lint` en cada push.
- [ ] Claves de listas en React: hoy `key={index}`; usar claves estables donde aplique.
- [ ] Mantener sincronizados `Section` (dominio) ↔ `SectionDTO` (el mapper es la frontera).
- [ ] Responsive/móvil y accesibilidad del lector.
