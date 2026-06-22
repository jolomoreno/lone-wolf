# TODO / Backlog — Lobo Solitario

> Última actualización: 2026-06-19. Pasos 1-14 completados.
> Proyecto desplegado y verificado E2E en producción. Plan de despliegue en
> [DEPLOY_PLAN.md](DEPLOY_PLAN.md); evidencias del smoke test en [SMOKE_TEST.md](SMOKE_TEST.md).

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
- [x] **13. Refactors / deuda técnica** — 13.1 a 13.2-D completados: bugs gameplay,
      fidelidad de reglas, contenido/UX (favicon, modales, mapa), deuda técnica (R1-R3).
- [x] **14. Despliegue + CI/CD** — Vercel ✅ + GitHub Actions ✅ operativos (2026-06-19); smoke test E2E ✅ superado en producción. Ver [DEPLOY_PLAN.md](DEPLOY_PLAN.md) y [SMOKE_TEST.md](SMOKE_TEST.md).

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
- [~] **`tssf.png`** — 404 en todas las rutas de Project Aon. Sin impacto: `IntroScreen`
      muestra solo texto, no carga imágenes desde la API. No hay acción pendiente.

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

### 13.2 — Plan de acción unificado

> Fusión del backlog de 13.2 y el análisis exhaustivo del 2026-06-17 (bugs B1-B4,
> huecos de fidelidad F1-F4, refactors R1-R3). La infraestructura de despliegue
> (lint, build, endurecer API) se mueve al **Paso 14** como prerequisito.
>
> Grupos A–D son mayormente independientes entre sí; el orden refleja prioridad,
> no prerequisito estricto. Excepción: **R1 (grupo D) es prerequisito de B4 (grupo A)**.
> Las dependencias entre tareas se indican con **↳**.

#### A · Bugs de gameplay — corregir primero ✓

- [x] **B2 · Efectos de entrada idempotentes** — `applyEntryEffect` (daño narrativo
      + comidas en `SECTION_ENTRY_EFFECTS`) ahora se guarda con flag `entry:<sectionId>`
      en el `GameState`, igual que el oro. Re-entrar a la sección no vuelve a aplicar
      el daño ni consume otra comida.
      Ficheros: [App.tsx](apps/web/src/ui/App.tsx)

- [x] **B1 · Weaponskill +2 visible en la ficha y aplicado en combate** —
      `hasWeaponskillBonus` movida al dominio (`character.ts`) para ser reutilizable.
      La ficha muestra la DC efectiva ("15 (+2 Dominio)") cuando el arma de dominio
      está en el inventario; si se suelta, el indicador desaparece. `CombatPanel`
      ya no lo define localmente, importa del dominio.
- [x] **B1 · Weaponskill +2 aplicado también a armas de botín y al arma inicial de dominio** —
      `InventoryItem` tiene campo opcional `weaponType?: WeaponType`. `hasWeaponskillBonus`
      compara `(w.weaponType ?? w.id)` con `weaponskillWeapon`. Las armas de botín
      (`"loot-dagger"`, `"loot-spear"`, `"short-sword"`) llevan su `weaponType`.
      `createStartingCharacter` añade el arma de dominio al inventario si hay hueco
      y no está ya. Si el almacén dio un arma diferente (huecos llenos), `CharacterCreation`
      detecta el conflicto y muestra al jugador un selector "¿con cuál te quedas?"
      antes de poder comenzar la aventura. La resolución se pasa mediante
      `weaponConflictResolution: "weaponskill" | "storeroom"`.
      Ficheros: [character.ts](apps/web/src/domain/character/character.ts) · [equipment.ts](apps/web/src/domain/character/equipment.ts) · [CharacterCreation.tsx](apps/web/src/ui/components/CharacterCreation.tsx) · [CombatPanel.tsx](apps/web/src/ui/components/CombatPanel.tsx) · [section-rules.ts](apps/web/src/domain/game/section-rules.ts)

- [x] **B4 · Tabla explícita del almacén, lógica centralizada** — `STOREROOM_ROLL_TABLE`
      en `equipment.ts` mapea 0-8 → ids 1-9 y 9 → id 9 (sin sesgo). `CharacterCreation`
      ya no reimplementa `(raw % 9) + 1` sino que llama a `rollStoreroomChoiceId(() => raw)`.
      Ficheros: [equipment.ts](apps/web/src/domain/character/equipment.ts) · [CharacterCreation.tsx](apps/web/src/ui/components/CharacterCreation.tsx)

