/**
 * Ficha del personaje mostrada durante la partida: stats, disciplinas y equipo.
 * Es de solo lectura (los cambios vendrán de la lógica del juego).
 */

import type { Character } from "../../domain/character/character";
import { KAI_DISCIPLINE_NAMES } from "../../domain/character/kai-discipline";
import { WEAPON_NAMES } from "../../domain/character/weapon";

export function CharacterSheet({ character }: { character: Character }) {
  const { stats } = character;
  const hasEquipment =
    character.weapons.length > 0 ||
    character.backpack.length > 0 ||
    character.specialItems.length > 0;

  return (
    <aside className="sheet">
      <h2>Lobo Solitario</h2>

      <div className="stat-row">
        <span>Destreza</span>
        <strong>{stats.combatSkill}</strong>
      </div>
      <div className="stat-row">
        <span>Resistencia</span>
        <strong data-testid="sheet-endurance">
          {stats.enduranceCurrent}/{stats.enduranceMax}
        </strong>
      </div>

      <h3>Disciplinas</h3>
      <ul className="sheet-list">
        {character.disciplines.map((discipline) => (
          <li key={discipline}>
            {KAI_DISCIPLINE_NAMES[discipline]}
            {discipline === "weaponskill" && character.weaponskillWeapon
              ? ` (${WEAPON_NAMES[character.weaponskillWeapon]})`
              : ""}
          </li>
        ))}
      </ul>

      {hasEquipment && (
        <>
          <h3>Equipo</h3>
          <ul className="sheet-list">
            {[
              ...character.weapons,
              ...character.specialItems,
              ...character.backpack,
            ].map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </>
      )}

      <div className="stat-row">
        <span>Oro</span>
        <strong>{character.gold}</strong>
      </div>
      <div className="stat-row">
        <span>Comidas</span>
        <strong>{character.meals}</strong>
      </div>
    </aside>
  );
}
