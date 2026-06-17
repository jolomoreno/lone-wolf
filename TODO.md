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
- [x] **10. Experiencia de juego** — guardado manual, carga explícita y demás
      acciones de partida bajo control consciente del jugador.
- [x] **11. Fidelidad del juego** — refactor navegación por id, tabla weaponskill
      exacta, curación (Healing) por sección, victoria (sect350) y muerte fuera
      de combate. Pendiente: opciones condicionales y uso activo de objetos
      (requieren datos estructurados por sección).
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

## Paso 10 — Experiencia de juego ✓

- [x] Botón **"Guardar partida"** en el pie de la aventura con indicador "✓ Guardado HH:MM"
      (desaparece a los 3 s).
- [x] Pantalla de inicio muestra timestamp del guardado ("Partida guardada · HH:MM").
- [x] Separados "← Inicio" (vuelve al menú sin borrar) y "Nueva partida" (con confirmación).
- [x] `onNew` en `StartScreen` ahora borra el localStorage correctamente.
- [x] Autoguardado silencioso mantenido como red de seguridad ante cierre inesperado.

---

## Paso 11 — Fidelidad del juego ✓

### Hecho en este paso

- [x] **Refactor navegación por id** — API pasa a `GET /sections/:id`; `GetSection`
      usa `findById`; `GameState.currentSection` e `history` son `string[]`; el
      frontend navega con `choice.target` directo (sin parsear "sectNNN" → número).
      Secciones especiales (`number = null`) ya son alcanzables.
- [x] **Formato de guardado v2** — `SAVE_FORMAT_VERSION` bumpeado a 2; el adaptador
      descarta automáticamente partidas antiguas (v1 usaba números).
- [x] **Tabla exacta de Weaponskill** — `rollWeaponskillWeapon` usa la tabla 0-9
      del Libro 1 (Daga/Lanza/Maza/EspadaCorta/MartilloGuerra/Espada/Hacha/Bastón/
      Espadón/Daga) en lugar del reparto uniforme anterior.
- [x] **Curación (Healing)** — al navegar desde una sección sin combate, si el
      personaje tiene la disciplina "Curación", gana +1 Resistencia (acotado al
      máximo).
- [x] **Victoria** — llegar a "sect350" muestra la pantalla de fin del Libro 1.
- [x] **Muerte fuera de combate** — si `isDead(character)` y no hay enemigo en
      la sección actual, se muestra la pantalla de fin de aventura.
- [x] **Opciones condicionales** — `section-rules.ts` contiene las condiciones
      curadas de 35+ secciones (disciplinas, oro, Resistencia). `SectionView`
      deshabilita y marca con 🔒 los choices cuya condición no se cumple.
- [x] **Inmunidad al Ataque Psíquico** — datos curados para sect133, sect170,
      sect255 y sect342; el `CombatPanel` omite el +2 de Mindblast al computar
      el ratio si el enemigo es inmune.
- [x] **Modificador de CS por ataque mental del enemigo** — Vordak (−2 DC, salvo
      Defensa Psíquica), Kraan (−1 DC); aplicado al inicio del combate.
- [x] **Eludir combate** — botón "Eludir" disponible en sect169 (tras asalto 1),
      sect180, sect191, sect220 y sect339; navega a la sección correcta.
- [x] **Poción Curativa** — botón "Usar" en la ficha cuando hay pociones en la
      mochila; aplica +4 Resistencia y elimina la poción del inventario.
- [x] **Cambios de stats desde el texto** — `SECTION_ENTRY_EFFECTS` aplica el daño
      narrativo incondicional (13 secciones: sect76, sect158, sect203…) una sola
      vez al entrar, con aviso al jugador. Si la Resistencia llega a 0, se muestra
      la pantalla de muerte fuera de combate.
- [x] **Comidas cuando el libro lo exige** — 6 secciones (sect130, sect147…)
      consumen una Comida; la disciplina de Caza la evita; sin Comida se pierden
      3 de Resistencia.
- [x] **Ilustraciones** — se enlazan desde el servidor de Project Aon (hotlink,
      sin redistribuir → cumple la licencia) con fallback a placeholder si una
      imagen no carga. Atribución + enlace a projectaon.org en el pie. Verificado:
      las imágenes cargan en el navegador (sin bloqueo por referer/CORS).
- [x] **Tiradas en la Tabla de la Suerte** — 20 secciones con tirada obligatoria
      (`SECTION_ROLL_TABLES`): el `RollPanel` fuerza tirar el dado (0-9), el azar
      elige la rama y aplica su efecto (daño, o pérdida de equipo en sect188).
      Test valida que cada tabla cubre 0-9 sin huecos ni solapes. De paso se
      corrigió un bug: sect188 aplicaba −3 incondicional en vez de según la tirada.
- [x] **Botín por sección** — oro automático al entrar (sect33, sect62, sect94,
      sect269…) acotado a 50 y anti-farmeo (flag por sección); objetos cogibles
      con `LootPanel` (sect124, sect197, sect291, sect315) respetando los límites
      de inventario. Botones de **soltar** arma/objeto en la ficha para hacer hueco.

### Pendiente

- [ ] **sect21** — tirada encadenada (cascada con muerte); excluida de
      `SECTION_ROLL_TABLES`, sigue como elección libre. Modelar tiradas múltiples.
- [ ] **`tssf.png`** (1 ilustración de portada, edición Alvarez) no se localiza en
      el servidor de Project Aon; cae al placeholder. Buscar su ruta exacta.

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
- [~] Dominio del front cubierto (69 tests, incl. reglas por sección). Falta el
      **backend y adaptadores**: `parse-gamebook-xml.ts`, `section.mapper.ts`,
      casos de uso `GetSection` (back y front con un `ContentPort` falso).

### Lint y formato
- [ ] No hay ESLint/Prettier/Biome; `pnpm lint` (raíz) no hace nada.

### API en producción
- [ ] `isProduction` en [env.ts](apps/api/src/config/env.ts) sigue sin usar;
      activarlo para fallar rápido sin `MONGODB_URI` en prod.
- [ ] Dev y `start` usan `tsx`; decidir estrategia para Render (`tsx` en prod o
      compilar; `@lone-wolf/shared` exporta `.ts`).
- [ ] Endurecer la API: `helmet`, quizá rate-limit; validación de variables de entorno.

### Limpiezas de código
- [x] **CSS muerto:** `.combat-box` y `.combat-title` eliminados de
      [index.css](apps/web/src/index.css) (el combate lo pinta `CombatPanel`).
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
