/**
 * Hook que carga una sección del libro por su número y expone su estado
 * (cargando / ok / error) a la UI. Recarga cuando cambia el número.
 */

import { useEffect, useState } from "react";
import type { SectionDTO } from "@lone-wolf/shared";
import { useContainer } from "../DependencyProvider";

export type SectionState =
  | { status: "loading" }
  | { status: "ok"; data: SectionDTO }
  | { status: "error"; message: string };

export function useSection(number: number): SectionState {
  const { getSection } = useContainer();
  const [state, setState] = useState<SectionState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });

    getSection
      .execute(number)
      .then((data) => {
        if (active) setState({ status: "ok", data });
      })
      .catch((error: unknown) => {
        if (active) {
          const message =
            error instanceof Error ? error.message : "Error desconocido";
          setState({ status: "error", message });
        }
      });

    return () => {
      active = false;
    };
  }, [getSection, number]);

  return state;
}
