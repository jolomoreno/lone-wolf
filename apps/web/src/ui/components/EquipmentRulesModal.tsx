import type { ReactNode } from "react";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rules-section">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Term({ dt, dd }: { dt: string; dd: string }) {
  return (
    <div className="equip-term">
      <strong>{dt}</strong>
      <p>{dd}</p>
    </div>
  );
}

interface Props {
  onClose: () => void;
}

export function EquipmentRulesModal({ onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Equipo</h2>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>

        <Section title="Cómo llevar el equipo">
          <p className="rules-intro">
            Una vez que tienes tu equipo completo, esta lista te indica cómo has de llevarlo.
          </p>
          <ul className="rules-list">
            <li><strong>Espada</strong> — se lleva en la mano.</li>
            <li><strong>Casco</strong> — se lleva puesto en la cabeza.</li>
            <li><strong>Comida</strong> — va guardada en la mochila.</li>
            <li><strong>Cota de Malla</strong> — se lleva puesta alrededor del pecho.</li>
            <li><strong>Maza</strong> — se lleva en la mano.</li>
            <li><strong>Poción Curativa</strong> — va guardada en la mochila.</li>
            <li><strong>Estaca</strong> — se lleva en la mano.</li>
            <li><strong>Lanza</strong> — se lleva en la mano.</li>
            <li><strong>Coronas de Oro</strong> — se guardan en la bolsa.</li>
            <li><strong>Espadón</strong> — se lleva en la mano.</li>
          </ul>
        </Section>

        <Section title="Cuántos objetos puedes llevar">
          <Term
            dt="Armas"
            dd="El número máximo de armas que puedes llevar es 2."
          />
          <Term
            dt="Objetos de la mochila"
            dd="Como la capacidad de la mochila es reducida, solo puedes guardar en ella a la vez un máximo de 8 artículos, incluidas las comidas."
          />
          <Term
            dt="Objetos especiales"
            dd="Los objetos especiales no se guardan en la mochila. Cuando encuentres alguno, se te indicará cómo has de llevarlo."
          />
          <Term
            dt="Coronas de oro"
            dd="Se llevan siempre en la bolsa, que no puede contener más de 50 Coronas."
          />
          <Term
            dt="Comida"
            dd="La comida se guarda en la mochila. Cada comida cuenta como 1 objeto."
          />
          <p className="rules-intro" style={{ marginTop: "0.75rem" }}>
            Cualquier objeto útil que puedas apoderarte durante la aventura aparecerá en el texto con la inicial en mayúscula. Salvo que se indique que es especial, irá en la mochila.
          </p>
        </Section>

        <Section title="Cómo utilizar tu equipo">
          <Term
            dt="Armas"
            dd="Las armas te ayudan en los combates. Si tienes la disciplina Dominio de las Armas y el arma adecuada, sumas 2 puntos a tu Destreza. Si combates sin armas, restas 4 puntos de Destreza y luchas con las manos. Solo puedes llevar 2 armas a la vez."
          />
          <Term
            dt="Objetos de la mochila"
            dd="Durante tu viaje descubrirás objetos útiles que puedes querer conservar. (Máximo 8 objetos en la mochila). En cualquier momento que no estés en combate puedes cambiarlos o desecharlos."
          />
          <Term
            dt="Objetos especiales"
            dd="Cada objeto especial tiene una finalidad o efecto determinados. A veces se te dirá al descubrirlo; otras, te será revelado más adelante conforme avanza la aventura."
          />
          <Term
            dt="Coronas de oro"
            dd="La moneda de curso legal en Sommerlund es la Corona. Puedes usarlas para pagar el transporte o la comida, e incluso como soborno. Muchas criaturas poseen Coronas; al matarlas puedes apoderarte de ellas y guardarlas en tu bolsa (máximo 50)."
          />
          <Term
            dt="Comida"
            dd="Necesitarás comer regularmente durante tu aventura. Si no tienes comida cuando se te ordene comer, perderás 3 puntos de Resistencia. Con la disciplina de Caza no necesitas sacar una comida cuando se te dé la orden."
          />
          <Term
            dt="Poción Curativa"
            dd="Puede devolverte 4 puntos de Resistencia perdidos en combate. Solo tienes cantidad para una dosis. Es un objeto de mochila."
          />
        </Section>
      </div>
    </div>
  );
}
