import test from "node:test";
import assert from "node:assert/strict";
import { useAthlete } from "../../src/lib/athlete/store.ts";
import { syncSyntheticViews } from "../../src/lib/athlete/bridge.ts";
import { useSportId } from "../../src/lib/sport-id/store.ts";
import { useSportix } from "../../src/lib/sportix/store.ts";
test("activity journal restores private history and published projection; withdrawal survives another reload", () => {
  const memory = new Map<string, string>();
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const oldStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  Object.defineProperty(globalThis, "window", {
    value: {},
    configurable: true,
  });
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => memory.set(k, v),
      removeItem: (k: string) => memory.delete(k),
    },
    configurable: true,
  });
  try {
    useAthlete.getState().reset();
    useAthlete.setState({ hydrated: false });
    useAthlete.getState().hydrate();
    const dispatch = useAthlete.getState().dispatch;
    dispatch("persist-create", {
      op: "activity.create",
      id: "persist-run",
      kind: "running",
    });
    dispatch("persist-submit", {
      op: "activity.submit",
      id: "persist-run",
      version: 1,
      metrics: { durationSec: 100, distanceKm: 1, steps: 500 },
      evidenceRef: "synthetic-evidence-persist-run",
    });
    dispatch("persist-verify", {
      op: "activity.simulate",
      id: "persist-run",
      version: 2,
      outcome: "pass",
    });
    dispatch("persist-public", {
      op: "consent.set",
      id: "persist-run",
      version: 3,
      audience: "PUBLIC",
      shareMetrics: false,
    });
    const serialized = memory.get("sportix-athlete-journal-v1")!;
    assert.ok(serialized);
    assert.equal(serialized.includes("blob:"), false);
    useAthlete.setState({ hydrated: false, journal: [] });
    useAthlete.getState().hydrate();
    syncSyntheticViews();
    assert.equal(useSportId.getState().integrationRecords.length, 1);
    assert.equal(
      useSportix.getState().posts.filter((p) => p.athleteProjection).length,
      1,
    );
    dispatch("persist-withdraw", {
      op: "consent.set",
      id: "persist-run",
      version: 4,
      audience: "PRIVATE",
      shareMetrics: false,
    });
    useAthlete.setState({ hydrated: false });
    useAthlete.getState().hydrate();
    syncSyntheticViews();
    assert.equal(
      useSportix.getState().posts.filter((p) => p.athleteProjection).length,
      0,
    );
    assert.equal(useAthlete.getState().persistenceError, false);
    memory.set("sportix-athlete-journal-v1", "corrupt");
    useAthlete.setState({ hydrated: false });
    useAthlete.getState().hydrate();
    assert.equal(useAthlete.getState().persistenceError, true);
  } finally {
    useAthlete.getState().reset();
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (oldStorage)
      Object.defineProperty(globalThis, "localStorage", oldStorage);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
