/**
 * Puerto (interfaz) para consultar la salud de la API.
 *
 * La aplicación define QUÉ necesita; la infraestructura decidirá CÓMO (en este
 * caso, con fetch). El caso de uso depende de esta interfaz, no de fetch.
 */

/** Forma de la respuesta de salud que le interesa a la aplicación. */
export interface ApiHealth {
  status: string;
  db: string;
  apiContractVersion: number;
  uptime: number;
  timestamp: string;
}

export interface HealthPort {
  check(): Promise<ApiHealth>;
}