- [x] **F4 · Curación visible** — el +1 de Resistencia de la disciplina Curación
      aparece ahora como mensaje en `entryMessages` ("La disciplina de Curación restaura
      1 de Resistencia."), igual que el resto de efectos de entrada.
      Fichero: [App.tsx](apps/web/src/ui/App.tsx)

#### B · Fidelidad de reglas ✓

- [x] **F1 · Penalización −4 a Destreza sin arma**
      `unarmed?: boolean` en `CombatModifiers`; `combatRatio` resta 4 cuando es true.
      `CombatPanel` calcula `unarmed: character.weapons.length === 0` en la inicialización
      de `modifiers` y lo pasa a `startCombat`. Se muestra "Sin arma (−4)" en la barra
      de ratio.
      Ficheros: [combat.ts](apps/web/src/domain/combat/combat.ts) · [CombatPanel.tsx](apps/web/src/ui/components/CombatPanel.tsx)

- [x] **F3 · Poción Curativa: restringir a después del combate**
      Prop `combatActive?: boolean` en `CharacterSheet`; el botón "Usar" se deshabilita
      con tooltip "Solo puedes usar la poción después del combate". `Adventure` pasa
      `combatActive={!!enemy && combatOutcome === null}`.
      Ficheros: [CharacterSheet.tsx](apps/web/src/ui/components/CharacterSheet.tsx) · [App.tsx](apps/web/src/ui/App.tsx)

- [x] **B3 · Combate en curso se persiste en el GameState** (Opción A)
      `pendingCombat?: CombatState | null` en `GameState` (v3, bump de
      `SAVE_FORMAT_VERSION`). `CombatPanel` reemplaza `onEnduranceChange` por
      `onStateChange(CombatState)` para actualizar Resistencia + estado del combate
      en un único `onChange` atómico (evita el problema de snapshot obsoleto de `game`).
      Prop `initialState?: CombatState` restaura un combate en curso al recargar.
      Flag `combat-won:<sectionId>` en `GameState.flags` restaura el estado "ganado"
      si el jugador recarga antes de navegar tras vencer. `navigateTo` limpia
      `pendingCombat` al cambiar de sección.
      Ficheros: [game-state.ts](apps/web/src/domain/game/game-state.ts) · [CombatPanel.tsx](apps/web/src/ui/components/CombatPanel.tsx) · [App.tsx](apps/web/src/ui/App.tsx)

- [ ] **F2 · Almacén por tirada vs. elección libre** (decisión de diseño, ~1-2 h si se cambia)
      En las reglas el jugador elige; aquí es por tirada (documentado en README y decisión
      de diseño consciente). Bajo impacto mientras sea la única forma conocida por el
      jugador. Revisar solo si se quiere mayor fidelidad.

#### C · Contenido y UX

- [x] **Favicon** (~15 min)
      SVG de cabeza de lobo estilizada (dorado `#c9a84c` sobre fondo oscuro `#1e1b2e`) en
      `apps/web/public/favicon.svg`. Referenciado con `<link rel="icon" type="image/svg+xml">`
      en `apps/web/index.html`. Directorio `public/` creado.

- [x] **Revisar imágenes de Project Aon** (~30-45 min)
      Auditoría completa (2026-06-18): todas las ilustraciones estándar (ill1-ill20,
      small1-small34) y las imágenes de equipo cargan correctamente (HTTP 200) desde
      `https://www.projectaon.org/data/trunk/en/png/lw/01fftd/ill/chalk/`.
      Hallazgo adicional: existen 36 imágenes `{número}.png` (p.ej. `267.png`, `350.png`…)
      específicas de la edición Álvarez que NO están en Project Aon. Se producían en secciones
      con doble ilustración (Álvarez + Chalk) y mostraban el placeholder `🖼️`.
      **Corrección**: `Illustration` en `SectionView.tsx` devuelve `null` cuando la imagen
      falla — se omite silenciosamente en vez de mostrar el placeholder roto. La ilustración
      de Chalk de la misma sección sigue cargando correctamente.
      `tssf.png` → 404 en todas las rutas (sin impacto: `IntroScreen` no carga desde la API).
      Hallazgo: `map.png` (1024×793 px, 1.2 MB) disponible en chalk para el mapa de Sommerlund.

- [x] **Reglas de combate como referencia** (~1 h)
      `CombatRulesModal.tsx`: modal accesible con botón "Reglas de combate" al pie de
      `CharacterSheet`. Muestra: explicación del Ratio de Combate, tabla de pérdidas del
      enemigo (10×13) y tabla de pérdidas de Lobo Solitario, ambas scrollables con encabezados
      de ratio (≤−11…≥+11). Celdas "M" en rojo. Secciones de reglas especiales (bonos/penas
      a Destreza, eludir, Defensa Psíquica). Cierra con ✕ o clic en el overlay.
      Datos de tabla importados de `combat-results-table.ts` (sin duplicación).
      Ficheros: [CombatRulesModal.tsx](apps/web/src/ui/components/CombatRulesModal.tsx) ·
      [CharacterSheet.tsx](apps/web/src/ui/components/CharacterSheet.tsx) ·
      [index.css](apps/web/src/index.css)

- [x] **Reglas de Resistencia y Destreza** (~45 min)
      Incluidas como sección "Ratio de Combate" dentro del mismo modal de reglas de combate:
      qué representan DC y PR, cómo se calcula el ratio, cómo se usa la tabla. No se
      añade pantalla separada — la información es inseparable del sistema de combate y
      el modal unificado es más usable.

- [x] **Textos de disciplinas del Kai** (~1-1.5 h)
      Textos extraídos del XML (secciones `camflage`…`mindomtr`) y guardados en
      `kai-discipline-descriptions.ts` (dominio puro, sin duplicación).
      En **CharacterCreation**: al pulsar una disciplina aparece su descripción en un
      panel destacado (borde izquierdo dorado) bajo la rejilla. El botón seleccionado
      recibe outline para señalar el foco.
      En **partida**: botón "Disciplinas del Kai" en la ficha abre un modal que lista
      las 10 disciplinas; las que posee el jugador llevan badge dorado "TU DISCIPLINA"
      y borde resaltado. Dominio de las Armas muestra el arma dominada entre paréntesis.
      Ficheros: [kai-discipline-descriptions.ts](apps/web/src/domain/character/kai-discipline-descriptions.ts) ·
      [KaiDisciplinesModal.tsx](apps/web/src/ui/components/KaiDisciplinesModal.tsx) ·
      [CharacterCreation.tsx](apps/web/src/ui/components/CharacterCreation.tsx) ·
      [CharacterSheet.tsx](apps/web/src/ui/components/CharacterSheet.tsx) ·
      [index.css](apps/web/src/index.css)

- [x] **Textos del equipo** (~45 min)
      Botón "¿Cómo funciona el equipo?" bajo las tarjetas de stats en `CharacterCreation`.
      Abre `EquipmentRulesModal` con tres secciones del libro (howcarry, howmuch, howuse)
      extraídas del XML y formateadas como JSX. Reutiliza los estilos `.modal*`, `.rules-list`,
      `.rules-section` y añade `.equip-term` para los términos tipo `<dl>`.
      Ficheros: [EquipmentRulesModal.tsx](apps/web/src/ui/components/EquipmentRulesModal.tsx) ·
      [CharacterCreation.tsx](apps/web/src/ui/components/CharacterCreation.tsx) ·
      [index.css](apps/web/src/index.css)

- [x] **Niveles de entrenamiento Kai** (~30 min)
      Botón "Niveles de Entrenamiento Kai" en la ficha del personaje (junto a Disciplinas y
      Reglas de combate). Abre `KaiLevelsModal`: lista de 10 rangos (Postulante → Maestro)
      con el rango 5 (Iniciado, el del Libro 1) resaltado con badge "TU RANGO" y borde dorado.
      Texto introductorio y párrafo sobre el Magnakai extraídos del XML (sección `levels`).
      Ficheros: [KaiLevelsModal.tsx](apps/web/src/ui/components/KaiLevelsModal.tsx) ·
      [CharacterSheet.tsx](apps/web/src/ui/components/CharacterSheet.tsx) ·
      [index.css](apps/web/src/index.css)

- [x] **Mapa de Sommerlund** (~45 min)
      Botón "ver mapa" junto al objeto especial "Mapa de Sommerlund" en la ficha del
      personaje. Abre `MapModal` con el mapa completo (1024×793 px) hotlinkeado desde
      Project Aon (`map.png` en el directorio chalk de la edición inglesa), scrollable
      y a tamaño completo. Sin redistribuir el fichero — cumple la licencia.
      Ficheros: [MapModal.tsx](apps/web/src/ui/components/MapModal.tsx) ·
      [CharacterSheet.tsx](apps/web/src/ui/components/CharacterSheet.tsx) ·
      [index.css](apps/web/src/index.css)

#### D · Deuda técnica / refactors

- [x] **R1 · CharacterCreation debe usar las funciones de dominio** (~45 min)
      `Math.floor(Math.random()*10)` sustituido por `defaultRandomNumber()` en las
      4 funciones `rollCs/rollEnd/rollGold/rollStore`. Los stats se calculan con
      `rollCombatSkill(() => raw)` / `rollEndurance(() => raw)` / `rollStartingGold(() => raw)`
      en vez de inline (`10+raw`, `20+raw`). La animación del dado sigue recibiendo
      el mismo `raw`; el comportamiento probado en tests es ahora idéntico al de producción.
      Fichero: [CharacterCreation.tsx](apps/web/src/ui/components/CharacterCreation.tsx)

- [x] **R2 · try/catch en `handleTakeLoot`** (~15 min)
      `handleTakeLoot` envuelto en try/catch con `console.error`. `LootPanel` ya
      deshabilita el botón cuando no hay sitio, pero si `canTake` y los límites
      reales divergen en el futuro el jugador no ve un crash — el objeto simplemente
      no se coge y el error queda en la consola.
      Fichero: [App.tsx](apps/web/src/ui/App.tsx)

- [x] **R3 · Parser: modelar listas y tablas como `ContentBlock`** (~2-3 h, diferible)
      Nuevo tipo `{ type: "list"; items: string[] }` en domain (`section.ts`), DTO
      (`section.dto.ts`), mapper (`section.mapper.ts`) y renderer (`SectionView.tsx`).
      `parseData` tiene ahora cases explícitos `"ul"` y `"dl"`: `ul`/`li` → lista de
      strings; `dl`/`dt`/`dd` → `"término: definición"` por par. `signpost` no requirió
      tipo propio (solo aparece dentro de `<illustration><instance class="text">`, nunca
      como hijo directo de `<data>`). BD reimportada (388 secciones). TypeScript limpio,
      88 tests en verde.
      Ficheros: [parse-gamebook-xml.ts](apps/api/src/infrastructure/import/parse-gamebook-xml.ts) ·
      [section.ts](apps/api/src/domain/section/section.ts) ·
      [section.dto.ts](packages/shared/src/section.dto.ts) ·
      [section.mapper.ts](apps/api/src/infrastructure/http/section.mapper.ts) ·
      [SectionView.tsx](apps/web/src/ui/components/SectionView.tsx)

- [ ] **Tests del backend** (~3-4 h)
      Tests de `parse-gamebook-xml.ts`, `section.mapper.ts` y caso de uso `GetSection`
      (back y front con un `ContentPort` falso). Sin urgencia de gameplay; aporta
      confianza antes del despliegue.

#### Notas verificadas (no son bugs)

- Tabla de Resultados de Combate revisada celda a celda contra la canónica: correcta
  (incluida la fila "sacas 0" sin daño al jugador y las "K").
- Equipo fijo (Hacha + 1 Comida + Mapa) y bonus del almacén (Casco +2, Cota +4): fieles.
- Condiciones de elección, inmunidades Mindblast, modificadores CS (Vordak/Kraan) y
  elusiones: correctos; no se detectaron secciones mal mapeadas en la revisión del 2026-06-17.

---

## Paso 14 — Despliegue + CI/CD

> Plan completo con código, comandos y orden de ejecución en **[DEPLOY_PLAN.md](DEPLOY_PLAN.md)**.
> Aquí solo el resumen de tareas pendientes como checklist rápido.

### Decisiones tomadas

- **Plataforma**: Vercel (único proveedor — web estático + API serverless en el mismo origen)
- **Linter**: Biome (`biome ci` en CI, `biome check --write` en local)
- **CI/CD**: GitHub Actions como gate real (`needs: ci` bloquea el deploy si falla)
- **Sin CORS** en producción (mismo origen); **sin `VITE_API_URL`** en Vercel (fallback `""`)

### Fase 0 — Prerrequisitos

- [x] **P1 · Validación env vars** — añadir guard en `apps/api/src/config/env.ts`:
      lanza error si `MONGODB_URI` está vacía en producción (~15 min)
- [x] **P2 · Biome** — `@biomejs/biome` v2.5.0 instalado, `biome.json` en raíz,
      script `"lint": "biome ci ."` en `package.json` raíz. `pnpm lint` verde.

### Fase 1 — Cambios serverless

- [x] **S1** · Nuevo `api/handler.ts` — glue Vercel ↔ Express, cachea `app` y conexión (~15 min)
- [x] **S2** · Nuevo `vercel.json` — build web + rewrites `/sections/*` y `/health` (~10 min)
- [x] **S3** · `mongoose.ts` — añadir guard `readyState >= 1` al inicio de `connectToDatabase` (~5 min)
- [x] **S4** · `apps/web/src/config/composition-root.ts` — fallback `apiUrl`: `"http://localhost:4000"` → `""` (~5 min)
- [x] **S5** · `pnpm add -Dw @vercel/node` (~5 min) — instalado junto con S1

### Fase 2 — MongoDB Atlas

- [x] **M1** · Network Access → añadir `0.0.0.0/0` (IPs dinámicas de Vercel) (~5 min)

### Fase 3 — Primer deploy Vercel

- [x] **V1** · `vercel link` — vincular repo local con proyecto de Vercel; añadir `.vercel/` a `.gitignore` (~5 min)
- [x] **V2** · Env vars en Vercel dashboard: `MONGODB_URI` + `NODE_ENV=production` (~5 min)
- [x] **V3** · `vercel --prod` — deploy OK. `/health` y `/sections/sect1` responden. App jugable verificada en https://lone-wolf-five.vercel.app
- [x] **Fix victoria (post-V3)** · `App.tsx` — eliminado el early return de sect350 que mostraba una pantalla genérica en vez del texto real del capítulo. Ahora se renderiza el contenido de la sección (discurso del Rey) y el panel de victoria aparece al pie. Desplegado en prod.

### Fase 4 — GitHub Actions

- [x] **CI1** · Crear `.github/workflows/ci.yml` — jobs `ci` (typecheck+lint+test) y `deploy` (needs: ci) (~30 min)
- [x] **CI2** · Secrets en GitHub: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (~5 min)
- [x] **CI3** · Desactivar auto-deploy en Vercel dashboard (el deploy lo controla el YAML) (~2 min)

### Fase 5 — Smoke test ✓

- [x] **T1** · Test E2E en producción (2026-06-19, navegador real): personaje → combate
      (victoria sobre Kraan) → guardar mid-combate → recargar (persistencia íntegra de
      `pendingCombat`) → victoria. Las 5 navegaciones golpearon la API serverless
      (`GET /sections/sect*` → `200`), confirmando que prod ya no se enmascara con `localStorage`.
      De paso quedó verificada en producción la atribución de **Project Aon License** (pie +
      enlace a projectaon.org). Evidencias en [SMOKE_TEST.md](SMOKE_TEST.md).

---

## Calidad / nice-to-have (sin paso asignado)

> Fusión de los antiguos bloques "Nice-to-have (sin fase asignada)" y "Calidad / nice-to-have".

- [ ] **Tests del backend** — `parse-gamebook-xml.ts`, `section.mapper.ts` y caso de uso
      `GetSection` (es el mismo pendiente que figura en el grupo D del Paso 13).
- [ ] **Responsive / móvil y accesibilidad básica** — lector y panel de combate.
- [x] **Error Boundary en React** — `ErrorBoundary.tsx` (componente de clase) envuelve toda la
      app en `main.tsx`. Si un componente lanza un error en runtime, muestra una pantalla de
      "Algo salió mal" con botón "Recargar" en lugar de la pantalla en blanco de React.
      Fichero: [ErrorBoundary.tsx](apps/web/src/ui/components/ErrorBoundary.tsx)
- [x] **Limpiar la cabecera CORS de desarrollo en producción** — el middleware `cors` ya no se
      registra en producción (`isProduction`). Web y API comparten origen en Vercel → CORS no
      aplica y no se emite ninguna cabecera `access-control-*`. En dev sigue aceptando cualquier
      `localhost:*`. Detectado en el smoke test ([SMOKE_TEST.md](SMOKE_TEST.md)).
      Fichero: [server.ts](apps/api/src/infrastructure/http/server.ts)
