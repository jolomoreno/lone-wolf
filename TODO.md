# TODO / Backlog — Lobo Solitario

> Estado a 2026-06-17. Roadmap + deuda técnica + huecos de fidelidad detectados
> en una revisión de toda la app.

## Roadmap principal

- [x] **1-6. Base** — monorepo pnpm, contenido del Libro 1 en MongoDB (parser XML
      ISO-8859-1), API REST `/sections/:number`, lectura y navegación en la web.
- [x] **7. Personaje** — creación por tiradas (Destreza, Resistencia, Oro),
      5 Disciplinas del Kai, equipo inicial fiel (fijo + almacén por tirada) y
      ficha en partida.
- [x] **8. Combate** — Tabla de Resultados canónica + combate por asaltos (UI) que
      usa y modifica la Resistencia real del personaje.
- [x] **9. Guardado** — GameState (sección + personaje + historial + flags) con
      autoguardado en localStorage y pantalla "Continuar / Nueva partida".
- [ ] **10. Guardado manual por el jugador** — reemplazar/complementar el autoguardado
      silencioso con un botón explícito de "Guardar partida" y "Cargar partida". El
      jugador debe tener control consciente sobre cuándo guarda (fidelidad al libro).
- [ ] **11. Tiradas iniciales animadas** — en la pantalla de creación del personaje,
      las tiradas de Destreza, Resistencia, Oro y arma deben hacerlas el jugador
      pulsando un botón, con animación de dado y revelación progresiva del resultado.
      Ver detalles en la sección "Experiencia de juego" abajo.
- [ ] **12. Despliegue** (Atlas + Render + Vercel).

## Hecho desde la última revisión (pasos 7-9)

- vitest configurado + 55 tests de dominio (personaje, equipo, combate, GameState,
  adaptador localStorage).
- Fix de codificación ISO-8859-1 del XML (acentos/eñes correctos en Mongo).
- Equipo inicial fiel (equipo fijo + objeto del almacén por tirada + restricciones
  de armas/mochila/oro; comidas como objetos de mochila).
- Combate completo (tabla + modificadores + asaltos + UI con barras y registro).
- GameState inmutable + autoguardado + pantalla Continuar/Nueva partida.

## Experiencia de juego (UX/fidelidad)

### Guardado manual (paso 10, prioritario)
El autoguardado silencioso actual no es fiel al libro y puede generar confusión
(el jugador no sabe si está guardado). Propuesta:
- Botón **"Guardar partida"** visible en el pie de la pantalla de aventura.
- Botón **"Cargar partida"** (o equivalente) en la pantalla de inicio.
- Guardar sigue usando `localStorage` y el `SavePort` ya existe — solo cambia la UI.
- Decidir si mantener autoguardado como red de seguridad (ante cierre inesperado)
  además del guardado manual, o eliminarlo del todo.

### Tiradas animadas en la creación del personaje (paso 11)
El jugador lanzará cada tirada pulsando un botón, con animación de dado:
- **Dados virtuales**: mostrar un dado d10 (0-9) animado que "rueda" y se detiene
  en el resultado. Puede ser CSS puro (rotación) o un emoji/SVG animado.
- **Revelación progresiva**: primero Destreza → después Resistencia → después Oro →
  después Disciplinas → después arma del Dominio → después objeto del almacén.
- Cada tirada es independiente y el jugador las controla una a una.
- Alternativa más simple: botón "Tirar" por stat que muestra el número con una
  transición breve (fade o scale) antes de pasar a la siguiente.

## Refactors / deuda técnica

- [~] **Tests.** Dominio del front cubierto (55 tests). Falta el **backend y adaptadores**:
      `parse-gamebook-xml.ts`, `section.mapper.ts`, casos de uso `GetSection`
      (back y front con un `ContentPort` falso).
- [ ] **Navegación por id, no por número.** La API es `GET /sections/:number` y el
      front parsea `"sectNNN" → número`. Las secciones especiales (`number = null`)
      quedan inalcanzables. Refactor: `GET /sections/:id` (el repo ya tiene `findById`)
      y navegar con `choice.target` directo.
