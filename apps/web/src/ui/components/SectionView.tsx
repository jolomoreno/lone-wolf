/**
 * Pinta una sección del libro: sus bloques de contenido (párrafos, ilustraciones
 * y combates) y los botones de navegación a las siguientes secciones.
 *
 * Las ilustraciones se muestran como marcador de posición (las imágenes de
 * Project Aon no se cargan aquí). El combate, de momento, solo se muestra; la
 * mecánica llegará en el paso 8.
 */

import type { SectionDTO } from "@lone-wolf/shared";

interface Props {
  section: SectionDTO;
  onNavigate: (sectionNumber: number) => void;
  /** Si es false, se ocultan las opciones (p.ej. durante un combate sin resolver). */
  showChoices?: boolean;
}

/** Extrae el número de un id de sección ("sect85" -> 85), o null si no aplica. */
function targetNumber(target: string): number | null {
  const value = Number(target.replace(/^sect/, ""));
  return Number.isInteger(value) && value > 0 ? value : null;
}

export function SectionView({ section, onNavigate, showChoices = true }: Props) {
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
              // El combate lo gestiona el CombatPanel (interactivo), no aquí.
              return null;
            default:
              return null;
          }
        })}
      </div>

      {showChoices && section.choices.length > 0 && (
        <nav className="choices">
          {section.choices.map((choice, index) => {
            const target = targetNumber(choice.target);
            return (
              <button
                key={index}
                type="button"
                className="choice"
                data-target={target ?? ""}
                disabled={target === null}
                onClick={() => target !== null && onNavigate(target)}
              >
                {choice.text}
              </button>
            );
          })}
        </nav>
      )}
    </article>
  );
}
