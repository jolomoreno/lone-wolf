/**
 * Hook que ejecuta el caso de uso CheckApiHealth y expone su estado a la UI.
 *
 * Es "código pegamento" de React: traduce una promesa del caso de uso a un
 * estado (cargando / ok / error) que el componente puede pintar.
 */

import { useEffect, useState } from "react";
import { useContainer } from "../DependencyProvider";
import type { ApiHealth } from "../../application/ports/health.port";

export type ApiHealthState =
  | { status: "loading" }
  | { status: "ok"; data: ApiHealth }
  | { status: "error"; message: string };

export function useApiHealth(): ApiHealthState {
  const { checkApiHealth } = useContainer();
  const [state, setState] = useState<ApiHealthState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    checkApiHealth
      .execute()
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
  }, [checkApiHealth]);

  return state;
}
