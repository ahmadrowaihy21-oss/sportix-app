import { useCallback, useEffect, useState, useRef } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled } from "@/lib/auth/client";
import {
  serviceView,
  type Actor,
  type ServiceCommand,
  type ServiceView,
} from "./model";
import {
  STORAGE_KEY,
  appendJournal,
  newJournal,
  replayJournal,
  sandboxActor,
} from "./sandbox";
import { getServices, updateServices } from "./api";
export function commandKey() {
  return `cmd-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}
export function useServices(role: Actor["role"]) {
  const sandbox = !authEnabled;
  const session = useCurrentUserState();
  const tenant = import.meta.env.VITE_SPORTIX_PARTNER_TENANT as
    string | undefined;
  const [view, setView] = useState<ServiceView | null>(null);
  const scopeKey = `${sandbox}:${session.user?.id ?? ""}:${tenant ?? ""}:${role}`;
  const currentScope = useRef(scopeKey);
  currentScope.current = scopeKey;
  const [loadedScope, setLoadedScope] = useState("");
  const applyView = (next: ServiceView, scope: string) => {
    if (currentScope.current === scope) {
      setView(next);
      setLoadedScope(scope);
    }
  };
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const reload = useCallback(async () => {
    try {
      setError("");
      if (sandbox) {
        const raw = localStorage.getItem(STORAGE_KEY);
        const result = replayJournal(raw ? JSON.parse(raw) : newJournal());
        if (!raw)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(result.journal));
        applyView(
          serviceView(
            result.state,
            sandboxActor(role),
            new Date().toISOString(),
          ),
          scopeKey,
        );
      } else {
        setView(null); // Never retain another account's previous projection.
        if (session.isPending) return;
        if (!session.user) throw new Error("SIGN_IN_REQUIRED");
        if (!tenant) throw new Error("SERVICES_NOT_CONFIGURED");
        applyView(await getServices({ data: { tenant, role } }), scopeKey);
      }
    } catch (e) {
      setView(null);
      setError(e instanceof Error ? e.message : "LOAD_FAILED");
    }
  }, [sandbox, session.user?.id, session.isPending, tenant, role]);
  useEffect(() => {
    void reload();
  }, [reload]);
  useEffect(() => {
    if (!sandbox) return;
    const refresh = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) void reload();
    };
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [sandbox, reload]);
  const dispatch = async (command: ServiceCommand, key = commandKey()) => {
    setBusy(true);
    setError("");
    try {
      if (sandbox) {
        const write = async () => {
          const raw = localStorage.getItem(STORAGE_KEY);
          const { journal } = replayJournal(
            raw ? JSON.parse(raw) : newJournal(),
          );
          const result = appendJournal(
            journal,
            role,
            key,
            command,
            new Date().toISOString(),
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(result.journal));
          applyView(
            serviceView(
              result.state,
              sandboxActor(role),
              new Date().toISOString(),
            ),
            scopeKey,
          );
        };
        // Shared journal is serialized across tabs when Web Locks is supported.
        if (navigator.locks) await navigator.locks.request(STORAGE_KEY, write);
        else await write();
      } else {
        if (!session.user || !tenant)
          throw new Error("SERVICES_NOT_CONFIGURED");
        applyView(
          await updateServices({ data: { tenant, role, key, command } }),
          scopeKey,
        );
      }
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "REQUEST_FAILED");
      return false;
    } finally {
      setBusy(false);
    }
  };
  const reset = async () => {
    if (!sandbox) return;
    localStorage.removeItem(STORAGE_KEY);
    await reload();
  };
  return {
    view: loadedScope === scopeKey ? view : null,
    error,
    busy,
    sandbox,
    dispatch,
    reload,
    reset,
  };
}
