/**
 * Pantalla principal del juego: muestra la sección actual y permite navegar por
 * el libro pulsando las opciones. El número de sección actual es el único estado
 * por ahora (la ficha del personaje y el guardado llegarán en pasos siguientes).
 */

import { useState } from "react";
import { useSection } from "./hooks/useSection";
import { useApiHealth } from "./hooks/useApiHealth";
import { SectionView } from "./components/SectionView";

const FIRST_SECTION = 1;

export function App() {
  const [sectionNumber, setSectionNumber] = useState(FIRST_SECTION);
  const section = useSection(sectionNumber);
  const health = useApiHealth();

  return (
    <main className="game">
      <header className="game-header">
        <div>
          <h1>🐺 Lobo Solitario</h1>
          <p className="muted small">Libro 1 — Huida de la Oscuridad</p>
        </div>
        <span className="section-badge" data-testid="section-number">
          {sectionNumber}
        </span>
      </header>

      {section.status === "loading" && <p className="muted">Cargando sección…</p>}
      {section.status === "error" && (
        <p className="status-bad">⚠️ {section.message}</p>
      )}
      {section.status === "ok" && (
        <SectionView section={section.data} onNavigate={setSectionNumber} />
      )}

      <footer className="game-footer">
        <button
          type="button"
          className="ghost"
          onClick={() => setSectionNumber(FIRST_SECTION)}
        >
          ↺ Reiniciar
        </button>
        {health.status === "ok" && (
          <span className="muted small">
            API: {health.data.status} · BD: {health.data.db}
          </span>
        )}
      </footer>
    </main>
  );
}
