/**
 * Pantalla de creación del personaje (Libro 1). Usa el dominio directamente:
 * - Tira Destreza, Resistencia, Oro y el objeto del almacén (Tabla de la Suerte).
 * - El jugador elige 5 Disciplinas del Kai (y el arma si coge "Dominio de las Armas").
 * Al confirmar, `createStartingCharacter` ensambla el equipo fijo + lo tirado.
 */

import { useState } from "react";
import type { Character } from "../../domain/character/character";
import {
  rollCombatSkill,
  rollEndurance,
  rollStartingGold,
  rollWeaponskillWeapon,
} from "../../domain/character/create-character";
import {
  createStartingCharacter,
  rollStoreroomChoiceId,
  STOREROOM,
  type StoreroomGrant,
} from "../../domain/character/equipment";
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

function storeroomHint(grant: StoreroomGrant): string {
  switch (grant.kind) {
    case "weapon":
      return "Arma";
    case "special":
      return grant.enduranceBonus
        ? `Especial · +${grant.enduranceBonus} Resistencia`
        : "Especial";
    case "meals":
      return `${grant.amount} Comidas`;
    case "backpackItem":
      return "Mochila";
    case "gold":
      return `+${grant.amount} Coronas`;
  }
}

export function CharacterCreation({ onCreate }: Props) {
  // Tiradas únicas al montar (la "elección" en la Tabla de la Suerte).
  const [combatSkill] = useState(() => rollCombatSkill());
  const [enduranceMax] = useState(() => rollEndurance());
  const [gold] = useState(() => rollStartingGold());
  const [storeroomId] = useState(() => rollStoreroomChoiceId());

  const [selected, setSelected] = useState<KaiDiscipline[]>([]);
  const [weapon, setWeapon] = useState<WeaponType | null>(null);

  const isFull = selected.length >= KAI_DISCIPLINES_TO_CHOOSE;
  const ready = selected.length === KAI_DISCIPLINES_TO_CHOOSE;

  const storeroomItem = STOREROOM.find((c) => c.id === storeroomId);

  function toggle(discipline: KaiDiscipline) {
    if (selected.includes(discipline)) {
      setSelected(selected.filter((d) => d !== discipline));
      if (discipline === "weaponskill") setWeapon(null);
      return;
    }
    if (isFull) return;
    setSelected([...selected, discipline]);
    if (discipline === "weaponskill") setWeapon(rollWeaponskillWeapon());
  }

  function start() {
    onCreate(
      createStartingCharacter({
        combatSkill,
        enduranceMax,
        gold,
        disciplines: selected,
        ...(weapon ? { weaponskillWeapon: weapon } : {}),
        storeroomChoiceId: storeroomId,
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
        <div className="stat-card">
          <span className="stat-label">Oro (Tabla de la Suerte)</span>
          <span className="stat-value" data-testid="stat-gold">
            {gold}
          </span>
        </div>
      </section>

      <p className="muted small">
        Equipo fijo: Hacha, 1 Comida y Mapa de Sommerlund.
      </p>

      {storeroomItem && (
        <div className="rolled-item" data-testid="storeroom-item" data-store={storeroomId}>
          <span className="muted small">Objeto del almacén (tirada {storeroomId})</span>
          <span>
            <strong>{storeroomItem.name}</strong> ·{" "}
            <span className="muted small">{storeroomHint(storeroomItem.grant)}</span>
          </span>
        </div>
      )}

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
