/**
 * Pinta una sección del libro: sus bloques de contenido (párrafos, ilustraciones
 * y combates) y los botones de navegación a las siguientes secciones.
 *
 * Las opciones condicionales (requieren disciplina, objeto o stats) se muestran
 * atenuadas y deshabilitadas si la condición no se cumple.
 */

import type { SectionDTO } from "@lone-wolf/shared";

interface Props {
  section: SectionDTO;
  onNavigate: (sectionId: string) => void;
  /** Si es false, se ocultan las opciones (p.ej. durante un combate sin resolver). */
  showChoices?: boolean;
  /**
   * Función que indica si un choice (por target) está disponible para el jugador.
   * Si devuelve `false`, el botón se deshabilita (condición no cumplida).
   * Si devuelve `undefined` o no se pasa, el choice se considera disponible.
   */
  isChoiceAvailable?: (target: string) => boolean | undefined;
}

export function SectionView({
  section,
  onNavigate,
  showChoices = true,
  isChoiceAvailable,
}: Props) {
  return (
    <article>
      <div className="section-content">
        {section.blocks.map((block, index) => {
          switch (block.type) {
            case "paragraph":
              return <p key={index}>{block.text}</p>;
            case "illustration":
              return (
                <figure key={index} className="illustration">
                  <span aria-hidden>🖼️</span>
                  <span className="muted small">Ilustración</span>
                </figure>
              );
            case "combat":
              return null;
            default:
              return null;
          }
        })}
      </div>

      {showChoices && section.choices.length > 0 && (
        <nav className="choices">
          {section.choices.map((choice, index) => {
            const available = isChoiceAvailable
              ? (isChoiceAvailable(choice.target) ?? true)
              : true;
            return (
              <button
                key={index}
                type="button"
                className={`choice${!available ? " choice-locked" : ""}`}
                disabled={!available}
                title={!available ? "Condición no cumplida" : undefined}
                onClick={() => available && onNavigate(choice.target)}
              >
                {choice.text}
                {!available && <span aria-hidden> 🔒</span>}
              </button>
            );
          })}
        </nav>
      )}
    </article>
  );
}
