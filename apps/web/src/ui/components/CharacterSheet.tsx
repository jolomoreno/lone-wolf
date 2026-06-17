/**
 * Ficha del personaje mostrada durante la partida: stats, disciplinas y equipo.
 * Es de solo lectura (los cambios vendrán de la lógica del juego).
 */

import {
  type Character,
  countMeals,
  MAX_BACKPACK_ITEMS,
} from "../../domain/character/character";
import { KAI_DISCIPLINE_NAMES } from "../../domain/character/kai-discipline";
import { WEAPON_NAMES } from "../../domain/character/weapon";

export function CharacterSheet({ character }: { character: Character }) {
  const { stats } = character;
  const backpackItems = character.backpack.filter((i) => i.kind !== "meal");

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

      <h3>Armas</h3>
      <ul className="sheet-list">
        {character.weapons.length > 0 ? (
          character.weapons.map((w) => <li key={w.id}>{w.name}</li>)
        ) : (
          <li className="muted">—</li>
        )}
      </ul>

      <h3>
        Mochila ({character.backpack.length}/{MAX_BACKPACK_ITEMS})
      </h3>
      <ul className="sheet-list">
        {backpackItems.length > 0 ? (
          backpackItems.map((i) => <li key={i.id}>{i.name}</li>)
        ) : (
          <li className="muted">—</li>
        )}
      </ul>

      {character.specialItems.length > 0 && (
        <>
          <h3>Objetos especiales</h3>
          <ul className="sheet-list">
            {character.specialItems.map((i) => (
              <li key={i.id}>{i.name}</li>
            ))}
          </ul>
        </>
      )}

      <div className="stat-row">
        <span>Comidas</span>
        <strong>{countMeals(character)}</strong>
      </div>
      <div className="stat-row">
        <span>Oro</span>
        <strong>{character.gold}</strong>
      </div>
    </aside>
  );
}
