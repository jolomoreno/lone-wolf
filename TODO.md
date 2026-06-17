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
- [ ] **10. Experiencia de juego** — guardado manual, carga explícita y demás
      acciones de partida bajo control consciente del jugador.
- [ ] **11. Fidelidad del juego** — opciones condicionales, bonuses de arma,
      curación, comidas, eludir combate y estados finales. Arranca con el
      refactor de navegación por id (prerequisito técnico).
- [ ] **12. Tiradas animadas** — dados en la creación del personaje con revelación
      progresiva y animación.
- [ ] **13. Refactors / deuda técnica** — lint, tests del backend, build en
      producción y limpieza general de código.
- [ ] **14. Despliegue + CI/CD** — Atlas + Render + Vercel + GitHub Actions.

---

## Hecho desde la última revisión (pasos 7-9)

- vitest configurado + 55 tests de dominio (personaje, equipo, combate, GameState,
  adaptador localStorage).
- Fix de codificación ISO-8859-1 del XML (acentos/eñes correctos en Mongo).
- Equipo inicial fiel (equipo fijo + objeto del almacén por tirada + restricciones
  de armas/mochila/oro; comidas como objetos de mochila).
- Combate completo (tabla + modificadores + asaltos + UI con barras y registro).
- GameState inmutable + autoguardado + pantalla Continuar/Nueva partida.

---

## Paso 10 — Experiencia de juego

El autoguardado silencioso actual no es fiel al libro y puede generar confusión
(el jugador no sabe si está guardado). El jugador debe tener control consciente
sobre cuándo guarda y cuándo carga.

- [ ] Botón **"Guardar partida"** visible en el pie de la pantalla de aventura.
- [ ] Botón **"Cargar partida"** en la pantalla de inicio.
- [ ] Guardar sigue usando `localStorage` y el `SavePort` ya existe — solo cambia la UI.
- [ ] Decidir si mantener el autoguardado como red de seguridad ante cierre inesperado
      (recomendado) o eliminarlo del todo.

---

## Paso 11 — Fidelidad del juego

> **Prerequisito técnico (primer subpaso):** refactor de navegación por id antes
> de abordar opciones condicionales y frontmatter.
>
> El motivo: la API es `GET /sections/:number` y las secciones especiales
> (`number = null`) son inalcanzables. Sin este refactor, el paso 11 queda
> incompleto: no se pueden navegar las secciones de reglas/Disciplinas ni las
> que tienen condiciones basadas en id.
> Refactor concreto: `GET /sections/:id` (el repo ya tiene `findById`) y navegar
> con `choice.target` directo en lugar de parsear `"sectNNN" → número`.

### Opciones condicionales
- [ ] Evaluar condiciones del `GameState` (flags, objetos, disciplinas) para
      mostrar u ocultar opciones. El `GameState` ya tiene la estructura necesaria;
      falta (a) la lógica de evaluación y (b) los datos de condición por sección
      (el XML no los trae estructurados — habrá que curar esos datos a mano).

### Bonus de "Dominio de las Armas"
- [ ] Unificar los dos vocabularios de armas: `WeaponType` (de la disciplina) e ids
      de objetos (`"axe"`, `"sword"`, `"mace"`, `"spear"`, `"stake"`).
      `hasWeaponskillBonus` casa por `id === weaponskillWeapon`, por lo que p.ej.
      `"Estaca"` (id `stake`) nunca casa con `quarterstaff`. Afinar también la
      tirada exacta 0-9 del arma (hoy es uniforme en vez de usar la tirada real).

### Inmunidad a Ataque Psíquico
- [ ] El +2 de Mindblast se aplica siempre; algunos enemigos son inmunes (dato
      específico de la sección que no modelamos). Requiere datos por sección.

### Eludir / huir del combate
- [ ] No implementado. Es una opción contextual de la sección (también requiere datos).

