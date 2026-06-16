/**
 * Pantalla de creación del personaje. Usa el dominio (`createCharacter` y las
 * tiradas) directamente: crear un personaje es lógica pura, sin E/S, así que no
 * necesita pasar por un puerto/adaptador.
 *
 * La Destreza y la Resistencia se tiran UNA vez al entrar (como elegir un número
 * de la Tabla de Números Aleatorios). El jugador elige 5 Disciplinas del Kai.
 */

import { useState } from "react";
import type { Character } from "../../domain/character/character";
import {
  createCharacter,
  rollCombatSkill,
  rollEndurance,
  rollWeaponskillWeapon,
} from "../../domain/character/create-character";
import {
  ALL_KAI_DISCIPLINES,
  KAI_DISCIPLINE_NAMES,
  KAI_DISCIPLINES_TO_CHOOSE,
  type KaiDiscipline,
} from "../../domain/character/kai-discipline";
import { WEAPON_NAMES, type WeaponType } from "../../domain/character/weapon";

interface Props {
  onCreate: (character: Character) => void;
}

export function CharacterCreation({ onCreate }: Props) {
  // Tirada única al montar (la "elección" de la tabla de números aleatorios).
  const [combatSkill] = useState(() => rollCombatSkill());
  const [enduranceMax] = useState(() => rollEndurance());

  const [selected, setSelected] = useState<KaiDiscipline[]>([]);
  const [weapon, setWeapon] = useState<WeaponType | null>(null);

  const isFull = selected.length >= KAI_DISCIPLINES_TO_CHOOSE;
  const ready = selected.length === KAI_DISCIPLINES_TO_CHOOSE;

  function toggle(discipline: KaiDiscipline) {
    if (selected.includes(discipline)) {
      setSelected(selected.filter((d) => d !== discipline));
      if (discipline === "weaponskill") setWeapon(null);
      return;
    }
    if (isFull) return; // ya hay 5
    setSelected([...selected, discipline]);
    if (discipline === "weaponskill") setWeapon(rollWeaponskillWeapon());
  }

  function start() {
    onCreate(
      createCharacter({
        combatSkill,
        enduranceMax,
        disciplines: selected,
        ...(weapon ? { weaponskillWeapon: weapon } : {}),
      }),
    );
  }

  return (
    <main className="creation" data-testid="creation">
      <h1>🐺 Crea a Lobo Solitario</h1>
      <p className="muted small">Libro 1 — Huida de la Oscuridad</p>

      <section className="stat-cards">
        <div className="stat-card">
          <span className="stat-label">Destreza en el Combate</span>
          <span className="stat-value" data-testid="stat-combat-skill">
            {combatSkill}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Resistencia</span>
          <span className="stat-value" data-testid="stat-endurance">
            {enduranceMax}
          </span>
        </div>
      </section>

      <h2>
        Disciplinas del Kai{" "}
        <span className="muted small" data-testid="discipline-count">
          ({selected.length}/{KAI_DISCIPLINES_TO_CHOOSE})
        </span>
      </h2>
      <p className="muted small">Elige 5. Te acompañarán toda la aventura.</p>

      <div className="discipline-grid">
        {ALL_KAI_DISCIPLINES.map((discipline) => {
          const active = selected.includes(discipline);
          return (
            <button
              key={discipline}
              type="button"
              className={`discipline-toggle${active ? " active" : ""}`}
              aria-pressed={active}
              disabled={!active && isFull}
              onClick={() => toggle(discipline)}
            >
              {KAI_DISCIPLINE_NAMES[discipline]}
              {discipline === "weaponskill" && weapon
                ? ` · ${WEAPON_NAMES[weapon]}`
                : ""}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="primary"
        data-testid="start-adventure"
        disabled={!ready}
        onClick={start}
      >
        Comenzar la aventura
      </button>
    </main>
  );
}
