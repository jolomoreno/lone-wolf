/**
 * Ficha del personaje mostrada durante la partida: stats, disciplinas y equipo.
 * Permite usar la Poción Curativa (+4 Resistencia) directamente desde la mochila.
 */

import {
  type Character,
  countMeals,
  MAX_BACKPACK_ITEMS,
} from "../../domain/character/character";
import {
  heal,
  removeFromBackpack,
  removeWeapon,
} from "../../domain/character/character-operations";
import { KAI_DISCIPLINE_NAMES } from "../../domain/character/kai-discipline";
import { WEAPON_NAMES } from "../../domain/character/weapon";

interface Props {
  character: Character;
  onCharacterChange?: (character: Character) => void;
}

const POTION_HEAL = 4;

export function CharacterSheet({ character, onCharacterChange }: Props) {
  const { stats } = character;
  const backpackItems = character.backpack.filter((i) => i.kind !== "meal");

  function usePotion(potionId: string) {
    if (!onCharacterChange) return;
    const healed = heal(character, POTION_HEAL);
    const withoutPotion = removeFromBackpack(healed, potionId);
    onCharacterChange(withoutPotion);
  }

  function dropWeapon(weaponId: string) {
    if (onCharacterChange) onCharacterChange(removeWeapon(character, weaponId));
  }

  function dropBackpackItem(itemId: string) {
    if (onCharacterChange) onCharacterChange(removeFromBackpack(character, itemId));
  }

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
          character.weapons.map((w) => (
            <li key={w.id} className="sheet-item-row">
              {w.name}
              {onCharacterChange && (
                <button
                  type="button"
                  className="drop-item-btn"
                  title="Soltar"
                  aria-label={`Soltar ${w.name}`}
                  onClick={() => dropWeapon(w.id)}
                >
                  ✕
                </button>
              )}
            </li>
          ))
        ) : (
          <li className="muted">—</li>
        )}
      </ul>

      <h3>
        Mochila ({character.backpack.length}/{MAX_BACKPACK_ITEMS})
      </h3>
      <ul className="sheet-list">
        {backpackItems.length > 0 ? (
          backpackItems.map((item) => (
            <li key={item.id} className="sheet-item-row">
              {item.name}
              <span className="item-actions">
                {item.kind === "potion" && onCharacterChange && (
                  <button
                    type="button"
                    className="use-item-btn"
                    title={`Usar (+${POTION_HEAL} Resistencia)`}
                    disabled={stats.enduranceCurrent >= stats.enduranceMax}
                    onClick={() => usePotion(item.id)}
                  >
                    Usar
                  </button>
                )}
                {onCharacterChange && (
                  <button
                    type="button"
                    className="drop-item-btn"
                    title="Soltar"
                    aria-label={`Soltar ${item.name}`}
                    onClick={() => dropBackpackItem(item.id)}
                  >
                    ✕
                  </button>
                )}
              </span>
            </li>
          ))
        ) : (
          <li className="muted">—</li>
        )}
        <li className="sheet-item-row">
          <span>Comidas</span>
          <strong>{countMeals(character)}</strong>
        </li>
      </ul>

      <h3>Bolsa de Oro</h3>
      <ul className="sheet-list">
        <li className="sheet-item-row">
          <span>Monedas</span>
          <strong>{character.gold}</strong>
        </li>
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
    </aside>
  );
}
