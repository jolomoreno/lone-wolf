# Smoke Test E2E — Fase 5

Validación de extremo a extremo de **Lobo Solitario** en producción, ejecutada con navegador
real sobre `https://lone-wolf-five.vercel.app`.

- **Fecha:** 2026-06-19
- **Entorno:** Producción (Vercel + MongoDB Atlas `lonewolf-prod`)
- **Commit de referencia:** `afe1392` (API operativa desde `56f81c3`)
- **Método:** navegador automatizado (extensión Claude for Chrome), inspección de red y de
  `localStorage` en cada paso.

> **Objetivo real de esta fase.** No es solo "jugar y ver que va". Hasta el commit `56f81c3` la
> API en producción estaba muerta y el `localStorage` lo enmascaraba (la SPA cargaba el personaje
> desde caché aunque `/sections/*` devolviera 404 del edge). Por eso el criterio de éxito es
> **demostrar que prod golpea la API real (MongoDB) en cada navegación**, no que la app recite lo
> que tiene en caché local.

---

## Resultado

✅ **SUPERADO.** Recorrido completo personaje → combate → guardar → recargar → victoria, con la
API serverless respondiendo `200 application/json` en todas las navegaciones y la persistencia
mid-combate sobreviviendo a la recarga.

---

## Chequeo previo de la API (sin navegador)

| Endpoint | Resultado |
|---|---|
| `GET /health` | `200`, `content-type: application/json` |
| `GET /sections/sect1` | `200`, JSON real (`content-length: 1214`), texto + 3 choices |
| Cabecera `x-vercel-id` presente, sin `x-vercel-error` | Función serverless **viva** |
| Libro importado en `lonewolf-prod` | Sí — `sect1` devuelve contenido completo |

---

## Recorrido E2E

### 1. Arranque limpio

- `localStorage` vaciado (había una partida previa con clave `lone-wolf:save`) y recarga forzada.
- La app renderiza la introducción ("El Principio de la Historia") desde cero.

### 2. Creación de personaje

Tiradas obtenidas:

| Atributo | Dado | Resultado |
|---|---|---|
| Destreza (Combat Skill) | 2 | **12** |
| Resistencia (Endurance) | 7 | **27** |
| Oro inicial | 0 | **0** |
| Almacén | 4 | **Maza** (arma) |

- Disciplinas elegidas (5/5): Camuflaje, Caza, Sexto Sentido, **Curación**, **Dominio de las
  Armas** (weaponskill asignó **Daga** aleatoriamente).
- **Conflicto de armas** (fidelidad): con Hacha (fija) + Maza (almacén) + Daga (weaponskill) y solo
  dos huecos, la app pidió elegir cuál conservar junto al Hacha. Se eligió la **Daga** (otorga
  +2 CS por Dominio de las Armas).
- Hoja resultante: **Destreza 14 (12 +2 Dominio)**, Resistencia 27/27, Armas: Hacha + Daga,
  Mochila: 1 Comida, 0 Oro, Mapa de Sommerlund.

### 3. Navegación con API real

Cada cambio de sección dispara una petición al backend (no `localStorage`):

| Navegación | Petición | Estado |
|---|---|---|
| Comenzar → sección 1 | `GET /sections/sect1` | **200** |
| sect1 → derecha (85) | `GET /sections/sect85` | **200** |
| sect85 → luchar (229) | `GET /sections/sect229` | **200** |
| post-combate → 125 | `GET /sections/sect125` | **200** |
| 125 → oeste (214) | `GET /sections/sect214` | **200** |

### 4. Combate (sección 229 — Kraan)

- UI de combate renderizada: **Lobo Solitario 27 vs Kraan 25**.
- Línea de cálculo visible: `Ratio de combate: -3 · Dominio de las Armas (+2) · Ataque mental
  (-1 DC)` → se aplican las reglas de fidelidad (weaponskill + penalización por el polvo del kraan).
