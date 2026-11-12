import { create } from "zustand";
import { z } from "zod";
import { createSyntheticAthlete, executeAthlete } from "./engine.ts";
import {
  commandSchema,
  type AthleteCommand,
  type AthleteState,
} from "./contracts.ts";
const KEY = "sportix-athlete-journal-v1";
const logSchema = z
  .array(
    z
      .object({
        key: z.string(),
        command: commandSchema,
        at: z.string().datetime(),
      })
      .strict(),
  )
  .max(1000);
type Entry = z.infer<typeof logSchema>[number];
interface AthleteStore {
  data: AthleteState;
  journal: Entry[];
  hydrated: boolean;
  persistenceError: boolean;
  dispatch: (key: string, command: AthleteCommand) => AthleteState;
  hydrate: () => void;
  reset: () => void;
}
// Only synthetic commands/metrics persist. Media blobs, filenames, health and location never do.
export const useAthlete = create<AthleteStore>((set, get) => ({
  data: createSyntheticAthlete(),
  journal: [],
  hydrated: false,
  persistenceError: false,
  hydrate: () => {
    if (get().hydrated || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        set({ hydrated: true });
        return;
      }
      const journal = logSchema.parse(JSON.parse(raw));
      let data = createSyntheticAthlete();
      for (const e of journal)
        data = executeAthlete(
          data,
          data.identity.sportixUserId,
          e.key,
          e.command,
          e.at,
        );
      set({ data, journal, hydrated: true, persistenceError: false });
    } catch {
      set({ hydrated: true, persistenceError: true });
    }
  },
  dispatch: (key, command) => {
    const current = get();
    const at = new Date().toISOString();
    const data = executeAthlete(
      current.data,
      current.data.identity.sportixUserId,
      key,
      command,
      at,
    );
    if (data === current.data) return data;
    const journal = [...current.journal, { key, command, at }];
    // A rejected write is surfaced rather than claiming the activity was saved durably.
    let persistenceError = current.persistenceError;
    if (current.hydrated && typeof window !== "undefined") {
      try {
        logSchema.parse(journal);
        localStorage.setItem(KEY, JSON.stringify(journal));
        persistenceError = false;
      } catch {
        persistenceError = true;
      }
    }
    set({ data, journal, persistenceError });
    return data;
  },
  reset: () => {
    let persistenceError = false;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(KEY);
      } catch {
        persistenceError = true;
      }
    }
    set({ data: createSyntheticAthlete(), journal: [], persistenceError });
  },
}));
