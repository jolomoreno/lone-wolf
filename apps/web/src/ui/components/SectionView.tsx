/**
 * Pinta una sección del libro: sus bloques de contenido (párrafos, ilustraciones
 * y combates) y los botones de navegación a las siguientes secciones.
 *
 * Las ilustraciones se muestran como marcador de posición (las imágenes de
 * Project Aon no se cargan aquí). El combate es gestionado por CombatPanel.
 */

import type { SectionDTO } from "@lone-wolf/shared";

interface Props {
  section: SectionDTO;
  onNavigate: (sectionId: string) => void;
  /** Si es false, se ocultan las opciones (p.ej. durante un combate sin resolver). */
  showChoices?: boolean;
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
              return null;
            default:
              return null;
          }
        })}
      </div>

      {showChoices && section.choices.length > 0 && (
        <nav className="choices">
          {section.choices.map((choice, index) => (
            <button
              key={index}
              type="button"
              className="choice"
              onClick={() => onNavigate(choice.target)}
            >
              {choice.text}
            </button>
          ))}
        </nav>
      )}
    </article>
  );
}
