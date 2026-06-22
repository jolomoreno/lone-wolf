/**
 * Ficha del personaje mostrada durante la partida: stats, disciplinas y equipo.
 * Permite usar la Poción Curativa (+4 Resistencia) directamente desde la mochila.
 */

import { useState } from "react";
import {
  type Character,
  countMeals,
  hasWeaponskillBonus,
} from "../../domain/character/character";
import {
  heal,
  removeFromBackpack,
  removeWeapon,
} from "../../domain/character/character-operations";
import { KAI_DISCIPLINE_NAMES } from "../../domain/character/kai-discipline";
import { WEAPON_NAMES } from "../../domain/character/weapon";
import { CombatRulesModal } from "./CombatRulesModal";
import { KaiDisciplinesModal } from "./KaiDisciplinesModal";
import { KaiLevelsModal } from "./KaiLevelsModal";
import { MapModal } from "./MapModal";

interface Props {
  character: Character;
  onCharacterChange?: (character: Character) => void;
  /** Deshabilita el uso de la Poción Curativa mientras haya un combate activo. */
  combatActive?: boolean;
  /** Controla si el drawer está abierto en móvil. */
  isOpen?: boolean;
  /** Llamado al tocar el handle o el área exterior del drawer. */
  onClose?: () => void;
}

const POTION_HEAL = 4;

export function CharacterSheet({
  character,
  onCharacterChange,
  combatActive,
  isOpen,
  onClose,
}: Props) {
  const [showRules, setShowRules] = useState(false);
  const [showDisciplines, setShowDisciplines] = useState(false);
  const [showLevels, setShowLevels] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { stats } = character;
  const backpackItems = character.backpack.filter((i) => i.kind !== "meal");

  function applyPotion(potionId: string) {
    if (!onCharacterChange) return;
    const healed = heal(character, POTION_HEAL);
    const withoutPotion = removeFromBackpack(healed, potionId);
    onCharacterChange(withoutPotion);
  }

  function dropWeapon(weaponId: string) {
    if (onCharacterChange) onCharacterChange(removeWeapon(character, weaponId));
  }

  function dropBackpackItem(itemId: string) {
    if (onCharacterChange)
      onCharacterChange(removeFromBackpack(character, itemId));
  }

  return (
    <>
      {showRules && <CombatRulesModal onClose={() => setShowRules(false)} />}
      {showLevels && <KaiLevelsModal onClose={() => setShowLevels(false)} />}
      {showMap && <MapModal onClose={() => setShowMap(false)} />}
      {showDisciplines && (
        <KaiDisciplinesModal
          onClose={() => setShowDisciplines(false)}
          activeDisciplines={character.disciplines}
          weaponskillWeapon={character.weaponskillWeapon}
        />
      )}
      <aside className={`sheet${isOpen ? " sheet--open" : ""}`}>
        {/* Handle visible solo en móvil; toca para cerrar el drawer */}
        <button
          type="button"
          className="sheet-drawer-handle"
          onClick={onClose}
          aria-label="Cerrar ficha"
        />
        <h2>Lobo Solitario</h2>

        <div className="stat-row">
          <span>Destreza</span>
          <strong>
            {stats.combatSkill + (hasWeaponskillBonus(character) ? 2 : 0)}
            {hasWeaponskillBonus(character) && (
              <span className="muted small"> (+2 Dominio)</span>
            )}
          </strong>
        </div>
        <div className="stat-row">
          <span>Resistencia</span>
          <strong data-testid="sheet-endurance">
            {stats.enduranceCurrent}/{stats.enduranceMax}
          </strong>
        </div>
        <div className="bar sheet-endurance-bar">
          <div
            className={`bar-fill lw${stats.enduranceCurrent / stats.enduranceMax <= 0.25 ? " bar-fill--critical" : ""}`}
            style={{
              width: `${Math.round((stats.enduranceCurrent / stats.enduranceMax) * 100)}%`,
            }}
          />
        </div>
        <h3>Disciplinas</h3>
        <ul className="sheet-list sheet-list--disciplines">
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
          {character.weapons.map((w) => (
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
          ))}
        </ul>

        <h3>Mochila</h3>
        <ul className="sheet-list">
          {backpackItems.map((item) => (
            <li key={item.id} className="sheet-item-row">
              {item.name}
              <span className="item-actions">
                {item.kind === "potion" && onCharacterChange && (
                  <button
                    type="button"
                    className="use-item-btn"
                    title={
                      combatActive
                        ? "Solo puedes usar la poción después del combate"
                        : `Usar (+${POTION_HEAL} Resistencia)`
                    }
                    disabled={
                      stats.enduranceCurrent >= stats.enduranceMax ||
                      !!combatActive
                    }
                    onClick={() => applyPotion(item.id)}
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
          ))}
          <li className="sheet-item-row">
            <span>Comidas</span>
            <strong>{countMeals(character)}</strong>
          </li>
        </ul>

        <div className="stat-row">
          <span>Oro</span>
          <strong>{character.gold}</strong>
        </div>

        {character.specialItems.length > 0 && (
          <>
            <h3>Objetos especiales</h3>
            <ul className="sheet-list">
              {character.specialItems.map((i) => (
                <li key={i.id} className="sheet-item-row">
                  {i.name}
                  {i.id === "map" && (
                    <button
                      type="button"
                      className="use-item-btn"
                      onClick={() => setShowMap(true)}
                    >
                      ver mapa
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        <h3>Reglas</h3>
        <div className="sheet-ref-buttons">
          <button
            type="button"
            className="rules-btn"
            onClick={() => setShowDisciplines(true)}
          >
            Disciplinas del Kai
          </button>
          <button
            type="button"
            className="rules-btn"
            onClick={() => setShowLevels(true)}
          >
            Niveles de Entrenamiento Kai
          </button>
          <button
            type="button"
            className="rules-btn"
            onClick={() => setShowRules(true)}
          >
            Reglas de combate
          </button>
        </div>
      </aside>
    </>
  );
}
