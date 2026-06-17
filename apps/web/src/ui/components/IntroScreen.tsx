/**
 * Pantalla de introducción: "El Principio de la Historia" (sección tssf del
 * XML de Project Aon). Se muestra una sola vez antes de la creación del personaje.
 */

interface Props {
  onContinue: () => void;
}

export function IntroScreen({ onContinue }: Props) {
  return (
    <main className="creation">
      <h1>🐺 Lobo Solitario</h1>
      <p className="muted small">Libro 1 — Huida de la Oscuridad</p>

      <h2 className="intro-heading">El Principio de la Historia</h2>

      <div className="intro-text">
        <p>
          En el país nórdico de Sommerlund, durante siglos ha sido costumbre de
          los señores guerreros enviar a sus hijos al monasterio del Kai. Allí
          éstos son instruidos en las destrezas y disciplinas de sus nobles
          padres. Los monjes del Kai son maestros en su arte y los niños a su
          cargo les aman y respetan a pesar de la dureza de su adiestramiento.
          Pues un día, cuando hayan aprendido las especialidades secretas del
          Kai, volverán a sus casas equipados en cuerpo y mente para defenderse
          de la constante amenaza de guerra de los Señores de la Oscuridad de
          Occidente.
        </p>
        <p>
          En tiempos pasados, durante la Edad de la Luna Negra, los Señores de
          la Oscuridad hicieron la guerra contra Sommerlund. El conflicto fue
          una larga y encarnizada prueba de fuerza que concluyó con la victoria
          de Sommerlund en la gran batalla de la garganta de Maaken. El rey
          Ulnar y sus aliados de Durenor derrotaron a los ejércitos de los
          Señores de la Oscuridad en el desfiladero de Moytura y les obligaron a
          retroceder hacia el abismo insondable de la garganta de Maaken.
          Vashna, el más poderoso de los Señores de la Oscuridad, fue muerto por
          la espada del rey Ulnar, llamada Sommerswerd, la espada del sol. Desde
          entonces, los Señores de la Oscuridad han jurado venganza contra
          Sommerlund y la dinastía de Ulnar.
        </p>
        <p>
          Hoy es el día de la fiesta de Fehmarh, cuando todos los Señores del
          Kai se reúnen en el monasterio para asistir a la celebración. Es por
          la mañana. De repente una gran nube negra aparece en el horizonte por
          el oeste. Innumerables bestias de alas negras llenan el cielo hasta
          tal punto que el sol queda oculto por completo. Los Señores de la
          Oscuridad, los inveterados enemigos de Sommerlund, atacan. La guerra
          ha comenzado.
        </p>
        <p>
          En esa mañana aciaga, tú, Lobo Silencioso —nombre que te ha sido
          puesto por el Kai—, has sido enviado al bosque a recoger leña en
          castigo por tu falta de atención en clase. Cuando te dispones a
          regresar, descubres con horror una enorme y oscura nube de criaturas
          aladas que se precipitan sobre el monasterio. Arrojas al suelo la
          carga de leña y corres hacia la batalla que ya se ha entablado. Pero
          en la oscuridad artificial tropiezas y te golpeas la cabeza con la
          rama baja de un árbol. Al perder el conocimiento, lo último que ves a
          esa escasa luz son los muros del monasterio desplomándose.
        </p>
        <p>
          Permaneces muchas horas sin sentido antes de despertar. Ahora, con
          lágrimas en los ojos, contemplas la escena de destrucción. Alzando el
          rostro hacia el cielo azul juras vengarte de los Señores de la
          Oscuridad por la matanza de los guerreros del Kai. De pronto
          comprendes con toda claridad lo que debes hacer: emprender un
          peligroso viaje a la capital para avisar al Rey de la terrible amenaza
          que se cierne sobre su pueblo.
        </p>
        <p>
          <strong>
            Pues ahora tú eres el último de los guerreros del Kai. Ahora eres
            Lobo Solitario.
          </strong>
        </p>
      </div>

      <div className="start-actions">
        <button type="button" className="primary" onClick={onContinue}>
          Crear personaje
        </button>
      </div>
    </main>
  );
}
