# TODO / Backlog — Lobo Solitario

> Última actualización: 2026-06-17. Roadmap + deuda técnica + huecos de fidelidad detectados
> en una revisión de toda la app. Pasos 1-12 completados.

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
      exacta, curación (Healing) por sección, victoria (sect350), muerte fuera de
      combate, reglas curadas por sección (condiciones, CS modifiers, Mindblast,
      elusión, daño narrativo, comidas, tiradas, botín), ilustraciones Project Aon.
- [x] **12. Tiradas animadas** — dados en la creación del personaje con revelación
      progresiva y animación.
- [~] **13. Refactors / deuda técnica** — 13.1 completado (helmet, contratos,
      UI fixes, CORS, claves estables). 13.2 pendiente: tests backend, lint, build prod.
      13.3: log temporal del análisis exhaustivo del 2026-06-17 (4 bugs, 4 huecos de
      fidelidad, 3 refactors) pendiente de triar.
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

## Paso 12 — Tiradas animadas ✓

### Hecho en este paso

- [x] **Dado animado** (`DiceRoll.tsx`) — **rediseñado**: el cubo 3D de 6 caras
      (`preserve-3d` + resorte con overshoot) daba artefactos de arista, número que
      parpadeaba en una cara girada hacia atrás e inclinación residual permanente.
      Se sustituye por un dado de una sola cara que gira (rotación Z multivuelta +
      inclinación 3D acotada a ±35° para no quedar nunca de canto) con dígitos
      parpadeando, y aterriza con un pop + flash dorado (`@keyframes die-tumble` /
      `die-land`). Robusto, sin huecos ni `die-visor`. Respeta `prefers-reduced-motion`.
      Tamaños `sm` (62 px) y `lg` (90 px). API igual: `roll(value, onDone)` y `reset()`.
- [x] **Revelación progresiva en la creación** — Destreza → Resistencia → Oro → Almacén.
      Cada botón "Tirar" se desbloquea solo cuando termina la animación anterior.
      La tarjeta pasa a borde dorado al resolverse. "Comenzar la aventura" requiere
      los 4 dados resueltos + 5 disciplinas seleccionadas.
- [x] **RollPanel animado** — la Tabla de la Suerte usa un dado `lg` centrado;
      el botón "Tirar" dispara la animación y solo muestra el resultado al terminar.

### Pulido adicional (sesión 2026-06-17)

- [x] **Bloqueo del botón "Tirar" durante la animación** — `CharacterCreation` añade
      estado `rolling` que deshabilita el botón activo mientras el dado anima, evitando
      tiradas dobles accidentales.
- [x] **Label "Destreza"** — acortado de "Destreza en el Combate" para que no salte
      a dos líneas en la tarjeta de creación.
- [x] **Fin de partida simplificado** — eliminado el botón "Volver al inicio" de las
      tres pantallas de fin (victoria sect350, muerte fuera de combate, muerte en
      combate). Ambas acciones eran equivalentes; queda solo "Nueva partida".
- [x] **"Nueva partida" en secciones del libro sin choices** — secciones de muerte
      propias del gamebook (p.ej. sect292) tienen `choices: []` y dejaban al jugador
      sin salida. Ahora `Adventure` detecta cuando no hay choices, tabla de tirada ni
      combate activo, y muestra el botón "Nueva partida".

---

## Paso 13 — Refactors / deuda técnica

> Nota: la "navegación por id" se adelanta al paso 11 porque es prerequisito de
> la fidelidad. El resto de deuda técnica se liquida aquí antes del despliegue.

### 13.1 — Tareas realizadas ✓

- [x] **`isProduction`** en [env.ts](apps/api/src/config/env.ts) activado: lanza error
      explícito si falta `MONGODB_URI` en producción.
- [x] **`helmet`** añadido como primer middleware en `server.ts` (cabeceras HTTP seguras).
- [x] **Contrato Section↔SectionDTO** — aserción de tipo `_MapperContract` en
      `section.mapper.ts`; `tsc` falla si los tipos divergen sin actualizar el mapper.
