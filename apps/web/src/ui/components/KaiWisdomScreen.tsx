/**
 * Pantalla de transición antes de sect1: "La Sabiduría del Kai" (sección
 * kaiwisdm del XML de Project Aon). Aparece tras crear el personaje y antes
 * de comenzar la aventura.
 */

interface Props {
  onContinue: () => void;
}

export function KaiWisdomScreen({ onContinue }: Props) {
  return (
    <main className="creation">
      <h1>🐺 Lobo Solitario</h1>
      <p className="muted small">Libro 1 — Huida de la Oscuridad</p>

      <h2 className="intro-heading">La Sabiduría del Kai</h2>

      <div className="intro-text">
        <p>
          Tu misión será muy peligrosa, pues los Señores de la Oscuridad y sus
          servidores son enemigos crueles y feroces que no conceden ni esperan
          clemencia. Utiliza el mapa para orientarte y seguir el camino más
          directo hacia la capital. Toma notas conforme vas avanzando a lo largo
          de la historia porque te serán de gran utilidad en futuras aventuras.
        </p>
        <p>
          Muchos objetos que encontrarás te ayudarán durante la aventura.
          Algunos objetos especiales te serán útiles en próximas aventuras de
          Lobo Solitario, mientras que otros no tendrán ninguna utilidad real.
          Por tanto, deberás elegir con mucho cuidado los que decides conservar.
        </p>
        <p>
          Hay muchas rutas que conducen hasta el Rey, pero sólo una implica un
          mínimo de peligros. Con una sabia elección de las disciplinas del Kai
          y una buena dosis de valor, cualquier jugador será capaz de llevar a
          cabo la misión, por reducidos que sean su inicial Destreza en el
          Combate o sus puntos de Resistencia.
        </p>
        <p>
          <strong>
            El honor y la memoria de los Señores del Kai te acompañarán en tu
            arriesgado viaje. ¡Buena suerte!
          </strong>
        </p>
      </div>

      <div className="start-actions">
        <button type="button" className="primary" onClick={onContinue}>
          Comenzar la aventura
        </button>
      </div>
    </main>
  );
}