- [ ] **Lint + formato.** No hay ESLint/Prettier/Biome; `pnpm lint` (raíz) no hace nada.
- [ ] **Mongo obligatorio en producción.** `isProduction` sigue sin usar
      ([env.ts](apps/api/src/config/env.ts)); usarlo para fallar rápido sin `MONGODB_URI` en prod.
- [ ] **Build/arranque de la API en producción.** Dev y `start` usan `tsx`; decidir
      estrategia para Render (`tsx` en prod o compilar; `@lone-wolf/shared` exporta `.ts`).
- [ ] **Ilustraciones.** Placeholder. Decidir manejo de las imágenes de Project Aon.
- [~] **Frontmatter.** El equipo ya se resuelve en la creación; las secciones de
      reglas/Disciplinas/tabla siguen importadas pero inalcanzables (depende de navegar por id).

## Fidelidad del juego

- [~] **Opciones condicionales.** El `GameState` (sección + personaje + historial +
      **flags**) ya existe (paso 9), así que la base está. Falta: (a) evaluar
      condiciones sobre él para mostrar/ocultar opciones, y (b) tener esos datos de
      condición por sección (el XML no los trae estructurados).
- [ ] **Bonus de "Dominio de las Armas".** Dos vocabularios de armas conviven: `WeaponType`
      (de la disciplina) e ids de objetos ("axe", "sword", "mace", "spear", "stake").
      `hasWeaponskillBonus` casa por `id === weaponskillWeapon`, así que p.ej. "Estaca"
      (id `stake`) nunca casa con `quarterstaff`. Unificar vocabulario + afinar la tirada
      exacta 0–9 del arma (hoy es uniforme).
- [ ] **Inmunidad a "Ataque Psíquico".** El +2 de Mindblast se aplica siempre; algunos
      enemigos son inmunes (dato específico de la sección, que no modelamos).
- [ ] **Eludir/huir del combate.** No implementado; es una opción contextual de la sección.
- [ ] **Curación / Comidas / Poción sin conectar.** Poción Curativa (+4 tras combate),
      disciplina Curación (+1 Resistencia por sección sin combate) y comer Comidas cuando
      el libro lo exige no afectan a la partida todavía.
- [ ] **Cambios desde el texto de la sección.** "Pierdes 2 de Resistencia", "consigues X"...
      no se aplican (no hay mecanismo ni datos estructurados para ello en el contenido).
- [ ] **Estados finales.** Ganar el libro (sección final) y morir fuera de combate
      (Resistencia a 0 por otras causas) no tienen tratamiento especial.

## Limpiezas de código

- [ ] **CSS muerto:** `.combat-box` y `.combat-title` en [index.css](apps/web/src/index.css)
      ya no se usan (el combate lo pinta `CombatPanel`).
- [ ] Claves de lista por índice en `SectionView` (bloques) — usar claves estables si procede.
- [ ] Mantener sincronizados `Section` (dominio API) ↔ `SectionDTO` (el mapper es la frontera).

## Preparación del despliegue (paso 12)

- [ ] `CORS_ORIGIN` apuntando a la URL desplegada del front (Vercel).
- [ ] Configurar monorepo pnpm en Vercel/Render (root dir, install/build), Node 22 vía
      `.nvmrc`/`engines`, y asegurar el build de `esbuild` (`allowBuilds`) en CI.
- [ ] Endurecer la API: `helmet`, quizá rate-limit; validación de variables de entorno.
- [ ] Cumplir la **Project Aon License** al publicar: atribución visible + enlace + no comercial.

## Calidad / nice-to-have

- [ ] CI (GitHub Actions): `typecheck` + `test` + `lint` en cada push.
- [ ] Responsive/móvil y accesibilidad (lector y panel de combate).
- [ ] Error boundary en React (evitar pantalla en blanco si algo peta).
