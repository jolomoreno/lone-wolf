/**
 * Caso de uso: comprobar la salud de la API.
 *
 * Recibe el puerto por inyección (en el constructor) y lo usa sin saber si por
 * detrás hay fetch, axios o un mock de test. Hoy es muy fino, pero establece el
 * patrón que seguirán los casos de uso reales (empezar partida, resolver combate...).
 */

import type { ApiHealth, HealthPort } from "../ports/health.port";

export class CheckApiHealth {
  constructor(private readonly health: HealthPort) {}

  execute(): Promise<ApiHealth> {
    return this.health.check();
  }
}
