/**
 * Configuración de las ilustraciones de Project Aon.
 *
 * Las imágenes NO se redistribuyen desde este repo: se enlazan directamente
 * desde el servidor de Project Aon (hotlink), cumpliendo así la Project Aon
 * License (uso no comercial + atribución, sin redistribuir el material).
 *
 * La edición española (01hdlo) comparte los ficheros de ilustración de Gary
 * Chalk con la edición inglesa (01fftd), así que apuntamos a esa ruta.
 */

const DEFAULT_BASE_URL =
  "https://www.projectaon.org/data/trunk/en/png/lw/01fftd/ill/chalk/";

/** URL base de las ilustraciones (configurable por entorno). */
export const ILLUSTRATION_BASE_URL =
  import.meta.env.VITE_ILLUSTRATION_BASE_URL ?? DEFAULT_BASE_URL;

/** Construye la URL completa de una ilustración a partir de su nombre de fichero. */
export function illustrationUrl(src: string): string {
  return `${ILLUSTRATION_BASE_URL}${src}`;
}

/** Enlace a Project Aon (requerido por la licencia). */
export const PROJECT_AON_URL = "https://www.projectaon.org";

/** Texto de atribución mostrado en el pie (requerido por la licencia). */
export const PROJECT_AON_ATTRIBUTION =
  "Texto e ilustraciones © Joe Dever y Gary Chalk. Distribuido por Project Aon bajo su licencia (uso no comercial).";
