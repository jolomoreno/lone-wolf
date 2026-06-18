/**
 * Inyección de dependencias para React: expone el `container` (casos de uso)
 * a través de un Context.
 *
 * Ventaja "de libro": los componentes piden casos de uso con `useContainer()`
 * en vez de importarlos directamente, lo que permite sustituirlos por dobles
 * de test envolviendo el árbol con otro Provider.
 */

import { createContext, type ReactNode, useContext } from "react";
import { type Container, container } from "../config/composition-root";

const ContainerContext = createContext<Container>(container);

export function DependencyProvider({ children }: { children: ReactNode }) {
  return (
    <ContainerContext.Provider value={container}>
      {children}
    </ContainerContext.Provider>
  );
}

export function useContainer(): Container {
  return useContext(ContainerContext);
}