- Ilustración del kraan servida por **hotlink desde projectaon.org** (fidelidad de imágenes OK).
- Dado animado y tabla de combate canónica funcionando. Registro de asaltos:

  ```
  Asalto 1: sacas 6 → Kraan −6, tú −3
  Asalto 2: sacas 5 → Kraan −5, tú −4
  Asalto 3: sacas 4 → Kraan −4, tú −4
  Asalto 4: sacas 3 → Kraan −3, tú −5
  Asalto 5: sacas 5 → Kraan −5, tú −4
  Asalto 6: sacas 4 → Kraan −4, tú −4
  ```

- Desenlace: **¡Has vencido a Kraan!** (Kraan 0, Lobo 3/27). Aparecen las opciones post-combate
  (267 registrar cadáver / 125 continuar).

### 5. Guardado manual mid-combate

Tras el asalto 1 se pulsó "Guardar partida". Volcado de `localStorage` (`lone-wolf:save`):

```json
{
  "version": 3,
  "currentSection": "sect229",
  "combatSkill": 12,
  "enduranceCurrent": 24,
  "weaponskillWeapon": "dagger",
  "weapons": [
    { "id": "axe", "name": "Hacha" },
    { "id": "dagger", "name": "Daga", "weaponType": "dagger" }
  ],
  "pendingCombat": {
    "enemy": { "name": "Kraan", "combatSkill": 16, "endurance": 25 },
    "enemyEndurance": 19,
    "loneWolfEndurance": 24,
    "ratio": -3,
    "rounds": [
      { "round": 1, "randomNumber": 6, "enemyLoss": 6, "loneWolfLoss": 3 }
    ],
    "status": "ongoing"
  },
  "updatedAt": "2026-06-19T12:43:10.670Z"
}
```

- `version: 3` coincide con `SAVE_FORMAT_VERSION`.
- El **combate en curso** (`pendingCombat`) se serializa íntegro: enemigo, endurances, ratio y
  el historial de asaltos.

### 6. Recarga y persistencia

- Recarga completa de la página.
- Pantalla de inicio: **"Partida guardada · 14:43 — Sección 229 · Resistencia 24/27"** con botones
  "Continuar partida" / "Nueva partida".
- "Continuar partida" → **el combate se restaura intacto**: Lobo 24 vs Kraan 19, ratio −3, asalto 1
  preservado. La persistencia mid-combate funciona.

### 7. Victoria y disciplina Curación

- Combate completado hasta la **victoria** sobre el Kraan.
- **Curación** verificada: tras el combate la Resistencia estaba en 3/27; al pasar a través de
  secciones sin combate restaura +1 (heal-on-pass-through). Observado: en sección 125 = 3, al pasar
  a 214 = **4**. Comportamiento canónico correcto (no se cura en la sección donde se combate).

---

## Cobertura del criterio de la fase

| Criterio (CLAUDE.md) | Estado |
|---|---|
| Crear personaje | ✅ |
| Combate | ✅ (victoria sobre Kraan, 6 asaltos) |
| Guardar | ✅ (manual, mid-combate) |
| Recargar | ✅ (persistencia íntegra, incl. `pendingCombat`) |
| Muerte / victoria | ✅ (victoria) |
| **API real en prod (no caché)** | ✅ (5 navegaciones, todas `200`) |

### Fidelidad ejercitada de paso

- Weaponskill (Dominio de las Armas · Daga → +2 CS).
- Conflicto de armas en creación.
- Penalización por sección (`Ataque mental -1 DC` del polvo del kraan).
- Ilustraciones por hotlink (Project Aon).
- Curación (regeneración al pasar por secciones sin combate).

---

## Observaciones (no bloqueantes)

1. **Cabecera CORS de dev en prod.** Las respuestas de la API incluyen
   `access-control-allow-origin: http://localhost:5173`. En producción no afecta (web y API
   comparten origen, sin CORS), pero es un valor de desarrollo colado en la configuración de prod.
   Conviene limpiarlo / condicionarlo por entorno.

---

## Conclusión

La aplicación es **jugable de extremo a extremo en producción** con la API serverless realmente
operativa. Se cierra el último pendiente del Paso 14 (Fase 5). Único punto de mejora detectado: la
cabecera CORS de desarrollo en producción.
