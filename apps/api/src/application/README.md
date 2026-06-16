# Capa de Aplicación

Los **casos de uso**: orquestan el dominio a través de los puertos para cumplir
una acción concreta del sistema.

## Reglas

- Puede importar de `domain`.
- **Nunca** importa de `infrastructure` (depende de los puertos, no de adaptadores).

## Qué vivirá aquí

- Casos de uso como `GetSection` o `ListSections`, que reciben un
  `SectionRepository` (el puerto) por inyección y lo usan sin conocer la
  implementación concreta.
