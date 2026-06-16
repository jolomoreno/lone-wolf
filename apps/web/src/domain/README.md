# Capa de Dominio (frontend)

El **núcleo** de la lógica del juego, en TypeScript puro y testeable sin React.

## Reglas

- Sin React, sin `fetch`, sin `localStorage`, sin ningún framework ni API del navegador.
- **No** importa de `application`, `infrastructure` ni `ui`.

## Qué vivirá aquí

- `Character` (la ficha: Destreza, Resistencia, Disciplinas del Kai, inventario).
- Reglas de **combate** (cálculo del asalto a partir de la Tabla de Números Aleatorios).
- Gestión de **Resistencia/vidas** y de **inventario** (límites de mochila, oro, etc.).
- El estado de partida `GameState` (lo que luego se guarda en localStorage).
