/**
 * Adaptador de salida: implementa HealthPort llamando a la API real con fetch.
 *
 * Es el ÚNICO sitio que sabe que la salud se consigue con una petición HTTP a
 * `/health`. Si mañana cambiáramos de mecanismo, solo tocaríamos aquí.
 */

import type { ApiHealth, HealthPort } from "../../application/ports/health.port";

export class HttpHealthAdapter implements HealthPort {
  constructor(private readonly baseUrl: string) {}

  async check(): Promise<ApiHealth> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`La API respondió con estado ${response.status}`);
    }
    return (await response.json()) as ApiHealth;
  }
}
