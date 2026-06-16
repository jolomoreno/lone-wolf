/**
 * @lone-wolf/shared: contratos (DTOs) compartidos entre `web` y `api`.
 *
 * Define ÚNICAMENTE la forma de los datos que cruzan la red, sin lógica de
 * dominio. El dominio vive dentro de cada app (hexagonal).
 */

/** Versión del contrato de la API de contenido (para detectar incompatibilidades). */
export const API_CONTRACT_VERSION = 1;

export * from "./section.dto";
