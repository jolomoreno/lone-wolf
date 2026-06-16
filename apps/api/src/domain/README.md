# Capa de Dominio

El **núcleo** de la aplicación: entidades, value objects y **puertos de salida**
(interfaces de repositorios).

## Reglas

- TypeScript **puro**: sin Express, sin Mongoose, sin ningún framework.
- **No** puede importar de `application` ni de `infrastructure`.
- Solo depende de sí mismo.

## Qué vivirá aquí

- La entidad de dominio `Section` (distinta del `SectionDTO` del contrato).
- El puerto de salida `interface SectionRepository` (cómo se piden las secciones,
  sin saber si vienen de Mongo, de un fichero o de memoria).
