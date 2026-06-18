/**
 * La "Tabla de la Suerte" del libro, digitalizada: devuelve un entero de 0 a 9.
 *
 * Es un PUERTO (un tipo de función) para poder inyectar una versión
 * determinista en los tests. La implementación por defecto usa Math.random.
 */

export type RandomNumber = () => number;

export const defaultRandomNumber: RandomNumber = () =>
  Math.floor(Math.random() * 10);