- [x] **Ficha del personaje** — Comidas al pie de Mochila, Oro como stat-row independiente.
- [x] **Claves estables en `SectionView`** — `key={choice.target}` en choices,
      `key={block.src}` en ilustraciones; elimina warnings de React.
- [x] **CSS muerto** — `.combat-box` y `.combat-title` eliminados de `index.css`.
- [x] **CORS en desarrollo** — la API acepta cualquier `localhost:*` en `development`;
      en producción usa `CORS_ORIGIN` estrictamente.
- [x] **Dominio del front cubierto** — 80 tests (personaje, equipo, combate, GameState,
      reglas por sección, tablas de tirada, adaptador localStorage).
- [x] **Frontmatter** — equipo resuelto en creación; navegación por id resuelta en paso 11.
- [x] **Flujo de fin de partida** — botón redundante eliminado; "Nueva partida" en
      secciones sin choices.
- [x] **Textos preliminares** — `IntroScreen` ("El Principio de la Historia", `tssf`)
      antes de la creación del personaje; `KaiWisdomScreen` ("La Sabiduría del Kai",
      `kaiwisdm`) entre la creación y sect1.

### 13.2 — Tareas pendientes

- [ ] **Tests del backend** — `parse-gamebook-xml.ts`, `section.mapper.ts`, caso de uso
      `GetSection` (back y front con un `ContentPort` falso). (~3-4 h)
- [ ] **Lint y formato** — no hay ESLint/Prettier/Biome; `pnpm lint` (raíz) no hace nada.
      (~1-1.5 h)
- [ ] **Estrategia build para Render** — dev y `start` usan `tsx`; decidir si compilar o
      usar `tsx` en prod; `@lone-wolf/shared` exporta `.ts`. Bloquea el Paso 14. (~1 h)
- [ ] **Endurecer API** — rate-limit y validación explícita de variables de entorno al
      arrancar (helmet ya hecho). (~30 min)
- [ ] **Revisar imágenes del juego** — auditar qué ilustraciones cargan correctamente
      desde Project Aon y cuáles caen al placeholder; corregir rutas o buscar alternativas.
- [ ] **Textos de disciplinas del Kai** — mostrar la descripción completa de cada
      disciplina (secciones `camflage`, `hunting`, `sixthsns`, `tracking`, `healing`,
      `wepnskll`, `mindshld`, `mndblst`, `anmlknsp`, `mindomtr` del XML) durante la
      selección en `CharacterCreation` y/o como referencia en partida.
- [ ] **Textos del equipo** — mostrar las reglas de cómo llevar el equipo (`howcarry`,
      `howmuch`, `howuse`) antes o durante la selección del almacén.
- [ ] **Niveles de entrenamiento Kai** — mostrar la tabla de rangos (`kaiwisdm` o
      sección equivalente) como referencia al jugador.
- [ ] **Reglas de combate** — mostrar las reglas del sistema de combate (tabla de
      resultados, elusión, etc.) como pantalla de referencia accesible durante la partida.
- [ ] **Añadir texto reglas de juego** — mostrar la explicación de la Resistencia y la
      Destreza en el Combate tal como aparece en el XML de Project Aon (sección
      `combat` o equivalente): qué representan, cómo se calculan, cómo interactúan
      con la Tabla de Resultados. Incorporarlo como pantalla de referencia accesible
      durante la partida (p.ej. un modal o pestaña en la ficha del personaje).
- [ ] **Añadir favicon** — incluir un favicon (`.ico` o `.png`) para que la pestaña
      del navegador muestre el icono del juego en vez del genérico de Vite.
      Añadirlo en `apps/web/public/` y referenciarlo en `apps/web/index.html`.
