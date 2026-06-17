/**
 * Panel de botín: muestra los objetos que se pueden coger en una sección
 * (registrar cadáveres, cofres…). Respeta los límites de inventario; si no hay
 * sitio, el botón se deshabilita y el jugador debe soltar algo en la ficha.
 *
 * El oro se cobra automáticamente al entrar (no aparece aquí).
 */

import {
  type Character,
  MAX_BACKPACK_ITEMS,
  MAX_WEAPONS,
} from "../../domain/character/character";
import type { LootItem } from "../../domain/game/section-rules";

interface Props {
  character: Character;
  items: LootItem[];
  onTake: (item: LootItem) => void;
}

function isTaken(character: Character, item: LootItem): boolean {
  const pool =
    item.slot === "weapon"
      ? character.weapons
      : item.slot === "backpack"
        ? character.backpack
        : character.specialItems;
  return pool.some((i) => i.id === item.id);
}

function canTake(character: Character, item: LootItem): boolean {
  if (item.slot === "weapon") return character.weapons.length < MAX_WEAPONS;
  if (item.slot === "backpack") {
    return character.backpack.length < MAX_BACKPACK_ITEMS;
  }
  return true;
}

export function LootPanel({ character, items, onTake }: Props) {
  const remaining = items.filter((item) => !isTaken(character, item));
  if (remaining.length === 0) return null;

  return (
    <section className="loot-panel" data-testid="loot-panel">
      <h3>🎒 Objetos disponibles</h3>
      <ul className="loot-list">
        {remaining.map((item) => {
          const able = canTake(character, item);
          return (
            <li key={item.id}>
              <span>{item.name}</span>
              <button
                type="button"
                className="use-item-btn"
                disabled={!able}
                title={able ? "Coger" : "No tienes espacio (suelta algo primero)"}
                onClick={() => onTake(item)}
              >
                Coger
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
