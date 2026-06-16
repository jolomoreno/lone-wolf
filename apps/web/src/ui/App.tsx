/**
 * Orquesta las dos fases del juego:
 *  - Sin personaje  → pantalla de creación.
 *  - Con personaje  → la aventura (sección actual + ficha del personaje).
 *
 * El personaje vive en estado de React (se perderá al recargar hasta que
 * implementemos el guardado en localStorage, paso 9).
 */

import { useState } from "react";
import type { Character } from "../domain/character/character";
import { CharacterCreation } from "./components/CharacterCreation";
import { CharacterSheet } from "./components/CharacterSheet";
import { SectionView } from "./components/SectionView";
import { useSection } from "./hooks/useSection";

const FIRST_SECTION = 1;

export function App() {
  const [character, setCharacter] = useState<Character | null>(null);

  if (!character) {
    return <CharacterCreation onCreate={setCharacter} />;
  }

  return <Adventure character={character} onRestart={() => setCharacter(null)} />;
}

interface AdventureProps {
  character: Character;
  onRestart: () => void;
}

function Adventure({ character, onRestart }: AdventureProps) {
  const [sectionNumber, setSectionNumber] = useState(FIRST_SECTION);
  const section = useSection(sectionNumber);

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

      <div className="layout">
        <CharacterSheet character={character} />

        <div className="reader">
          {section.status === "loading" && (
            <p className="muted">Cargando sección…</p>
          )}
          {section.status === "error" && (
            <p className="status-bad">⚠️ {section.message}</p>
          )}
          {section.status === "ok" && (
            <SectionView section={section.data} onNavigate={setSectionNumber} />
          )}
        </div>
      </div>

      <footer className="game-footer">
        <button type="button" className="ghost" onClick={onRestart}>
          ↺ Nueva partida
        </button>
      </footer>
    </main>
  );
}
