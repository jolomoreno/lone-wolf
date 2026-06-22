/**
 * Arranque del frontend: monta React en el DOM, envuelto en el
 * DependencyProvider para que la UI tenga acceso a los casos de uso.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./ui/App";
import { ErrorBoundary } from "./ui/components/ErrorBoundary";
import { DependencyProvider } from "./ui/DependencyProvider";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("No se encontró el elemento #root en index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <DependencyProvider>
        <App />
      </DependencyProvider>
    </ErrorBoundary>
  </StrictMode>,
);
