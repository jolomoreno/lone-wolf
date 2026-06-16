/**
 * Componente raíz de la UI. De momento solo comprueba la conexión con la API
 * (front <-> back de punta a punta). El juego en sí llegará en los próximos pasos.
 */

import { API_CONTRACT_VERSION } from "@lone-wolf/shared";
import { useApiHealth } from "./hooks/useApiHealth";

export function App() {
  const health = useApiHealth();

  return (
    <main className="card">
      <h1>🐺 Lobo Solitario</h1>
      <p className="muted">Libro 1 — Huida de la Oscuridad</p>

      <h2>Estado de la API</h2>

      {health.status === "loading" && <p className="muted">Comprobando conexión…</p>}

      {health.status === "error" && (
        <p className="status-bad">❌ Sin conexión con la API: {health.message}</p>
      )}

      {health.status === "ok" && (
        <>
          <ul className="kv">
            <li>
              <span>Servidor</span>
              <span className="status-ok">{health.data.status}</span>
            </li>
            <li>
              <span>Base de datos</span>
              <span>{health.data.db}</span>
            </li>
            <li>
              <span>Versión del contrato (API)</span>
              <span>{health.data.apiContractVersion}</span>
            </li>
            <li>
              <span>Versión del contrato (esperada)</span>
              <span>{API_CONTRACT_VERSION}</span>
            </li>
            <li>
              <span>¿Contratos compatibles?</span>
              <span
                className={
                  health.data.apiContractVersion === API_CONTRACT_VERSION
                    ? "status-ok"
                    : "status-bad"
                }
              >
                {health.data.apiContractVersion === API_CONTRACT_VERSION
                  ? "sí ✓"
                  : "no ✗"}
              </span>
            </li>
          </ul>
        </>
      )}
    </main>
  );
}
