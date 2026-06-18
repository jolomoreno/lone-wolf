import { KAI_DISCIPLINE_DESCRIPTIONS } from "../../domain/character/kai-discipline-descriptions";
import {
  ALL_KAI_DISCIPLINES,
  KAI_DISCIPLINE_NAMES,
} from "../../domain/character/kai-discipline";
import type { KaiDiscipline } from "../../domain/character/kai-discipline";
import { WEAPON_NAMES } from "../../domain/character/weapon";

interface Props {
  onClose: () => void;
  /** Disciplinas que tiene el personaje actualmente (para resaltarlas). */
  activeDisciplines?: KaiDiscipline[];
  /** Arma de dominio del personaje (solo relevante si tiene weaponskill). */
  weaponskillWeapon?: string | null;
}

export function KaiDisciplinesModal({
  onClose,
  activeDisciplines = [],
  weaponskillWeapon,
}: Props) {
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Disciplinas del Kai"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h2>Disciplinas del Kai</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="rules-intro">
            Los Señores del Kai dominan diez disciplinas ancestrales. Al comenzar
            la aventura, el jugador posee cinco de ellas.
          </p>

          <ul className="kai-disc-list">
            {ALL_KAI_DISCIPLINES.map((disc) => {
              const active = activeDisciplines.includes(disc);
              const weaponLabel =
                disc === "weaponskill" && active && weaponskillWeapon
                  ? ` (${WEAPON_NAMES[weaponskillWeapon as keyof typeof WEAPON_NAMES] ?? weaponskillWeapon})`
                  : "";
              return (
                <li key={disc} className={active ? "kai-disc-item active" : "kai-disc-item"}>
                  <h3>
                    {KAI_DISCIPLINE_NAMES[disc]}
                    {weaponLabel && <span className="muted"> {weaponLabel}</span>}
                    {active && <span className="kai-disc-badge">Tu disciplina</span>}
                  </h3>
                  <p>{KAI_DISCIPLINE_DESCRIPTIONS[disc]}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
