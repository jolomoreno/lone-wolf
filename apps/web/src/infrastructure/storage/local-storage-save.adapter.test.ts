import { describe, expect, it } from "vitest";
import {
  type KeyValueStorage,
  LocalStorageSaveAdapter,
} from "./local-storage-save.adapter";
import { createGameState } from "../../domain/game/game-state";
import { createCharacter } from "../../domain/character/create-character";
import type { KaiDiscipline } from "../../domain/character/kai-discipline";

/** Almacén en memoria para los tests. */
class MemoryStorage implements KeyValueStorage {
  private readonly map = new Map<string, string>();
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
}

const disciplines: KaiDiscipline[] = [
  "camouflage",
  "hunting",
  "sixthSense",
  "tracking",
  "healing",
];

function newState() {
  return createGameState(
    createCharacter({ combatSkill: 15, enduranceMax: 25, disciplines }),
    1,
  );
}

describe("LocalStorageSaveAdapter", () => {
  it("devuelve null cuando no hay partida guardada", () => {
    const adapter = new LocalStorageSaveAdapter(new MemoryStorage());
    expect(adapter.load()).toBeNull();
  });

  it("guarda y recupera la misma partida", () => {
    const adapter = new LocalStorageSaveAdapter(new MemoryStorage());
    const state = newState();
    adapter.save(state);
    expect(adapter.load()).toEqual(state);
  });

  it("borra la partida guardada", () => {
    const adapter = new LocalStorageSaveAdapter(new MemoryStorage());
    adapter.save(newState());
    adapter.clear();
    expect(adapter.load()).toBeNull();
  });

  it("descarta un guardado de versión incompatible", () => {
    const storage = new MemoryStorage();
    storage.setItem("lone-wolf:save", JSON.stringify({ ...newState(), version: 999 }));
    expect(new LocalStorageSaveAdapter(storage).load()).toBeNull();
  });

  it("descarta un guardado corrupto (JSON inválido)", () => {
    const storage = new MemoryStorage();
    storage.setItem("lone-wolf:save", "{no es json");
    expect(new LocalStorageSaveAdapter(storage).load()).toBeNull();
  });
});
