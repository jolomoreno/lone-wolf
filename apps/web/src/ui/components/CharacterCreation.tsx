/**
 * Pantalla de creación del personaje (Libro 1). El jugador tira cada stat
 * pulsando un botón, con revelación progresiva: Destreza → Resistencia →
 * Oro → Almacén. Solo entonces puede elegir disciplinas y comenzar.
 */

import { useRef, useState } from "react";
import type { Character } from "../../domain/character/character";
import { rollWeaponskillWeapon } from "../../domain/character/create-character";
import {
  createStartingCharacter,
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
import { DiceRoll, type DiceRollHandle } from "./DiceRoll";

interface Props {
  onCreate: (character: Character) => void;
}

type Step = "cs" | "end" | "gold" | "store" | "done";

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
  const [step, setStep] = useState<Step>("cs");
  const [combatSkill, setCombatSkill] = useState<number | null>(null);
  const [enduranceMax, setEnduranceMax] = useState<number | null>(null);
  const [gold, setGold] = useState<number | null>(null);
  const [storeroomId, setStoreroomId] = useState<number | null>(null);
  const [selected, setSelected] = useState<KaiDiscipline[]>([]);
  const [weapon, setWeapon] = useState<WeaponType | null>(null);

  const dieCs = useRef<DiceRollHandle>(null);
  const dieEnd = useRef<DiceRollHandle>(null);
  const dieGold = useRef<DiceRollHandle>(null);
  const dieStore = useRef<DiceRollHandle>(null);

  const isFull = selected.length >= KAI_DISCIPLINES_TO_CHOOSE;
  const ready = step === "done" && selected.length === KAI_DISCIPLINES_TO_CHOOSE;
  const storeroomItem =
    storeroomId !== null ? STOREROOM.find((c) => c.id === storeroomId) : null;

  function rollCs() {
    const raw = Math.floor(Math.random() * 10);
    dieCs.current?.roll(raw, () => {
      setCombatSkill(10 + raw);
      setStep("end");
    });
  }

  function rollEnd() {
    const raw = Math.floor(Math.random() * 10);
    dieEnd.current?.roll(raw, () => {
      setEnduranceMax(20 + raw);
      setStep("gold");
    });
  }

  function rollGold() {
    const raw = Math.floor(Math.random() * 10);
    dieGold.current?.roll(raw, () => {
      setGold(raw);
      setStep("store");
    });
  }

  function rollStore() {
    const raw = Math.floor(Math.random() * 10);
    const id = (raw % STOREROOM.length) + 1;
    dieStore.current?.roll(raw, () => {
      setStoreroomId(id);
      setStep("done");
    });
  }

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
    if (
      combatSkill === null ||
      enduranceMax === null ||
      gold === null ||
      storeroomId === null
    )
      return;
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
        <div className={`stat-card${combatSkill !== null ? " stat-card--done" : ""}`}>
          <span className="stat-label">Destreza</span>
          <DiceRoll ref={dieCs} size="sm" />
          <span className="stat-value" data-testid="stat-combat-skill">
            {combatSkill ?? "—"}
          </span>
          <button
            type="button"
            className="primary die-roll-btn"
            disabled={step !== "cs"}
            onClick={rollCs}
          >
            Tirar
          </button>
        </div>

        <div className={`stat-card${enduranceMax !== null ? " stat-card--done" : ""}`}>
          <span className="stat-label">Resistencia</span>
          <DiceRoll ref={dieEnd} size="sm" />
          <span className="stat-value" data-testid="stat-endurance">
            {enduranceMax ?? "—"}
          </span>
          <button
            type="button"
            className="primary die-roll-btn"
            disabled={step !== "end"}
            onClick={rollEnd}
          >
            Tirar
          </button>
        </div>

        <div className={`stat-card${gold !== null ? " stat-card--done" : ""}`}>
          <span className="stat-label">Oro inicial</span>
          <DiceRoll ref={dieGold} size="sm" />
          <span className="stat-value" data-testid="stat-gold">
            {gold !== null ? gold : "—"}
          </span>
          <button
            type="button"
            className="primary die-roll-btn"
            disabled={step !== "gold"}
            onClick={rollGold}
          >
            Tirar
          </button>
        </div>

        <div className={`stat-card${storeroomItem ? " stat-card--done" : ""}`}>
          <span className="stat-label">Almacén</span>
          <DiceRoll ref={dieStore} size="sm" />
          {storeroomItem ? (
            <div
              className="stat-value--item"
              data-testid="storeroom-item"
              data-store={storeroomId}
            >
              <strong>{storeroomItem.name}</strong>
              <span className="muted small">{storeroomHint(storeroomItem.grant)}</span>
            </div>
          ) : (
            <span className="stat-value">—</span>
          )}
          <button
            type="button"
            className="primary die-roll-btn"
            disabled={step !== "store"}
            onClick={rollStore}
          >
            Tirar
          </button>
        </div>
      </section>

      <p className="muted small">
        Equipo fijo: Hacha, 1 Comida y Mapa de Sommerlund.
      </p>

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