- [ ] **Añadir mapa de Sommerlund** — mostrar el mapa del Libro 1 desde Project Aon
      (https://www.projectaon.org/es/xhtml/ls/01hdlo/map.htm) con dos modos de
      visualización: versión normal (miniatura integrada en la UI) y versión ampliada
      (modal o página completa para explorar el detalle). Hotlink igual que las
      ilustraciones (sin redistribuir, cumple la licencia).

---

## 13.3 — Análisis exhaustivo (TEMPORAL · 2026-06-17)

> Log escrito al cerrar la sesión del 2026-06-17 tras una revisión completa de la app
> (dominio web, UI, backend, parser) cruzada con las reglas oficiales del Libro 1 de
> Project Aon. Es una lista de trabajo para próximas sesiones; **ninguno está corregido
> todavía**. Marcado "(temporal)" porque, una vez triados y movidos a sus pasos
> definitivos (13.2 / 14 / nice-to-have), esta sección puede borrarse.
>
> Orden sugerido de ataque: primero los BUGS de fidelidad (B1–B4), luego refactors
> de bajo riesgo (R1–R3), luego huecos de reglas (F1–F4).

### Bugs detectados

- [ ] **B1 · Weaponskill +2 no se aplica a armas de botín.**
      `hasWeaponskillBonus` ([CombatPanel.tsx](apps/web/src/ui/components/CombatPanel.tsx:32))
      compara `w.id === character.weaponskillWeapon`, donde `weaponskillWeapon` es un
      `WeaponType` (`"dagger"`, `"spear"`, `"shortSword"`…). Pero los ids de las armas de
      botín en [section-rules.ts](apps/web/src/domain/game/section-rules.ts) son
      `"loot-dagger"`, `"loot-spear"`, `"short-sword"` → **no coinciden**. Un jugador con
      Dominio de las Armas (Daga) que recoge la daga de sect291 no recibe el +2.
      Las armas iniciales (Hacha `"axe"`, y las del almacén `"sword"`/`"mace"`/`"spear"`)
      sí coinciden por casualidad. Arreglo: que la igualdad se base en un campo
      `weaponType` del `InventoryItem`, no en el `id` de instancia.

- [ ] **B2 · Los efectos de entrada NO son idempotentes (contradicen su comentario).**
      `applyEntryEffect` (daño narrativo + comidas obligatorias) se aplica en `navigateTo`
      ([App.tsx](apps/web/src/ui/App.tsx:303)) **cada vez** que se entra a la sección.
      Solo el oro de botín está protegido por flag (`gold:<id>`). El comentario de
      `SECTION_ENTRY_EFFECTS` dice "se aplican UNA vez al entrar", pero el código no lo
      garantiza: en cualquier bucle del libro (volver a una sección) el daño/comida se
      vuelve a aplicar. Arreglo: guardar un flag `entry:<id>` igual que con el oro.

- [ ] **B3 · El combate en curso no se persiste en el GameState.**
      `CombatState` (Resistencia del enemigo, asaltos) vive solo en el estado local de
      [CombatPanel.tsx](apps/web/src/ui/components/CombatPanel.tsx:74). El autoguardado
      solo persiste la Resistencia del jugador vía `onEnduranceChange`. Si el jugador
      recarga la página a mitad de combate, el enemigo revive a Resistencia plena mientras
      el jugador conserva la suya mermada → estado inconsistente y explotable. Arreglo:
      o bien serializar el combate en `GameState`, o impedir la recarga limpia (avisar).

- [ ] **B4 · Sesgo de probabilidad y lógica duplicada en el objeto del almacén.**
      `rollStoreroomChoiceId` ([equipment.ts](apps/web/src/domain/character/equipment.ts:72))
      y `rollStore()` ([CharacterCreation.tsx](apps/web/src/ui/components/CharacterCreation.tsx:97))
      hacen `(raw % 9) + 1` sobre una tirada 0-9. `raw=0` y `raw=9` dan ambos id 1 (Espada):
      la Espada sale con **doble probabilidad** y el resto del reparto queda sesgado.
      Además la regla está **duplicada** (dominio + UI) y pueden divergir. Arreglo: mapear
      0-8 → 1-9 descartando/re-tirando el 9, o usar una tabla explícita; y que la UI use
      la función del dominio en vez de reimplementarla con `Math.random()`.

### Huecos de fidelidad vs reglas oficiales (Libro 1)

- [ ] **F1 · Regla "sin arma en combate: −4 a la Destreza".** Si Lobo Solitario pelea
      desarmado (perdió el equipo con el Kraan en sect188, o soltó todas sus armas con los
      botones ✕ de la ficha) las reglas oficiales restan 4 a la Destreza en el Combate.
      No está implementado: `startCombat` no penaliza por `weapons.length === 0`.

- [ ] **F2 · "Objeto del almacén por tirada" es ya una desviación.** En las reglas
      oficiales el jugador **elige** el objeto del almacén; aquí se decide por tirada
      (documentado como decisión de diseño en el README). Revisar si se quiere ofrecer
      elección manual como alternativa fiel.

- [ ] **F3 · Poción Curativa (Laumspur) usable en cualquier momento.** La regla la
      restringe a beberse **después del combate** (+4 Resistencia). La ficha permite usarla
      siempre que `enduranceCurrent < max`. Desviación menor; decidir si se acota.

- [ ] **F4 · Curación silenciosa.** El +1 de Resistencia por pasar por secciones sin
      combate (`navigateTo`, [App.tsx](apps/web/src/ui/App.tsx:293)) no genera mensaje en
      `entryMessages`, a diferencia del resto de efectos. El jugador no ve por qué sube su
      Resistencia. Añadir aviso. (Verificar también que la condición correcta es "la
      sección que se ENTRA no tiene combate", no la que se deja.)

### Refactors / deuda técnica

- [ ] **R1 · La UI de creación no usa las funciones de dominio.** `CharacterCreation`
      reimplementa las tiradas con `Math.floor(Math.random()*10)` en vez de usar
      `rollCombatSkill` / `rollEndurance` / `rollStartingGold` / `rollWeaponskillWeapon` /
      `rollStoreroomChoiceId` (que son testables vía `RandomNumber`). Centralizar para que
      el comportamiento probado sea el mismo que el de producción (ligado a B4).

- [ ] **R2 · Sin red de seguridad ante inventario lleno al coger botín.**
      `handleTakeLoot` ([App.tsx](apps/web/src/ui/App.tsx:343)) llama a `addWeapon` /
      `addToBackpack`, que **lanzan** si no hay sitio. Hoy `LootPanel` deshabilita el botón
      cuando está lleno, así que no peta en la práctica, pero es frágil: cualquier desfase
      entre `canTake` y los límites reales sería un crash sin Error Boundary (ver
      nice-to-have). Envolver en try/catch o reusar la validación.

- [ ] **R3 · El parser aplana `ul`/`dl`/`signpost` a párrafo.**
      `parseData` ([parse-gamebook-xml.ts](apps/api/src/infrastructure/import/parse-gamebook-xml.ts:176))
      colapsa listas y tablas a texto plano. Para las secciones de referencia que quiere
      mostrar 13.2 (equipo `howcarry`, disciplinas, rangos `kaiwisdm`) esto degrada el
      contenido (se pierden viñetas/estructura). Si esos textos se incorporan, conviene
      modelar listas en `ContentBlock`.

### Notas verificadas (no son bugs, dejar constancia)

- La Tabla de Resultados de Combate y `combatRatioColumn` se revisaron celda a celda
  contra la tabla canónica: correctas (incluida la fila "sacas 0" sin daño al jugador y
  las "K").
- El equipo fijo (Hacha + 1 Comida + Mapa) y los bonus de Resistencia del almacén
  (Casco +2, Cota de Malla +4) son fieles al Libro 1.
- Las condiciones de elección, inmunidades al Mindblast, modificadores CS (Vordak/Kraan)
  y elusiones cruzan bien con el texto; no se detectaron secciones mal mapeadas en esta pasada.

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