### Curación / Comidas / Poción
- [ ] Poción Curativa (+4 Resistencia tras combate), disciplina Curación (+1
      Resistencia por sección sin combate) y comer Comidas cuando el libro lo
      exige no afectan todavía a la partida.

### Cambios desde el texto de la sección
- [ ] "Pierdes 2 de Resistencia", "consigues X"... no se aplican. No hay mecanismo
      ni datos estructurados en el contenido para ello.

### Estados finales
- [ ] Ganar el libro (sección final) y morir fuera de combate (Resistencia a 0 por
      causas ajenas al combate) no tienen tratamiento especial.

### Ilustraciones
- [ ] Placeholder actual. Decidir manejo de las imágenes de Project Aon y su
      licencia de distribución.

---

## Paso 12 — Tiradas animadas en la creación del personaje

El jugador lanzará cada tirada pulsando un botón, con animación de dado:

- [ ] **Dados virtuales**: mostrar un dado d10 (0-9) animado que "rueda" y se detiene
      en el resultado. Puede ser CSS puro (rotación) o un emoji/SVG animado.
- [ ] **Revelación progresiva**: Destreza → Resistencia → Oro → Disciplinas →
      arma del Dominio → objeto del almacén. Cada tirada es independiente.
- [ ] Alternativa más simple: botón "Tirar" por stat con transición breve
      (fade o scale) antes de pasar a la siguiente.

---

## Paso 13 — Refactors / deuda técnica

> Nota: la "navegación por id" se adelanta al paso 11 porque es prerequisito de
> la fidelidad. El resto de deuda técnica se liquida aquí antes del despliegue.

### Tests
- [~] Dominio del front cubierto (55 tests). Falta el **backend y adaptadores**:
      `parse-gamebook-xml.ts`, `section.mapper.ts`, casos de uso `GetSection`
      (back y front con un `ContentPort` falso).

### Lint y formato
- [ ] No hay ESLint/Prettier/Biome; `pnpm lint` (raíz) no hace nada.

### API en producción
- [ ] `isProduction` en [env.ts](apps/api/src/config/env.ts) sigue sin usar;
      activarlo para fallar rápido sin `MONGODB_URI` en prod.
- [ ] Dev y `start` usan `tsx`; decidir estrategia para Render (`tsx` en prod o
      compilar; `@lone-wolf/shared` exporta `.ts`).
- [ ] Endurecer la API: `helmet`, quizá rate-limit; validación de variables de entorno.

### Limpiezas de código
- [ ] **CSS muerto:** `.combat-box` y `.combat-title` en
      [index.css](apps/web/src/index.css) ya no se usan (el combate lo pinta
      `CombatPanel`).
- [ ] Claves de lista por índice en `SectionView` (bloques) — usar claves estables.
- [ ] Mantener sincronizados `Section` (dominio API) ↔ `SectionDTO` (el mapper
      es la frontera).

### Frontmatter
- [~] El equipo ya se resuelve en la creación; las secciones de
      reglas/Disciplinas/tabla siguen importadas pero inalcanzables. Depende de
      la navegación por id (resuelta en paso 11).

---

## Paso 14 — Despliegue + CI/CD

- [ ] `CORS_ORIGIN` apuntando a la URL desplegada del front (Vercel).
- [ ] Configurar monorepo pnpm en Vercel/Render (root dir, install/build), Node 22
      vía `.nvmrc`/`engines`, y asegurar el build de `esbuild` (`allowBuilds`).
- [ ] CI (GitHub Actions): `typecheck` + `test` + `lint` en cada push.
- [ ] Cumplir la **Project Aon License** al publicar: atribución visible + enlace
      a Project Aon + sin uso comercial.

---

## Calidad / nice-to-have (sin paso asignado)

- [ ] Responsive/móvil y accesibilidad (lector y panel de combate).
- [ ] Error boundary en React (evitar pantalla en blanco si algo peta).
