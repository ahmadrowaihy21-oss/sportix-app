import {
  demoServices,
  demoAthlete,
  demoPartner,
  demoReviewer,
} from "./fixtures.ts";
import {
  executeService,
  serviceCommand,
  type Actor,
  type ServiceCommand,
  type ServiceState,
} from "./model.ts";
import { z } from "zod";
export const STORAGE_KEY = "sportix-services-sandbox-v1";
const logSchema = z
  .object({
    schema: z.literal(1),
    createdAt: z.string().datetime(),
    entries: z
      .array(
        z
          .object({
            role: z.enum(["athlete", "partner", "reviewer"]),
            key: z.string(),
            command: serviceCommand,
            at: z.string().datetime(),
          })
          .strict(),
      )
      .max(1000),
  })
  .strict();
export type Journal = z.infer<typeof logSchema>;
export const sandboxActor = (role: Actor["role"]) =>
  role === "athlete"
    ? demoAthlete
    : role === "partner"
      ? demoPartner
      : demoReviewer;
export function newJournal(now = new Date().toISOString()): Journal {
  return { schema: 1, createdAt: now, entries: [] };
}
export function replayJournal(raw: unknown): {
  journal: Journal;
  state: ServiceState;
} {
  const journal = logSchema.parse(raw);
  let state = demoServices(journal.createdAt);
  for (const e of journal.entries)
    state = executeService(state, sandboxActor(e.role), e.key, e.command, e.at);
  return { journal, state };
}
export function appendJournal(
  journal: Journal,
  role: Actor["role"],
  key: string,
  command: ServiceCommand,
  now: string,
) {
  const current = replayJournal(journal);
  const next = executeService(
    current.state,
    sandboxActor(role),
    key,
    command,
    now,
  );
  if (next === current.state) return current;
  const saved = {
    ...journal,
    entries: [...journal.entries, { role, key, command, at: now }],
  };
  return replayJournal(saved);
}
